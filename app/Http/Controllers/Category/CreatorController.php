<?php

namespace App\Http\Controllers\Category;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Language;
use App\Models\Pad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CreatorController extends Controller
{
    // ─── Helpers (same pattern as PadController) ─────────────────────────────

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
        if (!$model) {
            return '';
        }

        $value = $model->getTranslation($field, $locale, false);
        if (is_string($value) && $value !== '') {
            return $value;
        }

        foreach ($this->supportedLocales() as $code) {
            $fallback = $model->getTranslation($field, $code, false);
            if (is_string($fallback) && $fallback !== '') {
                return $fallback;
            }
        }

        return '';
    }

    /**
     * Canonical type key used for "Creator".
     * We always store English as "Creator" and other languages as translations.
     * This keeps queries language-agnostic.
     */
    private function creatorTypeKey(): string
    {
        return 'Creator';
    }

    /**
     * Check whether a category is a Creator type (language-agnostic).
     */
    private function isCreatorType(Category $category): bool
    {
        $typeEn = strtolower(trim($category->getTranslation('type', 'en', false) ?? ''));

        return $typeEn === strtolower($this->creatorTypeKey());
    }

    // ─── LIST ────────────────────────────────────────────────────────────────

    public function creatorList(Request $request)
    {
        $locale = $this->resolveLocale();
        $locales = $this->supportedLocales();

        $search = trim((string) $request->get('search', ''));
        $letter = trim((string) $request->get('letter', ''));

        $query = Category::query()
            ->where(function ($q) use ($locales) {
                // Match type = "Creator" in any supported language
                foreach ($locales as $code) {
                    $q->orWhere("type->{$code}", $this->creatorTypeKey());
                }
                // Also match the Gujarati (and any future) translation if stored differently
                $q->orWhere("type->gu", 'રચયિતા');
            })
            ->withCount('pads');

        // Letter filter (dynamic per current locale)
        if ($letter !== '') {
            $query->where(function ($q) use ($letter, $locale, $locales) {
                // Prefer current locale
                $q->orWhere("value->{$locale}", 'like', $letter . '%');

                // Fallback to all other locales
                foreach ($locales as $code) {
                    if ($code === $locale) {
                        continue;
                    }
                    $q->orWhere("value->{$code}", 'like', $letter . '%');
                }
            });
        }

        // Search (fully dynamic across all locales + related pads)
        if ($search !== '') {
            $searchLike = '%' . $search . '%';

            $query->where(function ($q) use ($search, $searchLike, $locales) {
                // ID search
                if (is_numeric($search)) {
                    $q->where('id', $search)
                        ->orWhere('id', 'like', $searchLike);
                }

                // Creator name / type in every language
                foreach ($locales as $code) {
                    $q->orWhere("value->{$code}", 'like', $searchLike)
                        ->orWhere("type->{$code}", 'like', $searchLike);
                }

                // Related pads – FIXED (wrap conditions so foreign key stays AND)
                $q->orWhereHas('pads', function ($padQuery) use ($searchLike, $locales) {
                    $padQuery->where(function ($pq) use ($searchLike, $locales) {
                        foreach ($locales as $code) {
                            $pq->orWhere("title->{$code}", 'like', $searchLike)
                                ->orWhere("value->{$code}", 'like', $searchLike);
                        }

                        $pq->orWhere('status', 'like', $searchLike)
                            ->orWhere('establish_date', 'like', $searchLike);
                    })
                        ->orWhereHas('categories', function ($cq) use ($searchLike, $locales) {
                            $cq->where(function ($c) use ($searchLike, $locales) {
                                foreach ($locales as $code) {
                                    $c->orWhere("type->{$code}", 'like', $searchLike)
                                        ->orWhere("value->{$code}", 'like', $searchLike);
                                }
                            });
                        })
                        ->orWhereHas('recordedVersion', function ($rq) use ($searchLike, $locales) {
                            $rq->where(function ($r) use ($searchLike, $locales) {
                                foreach ($locales as $code) {
                                    $r->orWhere("singer->{$code}", 'like', $searchLike)
                                        ->orWhere("publisher->{$code}", 'like', $searchLike)
                                        ->orWhere("vocalization->{$code}", 'like', $searchLike);
                                }

                                $r->orWhere('media_type', 'like', $searchLike)
                                    ->orWhere('recording_type', 'like', $searchLike)
                                    ->orWhere('file_url', 'like', $searchLike);
                            });
                        });
                });
            });
        }

        $creators = $query
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(function ($category) use ($locale) {
                return [
                    'id' => $category->id,
                    'type' => $this->t($category, 'type', $locale),
                    'value' => $this->t($category, 'value', $locale), // already localized string
                    // Keep full map if frontend needs all languages
                    'value_map' => $category->getTranslations('value'),
                    'pads_count' => $category->pads_count,
                    'created_at' => optional($category->created_at)?->toIso8601String(),
                ];
            });

        return Inertia::render('Admin/Categories/Creator/CreatorList', [
            'creators' => $creators,
            'filters' => [
                'search' => $search,
                'letter' => $letter,
            ],
            'locale' => $locale,
        ]);
    }

    // ─── CREATE FORM ─────────────────────────────────────────────────────────

    public function creatorForm()
    {
        return Inertia::render('Admin/Categories/Creator/CreatorForm', [
            'languages' => Language::orderBy('id')->get(['id', 'code', 'name']),
        ]);
    }

    // ─── STORE ───────────────────────────────────────────────────────────────

    public function creatorStore($rolePrefix, Request $request)
    {
        $locale = $this->resolveLocale($request->input('locale'));
        $locales = $this->supportedLocales();

        // Dynamic validation: accept value.{any_locale}
        $rules = [
            'locale' => 'nullable|string',
        ];
        foreach ($locales as $code) {
            $rules["value.{$code}"] = 'nullable|string|max:255';
        }

        $validated = $request->validate($rules);

        // At least one language must have a value
        $hasValue = false;
        foreach ($locales as $code) {
            if (trim($validated['value'][$code] ?? '') !== '') {
                $hasValue = true;
                break;
            }
        }

        if (!$hasValue) {
            return back()
                ->withErrors(["value.{$locale}" => 'creator_name_required'])
                ->withInput();
        }

        $category = new Category();
        $category->created_by = Auth::id();

        // Always set the canonical English type key
        $category->setTranslation('type', 'en', $this->creatorTypeKey());

        // Set type translation for every supported language (fallback to English key)
        foreach ($locales as $code) {
            if ($code === 'en') {
                continue;
            }
            // You can later load these from a language file if you want
            $category->setTranslation('type', $code, $code === 'gu' ? 'રચયિતા' : $this->creatorTypeKey());
        }

        // Set value for every language that was submitted
        foreach ($locales as $code) {
            $text = trim($validated['value'][$code] ?? '');
            if ($text !== '') {
                $category->setTranslation('value', $code, $text);
            }
        }

        $category->save();

        return redirect()
            ->route('role.category.creatorlist', ['rolePrefix' => $rolePrefix])
            ->with('success', 'creator_created_success');
    }

    // ─── EDIT FORM ───────────────────────────────────────────────────────────

    public function creatorEdit($rolePrefix, Category $category)
    {
        if (!$this->isCreatorType($category)) {
            abort(404);
        }

        $locales = $this->supportedLocales();

        $valueMap = [];
        foreach ($locales as $code) {
            $valueMap[$code] = $category->getTranslation('value', $code, false) ?: '';
        }

        return Inertia::render('Admin/Categories/Creator/CreatorForm', [
            'creator' => [
                'id' => $category->id,
                'value' => $valueMap,
            ],
            'languages' => Language::orderBy('id')->get(['id', 'code', 'name']),
        ]);
    }

    // ─── UPDATE ──────────────────────────────────────────────────────────────

    public function creatorUpdate($rolePrefix, Request $request, Category $category)
    {
        if (!$this->isCreatorType($category)) {
            abort(404);
        }

        $locale = $this->resolveLocale($request->input('locale'));
        $locales = $this->supportedLocales();

        $rules = ['locale' => 'nullable|string'];
        foreach ($locales as $code) {
            $rules["value.{$code}"] = 'nullable|string|max:255';
        }

        $validated = $request->validate($rules);

        $hasValue = false;
        foreach ($locales as $code) {
            if (trim($validated['value'][$code] ?? '') !== '') {
                $hasValue = true;
                break;
            }
        }

        if (!$hasValue) {
            return back()
                ->withErrors(["value.{$locale}" => 'creator_name_required'])
                ->withInput();
        }

        // Keep canonical type
        $category->setTranslation('type', 'en', $this->creatorTypeKey());
        foreach ($locales as $code) {
            if ($code === 'en')
                continue;
            $category->setTranslation('type', $code, $code === 'gu' ? 'રચયિતા' : $this->creatorTypeKey());
        }

        foreach ($locales as $code) {
            $text = trim($validated['value'][$code] ?? '');
            if ($text !== '') {
                $category->setTranslation('value', $code, $text);
            }
        }

        $category->save();

        return redirect()
            ->route('role.category.creatorlist', ['rolePrefix' => $rolePrefix])
            ->with('success', 'creator_updated_success');
    }

    // ─── SHOW PADS ───────────────────────────────────────────────────────────

    public function creatorPadsShow($rolePrefix, Category $category)
    {
        if (!$this->isCreatorType($category)) {
            abort(404, 'This category is not a Creator.');
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

        return Inertia::render('Admin/Categories/Creator/CreatorShowPads', [
            'swami' => [
                'id' => $category->id,
                'name' => $this->t($category, 'value', $locale),
                'type' => $this->t($category, 'type', $locale),
            ],
            'pads' => $pads,
            'locale' => $locale,
        ]);
    }

    // ─── DESTROY ─────────────────────────────────────────────────────────────

    public function destroy($rolePrefix, Request $request, $id)
    {
        $creator = Category::findOrFail($id);

        if (!$this->isCreatorType($creator)) {
            abort(404);
        }

        $deleteRelatedPads = $request->boolean('delete_related_pads');

        if ($deleteRelatedPads) {
            $padIds = $creator->pads()->pluck('pads.id');
            if ($padIds->isNotEmpty()) {
                Pad::whereIn('id', $padIds)->delete();
            }
        }

        $creator->delete();

        return redirect()
            ->route('role.category.creatorlist', ['rolePrefix' => $rolePrefix])
            ->with('success', $deleteRelatedPads
                ? 'creator_and_pads_deleted_success'
                : 'creator_deleted_success');
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

        $creators = Category::whereIn('id', $ids)->get();

        foreach ($creators as $creator) {
            if (!$this->isCreatorType($creator)) {
                continue;
            }

            if ($deletePads) {
                $creator->pads()->delete();
            }
        }

        Category::whereIn('id', $ids)->delete();

        return back()->with('success', $deletePads
            ? 'creators_and_pads_deleted_success'
            : 'creators_deleted_success');
    }
}
