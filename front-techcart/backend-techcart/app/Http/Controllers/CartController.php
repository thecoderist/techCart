<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $carts = Cart::where('user_id', auth()->id())->get();
        return response()->json(
            $carts->map(function ($cart) {
                return [
                    'id' => $cart->id,
                    'title' => $cart->product->title,
                    'img' => $cart->product->image,
                    'price' => $cart->product->price, 
                    'qty' => $cart->quantity,
                    'stock' => $cart->product->stock,
                ];
            })
        );
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'product_id' => 'required|exists:products,id',
                'quantity' => 'required|integer|min:1',
            ]);

            $product = Product::findOrFail($validated['product_id']);

            if ($validated['quantity'] > $product->stock) {
                return response()->json(['error' => 'Quantity exceeds stock'], 400);
            }

            $cart = Cart::updateOrCreate(
                [
                    'user_id' => Auth::id(),
                    'product_id' => $validated['product_id'],
                ],
                [
                    'quantity' => $validated['quantity'],
                ]
            );

            return response()->json($cart, 201);
        } catch (\Exception $e) {
            Log::error('Cart store failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to add item to cart'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'quantity' => 'required|integer|min:1',
            ]);

            $cart = Cart::where('user_id', Auth::id())->findOrFail($id);
            $product = Product::findOrFail($cart->product_id);

            if ($validated['quantity'] > $product->stock) {
                return response()->json(['error' => 'Quantity exceeds stock'], 400);
            }

            $cart->update(['quantity' => $validated['quantity']]);

            return response()->json($cart);
        } catch (\Exception $e) {
            Log::error('Cart update failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update cart item'], 500);
        }
    }

public function destroy($id)
    {
        try {
            $userId = Auth::id();
            if (!$userId) {
                Log::warning('No authenticated user found for cart destroy request', ['cart_id' => $id]);
                return response()->json(['error' => 'Unauthorized: No authenticated user'], 401);
            }

            $cart = Cart::where('user_id', $userId)->find($id);

            if (!$cart) {
                Log::info('Cart item not found or does not belong to user', ['cart_id' => $id, 'user_id' => $userId]);
                return response()->json(['error' => 'Cart item not found or does not belong to you'], 404);
            }

            $cart->delete();
            Log::info('Cart item deleted successfully', ['cart_id' => $id, 'user_id' => $userId]);

            return response()->json(['message' => 'Item removed from cart']);
        } catch (\Exception $e) {
            Log::error('Cart destroy failed for ID ' . $id . ': ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'stack_trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Failed to remove item from cart',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}