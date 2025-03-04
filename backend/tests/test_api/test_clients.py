import pytest
from fastapi.testclient import TestClient
from app.database.models import Client

def test_create_client(client, db):
    # Test data
    test_client_data = {
        "name": "Test Company",
        "website_url": "https://testcompany.com"
    }
    
    # Send request
    response = client.post("/api/clients/", json=test_client_data)
    
    # Check response
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == test_client_data["name"]
    assert data["website_url"] == test_client_data["website_url"]
    assert "id" in data
    assert "api_key" in data
    
    # Check database
    db_client = db.query(Client).filter(Client.id == data["id"]).first()
    assert db_client is not None
    assert db_client.name == test_client_data["name"]

def test_get_clients(client, db):
    # Create test clients
    client1 = Client(name="Test Client 1", website_url="https://test1.com")
    client2 = Client(name="Test Client 2", website_url="https://test2.com")
    db.add(client1)
    db.add(client2)
    db.commit()
    
    # Send request
    response = client.get("/api/clients/")
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2
    assert data[0]["name"] == "Test Client 1"
    assert data[1]["name"] == "Test Client 2"
