Thank you for taking the time to apply to work at Litta. Please find below the brief for our Take Home exercise. We respect your time so please don't feel you have to spend more than **3–4 hours** on this. If you find yourself going past that, **stop and submit what you have**. We care more about how you make trade-offs than about feature completeness.

This is a **product engineer role**, so we'll mostly look at how you build and reason about the system. We also care that the result feels considered. A working backend with a UI that breaks on the first edge case won't pass.

---

## The brief

Build a small **booking & dispatch web app** with two surfaces.

### 1) Customer-facing quote & booking flow

A page where a customer can:

- Pick items from a catalogue (we've provided a seed list in [`seed/catalogue.json`](seed/catalogue.json): sofa, mattress, fridge, bin bag, etc., each with a `baseFee`)
- Adjust quantities
- Enter a UK postcode
- See a **live quote** that updates as they change the basket
- Confirm their basic details and book

The quote must be computed on the **backend** (don't put pricing logic in the browser). The pricing rule is:

```
quote = sum(item.baseFee * quantity) + postcodeSurcharge(postcode)
```

`postcodeSurcharge` is a small function. You decide the rule, but it must vary by postcode area (e.g. London `E1` postcodes return one rate, everything else another).

When the customer confirms, persist a `Booking` (status `PENDING`) and show them a confirmation.

### 2) Internal dispatch view

A second route/page showing **all bookings for today**. Each row shows: booking reference, postcode, item summary, quote, status, assigned crew (if any).

From this view, an ops user can:

- **Assign a crew** to a `PENDING` booking (pick from the list in [`seed/crews.json`](seed/crews.json)), moving it to `ASSIGNED`
- **Mark an `ASSIGNED` booking as `COMPLETED`**

No auth, maps or payment integration is required.

---

## Stack & constraints

You **must** use:

- **TypeScript**
- **Docker**. `docker compose up` from the repo root should bring up the whole thing (api + frontend + db if you use one). Document any other commands needed.

You **may** use:

- **Any JS/TS runtime**: Node, Bun, Deno, whatever you're most comfortable with. We use a mix internally including Bun, so don't feel pinned to Node.
- **Any package manager**: pnpm, bun, npm, yarn. Pick what suits.
- **Any framework** on the backend (Express, Fastify, Hono, Elysia, NestJS, or none) and the frontend (React, Vue, plain, up to you).
- **Any datastore**: SQLite, Postgres, in-memory. If in-memory, mention what you'd change for production.
- **AI assistance** (Codex, Claude Code etc, let us know if you use something interesting!).
  - Just remember we still need the candidate to understand and be able to reason about the code they're writing.

The only thing we're firm on is TypeScript and `docker compose` working out of the box. Use whatever else gets you to a polished result fastest.

---

## What we're looking for

The bulk of what we'll grade on is engineering:

- **It runs.** `docker compose up` (plus whatever else you document) gets us a working app on first try.
- **The pricing logic is correct, isolated, and tested.** Even one or two unit tests on the pricing function tells us a lot.
- **The API has a sensible shape.** Clear endpoints, validated input, errors that aren't just 500s.
- **State transitions make sense.** A booking can't go from `COMPLETED` back to `PENDING`. A crew can't be assigned to a completed job.
- **You knew when to stop.** Less is more. We'd rather see a smaller feature set that has been well polished.

On the product side, we care about design. We don't have designers, so you'll need at least an eye for good UI. We're not expecting perfection, but the result should look and feel considered. We use Tailwind and CSS variables internally; you're welcome to use either, a component library, or roll your own. Sensible layout and hierarchy, loading and empty states, error handling that isn't `alert()`. If you spot a small unprompted improvement and have time, add it and call it out.

### Things we are **not** grading on

- Authentication / authorisation
- Real-time updates (polling is fine; websockets are overkill)
- Test coverage percentage. A few meaningful tests beat 100% of trivial ones.
- Whether you used the "right" framework

---

## Product judgement writeup

In [`SUBMISSION.md`](SUBMISSION.md) (template provided), a couple of sentences each on:

1. **What you'd build next, and why.** With another two days, what's highest-value? What would you push back on if a PM asked for it?
2. **One trade-off you made and how you'd revisit it at scale.** What would change at 100 bookings/day vs 10,000?

---

## What to submit

A **private GitHub repo** (invite `@litta-hiring`) containing:

- The code
- An updated `README.md` (or `SUBMISSION.md`) with:
  - How to run it (the commands you actually used, in order, including the runtime/package manager you chose)
  - Anything you didn't finish or want to comment on
  - The product judgement writeup described above
  - Any assumptions you made about the brief

---

## Questions

If anything in this brief is unclear, please do not hesitate to **email the hiring manager and ask**. We'll happily clarify and asking the right question is itself a positive signal. Good luck!
