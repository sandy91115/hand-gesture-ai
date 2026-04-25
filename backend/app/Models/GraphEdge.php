<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GraphEdge extends Model
{
    use HasFactory;

    protected $fillable = [
        'workspace_id',
        'topology',
        'source_node_id',
        'target_node_id',
        'similarity_score',
        'edge_type',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function sourceNode(): BelongsTo
    {
        return $this->belongsTo(Note::class, 'source_node_id');
    }

    public function targetNode(): BelongsTo
    {
        return $this->belongsTo(Note::class, 'target_node_id');
    }
}

