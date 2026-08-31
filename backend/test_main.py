from fastapi.testclient import TestClient
from main import app,BASE_URL,rate_limit_store
import pytest
import psycopg
import os

client=TestClient(app)

@pytest.fixture(autouse=True)
def reset_test_state():
    #reset rate limiter,delete user, url and click_events tables, and cookies before each test
    rate_limit_store.clear()

    conn=psycopg.connect(
        os.getenv("CONNECTION_STRING")
    )

    with conn.cursor() as cursor:
        cursor.execute("DELETE FROM URLS")
        cursor.execute("DELETE FROM USERS")
        cursor.execute("DELETE FROM CLICK_EVENTS")

        conn.commit()

    client.cookies.clear()
    conn.commit()

def test_home():
    response=client.get("/")

    assert response.status_code==200

    assert response.json()=={
        "message":"Backend is working"
    }

def test_shorten_url():
    #register
    register_response=client.post("/register",json={
        "email":"login@example.com",
        "user_name":"string",
        "password":"password"
    })
    
    assert register_response.status_code==200

    #login
    login_response=client.post("/login",json={
        "email":"login@example.com",
        "password":"password"
    })

    assert login_response.status_code==200

    assert "access_token" in login_response.cookies

    #shorten
    shorten_response=client.post("/shorten",json={
        "url":"https://test-shorten-url.com"
    })

    assert shorten_response.status_code==200

    data=shorten_response.json()

    assert "short_url" in data

    assert data["short_url"].startswith(f"{BASE_URL}/")

def test_shorten_redirect_url():
    #register
    register_response=client.post("/register",json={
        "email":"login@example.com",
        "user_name":"string",
        "password":"password"
    })
    
    assert register_response.status_code==200

    #login
    login_response=client.post("/login",json={
        "email":"login@example.com",
        "password":"password"
    })

    assert login_response.status_code==200

    assert "access_token" in login_response.cookies

    #shorten
    shorten_response=client.post("/shorten",json={
        "url":"https://test-shorten-url.com"
    })

    assert shorten_response.status_code==200

    data=shorten_response.json()

    assert "short_url" in data

    assert data["short_url"].startswith(f"{BASE_URL}/")

    short_url=data["short_url"]

    parts=short_url.split('/')

    code=parts[-1]

    #redirect

    redirect_response=client.get(f"/{code}",follow_redirects=False)

    assert redirect_response.status_code==307

def test_shorten_stats():
    #register
    register_response=client.post("/register",json={
        "email":"login@example.com",
        "user_name":"string",
        "password":"password"
    })
    
    assert register_response.status_code==200

    #login
    login_response=client.post("/login",json={
        "email":"login@example.com",
        "password":"password"
    })

    assert login_response.status_code==200

    assert "access_token" in login_response.cookies

    #shorten
    shorten_response=client.post("/shorten",json={
        "url":"http://test-shorten-stats.com"
    })

    assert shorten_response.status_code==200

    data=shorten_response.json()

    assert "short_url" in data

    assert data["short_url"].startswith(f"{BASE_URL}/")

    short_url=data["short_url"]

    parts=short_url.split('/')

    code=parts[-1]

    #stats
    stats_response=client.get(f"/stats/{code}")

    assert stats_response.status_code==200

    stats_response_data=stats_response.json()

    assert stats_response_data["click_count"]==0
    assert stats_response_data["long_url"]=="http://test-shorten-stats.com/"
    assert "created_at" in stats_response_data
    assert "last_clicked_at" in stats_response_data

def test_shorten_redirect_stats():
    #register
    register_response=client.post("/register",json={
        "email":"login@example.com",
        "user_name":"string",
        "password":"password"
    })
    
    assert register_response.status_code==200

    #login
    login_response=client.post("/login",json={
        "email":"login@example.com",
        "password":"password"
    })

    assert login_response.status_code==200

    assert "access_token" in login_response.cookies

    #shorten
    shorten_response=client.post("/shorten",json={
        "url":"https://test-shorten-redirect-stats.com"
    })

    assert shorten_response.status_code==200

    data=shorten_response.json()

    assert "short_url" in data

    assert data["short_url"].startswith(f"{BASE_URL}/")

    short_url=data["short_url"]

    parts=short_url.split('/')

    code=parts[-1]

    #redirect

    redirect_response=client.get(f"/{code}",follow_redirects=False)

    assert redirect_response.status_code==307

    #stats

    stats_response=client.get(f"/stats/{code}")
    assert stats_response.status_code==200
    stats_response_data=stats_response.json()

    assert stats_response_data["click_count"]==1
    assert stats_response_data["long_url"]=="https://test-shorten-redirect-stats.com/"
    assert "created_at" in stats_response_data
    assert "last_clicked_at" in stats_response_data

def test_rate_limit():
    #register
    register_response=client.post("/register",json={
        "email":"login@example.com",
        "user_name":"string",
        "password":"password"
    })
    
    assert register_response.status_code==200

    #login
    login_response=client.post("/login",json={
        "email":"login@example.com",
        "password":"password"
    })

    assert login_response.status_code==200


    assert "access_token" in login_response.cookies

    #rate limit verify
    for i in range(5):
        response=client.post("/shorten",json={
            "url":"https://test-rate-limit.com"
        })

        assert response.status_code==200

    response=client.post("/shorten",json={
        "url":"https://test-rate-limit.com"
        })

    assert response.status_code==429

def test_register_user():
    register_response=client.post("/register",json={
        "email":"user@example.com",
        "user_name":"string",
        "password":"password"
    })

    assert register_response.status_code==200

def test_login_user():
    register_response=client.post("/register",json={
            "email":"login@example.com",
            "user_name":"string",
            "password":"password"
        })
    
    assert register_response.status_code==200

    login_response=client.post("/login",json={
        "email":"login@example.com",
        "password":"password"
    })

    assert login_response.status_code==200

    assert "access_token" in login_response.cookies

def test_authentication():
    auth_response=client.post("/shorten",json={
        "url":"https://example.com"
    })

    assert auth_response.status_code==401

def test_authorization():
    #Test that 2 different users should not be able to access each other's short urls
    #Register both users
    register_user_A=client.post("/register",json={
        "email":"usera@example.com",
        "user_name":"usera",
        "password":"password"
    })

    assert register_user_A.status_code==200

    register_user_B=client.post("/register",json={
        "email":"userb@example.com",
        "user_name":"userb",
        "password":"password"
    })

    assert register_user_B.status_code==200

    #Login user A
    login_user_A=client.post("/login",json={
        "email":"usera@example.com",
        "password":"password"
    })

    assert login_user_A.status_code==200

    assert "access_token" in login_user_A.cookies

    #create short url through user A account

    shorten_url_user_A=client.post("/shorten",json={
        "url":"http://test-shorten-url-user-A.com,"
    })

    assert shorten_url_user_A.status_code==200

    data_user_A=shorten_url_user_A.json()
    
    assert "short_url" in data_user_A

    assert data_user_A["short_url"].startswith(f"{BASE_URL}/")

    short_url_user_A=data_user_A["short_url"]

    parts=short_url_user_A.split("/")

    code=parts[-1]

    #Try to check stats for short url created by user A when user A logged in

    check_stats=client.get(f"/stats/{code}")

    assert check_stats.status_code==200

    #clear user A session

    client.cookies.clear()

    #Login user b
    login_user_B=client.post("/login",json={
        "email":"userb@example.com",
        "password":"password"
    })

    assert login_user_B.status_code==200

    assert "access_token" in login_user_B.cookies

    #Try to check stats for short url created by user A when user B logged in

    check_stats=client.get(f"/stats/{code}")

    assert check_stats.status_code==404

def test_logout():

    register_user=client.post("/register",json={
        "email":"user@example.com",
        "user_name":"user",
        "password":"password"
    })
    
    assert register_user.status_code==200

    login_user=client.post("/login",json={
        "email":"user@example.com",
        "password":"password"
    })
    
    assert login_user.status_code==200
    
    assert "access_token" in login_user.cookies

    response=client.post("/logout")

    assert response.status_code==200

def test_auth():
    register_user=client.post("/register",json={
        "email":"user@example.com",
        "user_name":"user",
        "password":"password"
    })
    
    assert register_user.status_code==200

    login_user=client.post("/login",json={
        "email":"user@example.com",
        "password":"password"
    })

    assert login_user.status_code==200

    response=client.get("/auth")

    assert response.status_code==200

    response=client.post("/logout")
    
    assert response.status_code==200

    response=client.get("/auth")
    
    assert response.status_code==401

def test_get_all_stats():
    register_user=client.post("/register",json={
        "email":"user@example.com",
        "user_name":"user",
        "password":"password"
    })
    
    assert register_user.status_code==200

    login_user=client.post("/login",json={
        "email":"user@example.com",
        "password":"password"
    })

    assert login_user.status_code==200

    stats_user=client.get("/stats")

    assert stats_user.status_code==404

    shorten_url=client.post("/shorten",json={
        "url":"http://example.com"
    })

    assert shorten_url.status_code==200

    stats_user=client.get("/stats")
    
    assert stats_user.status_code==200

def test_get_past_7_days_click_events():
    register_user=client.post("/register",json={
        "email":"user@example.com",
        "user_name":"user",
        "password":"password"
    })
    
    assert register_user.status_code==200

    login_user=client.post("/login",json={
        "email":"user@example.com",
        "password":"password"
    })

    assert login_user.status_code==200

    click_events_response=client.get("/clicks/daily")

    assert click_events_response.status_code==404

    shorten_url=client.post("/shorten",json={
        "url":"http://example.com"
    })

    assert shorten_url.status_code==200

    shorten_data=shorten_url.json()

    assert "short_url" in shorten_data

    short_url=shorten_data["short_url"]

    parts=short_url.split("/")

    code=parts[-1]

    redirect_response=client.get(f"/{code}",follow_redirects=False)

    assert redirect_response.status_code==307

    click_events_response_after_redirect=client.get("/clicks/daily")

    assert click_events_response_after_redirect.status_code==200

    click_events_data=click_events_response_after_redirect.json()

    assert "click_events" in click_events_data