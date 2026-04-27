from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from models.schemas import (
    ProcessNotesRequest, ProcessNotesResponse,
    GraphMetricsRequest, GraphMetricsResponse,
    SentimentRequest, SentimentResponse
)
from services.graph_service import GraphService
from services.analytics_service import AnalyticsService
from services.sentiment_service import SentimentService

app = FastAPI(
    title="MindMesh AI - Graph Processor",
    description="Python microservice for note embedding, clustering, topology generation, graph analytics, and sentiment analysis",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

graph_service = GraphService()
analytics_service = AnalyticsService()
sentiment_service = SentimentService()

@app.get("/")
def root():
    return {"status": "ok", "service": "MindMesh AI Graph Processor", "version": "2.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy", "features": ["embeddings", "clustering", "topologies", "analytics", "sentiment"]}

@app.post("/process-notes", response_model=ProcessNotesResponse)
def process_notes(request: ProcessNotesRequest):
    try:
        notes_dict = [note.model_dump() for note in request.notes]
        result = graph_service.process_notes(request.workspace_id, notes_dict)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analytics/graph-metrics", response_model=GraphMetricsResponse)
def graph_metrics(request: GraphMetricsRequest):
    try:
        metrics = analytics_service.compute_metrics(request.nodes, request.edges)
        return {
            "workspace_id": request.workspace_id,
            **metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analytics/sentiment", response_model=SentimentResponse)
def sentiment_analysis(request: SentimentRequest):
    try:
        notes_dict = [note.model_dump() for note in request.notes]
        note_sentiments = sentiment_service.analyze_notes(notes_dict)

        cluster_sentiments = None
        if request.labels and len(request.labels) == len(notes_dict):
            cluster_sentiments = sentiment_service.analyze_clusters(notes_dict, request.labels)
            # Convert int keys to strings for JSON
            cluster_sentiments = {str(k): v for k, v in cluster_sentiments.items()}

        return {
            "workspace_id": request.workspace_id,
            "note_sentiments": note_sentiments,
            "cluster_sentiments": cluster_sentiments
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

