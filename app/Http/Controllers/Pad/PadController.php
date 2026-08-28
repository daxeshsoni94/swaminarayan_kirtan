<?php

namespace App\Http\Controllers\Pad;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Kirtan;
use App\Models\Pad;
use App\Models\Pad_media;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PadController extends Controller
{

    /**
     * List all pads (across all kirtans), paginated.
     */

    // public function PadList(Request $request)
    // {
    //     $locale = app()->getLocale();
    //     if (! in_array($locale, ['en', 'gu'], true)) {
    //         $locale = 'en';
    //     }

    //     // Helper for translatable fields
    //     $t = function ($model, string $field) use ($locale): string {
    //         if (! $model) {
    //             return '';
    //         }

    //         $value = $model->getTranslation($field, $locale, false)
    //             ?: $model->getTranslation($field, 'en', false)
    //             ?: $model->getTranslation($field, 'gu', false);

    //         return is_string($value) ? $value : '';
    //     };

    //     $query = Pad::query()
    //         ->with([
    //             'categories:id,type,value',
    //             'recordedVersion',
    //         ])
    //         ->latest();


    //     // Optional filters (search + status)
    //     if ($search = $request->input('search')) {
    //         $query->where(function ($q) use ($search, $locale) {
    //             $q->where("title->{$locale}", 'like', "%{$search}%")
    //                 ->orWhere("title->en", 'like', "%{$search}%")
    //                 ->orWhere("title->gu", 'like', "%{$search}%")
    //                 ->orWhere("value->{$locale}", 'like', "%{$search}%");
    //         });
    //     }

    //     if ($status = $request->input('status')) {
    //         if (in_array(strtolower($status), ['save', 'published'])) {
    //             $query->whereIn('status', ['save', 'published']);
    //         } elseif (strtolower($status) === 'draft') {
    //             $query->where('status', 'draft');
    //         }
    //     }

    //     $pads = $query
    //         ->paginate($request->input('per_page', 10))
    //         ->through(function ($pad) use ($t) {
    //             return [
    //                 'id'               => $pad->id,
    //                 'title'            => $t($pad, 'title'),
    //                 'value'            => $t($pad, 'value'),
    //                 'status'           => $pad->status, // "save" | "published" | "draft"
    //                 'establish_date'   => $pad->establish_date
    //                     ? \Carbon\Carbon::parse($pad->establish_date)->format('Y-m-d')
    //                     : null,
    //                 'created_at'       => optional($pad->created_at)?->toIso8601String(),
    //                 'updated_at'       => optional($pad->updated_at)?->toIso8601String(),

    //                 // Categories
    //                 'categories'       => $pad->categories->map(fn($c) => [
    //                     'id'    => $c->id,
    //                     'type'  => $t($c, 'type'),
    //                     'value' => $t($c, 'value'),
    //                 ])->values(),

    //                 // Recording
    //                 'recorded_version' => $pad->recordedVersion ? [
    //                     'id'             => $pad->recordedVersion->id,
    //                     'media_type'     => $pad->recordedVersion->media_type,
    //                     'file_url'       => $pad->recordedVersion->file_url,
    //                     'singer'         => $t($pad->recordedVersion, 'singer'),
    //                     'publisher'      => $t($pad->recordedVersion, 'publisher'),
    //                     'vocalization'   => $t($pad->recordedVersion, 'vocalization'),
    //                     'recording_type' => $pad->recordedVersion->recording_type,
    //                 ] : null,
    //             ];
    //         });

    //     return Inertia::render('Admin/Pads/PadList', [
    //         'pads'    => $pads,
    //         'filters' => [
    //             'search' => $request->input('search'),
    //             'status' => $request->input('status'),
    //         ],
    //         'locale'  => $locale,
    //     ]);
    // }


    public function PadList(Request $request)
    {
        $locale = app()->getLocale();
        if (! in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }

        // Helper for translatable fields
        $t = function ($model, string $field) use ($locale): string {
            if (! $model) {
                return '';
            }

            $value = $model->getTranslation($field, $locale, false)
                ?: $model->getTranslation($field, 'en', false)
                ?: $model->getTranslation($field, 'gu', false);

            return is_string($value) ? $value : '';
        };

        $query = Pad::query()
            ->with([
                'categories:id,type,value',
                'recordedVersion',
            ])
            ->latest();


        // Optional filters (search + status)
        if ($search = $request->input('search')) {
            $search = trim($search);

            $query->where(function ($q) use ($search) {
                if (is_numeric($search)) {
                    $q->orWhere('id', $search);          // exact ID match
                    $q->orWhere('id', 'like', "%{$search}%");  // partial if you prefer
                }
                // ── Pad fields (both locales) ──────────────────────────────
                $q->where("title->en", 'like', "%{$search}%")
                    ->orWhere("title->gu", 'like', "%{$search}%")
                    ->orWhere("value->en", 'like', "%{$search}%")
                    ->orWhere("value->gu", 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%")
                    ->orWhere('establish_date', 'like', "%{$search}%");

                // ── Categories (type + value, both locales) ────────────────
                $q->orWhereHas('categories', function ($cq) use ($search) {
                    $cq->where("type->en", 'like', "%{$search}%")
                        ->orWhere("type->gu", 'like', "%{$search}%")
                        ->orWhere("value->en", 'like', "%{$search}%")
                        ->orWhere("value->gu", 'like', "%{$search}%");
                });

                // ── Recorded versions (all text fields, both locales) ──────
                $q->orWhereHas('recordedVersion', function ($rq) use ($search) {
                    $rq->where("singer->en", 'like', "%{$search}%")
                        ->orWhere("singer->gu", 'like', "%{$search}%")
                        ->orWhere("publisher->en", 'like', "%{$search}%")
                        ->orWhere("publisher->gu", 'like', "%{$search}%")
                        ->orWhere("vocalization->en", 'like', "%{$search}%")
                        ->orWhere("vocalization->gu", 'like', "%{$search}%")
                        ->orWhere('media_type', 'like', "%{$search}%")
                        ->orWhere('recording_type', 'like', "%{$search}%")
                        ->orWhere('file_url', 'like', "%{$search}%");
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

        if ($letter = $request->input('letter')) {

            $letter = trim($letter);

            $query->where(function ($q) use ($letter) {

                $q->where("title->en", 'like', $letter . '%')
                    ->orWhere("title->gu", 'like', $letter . '%');
            });
        }

        $pads = $query
            ->paginate($request->input('per_page', 10))
            ->through(function ($pad) use ($t) {
                return [
                    'id'               => $pad->id,
                    'title'            => $t($pad, 'title'),
                    'value'            => $t($pad, 'value'),
                    'status'           => $pad->status, // "save" | "published" | "draft"
                    'establish_date'   => $pad->establish_date
                        ? \Carbon\Carbon::parse($pad->establish_date)->format('Y-m-d')
                        : null,
                    // 'date' => optional($pad->created_at)?->format('d-m-Y'),
                    'created_at'       => optional($pad->created_at)?->toIso8601String(),
                    'updated_at'       => optional($pad->updated_at)?->toIso8601String(),
                    // 'created_at' => optional($pad->created_at)?->format('d-m-Y'),
                    // 'updated_at' => optional($pad->updated_at)?->format('d-m-Y'),

                    // Categories
                    'categories'       => $pad->categories->map(fn($c) => [
                        'id'    => $c->id,
                        'type'  => $t($c, 'type'),
                        'value' => $t($c, 'value'),
                    ])->values(),

                    // Recording
                    'recorded_version' => $pad->recordedVersion ? [
                        'id'             => $pad->recordedVersion->id,
                        'media_type'     => $pad->recordedVersion->media_type,
                        'file_url'       => $pad->recordedVersion->file_url,
                        'singer'         => $t($pad->recordedVersion, 'singer'),
                        'publisher'      => $t($pad->recordedVersion, 'publisher'),
                        'vocalization'   => $t($pad->recordedVersion, 'vocalization'),
                        'recording_type' => $pad->recordedVersion->recording_type,
                    ] : null,
                ];
            });

        // dd($pads);
        return Inertia::render(
            'Admin/Pads/PadList',
            [
                'pads'    => $pads,
                'filters' => [
                    'search' => $request->input('search'),
                    'status' => $request->input('status'),
                    'letter' => $request->input('letter'),
                ],
                'locale'  => $locale,
            ]
        );
    }


    // public function Create()
    // {
    //     $locale = app()->getLocale();

    //     if (!in_array($locale, ['en', 'gu'], true)) {
    //         $locale = 'en';
    //     }

    //     $categories = Category::query()
    //         ->orderBy('id')
    //         ->get(['id', 'type', 'value'])
    //         ->map(function (Category $category) use ($locale) {

    //             return [
    //                 'id' => $category->id,
    //                 'type' => $category->getTranslation('type', $locale, false) ?? '',
    //                 'value' => $category->getTranslation('value', $locale, false) ?? '',
    //             ];
    //         })
    //         ->filter(
    //             fn($category) =>
    //             $category['type'] !== '' &&
    //                 $category['value'] !== ''
    //         )
    //         ->values();

    //     return Inertia::render('Admin/Pads/PadCreate', [
    //         'categories' => $categories,
    //         'locale' => $locale,
    //     ]);
    // }
    public function Create()
    {
        $locale = app()->getLocale();

        if (! in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }

        $categories = Category::query()
            ->orderBy('id')
            ->get(['id', 'type', 'value'])
            ->map(function (Category $category) use ($locale) {
                // Prefer current locale, fall back to the other language
                $type = $category->getTranslation('type', $locale, false)
                    ?: $category->getTranslation('type', $locale === 'gu' ? 'en' : 'gu', false)
                    ?: '';

                $value = $category->getTranslation('value', $locale, false)
                    ?: $category->getTranslation('value', $locale === 'gu' ? 'en' : 'gu', false)
                    ?: '';

                return [
                    'id'    => $category->id,
                    'type'  => $type,
                    'value' => $value,
                ];
            })
            ->filter(fn($c) => $c['type'] !== '' && $c['value'] !== '')
            ->values();

        return Inertia::render('Admin/Pads/PadCreate', [
            'categories' => $categories,
            'locale'     => $locale,
        ]);
    }

    public function show($rolePrefix, Pad $pad)
    {
        $pad->load([
            'categories:id,type,value',
            'recordedVersions',
        ]);
        $locale = app()->getLocale();
        if (! in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }

        // Resolve translatable field → plain string for current locale
        $t = function ($model, string $field) use ($locale): string {
            if (! $model) {
                return '';
            }

            $value = $model->getTranslation($field, $locale, false)
                ?: $model->getTranslation($field, 'en', false)
                ?: $model->getTranslation($field, 'gu', false);

            return is_string($value) ? $value : '';
        };

        $payload = [
            'id'             => $pad->id,
            'title'          => $t($pad, 'title'),
            'value'          => $t($pad, 'value'),
            'status'         => $pad->status, // code: save | draft
            'establish_date' => $pad->establish_date
                ? \Carbon\Carbon::parse($pad->establish_date)->format('Y-m-d')
                : null,
            'created_at'     => optional($pad->created_at)?->toIso8601String(),
            'updated_at'     => optional($pad->updated_at)?->toIso8601String(),
            'categories'     => $pad->categories->map(fn($c) => [
                'id'    => $c->id,
                'type'  => $t($c, 'type'),
                'value' => $t($c, 'value'),
            ])->values(),

            // ── Multiple recorded versions ─────────────────────────
            'recorded_versions' => $pad->recordedVersions->map(fn($rv) => [
                'id'             => $rv->id,
                'media_type'     => $rv->media_type,
                'file_url'       => $rv->file_url,
                'singer'         => $t($rv, 'singer'),
                'publisher'      => $t($rv, 'publisher'),
                'vocalization'   => $t($rv, 'vocalization'),
                'recording_type' => $rv->recording_type,
            ])->values(),
            'locale' => $locale,
        ];

        return Inertia::render('Admin/Pads/Show', [
            'pad' => $payload,
            'is_favorited' => $pad->isFavoritedBy(Auth::user()),
        ]);
    }

    public function store($rolePrefix, Request $request)
    {
        $locale = $request->input('locale', 'en');
        if (! in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }

        $request->validate([
            "title.{$locale}"                          => 'required|string|max:255',
            "value.{$locale}"                          => 'required|string',
            'status'                                   => 'required|in:save,draft',
            'establish_date'                           => 'nullable|date',
            'categories'                               => 'nullable|array',
            'categories.*.type'                        => 'required|string|max:100',
            'categories.*.value'                       => 'required|string|max:255',

            // Multiple recorded versions
            'recorded_versions'                        => 'nullable|array',
            'recorded_versions.*.media_type'           => 'nullable|in:audio,video',
            'recorded_versions.*.file'                 => 'nullable|file|mimes:mp3,wav,m4a,ogg,mp4,mov,avi|max:51200',
            'recorded_versions.*.recording_type'       => 'nullable|in:live,studio',
            "recorded_versions.*.singer.{$locale}"     => 'nullable|string',
            "recorded_versions.*.publisher.{$locale}"  => 'nullable|string',
            "recorded_versions.*.vocalization.{$locale}" => 'nullable|string',
        ]);

        try {
            // ── 1. Pad ────────────────────────────────────────────
            $pad = new \App\Models\Pad([
                'status'         => $request->status ?? 'draft',
                'establish_date' => $request->establish_date,
                'created_by'     => Auth::id(),
            ]);

            $pad->setTranslation('title', $locale, $request->input("title.{$locale}"));
            $pad->setTranslation('value', $locale, $request->input("value.{$locale}"));
            $pad->save();

            // ── 2. Categories ─────────────────────────────────────
            $categoryIds = [];

            foreach ($request->input('categories', []) as $cat) {
                $type  = is_array($cat['type'] ?? null)
                    ? ($cat['type'][$locale] ?? $cat['type']['en'] ?? '')
                    : (string) ($cat['type'] ?? '');
                $value = is_array($cat['value'] ?? null)
                    ? ($cat['value'][$locale] ?? $cat['value']['en'] ?? '')
                    : (string) ($cat['value'] ?? '');

                if ($type === '' || $value === '') {
                    continue;
                }

                $category = \App\Models\Category::query()
                    ->where(function ($q) use ($type) {
                        $q->where('type->en', $type)
                            ->orWhere('type->gu', $type)
                            ->orWhere('type', $type);
                    })
                    ->where(function ($q) use ($value) {
                        $q->where('value->en', $value)
                            ->orWhere('value->gu', $value)
                            ->orWhere('value', $value);
                    })
                    ->first();

                if (! $category) {
                    $category = new \App\Models\Category([
                        'created_by' => Auth::id(),
                    ]);
                    $category->setTranslation('type', $locale, $type);
                    $category->setTranslation('value', $locale, $value);
                    $category->save();
                } else {
                    if (! $category->getTranslation('type', $locale, false)) {
                        $category->setTranslation('type', $locale, $type);
                    }
                    if (! $category->getTranslation('value', $locale, false)) {
                        $category->setTranslation('value', $locale, $value);
                    }
                    $category->save();
                }

                $categoryIds[] = $category->id;
            }

            $pad->categories()->sync($categoryIds);

            // ── 3. Multiple Recorded Versions ─────────────────────
            $versions = $request->input('recorded_versions', []);
            // Also handle files that come via hasFile (FormData)
            $files = $request->file('recorded_versions', []);
            // dd($files);


            foreach ($versions as $index => $media) {
                $path = null;

                // File may be under recorded_versions.$index.file
                if (isset($files[$index]['file']) && $files[$index]['file']->isValid()) {
                    $path = $files[$index]['file']->store('pad-media', 'public');
                }

                $rv = new \App\Models\Pad_media([
                    'media_type'     => $media['media_type'] ?? null,
                    'file_url'       => $path,
                    'recording_type' => $media['recording_type'] ?? null,
                ]);

                foreach (['singer', 'publisher', 'vocalization'] as $field) {
                    $text = data_get($media, "{$field}.{$locale}");
                    if (is_string($text) && $text !== '') {
                        $rv->setTranslation($field, $locale, $text);
                    }
                }

                $hasContent = $path
                    || ! empty($rv->media_type)
                    || ! empty($rv->recording_type)
                    || $rv->getTranslation('singer', $locale, false)
                    || $rv->getTranslation('publisher', $locale, false)
                    || $rv->getTranslation('vocalization', $locale, false);

                if ($hasContent) {
                    $pad->recordedVersion()->save($rv);   // ← plural relation
                }
            }

            return redirect()
                ->route('role.pads.list', [
                    'rolePrefix' => $rolePrefix,
                ])
                ->with('success', 'Pad created successfully.');
        } catch (\Throwable $e) {
            \Log::error('Pad store failed', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            // return back()
            //     ->withInput()
            //     ->withErrors(['form' => $e->getMessage()]);
            dd($e->getMessage(), $e->getTraceAsString());
        }
    }


    public function edit($rolePrefix, Pad $pad)
    {
        $pad->load(['categories', 'recordedVersions']);   // ← plural relation
        $locale = app()->getLocale();
        if (! in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }

        // Helper: translations map, always with en + gu keys
        $trans = function ($model, string $field): array {
            $all = $model->getTranslations($field);
            return [
                'en' => $all['en'] ?? '',
                'gu' => $all['gu'] ?? '',
            ];
        };

        // Categories for selector: plain strings for current locale (avoids [object Object])
        $mapCategory = function ($c) use ($locale) {
            return [
                'id'    => $c->id,
                'type'  => $c->getTranslation('type', $locale)
                    ?: $c->getTranslation('type', 'en')
                    ?: '',
                'value' => $c->getTranslation('value', $locale)
                    ?: $c->getTranslation('value', 'en')
                    ?: '',
            ];
        };

        return Inertia::render('Admin/Pads/PadEdit', [
            'pad' => [
                'id'             => $pad->id,
                'title'          => $trans($pad, 'title'),
                'value'          => $trans($pad, 'value'),
                'status'         => $pad->status,
                'establish_date' => optional($pad->establish_date)->format('Y-m-d'),
                'categories'     => $pad->categories->map($mapCategory)->values(),

                // ── Multiple recorded versions ─────────────────────────
                'recorded_versions' => $pad->recordedVersions->map(function ($rv) use ($trans) {
                    return [
                        'id'             => $rv->id,
                        'media_type'     => $rv->media_type,
                        'file_url'       => $rv->file_url,
                        'singer'         => $trans($rv, 'singer'),
                        'publisher'      => $trans($rv, 'publisher'),
                        'vocalization'   => $trans($rv, 'vocalization'),
                        'recording_type' => $rv->recording_type,
                    ];
                })->values(),
            ],
            'categories' => Category::query()
                ->orderBy('type')
                ->orderBy('value')
                ->get()
                ->map($mapCategory)
                ->values(),
            'locale' => $locale,
        ]);
    }

    public function update($rolePrefix, Request $request, Pad $pad)
    {
        $locale = $request->input('locale', app()->getLocale());
        if (! in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }

        $request->validate([
            // Nested translations — only active locale is required
            "title.{$locale}"   => 'required|string|max:255',
            "value.{$locale}"   => 'required|string',

            'status'            => 'required|in:save,draft',
            'establish_date'    => 'nullable|date',

            'categories'                => 'nullable|array',
            'categories.*.id'           => 'nullable|integer|exists:categories,id',
            'categories.*.type'         => 'nullable|string|max:100',
            'categories.*.value'        => 'nullable|string|max:255',

            // Multiple recorded versions
            'recorded_versions'                          => 'nullable|array',
            'recorded_versions.*.id'                     => 'nullable|integer',
            'recorded_versions.*.media_type'             => 'nullable|in:audio,video',
            'recorded_versions.*.file'                   => 'nullable|file|mimes:mp3,wav,m4a,ogg,mp4,mov,avi|max:51200',
            "recorded_versions.*.singer.{$locale}"       => 'nullable|string',
            "recorded_versions.*.publisher.{$locale}"    => 'nullable|string',
            "recorded_versions.*.vocalization.{$locale}" => 'nullable|string',
            'recorded_versions.*.recording_type'         => 'nullable|in:live,studio',
        ]);

        DB::transaction(function () use ($request, $pad, $locale) {

            // ── Pad core ──────────────────────────────────────────
            $pad->status         = $request->status;
            $pad->establish_date = $request->establish_date;

            // Only update the active locale — other language is preserved
            $titleText = $request->input("title.{$locale}");
            $valueText = $request->input("value.{$locale}");

            if (is_string($titleText) && $titleText !== '') {
                $pad->setTranslation('title', $locale, $titleText);
            }
            if (is_string($valueText) && $valueText !== '') {
                $pad->setTranslation('value', $locale, $valueText);
            }

            $pad->save();

            // ── Categories ────────────────────────────────────────
            $categoryIds = [];

            foreach ($request->categories ?? [] as $cat) {
                $type  = is_array($cat['type'] ?? null)
                    ? ($cat['type'][$locale] ?? $cat['type']['en'] ?? '')
                    : (string) ($cat['type'] ?? '');
                $value = is_array($cat['value'] ?? null)
                    ? ($cat['value'][$locale] ?? $cat['value']['en'] ?? '')
                    : (string) ($cat['value'] ?? '');

                if ($type === '' || $value === '') {
                    continue;
                }

                $category = $this->findOrCreateCategory($type, $value, $locale);
                $categoryIds[] = $category->id;
            }

            $pad->categories()->sync($categoryIds);

            // ── Multiple Recorded Versions ────────────────────────
            $versions = $request->input('recorded_versions', []);
            $files    = $request->file('recorded_versions', []);
            $keptIds  = [];

            foreach ($versions as $index => $media) {
                $existingId = $media['id'] ?? null;
                $path       = null;

                // New file uploaded for this index?
                if (isset($files[$index]['file']) && $files[$index]['file']->isValid()) {
                    $path = $files[$index]['file']->store('pad-media', 'public');
                }

                if ($existingId) {
                    // ── Update existing version ───────────────────
                    $rv = $pad->recordedVersions()
                        ->where('id', $existingId)
                        ->first();

                    if (! $rv) {
                        continue;
                    }

                    // Replace file if a new one was uploaded
                    if ($path !== null) {
                        if (! empty($rv->file_url)) {
                            Storage::disk('public')->delete($rv->file_url);
                        }
                        $rv->file_url = $path;
                    }

                    $rv->media_type     = $media['media_type'] ?? $rv->media_type;
                    $rv->recording_type = $media['recording_type'] ?? $rv->recording_type;

                    foreach (['singer', 'publisher', 'vocalization'] as $field) {
                        $text = data_get($media, "{$field}.{$locale}");
                        if (is_string($text) && $text !== '') {
                            $rv->setTranslation($field, $locale, $text);
                        }
                    }

                    $rv->save();
                    $keptIds[] = $rv->id;
                } else {
                    // ── Create new version ────────────────────────
                    $rv = new \App\Models\Pad_media([
                        'media_type'     => $media['media_type'] ?? null,
                        'file_url'       => $path,
                        'recording_type' => $media['recording_type'] ?? null,
                    ]);

                    foreach (['singer', 'publisher', 'vocalization'] as $field) {
                        $text = data_get($media, "{$field}.{$locale}");
                        if (is_string($text) && $text !== '') {
                            $rv->setTranslation($field, $locale, $text);
                        }
                    }

                    $hasContent = $path
                        || ! empty($rv->media_type)
                        || ! empty($rv->recording_type)
                        || $rv->getTranslation('singer', $locale, false)
                        || $rv->getTranslation('publisher', $locale, false)
                        || $rv->getTranslation('vocalization', $locale, false);

                    if ($hasContent) {
                        $pad->recordedVersions()->save($rv);
                        $keptIds[] = $rv->id;
                    }
                }
            }

            // ── Delete versions that were removed in the UI ───────
            $pad->recordedVersions()
                ->whereNotIn('id', $keptIds)
                ->get()
                ->each(function ($rv) {
                    if (! empty($rv->file_url)) {
                        Storage::disk('public')->delete($rv->file_url);
                    }
                    $rv->delete();
                });
        });

        return redirect()
            ->route('role.pads.list', [
                'rolePrefix' => $rolePrefix,
            ])
            ->with('success', [
                'en' => 'Pad updated successfully.',
                'gu' => 'પદ સફળતાપૂર્વક અપડેટ કરવામાં આવ્યું.',
            ]);
    }

    private function setTranslations($model, string $field, ?string $en, ?string $gu): void
    {
        if (is_string($en) && $en !== '') {
            $model->setTranslation($field, 'en', $en);
        }
        if (is_string($gu) && $gu !== '') {
            $model->setTranslation($field, 'gu', $gu);
        }
    }
    /**
     * Find category by English (or current locale) text, or create it.
     * Does not wipe other locale translations.
     */
    private function findOrCreateCategory(string $type, string $value, string $locale): Category
    {
        // Prefer matching on English key when available
        $category = Category::query()
            ->where(function ($q) use ($type) {
                $q->where('type->en', $type)
                    ->orWhere('type->gu', $type)
                    ->orWhere('type', $type); // legacy plain string
            })
            ->where(function ($q) use ($value) {
                $q->where('value->en', $value)
                    ->orWhere('value->gu', $value)
                    ->orWhere('value', $value);
            })
            ->first();

        if ($category) {
            // Fill missing translation for this locale if empty
            if (! $category->getTranslation('type', $locale, false)) {
                $category->setTranslation('type', $locale, $type);
            }
            if (! $category->getTranslation('value', $locale, false)) {
                $category->setTranslation('value', $locale, $value);
            }
            $category->save();

            return $category;
        }

        $category = new Category([
            'created_by' => Auth::id(),
        ]);
        $category->setTranslation('type', $locale, $type);
        $category->setTranslation('value', $locale, $value);
        $category->save();

        return $category;
    }

    /**
     * Optional helper if you still use it elsewhere.
     * Only writes non-empty strings; never writes null (avoids wiping).
     */



    /**
     * Single delete
     * DELETE /admin/pads/{pad}
     */
    public function destroy($rolePrefix, Pad $pad)
    {
        // dd($pad);
        $this->deletePad($pad);

        return back()->with('success', 'Pad deleted successfully.');
    }

    /**
     * Shared delete logic
     */
    private function deletePad(Pad $pad): void
    {
        $pad->loadMissing('recordedVersion');

        // Remove media file from disk
        if ($pad->recordedVersion?->file_url) {
            Storage::disk('public')->delete($pad->recordedVersion->file_url);
        }

        // Delete recorded version row
        $pad->recordedVersion()?->delete();

        // Detach categories pivot
        $pad->categories()->detach();

        // Delete pad
        $pad->delete();
    }

    /**
     * Multiple delete
     * POST /admin/pads/bulk-destroy
     * body: { ids: [1, 2, 3] }
     */
    // public function bulkDestroy(Request $request)
    // {
    //     // dd($request->all());
    //     $request->validate([
    //         'ids'   => 'required|array|min:1',
    //         'ids.*' => 'integer|exists:pads,id',
    //     ]);

    //     $pads = Pad::whereIn('id', $request->ids)->get();

    //     foreach ($pads as $pad) {
    //         $this->deletePad($pad);
    //     }

    //     $count = $pads->count();

    //     return back()->with(
    //         'success',
    //         $count === 1
    //             ? 'Pad deleted successfully.'
    //             : "{$count} pads deleted successfully."
    //     );
    // }




    public function bulkDestroy($rolePrefix, Request $request)
    {
        $ids = $request->input('ids', []);

        if (empty($ids)) {
            return back()->with('error', 'No pads selected.');
        }

        Pad::whereIn('id', $ids)->delete();

        return back()->with('success', 'Pads deleted successfully.');
    }




    public function toggleFavorite($rolePrefix, Request $request, Pad $pad)
    {
        $user = $request->user();

        $attached = $user->favoritePads()->toggle($pad->id);

        $isFavorited = in_array($pad->id, $attached['attached']);

        return back()->with([
            'success' => $isFavorited
                ? (app()->getLocale() === 'gu' ? 'પદ મનપસંદમાં ઉમેરાયું.' : 'Added to favorites.')
                : (app()->getLocale() === 'gu' ? 'પદ મનપસંદમાંથી દૂર કર્યું.' : 'Removed from favorites.'),
            'is_favorited' => $isFavorited,
        ]);
    }


    public function favorites($rolePrefix, Request $request)
    {
        $locale = app()->getLocale();
        if (!in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }

        $search        = trim((string) $request->input('search', ''));
        $categoryType  = trim((string) $request->input('category_type', ''));
        $categoryValue = trim((string) $request->input('category_value', ''));

        $query = Pad::query()
            ->whereHas('favoritedByUsers', function ($q) {
                $q->where('user_id', Auth::id());
            })
            ->with([
                'categories:id,type,value',
                'recordedVersion',
            ])
            ->latest();

        // Search
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title->en', 'like', "%{$search}%")
                    ->orWhere('title->gu', 'like', "%{$search}%")
                    ->orWhere('value->en', 'like', "%{$search}%")
                    ->orWhere('value->gu', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%")
                    ->orWhere('establish_date', 'like', "%{$search}%")
                    ->orWhereHas('categories', function ($cq) use ($search) {
                        $cq->where('type->en', 'like', "%{$search}%")
                            ->orWhere('type->gu', 'like', "%{$search}%")
                            ->orWhere('value->en', 'like', "%{$search}%")
                            ->orWhere('value->gu', 'like', "%{$search}%");
                    })
                    ->orWhereHas('recordedVersion', function ($rq) use ($search) {
                        $rq->where('media_type', 'like', "%{$search}%")
                            ->orWhere('recording_type', 'like', "%{$search}%")
                            ->orWhere('singer->en', 'like', "%{$search}%")
                            ->orWhere('singer->gu', 'like', "%{$search}%")
                            ->orWhere('publisher->en', 'like', "%{$search}%")
                            ->orWhere('publisher->gu', 'like', "%{$search}%")
                            ->orWhere('vocalization->en', 'like', "%{$search}%")
                            ->orWhere('vocalization->gu', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by Category Type
        if ($categoryType !== '') {
            $query->whereHas('categories', function ($q) use ($categoryType) {
                $q->where('type->en', $categoryType)
                    ->orWhere('type->gu', $categoryType);
            });
        }

        // Filter by Category Value
        if ($categoryValue !== '') {
            $query->whereHas('categories', function ($q) use ($categoryValue) {
                $q->where('value->en', $categoryValue)
                    ->orWhere('value->gu', $categoryValue);
            });
        }

        $pads = $query->get();

        // ★ Category Type + Value options (Spatie Translatable)
        $categoryTypes = Category::query()
            ->get(['id', 'type', 'value'])
            ->map(function ($category) {
                return [
                    'type_en'  => $category->getTranslation('type', 'en', false) ?: '',
                    'type_gu'  => $category->getTranslation('type', 'gu', false) ?: '',
                    'value_en' => $category->getTranslation('value', 'en', false) ?: '',
                    'value_gu' => $category->getTranslation('value', 'gu', false) ?: '',
                ];
            })
            ->filter(fn($item) => !empty($item['type_en']) || !empty($item['type_gu']))
            ->unique(fn($item) => ($item['type_en'] ?: $item['type_gu']) . '|' . ($item['value_en'] ?: $item['value_gu']))
            ->values();

        $totalFavorites = Pad::query()
            ->whereHas('favoritedByUsers', fn($q) => $q->where('user_id', Auth::id()))
            ->count();

        return Inertia::render('Admin/Pads/Favorites', [
            'pads'           => $pads,
            'categoryTypes'  => $categoryTypes,
            'filters'        => [
                'search'         => $search,
                'category_type'  => $categoryType,
                'category_value' => $categoryValue,
            ],
            'totalFavorites' => $totalFavorites,
        ]);
    }
}
