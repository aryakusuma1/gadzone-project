<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Daftar tipe gadget
        $gadgetTypes = [
            'Smartphone',
            'Tablet',
            'Laptop',
            'Smartwatch',
            'Earbuds',
            'Gaming Phone',
        ];

        // Generate nama produk yang realistis
        $type = fake()->randomElement($gadgetTypes);
        $series = fake()->randomElement(['Pro Max', 'Ultra', 'Plus', 'Lite', 'SE', 'Air', 'Mini']);
        $model = fake()->randomElement(['X', 'S', 'Z', 'A', 'Note', 'Find', 'Reno']);
        $number = fake()->numberBetween(10, 99);

        $productName = "{$type} {$model}{$number} {$series}";

        return [
            'name' => $productName,
            'slug' => Str::slug($productName) . '-' . fake()->unique()->numberBetween(1000, 9999),
            'description' => fake()->paragraph(3),
            'price' => fake()->randomElement([
                3000000,  // 3 juta
                5000000,  // 5 juta
                7000000,  // 7 juta
                10000000, // 10 juta
                12000000, // 12 juta
                15000000, // 15 juta
                20000000, // 20 juta
            ]),
            'category_id' => Category::factory(), // Auto create category jika belum ada
            'image' => null, // Untuk testing, image bisa null
        ];
    }
}
