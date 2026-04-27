from typing import List, Dict
from collections import defaultdict

class SentimentService:
    """VADER-based sentiment analysis for notes and clusters."""

    def __init__(self):
        try:
            from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
            self.analyzer = SentimentIntensityAnalyzer()
            self.available = True
        except ImportError:
            self.analyzer = None
            self.available = False

    def _fallback_sentiment(self, text: str) -> Dict[str, float]:
        """Simple fallback if VADER is not installed."""
        text_lower = text.lower()
        positive_words = ["good", "great", "excellent", "amazing", "love", "best", "happy", "success", "win", "positive", "growth", "opportunity", "benefit", "advantage", "improve"]
        negative_words = ["bad", "terrible", "awful", "hate", "worst", "sad", "fail", "loss", "negative", "problem", "issue", "risk", "danger", "threat", "crisis"]

        pos_count = sum(1 for w in positive_words if w in text_lower)
        neg_count = sum(1 for w in negative_words if w in text_lower)
        total = pos_count + neg_count

        if total == 0:
            compound = 0.0
        else:
            compound = (pos_count - neg_count) / total

        return {
            "compound": round(compound, 4),
            "pos": round(pos_count / max(total, 1), 4),
            "neg": round(neg_count / max(total, 1), 4),
            "neu": round(1 - (pos_count + neg_count) / max(len(text_lower.split()), 1), 4),
        }

    def analyze_note(self, title: str, content: str) -> Dict[str, float]:
        text = f"{title} {content}".strip()
        if not text:
            return {"compound": 0, "pos": 0, "neg": 0, "neu": 1}

        if self.available and self.analyzer:
            scores = self.analyzer.polarity_scores(text)
            return {k: round(v, 4) for k, v in scores.items()}
        else:
            return self._fallback_sentiment(text)

    def analyze_notes(self, notes: List[Dict]) -> List[Dict]:
        results = []
        for note in notes:
            sentiment = self.analyze_note(note.get("title", ""), note.get("content", ""))
            results.append({
                "note_id": note.get("id"),
                "title": note.get("title", ""),
                **sentiment
            })
        return results

    def analyze_clusters(self, notes: List[Dict], labels: List[int]) -> Dict[int, Dict]:
        """Aggregate sentiment per cluster."""
        cluster_sentiments = defaultdict(list)
        for note, label in zip(notes, labels):
            sentiment = self.analyze_note(note.get("title", ""), note.get("content", ""))
            cluster_sentiments[label].append(sentiment)

        result = {}
        for cid, sentiments in cluster_sentiments.items():
            n = len(sentiments)
            result[cid] = {
                "cluster_id": cid,
                "note_count": n,
                "avg_compound": round(sum(s["compound"] for s in sentiments) / n, 4),
                "avg_pos": round(sum(s["pos"] for s in sentiments) / n, 4),
                "avg_neg": round(sum(s["neg"] for s in sentiments) / n, 4),
                "avg_neu": round(sum(s["neu"] for s in sentiments) / n, 4),
                "mood": self._classify_mood(sum(s["compound"] for s in sentiments) / n),
            }
        return result

    def _classify_mood(self, compound: float) -> str:
        if compound >= 0.5:
            return "Very Positive"
        elif compound >= 0.05:
            return "Positive"
        elif compound >= -0.05:
            return "Neutral"
        elif compound >= -0.5:
            return "Negative"
        else:
            return "Very Negative"

