<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('language', 10)->default('en');
            $table->string('timezone', 50)->default('UTC');
            $table->string('date_format', 20)->default('Y-m-d');
            $table->string('time_format', 2)->default('24');
            $table->string('currency_symbol', 5)->default('$');
            $table->boolean('email_notifications')->default(true);
            $table->boolean('push_notifications')->default(true);
            $table->boolean('sale_notifications')->default(true);
            $table->boolean('purchase_notifications')->default(true);
            $table->boolean('low_stock_alerts')->default(true);
            $table->enum('profile_visibility', ['public', 'private'])->default('public');
            $table->boolean('show_email')->default(false);
            $table->boolean('show_phone')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_settings');
    }
};
