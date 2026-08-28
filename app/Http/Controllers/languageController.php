<?php

namespace App\Http\Controllers;

use App\Models\Language;
use Illuminate\Http\Request;
use Inertia\Inertia;

class languageController extends Controller
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

        $languages = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Admin/Languages/LangList', [
            'languages' => $languages,
            'filters'   => $request->only(['search']),
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
        $locale = app()->getLocale();

        if (!in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }

        Language::create([
            'code' => $request->code,
            'name' => $request->name,
        ]);

        return redirect()
            ->route('role.languages.list', [
                'rolePrefix' => $rolePrefix,
            ])
            ->with('success', $locale === 'gu'
                ? 'ભાષા સફળતાપૂર્વક બનાવવામાં આવી.'
                : 'Language created successfully.');
    }

    public function update($rolePrefix, Request $request, Language $language)
    {
        $request->validate([
            'code' => 'required|string|max:10|unique:languages,code,' . $language->id,
            'name' => 'required|string|max:255',
        ]);
        $locale = app()->getLocale();

        if (!in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }

        $language->update([
            'code' => $request->code,
            'name' => $request->name,
        ]);

        return redirect()
            ->route('role.languages.list', [
                'rolePrefix' => $rolePrefix,
            ])
            ->with('success', $locale === 'gu'
                ? 'ભાષા સફળતાપૂર્વક અપડેટ કરવામાં આવી.'
                : 'Language updated successfully.');
    }

    public function destroy($rolePrefix, Language $language)
    {
        $locale = app()->getLocale();

        if (!in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }
        // Optional: prevent delete if users are using this language
        if ($language->users()->exists()) {
            return redirect()
                ->back()
                ->with('error', $locale === 'gu'
                    ? 'વપરાશકર્તાઓને સોંપેલ ભાષા કાઢી શકાતી નથી.'
                    : 'Cannot delete language that is assigned to users.');
        }

        $language->delete();

        return redirect()
            ->back()
            ->with('success', $locale === 'gu'
                ? 'ભાષા સફળતાપૂર્વક કાઢી નાખવામાં આવી.'
                : 'Language deleted successfully.');
    }

    public function bulkDestroy($rolePrefix, Request $request)
    {
        $locale = app()->getLocale();

        if (!in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }
        $request->validate([
            'ids'   => 'required|array',
            'ids.*' => 'integer|exists:languages,id',
        ]);

        // Optional: skip languages that have users
        $languages = Language::whereIn('id', $request->ids)->get();

        $deleted = 0;
        foreach ($languages as $language) {
            if (!$language->users()->exists()) {
                $language->delete();
                $deleted++;
            }
        }

        return redirect()
            ->back()
            ->with('success', $locale === 'gu'
                ? "{$deleted} ભાષા સફળતાપૂર્વક કાઢી નાખવામાં આવી."
                : "{$deleted} language(s) deleted successfully.");
    }
}
