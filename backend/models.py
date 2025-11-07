from sqlmodel import Field, SQLModel, Relationship
from typing import List, Optional
from datetime import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    videos: List['Video'] = Relationship(back_populates='user', sa_relationship_kwargs={'cascade':'all, delete-orphan'})
    followers: List['Follow'] = Relationship(back_populates='following', sa_relationship_kwargs={'cascade':'all, delete-orphan'})
    following: List['Follow'] = Relationship(back_populates='follower', sa_relationship_kwargs={'cascade':'all, delete-orphan'})

class Video(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    title: str
    filename: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    user: Optional[User] = Relationship(back_populates='videos')
    comments: List['Comment'] = Relationship(back_populates='video', sa_relationship_kwargs={'cascade':'all, delete-orphan'})
    likes: List['Like'] = Relationship(back_populates='video', sa_relationship_kwargs={'cascade':'all, delete-orphan'})

class Comment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    video_id: int = Field(foreign_key="video.id")
    text: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    video: Optional[Video] = Relationship(back_populates='comments')

class Like(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    video_id: int = Field(foreign_key="video.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    video: Optional[Video] = Relationship(back_populates='likes')

class Follow(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    follower_id: int = Field(foreign_key="user.id")
    following_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    follower: Optional[User] = Relationship(back_populates='following', sa_relationship_kwargs={'foreign_keys':'Follow.follower_id'})
    following: Optional[User] = Relationship(back_populates='followers', sa_relationship_kwargs={'foreign_keys':'Follow.following_id'})
