<!DOCTYPE html>
<html>
<head>
    <title>Checkout Receipt</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; }
        h1, h2 { color: #694e4e; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background-color: #694e4e; color: white; }
        .total { color: #b46b8b; font-weight: bold; }
        .footer { margin-top: 20px; font-size: 10px; }
    </style>
</head>
<body>
    <h1>Checkout Receipt</h1>
    <p>Generated on: {{ $date }}</p>

    <h2>Customer Details</h2>
    <p><strong>Name:</strong> {{ $user->first_name }} {{ $user->last_name }}</p>
    <p><strong>Email:</strong> {{ $user->email }}</p>
    <p><strong>Address:</strong> {{ $user->address ?? 'Not provided' }}</p>
    <p><strong>Contact Number:</strong> {{ $user->contact_number ?? 'Not provided' }}</p>
    <p><strong>Birthday:</strong> {{ $user->birthday ?? 'Not provided' }}</p>
    <p><strong>Gender:</strong> {{ $user->gender ? ucfirst($user->gender) : 'Not provided' }}</p>

    <h2>Order Details</h2>
    <table>
        <thead>
            <tr>
                <th>Order ID</th>
                <th>Product Name</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($items as $item)
                <tr>
                    <td>{{ $item->id }}</td>
                    <td>{{ $item->product->title }}</td>
                    <td>{{ $item->quantity }}</td>
                    <td>P{{ number_format($item->price, 2) }}</td>
                    <td>P{{ number_format($item->price * $item->quantity, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <p class="total">Total Amount: P{{ number_format($total_amount, 2) }}</p>

    <p class="footer">Thank you for shopping with TechCart!</p>
</body>
</html>