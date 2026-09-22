# Van Booking Engine

A man-and-van booking service: `Hono` for routing, `zod` for validation, a pure pricing module with no
database access, and `Prisma` over Postgres for everything that has to persist. The four diagrams below
trace how a basket and a postcode become a priced, tracked job.

Source: `apps/api/src/` (routes, `bookings/`, `pricing/`, `errors.ts`, `schemas.ts`) and
`packages/database/prisma/schema.prisma`.

## 1. Request pipeline

Every request passes through the same five stages. `pricing/*` is drawn apart from the rest — it never
imports `database`, so `computeQuote()` can be unit-tested with zero I/O. Anything thrown anywhere lands
in one place: `errors.ts`.

```mermaid
flowchart LR
    Web["apps/web (SvelteKit)<br/>hc&lt;AppType&gt;()"] -->|HTTP JSON| App["app.ts<br/>Hono instance · cors · logger"]
    App --> Routes["routes/*.ts<br/>catalogue · crews · quotes · bookings<br/>validate() via zod"]
    Routes --> Service["bookings/service.ts<br/>quoteFor · createBooking<br/>listBookings · transitionBooking"]
    Service -->|in-process call| Pricing["pricing/*<br/>pure — no database<br/>computeQuote()"]
    Service --> DB["database package<br/>Prisma Client"]
    DB -->|SQL| PG[(PostgreSQL)]

    Routes -.->|"AppError (404/409/422)"| Errors["errors.ts<br/>onError / notFound"]
    Pricing -.->|"domain error"| Errors
    Errors -.->|"4xx/5xx JSON"| Web

    classDef pure fill:#e2f2f1,stroke:#0e7c7b,color:#1a1d27;
    classDef err fill:#f7e6e4,stroke:#a83a30,color:#1a1d27;
    class Pricing pure;
    class Errors err;
```

> **Why:** keeping `pricing/*` free of database calls means the £/postcode math is tested as plain
> functions (`quote.test.ts`, `surcharge.test.ts`) — no test database, no mocking Prisma.

## 2. Data model

Four tables. `LineItem` is a frozen snapshot — it copies `unitPricePence` off `Item` at booking time, so
a later catalogue price change never rewrites a past invoice.

```mermaid
erDiagram
    ITEM ||--o{ LINE_ITEM : "priced on"
    BOOKING ||--o{ LINE_ITEM : "contains"
    CREW ||--o{ BOOKING : "assigned to"

    ITEM {
        uuid id PK
        string slug UK
        string name
        enum category
        int baseFeePence
    }
    LINE_ITEM {
        uuid id PK
        uuid bookingId FK
        uuid itemId FK
        int quantity
        int unitPricePence "snapshot at booking time"
        int lineTotalPence
    }
    BOOKING {
        uuid id PK
        string bookingReference UK
        enum bookingStatus "default PENDING"
        string postcode
        string customerName
        string customerEmail
        string customerPhone "optional"
        int subtotalPence
        int postcodeSurchargePence
        int quotePence
        uuid assignedCrewId FK "optional"
        datetime createdAt
        datetime assignedAt "optional"
        datetime completedAt "optional"
    }
    CREW {
        uuid id PK
        string slug UK
        string name
        enum vehicle "LUTON | CAGE"
    }
```

## 3. Booking lifecycle

Three states, one direction: `PENDING → ASSIGNED → COMPLETED`. Nothing moves backwards and there's no
cancel — the whole shape lives in one lookup table in `transitions.ts`.

```mermaid
stateDiagram-v2
    [*] --> PENDING
    PENDING --> ASSIGNED : assign\nPOST /:reference/assign
    ASSIGNED --> COMPLETED : complete\nPOST /:reference/complete
    COMPLETED --> [*]
```

`transitionBooking()` never reads the status before writing it — it applies the transition as a single
conditional `UPDATE`, then checks how many rows it touched:

```mermaid
sequenceDiagram
    participant A as Request A (assign)
    participant B as Request B (assign)
    participant DB as bookings row (status)

    A ->> DB: UPDATE ... WHERE reference = X AND status = 'PENDING'<br/>SET status = 'ASSIGNED'
    B ->> DB: UPDATE ... WHERE reference = X AND status = 'PENDING'<br/>SET status = 'ASSIGNED'
    DB -->> A: count = 1
    Note over A: 200 OK — row now ASSIGNED
    DB -->> B: count = 0
    Note over B: 409 INVALID_TRANSITION
```

> **Why:** writing conditionally and checking `count` afterwards means two racing requests can't both
> think they succeeded — no read-then-write gap for a double-assignment to slip through.

## 4. Creating a booking

The client never sends a price — the server always recomputes it from the catalogue. The insert loops
on its own unique reference: a collision just means drawing another six-character code.

```mermaid
sequenceDiagram
    participant Client as Client (apps/web)
    participant Route as Route (bookings.ts)
    participant Service as Service (service.ts)
    participant Pricing as Pricing (pure)
    participant DB as DB (Prisma · Postgres)

    Client ->> Route: POST /bookings { items, postcode, customer }
    Route ->> Service: createBooking({ items, postcode, customer })
    Service ->> DB: item.findMany({ slug in items })
    DB -->> Service: catalogue rows
    Service ->> Pricing: computeQuote(catalogue, items, postcode)
    Pricing -->> Service: Quote { lines, subtotal, surcharge, total }

    loop up to 5x on P2002 (reference collision)
        Service ->> DB: booking.create({ reference, ...quote })
    end

    DB -->> Service: booking row + lineItems + crew
    Service ->> Route: serializeBooking(booking)
    Route -->> Client: 201 Created { reference, status, quote, ... }
```

`computeQuote()` itself is arithmetic plus one lookup: sum the basket, then price the postcode. All
integer pence throughout — no floating point, so nothing to round or drift.

```mermaid
flowchart TD
    Items["basket: items[]<br/>{ itemId, quantity }"] --> Lookup["look up catalogue by slug"]
    Lookup --> Sum["Σ baseFeePence × quantity"]
    Sum --> Subtotal["subtotalPence"]
    Lookup -.->|unknown slug| UnknownErr["UnknownItemError<br/>→ 422 UNKNOWN_ITEM"]

    Postcode["postcode string<br/>e.g. \"SW1A 1AA\""] --> Parse["parsePostcode()<br/>regex parse + normalise"]
    Parse -.->|unparseable| InvalidErr["InvalidPostcodeError<br/>→ 400 VALIDATION_ERROR"]
    Parse --> Decide{"area in inner-London set?<br/>{E EC N NW SE SW W WC}"}
    Decide -->|yes| London["£15.00 surcharge"]
    Decide -->|no| Standard["£5.00 surcharge"]
    London --> Surcharge["postcodeSurchargePence"]
    Standard --> Surcharge

    Subtotal --> Total["quotePence =<br/>subtotalPence + postcodeSurchargePence"]
    Surcharge --> Total

    classDef accent fill:#e2f2f1,stroke:#0e7c7b,color:#1a1d27;
    classDef err fill:#f7e6e4,stroke:#a83a30,color:#1a1d27;
    class Subtotal,Total accent;
    class UnknownErr,InvalidErr err;
```
