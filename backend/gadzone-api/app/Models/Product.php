<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    // Menambahkan kolom yang boleh diubah melalui mass assignment
    protected $fillable = ['name', 'slug', 'description', 'price', 'image', 'category_id'];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'integer',
    ];


    // Relasi dengan Category
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}

