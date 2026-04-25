# MindMesh AI - Build Plan

## Phase 1: React Frontend (React + Vite + Tailwind + R3F + Drei)
- [ ] Setup project with package.json, vite config, tailwind config
- [ ] Create sample topology JSON files (centralized, decentralized, distributed)
- [ ] Build 3D graph viewer with React Three Fiber
- [ ] Implement glowing nodes, edges, hover labels
- [ ] Add detail panel on node click
- [ ] Add topology switcher buttons
- [ ] Add search functionality
- [ ] Add futuristic responsive UI
- [ ] Integrate MediaPipe hand tracking
- [ ] Implement gesture controls (open palm, pinch, two fingers, swipe, fist)
- [ ] Add webcam preview toggle

## Phase 2: Laravel Backend
- [ ] Initialize Laravel 11 with Breeze API
- [ ] Create migrations (workspaces, notes, idea_clusters, graph_nodes, graph_edges)
- [ ] Create models with relationships
- [ ] Create controllers (Workspace, Note, Graph, IdeaCluster)
- [ ] Create Form Requests with validation
- [ ] Implement API routes
- [ ] Add auth middleware
- [ ] Implement txt file upload and split into notes
- [ ] Create PythonService HTTP client
- [ ] Implement graph generation endpoint
- [ ] Add error handling and policies

## Phase 3: Python FastAPI Microservice
- [ ] Setup FastAPI with requirements.txt
- [ ] Create embeddingservice.py
- [ ] Create clusteringservice.py
- [ ] Create topologyservice.py (3 layouts)
- [ ] Create graph_service.py
- [ ] Implement POST /process-notes endpoint
- [ ] Add CORS and error handling

## Phase 4: Integration
- [ ] Connect Laravel to Python service
- [ ] Frontend fetches graph data from Laravel
- [ ] End-to-end testing

