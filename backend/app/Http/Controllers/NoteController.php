<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use App\Models\Note;
use App\Http\Requests\NoteRequest;
use App\Http\Requests\UploadNotesRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class NoteController extends Controller
{
    public function index(Workspace $workspace): JsonResponse
    {
        $this->authorize('view', $workspace);
        $notes = $workspace->notes()->get();
        return response()->json(['data' => $notes]);
    }

    public function store(NoteRequest $request, Workspace $workspace): JsonResponse
    {
        $this->authorize('update', $workspace);
        $note = $workspace->notes()->create($request->validated());
        return response()->json(['data' => $note, 'message' => 'Note created successfully'], 201);
    }

    public function show(Workspace $workspace, Note $note): JsonResponse
    {
        $this->authorize('view', $workspace);
        return response()->json(['data' => $note]);
    }

    public function update(NoteRequest $request, Workspace $workspace, Note $note): JsonResponse
    {
        $this->authorize('update', $workspace);
        $note->update($request->validated());
        return response()->json(['data' => $note, 'message' => 'Note updated successfully']);
    }

    public function destroy(Workspace $workspace, Note $note): JsonResponse
    {
        $this->authorize('update', $workspace);
        $note->delete();
        return response()->json(['message' => 'Note deleted successfully']);
    }

    public function upload(UploadNotesRequest $request, Workspace $workspace): JsonResponse
    {
        $this->authorize('update', $workspace);

        $file = $request->file('file');
        $delimiter = $request->input('delimiter', '---');
        $content = file_get_contents($file->getRealPath());
        
        $parts = array_filter(array_map('trim', explode($delimiter, $content)));
        $notes = [];
        
        foreach ($parts as $index => $part) {
            $lines = explode("\n", $part, 2);
            $title = trim($lines[0] ?? "Note {$index}");
            $noteContent = trim($lines[1] ?? $part);
            
            $notes[] = $workspace->notes()->create([
                'title' => $title,
                'content' => $noteContent,
            ]);
        }

        return response()->json([
            'data' => $notes,
            'message' => count($notes) . ' notes created from file',
        ], 201);
    }
}

