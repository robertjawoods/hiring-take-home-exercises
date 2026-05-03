# Seed data

These files are provided so you don't have to invent fixtures. Use them however you need. Load at boot, import directly, seed a database, etc.

## `catalogue.json`

Items the customer can pick from on the booking flow. Each item has:

- `id`
- `name` - display name
- `category`
- `baseFee` - GBP as a decimal

## `crews.json`

The hardcoded list of crews available for assignment in the dispatch view.

## Postcode surcharge

A simple area-based lookup is fine (e.g. `E1`, `E2`, `SE1` -> one rate; everything else -> another). Just keep the function isolated and tested.
