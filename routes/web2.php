<?php

use App\Http\Controllers\ContactController;
use App\Http\Controllers\Auth\RolesController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Category\AdjectiveController;
use App\Http\Controllers\Category\BhavController;
use App\Http\Controllers\Category\BookController;
use App\Http\Controllers\Category\CategoryController;
use App\Http\Controllers\Category\CreatorController;
use App\Http\Controllers\Category\EventController;
use App\Http\Controllers\Category\NameController;
use App\Http\Controllers\Category\PlaceController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Kirtan\KirtanController;
use App\Http\Controllers\languageController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\Pad\PadController;
use App\Http\Controllers\Pagecontroller;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\User\Usercontroller;
use App\Http\Controllers\VelzonRoutesController;
use App\Models\Language;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;



// Route::get('/home-page', [HomeController::class, 'index'])->name('home');


Route::get('/force-logout', function () {
    Auth::logout();
    request()->session()->invalidate();
    request()->session()->regenerateToken();
    return redirect('/login');
})->name('force.logout');


// Route::get('/test-mail', function () {
//     Mail::raw('Gmail SMTP is working successfully!', function ($message) {
//         $message
//             ->to('dnsoni321@gmail.com')
//             ->subject('Laravel Gmail SMTP Test');
//     });

//     return 'Email sent successfully!';
// });

// routes/web.php

// Route::get('/test-auth', function () {
//     if (Auth::check()) {
//         return 'You are logged in as: ' . Auth::user()->email;
//     }

//     return 'This should never show – middleware failed';
// })->middleware('auth');
// Route::get('/check-session', function () {
//     return [
//         'logged_in' => Auth::check(),
//         'user'      => Auth::user()?->email,
//         'session_id' => session()->getId(),
//     ];
// });
Route::middleware('auth')->group(function () {
    Route::redirect('/', '/dashboard');
    Route::get('/profile-edit', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile-update', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile-destroy', [ProfileController::class, 'destroy'])->name('profile.destroy');


    Route::controller(VelzonRoutesController::class)->group(function () {
        // dashboard routes
        // Route::inertia('/', 'Dashboard')->name('index');
        // Route::get("/admin/dashboard", "index");



        Route::get('/admin/kirtans', 'kirtan_type');
        //logout 
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


Route::middleware(['auth'])->group(function () {

    // Dashboard — everyone with an account can land here
    Route::controller(DashboardController::class)
        ->middleware('permission:dashboard,view')->group(function () {
            Route::get('/admin/dashboard', 'index')->name('admin.dashboard.index');
        });

    Route::controller(PadController::class)->middleware('permission:pads,view')->group(function () {
        Route::get('/admin/pads-list', 'PadList')->name('admin.pads.list');
        Route::get('/admin/pads/favorites', [PadController::class, 'favorites'])
            ->name('admin.pads.favorites');
        Route::get('/admin/pads/{pad}', 'show')->name('admin.pads.show');
    });
    Route::controller(PadController::class)->middleware('permission:pads,create')->group(function () {
        Route::get('/admin/pads-create', 'Create')->name('admin.pads.create');
        Route::post('/admin/pads/', 'store')->name('admin.pads.store');
    });
    Route::controller(PadController::class)->middleware('permission:pads,edit')->group(function () {
        Route::get('pads/{pad}/edit', 'edit')->name('admin.pads.edit');
        Route::put('pads/{pad}', 'update')->name('admin.pads.update');
    });
    Route::controller(PadController::class)->middleware('permission:pads,delete')->group(function () {
        Route::delete('pads/{pad}', 'destroy')->name('admin.pads.destroy');
        Route::post('pads/bulk-destroy', 'bulkDestroy')->name('admin.pads.bulk-destroy');
    });
    // routes/web.php (inside your admin + auth middleware group)

    Route::post('/pads/{pad}/toggle-favorite', [PadController::class, 'toggleFavorite'])
        ->name('admin.pads.toggle-favorite');

    // ── CATEGORIES (all sub-types share the "categories" permission) ─
    Route::controller(CategoryController::class)->middleware('permission:categories,view')->group(function () {
        Route::get('/admin/categories/creator-show', 'creatorForm')->name('admin.creators.edit');
    });
    Route::controller(CategoryController::class)->middleware('permission:categories,create')->group(function () {
        Route::get('/admin/create-category', 'CreateCategory')->name('admin.category.create');
        Route::post('/admin/category-store', 'store')->name('admin.categories.store');
    });

    Route::controller(CreatorController::class)->middleware('permission:categories,view')->group(function () {
        Route::get('/admin/categories/creator-list', 'creatorList')->name('admin.category.creatorlist');
        Route::get('/admin/categories/creator-show', 'creatorForm')->name('admin.creators.creatorform');
        Route::get('/admin/categories/{category}/creator-pads-show', 'creatorPadsShow')->name('admin.creators.pads.show');
    });

    Route::controller(CreatorController::class)
        ->middleware('permission:categories,create')
        ->group(function () {
            Route::post('/admin/categories/creators-store', 'creatorStore')
                ->name('admin.creators.store');
        });
    Route::controller(CreatorController::class)->middleware('permission:categories,edit')->group(function () {
        Route::get('/admin/categories/creators/{category}/edit', 'creatorEdit')->name('admin.creators.edit');
        Route::put('/admin/categories/creators/{category}', 'creatorUpdate')->name('admin.creators.update');
    });
    Route::controller(CreatorController::class)->middleware('permission:categories,delete')->group(function () {
        // Route::delete('/admin/categories/creators-destroy/{category}', 'destroy')->name('admin.creator.destroy');
        // Route::delete('/admin/categories/pads/{pad}', 'destroy')->name('admin.creator.destroy');
        Route::delete('admin/creators/{id}', 'destroy')->name('admin.creator.destroy');
        Route::post('/admin/creators/bulk-destroy', 'bulkDestroy')->name('admin.creators.bulk-destroy');
    });


    Route::controller(EventController::class)->middleware('permission:categories,view')->group(function () {
        Route::get('/admin/categories/event-list', 'eventList')->name('admin.category.eventlist');
        Route::get('/admin/categories/event-show', 'eventForm')->name('admin.category.eventform');
        Route::get('/admin/categories/{event}/creator-event-show', 'eventPadsShow')->name('admin.events.pads.show');
    });
    Route::controller(EventController::class)->middleware('permission:categories,create')->group(function () {
        Route::post('/admin/categories/events', 'eventStore')->name('admin.category.eventstore');
    });
    Route::controller(EventController::class)->middleware('permission:categories,edit')->group(function () {
        Route::get('/admin/categories/event/{event}/edit', 'eventEdit')->name('admin.event.edit');
        Route::put('/admin/categories/events/{event}', 'eventUpdate')->name('admin.event.update');
    });
    Route::controller(EventController::class)->middleware('permission:categories,delete')->group(function () {
        Route::delete('admin/events/{id}', 'eventDestroy')->name('admin.event.destroy');
        Route::post('/admin/events/bulk-destroy', 'bulkDestroy')->name('admin.events.bulk-destroy');
    });

    Route::controller(PlaceController::class)->middleware('permission:categories,view')->group(function () {
        Route::get('/admin/categories/place-list', 'placeList')->name('admin.category.placelist');
        Route::get('/admin/categories/place-show', 'placeForm')->name('admin.category.placeform');
        Route::get('/admin/categories/{place}/place-show', 'placePadsShow')->name('admin.places.pads.show');
    });
    Route::controller(PlaceController::class)->middleware('permission:categories,create')->group(function () {
        Route::post('/admin/categories/places', 'placeStore')->name('admin.category.placestore');
    });
    Route::controller(PlaceController::class)->middleware('permission:categories,edit')->group(function () {
        Route::get('/admin/categories/place/{place}/edit', 'placeEdit')->name('admin.place.edit');
        Route::put('/admin/categories/place/{place}', 'placeUpdate')->name('admin.place.update');
    });
    Route::controller(PlaceController::class)->middleware('permission:categories,delete')->group(function () {
        Route::delete('admin/places/{id}', 'placeDestroy')->name('admin.place.destroy');
        Route::post('/admin/places/bulk-destroy', 'bulkDestroy')->name('admin.places.bulk-destroy');
    });

    Route::controller(AdjectiveController::class)->middleware('permission:categories,view')->group(function () {
        Route::get('/admin/categories/adjective-list', 'adjectiveList')->name('admin.category.adjectivelist');
        Route::get('/admin/categories/adjective-show', 'adjectiveForm')->name('admin.category.adjectiveform');
        Route::get('/admin/categories/{adjective}/adjective-show', 'adjectivePadsShow')->name('admin.adjectives.pads.show');
    });
    Route::controller(AdjectiveController::class)->middleware('permission:categories,create')->group(function () {
        Route::post('/admin/categories/adjective', 'adjectiveStore')->name('admin.category.adjectivestore');
    });
    Route::controller(AdjectiveController::class)->middleware('permission:categories,edit')->group(function () {
        Route::get('/admin/categories/adjective/{adjective}/edit', 'adjectiveEdit')->name('admin.adjectives.edit');
        Route::put('/admin/categories/adjective/{adjective}', 'adjectiveUpdate')->name('admin.adjectives.update');
    });
    Route::controller(AdjectiveController::class)->middleware('permission:categories,delete')->group(function () {
        Route::delete('/admin/categories/adjective-destroy/{adjective}', 'adjectiveDestroy')->name('admin.adjectives.destroy');
        Route::post('/admin/adjectives/bulk-destroy', 'bulkDestroy')->name('admin.adjectives.bulk-destroy');
    });

    Route::controller(NameController::class)->middleware('permission:categories,view')->group(function () {
        Route::get('/admin/categories/name-list', 'nameList')->name('admin.category.namelist');
        Route::get('/admin/categories/name-show', 'nameForm')->name('admin.category.nameform');
        Route::get('/admin/categories/{name}/name-show', 'namePadsShow')->name('admin.names.pads.show');
    });

    Route::controller(NameController::class)->middleware('permission:categories,create')->group(function () {
        Route::post('/admin/categories/name', 'nameStore')->name('admin.category.namestore');
    });
    Route::controller(NameController::class)->middleware('permission:categories,edit')->group(function () {
        Route::get('/admin/categories/name/{name}/edit', 'nameEdit')->name('admin.names.edit');
        Route::put('/admin/categories/name/{name}', 'nameUpdate')->name('admin.names.update');
    });
    Route::controller(NameController::class)->middleware('permission:categories,delete')->group(function () {
        Route::delete('admin/names/{id}', 'nameDestroy')->name('admin.name.destroy');
        Route::post('/admin/names/bulk-destroy', 'bulkDestroy')->name('admin.names.bulk-destroy');
    });

    Route::controller(BookController::class)->middleware('permission:categories,view')->group(function () {
        Route::get('/admin/categories/book-list', 'bookList')->name('admin.category.booklist');
        Route::get('/admin/categories/book-show', 'bookForm')->name('admin.category.bookform');
        Route::get('/admin/categories/{book}/book-show', 'bookPadsShow')->name('admin.categories.books.pads.show');
    });
    Route::controller(BookController::class)->middleware('permission:categories,create')->group(function () {
        Route::post('/admin/categories/book-store', 'bookStore')->name('admin.category.bookstore');
    });
    Route::controller(BookController::class)->middleware('permission:categories,edit')->group(function () {
        Route::get('/admin/categories/book/{book}/edit', 'bookEdit')->name('admin.category.bookedit');
        Route::put('/admin/categories/book/{book}', 'bookUpdate')->name('admin.category.bookupdate');
    });
    Route::controller(BookController::class)->middleware('permission:categories,delete')->group(function () {
        Route::delete('admin/books/{id}', 'bookDestroy')->name('admin.book.destroy');
        Route::post('/admin/books/bulk-destroy', 'bulkDestroy')->name('admin.books.bulk-destroy');
    });

    Route::controller(BhavController::class)->middleware('permission:categories,view')->group(function () {
        Route::get('/admin/categories/bhav-list', 'bhavList')->name('admin.category.bhavlist');
        Route::get('/admin/categories/bhav-show', 'bhavForm')->name('admin.category.bhavform');
        Route::get('/admin/categories/{bhav}/bhav-show', 'bhavPadsShow')->name('admin.categories.bhavs.pads.show');
    });
    Route::controller(BhavController::class)->middleware('permission:categories,create')->group(function () {
        Route::post('/admin/categories/bhav-store', 'bhavStore')->name('admin.category.bhavstore');
    });
    Route::controller(BhavController::class)->middleware('permission:categories,edit')->group(function () {
        Route::get('/admin/categories/bhav/{bhav}/edit', 'bhavEdit')->name('admin.category.bhavedit');
        Route::put('/admin/categories/bhav/{bhav}', 'bhavUpdate')->name('admin.category.bhavupdate');
    });
    Route::controller(BhavController::class)->middleware('permission:categories,delete')->group(function () {
        Route::delete('admin/bhavs/{id}', 'bhavDestroy')->name('admin.bhav.destroy');
        Route::post('/admin/bhavs/bulk-destroy', 'bulkDestroy')->name('admin.bhavs.bulk-destroy');
    });

    // ── USERS & ROLES — stay admin-gated ─────────────────────────────
    Route::controller(UserController::class)->middleware('permission:users,view')->group(function () {
        Route::get('/admin/users', [UserController::class, 'index'])->name('admin.users.index');
        Route::get('/admin/users-list', [UserController::class, 'list'])->name('admin.users.list');
    });
    Route::controller(UserController::class)->middleware('permission:categories,view')->group(function () {
        Route::get('/admin/user/{user}/edit', 'userEdit')->name('admin.users.edit');
        Route::get('/admin/users-form-show', 'userForm')->name('admin.users.form');
    });
    Route::controller(UserController::class)->middleware('permission:users,create')->group(function () {
        Route::post('/users', [UserController::class, 'store'])->name('admin.users.store');
    });
    Route::controller(UserController::class)->middleware('permission:users,edit')->group(function () {
        Route::put('/users/{user}', [UserController::class, 'update'])->name('admin.users.update');
    });
    Route::controller(UserController::class)->middleware('permission:users,delete')->group(function () {
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('admin.users.destroy');
    });

    Route::controller(RolesController::class)->middleware('permission:roles,view')->group(function () {
        Route::get('/admin/roles', 'index')->name('admin.roles.list');          // or admin.user.roles
    });

    Route::controller(RolesController::class)->middleware('permission:roles,create')->group(function () {
        Route::get('/admin/roles/create', 'create')->name('admin.roles.create');
        Route::post('/admin/roles', 'store')->name('admin.roles.store');
    });

    Route::controller(RolesController::class)->middleware('permission:roles,edit')->group(function () {
        Route::get('/admin/roles/{role}/edit', 'edit')->name('admin.roles.edit');
        Route::put('/admin/roles/{role}', 'update')->name('admin.roles.update');
    });

    Route::controller(RolesController::class)->middleware('permission:roles,delete')->group(function () {
        Route::delete('/admin/roles/{role}', 'destroy')->name('admin.roles.destroy');
        Route::post('/admin/roles/bulk-destroy', 'bulkDestroy')->name('admin.roles.bulk-destroy');
    });

    Route::controller(languageController::class)->middleware('permission:languages,view')->group(function () {
        Route::get('/admin/languages', 'index')->name('admin.languages.list');
    });

    Route::controller(LanguageController::class)->middleware('permission:languages,create')->group(function () {
        Route::get('/admin/languages/create', 'create')->name('admin.languages.create');
        Route::post('/admin/languages', 'store')->name('admin.languages.store');
    });

    Route::controller(LanguageController::class)->middleware('permission:languages,edit')->group(function () {
        Route::get('/admin/languages/{language}/edit', 'edit')->name('admin.languages.edit');
        Route::put('/admin/languages/{language}', 'update')->name('admin.languages.update');
    });

    Route::controller(LanguageController::class)->middleware('permission:languages,delete')->group(function () {
        Route::delete('/admin/languages/{language}', 'destroy')->name('admin.languages.destroy');
        Route::post('/admin/languages/bulk-destroy', 'bulkDestroy')->name('admin.languages.bulk-destroy');
    });

    //Pages routes
    Route::controller(Pagecontroller::class)->middleware('permission:pages,view')->group(function () {
        Route::get('/admin/pages', 'index')->name('admin.pages.list');
        Route::get('/admin/pages/published', 'published')->name('admin.pages.published');
        Route::get('/admin/pages/drafts', 'drafts')->name('admin.pages.drafts');
    });

    Route::controller(PageController::class)->middleware('permission:pages,create')->group(function () {
        Route::get('/admin/pages/create', 'create')->name('admin.pages.create');
        Route::post('/admin/pages', 'store')->name('admin.pages.store');
    });

    Route::controller(PageController::class)->middleware('permission:pages,edit')->group(function () {
        Route::get('/admin/pages/{page}/edit', 'edit')->name('admin.pages.edit');
        Route::put('/admin/pages/{page}', 'update')->name('admin.pages.update');
    });

    Route::controller(PageController::class)->middleware('permission:pages,delete')->group(function () {
        Route::delete('/admin/pages/{page}', 'destroy')->name('admin.pages.destroy');
        Route::post('/admin/pages/bulk-destroy', 'bulkDestroy')->name('admin.pages.bulk-destroy');
    });

    // Public (or admin preview) – place BEFORE /admin/pages/{page} routes
    Route::get('/page/{slug}', [PageController::class, 'show'])
        ->name('pages.show');


    //Contact Controller
    Route::controller(ContactController::class)->middleware('permission:contacts,view')->group(function () {
        Route::get('/admin/contacts', 'index')->name('admin.contacts.list');
        Route::get('/admin/contacts/new', 'new')->name('admin.contacts.new');
        Route::get('/admin/contacts/read', 'read')->name('admin.contacts.read');
        Route::get('/admin/contacts/resolved', 'resolved')->name('admin.contacts.resolved');
        Route::get('/admin/contacts/{contact}', 'show')->name('admin.contacts.show');
    });

    Route::controller(ContactController::class)->middleware('permission:contacts,edit')->group(function () {
        Route::put('/admin/contacts/{contact}/status', 'updateStatus')->name('admin.contacts.update-status');
    });

    Route::controller(ContactController::class)->middleware('permission:contacts,delete')->group(function () {
        Route::delete('/admin/contacts/{contact}', 'destroy')->name('admin.contacts.destroy');
        Route::post('/admin/contacts/bulk-destroy', 'bulkDestroy')->name('admin.contacts.bulk-destroy');
    });



    // Locale switcher — every logged-in user can use this
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

Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
    Route::get('/settings', [SettingController::class, 'index'])->name('admin.settings');
    Route::post('/settings', [SettingController::class, 'update'])->name('admin.settings.update');
});

require __DIR__ . '/auth.php';
