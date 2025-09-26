<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    // Menampilkan semua kategori
    public function index()
    {
        $categories = Category::all();
        return response()->json([
            'success' => true,
            'data' => $categories,
        ], 200);
    }

    // Menyimpan kategori baru
    public function store(Request $request)
    {
        $request->validate(['name' => 'required']);
        $category = Category::create($request->all());
        return response()->json([
            'success' => true,
            'data' => $category
        ], 201); // HTTP 201 Created
    }

    // Menampilkan kategori berdasarkan ID
    public function show($id)
    {
        $category = Category::find($id);
        if ($category) {
            return response()->json(['success' => true, 'data' => $category], 200);
        }
        return response()->json(['success' => false, 'message' => 'Category not found'], 404);
    }

    // Mengupdate kategori berdasarkan ID
    public function update(Request $request, $id)
    {
        $request->validate(['name' => 'required']);
        $category = Category::find($id);
        if ($category) {
            $category->update($request->all());
            return response()->json(['success' => true, 'data' => $category], 200);
        }
        return response()->json(['success' => false, 'message' => 'Category not found'], 404);
    }

    // Menghapus kategori berdasarkan ID
    public function destroy($id)
    {
        $category = Category::find($id);
        if ($category) {
            $category->delete();
            return response()->json(['success' => true, 'message' => 'Category deleted'], 200);
        }
        return response()->json(['success' => false, 'message' => 'Category not found'], 404);
    }
}