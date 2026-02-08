<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('/admin');
});

// ✅ TEMPORAL: Registrar POST login manualmente para Filament
//Route::post('admin/login', function () {
 //   return app(\Filament\Http\Controllers\Auth\LoginController::class)->store();
//})->name('filament.admin.auth.login.post');