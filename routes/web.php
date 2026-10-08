<?php

use App\Http\Controllers\Category\DynamicCategoryController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\Auth\RolesController;
use App\Http\Controllers\Category\AdjectiveController;
use App\Http\Controllers\Category\BhavController;
use App\Http\Controllers\Category\BookController;
use App\Http\Controllers\Category\CategoryController;
use App\Http\Controllers\Category\CreatorController;
use App\Http\Controllers\Category\CustomCategoryController;
use App\Http\Controllers\Category\EventController;
use App\Http\Controllers\Category\NameController;
use App\Http\Controllers\Category\PlaceController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\KirtanRoutesController;
use App\Http\Controllers\LanguageController;
use App\Http\Controllers\Pad\PadController;
use App\Http\Controllers\Pagecontroller;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\User\Usercontroller;
use App\Models\Language;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;



Route::get('/debug-mail-config', function () {
    return [
        'mail_host' => config('mail.mailers.smtp.host'),
        'mail_username' => config('mail.mailers.smtp.username'),
        'from_address' => config('mail.from.address'),
        'app_name' => config('app.name'),
    ];
});
/*
|--------------------------------------------------------------------------
| Authenticated Routes (Profile + Velzon demo pages)
|--------------------------------------------------------------------------
*/

Route::middleware('auth')->group(function () {

    Route::redirect('/', '/admin/dashboard');

    Route::get('/profile-edit', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile-update', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile-destroy', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Velzon demo pages (keep if you still need them)
    Route::controller(KirtanRoutesController::class)->group(function () {
        Route::get('/admin/kirtans', 'kirtan_type');
        Route::get("/auth-logout-basic", "auth_logout_basic");
        Route::get("/auth-logout-cover", "auth_logout_cover");
        Route::get("/advance-ui-scrollbar", "advance_ui_scrollbar");
        Route::get("/forms-elements", "forms_elements");
        Route::get("/forms-select", "forms_select");
        Route::get("/tables-react", "tables_react");
        Route::get("/icons-remix", "icons_remix");
        Route::get("/pages-starter", "pages_starter");
        Route::get("/pages-profile", "pages_profile");
        Route::get("/pages-profile-settings", "pages_profile_settings");
        Route::get("/auth-signin-basic", "auth_signin_basic");
        Route::get("/auth-signin-cover", "auth_signin_cover");
        Route::get("/auth-signup-basic", "auth_signup_basic");
        Route::get("/auth-signup-cover", "auth_signup_cover");
        Route::get("/landing", "landing");
    });
});

/*
|--------------------------------------------------------------------------
| ADMIN PANEL  →  all routes start with /admin
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'role.prefix'])
    ->prefix('{rolePrefix}')
    ->name('role.')
    ->group(function () {
        // ── Dashboard ───────────────────────────────────────────────
        Route::controller(DashboardController::class)
            ->middleware('permission:dashboard,view')
            ->group(function () {
            Route::get('/dashboard', 'index')->name('dashboard.index');
        });

        // ── PADS ────────────────────────────────────────────────────
        Route::controller(PadController::class)->middleware('permission:pads,view')->group(function () {
            Route::get('/pads-list', 'PadList')->name('pads.list');
            Route::get('/pads/favorites', 'favorites')->name('pads.favorites');
            Route::get('/pads/{pad}', 'show')->name('pads.show');
        });

        Route::controller(PadController::class)->middleware('permission:pads,create')->group(function () {
            Route::get('/pads-create', 'Create')->name('pads.create');
            Route::post('/pads', 'store')->name('pads.store');
        });

        Route::controller(PadController::class)->middleware('permission:pads,edit')->group(function () {
            Route::get('/pads/{pad}/edit', 'edit')->name('pads.edit');
            Route::put('/pads/{pad}', 'update')->name('pads.update');
        });

        Route::controller(PadController::class)->middleware('permission:pads,delete')->group(function () {
            Route::delete('/pads/{pad}', 'destroy')->name('pads.destroy');
            Route::post('/pads/bulk-destroy', 'bulkDestroy')->name('pads.bulk-destroy');
        });

        Route::post('/pads/{pad}/toggle-favorite', [PadController::class, 'toggleFavorite'])
            ->name('pads.toggle-favorite');


        Route::prefix('categories/{type}')
            ->where(['type' => implode('|', array_keys(config('category_types')))])
            ->name('category.')
            ->group(function () {

                Route::get('/', [DynamicCategoryController::class, 'list'])
                    ->middleware('permission:categories,view')
                    ->name('list');

                Route::get('/create', [DynamicCategoryController::class, 'form'])
                    ->middleware('permission:categories,create')
                    ->name('create');

                Route::post('/', [DynamicCategoryController::class, 'store'])
                    ->middleware('permission:categories,create')
                    ->name('store');

                Route::get('/{category}', [DynamicCategoryController::class, 'show'])
                    ->middleware('permission:categories,view')
                    ->name('show');

                Route::get('/{category}/edit', [DynamicCategoryController::class, 'edit'])
                    ->middleware('permission:categories,edit')
                    ->name('edit');

                Route::put('/{category}', [DynamicCategoryController::class, 'update'])
                    ->middleware('permission:categories,edit')
                    ->name('update');

                Route::get('/{category}/pads', [DynamicCategoryController::class, 'padsShow'])
                    ->middleware('permission:categories,view')
                    ->name('pads');

                Route::delete('/{id}', [DynamicCategoryController::class, 'destroy'])
                    ->middleware('permission:categories,delete')
                    ->name('destroy');

                Route::post('/bulk-destroy', [DynamicCategoryController::class, 'bulkDestroy'])
                    ->middleware('permission:categories,delete')
                    ->name('bulk-destroy');
            });


        // ── USERS ───────────────────────────────────────────────────
        Route::controller(Usercontroller::class)->middleware('permission:users,view')->group(function () {
            Route::get('/users', 'index')->name('users.index');
            Route::get('/users-list', 'list')->name('users.list');
        });

        Route::controller(Usercontroller::class)->middleware('permission:users,view')->group(function () {
            Route::get('/user/{user}/edit', 'userEdit')->name('users.edit');
            Route::get('/users-form-show', 'userForm')->name('users.form');
        });

        Route::controller(Usercontroller::class)->middleware('permission:users,create')->group(function () {
            Route::post('/users', 'store')->name('users.store');
        });

        Route::controller(Usercontroller::class)->middleware('permission:users,edit')->group(function () {
            Route::put('/users/{user}', 'update')->name('users.update');
        });

        Route::controller(Usercontroller::class)->middleware('permission:users,delete')->group(function () {
            Route::delete('/users/{user}', 'destroy')->name('users.destroy');
            Route::post('/users/bulk-destroy', 'bulkDestroy')
                ->name('users.bulk-destroy');
        });


        // ── ROLES ───────────────────────────────────────────────────
        Route::controller(RolesController::class)->middleware('permission:roles,view')->group(function () {
            Route::get('/roles', 'index')->name('roles.list');
        });

        Route::controller(RolesController::class)->middleware('permission:roles,create')->group(function () {
            Route::get('/roles/create', 'create')->name('roles.create');
            Route::post('/roles', 'store')->name('roles.store');
        });

        Route::controller(RolesController::class)->middleware('permission:roles,edit')->group(function () {
            Route::get('/roles/{role}/edit', 'edit')->name('roles.edit');
            Route::put('/roles/{role}', 'update')->name('roles.update');
        });

        Route::controller(RolesController::class)->middleware('permission:roles,delete')->group(function () {
            Route::delete('/roles/{role}', 'destroy')->name('roles.destroy');
            Route::post('/roles/bulk-destroy', 'bulkDestroy')->name('roles.bulk-destroy');
        });


        // ── LANGUAGES ───────────────────────────────────────────────
        Route::controller(LanguageController::class)->middleware('permission:languages,view')->group(function () {
            Route::get('/languages', 'index')->name('languages.list');
        });

        Route::controller(LanguageController::class)->middleware('permission:languages,create')->group(function () {
            Route::get('/languages/create', 'create')->name('languages.create');
            Route::post('/languages', 'store')->name('languages.store');
        });

        Route::controller(LanguageController::class)->middleware('permission:languages,edit')->group(function () {
            Route::get('/languages/{language}/edit', 'edit')->name('languages.edit');
            Route::put('/languages/{language}', 'update')->name('languages.update');
        });

        Route::controller(LanguageController::class)->middleware('permission:languages,delete')->group(function () {
            Route::delete('/languages/{language}', 'destroy')->name('languages.destroy');
            Route::post('/languages/bulk-destroy', 'bulkDestroy')->name('languages.bulk-destroy');
        });


        // ── PAGES ───────────────────────────────────────────────────
        Route::controller(Pagecontroller::class)->middleware('permission:pages,view')->group(function () {
            Route::get('/pages', 'index')->name('pages.list');
            Route::get('/pages/published', 'published')->name('pages.published');
            Route::get('/pages/drafts', 'drafts')->name('pages.drafts');
        });

        Route::controller(Pagecontroller::class)->middleware('permission:pages,create')->group(function () {
            Route::get('/pages/create', 'create')->name('pages.create');
            Route::post('/pages', 'store')->name('pages.store');
        });

        Route::controller(Pagecontroller::class)->middleware('permission:pages,edit')->group(function () {
            Route::get('/pages/{page}/edit', 'edit')->name('pages.edit');
            Route::put('/pages/{page}', 'update')->name('pages.update');
        });

        Route::controller(Pagecontroller::class)->middleware('permission:pages,delete')->group(function () {
            Route::delete('/pages/{page}', 'destroy')->name('pages.destroy');
            Route::post('/pages/bulk-destroy', 'bulkDestroy')->name('pages.bulk-destroy');
        });

        // Public page preview
        Route::get('/page/{slug}', [Pagecontroller::class, 'show'])->name('pages.show');


        // ── CONTACTS ────────────────────────────────────────────────
        Route::controller(ContactController::class)->middleware('permission:contacts,view')->group(function () {
            Route::get('/contacts', 'index')->name('contacts.list');
            Route::get('/contacts/new', 'new')->name('contacts.new');
            Route::get('/contacts/read', 'read')->name('contacts.read');
            Route::get('/contacts/resolved', 'resolved')->name('contacts.resolved');
            Route::get('/contacts/{contact}', 'show')->name('contacts.show');
        });

        Route::controller(ContactController::class)->middleware('permission:contacts,edit')->group(function () {
            Route::put('/contacts/{contact}/status', 'updateStatus')->name('contacts.update-status');
        });

        Route::controller(ContactController::class)->middleware('permission:contacts,delete')->group(function () {
            Route::delete('/contacts/{contact}', 'destroy')->name('contacts.destroy');
            Route::post('/contacts/bulk-destroy', 'bulkDestroy')->name('contacts.bulk-destroy');
        });
        // ── SETTINGS ────────────────────────────────────────────────
        Route::controller(SettingController::class)->middleware('permission:settings,view')->group(function () {
            Route::get('/settings', 'index')->name('settings.index');
        });

        Route::controller(SettingController::class)->middleware('permission:settings,edit')->group(function () {
            Route::post('/settings', 'update')->name('settings.update');
        });
    });

Route::post('/locale', [languageController::class, 'changeLocale'])
    ->name('locale.change');

/*
|--------------------------------------------------------------------------
| Settings (extra admin middleware)
|--------------------------------------------------------------------------
*/

Route::get('/settings/layout', [SettingController::class, 'getLayoutSettings'])
    ->name('settings.layout.get');

Route::post('/settings/layout', [SettingController::class, 'updateLayout'])
    ->middleware(['auth'])
    ->name('settings.layout.update');
Route::get('/link-storage', function () {
    \Illuminate\Support\Facades\Artisan::call('storage:link');
    return 'Storage linked successfully!';
});

require __DIR__ . '/auth.php';
