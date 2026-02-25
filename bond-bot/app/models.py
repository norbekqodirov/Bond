from __future__ import annotations

import enum
from datetime import datetime
from sqlalchemy import String, Enum, ForeignKey, Integer, DateTime, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db import Base


class Lang(str, enum.Enum):
    UZ = "UZ"
    RU = "RU"
    EN = "EN"


class Role(str, enum.Enum):
    STUDENT = "STUDENT"
    PARENT = "PARENT"
    TEACHER = "TEACHER"


class Grouping(str, enum.Enum):
    CLASS = "CLASS"
    LEVEL = "LEVEL"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tg_user_id: Mapped[int] = mapped_column(Integer, index=True, unique=True)
    role: Mapped[Role | None] = mapped_column(Enum(Role), nullable=True)
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(64), nullable=True)
    language: Mapped[Lang | None] = mapped_column(Enum(Lang), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    registrations: Mapped[list[Registration]] = relationship(back_populates="user", cascade="all,delete")


class Olympiad(Base):
    __tablename__ = "olympiads"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text)
    poster_path: Mapped[str | None] = mapped_column(String(255))
    pdf_path: Mapped[str | None] = mapped_column(String(255))
    event_at: Mapped[datetime] = mapped_column(DateTime)
    address: Mapped[str] = mapped_column(String(500))
    contact_phone: Mapped[str] = mapped_column(String(64))
    fee: Mapped[int] = mapped_column(Integer, default=0)  # participation fee in so'm
    lang_uz: Mapped[bool] = mapped_column(Boolean, default=True)
    lang_ru: Mapped[bool] = mapped_column(Boolean, default=False)
    lang_en: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    directions: Mapped[list[Direction]] = relationship(back_populates="olympiad", cascade="all,delete-orphan")
    registrations: Mapped[list[Registration]] = relationship(back_populates="olympiad", cascade="all,delete")


class Direction(Base):
    __tablename__ = "directions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    olympiad_id: Mapped[int] = mapped_column(ForeignKey("olympiads.id"))
    name: Mapped[str] = mapped_column(String(255))
    grouping: Mapped[Grouping] = mapped_column(Enum(Grouping))

    olympiad: Mapped[Olympiad] = relationship(back_populates="directions")
    groups: Mapped[list[GroupOption]] = relationship(back_populates="direction", cascade="all,delete-orphan")


class GroupOption(Base):
    __tablename__ = "group_options"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    direction_id: Mapped[int] = mapped_column(ForeignKey("directions.id"))
    name: Mapped[str] = mapped_column(String(255))
    order: Mapped[int] = mapped_column(Integer, default=0)

    direction: Mapped[Direction] = relationship(back_populates="groups")


class Registration(Base):
    __tablename__ = "registrations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    olympiad_id: Mapped[int] = mapped_column(ForeignKey("olympiads.id"))
    direction_id: Mapped[int | None] = mapped_column(ForeignKey("directions.id"), nullable=True)
    group_option_id: Mapped[int | None] = mapped_column(ForeignKey("group_options.id"), nullable=True)

    full_name: Mapped[str] = mapped_column(String(255))
    birth_date: Mapped[str] = mapped_column(String(32))
    region: Mapped[str] = mapped_column(String(128))
    district: Mapped[str] = mapped_column(String(128))
    school: Mapped[str] = mapped_column(String(128))
    grade: Mapped[str | None] = mapped_column(String(16), nullable=True)
    language: Mapped[Lang] = mapped_column(Enum(Lang))
    ticket_id: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    ticket_image_path: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="registrations")
    olympiad: Mapped[Olympiad] = relationship(back_populates="registrations")


class About(Base):
    __tablename__ = "about"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    content_uz: Mapped[str | None] = mapped_column(Text, default="")
    content_ru: Mapped[str | None] = mapped_column(Text, default="")
    content_en: Mapped[str | None] = mapped_column(Text, default="")
