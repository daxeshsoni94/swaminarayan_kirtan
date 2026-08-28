<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $modules = [
            'dashboard' => [
                'view' => 'View Dashboard',
            ],
            'users' => [
                'view'   => 'View Users',
                'create' => 'Create User',
                'edit'   => 'Edit User',
                'delete' => 'Delete User',
            ],
            'roles' => [
                'view'   => 'View Roles',
                'create' => 'Create Role',
                'edit'   => 'Edit Role',
                'delete' => 'Delete Role',
            ],
            'pads' => [
                'view'   => 'View Pads',
                'create' => 'Create Pad',
                'edit'   => 'Edit Pad',
                'delete' => 'Delete Pad',
            ],
            'categories' => [
                'view'   => 'View Categories',
                'create' => 'Create Category',
                'edit'   => 'Edit Category',
                'delete' => 'Delete Category',
            ],
            // Languages
            'languages' => [
                'view'   => 'View Languages',
                'create' => 'Create Language',
                'edit'   => 'Edit Language',
                'delete' => 'Delete Language',
            ],
            'media' => [
                'view'   => 'View Media',
                'create' => 'Upload Media',
                'edit'   => 'Edit Media',
                'delete' => 'Delete Media',
            ],
            // Pages
            'pages' => [
                'view'   => 'View Pages',
                'create' => 'Create Page',
                'edit'   => 'Edit Page',
                'delete' => 'Delete Page',
            ],
            // Contacts
            'contacts' => [
                'view'   => 'View Contacts',
                'create' => 'Create Contact',
                'edit'   => 'Edit Contact',
                'delete' => 'Delete Contact',
            ],
            // Settings
            'settings' => [
                'view' => 'View Settings',
                'edit' => 'Edit Settings',
            ],
            // More Menu
            'more' => [
                'view' => 'View More Menu',
            ],

        ];

        foreach ($modules as $module => $actions) {
            foreach ($actions as $action => $displayName) {
                Permission::updateOrCreate(
                    [
                        'name' => "{$module}.{$action}",
                    ],
                    [
                        'module'      => $module,
                        'action'      => $action,
                        'display_name' => $displayName,
                    ]
                );
            }
        }
    }
}
