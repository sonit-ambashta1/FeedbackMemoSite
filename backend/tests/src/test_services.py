import pytest

from src.models.user import User
from src.repositories.user_repo import UserRepository
from src.repositories.feedback_repo import FeedbackRepository
from src.services.auth_service import AuthService
from src.services.feedback_service import FeedbackService


def test_auth_service_register_user(session):
    user_repo = UserRepository(session)
    auth_service = AuthService(user_repo)

    user = auth_service.register_user(username="dave", password="supersecret")

    assert user.id is not None
    assert user.username == "dave"
    assert user.hashed_password != "supersecret"


def test_auth_service_duplicate_username_raises(session):
    user_repo = UserRepository(session)
    auth_service = AuthService(user_repo)

    auth_service.register_user(username="emma", password="alpha")

    with pytest.raises(ValueError, match="Username already exists"):
        auth_service.register_user(username="emma", password="beta")


def test_feedback_service_submit_feedback(session):
    user_repo = UserRepository(session)
    auth_service = AuthService(user_repo)
    user = auth_service.register_user(username="frank", password="passw0rd")

    feedback_repo = FeedbackRepository(session)
    feedback_service = FeedbackService(feedback_repo)

    feedback = feedback_service.submit_feedback(
        user_id=user.id,
        content="Great app",
        category="feature",
        priority="low",
    )

    assert feedback.id is not None
    assert feedback.user_id == user.id
    assert feedback.category == "feature"
    assert feedback.priority == "low"

    stored = feedback_repo.get_feedback_by_category_for_user(user.id, "feature")
    assert len(stored) == 1
    assert stored[0].content == "Great app"
