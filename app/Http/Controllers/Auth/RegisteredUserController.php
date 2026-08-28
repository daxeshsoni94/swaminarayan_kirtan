<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Providers\RouteServiceProvider;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        // dd('dd');
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $userRoleId = DB::table('roles')->where('name', 'User')->value('id');

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id'     => $userRoleId,
            'language_id' => 3,
        ]);

        event(new Registered($user));

        Auth::login($user);
        $rolePrefix = $user->role?->name
            ? strtolower(str_replace(' ', '-', $user->role->name))
            : 'admin';

        return redirect()
            ->route('role.pads.list', [
                'rolePrefix' => $user->role?->name
                    ? strtolower(str_replace(' ', '-', $user->role->name))
                    : 'admin',
            ])
            ->with('success', 'Registration successful!');
    }

    public function show()
    {
        // $users = User::with('role')
        //     ->select('id', 'name', 'email', 'phone', 'status', 'role_id', 'created_at')
        //     ->latest()
        //     ->get();

        $users = User::with('role')->latest()->paginate(10)->withQueryString(); // ✅ paginator

        // dd($users);
        return Inertia::render('Admin/Users/List', [
            'users' => $users,
        ]);
    }



    public function destroy(User $user)
    {
        $user->delete();
        return redirect()->back()->with('success', 'User deleted successfully.');
    }
}
