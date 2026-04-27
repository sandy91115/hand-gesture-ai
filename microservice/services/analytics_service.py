import networkx as nx
from typing import List, Dict, Tuple

class AnalyticsService:
    """Compute advanced graph metrics using NetworkX."""

    def compute_metrics(self, nodes: List[Dict], edges: List[Dict]) -> Dict:
        """Compute PageRank, betweenness centrality, clustering coefficient, and global stats."""
        G = nx.Graph()

        # Add nodes with attributes
        for node in nodes:
            G.add_node(node["id"], **node)

        # Add weighted edges
        for edge in edges:
            G.add_edge(edge["source"], edge["target"], weight=edge.get("similarity_score", 0.5))

        if G.number_of_nodes() == 0:
            return {"error": "Empty graph"}

        metrics = {
            "node_count": G.number_of_nodes(),
            "edge_count": G.number_of_edges(),
            "density": round(nx.density(G), 4),
            "is_connected": nx.is_connected(G),
        }

        # Average degree
        degrees = [d for _, d in G.degree()]
        metrics["avg_degree"] = round(sum(degrees) / len(degrees), 2) if degrees else 0

        # PageRank
        try:
            pagerank = nx.pagerank(G, weight="weight")
            metrics["pagerank"] = {str(k): round(v, 6) for k, v in pagerank.items()}
        except Exception:
            metrics["pagerank"] = {}

        # Betweenness centrality
        try:
            betweenness = nx.betweenness_centrality(G, weight="weight")
            metrics["betweenness"] = {str(k): round(v, 6) for k, v in betweenness.items()}
        except Exception:
            metrics["betweenness"] = {}

        # Clustering coefficient
        try:
            clustering = nx.clustering(G)
            metrics["clustering"] = {str(k): round(v, 4) for k, v in clustering.items()}
            metrics["avg_clustering"] = round(nx.average_clustering(G), 4)
        except Exception:
            metrics["clustering"] = {}
            metrics["avg_clustering"] = 0

        # Degree centrality
        try:
            degree_cent = nx.degree_centrality(G)
            metrics["degree_centrality"] = {str(k): round(v, 4) for k, v in degree_cent.items()}
        except Exception:
            metrics["degree_centrality"] = {}

        # Most central nodes
        if metrics["pagerank"]:
            top_pr = max(metrics["pagerank"].items(), key=lambda x: x[1])
            metrics["top_pagerank_node"] = int(top_pr[0])
            metrics["top_pagerank_score"] = top_pr[1]

        if metrics["betweenness"]:
            top_bc = max(metrics["betweenness"].items(), key=lambda x: x[1])
            metrics["top_betweenness_node"] = int(top_bc[0])
            metrics["top_betweenness_score"] = top_bc[1]

        # Connected components
        metrics["connected_components"] = nx.number_connected_components(G)

        return metrics

    def compute_cluster_metrics(self, nodes: List[Dict], edges: List[Dict]) -> List[Dict]:
        """Compute per-cluster subgraph metrics."""
        G = nx.Graph()
        for node in nodes:
            G.add_node(node["id"], cluster_id=node.get("cluster_id", 0))
        for edge in edges:
            G.add_edge(edge["source"], edge["target"])

        clusters = {}
        for node in nodes:
            cid = node.get("cluster_id", 0)
            if cid not in clusters:
                clusters[cid] = []
            clusters[cid].append(node["id"])

        result = []
        for cid, node_ids in clusters.items():
            subgraph = G.subgraph(node_ids)
            result.append({
                "cluster_id": cid,
                "node_count": subgraph.number_of_nodes(),
                "edge_count": subgraph.number_of_edges(),
                "density": round(nx.density(subgraph), 4) if subgraph.number_of_nodes() > 1 else 0,
                "is_connected": nx.is_connected(subgraph) if subgraph.number_of_nodes() > 1 else True,
            })
        return result

