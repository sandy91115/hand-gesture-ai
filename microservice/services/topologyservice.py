import numpy as np
from typing import List, Dict, Tuple

class TopologyService:
    def __init__(self):
        self.colors = [
            "#00aaff", "#ff6b6b", "#51cf66", "#fcc419",
            "#cc5de8", "#ff922b", "#22b8cf", "#f06595"
        ]
    
    def centralized_layout(self, embeddings: np.ndarray, notes: List[Dict], 
                          similarity_matrix: np.ndarray, labels: List[int]) -> Tuple[List[Dict], List[Dict]]:
        n = len(notes)
        centroid_idx = self._find_centroid(embeddings)
        
        # Sphere radius based on semantic distance from centroid
        nodes = []
        for i in range(n):
            dist = float(1.0 - similarity_matrix[centroid_idx][i])
            theta = np.arccos(2 * np.random.random() - 1)
            phi = 2 * np.pi * np.random.random()
            
            r = 2 + dist * 8
            x = r * np.sin(theta) * np.cos(phi)
            y = r * np.sin(theta) * np.sin(phi)
            z = r * np.cos(theta)
            
            importance = float(np.mean(similarity_matrix[i]))
            cluster_id = labels[i] if i < len(labels) else 0
            
            nodes.append({
                "id": notes[i]["id"],
                "note_id": notes[i]["id"],
                "title": notes[i]["title"],
                "x": round(float(x), 4),
                "y": round(float(y), 4),
                "z": round(float(z), 4),
                "size": round(0.3 + importance * 0.7, 4),
                "color": self.colors[cluster_id % len(self.colors)],
                "importance_score": round(importance, 4),
                "cluster_id": cluster_id,
                "cluster_name": ""
            })
        
        edges = self._build_edges(notes, similarity_matrix, top_n=3)
        return nodes, edges
    
    def decentralized_layout(self, embeddings: np.ndarray, notes: List[Dict],
                            similarity_matrix: np.ndarray, labels: List[int]) -> Tuple[List[Dict], List[Dict]]:
        n = len(notes)
        unique_labels = sorted(set(labels))
        k = len(unique_labels)
        
        # Fibonacci sphere for cluster centers
        cluster_centers = {}
        golden_ratio = (1 + np.sqrt(5)) / 2
        for idx, lbl in enumerate(unique_labels):
            i = idx
            theta = 2 * np.pi * i / golden_ratio
            phi = np.arccos(1 - 2 * (i + 0.5) / max(k, 1))
            r = 6
            x = r * np.sin(phi) * np.cos(theta)
            y = r * np.sin(phi) * np.sin(theta)
            z = r * np.cos(phi)
            cluster_centers[lbl] = (x, y, z)
        
        nodes = []
        for i in range(n):
            cluster_id = labels[i]
            cx, cy, cz = cluster_centers.get(cluster_id, (0, 0, 0))
            
            # Orbit around cluster center
            theta = np.random.random() * 2 * np.pi
            phi = np.arccos(2 * np.random.random() - 1)
            r = 1.5 + np.random.random() * 2
            
            x = cx + r * np.sin(phi) * np.cos(theta)
            y = cy + r * np.sin(phi) * np.sin(theta)
            z = cz + r * np.cos(phi)
            
            importance = float(np.mean(similarity_matrix[i]))
            
            nodes.append({
                "id": notes[i]["id"],
                "note_id": notes[i]["id"],
                "title": notes[i]["title"],
                "x": round(float(x), 4),
                "y": round(float(y), 4),
                "z": round(float(z), 4),
                "size": round(0.3 + importance * 0.7, 4),
                "color": self.colors[cluster_id % len(self.colors)],
                "importance_score": round(importance, 4),
                "cluster_id": cluster_id,
                "cluster_name": ""
            })
        
        edges = self._build_edges(notes, similarity_matrix, top_n=3, include_cluster_edges=True, labels=labels)
        return nodes, edges
    
    def distributed_layout(self, embeddings: np.ndarray, notes: List[Dict],
                          similarity_matrix: np.ndarray, labels: List[int]) -> Tuple[List[Dict], List[Dict]]:
        n = len(notes)
        
        # 3D coordinates from embeddings via PCA-like projection
        u, s, vt = np.linalg.svd(embeddings - embeddings.mean(axis=0))
        coords = (u[:, :3] * s[:3])
        
        # Normalize to reasonable range
        max_range = np.max(np.abs(coords)) + 1e-8
        coords = (coords / max_range) * 8
        
        nodes = []
        for i in range(n):
            importance = float(np.mean(similarity_matrix[i]))
            cluster_id = labels[i] if i < len(labels) else 0
            
            nodes.append({
                "id": notes[i]["id"],
                "note_id": notes[i]["id"],
                "title": notes[i]["title"],
                "x": round(float(coords[i, 0]), 4),
                "y": round(float(coords[i, 1]), 4),
                "z": round(float(coords[i, 2]), 4),
                "size": round(0.3 + importance * 0.7, 4),
                "color": self.colors[cluster_id % len(self.colors)],
                "importance_score": round(importance, 4),
                "cluster_id": cluster_id,
                "cluster_name": ""
            })
        
        edges = self._build_nearest_neighbor_edges(notes, similarity_matrix, k=3)
        return nodes, edges
    
    def _find_centroid(self, embeddings: np.ndarray) -> int:
        centroid = embeddings.mean(axis=0)
        distances = np.linalg.norm(embeddings - centroid, axis=1)
        return int(np.argmin(distances))
    
    def _build_edges(self, notes: List[Dict], similarity_matrix: np.ndarray, 
                    top_n: int = 3, include_cluster_edges: bool = False, labels: List[int] = None) -> List[Dict]:
        n = len(notes)
        edges = []
        edge_set = set()
        
        for i in range(n):
            similarities = [(j, similarity_matrix[i][j]) for j in range(n) if i != j]
            similarities.sort(key=lambda x: x[1], reverse=True)
            
            for j, sim in similarities[:top_n]:
                key = tuple(sorted((notes[i]["id"], notes[j]["id"])))
                if key not in edge_set:
                    edge_set.add(key)
                    edge_type = "semantic"
                    if include_cluster_edges and labels and labels[i] == labels[j]:
                        edge_type = "cluster"
                    edges.append({
                        "source": notes[i]["id"],
                        "target": notes[j]["id"],
                        "similarity_score": round(float(sim), 4),
                        "edge_type": edge_type
                    })
        
        return edges
    
    def _build_nearest_neighbor_edges(self, notes: List[Dict], similarity_matrix: np.ndarray, k: int = 3) -> List[Dict]:
        n = len(notes)
        edges = []
        edge_set = set()
        
        for i in range(n):
            similarities = [(j, similarity_matrix[i][j]) for j in range(n) if i != j]
            similarities.sort(key=lambda x: x[1], reverse=True)
            
            for j, sim in similarities[:k]:
                key = tuple(sorted((notes[i]["id"], notes[j]["id"])))
                if key not in edge_set:
                    edge_set.add(key)
                    edges.append({
                        "source": notes[i]["id"],
                        "target": notes[j]["id"],
                        "similarity_score": round(float(sim), 4),
                        "edge_type": "nearest"
                    })
        
        return edges

