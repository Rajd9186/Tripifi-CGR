"""RecommendationService. Deterministic scoring over structured results.

Weights configurable per call. The LLM explains; this engine decides.
"""

DEFAULT_WEIGHTS = {"budgetFit": 0.3, "preferenceFit": 0.25, "rating": 0.2, "convenience": 0.15, "duration": 0.1}


def score_offer(offer: dict, prefs: dict, weights: dict | None = None) -> float:
    w = {**DEFAULT_WEIGHTS, **(weights or {})}
    budget = prefs.get("budget")
    price = offer.get("total_price", offer.get("fare", offer.get("price", 0))) or 0
    budget_fit = 1.0
    if budget:
        budget_fit = 1.0 if price <= budget else max(0.0, 1.0 - (price - budget) / budget)
    rating = min(1.0, (offer.get("rating", 4.0) or 4.0) / 5)
    convenience = 1.0 if offer.get("refundable") or "free" in str(offer.get("cancellation_policy", "")).lower() else 0.5
    duration = offer.get("duration_minutes", 0) or 0
    duration_fit = 1.0 if duration <= 0 else max(0.0, 1.0 - duration / 1500)
    pref_fit = 0.5
    return round(
        w["budgetFit"] * budget_fit + w["preferenceFit"] * pref_fit
        + w["rating"] * rating + w["convenience"] * convenience + w["duration"] * duration_fit, 3,
    )


def recommend(offers: list[dict], prefs: dict, weights: dict | None = None, limit: int = 3) -> list[dict]:
    ranked = [{**o, "recommendation_score": score_offer(o, prefs, weights)} for o in offers]
    ranked.sort(key=lambda o: o["recommendation_score"], reverse=True)
    return ranked[: max(1, limit)]
