<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GraphNode extends Model
{
    use HasFactory;

    protected $fillable = [
        'workspace_id',
        'topology',
        'note_id',
        'x',
        'y',
        'z',
        'size',
        'color',
        'importance_score',
        'idea_cluster_id',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function note(): BelongsTo
    {
        return $this->belongsTo(Note::class);
    }

    public function ideaCluster(): BelongsTo
    {
        return $this->belongsTo(IdeaCluster::class);
    }
}

