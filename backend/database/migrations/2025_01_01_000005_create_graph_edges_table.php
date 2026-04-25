<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('graph_edges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->onDelete('cascade');
            $table->enum('topology', ['centralized', 'decentralized', 'distributed']);
            $table->foreignId('source_node_id')->constrained('notes')->onDelete('cascade');
            $table->foreignId('target_node_id')->constrained('notes')->onDelete('cascade');
            $table->float('similarity_score')->default(0);
            $table->string('edge_type', 20)->default('semantic');
            $table->timestamps();
            
            $table->index(['workspace_id', 'topology']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('graph_edges');
    }
};

