"""Feedback request and response schemas for API contracts."""

from typing import Optional

from pydantic import BaseModel, Field


# Request Schemas
class FeedbackSubmitRequest(BaseModel):
    """Request body for submitting feedback."""

    content: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1)
    priority: str = Field(..., min_length=1)


class FeedbackUpdateRequest(BaseModel):
    """Request body for updating feedback."""

    content: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None


class FeedbackFilterRequest(BaseModel):
    """Request body for filtering feedback."""

    category: str = Field(..., min_length=1)


class FeedbackFilterByPriorityRequest(BaseModel):
    """Request body for filtering feedback by priority."""

    priority: str = Field(..., min_length=1)


# Response Schemas
class FeedbackResponse(BaseModel):
    """Feedback response schema."""

    id: int
    user_id: int
    content: str
    category: Optional[str] = None
    priority: Optional[str] = None

    class Config:
        from_attributes = True


class CategoryCountResponse(BaseModel):
    """Response schema for category counts."""

    category: str
    count: int


class PriorityCountResponse(BaseModel):
    """Response schema for priority counts."""

    priority: str
    count: int

class CategoryPriorityCountResponse(BaseModel):
    """Response schema for category and priority counts."""

    category: Optional[str] = None
    priority: Optional[str] = None
    count: int

# IGNORE - for future use
class PriorityRequest(BaseModel):
    """Request body for priority prediction."""

    text: str


