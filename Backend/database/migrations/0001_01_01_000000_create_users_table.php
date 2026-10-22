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
        Schema::create('role', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('alias')->nullable();
        });

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('surname');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->boolean('isApproved')->default(false);
            $table->foreignId('roleId')->constrained('role')->onDelete('restrict');
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('room', function (Blueprint $table) {
            $table->id();
            $table->string('number');
            $table->boolean('hasPiano')->default(false);
            $table->boolean('isOpen')->default(false);
            $table->dateTime('entryTime')->nullable();
            $table->foreignId('userId')->constrained('users')->onDelete('set null')->nullable();
        });

        Schema::create('student', function (Blueprint $table) {
            $table->id();
            $table->string('idCardPhotoPath')->nullable();
            $table->foreignId('userId')->constrained('users')->onDelete('cascade');
        });

        Schema::create('lecturer', function (Blueprint $table) {
            $table->id();
            $table->string('idCardPhotoPath')->nullable();
            $table->foreignId('accountId')->constrained('users')->onDelete('cascade');
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
        Schema::dropIfExists('role');
        Schema::dropIfExists('student');
        Schema::dropIfExists('lecturer');
    }
};