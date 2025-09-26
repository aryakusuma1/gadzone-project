<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\AuthController;

// ===========================================
// AUTHENTICATION ROUTES (Public)
// ===========================================
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

// ===========================================
// PROTECTED ROUTES (Perlu Login)
// ===========================================
Route::middleware('auth:sanctum')->group(function () {

    // Auth endpoints
    Route::get('me', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('logout-all', [AuthController::class, 'logoutAll']);

    // Categories & Products (CRUD)
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('products', ProductController::class);

});

// ===========================================
// PUBLIC ROUTES (Tanpa Login)
// ===========================================
// User bisa lihat produk/kategori tanpa login (read-only)
Route::get('categories-public', [CategoryController::class, 'index']);
Route::get('products-public', [ProductController::class, 'index']);
Route::get('categories-public/{id}', [CategoryController::class, 'show']);
Route::get('products-public/{id}', [ProductController::class, 'show']);
