<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('motoristas', function (Blueprint $table) {
            $table->string('dui')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('motoristas', function (Blueprint $table) {
            $table->string('dui')->nullable(false)->change();
        });
    }
};
