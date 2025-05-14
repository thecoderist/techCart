<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        try {
            $search = $request->query('search', '');
            Log::info('Product index called, search: ' . $search);

            $products = Product::query()
                ->when($search, function ($query, $search) {
                    return $query->where('title', 'like', "%{$search}%")
                                ->orWhere('description', 'like', "%{$search}%");
                })
                ->get();

            // Add full image URL to each product
            $products->transform(function ($product) {
                $product->image_url = $product->image ? asset('storage/' . $product->image) : null;
                return $product;
            });

            return response()->json($products);
        } catch (\Exception $e) {
            Log::error('Product index failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch products'], 500);
        }
    }

    public function show($id)
    {
        try {
            $product = Product::findOrFail($id);
            $product->image_url = $product->image ? asset('storage/' . $product->image) : null;
            return response()->json($product);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Product not found'], 404);
        } catch (\Exception $e) {
            Log::error('Product show failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch product'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'price' => 'required|numeric|min:0',
                'stock' => 'required|integer|min:0',
                'image' => 'nullable|image|max:2048',
            ]);

            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('products', 'public');
                $validated['image'] = $path;
            }

            $product = Product::create($validated);
            $product->image_url = $product->image ? asset('storage/' . $product->image) : null;

            return response()->json($product, 201);
        } catch (\Exception $e) {
            Log::error('Product store failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to add product'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'price' => 'required|numeric',
                'stock' => 'required|integer',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            ]);

            $product = Product::findOrFail($id);

            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('products', 'public');
                $validated['image'] = $imagePath;
            }

            $product->update($validated);
            $product->image_url = $product->image ? asset('storage/' . $product->image) : null;

            return response()->json($product);
        } catch (\Throwable $th) {
            Log::error("Product update failed: " . $th->getMessage());
            return response()->json(['error' => 'Failed to update product'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $product = Product::findOrFail($id);

            if ($product->image && Storage::disk('public')->exists($product->image)) {
                Storage::disk('public')->delete($product->image);
            }

            $product->delete();

            return response()->json(['message' => 'Product deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Product delete failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete product'], 500);
        }
    }
}
