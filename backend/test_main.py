from fastapi.testclient import TestClient
from main import app,BASE_URL,rate_limit_store, redis_client
import pytest
import psycopg
import os
from datetime import datetime, timezone,timedelta
from uuid import uuid4

@pytest.fixture(scope="session")
def client():
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture(autouse=True)
def reset_test_state(client):
    #reset rate limiter,delete user, url and click_events tables, and cookies before each test
    rate_limit_store.clear()
    client.cookies.clear()

    conn=psycopg.connect(
        os.getenv("CONNECTION_STRING")
    )
    try:

        with conn.cursor() as cursor:
            cursor.execute("TRUNCATE TABLE URLS, USERS, CLICK_EVENTS," \
            " CLICK_EVENTS_AGGREGATE RESTART IDENTITY")

            conn.commit()

    finally:
        conn.close()

def aggregate_click_events():
    conn=psycopg.connect(
        os.getenv("CONNECTION_STRING")
    )
    try:
        with conn.cursor() as cursor:
            cursor.execute("INSERT INTO click_events_aggregate " \
            "(click_date, click_count,url_id) " \
            "SELECT DATE(click_time), COUNT(*) as click_count,url_id " \
            "FROM click_events " \
            "WHERE click_time<CURRENT_DATE - INTERVAL '7 days' " \
            "GROUP BY url_id, DATE(click_time) " \
            "ON CONFLICT (click_date,url_id) DO NOTHING")

            cursor.execute("DELETE FROM click_events " \
            "WHERE click_time<CURRENT_DATE- INTERVAL '7 days'")

            conn.commit()
    
    finally:
        conn.close()

def add_click_event(clicked_at,event_key,url_id):
    conn=psycopg.connect(
        os.getenv("CONNECTION_STRING")
    )
    try:
        with conn.cursor() as cursor:
            cursor.execute("INSERT INTO click_events " \
            "(click_time, event_key,url_id) " \
            "VALUES(%s,%s,%s) " \
            "ON CONFLICT(event_key) DO NOTHING " \
            "RETURNING click_id",
            (clicked_at,event_key,url_id))

            conn.commit()
    finally:
        conn.close()

def check_click_events(url_id):
    conn=psycopg.connect(
        os.getenv("CONNECTION_STRING")
    )
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM click_events "
            "WHERE url_id=%s "
            "AND click_time<CURRENT_DATE-INTERVAL '7 days'",
            (url_id,))

            rows=cursor.fetchall()

            if not rows:
                return True
            else:
                return False
            
    finally:
        conn.close()

def check_click_events_aggregate(url_id,count):
    conn=psycopg.connect(
        os.getenv("CONNECTION_STRING")
    )
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT click_count FROM click_events_aggregate "
            "WHERE url_id=%s ",
            (url_id,))

            row=cursor.fetchone()

            if row is None or row[0]!=count:
                return False
            else:
                return True
    finally:
        conn.close()

def test_home(client):
    response=client.get("/")

    assert response.status_code==200

    assert response.json()=={
        "message":"Backend is working"
    }

def test_shorten_url(client):
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

def test_shorten_redirect_url(client):
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

def test_shorten_stats(client):
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

def test_rate_limit(client):
    #test_get_past_7_days_click_events
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

def test_register_user(client):
    register_response=client.post("/register",json={
        "email":"user@example.com",
        "user_name":"string",
        "password":"password"
    })

    assert register_response.status_code==200

def test_login_user(client):
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

def test_authentication(client):
    auth_response=client.post("/shorten",json={
        "url":"https://example.com"
    })

    assert auth_response.status_code==401

def test_authorization(client):
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

def test_logout(client):

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

def test_auth(client):
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

def test_get_all_stats(client):
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

def test_redis_cache():
    redis_client.set("url:testcode","https://example.com")
    cached_long_url=redis_client.get("url:testcode")

    assert cached_long_url=="https://example.com"

    redis_client.delete("url:testcode")

def test_rate_limit_per_api(client):
    register_user=client.post("/register",json={
        "email":"user@example.com",
        "user_name":"user",
        "password":"password"
    })
    
    assert register_user.status_code==200

    for i in range(4):
        register_again=client.post("/register",json={
            "email":"user@example.com",
            "user_name":"user",
            "password":"password"
        })

        assert register_again.status_code==409

    register_again=client.post("/register",json={
        "email":"user@example.com",
        "user_name":"user",
        "password":"password"
    })

    assert register_again.status_code==429

    login_user=client.post("/login",json={
        "email":"user@example.com",
        "password":"password"
    })

    assert login_user.status_code==200

def test_click_events_aggregate(client):
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

    #shorten
    shorten_response=client.post("/shorten",json={
        "url":"https://test-shorten-url.com"
    })

    assert shorten_response.status_code==200

    url_id=1

    #add click event manually
    for i in range(5):
        add_click_event(datetime.now(timezone.utc)-timedelta(days=8),str(uuid4()),url_id)

    aggregate_click_events()

    assert check_click_events(url_id)==True

    assert check_click_events_aggregate(url_id,5)==True