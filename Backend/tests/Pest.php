<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

use App\Models\Role;
use App\Models\Room;
use App\Models\User;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind a different classes or traits.
|
*/

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('UnitTests', 'IntegrationTests', 'SecurityTests', 'EndpointTest');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

function roleWithId(int $id): Role
{
    $names = [1 => 'Manager', 2 => 'Student', 3 => 'Lecturer'];

    return Role::find($id) ?? Role::forceCreate([
        'id' => $id,
        'name' => $names[$id],
        'alias' => strtolower($names[$id]),
        'is_selectable' => $id !== 1,
    ]);
}

function makeUser(int $roleId, string $email, array $overrides = []): User
{
    return User::create(array_merge([
        'name' => 'Jan',
        'surname' => 'Kowalski',
        'email' => $email,
        'password' => 'password123',
        'role_id' => roleWithId($roleId)->id,
        'is_approved' => true,
        'is_active' => true,
    ], $overrides));
}

function makeManager(): User  { return makeUser(1, 'manager@example.com'); }
function makeStudent(string $email = 'student@example.com'): User { return makeUser(2, $email); }
function makeLecturer(): User { return makeUser(3, 'lecturer@example.com'); }

function makeRoom(array $overrides = []): Room
{
    return Room::create(array_merge([
        'number' => '101',
        'has_piano' => false,
        'is_open' => true,
        'status' => 'free',
    ], $overrides));
}

function registrationPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Jan',
        'surname' => 'Kowalski',
        'email' => 'jan@example.com',
        'password' => 'password123',
        'role_id' => roleWithId(2)->id,
    ], $overrides);
}
