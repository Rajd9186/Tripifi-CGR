"""Destination search + deterministic recommendation scoring.

The LLM may explain a recommendation, but this engine calculates it.
Weights are configurable; scoring inputs are structured data only.
"""

from app.data.destinations import DESTINATIONS

# Configurable weights (sum = 1.0).
WEIGHTS = {
    "budget_fit": 0.30,
    "duration_fit": 0.20,
    "style_fit": 0.25,
    "season_fit": 0.15,
    "popularity": 0.10,
}

POPULARITY = {"goa": 0.95, "kerala": 0.9, "rajasthan": 0.9, "kashmir": 0.85, "sikkim": 0.8,
              "ladakh": 0.75, "darjeeling": 0.7, "meghalaya": 0.65, "andaman": 0.6}


def _budget_fit(dest: dict, budget: int | None) -> float:
    if budget is None:
        return 0.5
    if dest["budget_min"] <= budget <= dest["budget_max"]:
        return 1.0
    if budget < dest["budget_min"]:
        return max(0.0, 1.0 - (dest["budget_min"] - budget) / dest["budget_min"])
    return max(0.0, 1.0 - (budget - dest["budget_max"]) / dest["budget_max"] / 2)


def _duration_fit(dest: dict, days: int | None) -> float:
    if days is None:
        return 0.5
    if dest["days_min"] <= days <= dest["days_max"]:
        return 1.0
    gap = min(abs(days - dest["days_min"]), abs(days - dest["days_max"]))
    return max(0.0, 1.0 - gap / 5)


def _style_fit(dest: dict, styles: list[str]) -> float:
    if not styles:
        return 0.5
    want = {s.lower() for s in styles}
    have = {s.lower() for s in dest["styles"] + dest["themes"]}
    return len(want & have) / max(1, len(want))


def _season_fit(dest: dict, season: str | None) -> float:
    if not season:
        return 0.5
    return 1.0 if season.lower() in dest["seasons"] else 0.2


def score_destination(dest: dict, criteria: dict, weights: dict | None = None) -> float:
    w = weights or WEIGHTS
    score = (
        w["budget_fit"] * _budget_fit(dest, criteria.get("budget"))
        + w["duration_fit"] * _duration_fit(dest, criteria.get("days"))
        + w["style_fit"] * _style_fit(dest, criteria.get("styles", []))
        + w["season_fit"] * _season_fit(dest, criteria.get("season"))
        + w["popularity"] * POPULARITY.get(dest["slug"], 0.5)
    )
    return round(score, 3)


def search_destinations(criteria: dict) -> list[dict]:
    """criteria: query?, themes?, styles?, budget?, days?, season?, region?, limit?"""
    query = (criteria.get("query") or "").lower()
    themes = [t.lower() for t in (criteria.get("themes") or [])]
    styles = [s.lower() for s in (criteria.get("styles") or [])]
    limit = int(criteria.get("limit", 6) or 6)

    pool = list(DESTINATIONS)
    if query:
        pool = [d for d in pool if query in d["name"].lower() or query in d["state"].lower()
                or query in d["region"].lower() or any(query in t for t in d["themes"] + d["styles"])]
    if themes:
        pool = [d for d in pool if any(t in [x.lower() for x in d["themes"]] for t in themes)]
    if criteria.get("region"):
        pool = [d for d in pool if d["region"].lower() == criteria["region"].lower()]

    scored = [
        {**d, "score": score_destination(d, {**criteria, "styles": styles}), "source": "tripifi-catalog", "status": "DEMO"}
        for d in pool
    ]
    scored.sort(key=lambda d: d["score"], reverse=True)
    return scored[: max(1, limit)]
