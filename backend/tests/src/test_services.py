import pytest

from src.services.summarizer_service import SummarizerService
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
    
def test_summarizer_service_sample(session):
    user_repo = UserRepository(session)
    auth_service = AuthService(user_repo)

    user = auth_service.register_user(
        username="sample_user",
        password="password123"
    )

    feedback_repo = FeedbackRepository(session)
    feedback_service = FeedbackService(feedback_repo)

    entries = [
        ("Navigation is confusing", "ui", "medium"),
        ("Dark mode looks inconsistent", "ui", "low"),
        ("Search takes too long", "performance", "high"),
        ("Requirements changed unexpectedly", "communication", "high"),
        ("Project updates were infrequent", "communication", "medium"),
        ("Documentation was helpful", "positive", "low"),
    ]

    for content, category, priority in entries:
        feedback_service.submit_feedback(
            user_id=user.id,
            content=content,
            category=category,
            priority=priority,
        )

    summarizer_service = SummarizerService(feedback_repo)

    samples = summarizer_service.choose_to_sample(
        user_id=user.id,
        scaling_factor=1.0,
        min_entries=10
    )

    assert isinstance(samples, list)
    assert len(samples) > 0

    original_contents = {entry[0] for entry in entries}

    for sample in samples:
        assert sample.content in original_contents
    