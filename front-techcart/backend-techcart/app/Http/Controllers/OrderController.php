<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function checkout(Request $request)
    {
        $user = $request->user();

        DB::beginTransaction();

        try {
            $cartItems = Cart::where('user_id', $user->id)->get();

            if ($cartItems->isEmpty()) {
                return response()->json(['message' => 'Cart is empty'], 400);
            }

            $order = Order::create([
                'user_id' => $user->id,
                'total' => 0,
                'customer_name' => $user->first_name . ' ' . $user->last_name,
                'customer_email' => $user->email,
                'customer_address' => $user->address ?? '',
                'customer_contact' => $user->contact_number ?? '',
                'customer_birthday' => $user->birthday ?? null,
                'customer_gender' => $user->gender ?? '',
            ]);

            $totalAmount = 0;

            foreach ($cartItems as $item) {
                $product = Product::findOrFail($item->product_id);

                if ($product->stock < $item->quantity) {
                    return response()->json(['message' => 'Insufficient stock for product: ' . $product->title], 400);
                }

                $product->stock -= $item->quantity;
                $product->save();

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => $product->price,
                ]);

                $totalAmount += $product->price * $item->quantity;
            }

            $order->total = $totalAmount;
            $order->save();

            Cart::where('user_id', $user->id)->delete();

            DB::commit();

            return response()->json([
                'message' => 'Order placed successfully',
                'order_id' => $order->id,
                'total' => $totalAmount,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Checkout failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show($id)
    {
        $order = Order::with('items.product')->findOrFail($id);

        if ($order->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'order_id' => $order->id,
            'total' => $order->total,
            'items' => $order->items->map(function ($item) {
                return [
                    'product_name' => $item->product->title,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'total_price' => $item->price * $item->quantity,
                ];
            }),
            'customer' => [
                'name' => $order->customer_name,
                'email' => $order->customer_email,
                'address' => $order->customer_address,
                'contact' => $order->customer_contact,
                'birthday' => $order->customer_birthday,
                'gender' => $order->customer_gender,
            ],
        ]);
    }

    public function index(Request $request)
    {
        $user = auth()->user();
        
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $orders = Order::with('items.product')->get();

        $transformedOrders = $orders->map(function ($order) {
            return [
                'order_id' => $order->id,
                'customer' => [
                    'name' => $order->customer_name,
                    'email' => $order->customer_email,
                    'address' => $order->customer_address,
                    'contact' => $order->customer_contact,
                    'birthday' => $order->customer_birthday,
                    'gender' => $order->customer_gender,
                ],
                'items' => $order->items->map(function ($item) {
                    return [
                        'product_id' => $item->product_id,
                        'product_name' => $item->product->title,
                        'quantity' => $item->quantity,
                        'price' => $item->price,
                        'total_price' => $item->price * $item->quantity,
                    ];
                }),
                'total' => $order->total,
                'created_at' => $order->created_at->toISOString(),
            ];
        });

        return response()->json($transformedOrders);
    }
}