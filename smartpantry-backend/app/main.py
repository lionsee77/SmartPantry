from fastapi import FastAPI
from app.routers import routes

app = FastAPI()

app.include_router(routes.router)

@app.get("/")
def health_check():
    return {"message": "Smart Pantry Buddy API is running"}