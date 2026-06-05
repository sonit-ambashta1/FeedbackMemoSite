import pytest

from sqlmodel import Session

from src.models.user import User
from src.models.feedback import Feedback
from src.repositories.user_repo import UserRepository
from src.repositories.feedback_repo import FeedbackRepository


def test_user_repository_save_and_get_by_username(session: Session):
    user_repo = UserRepository(session)

    user = User(username="alice", hashed_password="hashed-secret")
    saved_user = user_repo.save(user)

    assert saved_user.id is not None
    assert saved_user.username == "alice"

    loaded = user_repo.get_by_username("alice")
    assert loaded is not None
    assert loaded.id == saved_user.id
    assert loaded.username == "alice"


def test_user_repository_duplicate_username_raises(session: Session):
    user_repo = UserRepository(session)

    user_repo.save(User(username="bob", hashed_password="s3cret"))

    with pytest.raises(ValueError, match="Username already exists"):
        user_repo.save(User(username="bob", hashed_password="other"))


def test_feedback_repository_save_and_category_query(session: Session):
    user_repo = UserRepository(session)
    feedback_repo = FeedbackRepository(session)

    user = user_repo.save(User(username="carol", hashed_password="pw"))
    feedback = Feedback(
        user_id=user.id,
        content="Needs better sorting",
        category="ui",
        priority="high",
    )
    saved_feedback = feedback_repo.save_feedback(feedback)

    assert saved_feedback.id is not None
    assert saved_feedback.user_id == user.id

    results = feedback_repo.get_feedback_by_category_for_user(user.id, "ui")
    assert len(results) == 1
    assert results[0].content == "Needs better sorting"
    assert results[0].category == "ui"
