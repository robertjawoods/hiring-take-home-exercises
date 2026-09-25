# Litta Take Home 

## Running the app 
### Docker
1. `docker compose up`- this brings up Postgres, runs the migrations and seeds the database, then starts the api (`:3000`) and web app (`:5173`)
2. Visit `http://localhost:5173`

### Development 
This is a pnpm workspace (`apps/api`, `apps/web`, `packages/database`), so ensure pnpm is installed, then:
1. `pnpm i` at the project root to install all required dependencies
2. `pnpm --filter database db:generate` to generate the prisma client
3. `pnpm dev` to run the full stack in development mode, or `pnpm --filter api dev` / `pnpm --filter web dev` to run just one side
4. `pnpm test` to run the test suite (54 passing tests, mostly covering the pricing and booking logic)
      1. If port 5432 is already taken locally, set `DB_PORT` in `.env` and docker compose will use that instead


## Breakdown 

The solution consists of a monorepo containing two apps and a shared database package.

### `apps/web`
This is the front end application. It currently redirects from `/` to `/book`; in a real app, there would be a landing page with a CTA instead. The `/book` route is where customers book in and have their rubbish removed. It consists of a grid of items on the left-hand side and a panel on the right containing a form. The customer uses the grid to add products to their basket, with a quantity control on each grid item. Once finished, they fill in the form, have a quote calculated for them, and then have the ability to confirm their order. Once the order is submitted, they are provided with a booking reference.

The `/ops` page is the internal dashboard for managing bookings. It's split into three tables: pending, assigned and completed. Each table is slightly different, highlighting the information relevant at that point in the journey. As each stage is acted upon, the booking moves down the page, intuitively guiding the user.

The ops dashboard is powered by a `query.live` remote function, which polls the data every 10s.

The front end uses SvelteKit as its framework of choice. I like using SvelteKit because I find the runes system very intuitive, and because it's essentially just an HTML file with a script tag.

To make calls to the API, I use remote functions, which always execute on the server. For GET endpoints, these are essentially just wrappers around RPC functions exposed by the API application.

### `apps/api`
The backend is a Node application that uses Hono as its API framework. The API is split into four route files, each separated by domain concept: bookings, catalogue, crews and quotes. The supporting code for these lives in the `/pricing` and `/bookings` folders. The API uses `zod` for validation, wrapped in a helper function that's passed to each endpoint to keep error handling simple.

Every non-2xx response comes back in the same shape, `{ error: { code, message, details? } }`, handled by a single `onError` catch-all rather than try/catch blocks scattered through each route. Domain errors like an unknown catalogue item, an invalid postcode or an out-of-sequence booking transition are thrown as a typed `AppError` and mapped to the right status code and error code in one place.

`/pricing` holds the quote calculation as a pure function: given a basket and a postcode it works out the subtotal, adds the postcode surcharge and returns the total, throwing if it hits an unknown item or an unrecognised postcode. Keeping it pure, with no database access, made it easy to unit test directly.

`/bookings` holds the supporting logic for booking creation and status transitions. Booking references are random six-character codes (e.g. `LT-4F7K2M`), generated from an alphabet with the ambiguous characters (I, L, O, 0, 1) removed so they're easy to read back over the phone. Since the reference is the only unique column, a collision just means retrying the insert, which I cap at 5 attempts. Status transitions (`PENDING` → `ASSIGNED` → `COMPLETED`) are applied as a single conditional update, `WHERE bookingStatus = <expected>`, so if two requests race to move the same booking, exactly one succeeds and the other gets a 409 instead of silently overwriting it.

### `packages/database`
This is a shared package wrapping Prisma, so both apps talk to the database through the same generated client rather than each maintaining their own. It exports a `PrismaClient` instance (`db`) already wired up with the Postgres driver adapter, along with all the generated model types.

The schema itself is small: `Item` and `Crew` are the catalogue and crew tables, `Booking` holds the customer, postcode and pricing details for an order, and `LineItem` links a booking to the items in it. Line items store their own `unitPricePence` and `lineTotalPence` rather than just referencing the catalogue, so a later price change doesn't rewrite the price of a booking that's already been placed.

Migrations live in `prisma/migrations` and are applied with `prisma migrate deploy`, which is what the docker-compose `migrate` step runs. There's also a seed script that reads catalogue and crew fixtures from `/seed` and inserts them, which is what gives you data to work with on a fresh `docker compose up`.


## Anything unfinished / worth flagging
- `/` redirecting straight to `/book` 
- The ops dashboard polling every 10 seconds instead of pushing updates is also a deliberate choice. The brief says polling is fine at this scale, but when lots of orders are coming in, pulling the whole table every 10s is not viable
- There's no pagination or filtering on the dispatch list beyond today's date, this will not work at scale. There's a chance jobs span multiple days if there's not crew capacity to fulfil them. 

## Product judgement writeup

### 1. What you'd build next, and why
With two more days, I'd build crew scheduling and capacity first. Right now `/bookings/:reference/assign` will happily assign a crew that's already fully booked for the day, there's no check against how much work a crew already has. 

After that, I'd add booking confirmation email or SMS. At the moment the only record of a booking is the reference shown on screen once; if the customer closes the tab, they've got nothing. It wouldn't need to be more than a simple transactional email.

Another thing I'd build is the ability to filter by date. I'd also probably change the query to "all of todays jobs, and any that aren't yet completed". This is to make sure all jobs are tracked until completion and can't get lost. 

### 2. One trade-off, and how I'd revisit it at scale
The trade-off I'd point to is how booking references are generated. `generateBookingReference` (`bookings/reference.ts`) draws a random six-character code, and `createBooking` (`bookings/service.ts`) retries the insert up to five times if that code collides with an existing reference, caught via Postgres's unique constraint on `bookingReference`. At current volume, with a keyspace of roughly 30 million codes and a handful of bookings a day, the odds of a collision are negligible, so this is simple and correct.

At scale, I'd use something that us much less likely to collide, like perhaps incorporating part of their email address or using an autoincremented reference.

## Assumptions
- Postcode surcharge: inner London postcode areas (E, EC, N, NW, SE, SW, W, WC) get a £15 surcharge, everywhere else is £5. This is a business rule I invented for the exercise, not something specified in the brief.
- Booking reference format (`LT-XXXXXX`) is my own convention, also not specified in the brief.
- One crew per booking, no multi-crew jobs.
- No cancellation flow, the brief only specifies PENDING → ASSIGNED → COMPLETED.