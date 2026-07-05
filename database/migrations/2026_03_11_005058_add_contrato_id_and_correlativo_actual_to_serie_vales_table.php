<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('serie_vales', function (Blueprint $table) {
            if (! Schema::hasColumn('serie_vales', 'correlativo_actual')) {
                $table->unsignedBigInteger('correlativo_actual')
                    ->nullable()
                    ->after('cantidad');
            }
        });
    }

    public function down(): void
    {
        Schema::table('serie_vales', function (Blueprint $table) {
            if (Schema::hasColumn('serie_vales', 'correlativo_actual')) {
                $table->dropColumn('correlativo_actual');
            }
        });
    }
};
