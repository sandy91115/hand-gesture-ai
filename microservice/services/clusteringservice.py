import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from typing import List, Dict, Tuple

class ClusteringService:
    def __init__(self, min_clusters: int = 2, max_clusters: int = 8):
        self.min_clusters = min_clusters
        self.max_clusters = max(max_clusters, min_clusters + 1)
    
    def find_optimal_clusters(self, embeddings: np.ndarray) -> int:
        n_samples = len(embeddings)
        max_k = min(self.max_clusters, n_samples - 1)
        if max_k < self.min_clusters:
            return 1
        
        best_k = self.min_clusters
        best_score = -1
        
        for k in range(self.min_clusters, max_k + 1):
            kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
            labels = kmeans.fit_predict(embeddings)
            if len(set(labels)) > 1:
                score = silhouette_score(embeddings, labels)
                if score > best_score:
                    best_score = score
                    best_k = k
        
        return best_k
    
    def cluster_notes(self, embeddings: np.ndarray, notes: List[Dict]) -> Tuple[List[int], Dict[int, str]]:
        n_samples = len(embeddings)
        if n_samples <= 3:
            labels = [0] * n_samples
            cluster_names = {0: "General"}
        else:
            k = self.find_optimal_clusters(embeddings)
            kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
            labels = kmeans.fit_predict(embeddings).tolist()
            cluster_names = self._generate_cluster_names(notes, labels, k)
        
        return labels, cluster_names
    
    def _generate_cluster_names(self, notes: List[Dict], labels: List[int], k: int) -> Dict[int, str]:
        from collections import Counter
        import re
        
        cluster_names = {}
        for cluster_id in range(k):
            cluster_notes = [notes[i] for i, lbl in enumerate(labels) if lbl == cluster_id]
            if not cluster_notes:
                cluster_names[cluster_id] = f"Cluster {cluster_id + 1}"
                continue
            
            all_text = " ".join([n["title"] + " " + n["content"] for n in cluster_notes])
            words = re.findall(r'\b[a-zA-Z]{4,}\b', all_text.lower())
            stopwords = {"this", "that", "with", "from", "they", "have", "will", "would", "could", "should", "about", "their", "there", "where", "when", "what", "which", "while", "because", "before", "after", "above", "below", "between", "through", "during", "under", "over", "again", "further", "then", "than", "here", "there", "these", "those", "them", "than", "only", "some", "time", "very", "just", "also", "into", "your", "than", "more", "most", "other", "many", "such", "each", "make", "like", "well", "know", "take", "year", "good", "come", "could", "state", "than", "only", "some", "time", "very", "when", "much", "would", "there", "their", "said", "each"}
            filtered = [w for w in words if w not in stopwords]
            most_common = Counter(filtered).most_common(3)
            
            if most_common:
                name = " ".join([w.capitalize() for w, _ in most_common[:2]])
            else:
                name = f"Theme {cluster_id + 1}"
            cluster_names[cluster_id] = name
        
        return cluster_names

