<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use App\Models\GraphNode;
use App\Models\GraphEdge;
use App\Models\IdeaCluster;
use App\Services\PythonService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GraphController extends Controller
{
    public function __construct(
        protected PythonService $pythonService
    ) {}

    public function index(Request $request, Workspace $workspace): JsonResponse
    {
        $this->authorize('view', $workspace);

        $topology = $request->validate([
            'topology' => ['required', 'in:centralized,decentralized,distributed'],
        ])['topology'];

        $nodes = $workspace->graphNodes()
            ->where('topology', $topology)
            ->with('note')
            ->get();

        $edges = $workspace->graphEdges()
            ->where('topology', $topology)
            ->get();

        $clusters = $workspace->ideaClusters()->get();

        return response()->json([
            'data' => [
                'topology' => $topology,
                'nodes' => $nodes,
                'edges' => $edges,
                'clusters' => $clusters,
            ]
        ]);
    }

    public function generate(Workspace $workspace): JsonResponse
    {
        $this->authorize('update', $workspace);

        $notes = $workspace->notes()->get(['id', 'title', 'content']);

        if ($notes->isEmpty()) {
            return response()->json(['message' => 'No notes found in workspace'], 422);
        }

        if (!$this->pythonService->isHealthy()) {
            return response()->json(['message' => 'Graph processing service is unavailable'], 503);
        }

        $result = $this->pythonService->processNotes($workspace->id, $notes->toArray());

        if (!$result) {
            return response()->json(['message' => 'Failed to process graph data'], 500);
        }

        DB::transaction(function () use ($workspace, $result) {
            // Clear existing graph data for this workspace
            GraphNode::where('workspace_id', $workspace->id)->delete();
            GraphEdge::where('workspace_id', $workspace->id)->delete();
            IdeaCluster::where('workspace_id', $workspace->id)->delete();

            // Save clusters
            $clusterMap = [];
            foreach ($result['clusters'] as $clusterData) {
                $cluster = IdeaCluster::create([
                    'workspace_id' => $workspace->id,
                    'name' => $clusterData['name'],
                    'color' => $clusterData['color'],
                    'centroid_note_id' => $clusterData['centroid_note_id'],
                    'note_count' => $clusterData['note_count'],
                ]);
                $clusterMap[$clusterData['id']] = $cluster->id;
            }

            // Save topologies
            foreach ($result['topologies'] as $topologyData) {
                $topology = $topologyData['topology'];

                foreach ($topologyData['nodes'] as $nodeData) {
                    GraphNode::create([
                        'workspace_id' => $workspace->id,
                        'topology' => $topology,
                        'note_id' => $nodeData['note_id'],
                        'x' => $nodeData['x'],
                        'y' => $nodeData['y'],
                        'z' => $nodeData['z'],
                        'size' => $nodeData['size'],
                        'color' => $nodeData['color'],
                        'importance_score' => $nodeData['importance_score'],
                        'idea_cluster_id' => $clusterMap[$nodeData['cluster_id']] ?? null,
                    ]);
                }

                foreach ($topologyData['edges'] as $edgeData) {
                    GraphEdge::create([
                        'workspace_id' => $workspace->id,
                        'topology' => $topology,
                        'source_node_id' => $edgeData['source'],
                        'target_node_id' => $edgeData['target'],
                        'similarity_score' => $edgeData['similarity_score'],
                        'edge_type' => $edgeData['edge_type'],
                    ]);
                }
            }
        });

        return response()->json([
            'message' => 'Graph generated successfully',
            'clusters_count' => count($result['clusters']),
        ]);
    }
}

