# Background worker for executing analytics updates after a URL Redirect
from contextlib import asynccontextmanager
from fastapi import FastAPI
import asyncio
import sys

from arq.connections import RedisSettings
from arq.worker import Worker, create_worker
import os
from psycopg_pool import AsyncConnectionPool
from dotenv import load_dotenv

load_dotenv()

REDIS_URL=os.getenv("REDIS_URL")

if sys.platform=="win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

@asynccontextmanager
async def lifespan(app: FastAPI):
    #start background worker
    worker=create_worker(WorkerSettings)
    app.state.worker_task=asyncio.create_task(
        worker.async_run()
    )
    try:
        yield
    finally:
        app.state.worker_task.cancel()

        try:
            await app.state.worker_task
        except asyncio.CancelledError:
            pass


app=FastAPI(lifespan=lifespan)

@app.get('/healthz')
async def health_check():
    if app.state.worker_task.done():
        return {
            "status":"worker stopped"
        }

    return {
        "status":"ok"
    }

pool=AsyncConnectionPool(
    conninfo=os.getenv("CONNECTION_STRING"),
    min_size=1,
    max_size=5,
    max_idle=300,
    check=AsyncConnectionPool.check_connection,
    open=False,
)

#this fn is to execute background task for analytics
async def record_click(ctx,short_code,event_key,clicked_at):
    try:
        async with pool.connection() as conn:
            async with conn.cursor() as cursor:

                await cursor.execute("INSERT INTO click_events " \
                "(click_time, event_key) " \
                "VALUES(%s,%s) " \
                "ON CONFLICT(event_key) DO NOTHING " \
                "RETURNING click_id",
                (clicked_at,event_key))

                row=await cursor.fetchone()

                # Case 1: when click_event already exists with same event key and worker is retrying again
                # In case of conflict row will be None
                if row is None:
                    return

                # Case 2: when click_event did not exist
                # add the click event for the url_id
                # update click count and last_clicked_at
                
                click_id=row[0]
                await cursor.execute("SELECT url_id " \
                "FROM urls " \
                "WHERE code=%s", (short_code,))

                row=await cursor.fetchone()

                url_id=row[0]

                await cursor.execute("UPDATE click_events " \
                "SET url_id=%s " \
                "WHERE click_id=%s",(url_id,click_id))

                #case to handle if a worker B updates click count for a previous click after worker A had added click count for a more recent click
                #then update last_clicked_at to the greatest value 
                await cursor.execute("UPDATE urls " \
                "SET click_count=click_count+1, " \
                "last_clicked_at=CASE " \
                "WHEN last_clicked_at is NULL OR last_clicked_at < %s " \
                "THEN %s " \
                "ELSE last_clicked_at " \
                "END " \
                "WHERE code=%s " \
                ,(clicked_at,clicked_at,short_code,))
            

                await conn.commit()

    except Exception as e:
        #TODO: add logging later
        raise

async def startup(ctx):
    await pool.open()

async def shutdown(ctx):
    await pool.close()

class WorkerSettings:
    functions=[record_click]
    on_startup=startup
    on_shutdown=shutdown

    redis_settings=RedisSettings.from_dsn(
        REDIS_URL
    )