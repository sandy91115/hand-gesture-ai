<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use App\Models\Workspace;
use App\Policies\WorkspacePolicy;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::policy(Workspace::class, WorkspacePolicy::class);
    }
}
