<?php
// app/Http/Controllers/Category/DynamicCategoryController.php

namespace App\Http\Controllers\Category;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Language;
use App\Models\Pad;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DynamicCategoryController extends Controller
{
    private function types(): array
    {
        return config('category_types', []);
    }

    private function typeConfig(string $type): array
    {
        $types = $this->types();
        if (!isset($types[$type])) {
            abort(404, "Unknown category type: {$type}");
        }
        return $types[$type];
    }

    private function supportedLocales(): array
    {
        $codes = Language::query()
            ->pluck('code')
            ->filter()
            ->map(fn($c) => strtolower(trim($c)))
            ->unique()
            ->values()
            ->all();

        return $codes ?: ['en'];
    }

    private function resolveLocale(?string $locale = null): string
    {
        $locale = strtolower(trim($locale ?: app()->getLocale()));
        $locales = $this->supportedLocales();
        return in_array($locale, $locales, true) ? $locale : ($locales[0] ?? 'en');
    }

    private function t($model, string $field, string $locale): string
    {
        if (!$model)
            return '';
        $value = $model->getTranslation($field, $locale, false);
        if (is_string($value) && trim($value) !== '')
            return $value;

        foreach ($this->supportedLocales() as $code) {
            $fallback = $model->getTranslation($field, $code, false);
            if (is_string($fallback) && trim($fallback) !== '')
                return $fallback;
        }
        return '';
    }

    private function typeTranslations(string $type): array
    {
        $cfg = $this->typeConfig($type);
        $result = [];

        foreach ($this->supportedLocales() as $locale) {
            if (!empty($cfg['is_custom']))
                continue;

            $value = __($cfg['translation_key'], [], $locale);
            if (!is_string($value) || $value === $cfg['translation_key'] || trim($value) === '') {
                $value = $cfg[$locale] ?? $cfg['key'] ?? 'Category';
            }
            $result[$locale] = $value;
        }
        return $result;
    }

    private function isOfType(Category $category, string $type): bool
    {
        $cfg = $this->typeConfig($type);

        if (!empty($cfg['is_custom'])) {
            return (bool) $category->is_custom;
        }

        $expected = $this->typeTranslations($type);

        foreach ($this->supportedLocales() as $locale) {
            $stored = $category->getTranslation('type', $locale, false);
            $want = $expected[$locale] ?? null;

            if (
                is_string($stored) && is_string($want) &&
                mb_strtolower(trim($stored)) === mb_strtolower(trim($want))
            ) {
                return true;
            }
        }

        $en = strtolower(trim($category->getTranslation('type', 'en', false) ?? ''));
        return $en === strtolower($cfg['key'] ?? '');
    }

    // ────────────────────────────────────────────────
    // LIST
    // ────────────────────────────────────────────────
    public function list(string $rolePrefix, string $type, Request $request)
    {
        // dd('dd');
        $cfg = $this->typeConfig($type);
        $locale = $this->resolveLocale($request->input('locale'));
        $locales = $this->supportedLocales();
        $search = trim($request->input('search', ''));
        $letter = trim($request->input('letter', ''));
        $customType = trim((string) $request->input('custom_type', '')); // ADD THIS

        $query = Category::query()->withCount('pads');

        if (!empty($cfg['is_custom'])) {
            $query->where('is_custom', true);

            if ($customType !== '') {
                $customTypeLower = mb_strtolower(trim($customType));

                // Step 1: find rows that already match this label in ANY locale
                $seedIds = Category::query()
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
                    ->pluck('id');

                // Step 2: collect ALL type labels from those rows (en + gu + …)
                $labels = [$customTypeLower => true];

                if ($seedIds->isNotEmpty()) {
                    $rows = Category::whereIn('id', $seedIds)->get(['type']);
                    foreach ($rows as $row) {
                        foreach ($locales as $code) {
                            $t = $row->getTranslation('type', $code, false);
                            if (is_string($t) && trim($t) !== '') {
                                $labels[mb_strtolower(trim($t))] = true;
                            }
                        }
                    }
                }

                $labelList = array_keys($labels);

                // Step 3: match any locale against any of those labels
                $query->where(function ($q) use ($locales, $labelList) {
                    $first = true;
                    foreach ($labelList as $label) {
                        foreach ($locales as $code) {
                            $method = $first ? 'whereRaw' : 'orWhereRaw';
                            $first = false;
                            $q->{$method}(
                                "LOWER(TRIM(JSON_UNQUOTE(JSON_EXTRACT(type, '$.\"{$code}\"')))) = ?",
                                [$label]
                            );
                        }
                    }
                });
            }
        } else {
            $typeMap = $this->typeTranslations($type);
            $query->where(function ($q) use ($locales, $typeMap, $cfg) {
                foreach ($locales as $i => $code) {
                    $expected = mb_strtolower($typeMap[$code] ?? $cfg['key'] ?? '');
                    if ($expected === '')
                        continue;
                    $method = $i === 0 ? 'whereRaw' : 'orWhereRaw';
                    $q->{$method}(
                        "LOWER(JSON_UNQUOTE(JSON_EXTRACT(type, '$.\"{$code}\"'))) = ?",
                        [$expected]
                    );
                }
                $q->orWhereRaw(
                    "LOWER(JSON_UNQUOTE(JSON_EXTRACT(type, '$.\"en\"'))) = ?",
                    [mb_strtolower($cfg['key'] ?? '')]
                );
            });
        }

        if ($letter !== '') {
            $query->whereRaw(
                "JSON_UNQUOTE(JSON_EXTRACT(value, '$.\"{$locale}\"')) LIKE ?",
                [$letter . '%']
            );
        }

        if ($search !== '') {
            $searchTrim = trim($search);
            $searchLike = '%' . mb_strtolower($searchTrim) . '%';

            $query->where(function ($q) use ($searchTrim, $searchLike, $locales) {
                if (is_numeric($searchTrim)) {
                    $q->where('id', $searchTrim)
                        ->orWhere('id', 'like', '%' . $searchTrim . '%');
                }

                foreach ($locales as $code) {
                    $q->orWhereRaw(
                        "LOWER(JSON_UNQUOTE(JSON_EXTRACT(value, '$.\"{$code}\"'))) LIKE ?",
                        [$searchLike]
                    )->orWhereRaw(
                        "LOWER(JSON_UNQUOTE(JSON_EXTRACT(type, '$.\"{$code}\"'))) LIKE ?",
                        [$searchLike]
                    );
                }

                $q->orWhereHas('pads', function ($padQuery) use ($searchLike, $searchTrim, $locales) {
                    $padQuery->where(function ($pq) use ($searchLike, $searchTrim, $locales) {
                        foreach ($locales as $code) {
                            $pq->orWhereRaw(
                                "LOWER(JSON_UNQUOTE(JSON_EXTRACT(title, '$.\"{$code}\"'))) LIKE ?",
                                [$searchLike]
                            )->orWhereRaw(
                                "LOWER(JSON_UNQUOTE(JSON_EXTRACT(value, '$.\"{$code}\"'))) LIKE ?",
                                [$searchLike]
                            );
                        }
                        $pq->orWhereRaw('LOWER(status) LIKE ?', [$searchLike])
                            ->orWhere('establish_date', 'LIKE', '%' . $searchTrim . '%');
                    })
                        ->orWhereHas('categories', function ($cq) use ($searchLike, $locales) {
                            $cq->where(function ($c) use ($searchLike, $locales) {
                                foreach ($locales as $code) {
                                    $c->orWhereRaw(
                                        "LOWER(JSON_UNQUOTE(JSON_EXTRACT(type, '$.\"{$code}\"'))) LIKE ?",
                                        [$searchLike]
                                    )->orWhereRaw(
                                        "LOWER(JSON_UNQUOTE(JSON_EXTRACT(value, '$.\"{$code}\"'))) LIKE ?",
                                        [$searchLike]
                                    );
                                }
                            });
                        })
                        ->orWhereHas('recordedVersion', function ($rq) use ($searchLike, $locales) {
                            $rq->where(function ($r) use ($searchLike, $locales) {
                                foreach ($locales as $code) {
                                    $r->orWhereRaw(
                                        "LOWER(JSON_UNQUOTE(JSON_EXTRACT(singer, '$.\"{$code}\"'))) LIKE ?",
                                        [$searchLike]
                                    )->orWhereRaw(
                                        "LOWER(JSON_UNQUOTE(JSON_EXTRACT(publisher, '$.\"{$code}\"'))) LIKE ?",
                                        [$searchLike]
                                    )->orWhereRaw(
                                        "LOWER(JSON_UNQUOTE(JSON_EXTRACT(vocalization, '$.\"{$code}\"'))) LIKE ?",
                                        [$searchLike]
                                    );
                                }
                                $r->orWhereRaw('LOWER(media_type) LIKE ?', [$searchLike])
                                    ->orWhereRaw('LOWER(recording_type) LIKE ?', [$searchLike])
                                    ->orWhereRaw('LOWER(file_url) LIKE ?', [$searchLike]);
                            });
                        });
                });
            });
        }

        $items = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Admin/Categories/DynamicCategory/CategoryList', [
            'items' => $items,
            'type' => $type,
            'typeConfig' => $cfg,
            'filters' => [
                'search' => $search,
                'letter' => $letter,
                'custom_type' => $customType, // ADD THIS
            ],
            'locale' => $locale,
            'languages' => Language::orderBy('id')->get(['id', 'code', 'name']),
        ]);
    }

    // ────────────────────────────────────────────────
    // FORM
    // ────────────────────────────────────────────────
    public function form(string $rolePrefix, string $type)
    {
        $cfg = $this->typeConfig($type);

        return Inertia::render('Admin/Categories/DynamicCategory/CategoryForm', [
            'type' => $type,
            'typeConfig' => $cfg,
            'item' => null,
            'locale' => $this->resolveLocale(),
            'languages' => Language::orderBy('id')->get(['id', 'code', 'name']),
        ]);
    }

    // ────────────────────────────────────────────────
    // STORE
    // ────────────────────────────────────────────────
    public function store(string $rolePrefix, string $type, Request $request)
    {
        $cfg = $this->typeConfig($type);
        $locales = $this->supportedLocales();
        $locale = $this->resolveLocale($request->input('locale'));

        $rules = ['locale' => 'nullable|string'];
        foreach ($locales as $code) {
            $rules["value.{$code}"] = 'nullable|string';
            if (!empty($cfg['is_custom'])) {
                $rules["type.{$code}"] = 'nullable|string|max:100';
            }
        }
        $validated = $request->validate($rules);

        $values = [];
        foreach ($locales as $code) {
            $values[$code] = trim($validated['value'][$code] ?? '');
        }

        if (!collect($values)->contains(fn($v) => $v !== '')) {
            return back()
                ->withErrors(["value.{$locale}" => "{$type}_name_required"])
                ->withInput();
        }

        $data = [
            'created_by' => Auth::id(),
            'value' => $values,
        ];

        // if (!empty($cfg['is_custom'])) {
        //     $data['is_custom'] = true;
        //     $typeValues = [];
        //     foreach ($locales as $code) {
        //         $typeValues[$code] = trim($validated['type'][$code] ?? '');
        //     }
        //     if (!collect($typeValues)->contains(fn($v) => $v !== '')) {
        //         return back()
        //             ->withErrors(["type.{$locale}" => 'type_required'])
        //             ->withInput();
        //     }
        //     $data['type'] = $typeValues;
        // } else {
        //     $data['type'] = $this->typeTranslations($type);
        // }

        // if (!empty($cfg['is_custom'])) {
        //     $data['is_custom'] = true;

        //     $typeValues = [];
        //     foreach ($locales as $code) {
        //         $typeValues[$code] = trim($validated['type'][$code] ?? '');
        //     }

        //     // Use first non-empty type as fallback for empty locales
        //     $primaryType = collect($typeValues)->first(fn($v) => $v !== '') ?? '';

        //     if ($primaryType === '') {
        //         return back()
        //             ->withErrors(["type.{$locale}" => 'type_required'])
        //             ->withInput();
        //     }

        //     foreach ($locales as $code) {
        //         if ($typeValues[$code] === '') {
        //             $typeValues[$code] = $primaryType;
        //         }
        //     }

        //     $data['type'] = $typeValues;
        // } else {
        //     $data['type'] = $this->typeTranslations($type);
        // }

        if (!empty($cfg['is_custom'])) {
            $data['is_custom'] = true;

            $typeValues = [];
            foreach ($locales as $code) {
                $typeValues[$code] = trim($validated['type'][$code] ?? '');
            }

            if (!collect($typeValues)->contains(fn($v) => $v !== '')) {
                return back()
                    ->withErrors(["type.{$locale}" => 'type_required'])
                    ->withInput();
            }

            // DO NOT copy into empty locales
            $data['type'] = $typeValues;
        } else {
            $data['type'] = $this->typeTranslations($type);
        }
        Category::create($data);

        // return redirect()
        //     ->route('role.category.list', ['rolePrefix' => $rolePrefix, 'type' => $type])
        //     ->with('success', "{$type}_created_success");
        $listUrl = route('role.category.list', [
            'rolePrefix' => $rolePrefix,
            'type' => $type,
        ]);

        $customType = trim((string) $request->input('custom_type', ''));

        // if ($customType === '' && !empty($cfg['is_custom'])) {
        //     $customType = trim($typeValues[$locale] ?? '');
        // }

        if ($customType !== '' && !empty($cfg['is_custom'])) {
            $listUrl .= '?custom_type=' . urlencode($customType);
        }

        return redirect($listUrl)->with('success', "{$type}_created_success");
    }

    // ────────────────────────────────────────────────
    // SHOW
    // ────────────────────────────────────────────────
    public function show(string $rolePrefix, string $type, Category $category)
    {
        if (!$this->isOfType($category, $type)) {
            abort(404);
        }

        $cfg = $this->typeConfig($type);
        $locales = $this->supportedLocales();

        $valueMap = [];
        $typeMap = [];
        foreach ($locales as $code) {
            $valueMap[$code] = $category->getTranslation('value', $code, false) ?: '';
            if (!empty($cfg['is_custom'])) {
                $typeMap[$code] = $category->getTranslation('type', $code, false) ?: '';
            }
        }

        return Inertia::render('Admin/Categories/DynamicCategory/CategoryView', [
            'type' => $type,
            'typeConfig' => $cfg,
            'item' => [
                'id' => $category->id,
                'value' => $valueMap,
                'type' => $typeMap,
                'created_at' => $category->created_at,
                'updated_at' => $category->updated_at,
            ],
            'languages' => Language::orderBy('id')->get(['id', 'code', 'name']),
        ]);
    }

    // ────────────────────────────────────────────────
    // EDIT
    // ────────────────────────────────────────────────
    public function edit(string $rolePrefix, string $type, Category $category)
    {
        if (!$this->isOfType($category, $type)) {
            abort(404);
        }

        $cfg = $this->typeConfig($type);
        $locales = $this->supportedLocales();

        $valueMap = [];
        $typeMap = [];
        foreach ($locales as $code) {
            $valueMap[$code] = $category->getTranslation('value', $code, false) ?: '';
            if (!empty($cfg['is_custom'])) {
                $typeMap[$code] = $category->getTranslation('type', $code, false) ?: '';
            }
        }

        return Inertia::render('Admin/Categories/DynamicCategory/CategoryForm', [
            'type' => $type,
            'typeConfig' => $cfg,
            'item' => [
                'id' => $category->id,
                'value' => $valueMap,
                'type' => $typeMap,
            ],
            'locale' => $this->resolveLocale(),
            'languages' => Language::orderBy('id')->get(['id', 'code', 'name']),
        ]);
    }

    // ────────────────────────────────────────────────
    // UPDATE
    // ────────────────────────────────────────────────
    // public function update(string $rolePrefix, string $type, Request $request, Category $category)
    // {
    //     if (!$this->isOfType($category, $type)) {
    //         abort(404);
    //     }

    //     $cfg = $this->typeConfig($type);
    //     $locales = $this->supportedLocales();
    //     $locale = $this->resolveLocale($request->input('locale'));

    //     $rules = ['locale' => 'nullable|string'];
    //     foreach ($locales as $code) {
    //         $rules["value.{$code}"] = 'nullable|string';
    //         if (!empty($cfg['is_custom'])) {
    //             $rules["type.{$code}"] = 'nullable|string|max:100';
    //         }
    //     }
    //     $validated = $request->validate($rules);

    //     $values = [];
    //     foreach ($locales as $code) {
    //         $values[$code] = trim($validated['value'][$code] ?? '');
    //     }

    //     if (!collect($values)->contains(fn($v) => $v !== '')) {
    //         return back()
    //             ->withErrors(["value.{$locale}" => "{$type}_name_required"])
    //             ->withInput();
    //     }

    //     if (!empty($cfg['is_custom'])) {
    //         $typeValues = [];
    //         foreach ($locales as $code) {
    //             $typeValues[$code] = trim($validated['type'][$code] ?? '');
    //         }
    //         if (!collect($typeValues)->contains(fn($v) => $v !== '')) {
    //             return back()
    //                 ->withErrors(["type.{$locale}" => 'type_required'])
    //                 ->withInput();
    //         }

    //         // Save the newly submitted type translations
    //         foreach ($typeValues as $code => $val) {
    //             if ($val !== '') {
    //                 $category->setTranslation('type', $code, $val);
    //             }
    //         }

    //         foreach ($locales as $code) {
    //             $existing = $category->getTranslation('type', $code, false);
    //             if (!is_string($existing) || trim($existing) === '') {
    //                 // copy from any other locale that has a value
    //                 foreach ($locales as $fallback) {
    //                     $fb = $category->getTranslation('type', $fallback, false);
    //                     if (is_string($fb) && trim($fb) !== '') {
    //                         $category->setTranslation('type', $code, trim($fb));
    //                         break;
    //                     }
    //                 }
    //             }
    //         }
    //     } else {
    //         foreach ($this->typeTranslations($type) as $code => $val) {
    //             $category->setTranslation('type', $code, $val);
    //         }
    //     }

    //     foreach ($values as $code => $val) {
    //         $category->setTranslation('value', $code, $val);
    //     }

    //     $category->save();

    //     return redirect()
    //         ->route('role.category.list', ['rolePrefix' => $rolePrefix, 'type' => $type])
    //         ->with('success', "{$type}_updated_success");
    // }

    // public function update(string $rolePrefix, string $type, Request $request, Category $category)
    // {
    //     if (!$this->isOfType($category, $type)) {
    //         abort(404);
    //     }

    //     $cfg = $this->typeConfig($type);
    //     $locales = $this->supportedLocales();
    //     $locale = $this->resolveLocale($request->input('locale'));

    //     $rules = ['locale' => 'nullable|string'];
    //     foreach ($locales as $code) {
    //         $rules["value.{$code}"] = 'nullable|string';
    //         if (!empty($cfg['is_custom'])) {
    //             $rules["type.{$code}"] = 'nullable|string|max:100';
    //         }
    //     }
    //     $validated = $request->validate($rules);

    //     $values = [];
    //     foreach ($locales as $code) {
    //         $values[$code] = trim($validated['value'][$code] ?? '');
    //     }

    //     if (!collect($values)->contains(fn($v) => $v !== '')) {
    //         return back()
    //             ->withErrors(["value.{$locale}" => "{$type}_name_required"])
    //             ->withInput();
    //     }

    //     if (!empty($cfg['is_custom'])) {
    //         // Type is locked — do not change it
    //     } else {
    //         foreach ($this->typeTranslations($type) as $code => $val) {
    //             $category->setTranslation('type', $code, $val);
    //         }
    //     }

    //     foreach ($values as $code => $val) {
    //         $category->setTranslation('value', $code, $val);
    //     }

    //     $category->save();

    //     return redirect()
    //         ->route('role.category.list', ['rolePrefix' => $rolePrefix, 'type' => $type])
    //         ->with('success', "{$type}_updated_success");
    // }

    public function update(string $rolePrefix, string $type, Request $request, Category $category)
    {
        if (!$this->isOfType($category, $type)) {
            abort(404);
        }

        $cfg = $this->typeConfig($type);
        $locales = $this->supportedLocales();
        $locale = $this->resolveLocale($request->input('locale'));

        $rules = ['locale' => 'nullable|string'];
        foreach ($locales as $code) {
            $rules["value.{$code}"] = 'nullable|string';
            if (!empty($cfg['is_custom'])) {
                $rules["type.{$code}"] = 'nullable|string|max:100';
            }
        }
        $validated = $request->validate($rules);

        $values = [];
        foreach ($locales as $code) {
            $values[$code] = trim($validated['value'][$code] ?? '');
        }

        if (!collect($values)->contains(fn($v) => $v !== '')) {
            return back()
                ->withErrors(["value.{$locale}" => "{$type}_name_required"])
                ->withInput();
        }

        if (!empty($cfg['is_custom'])) {
            $typeValues = [];
            foreach ($locales as $code) {
                $typeValues[$code] = trim($validated['type'][$code] ?? '');
            }

            // Save only non-empty type locales — never copy to other languages
            foreach ($typeValues as $code => $val) {
                if ($val !== '') {
                    $category->setTranslation('type', $code, $val);
                }
            }
        } else {
            foreach ($this->typeTranslations($type) as $code => $val) {
                $category->setTranslation('type', $code, $val);
            }
        }

        foreach ($values as $code => $val) {
            $category->setTranslation('value', $code, $val);
        }

        $category->save();

        // return redirect()
        //     ->route('role.category.list', ['rolePrefix' => $rolePrefix, 'type' => $type])
        //     ->with('success', "{$type}_updated_success");
        $listUrl = route('role.category.list', [
            'rolePrefix' => $rolePrefix,
            'type' => $type,
        ]);

        $customType = trim((string) $request->input('custom_type', ''));
        
        if ($customType !== '' && !empty($cfg['is_custom'])) {
            $listUrl .= '?custom_type=' . urlencode($customType);
        }

        return redirect($listUrl)->with('success', "{$type}_updated_success");
    }
    // ────────────────────────────────────────────────
    // SHOW PADS
    // ────────────────────────────────────────────────
    public function padsShow(string $rolePrefix, string $type, Category $category)
    {
        if (!$this->isOfType($category, $type)) {
            abort(404);
        }

        $locale = $this->resolveLocale();
        $cfg = $this->typeConfig($type);

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
                        ? Carbon::parse($pad->establish_date)->format('Y-m-d')
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

        return Inertia::render('Admin/Categories/DynamicCategory/CategoryShowPads', [
            'type' => $type,
            'typeConfig' => $cfg,
            'category' => [
                'id' => $category->id,
                'name' => $this->t($category, 'value', $locale),
                'type' => $this->t($category, 'type', $locale),
            ],
            'pads' => $pads,
            'locale' => $locale,
            'languages' => Language::orderBy('id')->get(['id', 'code', 'name']),
        ]);
    }

    // ────────────────────────────────────────────────
    // DESTROY
    // ────────────────────────────────────────────────
    public function destroy(string $rolePrefix, string $type, Request $request, $id)
    {
        $category = Category::findOrFail($id);

        if (!$this->isOfType($category, $type)) {
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

        return back()->with(
            'success',
            $deleteRelatedPads
                ? "{$type}_and_pads_deleted_success"
                : "{$type}_deleted_success"
        );
    }

    // ────────────────────────────────────────────────
    // BULK DESTROY
    // ────────────────────────────────────────────────
    public function bulkDestroy(string $rolePrefix, string $type, Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:categories,id',
        ]);

        $ids = $request->input('ids', []);
        if (empty($ids)) {
            return back()->with('error', 'select_at_least_one');
        }

        $categories = Category::whereIn('id', $ids)
            ->get()
            ->filter(fn($c) => $this->isOfType($c, $type))
            ->values();

        if ($categories->isEmpty()) {
            return back()->with('error', 'select_at_least_one');
        }

        $deletePads = $request->boolean('delete_related_pads');

        if ($deletePads) {
            foreach ($categories as $cat) {
                $padIds = $cat->pads()->pluck('pads.id');
                if ($padIds->isNotEmpty()) {
                    Pad::whereIn('id', $padIds)->delete();
                }
            }
        }

        Category::whereIn('id', $categories->pluck('id'))->delete();

        return back()->with(
            'success',
            $deletePads
                ? "{$type}s_and_pads_deleted_success"
                : "{$type}s_deleted_success"
        );
    }
}
