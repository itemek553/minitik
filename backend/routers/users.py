from fastapi import APIRouter, HTTPException
from sqlmodel import select
from database import get_session
from models import User, Follow

router = APIRouter()

@router.on_event("startup")
def on_startup():
    # ensure DB tables exist when router loads
    from database import init_db
    init_db()

@router.post("/register/")
def register(username: str):
    """Rejestracja nowego użytkownika po nazwie (bez hasła, prototyp)."""
    with next(get_session()) as session:
        existing = session.exec(select(User).where(User.username == username)).first()
        if existing:
            raise HTTPException(status_code=400, detail="Nazwa już istnieje")
        user = User(username=username)
        session.add(user)
        session.commit()
        session.refresh(user)
        return {"id": user.id, "username": user.username}

@router.get("/{username}/profile/")
def profile(username: str):
    """Zwraca profil użytkownika (bez filmów – frontend pobiera osobno)."""
    with next(get_session()) as session:
        user = session.exec(select(User).where(User.username == username)).first()
        if not user:
            raise HTTPException(status_code=404, detail="Nie znaleziono użytkownika")
        return {
            "id": user.id,
            "username": user.username,
            "followers": session.exec(select(Follow).where(Follow.followed_id == user.id)).all(),
            "following": session.exec(select(Follow).where(Follow.follower_id == user.id)).all(),
        }

@router.post("/follow/")
def follow(follower_username: str, followed_username: str):
    """Obserwowanie użytkownika."""
    with next(get_session()) as session:
        follower = session.exec(select(User).where(User.username == follower_username)).first()
        followed = session.exec(select(User).where(User.username == followed_username)).first()

        if not follower or not followed:
            raise HTTPException(status_code=404, detail="Nie znaleziono użytkownika")

        if follower.id == followed.id:
            raise HTTPException(status_code=400, detail="Nie możesz obserwować samego siebie")

        existing = session.exec(
            select(Follow).where(
                (Follow.follower_id == follower.id) & (Follow.followed_id == followed.id)
            )
        ).first()

        if existing:
            raise HTTPException(status_code=400, detail="Już obserwujesz tego użytkownika")

        new_follow = Follow(follower_id=follower.id, followed_id=followed.id)
        session.add(new_follow)
        session.commit()
        return {"message": f"{follower.username} teraz obserwuje {followed.username}"}
