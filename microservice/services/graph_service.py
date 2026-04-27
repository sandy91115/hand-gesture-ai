from typing import List, Dict
from .embeddingservice import EmbeddingService
from .clusteringservice import ClusteringService
from .topologyservice import TopologyService
from .sentiment_service import SentimentService
import numpy as np

class GraphService:
    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.clustering_service = ClusteringService()
        self.topology_service = TopologyService()
        self.sentiment_service = SentimentService()
    
    def process_notes(self, workspace_id: int, notes: List[Dict], include_sentiment: bool = True) -> Dict:
        if not notes:
            return {
                "workspace_id": workspace_id,
                "clusters": [],
                "topologies": [],
                "sentiment": None
            }
        
        # Generate embeddings
        embeddings = self.embedding_service.generate_embeddings(notes)
        similarity_matrix = self.embedding_service.compute_similarity_matrix(embeddings)
        
        # Cluster notes
        labels, cluster_names = self.clustering_service.cluster_notes(embeddings, notes)
        
        # Build clusters output
        clusters = []
        for cluster_id, name in cluster_names.items():
            cluster_note_indices = [i for i, lbl in enumerate(labels) if lbl == cluster_id]
            if cluster_note_indices:
                centroid_note_id = notes[cluster_note_indices[0]]["id"]
                clusters.append({
                    "id": cluster_id,
                    "name": name,
                    "color": self.topology_service.colors[cluster_id % len(self.topology_service.colors)],
                    "centroid_note_id": centroid_note_id,
                    "note_count": len(cluster_note_indices)
                })
        
        # Assign cluster names to nodes
        def assign_cluster_names(nodes):
            for node in nodes:
                cid = node.get("cluster_id", 0)
                node["cluster_name"] = cluster_names.get(cid, "General")
            return nodes
        
        # Generate topologies
        topologies = []
        
        # Centralized
        c_nodes, c_edges = self.topology_service.centralized_layout(
            embeddings, notes, similarity_matrix, labels
        )
        c_nodes = assign_cluster_names(c_nodes)
        topologies.append({
            "topology": "centralized",
            "nodes": c_nodes,
            "edges": c_edges
        })
        
        # Decentralized
        d_nodes, d_edges = self.topology_service.decentralized_layout(
            embeddings, notes, similarity_matrix, labels
        )
        d_nodes = assign_cluster_names(d_nodes)
        topologies.append({
            "topology": "decentralized",
            "nodes": d_nodes,
            "edges": d_edges
        })
        
        # Distributed
        dist_nodes, dist_edges = self.topology_service.distributed_layout(
            embeddings, notes, similarity_matrix, labels
        )
        dist_nodes = assign_cluster_names(dist_nodes)
        topologies.append({
            "topology": "distributed",
            "nodes": dist_nodes,
            "edges": dist_edges
        })
        
        # Sentiment analysis
        sentiment = None
        if include_sentiment:
            note_sentiments = self.sentiment_service.analyze_notes(notes)
            cluster_sentiments = self.sentiment_service.analyze_clusters(notes, labels)
            sentiment = {
                "note_sentiments": note_sentiments,
                "cluster_sentiments": {str(k): v for k, v in cluster_sentiments.items()}
            }
        
        return {
            "workspace_id": workspace_id,
            "clusters": clusters,
            "topologies": topologies,
            "sentiment": sentiment
        }

