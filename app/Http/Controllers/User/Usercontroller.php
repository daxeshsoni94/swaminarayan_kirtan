<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Language;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class Usercontroller extends Controller
{
    public function index(Request $request)
    {
        return $this->list($request);
    }

    public function userForm()
    {
        return Inertia::render('Admin/Users/UserForm', [
            'user' => null,
            'roles' => Role::select('id', 'name')->get(),
            'languages' => Language::select('id', 'name')->get(),
        ]);
    }

    public function userEdit($rolePrefix, User $user)
    {
        return Inertia::render('Admin/Users/UserForm', [
            'user' => $user,
            'roles' => Role::select('id', 'name')->get(),
            'languages' => Language::select('id', 'name')->get(),
        ]);
    }
    // public function list(Request $request)
    // {
    //     $query = User::with('role');

    //     if ($search = $request->input('search')) {
    //         $query->where(function ($q) use ($search) {
    //             $q->where('name', 'like', "%{$search}%")
    //                 ->orWhere('email', 'like', "%{$search}%");
    //         });
    //     }

    //     $users = $query->latest()->paginate(10)->withQueryString();

    //     return Inertia::render('Admin/Users/UserList', [
    //         'users' => $users,
    //         'roles' => Role::select('id', 'name')->get(),
    //         'languages' => Language::select('id', 'name')->get(),
    //         'filters' => $request->only(['search']),
    //     ]);
    // }

    public function list(Request $request)
    {
        $locale = app()->getLocale();

        if (! in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }

        $search = trim($request->input('search', ''));

        $query = User::query()
            ->with('role');

        if ($search !== '') {
            $searchLike = '%' . $search . '%';

            $query->where(function ($q) use ($searchLike) {

                // ─────────────────────────────────────────
                // Name - search BOTH English and Gujarati
                // ─────────────────────────────────────────
                $q->whereRaw(
                    "JSON_UNQUOTE(JSON_EXTRACT(name, '$.en')) LIKE ?",
                    [$searchLike]
                )
                    ->orWhereRaw(
                        "JSON_UNQUOTE(JSON_EXTRACT(name, '$.gu')) LIKE ?",
                        [$searchLike]
                    )

                    // ─────────────────────────────────────────
                    // Email
                    // ─────────────────────────────────────────
                    ->orWhere('email', 'like', $searchLike)

                    // ─────────────────────────────────────────
                    // Phone / Mobile
                    // ─────────────────────────────────────────
                    ->orWhere('phone', 'like', $searchLike)

                    // ─────────────────────────────────────────
                    // Role name
                    // ─────────────────────────────────────────
                    ->orWhereHas('role', function ($roleQuery) use ($searchLike) {
                        $roleQuery->where('name', 'like', $searchLike);
                    });
            });
        }

        $users = $query
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Users/UserList', [
            'users' => $users,

            'roles' => Role::select('id', 'name')->get(),

            'languages' => Language::select('id', 'name')->get(),

            'filters' => [
                'search' => $search,
            ],

            'locale' => $locale,
        ]);
    }

    public function store($rolePrefix, Request $request)
    {

        // dd($request->all());
        $locale = app()->getLocale();

        if (!in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }
        $data = $request->validate([
            'name' => 'required|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'role_id' => 'required|exists:roles,id',
            'language_id' => 'required|exists:languages,id',
            'status' => 'required',
            'password' => 'required|string|min:6',
        ]);


        $data['password'] = Hash::make($data['password']);

        User::create($data);

        return redirect()
            ->route('role.users.index', [
                'rolePrefix' => $rolePrefix,
            ])
            ->with('success', $locale === 'gu'
                ? 'વપરાશકર્તા સફળતાપૂર્વક ઉમેરવામાં આવ્યો.'
                : 'User created successfully.');
    }

    public function update($rolePrefix, Request $request, User $user)
    {
        $data = $request->validate([
            'name' => 'required|array',
            'name.en' => 'nullable|string|max:255',
            'name.gu' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'role_id' => 'required|exists:roles,id',
            'language_id' => 'required|exists:languages,id',
            'status'      => 'required|in:blocked,unblocked',
            'password' => 'nullable|string|min:6',
        ]);
        $locale = app()->getLocale();

        if (!in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return redirect()
            ->route('role.users.index', [
                'rolePrefix' => $rolePrefix,
            ])
            ->with('success', $locale === 'gu'
                ? 'વપરાશકર્તા સફળતાપૂર્વક અપડેટ કરવામાં આવ્યો.'
                : 'User updated successfully.');
    }

    public function destroy($rolePrefix, User $user)
    {
        $locale = app()->getLocale();

        if (!in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }
        $user->delete();
        return redirect()
            ->route('role.users.index', [
                'rolePrefix' => $rolePrefix,
            ])
            ->with('success', $locale === 'gu'
                ? 'વપરાશકર્તા સફળતાપૂર્વક કાઢી નાખવામાં આવ્યો.'
                : 'User deleted successfully.');
    }

    public function bulkDestroy($rolePrefix, Request $request)
    {
        $locale = app()->getLocale();

        if (!in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }
        $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:users,id'],
        ]);
        // $request->validate([
        //     'ids'   => 'required|array',
        //     'ids.*' => 'integer|exists:,id',  // adjust table
        // ]);


        User::whereIn('id', $request->ids)->delete();
        // dd($request->all());

        return back()->with('success', $locale === 'gu'
            ? 'વપરાશકર્તા સફળતાપૂર્વક કાઢી નાખવામાં આવ્યો.'
            : 'User deleted successfully.');
    }
}
