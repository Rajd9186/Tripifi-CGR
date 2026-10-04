# Tripifi AI Tools

Every tool: typed input → typed output, validated, registered in `app/ai/tools/registry.py`. The LLM gets no SQL, filesystem, shell, or arbitrary HTTP — only these.

| Tool | Safety | Reads / writes |
|---|---|---|
| `search_destinations` | READ_ONLY | Destination catalog |
| `get_destination_details` | READ_ONLY | Destination facts |
| `search_flights` / `search_trains` / `search_hotels` / `search_cabs` | READ_ONLY | Demo providers (not bookable) |
| `get_activity_options` | READ_ONLY | Activity catalog |
| `create_trip` / `get_trip` / `update_trip` | SAFE_WRITE / READ_ONLY | Working trip state |
| `add_trip_item` | SAFE_WRITE | Trip collections |
| `remove_trip_item` | CONFIRMATION_REQUIRED | Trip collections |
| `move_trip_item` | SAFE_WRITE | Itinerary placement |
| `create_itinerary` | SAFE_WRITE | Validated day ordering |
| `calculate_trip_budget` / `optimize_trip_budget` | READ_ONLY | Deterministic math |
| `add_to_wishlist` / `remove_from_wishlist` | SAFE_WRITE | Wishlist |

Unknown tools raise `ValueError` and are rejected by the validator. UI actions that need confirmation go through `POST /api/v1/ai/action/confirm|reject`.
