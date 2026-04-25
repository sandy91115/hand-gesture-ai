import numpy as np
from sentence_transformers import SentenceTransformer
from typing import List, Dict

class EmbeddingService:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)
    
    def generate_embeddings(self, notes: List[Dict]) -> np.ndarray:
        texts = [f"{note['title']}. {note['content']}" for note in notes]
        embeddings = self.model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
        return embeddings
    
    def compute_similarity_matrix(self, embeddings: np.ndarray) -> np.ndarray:
        norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
        normalized = embeddings / np.maximum(norms, 1e-8)
        similarity_matrix = np.dot(normalized, normalized.T)
        return np.clip(similarity_matrix, -1.0, 1.0)

