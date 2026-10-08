<?php

namespace App\Http\Controllers;

use App\Models\Language;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LanguageController extends Controller
{
    public function index(Request $request)
    {
        return $this->list($request);
    }

    public function list(Request $request)
    {
        $query = Language::query()->withCount('users');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $languages = $query
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Languages/LangList', [
            'languages' => $languages,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Languages/LangForm', [
            'language' => null,
        ]);
    }

    public function edit($rolePrefix, Language $language)
    {
        return Inertia::render('Admin/Languages/LangForm', [
            'language' => $language,
        ]);
    }

    public function store($rolePrefix, Request $request)
    {
        $request->validate([
            'code' => 'required|string|max:10|unique:languages,code',
            'name' => 'required|string|max:255',
        ]);

        Language::create([
            'code' => $request->code,
            'name' => $request->name,
        ]);

        return redirect()
            ->route('role.languages.list', [
                'rolePrefix' => $rolePrefix,
            ])
            ->with('success', 'language_created_success');
    }

    public function update(
        $rolePrefix,
        Request $request,
        Language $language
    ) {
        $request->validate([
            'code' => 'required|string|max:10|unique:languages,code,' . $language->id,
            'name' => 'required|string|max:255',
        ]);

        $language->update([
            'code' => $request->code,
            'name' => $request->name,
        ]);

        return redirect()
            ->route('role.languages.list', [
                'rolePrefix' => $rolePrefix,
            ])
            ->with('success', 'language_updated_success');
    }

    public function destroy($rolePrefix, Language $language)
    {
        // Prevent deleting a language assigned to users.
        if ($language->users()->exists()) {
            return redirect()
                ->back()
                ->with('error', 'language_assigned_to_users');
        }

        $language->delete();

        return redirect()
            ->back()
            ->with('success', 'language_deleted_success');
    }

    public function bulkDestroy($rolePrefix, Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:languages,id',
        ]);

        // Skip languages that are assigned to users.
        $languages = Language::whereIn('id', $request->ids)->get();

        foreach ($languages as $language) {
            if (!$language->users()->exists()) {
                $language->delete();
            }
        }

        return redirect()
            ->back()
            ->with('success', 'languages_deleted_success');
    }

    // public function changeLocale(Request $request)
    // {
    //     $locale = $request->input('locale');

    //     $allowed = Language::query()
    //         ->pluck('code')
    //         ->map(fn($code) => strtolower(trim($code)))
    //         ->all();

    //     $locale = strtolower(trim((string) $locale));

    //     if (!in_array($locale, $allowed, true)) {
    //         return back();
    //     }

    //     session()->put('locale', $locale);
    //     session()->save();
    //     app()->setLocale($locale);

    //     if (Auth::check()) {
    //         $language = Language::where('code', $locale)->first();
    //         if ($language) {
    //             Auth::user()->update(['language_id' => $language->id]);
    //         }
    //     }

    //     return back();
    // }

    public function changeLocale(Request $request)
    {
        $locale = $request->input('locale');

        $allowed = Language::query()
            ->pluck('code')
            ->map(fn($code) => strtolower(trim($code)))
            ->all();

        $locale = strtolower(trim((string) $locale));

        if (!in_array($locale, $allowed, true)) {
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

        // ── Map custom_type to the new locale (any custom category) ──
        $customType = trim((string) $request->input('custom_type', ''));
        $redirectTo = $request->input('redirect_to');

        if ($customType !== '' && is_string($redirectTo) && str_contains($redirectTo, 'custom_type=')) {
            $mapped = $this->mapCustomTypeToLocale($customType, $locale);

            $url = parse_url($redirectTo);
            $path = $url['path'] ?? '/';
            parse_str($url['query'] ?? '', $query);
            $query['custom_type'] = $mapped;
            $newUrl = $path . '?' . http_build_query($query);

            return redirect($newUrl);
        }

        return back();
    }

    /**
     * Find a custom category whose type matches $customType in ANY locale,
     * then return the type string for the target $locale.
     * Falls back to the original string if nothing is found.
     */
    private function mapCustomTypeToLocale(string $customType, string $locale): string
    {
        $customTypeLower = mb_strtolower(trim($customType));
        $locales = Language::query()
            ->pluck('code')
            ->map(fn($c) => strtolower(trim($c)))
            ->filter()
            ->values()
            ->all() ?: ['en'];

        $seed = \App\Models\Category::query()
            ->where('is_custom', true)
            ->where(function ($q) use ($locales, $customTypeLower) {
                foreach ($locales as $i => $code) {
                    $method = $i === 0 ? 'whereRaw' : 'orWhereRaw';
                    $q->{$method}(
                        "LOWER(TRIM(JSON_UNQUOTE(JSON_EXTRACT(type, '$.\"{$code}\"')))) = ?",
                        [$customTypeLower]
                    );
                }
            })
            ->first();

        if (!$seed) {
            return $customType;
        }

        // Prefer target locale, then any non-empty translation
        $mapped = $seed->getTranslation('type', $locale, false);
        if (is_string($mapped) && trim($mapped) !== '') {
            return trim($mapped);
        }

        foreach ($locales as $code) {
            $t = $seed->getTranslation('type', $code, false);
            if (is_string($t) && trim($t) !== '') {
                return trim($t);
            }
        }

        return $customType;
    }
}
