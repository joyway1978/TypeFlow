from __future__ import annotations

import hashlib
import re
from pathlib import Path
from typing import List, Literal, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="TypeFlow Backend")

# --------------------
# Health check endpoint
# --------------------
@app.get("/")
def root():
    return {"status": "ok", "message": "TypeFlow Backend is running"}

# --------------------
# CORS (dev: allow all)
# --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------
# Models
# --------------------
class TTSRequest(BaseModel):
    text: str = Field(min_length=1, max_length=400)


class TTSResponse(BaseModel):
    audioUrl: str


class CheckRequest(BaseModel):
    targetText: str = Field(min_length=1, max_length=400)
    userText: str = Field(min_length=0, max_length=400)


class CheckReportItem(BaseModel):
    targetToken: str
    userToken: Optional[str] = None
    status: Literal["correct", "ignored_by_case_or_punct", "wrong"]


class CheckSummary(BaseModel):
    correctCount: int
    ignoredCount: int
    wrongCount: int


class CheckResponse(BaseModel):
    normalizedTargetTokens: List[str]
    normalizedUserTokens: List[str]
    report: List[CheckReportItem]
    summary: CheckSummary


# --------------------
# Config
# --------------------
CACHE_DIR = Path(__file__).parent / "cache" / "tts"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

VOICE = "en-US-JennyNeural"  # Edge TTS voice id
AUDIO_FORMAT = "mp3"


# --------------------
# Normalization + tokenization
# --------------------

def _normalize_text_for_tokens(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[\t\n\r]+", " ", text)
    # Remove punctuation. We keep apostrophes out of the remove set for now
    # because many learners type with/without them; but you can adjust.
    text = re.sub(r"[\.,!\?;:\(\)\[\]\{\}\"'“”‘’]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def tokenize(text: str) -> List[str]:
    normalized = _normalize_text_for_tokens(text)
    if not normalized:
        return []
    return normalized.split(" ")


def tokenize_original(text: str) -> List[str]:
    text = re.sub(r"[\t\n\r]+", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return []
    return text.split(" ")


# --------------------
# Alignment (token-level edit distance)
# --------------------
# We compute a DP table for Levenshtein distance, then backtrack to
# produce an alignment path.

def align_tokens(target: List[str], user: List[str]) -> List[tuple[int, Optional[int]]]:
    n = len(target)
    m = len(user)

    dp = [[0] * (m + 1) for _ in range(n + 1)]
    back = [[""] * (m + 1) for _ in range(n + 1)]

    for i in range(n + 1):
        dp[i][0] = i
        back[i][0] = "del"

    for j in range(m + 1):
        dp[0][j] = j
        back[0][j] = "ins"

    back[0][0] = "none"

    for i in range(1, n + 1):
        for j in range(1, m + 1):
            cost_sub = 0 if target[i - 1] == user[j - 1] else 1
            sub = dp[i - 1][j - 1] + cost_sub
            delete = dp[i - 1][j] + 1
            insert = dp[i][j - 1] + 1

            best = min(sub, delete, insert)
            dp[i][j] = best

            if best == sub:
                back[i][j] = "sub" if cost_sub == 1 else "match"
            elif best == delete:
                back[i][j] = "del"
            else:
                back[i][j] = "ins"

    i, j = n, m
    alignment_rev: List[tuple[int, Optional[int]]] = []

    while i > 0 or j > 0:
        op = back[i][j]
        if op in ("match", "sub"):
            alignment_rev.append((i - 1, j - 1))
            i -= 1
            j -= 1
        elif op == "del":
            alignment_rev.append((i - 1, None))
            i -= 1
        elif op == "ins":
            j -= 1
        else:
            break

    alignment_rev.reverse()
    return alignment_rev


def build_report(
    target_tokens: List[str],
    user_tokens: List[str],
    target_original: List[str],
    user_original: List[str],
    alignment: List[tuple[int, Optional[int]]],
) -> CheckResponse:
    report: List[CheckReportItem] = []
    correct = ignored = wrong = 0

    for target_idx, user_idx in alignment:
        target_token = target_tokens[target_idx]
        orig_target = target_original[target_idx] if target_idx < len(target_original) else target_token

        if user_idx is None:
            status = "wrong"
            wrong += 1
            report_item = CheckReportItem(
                targetToken=target_token,
                userToken=None,
                status=status,
            )
        else:
            user_token = user_tokens[user_idx]
            orig_user = user_original[user_idx] if user_idx < len(user_original) else user_token

            if user_token == target_token:
                # 内容正确即算对，大小写/标点差异不影响
                status = "correct"
                correct += 1
            else:
                status = "wrong"
                wrong += 1

            report_item = CheckReportItem(
                targetToken=target_token,
                userToken=user_token,
                status=status,
            )

        report.append(report_item)

    summary = CheckSummary(correctCount=correct, ignoredCount=ignored, wrongCount=wrong)
    return CheckResponse(
        normalizedTargetTokens=target_tokens,
        normalizedUserTokens=user_tokens,
        report=report,
        summary=summary,
    )


@app.post("/api/check", response_model=CheckResponse)
def check(req: CheckRequest) -> CheckResponse:
    target_tokens = tokenize(req.targetText)
    user_tokens = tokenize(req.userText)
    target_original = tokenize_original(req.targetText)
    user_original = tokenize_original(req.userText)
    alignment = align_tokens(target_tokens, user_tokens)
    return build_report(target_tokens, user_tokens, target_original, user_original, alignment)


# --------------------
# TTS (Edge TTS)
# --------------------
async def _edge_tts_render_mp3(text: str, output_path: Path) -> None:
    try:
        import edge_tts  # type: ignore
    except Exception as e:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"edge-tts import failed: {e}")

    voice = VOICE

    communicate = edge_tts.Communicate(text, voice=voice)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    await communicate.save(str(output_path))


@app.post("/api/tts", response_model=TTSResponse)
async def tts(req: TTSRequest) -> TTSResponse:
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="text is empty")

    key_source = f"{req.text}|||{VOICE}|||{AUDIO_FORMAT}"
    key = hashlib.sha256(key_source.encode("utf-8")).hexdigest()
    cache_path = CACHE_DIR / f"{key}.mp3"

    # Serve from cache if exists
    if cache_path.exists() and cache_path.stat().st_size > 0:
        return TTSResponse(audioUrl=f"/api/tts/audio/{key}")

    try:
        await _edge_tts_render_mp3(req.text, cache_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"tts generation failed: {e}")

    return TTSResponse(audioUrl=f"/api/tts/audio/{key}")


from fastapi.responses import FileResponse


@app.get("/api/tts/audio/{key}")
def tts_audio(key: str):
    cache_path = CACHE_DIR / f"{key}.mp3"
    if not cache_path.exists():
        raise HTTPException(status_code=404, detail="audio not found")
    return FileResponse(str(cache_path), media_type="audio/mpeg")
