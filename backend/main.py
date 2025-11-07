from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import videos, users

app = FastAPI(title="MiniTikTok - Backend (dev)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(videos.router, prefix="/videos", tags=["videos"])

