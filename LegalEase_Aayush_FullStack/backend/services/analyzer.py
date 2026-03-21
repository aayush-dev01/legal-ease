"""
Normalize AI enrichment payloads so API responses never get None or wrong types for list fields.
"""

from typing import Any, Dict, Optional


def normalize_ai_enrichment(ai_data: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    d = dict(ai_data or {})
    for k in ("risks", "action_plan", "non_compliance_consequences", "cost_estimates"):
        if not isinstance(d.get(k), list):
            d[k] = []
    fq = d.get("follow_up_questions")
    if not isinstance(fq, list):
        d["follow_up_questions"] = []
    else:
        d["follow_up_questions"] = [str(x) for x in fq if x is not None]
    for k in ("business_name", "summary", "key_insight"):
        if d.get(k) is None:
            d[k] = ""
        else:
            d[k] = str(d[k])
    return d
