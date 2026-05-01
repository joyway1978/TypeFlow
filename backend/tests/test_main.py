import pytest
from unittest.mock import patch


class TestTTSEndpoint:
    @pytest.mark.asyncio
    async def test_tts_endpoint_missing_text(self, async_client):
        response = await async_client.post("/api/tts", json={})
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_tts_endpoint_empty_text(self, async_client):
        response = await async_client.post("/api/tts", json={"text": "   "})
        assert response.status_code == 400


class TestHealthEndpoint:
    @pytest.mark.asyncio
    async def test_root_endpoint(self, async_client):
        response = await async_client.get("/")
        assert response.status_code == 200
