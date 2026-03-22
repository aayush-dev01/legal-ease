"""
LegalEase AI – Pydantic Schemas
"""

from pydantic import BaseModel, field_validator
from typing import List, Optional, Any


class AnalyzeRequest(BaseModel):
    idea:     str
    location: str
    scale:    str
    mode:     str
    email:    Optional[str] = None

    @field_validator("idea")
    @classmethod
    def idea_not_empty(cls, v):
        v = v.strip()
        if len(v) < 5:
            raise ValueError("Business idea must be at least 5 characters")
        if len(v) > 2000:
            raise ValueError("Business idea must be under 2000 characters")
        return v

    @field_validator("location")
    @classmethod
    def valid_location(cls, v):
        if len(v.strip()) < 2:
            raise ValueError("Location is required")
        return v.strip()

    @field_validator("email")
    @classmethod
    def valid_email(cls, v):
        if v is None:
            return v
        v = v.strip()
        if not v:
            return None
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Please enter a valid email address")
        return v


class ScoreDetail(BaseModel):
    score: int
    note:  str
    label: str


class AnalyzeResponse(BaseModel):
    report_id:                    str
    business_name:                str
    category:                     str
    summary:                      str
    key_insight:                  str
    feasibility:                  ScoreDetail
    risk:                         ScoreDetail
    compliance_complexity:        ScoreDetail
    licenses:                     List[Any]
    risks:                        List[Any]
    action_plan:                  List[Any]
    non_compliance_consequences:  List[Any]
    cost_estimates:               List[Any]
    risk_breakdown:               List[Any]
    follow_up_questions:          List[str]
    pdf_url:                      Optional[str]
    report_url:                   str
