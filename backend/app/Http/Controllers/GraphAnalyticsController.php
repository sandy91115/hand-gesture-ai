<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use App\Services\PythonService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GraphAnalyticsController extends Controller
{
    public function __construct(
        protected PythonService $pythonService
    ) {}

    public function metrics(Request $request, Workspace $workspace): JsonResponse
    {
        $this->authorize('view', $workspace);

        $topology = $request->validate([
            'topology' => ['required', 'in:centralized,decentralized,distributed'],
        ])['topology'];

        $nodes = $workspace->graphNodes()
            ->where('topology', $topology)
            ->get()
            ->map(fn ($n) => [
                'id' => $n->id,
                'note_id' => $n->note_id,
                'x' => $n->x,
                'y' => $n->y,
                'z' => $n->z,
                'size' => $n->size,
                'color' => $n->color,
                'cluster_id' => $n->idea_cluster_id,
                'importance_score' => $n->importance_score,
            ])
            ->toArray();

        $edges = $workspace->graphEdges()
            ->where('topology', $topology)
            ->get()
            ->map(fn ($e) => [
                'source' => $e->source_node_id,
                'target' => $e->target_node_id,
                'similarity_score' => $e->similarity_score,
                'edge_type' => $e->edge_type,
            ])
            ->toArray();

        if (empty($nodes)) {
            return response()->json(['message' => 'No graph data found for this topology'], 404);
        }

        $metrics = $this->pythonService->computeGraphMetrics($workspace->id, $nodes, $edges);

        if (!$metrics) {
            return response()->json(['message' => 'Failed to compute graph metrics'], 500);
        }

        return response()->json(['data' => $metrics]);
    }

    public function sentiment(Request $request, Workspace $workspace): JsonResponse
    {
        $this->authorize('view', $workspace);

        $notes = $workspace->notes()
            ->get(['id', 'title', 'content'])
            ->map(fn ($n) => [
                'id' => $n->id,
                'title' => $n->title,
                'content' => $n->content,
            ])
            ->toArray();

        if (empty($notes)) {
            return response()->json(['message' => 'No notes found in workspace'], 404);
        }

        // Get cluster labels from graph nodes
        $labels = [];
        $nodeLabels = $workspace->graphNodes()
            ->select('note_id', 'idea_cluster_id')
            ->distinct()
            ->get()
            ->pluck('idea_cluster_id', 'note_id')
            ->toArray();

        foreach ($notes as $note) {
            $labels[] = $nodeLabels[$note['id']] ?? 0;
        }

        $result = $this->pythonService->analyzeSentiment($workspace->id, $notes, $labels);

        if (!$result) {
            return response()->json(['message' => 'Failed to analyze sentiment'], 500);
        }

        return response()->json(['data' => $result]);
    }
}

