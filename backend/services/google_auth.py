import base64
import hashlib
import hmac
import json
import os
import secrets
import time
from urllib.parse import urlencode, urlsplit

import httpx
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, RedirectResponse


router = APIRouter(prefix="/auth")
FLOW_COOKIE = "campusgpt_google_flow"
SESSION_COOKIE = "campusgpt_session"
FLOW_TTL = 600
SESSION_TTL = 86400


def configuration():
    client_id = os.getenv("GOOGLE_CLIENT_ID", "").strip()
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET", "").strip()
    session_secret = os.getenv("CAMPUSGPT_SESSION_SECRET", "")
    origin = os.getenv("CAMPUSGPT_PUBLIC_URL", "").rstrip("/")
    parsed = urlsplit(origin)
    valid_origin = (
        bool(parsed.hostname)
        and not any((parsed.path, parsed.query, parsed.fragment, parsed.username, parsed.password))
        and (parsed.scheme == "https"
             or (parsed.scheme == "http" and parsed.hostname in {"localhost", "127.0.0.1"}))
    )
    if client_id and client_secret and len(session_secret) >= 32 and valid_origin:
        return client_id, client_secret, session_secret.encode(), origin
    return None


def encode(value):
    return base64.urlsafe_b64encode(value).decode().rstrip("=")


def seal(data, purpose, secret, ttl):
    payload = encode(json.dumps({**data, "exp": int(time.time()) + ttl}).encode())
    signature = hmac.digest(secret, f"{purpose}.{payload}".encode(), "sha256")
    return f"{payload}.{encode(signature)}"


def read_cookie(token, purpose, secret):
    try:
        payload, signature = token.split(".", 1)
        expected = encode(hmac.digest(secret, f"{purpose}.{payload}".encode(), "sha256"))
        if not hmac.compare_digest(signature, expected):
            return None
        data = json.loads(base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4)))
        if data["exp"] > time.time():
            return data
    except (ValueError, KeyError, TypeError):
        pass
    return None


def set_cookie(response, name, data, secret, origin, ttl):
    response.set_cookie(
        name, seal(data, name, secret, ttl), max_age=ttl,
        httponly=True, samesite="lax", secure=origin.startswith("https://"),
    )


@router.get("/session")
def session(request: Request):
    config = configuration()
    account = read_cookie(request.cookies.get(SESSION_COOKIE, ""), SESSION_COOKIE, config[2]) if config else None
    return JSONResponse(
        {"enabled": config is not None, "user": {"name": account["name"]} if account else None},
        headers={"Cache-Control": "no-store"},
    )


@router.get("/google")
def google_login():
    config = configuration()
    if not config:
        return JSONResponse({"detail": "Google sign-in has not been configured."}, status_code=503)
    client_id, _, secret, origin = config
    state = secrets.token_urlsafe(32)
    verifier = secrets.token_urlsafe(48)
    query = urlencode({
        "client_id": client_id,
        "redirect_uri": origin + "/api/campus/auth/callback",
        "response_type": "code",
        "scope": "openid profile",
        "state": state,
        "code_challenge": encode(hashlib.sha256(verifier.encode()).digest()),
        "code_challenge_method": "S256",
    })
    response = RedirectResponse("https://accounts.google.com/o/oauth2/v2/auth?" + query)
    set_cookie(response, FLOW_COOKIE, {"state": state, "verifier": verifier}, secret, origin, FLOW_TTL)
    return response


@router.get("/callback")
async def google_callback(request: Request, code: str = "", state: str = ""):
    config = configuration()
    if not config:
        return JSONResponse({"detail": "Google sign-in has not been configured."}, status_code=503)
    client_id, client_secret, secret, origin = config
    failure = RedirectResponse(origin + "/chat?auth=failed", status_code=303)
    failure.delete_cookie(FLOW_COOKIE)
    flow = read_cookie(request.cookies.get(FLOW_COOKIE, ""), FLOW_COOKIE, secret)
    if not code or not state.isascii() or not flow or not hmac.compare_digest(flow["state"], state):
        return failure

    try:
        async with httpx.AsyncClient(timeout=12) as client:
            token_response = await client.post("https://oauth2.googleapis.com/token", data={
                "client_id": client_id, "client_secret": client_secret, "code": code,
                "code_verifier": flow["verifier"], "grant_type": "authorization_code",
                "redirect_uri": origin + "/api/campus/auth/callback",
            })
            access_token = token_response.raise_for_status().json()["access_token"]
            user_response = await client.get(
                "https://openidconnect.googleapis.com/v1/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            user = user_response.raise_for_status().json()
            if not isinstance(user.get("sub"), str) or not user["sub"]:
                return failure
    except (httpx.HTTPError, ValueError, KeyError, TypeError):
        return failure

    response = RedirectResponse(origin + "/chat", status_code=303)
    response.delete_cookie(FLOW_COOKIE)
    name = user.get("name")
    set_cookie(response, SESSION_COOKIE, {
        "sub": user["sub"],
        "name": name[:120] if isinstance(name, str) and name.strip() else "Google user",
    }, secret, origin, SESSION_TTL)
    return response


@router.post("/logout")
def google_logout(request: Request):
    config = configuration()
    if not config or request.headers.get("origin") != config[3]:
        return JSONResponse({"detail": "Invalid sign-out request."}, status_code=403)
    response = RedirectResponse(config[3] + "/chat", status_code=303)
    response.delete_cookie(SESSION_COOKIE)
    return response
