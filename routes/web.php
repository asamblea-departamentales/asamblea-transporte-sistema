<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);


Route::get('/', function () {
    return redirect('/admin');
});

Route::get('/login', function () {
    return response()->json(['message' => 'Please login via API'], 401);
})->name('login');