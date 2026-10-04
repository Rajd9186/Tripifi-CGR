"""Backend destination catalog (mirrors frontend src/data/destinations.ts themes).
Kept minimal for search/scoring — rich editorial content stays frontend-owned.
"""

DESTINATIONS = [
    {"slug": "sikkim", "name": "Sikkim", "state": "Sikkim", "region": "Northeast",
     "themes": ["mountains", "adventure", "culture", "romantic"], "budget_min": 32000, "budget_max": 60000,
     "days_min": 5, "days_max": 7, "seasons": ["spring", "autumn", "winter"], "styles": ["mountains", "culture", "adventure"]},
    {"slug": "kashmir", "name": "Kashmir", "state": "Jammu & Kashmir", "region": "North",
     "themes": ["mountains", "romantic", "lakes", "nature"], "budget_min": 35000, "budget_max": 60000,
     "days_min": 5, "days_max": 7, "seasons": ["spring", "summer", "autumn"], "styles": ["mountains", "romantic", "nature"]},
    {"slug": "ladakh", "name": "Ladakh", "state": "Ladakh", "region": "North",
     "themes": ["mountains", "adventure"], "budget_min": 40000, "budget_max": 65000,
     "days_min": 6, "days_max": 8, "seasons": ["summer"], "styles": ["mountains", "adventure"]},
    {"slug": "darjeeling", "name": "Darjeeling", "state": "West Bengal", "region": "East",
     "themes": ["mountains", "culture", "tea"], "budget_min": 18000, "budget_max": 35000,
     "days_min": 3, "days_max": 5, "seasons": ["spring", "autumn", "winter"], "styles": ["mountains", "culture"]},
    {"slug": "meghalaya", "name": "Meghalaya", "state": "Meghalaya", "region": "Northeast",
     "themes": ["mountains", "nature", "adventure", "waterfalls"], "budget_min": 22000, "budget_max": 40000,
     "days_min": 4, "days_max": 6, "seasons": ["autumn", "winter", "spring"], "styles": ["nature", "adventure"]},
    {"slug": "kerala", "name": "Kerala", "state": "Kerala", "region": "South",
     "themes": ["backwaters", "beach", "romantic", "wellness", "nature"], "budget_min": 30000, "budget_max": 55000,
     "days_min": 5, "days_max": 8, "seasons": ["winter", "spring"], "styles": ["romantic", "wellness", "nature", "beaches"]},
    {"slug": "goa", "name": "Goa", "state": "Goa", "region": "West",
     "themes": ["beach", "romantic", "nightlife"], "budget_min": 20000, "budget_max": 40000,
     "days_min": 3, "days_max": 5, "seasons": ["winter"], "styles": ["beaches", "romantic"]},
    {"slug": "rajasthan", "name": "Rajasthan", "state": "Rajasthan", "region": "West",
     "themes": ["heritage", "culture", "romantic", "desert"], "budget_min": 35000, "budget_max": 60000,
     "days_min": 6, "days_max": 8, "seasons": ["winter"], "styles": ["culture", "heritage", "romantic"]},
    {"slug": "andaman", "name": "Andaman", "state": "Andaman & Nicobar", "region": "Islands",
     "themes": ["beach", "romantic", "adventure", "diving"], "budget_min": 40000, "budget_max": 65000,
     "days_min": 5, "days_max": 7, "seasons": ["winter", "spring"], "styles": ["beaches", "romantic", "adventure"]},
]
