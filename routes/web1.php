<?php

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
use App\Http\Controllers\OrderController;
use App\Http\Controllers\Pad\PadController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\User\HomeController;
use App\Http\Controllers\User\Usercontroller;
use App\Http\Controllers\VelzonRoutesController;
use App\Models\Language;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;



Route::get('/home-page',[HomeController::class,'index'])->name('home');


Route::get('/force-logout', function () {
    Auth::logout();
    request()->session()->invalidate();
    request()->session()->regenerateToken();
    return redirect('/login');
})->name('force.logout');



Route::middleware('auth')->group(function () {
    Route::redirect('/', '/dashboard');
    Route::get('/profile-edit', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile-update', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile-destroy', [ProfileController::class, 'destroy'])->name('profile.destroy');


    Route::controller(VelzonRoutesController::class)->group(function () {
        // dashboard routes
        // Route::inertia('/', 'Dashboard')->name('index');
        Route::get("/admin/dashboard", "index");



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


Route::middleware(['auth', 'admin'])->group(function () {
    //Dashboard controller
    Route::controller(DashboardController::class)->group(function () {
        Route::get('/admin/dashboard', 'index')->name('admin.dashboard.index');
    });
    Route::controller(KirtanController::class)->group(function () {
        Route::get('/admin/kirtans-list', 'kirtanList')->name('admin.kirtans.list');
        Route::get('/admin/create-kirtan', 'Create')->name('admin.kirtans.create');
        Route::post('/admin/kirtans', 'store')->name('admin.kirtans.store');

        Route::get('/admin/kirtans/{kirtan}', 'show')->name('admin.kirtans.show');
        Route::get('/admin/kirtans/{kirtan}/edit', 'edit')->name('admin.kirtans.edit');
        Route::put('/admin/kirtans/{kirtan}', 'update')->name('admin.kirtans.update');
        Route::delete('/admin/kirtans/{kirtan}', 'destroy')->name('admin.kirtans.destroy');
    });

    Route::controller(PadController::class)->group(function () {
        Route::get('/admin/pads-list', 'PadList')->name('admin.pads.list');
        Route::get('/admin/pads-create', 'Create')->name('admin.pads.create');
        Route::get('/admin/pads/{pad}', 'show')->name('admin.pads.show');
        Route::post('/admin/pads/', 'store')->name('admin.pads.store');
        Route::get('pads/{pad}/edit', 'edit')->name('admin.pads.edit');
        Route::put('pads/{pad}', 'update')->name('admin.pads.update');
        Route::delete('pads/{pad}', 'destroy')->name('admin.pads.destroy');
        Route::post('pads/bulk-destroy', 'bulkDestroy')->name('admin.pads.bulk-destroy');
        // or: Route::post(...) with _method=put from Inertia
    });

    Route::controller(CategoryController::class)->group(function () {
        // Route::get('/admin/categories/creator-', 'creatorForm')->name('admin.creators.create');
        Route::get('/admin/categories/creator-show', 'creatorForm')->name('admin.creators.edit');
        Route::get('/admin/categories/creator-show', 'creatorForm')->name('admin.creators.destroy');
        Route::get('/admin/categories/creator-show', 'creatorForm')->name('admin.creators.bulk-destroy');
        Route::get('/admin/create-category', 'CreateCategory')->name('admin.category.create');
        Route::post('/admin/category-store', 'store')->name('admin.categories.store');
    });

    Route::controller(CreatorController::class)->group(function () {
        Route::get('/admin/categories/creator-list', 'creatorList')->name('admin.category.creatorlist');
        Route::get('/admin/categories/creator-show', 'creatorForm')->name('admin.creators.creatorform');
        Route::get('/admin/categories/{category}/creator-pads-show', 'creatorPadsShow')->name('admin.creators.pads.show');
        Route::post('/admin/categories/creators', 'creatorStore')->name('admin.creators.store');
        Route::get('/admin/categories/creators/{category}/edit', 'creatorEdit')->name('admin.creators.edit');
        Route::put('/admin/categories/creators/{category}', 'creatorUpdate')->name('admin.creators.update');
        Route::delete('/admin/categories/creators-destroy/{category}', 'creatorDestroy')->name('admin.creator.destroy');
        Route::delete('/admin/categories/pads/mass-destroy', 'massDestroy')->name('admin.pads.creator.massdestroy');
        Route::delete('/admin/categories/pads/{pad}', 'destroy')->name('admin.pads.creator.destroy');
    });

    Route::controller(EventController::class)->group(function () {
        Route::get('/admin/categories/event-list', 'eventList')->name('admin.category.eventlist');
        Route::get('/admin/categories/event-show', 'eventForm')->name('admin.category.eventform');
        Route::post('/admin/categories/creators', 'eventStore')->name('admin.category.eventstore');
        Route::get('/admin/categories/event/{event}/edit', 'eventEdit')->name('admin.event.edit');
        Route::put('/admin/categories/creators/{event}', 'eventUpdate')->name('admin.event.update');
        Route::delete('/admin/categories/event-destroy/{event}', 'eventDestroy')->name('admin.category.eventdestroy');
        Route::get('/admin/categories/{event}/creator-event-show', 'eventPadsShow')->name('admin.events.pads.show');
        // Route::delete('/admin/categories/pads/mass-destroy', 'massDestroy')->name('admin.pads.creator.massdestroy');
        // Route::delete('/admin/categories/pads/{pad}', 'destroy')->name('admin.pads.creator.destroy');
    });

    Route::controller(PlaceController::class)->group(function () {
        Route::get('/admin/categories/place-list', 'placeList')->name('admin.category.placelist');
        Route::get('/admin/categories/place-show', 'placeForm')->name('admin.category.placeform');
        Route::post('/admin/categories/places', 'placeStore')->name('admin.category.placestore');
        Route::get('/admin/categories/place/{place}/edit', 'placeEdit')->name('admin.place.edit');
        Route::put('/admin/categories/place/{place}', 'placeUpdate')->name('admin.place.update');
        Route::get('/admin/categories/{place}/place-show', 'placePadsShow')->name('admin.places.pads.show');
        Route::delete('/admin/categories/place-destroy/{place}', 'placeDestroy')->name('admin.category.placedestroy');
        // Route::delete('/admin/categories/pads/bulk-destroy', 'bulkDestroy')->name('admin.places.pads.bulkdestroy');
        // Route::delete('/admin/categories/pads/{pad}', 'destroy')->name('admin.pads.creator.destroy');
    });


    Route::controller(AdjectiveController::class)->group(function () {
        Route::get('/admin/categories/adjective-list', 'adjectiveList')->name('admin.category.adjectivelist');
        Route::get('/admin/categories/adjective-show', 'adjectiveForm')->name('admin.category.adjectiveform');
        Route::post('/admin/categories/adjective', 'adjectiveStore')->name('admin.category.adjectivestore');
        Route::get('/admin/categories/adjective/{adjective}/edit', 'adjectiveEdit')->name('admin.adjectives.edit');
        Route::put('/admin/categories/adjective/{adjective}', 'adjectiveUpdate')->name('admin.adjectives.update');
        Route::get('/admin/categories/{adjective}/adjective-show', 'adjectivePadsShow')->name('admin.adjectives.pads.show');
        Route::delete('/admin/categories/adjective-destroy/{adjective}', 'adjectiveDestroy')->name('admin.adjectives.destroy');
        // Route::delete('/admin/categories/pads/bulk-destroy', 'bulkDestroy')->name('admin.places.pads.bulkdestroy');
        // Route::delete('/admin/categories/pads/{pad}', 'destroy')->name('admin.pads.creator.destroy');
    });

    Route::controller(NameController::class)->group(function () {
        Route::get('/admin/categories/name-list', 'nameList')->name('admin.category.namelist');
        Route::get('/admin/categories/name-show', 'nameForm')->name('admin.category.nameform');
        Route::post('/admin/categories/name', 'nameStore')->name('admin.category.namestore');
        Route::get('/admin/categories/name/{name}/edit', 'nameEdit')->name('admin.names.edit');
        Route::put('/admin/categories/name/{name}', 'nameUpdate')->name('admin.names.update');
        Route::get('/admin/categories/{name}/name-show', 'namePadsShow')->name('admin.names.pads.show');
        Route::delete('/admin/categories/name-destroy/{name}', 'nameDestroy')->name('admin.names.destroy');
        // Route::delete('/admin/categories/pads/bulk-destroy', 'bulkDestroy')->name('admin.places.pads.bulkdestroy');
        // Route::delete('/admin/categories/pads/{pad}', 'destroy')->name('admin.pads.creator.destroy');
    });


    Route::controller(BookController::class)->group(function () {
        Route::get('/admin/categories/book-list', 'bookList')->name('admin.category.booklist');
        Route::get('/admin/categories/book-show', 'bookForm')->name('admin.category.bookform');
        Route::post('/admin/categories/book-store', 'bookStore')->name('admin.category.bookstore');
        Route::get('/admin/categories/book/{book}/edit', 'bookEdit')->name('admin.category.bookedit');
        Route::put('/admin/categories/book/{book}', 'bookUpdate')->name('admin.category.bookupdate');
        Route::get('/admin/categories/{book}/book-show', 'bookPadsShow')->name('admin.categories.books.pads.show');
        Route::delete('/admin/categories/book-destroy/{book}', 'bookDestroy')->name('admin.category.bookdestroy');
        // Route::delete('/admin/categories/pads/bulk-destroy', 'bulkDestroy')->name('admin.places.pads.bulkdestroy');
        // Route::delete('/admin/categories/pads/{pad}', 'destroy')->name('admin.pads.creator.destroy');
    });


    Route::controller(BhavController::class)->group(function () {
        Route::get('/admin/categories/bhav-list', 'bhavList')->name('admin.category.bhavlist');
        Route::get('/admin/categories/bhav-show', 'bhavForm')->name('admin.category.bhavform');
        Route::post('/admin/categories/bhav-store', 'bhavStore')->name('admin.category.bhavstore');
        Route::get('/admin/categories/bhav/{bhav}/edit', 'bhavEdit')->name('admin.category.bhavedit');
        Route::put('/admin/categories/bhav/{bhav}', 'bhavUpdate')->name('admin.category.bhavupdate');
        Route::get('/admin/categories/{bhav}/bhav-show', 'bhavPadsShow')->name('admin.categories.bhavs.pads.show');
        Route::delete('/admin/categories/bhav-destroy/{bhav}', 'bhavDestroy')->name('admin.category.bhavdestroy');
        // Route::delete('/admin/categories/pads/bulk-destroy', 'bulkDestroy')->name('admin.places.pads.bulkdestroy');
        // Route::delete('/admin/categories/pads/{pad}', 'destroy')->name('admin.pads.creator.destroy');
    });

    Route::controller(Usercontroller::class)->group(function () {
        Route::get('/admin/users', [UserController::class, 'index'])->name('admin.users.index');
        Route::get('/admin/users-list', [UserController::class, 'list'])->name('admin.users.list');
        Route::post('/users', [UserController::class, 'store'])->name('admin.users.store');
        Route::put('/users/{user}', [UserController::class, 'update'])->name('admin.users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('admin.users.destroy');
    });


    Route::controller(RolesController::class)->group(function () {
        Route::get('/admin/roles', 'index')->name('admin.user.roles');
        Route::post('/admin/roles', 'store')->name('admin.roles.store');
        Route::put('/roles/{role}', 'update')->name('admin.roles.update');
        Route::delete('/roles/{role}', 'destroy')->name('admin.roles.destroy');
    });

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
                Auth::user()->update([
                    'language_id' => $language->id,
                ]);
            }
        }

        return back();
    })->name('locale.change');
});
require __DIR__ . '/auth.php';
