from __future__ import annotations

import base64
import hashlib
import hmac
import os
import time
from dataclasses import dataclass
from typing import Any, Optional

import jwt


def _b64(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).decode("utf-8").rstrip("=")


def _unb64(s: str) -> bytes:
    pad = "=" * (-len(s) % 4)
    return base64.urlsafe_b64decode((s + pad).encode("utf-8"))


def hash_password(password: str, *, salt: Optional[bytes] = None, iterations: int = 210_000) -> tuple[str, str]:
    if salt is None:
        salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations, dklen=32)
    return _b64(dk), _b64(salt)


def verify_password(password: str, password_hash_b64: str, salt_b64: str, *, iterations: int = 210_000) -> bool:
    expected = _unb64(password_hash_b64)
    salt = _unb64(salt_b64)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations, dklen=32)
    return hmac.compare_digest(dk, expected)


@dataclass(frozen=True)
class JwtConfig:
    secret: str
    issuer: str = "krishirakshak-ai"
    access_ttl_seconds: int = 60 * 60 * 8  # 8 hours


def jwt_config() -> JwtConfig:
    secret = os.environ.get("KRISHIRAKSHAK_JWT_SECRET", "")
    if not secret:
        secret = "dev-only-change-me"
    return JwtConfig(secret=secret)


def create_access_token(*, user_id: int, email: str, name: str) -> str:
    cfg = jwt_config()
    now = int(time.time())
    payload: dict[str, Any] = {
        "iss": cfg.issuer,
        "sub": str(user_id),
        "email": email,
        "name": name,
        "iat": now,
        "exp": now + cfg.access_ttl_seconds,
        "type": "access",
    }
    return jwt.encode(payload, cfg.secret, algorithm="HS256")


def decode_token(token: str) -> dict[str, Any]:
    cfg = jwt_config()
    return jwt.decode(token, cfg.secret, algorithms=["HS256"], issuer=cfg.issuer)

