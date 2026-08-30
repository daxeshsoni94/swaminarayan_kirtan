<?php

use App\Http\Controllers\ContactController;
use App\Http\Controllers\Auth\RolesController;
use App\Http\Controllers\Category\AdjectiveController;
use App\Http\Controllers\Category\BhavController;
use App\Http\Controllers\Category\BookController;
use App\Http\Controllers\Category\CategoryController;
use App\Http\Controllers\Category\CreatorController;
use App\Http\Controllers\Category\EventController;
use App\Http\Controllers\Category\NameController;
use App\Http\Controllers\Category\PlaceController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\languageController;
use App\Http\Controllers\Pad\PadController;
use App\Http\Controllers\Pagecontroller;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\User\Usercontroller;
use App\Http\Controllers\VelzonRoutesController;
use App\Models\Language;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Force Logout
|--------------------------------------------------------------------------
*/

Route::get('/force-logout', function () {
    Auth::logout();
    request()->session()->invalidate();
    request()->session()->regenerateToken();
    return redirect('/login');
})->name('force.logout');


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
    Route::controller(VelzonRoutesController::class)->group(function () {
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

// Route::middleware(['auth', 'role.prefix'])
//     ->prefix('{role}')
//     ->group(function () {

//         Route::get('/role-test', function (Request $request) {
//             return response()->json([
//                 'middleware' => 'RolePrefix working',
//                 'user_role' => $request->user()->role?->name,
//                 'url_role' => $request->route('role'),
//             ]);
//         });
//     });
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


        // ── CATEGORIES ──────────────────────────────────────────────
        Route::controller(CategoryController::class)->middleware('permission:categories,view')->group(function () {
            Route::get('/categories/creator-show', 'creatorForm')->name('creators.edit');
        });

        Route::controller(CategoryController::class)->middleware('permission:categories,create')->group(function () {
            Route::get('/create-category', 'CreateCategory')->name('category.create');
            Route::post('/category-store', 'store')->name('categories.store');
        });

        // Creator
        Route::controller(CreatorController::class)->middleware('permission:categories,view')->group(function () {
            Route::get('/categories/creator-list', 'creatorList')->name('category.creatorlist');
            Route::get('/categories/creator-show', 'creatorForm')->name('creators.creatorform');
            Route::get('/categories/{category}/creator-pads-show', 'creatorPadsShow')->name('creators.pads.show');
        });

        Route::controller(CreatorController::class)->middleware('permission:categories,create')->group(function () {
            Route::post('/categories/creators-store', 'creatorStore')->name('creators.store');
        });

        Route::controller(CreatorController::class)->middleware('permission:categories,edit')->group(function () {
            Route::get('/categories/creators/{category}/edit', 'creatorEdit')->name('creators.edit');
            Route::put('/categories/creators/{category}', 'creatorUpdate')->name('creators.update');
        });

        Route::controller(CreatorController::class)->middleware('permission:categories,delete')->group(function () {
            Route::delete('/creators/{id}', 'destroy')->name('creator.destroy');
            Route::post('/creators/bulk-destroy', 'bulkDestroy')->name('creators.bulk-destroy');
        });

        // Event
        Route::controller(EventController::class)->middleware('permission:categories,view')->group(function () {
            Route::get('/categories/event-list', 'eventList')->name('category.eventlist');
            Route::get('/categories/event-show', 'eventForm')->name('category.eventform');
            Route::get('/categories/{event}/creator-event-show', 'eventPadsShow')->name('events.pads.show');
        });

        Route::controller(EventController::class)->middleware('permission:categories,create')->group(function () {
            Route::post('/categories/events', 'eventStore')->name('category.eventstore');
        });

        Route::controller(EventController::class)->middleware('permission:categories,edit')->group(function () {
            Route::get('/categories/event/{event}/edit', 'eventEdit')->name('event.edit');
            Route::put('/categories/events/{event}', 'eventUpdate')->name('event.update');
        });

        Route::controller(EventController::class)->middleware('permission:categories,delete')->group(function () {
            Route::delete('/events/{id}', 'eventDestroy')->name('event.destroy');
            Route::post('/events/bulk-destroy', 'bulkDestroy')->name('events.bulk-destroy');
        });

        // Place
        Route::controller(PlaceController::class)->middleware('permission:categories,view')->group(function () {
            Route::get('/categories/place-list', 'placeList')->name('category.placelist');
            Route::get('/categories/place-show', 'placeForm')->name('category.placeform');
            Route::get('/categories/{place}/place-show', 'placePadsShow')->name('places.pads.show');
        });

        Route::controller(PlaceController::class)->middleware('permission:categories,create')->group(function () {
            Route::post('/categories/places', 'placeStore')->name('category.placestore');
        });

        Route::controller(PlaceController::class)->middleware('permission:categories,edit')->group(function () {
            Route::get('/categories/place/{place}/edit', 'placeEdit')->name('place.edit');
            Route::put('/categories/place/{place}', 'placeUpdate')->name('place.update');
        });

        Route::controller(PlaceController::class)->middleware('permission:categories,delete')->group(function () {
            Route::delete('/places/{id}', 'placeDestroy')->name('place.destroy');
            Route::post('/places/bulk-destroy', 'bulkDestroy')->name('places.bulk-destroy');
        });

        // Adjective
        Route::controller(AdjectiveController::class)->middleware('permission:categories,view')->group(function () {
            Route::get('/categories/adjective-list', 'adjectiveList')->name('category.adjectivelist');
            Route::get('/categories/adjective-show', 'adjectiveForm')->name('category.adjectiveform');
            Route::get('/categories/{adjective}/adjective-show', 'adjectivePadsShow')->name('adjectives.pads.show');
        });

        Route::controller(AdjectiveController::class)->middleware('permission:categories,create')->group(function () {
            Route::post('/categories/adjective', 'adjectiveStore')->name('category.adjectivestore');
        });

        Route::controller(AdjectiveController::class)->middleware('permission:categories,edit')->group(function () {
            Route::get('/categories/adjective/{adjective}/edit', 'adjectiveEdit')->name('adjectives.edit');
            Route::put('/categories/adjective/{adjective}', 'adjectiveUpdate')->name('adjectives.update');
        });

        Route::controller(AdjectiveController::class)->middleware('permission:categories,delete')->group(function () {
            Route::delete('/categories/adjective-destroy/{adjective}', 'adjectiveDestroy')->name('adjectives.destroy');
            Route::post('/adjectives/bulk-destroy', 'bulkDestroy')->name('adjectives.bulk-destroy');
        });

        // Name
        Route::controller(NameController::class)->middleware('permission:categories,view')->group(function () {
            Route::get('/categories/name-list', 'nameList')->name('category.namelist');
            Route::get('/categories/name-show', 'nameForm')->name('category.nameform');
            Route::get('/categories/{name}/name-show', 'namePadsShow')->name('names.pads.show');
        });

        Route::controller(NameController::class)->middleware('permission:categories,create')->group(function () {
            Route::post('/categories/name', 'nameStore')->name('category.namestore');
        });

        Route::controller(NameController::class)->middleware('permission:categories,edit')->group(function () {
            Route::get('/categories/name/{name}/edit', 'nameEdit')->name('names.edit');
            Route::put('/categories/name/{name}', 'nameUpdate')->name('names.update');
        });

        Route::controller(NameController::class)->middleware('permission:categories,delete')->group(function () {
            Route::delete('/names/{id}', 'nameDestroy')->name('name.destroy');
            Route::post('/names/bulk-destroy', 'bulkDestroy')->name('names.bulk-destroy');
        });

        // Book
        Route::controller(BookController::class)->middleware('permission:categories,view')->group(function () {
            Route::get('/categories/book-list', 'bookList')->name('category.booklist');
            Route::get('/categories/book-show', 'bookForm')->name('category.bookform');
            Route::get('/categories/{book}/book-show', 'bookPadsShow')->name('categories.books.pads.show');
        });

        Route::controller(BookController::class)->middleware('permission:categories,create')->group(function () {
            Route::post('/categories/book-store', 'bookStore')->name('category.bookstore');
        });

        Route::controller(BookController::class)->middleware('permission:categories,edit')->group(function () {
            Route::get('/categories/book/{book}/edit', 'bookEdit')->name('category.bookedit');
            Route::put('/categories/book/{book}', 'bookUpdate')->name('category.bookupdate');
        });

        Route::controller(BookController::class)->middleware('permission:categories,delete')->group(function () {
            Route::delete('/books/{id}', 'bookDestroy')->name('book.destroy');
            Route::post('/books/bulk-destroy', 'bulkDestroy')->name('books.bulk-destroy');
        });

        // Bhav
        Route::controller(BhavController::class)->middleware('permission:categories,view')->group(function () {
            Route::get('/categories/bhav-list', 'bhavList')->name('category.bhavlist');
            Route::get('/categories/bhav-show', 'bhavForm')->name('category.bhavform');
            Route::get('/categories/{bhav}/bhav-show', 'bhavPadsShow')->name('categories.bhavs.pads.show');
        });

        Route::controller(BhavController::class)->middleware('permission:categories,create')->group(function () {
            Route::post('/categories/bhav-store', 'bhavStore')->name('category.bhavstore');
        });

        Route::controller(BhavController::class)->middleware('permission:categories,edit')->group(function () {
            Route::get('/categories/bhav/{bhav}/edit', 'bhavEdit')->name('category.bhavedit');
            Route::put('/categories/bhav/{bhav}', 'bhavUpdate')->name('category.bhavupdate');
        });

        Route::controller(BhavController::class)->middleware('permission:categories,delete')->group(function () {
            Route::delete('/bhavs/{id}', 'bhavDestroy')->name('bhav.destroy');
            Route::post('/bhavs/bulk-destroy', 'bulkDestroy')->name('bhavs.bulk-destroy');
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
        Route::controller(languageController::class)->middleware('permission:languages,view')->group(function () {
            Route::get('/languages', 'index')->name('languages.list');
        });

        Route::controller(languageController::class)->middleware('permission:languages,create')->group(function () {
            Route::get('/languages/create', 'create')->name('languages.create');
            Route::post('/languages', 'store')->name('languages.store');
        });

        Route::controller(languageController::class)->middleware('permission:languages,edit')->group(function () {
            Route::get('/languages/{language}/edit', 'edit')->name('languages.edit');
            Route::put('/languages/{language}', 'update')->name('languages.update');
        });

        Route::controller(languageController::class)->middleware('permission:languages,delete')->group(function () {
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


        // ── Locale switcher ─────────────────────────────────────────
        Route::post('/locale', function (Request $request) {
            $locale = $request->input('locale');
            if (!in_array($locale, ['en', 'gu'])) {
                return back();
            }
            session()->put('locale', $locale);
            session()->save();
            app()->setLocale($locale);

            if (Auth::check()) {
                $language = Language::where('code', $locale)->first();
                if ($language) {
                    Auth::user()->update(['language_id' => $language->id]);
                }
            }
            return back();
        })->name('locale.change');
    });


/*
|--------------------------------------------------------------------------
| Settings (extra admin middleware)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
    Route::get('/settings', [SettingController::class, 'index'])->name('admin.settings');
    Route::post('/settings', [SettingController::class, 'update'])->name('admin.settings.update');
});


require __DIR__ . '/auth.php';
