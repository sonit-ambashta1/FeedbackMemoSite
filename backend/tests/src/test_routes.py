from fastapi.testclient import TestClient


def test_health_endpoint(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_register_and_login_creates_user(client: TestClient):
    username = "george"
    password = "password123"

    register_response = client.post(
        "/auth/register",
        json={"username": username, "password": password},
    )
    assert register_response.status_code == 201
    assert register_response.json()["username"] == username

    login_response = client.post(
        "/auth/login",
        json={"username": username, "password": password},
    )
    assert login_response.status_code == 200
    assert "access_token" in client.cookies


def test_feedback_submit_requires_auth_and_succeeds(client: TestClient):
    username = "hannah"
    password = "pass1234"

    client.post(
        "/auth/register",
        json={"username": username, "password": password},
    )
    login_response = client.post(
        "/auth/login",
        json={"username": username, "password": password},
    )
    assert login_response.status_code == 200

    submit_response = client.post(
        "/feedback/submit",
        json={
            "content": "This app needs dark mode",
            "category": "UI",
            "priority": "medium",
        },
    )
    assert submit_response.status_code == 201
    assert submit_response.json()["content"] == "This app needs dark mode"
    assert submit_response.json()["category"] == "UI"
    assert submit_response.json()["priority"] == "medium"
