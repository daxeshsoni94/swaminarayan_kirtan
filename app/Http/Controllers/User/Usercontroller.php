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
    /**
     * Get all language codes from the database.
     */
    private function supportedLocales(): array
    {
        $codes = Language::query()
            ->pluck('code')
            ->filter()
            ->map(fn($code) => strtolower(trim($code)))
            ->unique()
            ->values()
            ->all();

        return !empty($codes) ? $codes : ['en'];
    }

    /**
     * Resolve current locale safely.
     */
    private function resolveLocale(?string $locale = null): string
    {
        $locale = $locale
            ? strtolower(trim($locale))
            : strtolower((string) session('locale', app()->getLocale()));

        $locales = $this->supportedLocales();

        return in_array($locale, $locales, true)
            ? $locale
            : ($locales[0] ?? 'en');
    }

    public function index(Request $request)
    {
        return $this->list($request);
    }

    public function userForm()
    {
        return Inertia::render('Admin/Users/UserForm', [
            'user' => null,
            'roles' => Role::query()->select('id', 'name')->get(),
            'languages' => Language::query()
                ->select('id', 'code', 'name')
                ->orderBy('id')
                ->get(),
            'locale' => $this->resolveLocale(),
        ]);
    }

    public function userEdit($rolePrefix, User $user)
    {
        return Inertia::render('Admin/Users/UserForm', [
            'user' => $user,
            'roles' => Role::query()->select('id', 'name')->get(),
            'languages' => Language::query()
                ->select('id', 'code', 'name')
                ->orderBy('id')
                ->get(),
            'locale' => $this->resolveLocale(),
        ]);
    }

    public function list(Request $request)
    {
        $locales = $this->supportedLocales();
        $locale = $this->resolveLocale();
        $search = trim((string) $request->input('search', ''));

        $query = User::query()->with('role');

        if ($search !== '') {
            $searchLike = '%' . $search . '%';

            $query->where(function ($q) use ($searchLike, $locales) {
                foreach ($locales as $index => $language) {
                    $method = $index === 0 ? 'whereRaw' : 'orWhereRaw';

                    $q->{$method}(
                        "JSON_UNQUOTE(JSON_EXTRACT(name, '$.\"{$language}\"')) LIKE ?",
                        [$searchLike]
                    );
                }

                $q->orWhere('email', 'like', $searchLike)
                    ->orWhere('phone', 'like', $searchLike)
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
            'roles' => Role::query()->select('id', 'name')->get(),
            'languages' => Language::query()
                ->select('id', 'code', 'name')
                ->orderBy('id')
                ->get(),
            'filters' => [
                'search' => $search,
            ],
            'locale' => $locale,
        ]);
    }

    public function store($rolePrefix, Request $request)
    {
        $locales = $this->supportedLocales();
        $currentLocale = $this->resolveLocale($request->input('locale'));

        $rules = [
            'name' => ['required', 'array'],
            'email' => ['required', 'email', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20'],
            'role_id' => ['required', 'exists:roles,id'],
            'language_id' => ['required', 'exists:languages,id'],
            'status' => ['required'],
            'password' => ['required', 'string', 'min:6'],
            'locale' => ['nullable', 'string'],
        ];

        // Current language required
        $rules["name.{$currentLocale}"] = ['required', 'string', 'max:255'];

        // Other languages optional
        foreach ($locales as $code) {
            if ($code === $currentLocale) {
                continue;
            }
            $rules["name.{$code}"] = ['nullable', 'string', 'max:255'];
        }

        $data = $request->validate($rules);
        // dd($data);

        $data['password'] = Hash::make($data['password']);

        // Full name map for all locales
        $name = [];
        foreach ($locales as $code) {
            $name[$code] = $data['name'][$code] ?? '';
        }
        $data['name'] = $name;

        User::create($data);

        return redirect()
            ->route('role.users.index', ['rolePrefix' => $rolePrefix])
            ->with('success', 'user_created_success');
    }

    public function update($rolePrefix, Request $request, User $user)
    {
        $locales = $this->supportedLocales();
        $currentLocale = $this->resolveLocale($request->input('locale'));

        $rules = [
            'name' => ['required', 'array'],
            'email' => [
                'required',
                'email',
                'unique:users,email,' . $user->id,
            ],
            'phone' => ['nullable', 'string', 'max:20'],
            'role_id' => ['required', 'exists:roles,id'],
            'language_id' => ['required', 'exists:languages,id'],
            'status' => ['required', 'in:blocked,unblocked'],
            'password' => ['nullable', 'string', 'min:6'],
            'locale' => ['nullable', 'string'],
        ];

        // Current language required
        $rules["name.{$currentLocale}"] = ['required', 'string', 'max:255'];

        // Other languages optional
        foreach ($locales as $code) {
            if ($code === $currentLocale) {
                continue;
            }
            $rules["name.{$code}"] = ['nullable', 'string', 'max:255'];
        }

        $data = $request->validate($rules);

        // Merge with existing translations so other locales are not wiped
        $existingName = is_array($user->name) ? $user->name : [];
        $name = [];
        foreach ($locales as $code) {
            $name[$code] = $data['name'][$code]
                ?? ($existingName[$code] ?? '');
        }
        $data['name'] = $name;

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        unset($data['locale']);

        $user->update($data);

        return redirect()
            ->route('role.users.index', ['rolePrefix' => $rolePrefix])
            ->with('success', 'user_updated_success');
    }

    public function destroy($rolePrefix, User $user)
    {
        $user->delete();

        return redirect()
            ->route('role.users.index', ['rolePrefix' => $rolePrefix])
            ->with('success', 'user_deleted_success');
    }

    public function bulkDestroy($rolePrefix, Request $request)
    {
        $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:users,id'],
        ]);

        User::whereIn('id', $request->ids)->delete();

        return back()->with('success', 'users_deleted_success');
    }
}
