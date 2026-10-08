<?php

namespace App\Http\Controllers\Category;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Language;
use App\Models\Pad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CustomCategoryController extends Controller
{
    // ─── Helpers ─────────────────────────────────────────────────────────────

    private function supportedLocales(): array
    {
        $codes = Language::query()->pluck('code')->filter()->values()->all();
        return !empty($codes) ? $codes : ['en', 'gu'];
    }

    private function resolveLocale(?string $locale = null): string
    {
        $locale = $locale ?: app()->getLocale();
        $locales = $this->supportedLocales();
        return in_array($locale, $locales, true) ? $locale : ($locales[0] ?? 'en');
    }

    private function t($model, string $field, string $locale): string
    {
        if (!$model)
            return '';

        $value = $model->getTranslation($field, $locale, false);
        if (is_string($value) && $value !== '')
            return $value;

        foreach ($this->supportedLocales() as $code) {
            $fallback = $model->getTranslation($field, $code, false);
            if (is_string($fallback) && $fallback !== '')
                return $fallback;
        }
        return '';
    }

    // ─── LIST ────────────────────────────────────────────────────────────────
    public function customCategoryList(Request $request)
    {
        // dd('d');
        $locale = $this->resolveLocale();
        $locales = $this->supportedLocales();

        $search = trim((string) $request->get('search', ''));
        $letter = trim((string) $request->get('letter', ''));
        $customType = trim((string) $request->get('custom_type', '')); // from navbar

        $query = Category::query()
            ->where('is_custom', true)
            ->withCount('pads');

        // Filter by selected custom type from navbar
        if ($customType !== '') {
            $query->where(function ($q) use ($locales, $customType) {
                foreach ($locales as $i => $code) {
                    $method = $i === 0 ? 'whereRaw' : 'orWhereRaw';
                    $q->{$method}(
                        "LOWER(JSON_UNQUOTE(JSON_EXTRACT(type, '$.\"{$code}\"'))) = ?",
                        [mb_strtolower($customType)]
                    );
                }
            });
        }

        // Letter filter
        if ($letter !== '') {
            $query->where(function ($q) use ($letter, $locale, $locales) {
                $q->orWhere("value->{$locale}", 'like', $letter . '%');
                foreach ($locales as $code) {
                    if ($code === $locale)
                        continue;
                    $q->orWhere("value->{$code}", 'like', $letter . '%');
                }
            });
        }

        // Search
        if ($search !== '') {
            $searchLike = '%' . $search . '%';

            $query->where(function ($q) use ($search, $searchLike, $locales) {
                if (is_numeric($search)) {
                    $q->where('id', $search)->orWhere('id', 'like', $searchLike);
                }

                foreach ($locales as $code) {
                    $q->orWhere("value->{$code}", 'like', $searchLike)
                        ->orWhere("type->{$code}", 'like', $searchLike);
                }

                $q->orWhereHas('pads', function ($padQuery) use ($searchLike, $locales) {
                    $padQuery->where(function ($pq) use ($searchLike, $locales) {
                        foreach ($locales as $code) {
                            $pq->orWhere("title->{$code}", 'like', $searchLike)
                                ->orWhere("value->{$code}", 'like', $searchLike);
                        }
                        $pq->orWhere('status', 'like', $searchLike)
                            ->orWhere('establish_date', 'like', $searchLike);
                    });
                });
            });
        }

        $items = $query
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(function ($category) use ($locale) {
                return [
                    'id' => $category->id,
                    'type' => $this->t($category, 'type', $locale),
                    'value' => $this->t($category, 'value', $locale),
                    'type_map' => $category->getTranslations('type'),
                    'value_map' => $category->getTranslations('value'),
                    'pads_count' => $category->pads_count,
                    'created_at' => optional($category->created_at)?->toIso8601String(),
                ];
            });

        return Inertia::render('Admin/Categories/Custom/CustomList', [
            'items' => $items,
            'filters' => [
                'search' => $search,
                'letter' => $letter,
                'custom_type' => $customType,
            ],
            'locale' => $locale,
        ]);
    }

    // ─── CREATE FORM ─────────────────────────────────────────────────────────

    public function customCategoryForm()
    {
        return Inertia::render('Admin/Categories/Custom/CustomForm', [
            'languages' => Language::orderBy('id')->get(['id', 'code', 'name']),
            'custom' => null,
        ]);
    }

    // ─── STORE ───────────────────────────────────────────────────────────────

    public function customCategoryStore($rolePrefix, Request $request)
    {
        $locale = $this->resolveLocale($request->input('locale'));
        $locales = $this->supportedLocales();

        $rules = ['locale' => 'nullable|string'];
        foreach ($locales as $code) {
            $rules["type.{$code}"] = 'nullable|string|max:100';
            $rules["value.{$code}"] = 'nullable|string|max:255';
        }

        $validated = $request->validate($rules);

        $hasType = $hasValue = false;
        foreach ($locales as $code) {
            if (trim($validated['type'][$code] ?? '') !== '')
                $hasType = true;
            if (trim($validated['value'][$code] ?? '') !== '')
                $hasValue = true;
        }

        if (!$hasType || !$hasValue) {
            return back()
                ->withErrors([
                    "type.{$locale}" => 'type_required',
                    "value.{$locale}" => 'value_required',
                ])
                ->withInput();
        }

        $category = new Category([
            'created_by' => Auth::id(),
            'is_custom' => true,
        ]);

        foreach ($locales as $code) {
            $typeText = trim($validated['type'][$code] ?? '');
            $valueText = trim($validated['value'][$code] ?? '');
            if ($typeText !== '')
                $category->setTranslation('type', $code, $typeText);
            if ($valueText !== '')
                $category->setTranslation('value', $code, $valueText);
        }

        $category->save();

        return redirect()
            ->route('role.category.customcategorylist', ['rolePrefix' => $rolePrefix])
            ->with('success', 'custom_category_created_success');
    }

    // ─── EDIT FORM ───────────────────────────────────────────────────────────

    public function customCategoryEdit($rolePrefix, Category $category)
    {
        if (!$category->is_custom) {
            abort(404);
        }

        $locales = $this->supportedLocales();
        $typeMap = [];
        $valueMap = [];

        foreach ($locales as $code) {
            $typeMap[$code] = $category->getTranslation('type', $code, false) ?: '';
            $valueMap[$code] = $category->getTranslation('value', $code, false) ?: '';
        }

        return Inertia::render('Admin/Categories/Custom/CustomForm', [
            'custom' => [
                'id' => $category->id,
                'type' => $typeMap,
                'value' => $valueMap,
            ],
            'languages' => Language::orderBy('id')->get(['id', 'code', 'name']),
        ]);
    }

    // ─── UPDATE ──────────────────────────────────────────────────────────────

    public function customCategoryUpdate($rolePrefix, Request $request, Category $category)
    {
        if (!$category->is_custom) {
            abort(404);
        }

        $locale = $this->resolveLocale($request->input('locale'));
        $locales = $this->supportedLocales();

        $rules = ['locale' => 'nullable|string'];
        foreach ($locales as $code) {
            $rules["type.{$code}"] = 'nullable|string|max:100';
            $rules["value.{$code}"] = 'nullable|string|max:255';
        }

        $validated = $request->validate($rules);

        $hasType = $hasValue = false;
        foreach ($locales as $code) {
            if (trim($validated['type'][$code] ?? '') !== '')
                $hasType = true;
            if (trim($validated['value'][$code] ?? '') !== '')
                $hasValue = true;
        }

        if (!$hasType || !$hasValue) {
            return back()
                ->withErrors([
                    "type.{$locale}" => 'type_required',
                    "value.{$locale}" => 'value_required',
                ])
                ->withInput();
        }

        foreach ($locales as $code) {
            $typeText = trim($validated['type'][$code] ?? '');
            $valueText = trim($validated['value'][$code] ?? '');
            if ($typeText !== '')
                $category->setTranslation('type', $code, $typeText);
            if ($valueText !== '')
                $category->setTranslation('value', $code, $valueText);
        }

        $category->save();

        return redirect()
            ->route('role.category.customcategorylist', ['rolePrefix' => $rolePrefix])
            ->with('success', 'custom_category_updated_success');
    }

    // ─── SHOW PADS ───────────────────────────────────────────────────────────

    public function customCategoryPadsShow($rolePrefix, Category $category)
    {
        if (!$category->is_custom) {
            abort(404);
        }

        $locale = $this->resolveLocale();

        $pads = $category->pads()
            ->with(['categories:id,type,value', 'recordedVersion'])
            ->latest()
            ->get()
            ->map(function ($pad) use ($locale) {
                return [
                    'id' => $pad->id,
                    'title' => $this->t($pad, 'title', $locale),
                    'value' => $this->t($pad, 'value', $locale),
                    'status' => $pad->status,
                    'establish_date' => $pad->establish_date
                        ? \Carbon\Carbon::parse($pad->establish_date)->format('Y-m-d')
                        : null,
                    'created_at' => optional($pad->created_at)?->toIso8601String(),
                    'updated_at' => optional($pad->updated_at)?->toIso8601String(),
                    'categories' => $pad->categories->map(fn($c) => [
                        'id' => $c->id,
                        'type' => $this->t($c, 'type', $locale),
                        'value' => $this->t($c, 'value', $locale),
                    ])->values(),
                    'recorded_version' => $pad->recordedVersion ? [
                        'id' => $pad->recordedVersion->id,
                        'media_type' => $pad->recordedVersion->media_type,
                        'file_url' => $pad->recordedVersion->file_url,
                        'singer' => $this->t($pad->recordedVersion, 'singer', $locale),
                        'publisher' => $this->t($pad->recordedVersion, 'publisher', $locale),
                        'vocalization' => $this->t($pad->recordedVersion, 'vocalization', $locale),
                        'recording_type' => $pad->recordedVersion->recording_type,
                    ] : null,
                ];
            });

        return Inertia::render('Admin/Categories/Custom/CustomShowPads', [
            'category' => [
                'id' => $category->id,
                'type' => $this->t($category, 'type', $locale),
                'name' => $this->t($category, 'value', $locale),
            ],
            'pads' => $pads,
            'locale' => $locale,
        ]);
    }

    // ─── DESTROY ─────────────────────────────────────────────────────────────

    public function destroy($rolePrefix, Request $request, $id)
    {
        $category = Category::findOrFail($id);

        if (!$category->is_custom) {
            abort(404);
        }

        $deleteRelatedPads = $request->boolean('delete_related_pads');

        if ($deleteRelatedPads) {
            $padIds = $category->pads()->pluck('pads.id');
            if ($padIds->isNotEmpty()) {
                Pad::whereIn('id', $padIds)->delete();
            }
        }

        $category->delete();

        return redirect()
            ->route('role.category.customcategorylist', ['rolePrefix' => $rolePrefix])
            ->with('success', $deleteRelatedPads
                ? 'custom_category_and_pads_deleted_success'
                : 'custom_category_deleted_success');
    }

    public function bulkDestroy($rolePrefix, Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:categories,id',
        ]);

        $ids = $request->input('ids', []);
        $deletePads = $request->boolean('delete_related_pads');

        if (empty($ids)) {
            return back()->with('error', 'select_at_least_one');
        }

        $categories = Category::whereIn('id', $ids)
            ->where('is_custom', true)
            ->get();

        foreach ($categories as $category) {
            if ($deletePads) {
                $category->pads()->delete();
            }
        }

        Category::whereIn('id', $categories->pluck('id'))->delete();

        return back()->with('success', $deletePads
            ? 'custom_categories_and_pads_deleted_success'
            : 'custom_categories_deleted_success');
    }
}
