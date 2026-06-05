import os
from pathlib import Path

from dotenv import load_dotenv
from sqlmodel import create_engine

ROOT_DIR = Path(__file__).resolve().parents[3]
for dotenv_path in [
    ROOT_DIR / ".env",
    ROOT_DIR / ".env.test",
    Path(__file__).resolve().parent / ".env",
]:
    if dotenv_path.exists():
        load_dotenv(dotenv_path=dotenv_path, override=True)

DATABASE_URL = os.getenv("TEST_DATABASE_URL")
if not DATABASE_URL:
    test_user = os.getenv("TEST_POSTGRES_USER")
    test_password = os.getenv("TEST_POSTGRES_PASSWORD")
    test_host = os.getenv("TEST_DATABASE_HOST", "localhost")
    test_port = os.getenv("TEST_DATABASE_PORT", "5432")
    test_name = os.getenv("TEST_DATABASE_NAME", "feedback_test")
    if test_user and test_password:
        DATABASE_URL = (
            f"postgresql://{test_user}:{test_password}@{test_host}:{test_port}/{test_name}"
        )
    else:
        DATABASE_URL = f"postgresql://{test_host}:{test_port}/{test_name}"

engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
)