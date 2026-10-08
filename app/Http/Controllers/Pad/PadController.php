<?php

namespace App\Http\Controllers\Pad;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Language;
use App\Models\Pad;
use App\Models\Pad_media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PadController extends Controller
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
     * Build full translation map for all supported locales.
     */
    private function transMap($model, string $field): array
    {
        $all = $model->getTranslations($field);
        $result = [];

        foreach ($this->supportedLocales() as $code) {
            $result[$code] = $all[$code] ?? '';
        }

        return $result;
    }

    // ─── LIST ────────────────────────────────────────────────────────────────

    public function PadList(Request $request)
    {
        $locale = $this->resolveLocale();
        $locales = $this->supportedLocales();

        $query = Pad::query()
            ->with(['categories:id,type,value', 'recordedVersion'])
            ->when($request->user()->role?->name !== 'Admin', function ($q) {
                $q->whereIn('status', ['save', 'published']);
            })
            ->latest();

        if ($search = trim((string) $request->input('search'))) {
            // $searchLike = '%' . $search . '%';
            $searchLike = '%' . mb_strtolower(trim($search)) . '%';
            $query->where(function ($q) use ($search, $searchLike, $locales) {
                if (is_numeric($search)) {
                    $q->orWhere('id', $search)
                        ->orWhere('id', 'like', $searchLike);
                }

                foreach ($locales as $code) {
                    $q->orWhereRaw(
                        "LOWER(JSON_UNQUOTE(JSON_EXTRACT(title, '$.\"{$code}\"'))) LIKE ?",
                        [mb_strtolower($searchLike)]
                    )->orWhereRaw(
                            "LOWER(JSON_UNQUOTE(JSON_EXTRACT(value, '$.\"{$code}\"'))) LIKE ?",
                            [mb_strtolower($searchLike)]
                        );
                }

                $q->orWhere('status', 'like', $searchLike)
                    ->orWhere('establish_date', 'like', $searchLike);

                $q->orWhereHas('categories', function ($cq) use ($searchLike, $locales) {
                    $cq->where(function ($c) use ($searchLike, $locales) {
                        foreach ($locales as $code) {
                            $c->orWhereRaw(
                                "LOWER(JSON_UNQUOTE(JSON_EXTRACT(type, '$.\"{$code}\"'))) LIKE ?",
                                [mb_strtolower($searchLike)]
                            )->orWhereRaw(
                                    "LOWER(JSON_UNQUOTE(JSON_EXTRACT(value, '$.\"{$code}\"'))) LIKE ?",
                                    [mb_strtolower($searchLike)]
                                );
                        }
                    });
                });

                $q->orWhereHas('recordedVersion', function ($rq) use ($searchLike, $locales) {
                    $rq->where(function ($r) use ($searchLike, $locales) {
                        foreach ($locales as $code) {
                            $r->orWhereRaw(
                                "LOWER(JSON_UNQUOTE(JSON_EXTRACT(singer, '$.\"{$code}\"'))) LIKE ?",
                                [mb_strtolower($searchLike)]
                            )->orWhereRaw(
                                    "LOWER(JSON_UNQUOTE(JSON_EXTRACT(publisher, '$.\"{$code}\"'))) LIKE ?",
                                    [mb_strtolower($searchLike)]
                                )->orWhereRaw(
                                    "LOWER(JSON_UNQUOTE(JSON_EXTRACT(vocalization, '$.\"{$code}\"'))) LIKE ?",
                                    [mb_strtolower($searchLike)]
                                );
                        }
                        $r->orWhere('media_type', 'like', $searchLike)
                            ->orWhere('recording_type', 'like', $searchLike)
                            ->orWhere('file_url', 'like', $searchLike);
                    });
                });
            });
        }

        if ($status = $request->input('status')) {
            if (in_array(strtolower($status), ['save', 'published'])) {
                $query->whereIn('status', ['save', 'published']);
            } elseif (strtolower($status) === 'draft') {
                $query->where('status', 'draft');
            }
        }

        if ($letter = trim((string) $request->input('letter'))) {
            $query->where(function ($q) use ($letter, $locales) {
                foreach ($locales as $code) {
                    $q->orWhere("title->{$code}", 'like', $letter . '%');
                }
            });
        }

        $pads = $query
            ->paginate($request->input('per_page', 10))
            ->through(function ($pad) use ($locale) {
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
                        'youtube_url' => $pad->recordedVersion->youtube_url,
                        'file_name' => $this->t($pad->recordedVersion, 'file_name', $locale),
                        'singer' => $this->t($pad->recordedVersion, 'singer', $locale),
                        'publisher' => $this->t($pad->recordedVersion, 'publisher', $locale),
                        'vocalization' => $this->t($pad->recordedVersion, 'vocalization', $locale),
                        'recording_type' => $pad->recordedVersion->recording_type,
                    ] : null,
                ];
            });

        return Inertia::render('Admin/Pads/PadList', [
            'pads' => $pads,
            'filters' => [
                'search' => $request->input('search'),
                'status' => $request->input('status'),
                'letter' => $request->input('letter'),
            ],
            'locale' => $locale,
        ]);
    }

    // ─── CREATE FORM ─────────────────────────────────────────────────────────

    // public function Create()
    // {
    //     $locale = $this->resolveLocale();

    //     $categories = Category::query()
    //         ->orderBy('id')
    //         ->get(['id', 'type', 'value'])
    //         ->map(function (Category $category) use ($locale) {
    //             // $type = $this->t($category, 'type', $locale);
    //             // $value = $this->t($category, 'value', $locale);
    //             $type = $category->getTranslation('type', $locale, false) ?: '';
    //             $value = $category->getTranslation('value', $locale, false) ?: '';
    //             return [
    //                 'id' => $category->id,
    //                 'type' => $type,
    //                 'value' => $value,
    //             ];
    //         })
    //         ->filter(fn($c) => $c['type'] !== '' && $c['value'] !== '')
    //         ->values();

    //     return Inertia::render('Admin/Pads/PadCreate', [
    //         'categories' => $categories,
    //         'locale' => $locale,
    //         'languages' => Language::orderBy('name')->get(['id', 'code', 'name']),
    //     ]);
    // }

    public function Create()
    {
        $locale = $this->resolveLocale();

        $categories = Category::query()
            ->orderBy('id')
            ->get(['id', 'type', 'value'])
            ->map(function (Category $category) {
                $typeMap = $category->getTranslations('type');
                $valueMap = $category->getTranslations('value');

                $hasType = collect($typeMap)
                    ->filter(fn($v) => is_string($v) && trim($v) !== '')
                    ->isNotEmpty();

                $hasValue = collect($valueMap)
                    ->filter(fn($v) => is_string($v) && trim($v) !== '')
                    ->isNotEmpty();

                if (!$hasType || !$hasValue) {
                    return null;
                }

                return [
                    'id' => $category->id,
                    'type' => $typeMap,   // { en: "...", gu: "..." }
                    'value' => $valueMap,  // { en: "...", gu: "..." }
                ];
            })
            ->filter()
            ->values();

        return Inertia::render('Admin/Pads/PadCreate', [
            'categories' => $categories,
            'locale' => $locale,
            'languages' => Language::orderBy('name')->get(['id', 'code', 'name']),
        ]);
    }

    // ─── SHOW ────────────────────────────────────────────────────────────────

    public function show($rolePrefix, Pad $pad)
    {
        $pad->load(['categories:id,type,value', 'recordedVersions']);
        $locale = $this->resolveLocale();

        $payload = [
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
            'recorded_versions' => $pad->recordedVersions->map(fn($rv) => [
                'id' => $rv->id,
                'media_type' => $rv->media_type,
                'file_url' => $rv->file_url,
                'youtube_url' => $rv->youtube_url,
                'file_name' => $this->t($rv, 'file_name', $locale),
                'singer' => $this->t($rv, 'singer', $locale),
                'publisher' => $this->t($rv, 'publisher', $locale),
                'vocalization' => $this->t($rv, 'vocalization', $locale),
                'raga' => $this->t($rv, 'raga', $locale),
                'recording_type' => $rv->recording_type,
            ])->values(),
            'locale' => $locale,
        ];

        return Inertia::render('Admin/Pads/Show', [
            'pad' => $payload,
            'is_favorited' => $pad->isFavoritedBy(Auth::user()),
        ]);
    }

    // ─── STORE ───────────────────────────────────────────────────────────────

    public function store($rolePrefix, Request $request)
    {
        $locale = $this->resolveLocale($request->input('locale'));

        $request->validate([
            "title.{$locale}" => 'required|string|max:255',
            "value.{$locale}" => 'required|string',
            'status' => 'required|in:save,draft',
            'establish_date' => 'nullable|date',

            'categories' => 'nullable|array',
            'categories.*.id' => 'nullable|integer|exists:categories,id',
            // Accept either plain string OR multilingual map
            'categories.*.type' => 'required',           // string OR array
            'categories.*.type.*' => 'nullable|string',
            'categories.*.value' => 'required',           // string OR array
            'categories.*.value.*' => 'nullable|string',
            'categories.*.isCustomValue' => 'nullable|boolean',

            'recorded_versions' => 'nullable|array',
            'recorded_versions.*.media_type' => 'nullable|in:audio,video',
            'recorded_versions.*.file' => 'nullable|file|extensions:mp3,wav,m4a,ogg,mp4,mov,avi|max:1024000',
            'recorded_versions.*.recording_type' => 'nullable|in:live,studio',
            "recorded_versions.*.singer.{$locale}" => 'nullable|string',
            "recorded_versions.*.publisher.{$locale}" => 'nullable|string',
            "recorded_versions.*.vocalization.{$locale}" => 'nullable|string',
            "recorded_versions.*.raga.{$locale}" => 'nullable|string',
            "recorded_versions.*.file_name.{$locale}" => 'nullable|string',
            "recorded_versions.*.youtube_url" => 'nullable|url',
        ]);

        try {
            $pad = new Pad([
                'status' => $request->status ?? 'draft',
                'establish_date' => $request->establish_date,
                'created_by' => Auth::id(),
            ]);

            $pad->setTranslation('title', $locale, $request->input("title.{$locale}"));
            $pad->setTranslation('value', $locale, $request->input("value.{$locale}"));
            $pad->save();

            // Categories
            // $categoryIds = [];
            // foreach ($request->input('categories', []) as $cat) {
            //     $type = is_array($cat['type'] ?? null)
            //         ? ($cat['type'][$locale] ?? reset($cat['type']) ?? '')
            //         : (string) ($cat['type'] ?? '');
            //     $value = is_array($cat['value'] ?? null)
            //         ? ($cat['value'][$locale] ?? reset($cat['value']) ?? '')
            //         : (string) ($cat['value'] ?? '');

            //     if ($type === '' || $value === '') {
            //         continue;
            //     }

            //     $category = $this->findOrCreateCategory($type, $value, $locale);
            //     $categoryIds[] = $category->id;
            // }
            // $pad->categories()->sync($categoryIds);

            // Categories – support both plain string and multilingual object
            $categoryIds = [];

            foreach ($request->input('categories', []) as $cat) {
                $typeMap = is_array($cat['type'] ?? null) ? $cat['type'] : null;
                $valueMap = is_array($cat['value'] ?? null) ? $cat['value'] : null;

                // Plain string → put under current locale only
                if ($typeMap === null) {
                    $typeMap = [$locale => (string) ($cat['type'] ?? '')];
                }
                if ($valueMap === null) {
                    $valueMap = [$locale => (string) ($cat['value'] ?? '')];
                }

                // Clean empty values
                $typeMap = array_filter(array_map('trim', $typeMap));
                $valueMap = array_filter(array_map('trim', $valueMap));

                if (empty($typeMap) || empty($valueMap)) {
                    continue;
                }

                $category = $this->findOrCreateCategoryMultilingual($typeMap, $valueMap);
                $categoryIds[] = $category->id;
            }

            $pad->categories()->sync($categoryIds);

            // Recorded versions
            $versions = $request->input('recorded_versions', []);
            $files = $request->file('recorded_versions', []);

            foreach ($versions as $index => $media) {
                $path = null;

                if (isset($files[$index]['file']) && $files[$index]['file']->isValid()) {
                    $originalName = $files[$index]['file']->getClientOriginalName();
                    $uniqueName = uniqid() . '_' . $originalName;
                    $path = $files[$index]['file']->storeAs('pad-media', $uniqueName, 'public');
                }

                $mediaType = $media['media_type'] ?? null;
                if ($mediaType !== null && !in_array($mediaType, ['audio', 'video'], true)) {
                    $mediaType = null;
                }
                $rv = new Pad_media([
                    'media_type' => $mediaType,
                    'file_url' => $path,
                    'youtube_url' => $media['youtube_url'] ?? null,
                    'recording_type' => $media['recording_type'] ?? null,
                ]);

                foreach (['file_name', 'singer', 'publisher', 'vocalization', 'raga'] as $field) {
                    $text = data_get($media, "{$field}.{$locale}");
                    if (is_string($text) && $text !== '') {
                        $rv->setTranslation($field, $locale, $text);
                    }
                }

                $hasContent = $path
                    || !empty($rv->media_type)
                    || !empty($rv->recording_type)
                    || !empty($rv->youtube_url)
                    || $rv->getTranslation('singer', $locale, false)
                    || $rv->getTranslation('publisher', $locale, false)
                    || $rv->getTranslation('vocalization', $locale, false)
                    || $rv->getTranslation('raga', $locale, false)
                    || $rv->getTranslation('file_name', $locale, false);

                if ($hasContent) {
                    $pad->recordedVersions()->save($rv);
                }
            }

            return redirect()
                ->route('role.pads.list', ['rolePrefix' => $rolePrefix])
                ->with('success', 'pad_created_success');
        } catch (\Throwable $e) {
            Log::error('Pad store failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withInput()
                ->with('error', 'something_went_wrong');
        }
    }

    // ─── EDIT FORM ───────────────────────────────────────────────────────────

    public function edit($rolePrefix, Pad $pad)
    {
        $pad->load(['categories', 'recordedVersions']);
        $locale = $this->resolveLocale();

        // Full translation maps so CategorySelector can search across all languages
        $mapCategoryFull = function (Category $c) {
            $typeMap = $c->getTranslations('type');
            $valueMap = $c->getTranslations('value');

            $hasType = collect($typeMap)
                ->filter(fn($v) => is_string($v) && trim($v) !== '')
                ->isNotEmpty();

            $hasValue = collect($valueMap)
                ->filter(fn($v) => is_string($v) && trim($v) !== '')
                ->isNotEmpty();

            if (!$hasType || !$hasValue) {
                return null;
            }

            return [
                'id' => $c->id,
                'type' => $typeMap,   // { en: "...", gu: "...", ... }
                'value' => $valueMap,
            ];
        };

        return Inertia::render('Admin/Pads/PadEdit', [
            'pad' => [
                'id' => $pad->id,
                'title' => $this->transMap($pad, 'title'),
                'value' => $this->transMap($pad, 'value'),
                'status' => $pad->status,
                'establish_date' => optional($pad->establish_date)->format('Y-m-d'),
                // Pad's selected categories – full maps
                'categories' => $pad->categories
                    ->map($mapCategoryFull)
                    ->filter()
                    ->values(),
                'recorded_versions' => $pad->recordedVersions->map(function ($rv) {
                    return [
                        'id' => $rv->id,
                        'media_type' => $rv->media_type,
                        'file_url' => $rv->file_url,
                        'youtube_url' => $rv->youtube_url,
                        'file_name' => $this->transMap($rv, 'file_name'),
                        'singer' => $this->transMap($rv, 'singer'),
                        'publisher' => $this->transMap($rv, 'publisher'),
                        'vocalization' => $this->transMap($rv, 'vocalization'),
                        'raga' => $this->transMap($rv, 'raga'),
                        'recording_type' => $rv->recording_type,
                    ];
                })->values(),
            ],

            // All categories for the selector – full maps (search any language, display current)
            'categories' => Category::query()
                ->orderBy('id')
                ->get(['id', 'type', 'value'])
                ->map($mapCategoryFull)
                ->filter()
                ->values(),

            'locale' => $locale,
            'languages' => Language::orderBy('name')->get(['id', 'code', 'name']),
        ]);
    }

    // ─── UPDATE ──────────────────────────────────────────────────────────────

    public function update($rolePrefix, Request $request, Pad $pad)
    {
        $locale = $this->resolveLocale($request->input('locale'));

        $request->validate([
            "title.{$locale}" => 'required|string|max:255',
            "value.{$locale}" => 'required|string',
            'status' => 'required|in:save,draft',
            'establish_date' => 'nullable|date',

            'categories' => 'nullable|array',
            'categories.*.id' => 'nullable|integer|exists:categories,id',
            // Accept string OR multilingual map (array)
            'categories.*.type' => 'nullable',
            'categories.*.type.*' => 'nullable|string',
            'categories.*.value' => 'nullable',
            'categories.*.value.*' => 'nullable|string',
            'categories.*.isCustomValue' => 'nullable|boolean',

            'recorded_versions' => 'nullable|array',
            'recorded_versions.*.id' => 'nullable|integer',
            'recorded_versions.*.media_type' => 'nullable|in:audio,video',
            'recorded_versions.*.file' => 'nullable|file|extensions:mp3,wav,m4a,ogg,mp4,mov,avi|max:1024000',
            'recorded_versions.*.recording_type' => 'nullable|in:live,studio',
            "recorded_versions.*.singer.{$locale}" => 'nullable|string',
            "recorded_versions.*.publisher.{$locale}" => 'nullable|string',
            "recorded_versions.*.vocalization.{$locale}" => 'nullable|string',
            "recorded_versions.*.raga.{$locale}" => 'nullable|string',
            "recorded_versions.*.file_name.{$locale}" => 'nullable|string',
            "recorded_versions.*.youtube_url" => 'nullable|url',
        ]);

        // dd($request->all());
        DB::transaction(function () use ($request, $pad, $locale) {
            $pad->status = $request->status;
            $pad->establish_date = $request->establish_date;

            $titleText = $request->input("title.{$locale}");
            $valueText = $request->input("value.{$locale}");

            if (is_string($titleText) && $titleText !== '') {
                $pad->setTranslation('title', $locale, $titleText);
            }
            if (is_string($valueText) && $valueText !== '') {
                $pad->setTranslation('value', $locale, $valueText);
            }

            $pad->save();

            // Categories
            // $categoryIds = [];
            // foreach ($request->categories ?? [] as $cat) {
            //     $type = is_array($cat['type'] ?? null)
            //         ? ($cat['type'][$locale] ?? reset($cat['type']) ?? '')
            //         : (string) ($cat['type'] ?? '');
            //     $value = is_array($cat['value'] ?? null)
            //         ? ($cat['value'][$locale] ?? reset($cat['value']) ?? '')
            //         : (string) ($cat['value'] ?? '');

            //     if ($type === '' || $value === '') {
            //         continue;
            //     }

            //     $category = $this->findOrCreateCategory($type, $value, $locale);
            //     $categoryIds[] = $category->id;
            // }
            // $pad->categories()->sync($categoryIds);

            // Categories – support both plain string and multilingual object
            $categoryIds = [];

            foreach ($request->categories ?? [] as $cat) {
                $typeMap = is_array($cat['type'] ?? null) ? $cat['type'] : null;
                $valueMap = is_array($cat['value'] ?? null) ? $cat['value'] : null;

                // Plain string → put under current locale only
                if ($typeMap === null) {
                    $typeMap = [$locale => (string) ($cat['type'] ?? '')];
                }
                if ($valueMap === null) {
                    $valueMap = [$locale => (string) ($cat['value'] ?? '')];
                }

                // Clean empty values
                $typeMap = array_filter(array_map('trim', $typeMap));
                $valueMap = array_filter(array_map('trim', $valueMap));

                if (empty($typeMap) || empty($valueMap)) {
                    continue;
                }

                $category = $this->findOrCreateCategoryMultilingual($typeMap, $valueMap);
                $categoryIds[] = $category->id;
            }

            $pad->categories()->sync($categoryIds);
            // Recorded versions
            $versions = $request->input('recorded_versions', []);
            $files = $request->file('recorded_versions', []);
            $keptIds = [];

            foreach ($versions as $index => $media) {
                $existingId = $media['id'] ?? null;
                $path = null;

                if (isset($files[$index]['file']) && $files[$index]['file']->isValid()) {
                    $originalName = $files[$index]['file']->getClientOriginalName();
                    $uniqueName = uniqid() . '_' . $originalName;
                    $path = $files[$index]['file']->storeAs('pad-media', $uniqueName, 'public');
                }

                if ($existingId) {
                    $rv = $pad->recordedVersions()->where('id', $existingId)->first();
                    if (!$rv) {
                        continue;
                    }

                    if (!empty($media['remove_file']) && ($media['remove_file'] === true || $media['remove_file'] === 'true' || $media['remove_file'] == '1')) {
                        if (!empty($rv->file_url)) {
                            Storage::disk('public')->delete($rv->file_url);
                        }
                        $rv->file_url = null;
                    } elseif ($path !== null) {
                        if (!empty($rv->file_url)) {
                            Storage::disk('public')->delete($rv->file_url);
                        }
                        $rv->file_url = $path;
                    }

                    // $rv->media_type = array_key_exists('media_type', $media) ? $media['media_type'] : $rv->media_type;
                    // $rv->youtube_url = array_key_exists('youtube_url', $media) ? $media['youtube_url'] : $rv->youtube_url;
                    // $rv->recording_type = array_key_exists('recording_type', $media) ? $media['recording_type'] : $rv->recording_type;

                    // media_type – allow null
                    if (array_key_exists('media_type', $media)) {
                        $incoming = $media['media_type'];
                        if (in_array($incoming, ['audio', 'video'], true)) {
                            $rv->media_type = $incoming;
                        } else {
                            $rv->media_type = null;   // ← now allowed
                        }
                    }

                    if (array_key_exists('youtube_url', $media)) {
                        $rv->youtube_url = $media['youtube_url'] ?: null;
                    }

                    if (array_key_exists('recording_type', $media)) {
                        $incoming = $media['recording_type'];
                        if (in_array($incoming, ['live', 'studio'], true)) {
                            $rv->recording_type = $incoming;
                        }
                    }
                    foreach (['file_name', 'singer', 'publisher', 'vocalization', 'raga'] as $field) {
                        $text = data_get($media, "{$field}.{$locale}");
                        if (is_string($text) && $text !== '') {
                            $rv->setTranslation($field, $locale, $text);
                        }
                    }

                    $rv->save();
                    $keptIds[] = $rv->id;
                } else {
                    $mediaType = $media['media_type'] ?? null;
                    if ($mediaType !== null && !in_array($mediaType, ['audio', 'video'], true)) {
                        $mediaType = null;
                    }
                    $rv = new Pad_media([
                        'media_type' => $mediaType,
                        'file_url' => $path,
                        'youtube_url' => $media['youtube_url'] ?? null,
                        'recording_type' => $media['recording_type'] ?? null,
                    ]);

                    foreach (['file_name', 'singer', 'publisher', 'vocalization', 'raga'] as $field) {
                        $text = data_get($media, "{$field}.{$locale}");
                        if (is_string($text) && $text !== '') {
                            $rv->setTranslation($field, $locale, $text);
                        }
                    }

                    $hasContent = $path
                        || !empty($rv->media_type)
                        || !empty($rv->recording_type)
                        || $rv->getTranslation('singer', $locale, false)
                        || $rv->getTranslation('publisher', $locale, false)
                        || $rv->getTranslation('vocalization', $locale, false);

                    if ($hasContent) {
                        $pad->recordedVersions()->save($rv);
                        $keptIds[] = $rv->id;
                    }
                }
            }

            $pad->recordedVersions()
                ->whereNotIn('id', $keptIds)
                ->get()
                ->each(function ($rv) {
                    if (!empty($rv->file_url)) {
                        Storage::disk('public')->delete($rv->file_url);
                    }
                    $rv->delete();
                });
        });

        return redirect()
            ->route('role.pads.list', ['rolePrefix' => $rolePrefix])
            ->with('success', 'pad_updated_success');
    }

    // ─── DESTROY ─────────────────────────────────────────────────────────────

    public function destroy($rolePrefix, Pad $pad)
    {
        $this->deletePad($pad);

        return back()->with('success', 'pad_deleted_success');
    }

    private function deletePad(Pad $pad): void
    {
        $pad->loadMissing(['recordedVersions', 'recordedVersion']);

        foreach ($pad->recordedVersions as $rv) {
            if (!empty($rv->file_url)) {
                Storage::disk('public')->delete($rv->file_url);
            }
            $rv->delete();
        }

        if ($pad->recordedVersion?->file_url) {
            Storage::disk('public')->delete($pad->recordedVersion->file_url);
            $pad->recordedVersion()->delete();
        }

        $pad->categories()->detach();
        $pad->delete();
    }

    public function bulkDestroy($rolePrefix, Request $request)
    {
        $ids = $request->input('ids', []);

        if (empty($ids)) {
            return back()->with('error', 'select_at_least_one');
        }

        $pads = Pad::whereIn('id', $ids)->get();
        foreach ($pads as $pad) {
            $this->deletePad($pad);
        }

        return back()->with('success', 'pads_deleted_success');
    }

    // ─── FAVORITES ───────────────────────────────────────────────────────────

    public function toggleFavorite($rolePrefix, Request $request, Pad $pad)
    {
        $user = $request->user();
        $attached = $user->favoritePads()->toggle($pad->id);
        $isFavorited = in_array($pad->id, $attached['attached']);

        return back()->with([
            'success' => $isFavorited
                ? 'added_to_favorites'
                : 'removed_from_favorites',
            'is_favorited' => $isFavorited,
        ]);
    }

    public function favorites($rolePrefix, Request $request)
    {
        $locale = $this->resolveLocale();
        $locales = $this->supportedLocales();

        $search = trim((string) $request->input('search', ''));
        $categoryType = trim((string) $request->input('category_type', ''));
        $categoryValue = trim((string) $request->input('category_value', ''));

        $query = Pad::query()
            ->whereHas('favoritedByUsers', fn($q) => $q->where('user_id', Auth::id()))
            ->with(['categories:id,type,value', 'recordedVersion'])
            ->latest();

        if ($search !== '') {
            $searchLike = '%' . mb_strtolower($search) . '%';
            $query->where(function ($q) use ($search, $searchLike, $locales) {
                if (is_numeric($search)) {
                    $q->orWhere('id', $search)
                        ->orWhere('id', 'like', $searchLike);
                }
                
                foreach ($locales as $code) {
                    $q->orWhereRaw("LOWER(JSON_UNQUOTE(JSON_EXTRACT(title, '$.\"{$code}\"'))) LIKE ?", [$searchLike])
                        ->orWhereRaw("LOWER(JSON_UNQUOTE(JSON_EXTRACT(value, '$.\"{$code}\"'))) LIKE ?", [$searchLike]);
                }
                $q->orWhere('status', 'like', "%{$search}%")
                    ->orWhere('establish_date', 'like', "%{$search}%")
                    ->orWhereHas('categories', function ($cq) use ($searchLike, $locales) {
                        $cq->where(function ($subQ) use ($searchLike, $locales) {
                            foreach ($locales as $code) {
                                $subQ->orWhereRaw("LOWER(JSON_UNQUOTE(JSON_EXTRACT(type, '$.\"{$code}\"'))) LIKE ?", [$searchLike])
                                    ->orWhereRaw("LOWER(JSON_UNQUOTE(JSON_EXTRACT(value, '$.\"{$code}\"'))) LIKE ?", [$searchLike]);
                            }
                        });
                    })
                    ->orWhereHas('recordedVersion', function ($rq) use ($searchLike, $locales) {
                        $rq->where(function ($subQ) use ($searchLike, $locales) {
                            foreach ($locales as $code) {
                                $subQ->orWhereRaw("LOWER(JSON_UNQUOTE(JSON_EXTRACT(singer, '$.\"{$code}\"'))) LIKE ?", [$searchLike])
                                    ->orWhereRaw("LOWER(JSON_UNQUOTE(JSON_EXTRACT(file_name, '$.\"{$code}\"'))) LIKE ?", [$searchLike])
                                    ->orWhereRaw("LOWER(JSON_UNQUOTE(JSON_EXTRACT(publisher, '$.\"{$code}\"'))) LIKE ?", [$searchLike])
                                    ->orWhereRaw("LOWER(JSON_UNQUOTE(JSON_EXTRACT(vocalization, '$.\"{$code}\"'))) LIKE ?", [$searchLike]);
                            }
                            $subQ->orWhere('media_type', 'like', $searchLike)
                                ->orWhere('recording_type', 'like', $searchLike);
                        });
                    });
            });
        }

        if ($categoryType !== '') {
            $query->whereHas('categories', function ($q) use ($categoryType, $locales) {
                $q->where(function ($subQ) use ($categoryType, $locales) {
                    foreach ($locales as $code) {
                        $subQ->orWhere("type->{$code}", $categoryType);
                    }
                });
            });
        }

        if ($categoryValue !== '') {
            $query->whereHas('categories', function ($q) use ($categoryValue, $locales) {
                $q->where(function ($subQ) use ($categoryValue, $locales) {
                    foreach ($locales as $code) {
                        $subQ->orWhere("value->{$code}", $categoryValue);
                    }
                });
            });
        }

        $pads = $query->get();

        $filterCategoryOptions = Category::query()
            ->get(['id', 'type', 'value'])
            ->map(function ($category) use ($locales) {
                $row = [];
                foreach ($locales as $code) {
                    $row["type_{$code}"] = $category->getTranslation('type', $code, false) ?: '';
                    $row["value_{$code}"] = $category->getTranslation('value', $code, false) ?: '';
                }
                // keep legacy keys for frontend compatibility
                $row['type_en'] = $row['type_en'] ?? '';
                $row['type_gu'] = $row['type_gu'] ?? '';
                $row['value_en'] = $row['value_en'] ?? '';
                $row['value_gu'] = $row['value_gu'] ?? '';

                return $row;
            })
            ->filter(fn($item) => !empty($item['type_en']) || !empty($item['type_gu']))
            ->unique(fn($item) => ($item['type_en'] ?: $item['type_gu']) . '|' . ($item['value_en'] ?: $item['value_gu']))
            ->values();

        $totalFavorites = Pad::query()
            ->whereHas('favoritedByUsers', fn($q) => $q->where('user_id', Auth::id()))
            ->count();

        return Inertia::render('Admin/Pads/Favorites', [
            'pads' => $pads,
            'filterCategoryOptions' => $filterCategoryOptions,
            'filters' => [
                'search' => $search,
                'category_type' => $categoryType,
                'category_value' => $categoryValue,
            ],
            'totalFavorites' => $totalFavorites,
            'locale' => $locale,
        ]);
    }

    // ─── PRIVATE ─────────────────────────────────────────────────────────────

    // private function findOrCreateCategory(string $type, string $value, string $locale): Category
    // {
    //     $locales = $this->supportedLocales();

    //     $category = Category::query()
    //         ->where(function ($q) use ($type, $locales) {
    //             foreach ($locales as $code) {
    //                 $q->orWhere("type->{$code}", $type);
    //             }
    //             $q->orWhere('type', $type);
    //         })
    //         ->where(function ($q) use ($value, $locales) {
    //             foreach ($locales as $code) {
    //                 $q->orWhere("value->{$code}", $value);
    //             }
    //             $q->orWhere('value', $value);
    //         })
    //         ->first();

    //     if ($category) {
    //         if (!$category->getTranslation('type', $locale, false)) {
    //             $category->setTranslation('type', $locale, $type);
    //         }
    //         if (!$category->getTranslation('value', $locale, false)) {
    //             $category->setTranslation('value', $locale, $value);
    //         }
    //         $category->save();

    //         return $category;
    //     }

    //     $category = new Category(['created_by' => Auth::id()]);
    //     $category->setTranslation('type', $locale, $type);
    //     $category->setTranslation('value', $locale, $value);
    //     $category->save();

    //     return $category;
    // }

    /**
     * Find or create a category using full multilingual maps.
     * This prevents English/Gujarati values from being stored under the wrong locale.
     */
    // private function findOrCreateCategoryMultilingual(array $typeMap, array $valueMap): Category
    // {
    //     $locales = $this->supportedLocales();

    //     // Try to find an existing category that already has any of these translations
    //     $category = Category::query()
    //         ->where(function ($q) use ($typeMap) {
    //             foreach ($typeMap as $code => $text) {
    //                 if ($text === '') continue;
    //                 $q->orWhere("type->{$code}", $text);
    //             }
    //         })
    //         ->where(function ($q) use ($valueMap) {
    //             foreach ($valueMap as $code => $text) {
    //                 if ($text === '') continue;
    //                 $q->orWhere("value->{$code}", $text);
    //             }
    //         })
    //         ->first();

    //     if (!$category) {
    //         $category = new Category(['created_by' => Auth::id()]);
    //     }

    //     // Always write the translations we received
    //     foreach ($typeMap as $code => $text) {
    //         if (is_string($text) && trim($text) !== '') {
    //             $category->setTranslation('type', $code, trim($text));
    //         }
    //     }

    //     foreach ($valueMap as $code => $text) {
    //         if (is_string($text) && trim($text) !== '') {
    //             $category->setTranslation('value', $code, trim($text));
    //         }
    //     }

    //     $category->save();

    //     return $category;
    // }

    // private function findOrCreateCategoryMultilingual(array $typeMap, array $valueMap, bool $isCustom = false): Category
    // {
    //     // Try to find an existing category that already has any of these translations
    //     $category = Category::query()
    //         ->where(function ($q) use ($typeMap) {
    //             foreach ($typeMap as $code => $text) {
    //                 if ($text === '')
    //                     continue;
    //                 $q->orWhere("type->{$code}", $text);
    //             }
    //         })
    //         ->where(function ($q) use ($valueMap) {
    //             foreach ($valueMap as $code => $text) {
    //                 if ($text === '')
    //                     continue;
    //                 $q->orWhere("value->{$code}", $text);
    //             }
    //         })
    //         ->first();

    //     if (!$category) {
    //         $category = new Category([
    //             'created_by' => Auth::id(),
    //             'is_custom' => true,          // ← always custom when created from Pad form
    //         ]);
    //     }

    //     // Always write the translations we received
    //     foreach ($typeMap as $code => $text) {
    //         if (is_string($text) && trim($text) !== '') {
    //             $category->setTranslation('type', $code, trim($text));
    //         }
    //     }

    //     foreach ($valueMap as $code => $text) {
    //         if (is_string($text) && trim($text) !== '') {
    //             $category->setTranslation('value', $code, trim($text));
    //         }
    //     }

    //     $category->save();

    //     return $category;
    // }


    private function findOrCreateCategoryMultilingual(array $typeMap, array $valueMap): Category
    {
        $locales = $this->supportedLocales();

        // Normalize
        $typeMap = collect($typeMap)
            ->map(fn($v) => is_string($v) ? trim($v) : '')
            ->filter(fn($v) => $v !== '')
            ->all();

        $valueMap = collect($valueMap)
            ->map(fn($v) => is_string($v) ? trim($v) : '')
            ->filter(fn($v) => $v !== '')
            ->all();

        $primaryType = collect($typeMap)->first() ?? '';
        $primaryValue = collect($valueMap)->first() ?? '';

        // ── Enrich TYPE from an existing category with the same type label ──
        // e.g. user sends only {en: "Kirtan type"} → load full {en, gu} from DB
        if ($primaryType !== '') {
            $typeDonor = Category::query()
                ->where(function ($q) use ($primaryType, $locales) {
                    foreach ($locales as $code) {
                        $q->orWhere("type->{$code}", $primaryType);
                    }
                })
                ->first();

            if ($typeDonor) {
                foreach ($locales as $code) {
                    $t = $typeDonor->getTranslation('type', $code, false);
                    if (is_string($t) && trim($t) !== '' && empty($typeMap[$code])) {
                        $typeMap[$code] = trim($t);
                    }
                }
            }
        }

        // ── Find existing category (same type + same value in any locale) ──
        $category = Category::query()
            ->where(function ($q) use ($typeMap, $locales, $primaryType) {
                foreach ($typeMap as $code => $text) {
                    $q->orWhere("type->{$code}", $text);
                }
                if ($primaryType !== '') {
                    foreach ($locales as $code) {
                        $q->orWhere("type->{$code}", $primaryType);
                    }
                }
            })
            ->where(function ($q) use ($valueMap, $locales, $primaryValue) {
                foreach ($valueMap as $code => $text) {
                    $q->orWhere("value->{$code}", $text);
                }
                if ($primaryValue !== '') {
                    foreach ($locales as $code) {
                        $q->orWhere("value->{$code}", $primaryValue);
                    }
                }
            })
            ->first();

        if (!$category) {
            $category = new Category([
                'created_by' => Auth::id(),
                'is_custom' => $this->isCustomTypeLabel($primaryType),
            ]);
        }

        // Write ONLY what we actually have — do NOT copy primary into other locales
        foreach ($typeMap as $code => $text) {
            $category->setTranslation('type', $code, $text);
        }
        foreach ($valueMap as $code => $text) {
            $category->setTranslation('value', $code, $text);
        }

        // Optional: if type still missing a locale after donor lookup, leave it empty.
        // Do NOT set en = gu or gu = en.

        $category->save();

        return $category;
    }
    /**
     * True if this type label is not one of the fixed category types
     * (Creator, Event, Book, …) in any locale.
     */
    private function isCustomTypeLabel(string $typeLabel): bool
    {
        $label = mb_strtolower(trim($typeLabel));
        if ($label === '') {
            return true;
        }

        $fixed = config('category_types', []);
        $locales = $this->supportedLocales();

        foreach ($fixed as $key => $cfg) {
            if (!empty($cfg['is_custom'])) {
                continue;
            }
            // key itself
            if (mb_strtolower((string) ($cfg['key'] ?? $key)) === $label) {
                return false;
            }
            // translation_key resolved per locale
            foreach ($locales as $code) {
                $translated = __($cfg['translation_key'] ?? '', [], $code);
                if (is_string($translated) && mb_strtolower(trim($translated)) === $label) {
                    return false;
                }
                if (isset($cfg[$code]) && mb_strtolower(trim((string) $cfg[$code])) === $label) {
                    return false;
                }
            }
        }

        return true;
    }
}
