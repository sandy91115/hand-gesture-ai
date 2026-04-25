<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WorkspaceController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\GraphController;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Workspaces
    Route::apiResource('workspaces', WorkspaceController::class);

    // Notes
    Route::get('/workspaces/{workspace}/notes', [NoteController::class, 'index']);
    Route::post('/workspaces/{workspace}/notes', [NoteController::class, 'store']);
    Route::post('/workspaces/{workspace}/notes/upload', [NoteController::class, 'upload']);
    Route::get('/workspaces/{workspace}/notes/{note}', [NoteController::class, 'show']);
    Route::put('/workspaces/{workspace}/notes/{note}', [NoteController::class, 'update']);
    Route::delete('/workspaces/{workspace}/notes/{note}', [NoteController::class, 'destroy']);

    // Graph
    Route::get('/workspaces/{workspace}/graph', [GraphController::class, 'index']);
    Route::post('/workspaces/{workspace}/graph/generate', [GraphController::class, 'generate']);
});

require __DIR__.'/auth.php';

