from fastapi.testclient import TestClient
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_root():
    response = client.get("/")
    assert response.status_code == 200


def test_search_empty_query():
    response = client.get("/api/search?query=a")
    assert response.status_code == 400


def test_search_valid():
    response = client.get("/api/search?query=paracetamol")
    assert response.status_code == 200
    data = response.json()
    assert "results" in data


def test_generic_alternative():
    response = client.get("/api/ml/generic-alternative?medicine=crocin")
    assert response.status_code == 200
    data = response.json()
    assert "generic_name" in data


def test_stockout_risk():
    response = client.get("/api/ml/stockout-risk?medicine=paracetamol&platform=PharmEasy")
    assert response.status_code == 200
    data = response.json()
    assert "risk_level" in data