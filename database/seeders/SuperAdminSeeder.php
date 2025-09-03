<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        // create super admin
        $super_admin_user = User::create([
            'name' => 'super admin',
            'user_name' => 'superadmin',
            'email' => 'superadmin@inv.com',
            'password' => Hash::make('**inv**'),
        ]);

        // assing this super admin to super-admin role
        $super_admin_user->assignRole('super-admin');

        // make super admin logged in
        Auth::attempt([
            'email' => 'superadmin@inv.com',
            'password' => '**inv**',
        ], 100);
    }
}

// email: superadmin@inv.com
// password: **inv**
