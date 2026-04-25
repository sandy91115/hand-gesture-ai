<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use App\Http\Requests\WorkspaceRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WorkspaceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $workspaces = $request->user()->workspaces()->withCount('notes')->get();
        return response()->json(['data' => $workspaces]);
    }

    public function store(WorkspaceRequest $request): JsonResponse
    {
        $workspace = $request->user()->workspaces()->create($request->validated());
        return response()->json(['data' => $workspace, 'message' => 'Workspace created successfully'], 201);
    }

    public function show(Workspace $workspace): JsonResponse
    {
        $this->authorize('view', $workspace);
        return response()->json(['data' => $workspace->load('notes')]);
    }

    public function update(WorkspaceRequest $request, Workspace $workspace): JsonResponse
    {
        $this->authorize('update', $workspace);
        $workspace->update($request->validated());
        return response()->json(['data' => $workspace, 'message' => 'Workspace updated successfully']);
    }

    public function destroy(Workspace $workspace): JsonResponse
    {
        $this->authorize('delete', $workspace);
        $workspace->delete();
        return response()->json(['message' => 'Workspace deleted successfully']);
    }
}

