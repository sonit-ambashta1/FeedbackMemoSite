"""Feedback service: contains business logic for feedback submission and retrieval."""

from sqlmodel import func, select

from src.models.feedback import Feedback
from src.repositories.feedback_repo import FeedbackRepository


class FeedbackService:
    """
    FeedbackService contains all feedback-related business logic.

    Responsibilities:
    - Validate and submit feedback
    - Retrieve feedback by user or category
    - Delete feedback

    Does NOT:
    - Create database sessions
    - Handle HTTP requests
    - Access FastAPI
    """

    def __init__(self, feedback_repo: FeedbackRepository):
        self.feedback_repo = feedback_repo

    def submit_feedback(
        self,
        user_id: int,
        content: str,
        category: str | None = None,
        priority: str | None = None,
    ) -> Feedback:
        """
        Submit feedback for a user.

        Returns the created Feedback object.
        """
        feedback = Feedback(
            user_id=user_id,
            content=content,
            category=category,
            priority=priority,
        )
        return self.feedback_repo.save_feedback(feedback)

    def get_user_feedback(self, user_id: int) -> list[Feedback]:
        """Get all feedback submitted by a user."""
        return self.feedback_repo.get_feedback_by_user(user_id)

    def get_feedback_by_category(self, category: str) -> list[Feedback]:
        """Get all feedback for a specific category."""
        raise NotImplementedError("Use get_feedback_by_category_for_user(user_id, category)")

    def get_feedback_by_category_for_user(self, user_id: int, category: str) -> list[Feedback]:
        """Get all feedback for a specific category for a given user."""
        return self.feedback_repo.get_feedback_by_category_for_user(user_id, category)

    def get_feedback_by_priority(self, priority: str) -> list[Feedback]:
        """Get all feedback for a specific priority level."""
        raise NotImplementedError("Use get_feedback_by_priority_for_user(user_id, priority)")

    def get_feedback_by_priority_for_user(self, user_id: int, priority: str) -> list[Feedback]:
        """Get all feedback for a specific priority level for a given user."""
        return self.feedback_repo.get_feedback_by_priority_for_user(user_id, priority)

    def update_feedback(
        self,
        feedback_id: int,
        user_id: int,
        content: str | None = None,
        category: str | None = None,
        priority: str | None = None,
    ) -> Feedback | None:
        """
        Update feedback by ID (ownership required).
        Returns updated Feedback or None if not found or not authorized.
        """
        feedback = self.feedback_repo.get_feedback_by_id(feedback_id)
        if not feedback or feedback.user_id != user_id:
            return None

        return self.feedback_repo.update_feedback(
            feedback_id,
            content=content,
            category=category,
            priority=priority,
        )

    def delete_feedback(self, feedback_id: int, user_id: int) -> bool:
        """
        Delete feedback by ID (ownership required).
        Returns True if successful, False if not found or not authorized.
        """
        feedback = self.feedback_repo.get_feedback_by_id(feedback_id)
        if not feedback or feedback.user_id != user_id:
            return False

        return self.feedback_repo.delete_feedback(feedback_id)

    def get_category_counts(self) -> list[tuple[str, int]]:
        """Get frequency distribution of feedback categories."""
        statement = (
            select(
                Feedback.category,
                func.count(Feedback.id)
            )
            .where(Feedback.category.is_not(None))
            .group_by(Feedback.category)
        )
        # Delegate to repository and scope by user. Service should not access sessions directly.
        raise NotImplementedError("Use get_category_counts_for_user(user_id)")

    def get_category_counts_for_user(self, user_id: int) -> list[tuple[str, int]]:
        """Get frequency distribution of feedback categories for a user."""
        return self.feedback_repo.get_category_counts(user_id)
    
    def get_priority_counts_for_user(self, user_id: int) -> list[tuple[str, int]]:
        """Get frequency distribution of feedback priorities for a user."""
        return self.feedback_repo.get_priority_counts(user_id)