from pydantic import BaseModel
from typing import List, Optional, Dict

class NoteInput(BaseModel):
    id: int
    title: str
    content: str

class ProcessNotesRequest(BaseModel):
    workspace_id: int
    notes: List[NoteInput]

class NodeOutput(BaseModel):
    id: int
    note_id: int
    title: str
    x: float
    y: float
    z: float
    size: float
    color: str
    importance_score: float
    cluster_id: Optional[int] = None
    cluster_name: Optional[str] = None

class EdgeOutput(BaseModel):
    source: int
    target: int
    similarity_score: float
    edge_type: str

class ClusterOutput(BaseModel):
    id: int
    name: str
    color: str
    centroid_note_id: int
    note_count: int

class TopologyOutput(BaseModel):
    topology: str
    nodes: List[NodeOutput]
    edges: List[EdgeOutput]

class ProcessNotesResponse(BaseModel):
    workspace_id: int
    clusters: List[ClusterOutput]
    topologies: List[TopologyOutput]

# Analytics schemas
class GraphMetricsRequest(BaseModel):
    workspace_id: int
    nodes: List[dict]
    edges: List[dict]

class GraphMetricsResponse(BaseModel):
    workspace_id: int
    node_count: int
    edge_count: int
    density: float
    is_connected: bool
    avg_degree: float
    avg_clustering: Optional[float] = None
    connected_components: int
    top_pagerank_node: Optional[int] = None
    top_pagerank_score: Optional[float] = None
    top_betweenness_node: Optional[int] = None
    top_betweenness_score: Optional[float] = None
    pagerank: Optional[Dict[str, float]] = None
    betweenness: Optional[Dict[str, float]] = None
    clustering: Optional[Dict[str, float]] = None
    degree_centrality: Optional[Dict[str, float]] = None

class SentimentRequest(BaseModel):
    workspace_id: int
    notes: List[NoteInput]
    labels: Optional[List[int]] = None

class SentimentResponse(BaseModel):
    workspace_id: int
    note_sentiments: List[dict]
    cluster_sentiments: Optional[Dict[str, dict]] = None

