<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class GraphExportController extends Controller
{
    public function export(Request $request, Workspace $workspace): JsonResponse|Response
    {
        $this->authorize('view', $workspace);

        $data = $request->validate([
            'topology' => ['required', 'in:centralized,decentralized,distributed'],
            'format' => ['required', 'in:json,csv'],
        ]);

        $topology = $data['topology'];
        $format = $data['format'];

        $nodes = $workspace->graphNodes()
            ->where('topology', $topology)
            ->with(['note', 'ideaCluster'])
            ->get();

        $edges = $workspace->graphEdges()
            ->where('topology', $topology)
            ->get();

        $clusters = $workspace->ideaClusters()
            ->get();

        if ($nodes->isEmpty()) {
            return response()->json(['message' => 'No graph data to export'], 404);
        }

        if ($format === 'json') {
            return response()->json([
                'workspace' => [
                    'id' => $workspace->id,
                    'name' => $workspace->name,
                ],
                'topology' => $topology,
                'exported_at' => now()->toIso8601String(),
                'nodes' => $nodes,
                'edges' => $edges,
                'clusters' => $clusters,
            ]);
        }

        if ($format === 'csv') {
            $csv = "type,id,title,cluster,x,y,z,size,color,importance_score\n";
            foreach ($nodes as $n) {
                $csv .= sprintf(
                    "node,%d,\"%s\",\"%s\",%.4f,%.4f,%.4f,%.4f,\"%s\",%.4f\n",
                    $n->id,
                    str_replace('"', '""', $n->note->title ?? ''),
                    str_replace('"', '""', $n->ideaCluster->name ?? 'General'),
                    $n->x,
                    $n->y,
                    $n->z,
                    $n->size,
                    $n->color,
                    $n->importance_score
                );
            }
            foreach ($edges as $e) {
                $csv .= sprintf(
                    "edge,%d->%d,,,%.4f,%.4f,%.4f,,,%.4f\n",
                    $e->source_node_id,
                    $e->target_node_id,
                    $e->similarity_score,
                    0,
                    0,
                    $e->similarity_score
                );
            }

            return response($csv, 200, [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="mindmesh-' . $workspace->id . '-' . $topology . '.csv"',
            ]);
        }

        return response()->json(['message' => 'Unsupported format'], 400);
    }
}

