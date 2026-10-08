<?php

namespace App\Http\Controllers\Category;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Language;
use App\Models\Pad;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class NameController extends Controller
{
    /**
     * Get all supported language codes from database.
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
     * Resolve the current locale.
     */
    private function resolveLocale(?string $locale = null): string
    {
        $locale = $locale ?: app()->getLocale();

        $locales = $this->supportedLocales();

        return in_array($locale, $locales, true)
            ? $locale
            : ($locales[0] ?? 'en');
    }

    /**
     * Read translation JSON files.
     *
     * Your project uses:
     * lang/{locale}/{locale}.json
     * lang/{locale}/messages.json
     */
    private function translationValues(string $locale): array
    {
        $values = [];

        $paths = [
            base_path("lang/{$locale}/{$locale}.json"),
            base_path("lang/{$locale}/messages.json"),
        ];

        foreach ($paths as $path) {
            if (!File::exists($path)) {
                continue;
            }

            $json = json_decode(File::get($path), true);

            if (is_array($json)) {
                $values = array_merge($values, $json);
            }
        }

        return $values;
    }

    /**
     * Get category type translation for a category type key.
     *
     * Example:
     * en => Name
     * gu => નામ
     * hi => नाम
     */
    private function categoryTypeTranslation(
        string $typeKey,
        string $locale
    ): string {
        $translations = $this->translationValues($locale);

        return isset($translations[$typeKey])
            && is_string($translations[$typeKey])
            ? trim($translations[$typeKey])
            : '';
    }

    /**
     * Get all translations for a category type.
     */
    private function categoryTypeTranslations(string $typeKey): array
    {
        $result = [];

        foreach ($this->supportedLocales() as $locale) {
            $translation = $this->categoryTypeTranslation(
                $typeKey,
                $locale
            );

            if ($translation !== '') {
                $result[$locale] = $translation;
            }
        }

        return $result;
    }

    /**
     * Check whether a category is a Name category.
     */
    private function isName(Category $category): bool
    {
        $nameTypes = $this->categoryTypeTranslations('name');

        foreach ($this->supportedLocales() as $locale) {
            $categoryType = $category->getTranslation(
                'type',
                $locale,
                false
            );

            if (
                is_string($categoryType)
                && $categoryType !== ''
                && isset($nameTypes[$locale])
                && $categoryType === $nameTypes[$locale]
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get translated value with current locale first,
     * then fallback to another available language.
     */
    private function translatedValue(
        $model,
        string $field,
        string $locale
    ): string {
        if (!$model) {
            return '';
        }

        $value = $model->getTranslation(
            $field,
            $locale,
            false
        );

        if (is_string($value) && trim($value) !== '') {
            return $value;
        }

        foreach ($this->supportedLocales() as $fallbackLocale) {
            $fallback = $model->getTranslation(
                $field,
                $fallbackLocale,
                false
            );

            if (
                is_string($fallback)
                && trim($fallback) !== ''
            ) {
                return $fallback;
            }
        }

        return '';
    }

    /**
     * Get all language values for a model field.
     */
    private function getLanguageValues(
        $model,
        string $field
    ): array {
        $values = [];

        foreach ($this->supportedLocales() as $locale) {
            $values[$locale] = $model
                ? ($model->getTranslation($field, $locale, false) ?: '')
                : '';
        }

        return $values;
    }

    /**
     * NAME LIST
     */
    public function nameList(Request $request)
    {
        $locale = $this->resolveLocale(
            $request->input('locale', app()->getLocale())
        );

        $locales = $this->supportedLocales();

        $search = trim($request->input('search', ''));
        $letter = trim($request->input('letter', ''));

        $nameTypes = $this->categoryTypeTranslations('name');

        $query = Category::query()
            ->where(function ($q) use ($nameTypes, $locales) {
                foreach ($locales as $index => $language) {
                    if (
                        !isset($nameTypes[$language])
                        || $nameTypes[$language] === ''
                    ) {
                        continue;
                    }

                    $method = $index === 0
                        ? 'whereRaw'
                        : 'orWhereRaw';

                    $q->{$method}(
                        "JSON_UNQUOTE(JSON_EXTRACT(type, '$.{$language}')) = ?",
                        [$nameTypes[$language]]
                    );
                }
            })
            ->withCount('pads');

        /**
         * Alphabet filter
         */
        if ($letter !== '') {
            $query->where(function ($q) use ($letter, $locale) {
                $valuePath = '$.' . $locale;

                if ($locale === 'en') {
                    $q->whereRaw(
                        "LOWER(JSON_UNQUOTE(JSON_EXTRACT(value, ?))) LIKE ?",
                        [
                            $valuePath,
                            strtolower($letter) . '%',
                        ]
                    );
                } else {
                    $q->whereRaw(
                        "JSON_UNQUOTE(JSON_EXTRACT(value, ?)) LIKE ?",
                        [
                            $valuePath,
                            $letter . '%',
                        ]
                    );
                }
            });
        }

        /**
         * Search
         */
        /**
         * Search
         */
        if ($search !== '') {
            $searchLike = '%' . $search . '%';

            $query->where(function ($q) use (
                $search,
                $searchLike,
                $locales
            ) {
                /**
                 * ID
                 */
                if (is_numeric($search)) {
                    $q->where('id', $search)
                        ->orWhere('id', 'like', $searchLike);
                }

                /**
                 * Name value
                 */
                foreach ($locales as $locale) {
                    $q->orWhereRaw(
                        "JSON_UNQUOTE(JSON_EXTRACT(value, '$.{$locale}')) LIKE ?",
                        [$searchLike]
                    );
                }

                /**
                 * Name type
                 */
                foreach ($locales as $locale) {
                    $q->orWhereRaw(
                        "JSON_UNQUOTE(JSON_EXTRACT(type, '$.{$locale}')) LIKE ?",
                        [$searchLike]
                    );
                }

                /**
                 * Related Pads – FIXED
                 */
                $q->orWhereHas(
                    'pads',
                    function ($padQuery) use (
                        $searchLike,
                        $locales
                    ) {
                        // Wrap all pad-level conditions
                        $padQuery->where(function ($pq) use ($searchLike, $locales) {
                            /**
                             * Pad title
                             */
                            foreach ($locales as $locale) {
                                $pq->orWhereRaw(
                                    "JSON_UNQUOTE(JSON_EXTRACT(title, '$.{$locale}')) LIKE ?",
                                    [$searchLike]
                                );
                            }

                            /**
                             * Pad value
                             */
                            foreach ($locales as $locale) {
                                $pq->orWhereRaw(
                                    "JSON_UNQUOTE(JSON_EXTRACT(value, '$.{$locale}')) LIKE ?",
                                    [$searchLike]
                                );
                            }

                            /**
                             * Normal Pad fields
                             */
                            $pq->orWhere('status', 'LIKE', $searchLike)
                                ->orWhere('establish_date', 'LIKE', $searchLike);
                        })

                            /**
                             * Pad Categories – FIXED
                             */
                            ->orWhereHas(
                                'categories',
                                function ($categoryQuery) use (
                                    $searchLike,
                                    $locales
                                ) {
                                    $categoryQuery->where(function ($cq) use ($searchLike, $locales) {
                                        foreach ($locales as $locale) {
                                            $cq->orWhereRaw(
                                                "JSON_UNQUOTE(JSON_EXTRACT(type, '$.{$locale}')) LIKE ?",
                                                [$searchLike]
                                            )
                                                ->orWhereRaw(
                                                    "JSON_UNQUOTE(JSON_EXTRACT(value, '$.{$locale}')) LIKE ?",
                                                    [$searchLike]
                                                );
                                        }
                                    });
                                }
                            )

                            /**
                             * Recorded Version – FIXED
                             */
                            ->orWhereHas(
                                'recordedVersion',
                                function ($recordingQuery) use (
                                    $searchLike,
                                    $locales
                                ) {
                                    $recordingQuery->where(function ($rq) use ($searchLike, $locales) {
                                        foreach ($locales as $locale) {
                                            $rq->orWhereRaw(
                                                "JSON_UNQUOTE(JSON_EXTRACT(singer, '$.{$locale}')) LIKE ?",
                                                [$searchLike]
                                            )
                                                ->orWhereRaw(
                                                    "JSON_UNQUOTE(JSON_EXTRACT(publisher, '$.{$locale}')) LIKE ?",
                                                    [$searchLike]
                                                )
                                                ->orWhereRaw(
                                                    "JSON_UNQUOTE(JSON_EXTRACT(vocalization, '$.{$locale}')) LIKE ?",
                                                    [$searchLike]
                                                );
                                        }

                                        $rq->orWhere('media_type', 'LIKE', $searchLike)
                                            ->orWhere('recording_type', 'LIKE', $searchLike)
                                            ->orWhere('file_url', 'LIKE', $searchLike);
                                    });
                                }
                            );
                    }
                );
            });
        }

        $names = $query
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render(
            'Admin/Categories/Names/NamesList',
            [
                'names' => $names,

                'filters' => [
                    'search' => $search,
                    'letter' => $letter,
                ],

                'locale' => $locale,

                'languages' => Language::query()
                    ->orderBy('id')
                    ->get([
                        'id',
                        'code',
                        'name',
                    ]),
            ]
        );
    }

    /**
     * NAME FORM
     */
    public function nameForm()
    {
        $locale = $this->resolveLocale();

        return Inertia::render(
            'Admin/Categories/Names/NameForm',
            [
                'locale' => $locale,

                'languages' => Language::query()
                    ->orderBy('id')
                    ->get([
                        'id',
                        'code',
                        'name',
                    ]),
            ]
        );
    }

    /**
     * NAME STORE
     */
    public function nameStore(
        $rolePrefix,
        Request $request
    ) {
        $locales = $this->supportedLocales();

        $locale = $this->resolveLocale(
            $request->input(
                'locale',
                app()->getLocale()
            )
        );

        /**
         * Dynamic validation.
         */
        $rules = [
            'locale' => [
                'nullable',
                'string',
                Rule::in($locales),
            ],
        ];

        foreach ($locales as $language) {
            $rules["value.{$language}"] = [
                'nullable',
                'string',
                'max:255',
            ];
        }

        $validated = $request->validate($rules);

        /**
         * Get values for every language.
         */
        $value = [];

        foreach ($locales as $language) {
            $value[$language] = trim(
                $validated['value'][$language] ?? ''
            );
        }

        /**
         * At least one language is required.
         */
        $hasValue = collect($value)
            ->contains(
                fn($item) =>
                is_string($item)
                    && trim($item) !== ''
            );

        if (!$hasValue) {
            return back()
                ->withErrors([
                    "value.{$locale}" => 'name_required',
                ])
                ->withInput();
        }

        /**
         * Create Name category.
         *
         * Type is also dynamic.
         */
        Category::create([
            'type' => $this->categoryTypeTranslations('name'),

            'value' => $value,

            'created_by' => Auth::id(),
        ]);

        return redirect()
            ->route(
                'role.category.namelist',
                [
                    'rolePrefix' => $rolePrefix,
                ]
            )
            ->with(
                'success',
                'name_created_success'
            );
    }

    /**
     * NAME EDIT
     */
    public function nameEdit(
        $rolePrefix,
        Category $name
    ) {
        if (!$this->isName($name)) {
            abort(404);
        }

        return Inertia::render(
            'Admin/Categories/Names/NameForm',
            [
                'names' => [
                    'id' => $name->id,

                    'value' => $this->getLanguageValues(
                        $name,
                        'value'
                    ),
                ],

                'locale' => $this->resolveLocale(),

                'languages' => Language::query()
                    ->orderBy('id')
                    ->get([
                        'id',
                        'code',
                        'name',
                    ]),
            ]
        );
    }

    /**
     * NAME UPDATE
     */
    public function nameUpdate(
        $rolePrefix,
        Request $request,
        Category $name
    ) {
        if (!$this->isName($name)) {
            abort(404);
        }

        $locales = $this->supportedLocales();

        $locale = $this->resolveLocale(
            $request->input(
                'locale',
                app()->getLocale()
            )
        );

        /**
         * Dynamic validation.
         */
        $rules = [
            'locale' => [
                'nullable',
                'string',
                Rule::in($locales),
            ],
        ];

        foreach ($locales as $language) {
            $rules["value.{$language}"] = [
                'nullable',
                'string',
                'max:255',
            ];
        }

        $validated = $request->validate($rules);

        /**
         * Build dynamic value array.
         */
        $value = [];

        foreach ($locales as $language) {
            $value[$language] = trim(
                $validated['value'][$language] ?? ''
            );
        }

        /**
         * At least one language is required.
         */
        $hasValue = collect($value)
            ->contains(
                fn($item) =>
                is_string($item)
                    && trim($item) !== ''
            );

        if (!$hasValue) {
            return back()
                ->withErrors([
                    "value.{$locale}" => 'name_required',
                ])
                ->withInput();
        }

        /**
         * Update type translations dynamically.
         */
        foreach (
            $this->categoryTypeTranslations('name')
            as $language => $translation
        ) {
            $name->setTranslation(
                'type',
                $language,
                $translation
            );
        }

        /**
         * Update values dynamically.
         */
        foreach ($value as $language => $translation) {
            $name->setTranslation(
                'value',
                $language,
                $translation
            );
        }

        $name->save();

        return redirect()
            ->route(
                'role.category.namelist',
                [
                    'rolePrefix' => $rolePrefix,
                ]
            )
            ->with(
                'success',
                'name_updated_success'
            );
    }

    /**
     * NAME → PADS
     */
    public function namePadsShow(
        $rolePrefix,
        Category $name
    ) {
        $locale = $this->resolveLocale();

        /**
         * Only allow Name category.
         */
        if (!$this->isName($name)) {
            abort(
                404,
                'This category is not a Name.'
            );
        }

        /**
         * Translation helper.
         */
        $t = function (
            $model,
            string $field
        ) use ($locale): string {
            return $this->translatedValue(
                $model,
                $field,
                $locale
            );
        };

        /**
         * Get all Pads related to this Name.
         */
        $pads = $name->pads()
            ->with([
                'categories:id,type,value',
                'recordedVersion',
            ])
            ->latest()
            ->get()
            ->map(
                function ($pad) use ($t) {
                    return [
                        'id' => $pad->id,

                        'title' => $t(
                            $pad,
                            'title'
                        ),

                        'value' => $t(
                            $pad,
                            'value'
                        ),

                        'status' => $pad->status,

                        'establish_date' =>
                        $pad->establish_date
                            ? Carbon::parse(
                                $pad->establish_date
                            )->format('Y-m-d')
                            : null,

                        'created_at' =>
                        optional(
                            $pad->created_at
                        )?->toIso8601String(),

                        'updated_at' =>
                        optional(
                            $pad->updated_at
                        )?->toIso8601String(),

                        'categories' =>
                        $pad->categories
                            ->map(
                                fn($category) => [
                                    'id' =>
                                    $category->id,

                                    'type' =>
                                    $t(
                                        $category,
                                        'type'
                                    ),

                                    'value' =>
                                    $t(
                                        $category,
                                        'value'
                                    ),
                                ]
                            )
                            ->values(),

                        'recorded_version' =>
                        $pad->recordedVersion
                            ? [
                                'id' =>
                                $pad
                                    ->recordedVersion
                                    ->id,

                                'media_type' =>
                                $pad
                                    ->recordedVersion
                                    ->media_type,

                                'file_url' =>
                                $pad
                                    ->recordedVersion
                                    ->file_url,

                                'singer' =>
                                $t(
                                    $pad
                                        ->recordedVersion,
                                    'singer'
                                ),

                                'publisher' =>
                                $t(
                                    $pad
                                        ->recordedVersion,
                                    'publisher'
                                ),

                                'vocalization' =>
                                $t(
                                    $pad
                                        ->recordedVersion,
                                    'vocalization'
                                ),

                                'recording_type' =>
                                $pad
                                    ->recordedVersion
                                    ->recording_type,
                            ]
                            : null,
                    ];
                }
            );

        $namePayload = [
            'id' => $name->id,

            'name' => $t(
                $name,
                'value'
            ),

            'type' => $t(
                $name,
                'type'
            ),
        ];

        return Inertia::render(
            'Admin/Categories/Names/NameShowPads',
            [
                'name' => $namePayload,

                'pads' => $pads,

                'locale' => $locale,

                'languages' => Language::query()
                    ->orderBy('id')
                    ->get([
                        'id',
                        'code',
                        'name',
                    ]),
            ]
        );
    }

    /**
     * NAME DELETE
     */
    public function nameDestroy(
        $rolePrefix,
        Request $request,
        $id
    ) {
        $name = Category::findOrFail($id);

        if (!$this->isName($name)) {
            abort(404);
        }

        $deleteRelatedPads = $request->boolean(
            'delete_related_pads'
        );

        if ($deleteRelatedPads) {
            /**
             * Get only Pads linked to this Name.
             */
            $padIds = $name
                ->pads()
                ->pluck('pads.id');

            if ($padIds->isNotEmpty()) {
                Pad::whereIn(
                    'id',
                    $padIds
                )->delete();
            }
        }

        $name->delete();

        return back()->with(
            'success',
            $deleteRelatedPads
                ? 'name_and_pads_deleted_success'
                : 'name_deleted_success'
        );
    }

    /**
     * BULK DELETE NAMES
     */
    public function bulkDestroy(
        $rolePrefix,
        Request $request
    ) {
        $request->validate([
            'ids' => [
                'required',
                'array',
            ],

            'ids.*' => [
                'integer',
                'exists:categories,id',
            ],
        ]);

        $ids = $request->input('ids', []);

        if (empty($ids)) {
            return back()->with(
                'error',
                'select_at_least_one_name'
            );
        }

        $deletePads = $request->boolean(
            'delete_related_pads'
        );

        /**
         * Only fetch actual Name categories.
         */
        $names = Category::whereIn(
            'id',
            $ids
        )
            ->get()
            ->filter(
                fn($category) =>
                $this->isName($category)
            );

        if ($names->isEmpty()) {
            return back()->with(
                'error',
                'select_at_least_one_name'
            );
        }

        if ($deletePads) {
            /**
             * Collect all related Pad IDs first.
             */
            $padIds = collect();

            foreach ($names as $name) {
                $padIds = $padIds->merge(
                    $name
                        ->pads()
                        ->pluck('pads.id')
                );
            }

            $padIds = $padIds
                ->unique()
                ->values();

            if ($padIds->isNotEmpty()) {
                Pad::whereIn(
                    'id',
                    $padIds
                )->delete();
            }
        }

        /**
         * Delete only actual Name categories.
         */
        Category::whereIn(
            'id',
            $names->pluck('id')
        )->delete();

        return back()->with(
            'success',
            $deletePads
                ? 'names_and_pads_deleted_success'
                : 'names_deleted_success'
        );
    }
}
