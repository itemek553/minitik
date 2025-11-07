from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
import os, shutil
from sqlmodel import select
from database import get_session
from models import Video, User, Comment, Like, Follow
from typing import List

router = APIRouter()
MEDIA = "media/videos"
os.makedirs(MEDIA, exist_ok=True)

@router.post("/upload/")
async def upload_video(username: str = Form(...), title: str = Form(...), file: UploadFile = File(...)):
    # very simple ownership: provide username (no auth) - for prototype only
    session = next(get_session())
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    filename = f"{user.id}_{int(os.times()[4])}_{file.filename.replace(' ', '_')}"
    path = os.path.join(MEDIA, filename)
    with open(path, "wb") as buf:
        shutil.copyfileobj(file.file, buf)
    video = Video(user_id=user.id, title=title, filename=filename)
    session.add(video)
    session.commit()
    session.refresh(video)
    return {"id": video.id, "title": video.title, "filename": video.filename}

@router.get("/list/")
def list_videos():
    session = next(get_session())
    videos = session.exec(select(Video).order_by(Video.created_at.desc())).all()
    result = []
    for v in videos:
        result.append({"id": v.id, "title": v.title, "filename": v.filename, "user_id": v.user_id})
    return result

@router.get("/stream/{filename}")
def stream_video(filename: str):
    path = os.path.join(MEDIA, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path, media_type="video/mp4")  # best-effort; browser will handle

@router.post("/comment/")
def comment(username: str, video_id: int, text: str):
    session = next(get_session())
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    comment = Comment(user_id=user.id, video_id=video_id, text=text)
    session.add(comment)
    session.commit()
    return {"status": "ok"}

@router.post("/like/")
def like(username: str, video_id: int):
    session = next(get_session())
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    existing = session.exec(select(Like).where(Like.user_id==user.id, Like.video_id==video_id)).first()
    if existing:
        return {"status": "already"}
    like = Like(user_id=user.id, video_id=video_id)
    session.add(like)
    session.commit()
    return {"status": "ok"}

@router.get("/likes_count/{video_id}")
def likes_count(video_id: int):
    session = next(get_session())
    cnt = session.exec(select(Like).where(Like.video_id==video_id)).count()
    return {"count": cnt}
