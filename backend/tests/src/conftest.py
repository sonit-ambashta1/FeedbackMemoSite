import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi.testclient import TestClient
from pytest import fixture
from sqlmodel import SQLModel, Session, delete

ROOT_DIR = Path(__file__).resolve().parents[2]
TEST_SRC_DIR = Path(__file__).resolve().parent

# Load shared environment values first.
for dotenv_path in [
    ROOT_DIR / ".env",
    ROOT_DIR / ".env.test",
    TEST_SRC_DIR / ".env",
]:
    if dotenv_path.exists():
        load_dotenv(dotenv_path=dotenv_path, override=True)

# Use a dedicated test environment so app startup uses the test DB.
os.environ.setdefault("ENV", "test")
os.environ.setdefault("SECRET_KEY", "test-secret-key")
os.environ.setdefault("ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "60")

from tests.src.create_test_db import DATABASE_URL, engine as test_engine
os.environ.setdefault("DATABASE_URL", DATABASE_URL)

from src.app import app
from src.core.database import get_session
from src.models.feedback import Feedback
from src.models.user import User

# Create the test schema once for the session.
SQLModel.metadata.create_all(test_engine)


def get_test_session():
    with Session(test_engine) as session:
        yield session


app.dependency_overrides[get_session] = get_test_session


def pytest_configure(config):
    config.addinivalue_line("markers", "slow: mark test as slow")


@fixture(scope="session")
def client():
    with TestClient(app) as client:
        yield client


@fixture
def session():
    with Session(test_engine) as session:
        yield session


@fixture(autouse=True)
def clean_db():
    yield
    with Session(test_engine) as session:
        session.exec(delete(Feedback))
        session.exec(delete(User))
        session.commit()
