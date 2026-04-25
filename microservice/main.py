from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from models.schemas import ProcessNotesRequest, ProcessNotesResponse
from services.graph_service import GraphService

app = FastAPI(
    title="MindMesh AI - Graph Processor",
    description="Python microservice for note embedding, clustering, and topology generation",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

graph_service = GraphService()

@app.get("/")
def root():
    return {"status": "ok", "service": "MindMesh AI Graph Processor"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/process-notes", response_model=ProcessNotesResponse)
def process_notes(request: ProcessNotesRequest):
    try:
        notes_dict = [note.model_dump() for note in request.notes]
        result = graph_service.process_notes(request.workspace_id, notes_dict)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

