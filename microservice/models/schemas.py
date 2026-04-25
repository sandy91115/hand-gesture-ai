from pydantic import BaseModel
from typing import List, Optional

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

