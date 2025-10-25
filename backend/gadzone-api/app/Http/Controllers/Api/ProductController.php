<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    // Menampilkan semua produk beserta kategori
    public function index()
    {
        $products = Product::with('category')->get();

        // Tambahkan URL gambar untuk setiap produk
        $products->transform(function ($product) {
            if ($product->image) {
                $product->image_url = asset('storage/' . $product->image);
            }
            return $product;
        });

        return response()->json([
            'success' => true,
            'data' => $products
        ], 200);
    }

    // Menyimpan produk baru
    public function store(Request $request)
    {
        // Validasi input
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|integer|min:1|max:999999999',
            'category_id' => 'required|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:2048', // Max 2MB
        ]);

        $data = $request->only(['name', 'description', 'price', 'category_id']);

        // Membuat slug secara otomatis dari nama produk
        $slug = Str::slug($request->name);
        $originalSlug = $slug;
        $count = 1;

        // Memastikan slug unik
        while (Product::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count++;
        }
        $data['slug'] = $slug; // Tambahkan slug ke data

        // Handle file upload
        if ($request->hasFile('image')) {
            $data['image'] = $this->uploadImage($request->file('image'));
        }

        $product = Product::create($data);

        if ($product->image) {
            $product->image_url = asset('storage/' . $product->image);
        }

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully',
            'data' => $product
        ], 201);
    }

    // Menampilkan produk berdasarkan ID
    public function show($id)
    {
        $product = Product::with('category')->find($id);
        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Product not found'], 404);
        }

        // Tambahkan URL gambar untuk response
        if ($product->image) {
            $product->image_url = asset('storage/' . $product->image);
        }

        return response()->json(['success' => true, 'data' => $product], 200);
    }

    // Mengupdate produk berdasarkan ID
    public function update(Request $request, $id)
    {
        // Validasi input
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|integer|min:1|max:999999999',
            'category_id' => 'required|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:2048', // Max 2MB
        ]);

        $product = Product::find($id);
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }

                    $data = $request->only(['name', 'description', 'price', 'category_id']);
        
            // Handle file upload
            if ($request->hasFile('image')) {
                // Hapus gambar lama jika ada
                if ($product->image && Storage::disk('public')->exists($product->image)) {
                    Storage::disk('public')->delete($product->image);
                }

                $data['image'] = $this->uploadImage($request->file('image'));
            }
        $product->update($data);

        // Load relasi kategori untuk response
        $product->load('category');

        // Tambahkan URL gambar untuk response
        if ($product->image) {
            $product->image_url = asset('storage/' . $product->image);
        }

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully',
            'data' => $product
        ], 200);
    }

    // Menghapus produk berdasarkan ID
    public function destroy($id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }

        // Hapus gambar jika ada
        if ($product->image && Storage::disk('public')->exists($product->image)) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully'
        ], 200);
    }

    // ===========================================
    // PRIVATE HELPER METHODS
    // ===========================================

    /**
     * Upload gambar produk ke storage
     *
     * @param \Illuminate\Http\UploadedFile $file
     * @return string
     */
    private function uploadImage($file)
    {
        // Generate nama file unik
        $timestamp = now()->timestamp;
        $extension = $file->getClientOriginalExtension();
        $filename = $timestamp . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $extension;

        // Upload ke storage/app/public/products/
        $path = $file->storeAs('products', $filename, 'public');

        return $path;
    }
}