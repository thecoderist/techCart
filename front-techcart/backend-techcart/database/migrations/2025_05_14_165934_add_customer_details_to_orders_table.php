<?php

   use Illuminate\Database\Migrations\Migration;
   use Illuminate\Database\Schema\Blueprint;
   use Illuminate\Support\Facades\Schema;

   class AddCustomerDetailsToOrdersTable extends Migration
   {
       public function up()
       {
           Schema::table('orders', function (Blueprint $table) {
               $table->string('customer_name')->nullable()->after('total');
               $table->string('customer_email')->nullable()->after('customer_name');
               $table->string('customer_address')->nullable()->after('customer_email');
               $table->string('customer_contact')->nullable()->after('customer_address');
               $table->date('customer_birthday')->nullable()->after('customer_contact');
               $table->string('customer_gender')->nullable()->after('customer_birthday');
           });
       }

       public function down()
       {
           Schema::table('orders', function (Blueprint $table) {
               $table->dropColumn([
                   'customer_name',
                   'customer_email',
                   'customer_address',
                   'customer_contact',
                   'customer_birthday',
                   'customer_gender',
               ]);
           });
       }
   }