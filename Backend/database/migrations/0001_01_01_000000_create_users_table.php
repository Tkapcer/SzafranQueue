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
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('alias')->nullable();
            $table->boolean('is_selectable')->default(false);
        });

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('surname');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->boolean('is_approved')->default(false);
            $table->foreignId('role_id')->constrained('roles')->onDelete('restrict');
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('room', function (Blueprint $table) {
            $table->id();
            $table->string('number');
            $table->boolean('has_piano')->default(false);
            $table->boolean('is_open')->default(false);
            $table->dateTime('entry_time')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
        });

        Schema::create('student', function (Blueprint $table) {
            $table->id();
            $table->string('id_card_photo_path')->nullable();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
        });

        Schema::create('lecturer', function (Blueprint $table) {
            $table->id();
            $table->string('id_card_photo_path')->nullable();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('room');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('student');
        Schema::dropIfExists('lecturer');
    }
};
