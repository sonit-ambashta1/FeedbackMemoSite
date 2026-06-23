"""Feedback summarization request and response schemas for API contracts."""

from pydantic import BaseModel, Field
from typing import Dict

class SummarizerRequest(BaseModel):
    """ """
    feedback_count: int
    category_distribution: dict[str, int]
    priority_distribution: dict[str, int]
    feedback_samples = list[str]
