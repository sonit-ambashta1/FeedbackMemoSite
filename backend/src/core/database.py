"""Database engine and session management with PostgreSQL support."""

import os

from sqlmodel import Session, SQLModel, create_engine
from dotenv import load_dotenv

load_dotenv()
# Choose the database connection based on environment.
# In development, use local PostgreSQL by default unless DATABASE_URL is explicitly set.
# In production, require DATABASE_URL to be configured.
ENV = os.getenv("ENV", "dev")
if ENV == "dev":
    if os.getenv("DATABASE_URL"):
        DATABASE_URL = os.getenv("DATABASE_URL")
    elif os.getenv("POSTGRES_USER") and os.getenv("POSTGRES_PASSWORD"):
        DATABASE_URL = (
            f"postgresql://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@localhost:5432/feedbackdb"
        )
    else:
        DATABASE_URL = "sqlite:///./dev.db"
else:
    DATABASE_URL = os.getenv("DATABASE_URL")  # Must be set via environment variable in production
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL environment variable must be set in production.")


# Engine setup for PostgreSQL
# Using psycopg2-binary as the driver (installed in requirements.txt)
engine = create_engine(
    DATABASE_URL,
    echo=False,
    # Connection pool settings optimized for development
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,  # Verify connections before using them
)


def create_db_and_tables():
    """Create all tables in PostgreSQL.

    This function creates all SQLModel tables if they don't already exist.
    Safe to call multiple times (idempotent).
    """
    SQLModel.metadata.create_all(engine)


def get_session():
    """
    Dependency injection provider for database sessions.
    Yields a session and ensures cleanup.
    """
    with Session(engine) as session:
        yield session