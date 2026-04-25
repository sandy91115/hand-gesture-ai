<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PythonService
{
    protected string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = env('PYTHON_SERVICE_URL', 'http://localhost:8000');
    }

    public function processNotes(int $workspaceId, array $notes): ?array
    {
        try {
            $response = Http::timeout(120)
                ->post("{$this->baseUrl}/process-notes", [
                    'workspace_id' => $workspaceId,
                    'notes' => $notes,
                ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Python service error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Python service connection failed', ['error' => $e->getMessage()]);
            return null;
        }
    }

    public function isHealthy(): bool
    {
        try {
            $response = Http::timeout(5)->get("{$this->baseUrl}/health");
            return $response->successful();
        } catch (\Exception $e) {
            return false;
        }
    }
}

