<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    // ============================================
    // TEST CREATE PRODUCT (Store)
    // ============================================

    /** @test */
    public function user_dapat_membuat_produk_dengan_data_valid()
    {
        // Arrange
        $user = User::factory()->create();
        $category = Category::factory()->create(['name' => 'Samsung']);

        // Act
        /** @var \App\Models\User $user */
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/products', [
                'name' => 'Samsung Galaxy S25 Ultra',
                'description' => 'Smartphone flagship dengan layar 6.8 inch dan kamera 200MP',
                'price' => 15000000,
                'category_id' => $category->id
            ]);

        // Assert
        $response->assertStatus(201)
                 ->assertJson([
                     'success' => true,
                     'message' => 'Product created successfully'
                 ])
                 ->assertJsonStructure([
                     'success',
                     'message',
                     'data' => [
                         'id',
                         'name',
                         'slug',
                         'description',
                         'price',
                         'category_id',
                         'created_at',
                         'updated_at'
                     ]
                 ]);

        $this->assertDatabaseHas('products', [
            'name' => 'Samsung Galaxy S25 Ultra',
            'price' => 15000000,
            'category_id' => $category->id
        ]);
    }

    /** @test */
    public function user_dapat_membuat_produk_dengan_gambar()
    {
        // Arrange
        Storage::fake('public'); // Mock the public disk
        $user = User::factory()->create();
        $category = Category::factory()->create(['name' => 'Electronics']);
        $image = UploadedFile::fake()->image('product.jpg', 1000, 1000)->size(500); // 500KB image

        // Act
        /** @var \App\Models\User $user */
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/products', [
                'name' => 'Smartphone with Camera',
                'description' => 'A great smartphone for photos',
                'price' => 10000000,
                'category_id' => $category->id,
                'image' => $image,
            ]);

        // Assert
        $response->assertStatus(201)
                 ->assertJson([
                     'success' => true,
                     'message' => 'Product created successfully'
                 ]);

        $productDataInDb = Product::where('name', 'Smartphone with Camera')->first();
        $this->assertNotNull($productDataInDb);
        $this->assertNotNull($productDataInDb->image);

        // Assert the image was stored
        Storage::disk('public')->assertExists($productDataInDb->image);
    }

    /** @test */
    public function create_produk_tanpa_autentikasi_harus_gagal()
    {
        // Arrange
        $category = Category::factory()->create();

        // Act (tanpa login)
        $response = $this->postJson('/api/products', [
            'name' => 'iPhone 15 Pro Max',
            'description' => 'Test product',
            'price' => 20000000,
            'category_id' => $category->id
        ]);

        // Assert
        $response->assertStatus(401);
    }

    /** @test */
    public function create_produk_tanpa_nama_harus_gagal_validasi()
    {
        // Arrange
        $user = User::factory()->create();
        $category = Category::factory()->create();

        // Act
         /** @var \App\Models\User $user */
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/products', [
                // 'name' => '', // nama kosong
                'description' => 'Test description',
                'price' => 5000000,
                'category_id' => $category->id
            ]);

        // Assert
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['name']);
    }

    /** @test */
    public function create_produk_dengan_harga_invalid_harus_gagal()
    {
        // Arrange
        $user = User::factory()->create();
        $category = Category::factory()->create();

        // Act
         /** @var \App\Models\User $user */
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/products', [
                'name' => 'Test Product',
                'description' => 'Test description',
                'price' => -1000, // harga negatif
                'category_id' => $category->id
            ]);

        // Assert
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['price']);
    }

    // ============================================
    // TEST READ PRODUCTS (Index)
    // ============================================

    /** @test */
    public function user_dapat_melihat_semua_produk()
    {
        // Arrange
        $user = User::factory()->create();
        $category = Category::factory()->create(['name' => 'Samsung']);

        Product::factory()->create([
            'name' => 'Samsung Galaxy S25 Ultra',
            'category_id' => $category->id
        ]);
        Product::factory()->create([
            'name' => 'Samsung Galaxy Tab S9',
            'category_id' => $category->id
        ]);

        // Act
         /** @var \App\Models\User $user */
        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/products');

        // Assert
        $response->assertStatus(200)
                 ->assertJson(['success' => true])
                 ->assertJsonCount(2, 'data')
                 ->assertJsonStructure([
                     'success',
                     'data' => [
                         '*' => [
                             'id',
                             'name',
                             'slug',
                             'description',
                             'price',
                             'category_id',
                             'category' => [
                                 'id',
                                 'name',
                                 'slug'
                             ]
                         ]
                     ]
                 ]);
    }

    /** @test */
    public function user_dapat_melihat_detail_produk()
    {
        // Arrange
        $user = User::factory()->create();
        $category = Category::factory()->create(['name' => 'Apple']);
        $product = Product::factory()->create([
            'name' => 'iPhone 15 Pro Max',
            'price' => 20000000,
            'category_id' => $category->id
        ]);

        // Act
         /** @var \App\Models\User $user */
        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/products/{$product->id}");

        // Assert
        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'data' => [
                         'id' => $product->id,
                         'name' => 'iPhone 15 Pro Max',
                         'price' => 20000000
                     ]
                 ])
                 ->assertJsonStructure([
                     'success',
                     'data' => [
                         'id',
                         'name',
                         'slug',
                         'description',
                         'price',
                         'category'
                     ]
                 ]);
    }

    /** @test */
    public function melihat_produk_tidak_ditemukan_harus_return_404()
    {
        // Arrange
        $user = User::factory()->create();

        // Act
         /** @var \App\Models\User $user */
        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/products/99999');

        // Assert
        $response->assertStatus(404)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Product not found'
                 ]);
    }

    // ============================================
    // TEST UPDATE PRODUCT
    // ============================================

    /** @test */
    public function user_dapat_update_produk()
    {
        // Arrange
        $user = User::factory()->create();
        $category = Category::factory()->create(['name' => 'Oppo']);
        $product = Product::factory()->create([
            'name' => 'Oppo Find X5 Pro',
            'price' => 10000000,
            'category_id' => $category->id
        ]);

        // Act
         /** @var \App\Models\User $user */
        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/products/{$product->id}", [
                'name' => 'Oppo Find X7 Ultra',
                'description' => 'Updated description',
                'price' => 12000000,
                'category_id' => $category->id
            ]);

        // Assert
        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'message' => 'Product updated successfully'
                 ]);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Oppo Find X7 Ultra',
            'price' => 12000000
        ]);

        $this->assertDatabaseMissing('products', [
            'id' => $product->id,
            'name' => 'Oppo Find X5 Pro'
        ]);
    }

    /** @test */
    public function update_produk_tidak_ditemukan_harus_return_404()
    {
        // Arrange
        $user = User::factory()->create();
        $category = Category::factory()->create();

        // Act
         /** @var \App\Models\User $user */
        $response = $this->actingAs($user, 'sanctum')
            ->putJson('/api/products/99999', [
                'name' => 'Updated Name',
                'description' => 'Updated description',
                'price' => 5000000,
                'category_id' => $category->id
            ]);

        // Assert
        $response->assertStatus(404)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Product not found'
                 ]);
    }

    // ============================================
    // TEST DELETE PRODUCT
    // ============================================

    /** @test */
    public function user_dapat_hapus_produk()
    {
        // Arrange
        $user = User::factory()->create();
        $category = Category::factory()->create(['name' => 'Xiaomi']);
        $product = Product::factory()->create([
            'name' => 'Xiaomi 14 Ultra',
            'category_id' => $category->id
        ]);

        // Act
         /** @var \App\Models\User $user */
        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/products/{$product->id}");

        // Assert
        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'message' => 'Product deleted successfully'
                 ]);

        $this->assertDatabaseMissing('products', [
            'id' => $product->id
        ]);
    }

    /** @test */
    public function delete_produk_tidak_ditemukan_harus_return_404()
    {
        // Arrange
        $user = User::factory()->create();

        // Act
        /** @var \App\Models\User $user */
        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson('/api/products/99999');

        // Assert
        $response->assertStatus(404)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Product not found'
                 ]);
    }

    /** @test */
    public function delete_produk_tanpa_autentikasi_harus_gagal()
    {
        // Arrange
        $product = Product::factory()->create();

        // Act (tanpa login)
        $response = $this->deleteJson("/api/products/{$product->id}");

        // Assert
        $response->assertStatus(401);
    }
}