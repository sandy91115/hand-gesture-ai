<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WorkspaceController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\GraphController;
use App\Http\Controllers\GraphAnalyticsController;
use App\Http\Controllers\GraphExportController;

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

    // Graph Analytics
    Route::get('/workspaces/{workspace}/graph/analytics', [GraphAnalyticsController::class, 'metrics']);
    Route::get('/workspaces/{workspace}/graph/sentiment', [GraphAnalyticsController::class, 'sentiment']);

    // Graph Export
    Route::get('/workspaces/{workspace}/graph/export', [GraphExportController::class, 'export']);
});

require __DIR__.'/auth.php';

