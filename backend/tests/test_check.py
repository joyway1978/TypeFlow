import pytest
from main import tokenize, align_tokens, build_report, check, CheckRequest


class TestTokenize:
    def test_simple_sentence(self):
        result = tokenize("The quick brown fox")
        assert result == ["the", "quick", "brown", "fox"]

    def test_with_punctuation(self):
        result = tokenize("Hello, world!")
        assert result == ["hello", "world"]

    def test_empty_string(self):
        result = tokenize("")
        assert result == []


class TestAlignTokens:
    def test_identical_tokens(self):
        target = ["the", "quick", "brown", "fox"]
        user = ["the", "quick", "brown", "fox"]
        alignment = align_tokens(target, user)
        assert len(alignment) == 4
        for i, (t, u) in enumerate(alignment):
            assert t == i
            assert u == i

    def test_one_missing_token(self):
        target = ["the", "quick", "brown", "fox"]
        user = ["the", "quick", "brown"]
        alignment = align_tokens(target, user)
        # Should have 4 alignments, one with None
        assert len(alignment) == 4


class TestCheckEndpoint:
    @pytest.mark.asyncio
    async def test_check_endpoint_success(self, async_client):
        response = await async_client.post(
            "/api/check",
            json={"targetText": "Hello world", "userText": "Hello world"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "report" in data
        assert "summary" in data
        assert data["summary"]["correctCount"] == 2

    @pytest.mark.asyncio
    async def test_check_endpoint_with_typo(self, async_client):
        response = await async_client.post(
            "/api/check",
            json={"targetText": "The quick brown fox", "userText": "The quik brown fox"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["summary"]["correctCount"] == 3
        assert data["summary"]["wrongCount"] == 1


class TestCheckFunction:
    def test_perfect_match(self):
        req = CheckRequest(targetText="The quick brown fox", userText="The quick brown fox")
        result = check(req)
        assert result.summary.correctCount == 4
        assert result.summary.wrongCount == 0

    def test_one_typo(self):
        req = CheckRequest(targetText="The quick brown fox", userText="The quik brown fox")
        result = check(req)
        assert result.summary.correctCount == 3
        assert result.summary.wrongCount == 1
