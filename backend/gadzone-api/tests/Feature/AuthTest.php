<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    // ============================================
    // TEST REGISTRATION
    // ============================================

    /** @test */
    public function user_dapat_register_dengan_data_valid()
    {
        // Arrange
        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        // Act
        $response = $this->postJson('/api/register', $userData);

        // Assert
        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user' => ['id', 'name', 'email'],
                    'token',
                    'token_type'
                ]
            ])
            ->assertJson([
                'success' => true,
                'message' => 'User registered successfully',
                'data' => [
                    'user' => [
                        'name' => 'Test User',
                        'email' => 'test@example.com',
                    ],
                    'token_type' => 'Bearer'
                ]
            ]);

        $this->assertDatabaseHas('users', [
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
    }

    /** @test */
    public function register_gagal_jika_email_sudah_ada()
    {
        // Arrange
        User::factory()->create(['email' => 'test@example.com']);

        $userData = [
            'name' => 'Another User',
            'email' => 'test@example.com', // email yang sama
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        // Act
        $response = $this->postJson('/api/register', $userData);

        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /** @test */
    public function register_gagal_jika_password_tidak_match()
    {
        // Arrange
        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'wrongpassword', // konfirmasi salah
        ];

        // Act
        $response = $this->postJson('/api/register', $userData);

        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /** @test */
    public function register_gagal_tanpa_nama_atau_email()
    {
        // Act
        $response = $this->postJson('/api/register', [
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email']);
    }

    // ============================================
    // TEST LOGIN
    // ============================================

    /** @test */
    public function user_dapat_login_dengan_kredensial_valid()
    {
        // Arrange
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);

        $loginData = [
            'email' => 'test@example.com',
            'password' => 'password123',
        ];

        // Act
        $response = $this->postJson('/api/login', $loginData);

        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user' => ['id', 'name', 'email'],
                    'token',
                    'token_type'
                ]
            ])
            ->assertJson([
                'success' => true,
                'message' => 'Login successful',
            ]);
    }

    /** @test */
    public function login_gagal_dengan_password_salah()
    {
        // Arrange
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);

        $loginData = [
            'email' => 'test@example.com',
            'password' => 'wrongpassword', // password salah
        ];

        // Act
        $response = $this->postJson('/api/login', $loginData);

        // Assert
        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Invalid credentials',
            ]);
    }

    /** @test */
    public function login_gagal_jika_user_tidak_ada()
    {
        // Arrange
        $loginData = [
            'email' => 'nouser@example.com',
            'password' => 'password123',
        ];

        // Act
        $response = $this->postJson('/api/login', $loginData);

        // Assert
        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Invalid credentials',
            ]);
    }

    /** @test */
    public function user_yang_sudah_login_dapat_logout()
    {
        // Arrange
        $user = User::factory()->create();
        /** @var \App\Models\User $user */
        $token = $user->createToken('auth_token')->plainTextToken;
        $headers = ['Authorization' => "Bearer $token"];

        // Act
        $response = $this->postJson('/api/logout', [], $headers);

        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Logged out successfully',
            ]);
    }
}
