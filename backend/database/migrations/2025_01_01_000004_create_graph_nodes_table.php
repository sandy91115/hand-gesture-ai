<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('graph_nodes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->onDelete('cascade');
            $table->enum('topology', ['centralized', 'decentralized', 'distributed']);
            $table->foreignId('note_id')->constrained()->onDelete('cascade');
            $table->float('x');
            $table->float('y');
            $table->float('z');
            $table->float('size');
            $table->string('color', 7)->default('#00aaff');
            $table->float('importance_score')->default(0);
            $table->foreignId('idea_cluster_id')->nullable()->constrained('idea_clusters')->onDelete('set null');
            $table->timestamps();
            
            $table->index(['workspace_id', 'topology']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('graph_nodes');
    }
};

