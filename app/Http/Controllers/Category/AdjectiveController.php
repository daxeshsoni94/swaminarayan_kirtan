<?php

namespace App\Http\Controllers\Category;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Language;
use App\Models\Pad;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdjectiveController extends Controller
{
    /**
     * Get all languages currently configured in the database.
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
     * Resolve a valid locale dynamically.
     */
    private function resolveLocale(?string $locale = null): string
    {
        $locales = $this->supportedLocales();

        $locale = $locale ?: app()->getLocale();

        return in_array($locale, $locales, true)
            ? $locale
            : ($locales[0] ?? 'en');
    }

    /**
     * Get language records for frontend.
     */
    private function languages()
    {
        return Language::query()
            ->orderBy('id')
            ->get([
                'id',
                'code',
                'name',
            ]);
    }

    /**
     * Get translation for a multilingual model field.
     *
     * Current locale -> first available language -> empty.
     */
    private function t($model, string $field, string $locale): string
    {
        if (!$model) {
            return '';
        }

        $value = $model->getTranslation($field, $locale, false);

        if (is_string($value) && trim($value) !== '') {
            return $value;
        }

        foreach ($this->supportedLocales() as $code) {
            $fallback = $model->getTranslation($field, $code, false);

            if (
                is_string($fallback) &&
                trim($fallback) !== ''
            ) {
                return $fallback;
            }
        }

        return '';
    }

    /**
     * Get the Adjective type translation for every supported locale.
     *
     * These values MUST match what is stored in the `type` JSON column.
     */
    private function adjectiveTypeTranslations(): array
    {
        $translations = [];

        foreach ($this->supportedLocales() as $locale) {
            $value = __('adjective', [], $locale);

            // If translation is missing, use the correct canonical values
            if (
                !is_string($value) ||
                trim($value) === '' ||
                $value === 'adjective'
            ) {
                $value = match ($locale) {
                    'gu'    => 'વિશેષણ',
                    default => 'Adjective',
                };
            }

            $translations[$locale] = $value;
        }

        return $translations;
    }

    /**
     * Check whether a Category is an Adjective.
     */
    private function isAdjective(Category $category): bool
    {
        $typeTranslations = $this->adjectiveTypeTranslations();

        foreach ($this->supportedLocales() as $locale) {
            $storedType = $category->getTranslation(
                'type',
                $locale,
                false
            );

            $expectedType = $typeTranslations[$locale] ?? null;

            if (
                is_string($storedType) &&
                is_string($expectedType) &&
                mb_strtolower(trim($storedType)) ===
                mb_strtolower(trim($expectedType))
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check whether any language contains a value.
     */
    private function hasAnyValue(array $values): bool
    {
        foreach ($this->supportedLocales() as $locale) {
            if (
                isset($values[$locale]) &&
                is_string($values[$locale]) &&
                trim($values[$locale]) !== ''
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Validate multilingual values dynamically.
     */
    private function validateLanguageValues(
        Request $request,
        string $requiredKey
    ): array {
        $rules = [
            'value' => ['required', 'array'],
        ];

        foreach ($this->supportedLocales() as $locale) {
            $rules["value.$locale"] = [
                'nullable',
                'string',
                'max:255',
            ];
        }

        $validated = $request->validate($rules);

        $values = [];

        foreach ($this->supportedLocales() as $locale) {
            $values[$locale] = trim(
                $validated['value'][$locale] ?? ''
            );
        }

        if (!$this->hasAnyValue($values)) {
            return [
                'error' => $requiredKey,
                'values' => $values,
            ];
        }

        return [
            'error' => null,
            'values' => $values,
        ];
    }

    /**
     * Get all language values from request.
     */
    private function getLanguageValues(Request $request): array
    {
        $values = [];

        foreach ($this->supportedLocales() as $locale) {
            $values[$locale] = trim(
                $request->input("value.$locale", '')
            );
        }

        return $values;
    }

    /**
     * Adjective List.
     */
    public function adjectiveList(Request $request)
    {
        $locale = $this->resolveLocale(
            $request->input('locale', app()->getLocale())
        );

        $search = trim(
            $request->input('search', '')
        );

        $letter = trim(
            $request->input('letter', '')
        );

        $locales = $this->supportedLocales();
        $typeTranslations = $this->adjectiveTypeTranslations();

        /**
         * Find categories whose type is Adjective
         * in ANY configured language.
         */
        $query = Category::query()
            ->where(function ($q) use ($locales, $typeTranslations) {
                foreach ($locales as $index => $code) {
                    $method = $index === 0
                        ? 'whereRaw'
                        : 'orWhereRaw';

                    $expected = mb_strtolower(
                        $typeTranslations[$code] ?? 'adjective'
                    );

                    $q->{$method}(
                        "LOWER(JSON_UNQUOTE(JSON_EXTRACT(type, '$.\"{$code}\"'))) = ?",
                        [$expected]
                    );
                }
            })
            ->withCount('pads');

        /**
         * Alphabet filter.
         *
         * Uses the currently selected locale.
         */
        if ($letter !== '') {
            $query->whereRaw(
                "JSON_UNQUOTE(JSON_EXTRACT(value, '$.\"{$locale}\"')) LIKE ?",
                [$letter . '%']
            );
        }

        /**
         * Search.
         */
        if ($search !== '') {
            $searchLike = '%' . $search . '%';

            $query->where(function ($q) use (
                $search,
                $searchLike,
                $locales
            ) {
                /**
                 * ID search.
                 */
                if (is_numeric($search)) {
                    $q->where('id', $search)
                        ->orWhere('id', 'like', $searchLike);
                }

                /**
                 * Category value + type in every language.
                 */
                foreach ($locales as $code) {
                    $q->orWhereRaw(
                        "JSON_UNQUOTE(JSON_EXTRACT(value, '$.\"{$code}\"')) LIKE ?",
                        [$searchLike]
                    );

                    $q->orWhereRaw(
                        "JSON_UNQUOTE(JSON_EXTRACT(type, '$.\"{$code}\"')) LIKE ?",
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
                        // Wrap so foreign key stays AND
                        $padQuery->where(function ($pq) use ($searchLike, $locales) {
                            foreach ($locales as $code) {
                                $pq->orWhereRaw(
                                    "JSON_UNQUOTE(JSON_EXTRACT(title, '$.\"{$code}\"')) LIKE ?",
                                    [$searchLike]
                                );

                                $pq->orWhereRaw(
                                    "JSON_UNQUOTE(JSON_EXTRACT(value, '$.\"{$code}\"')) LIKE ?",
                                    [$searchLike]
                                );
                            }

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
                                        foreach ($locales as $code) {
                                            $cq->orWhereRaw(
                                                "JSON_UNQUOTE(JSON_EXTRACT(type, '$.\"{$code}\"')) LIKE ?",
                                                [$searchLike]
                                            );

                                            $cq->orWhereRaw(
                                                "JSON_UNQUOTE(JSON_EXTRACT(value, '$.\"{$code}\"')) LIKE ?",
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
                                        foreach ($locales as $code) {
                                            $rq->orWhereRaw(
                                                "JSON_UNQUOTE(JSON_EXTRACT(singer, '$.\"{$code}\"')) LIKE ?",
                                                [$searchLike]
                                            );

                                            $rq->orWhereRaw(
                                                "JSON_UNQUOTE(JSON_EXTRACT(publisher, '$.\"{$code}\"')) LIKE ?",
                                                [$searchLike]
                                            );

                                            $rq->orWhereRaw(
                                                "JSON_UNQUOTE(JSON_EXTRACT(vocalization, '$.\"{$code}\"')) LIKE ?",
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

        $adjectives = $query
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render(
            'Admin/Categories/Adjectives/AdjectivesList',
            [
                'adjectives' => $adjectives,

                'filters' => [
                    'search' => $search,
                    'letter' => $letter,
                ],

                'locale' => $locale,

                'languages' => $this->languages(),
            ]
        );
    }

    /**
     * Adjective Form.
     */
    public function adjectiveForm()
    {
        return Inertia::render(
            'Admin/Categories/Adjectives/AdjectivesForm',
            [
                'locale' => $this->resolveLocale(),

                'languages' => $this->languages(),

                'adjectives' => null,
            ]
        );
    }

    /**
     * Store Adjective.
     */
    public function adjectiveStore(
        $rolePrefix,
        Request $request
    ) {
        $result = $this->validateLanguageValues(
            $request,
            'adjective_name_required'
        );

        if ($result['error']) {
            return back()
                ->withErrors([
                    'value' => $result['error'],
                ])
                ->withInput();
        }

        $values = $result['values'];

        /**
         * Create type translations dynamically.
         */
        $typeTranslations = $this->adjectiveTypeTranslations();

        Category::create([
            'type' => $typeTranslations,
            'value' => $values,
            'created_by' => auth()->id(),
        ]);

        return redirect()
            ->route(
                'role.category.adjectivelist',
                [
                    'rolePrefix' => $rolePrefix,
                ]
            )
            ->with(
                'success',
                'adjective_created_success'
            );
    }

    /**
     * Edit Adjective.
     */
    public function adjectiveEdit(
        $rolePrefix,
        Category $adjective
    ) {
        if (!$this->isAdjective($adjective)) {
            abort(404);
        }

        $values = [];

        foreach ($this->supportedLocales() as $locale) {
            $values[$locale] =
                $adjective->getTranslation(
                    'value',
                    $locale,
                    false
                ) ?: '';
        }

        return Inertia::render(
            'Admin/Categories/Adjectives/AdjectivesForm',
            [
                'adjectives' => [
                    'id' => $adjective->id,
                    'value' => $values,
                ],

                'locale' => $this->resolveLocale(),

                'languages' => $this->languages(),
            ]
        );
    }

    /**
     * Update Adjective.
     */
    public function adjectiveUpdate(
        $rolePrefix,
        Request $request,
        Category $adjective
    ) {
        if (!$this->isAdjective($adjective)) {
            abort(404);
        }

        $result = $this->validateLanguageValues(
            $request,
            'adjective_name_required'
        );

        if ($result['error']) {
            return back()
                ->withErrors([
                    'value' => $result['error'],
                ])
                ->withInput();
        }

        $values = $result['values'];

        /**
         * Keep adjective type translations
         * synchronized with all configured languages.
         */
        $typeTranslations = $this->adjectiveTypeTranslations();

        foreach ($this->supportedLocales() as $locale) {
            $adjective->setTranslation(
                'type',
                $locale,
                $typeTranslations[$locale] ?? 'Adjective'
            );

            $adjective->setTranslation(
                'value',
                $locale,
                $values[$locale] ?? ''
            );
        }

        $adjective->save();

        return redirect()
            ->route(
                'role.category.adjectivelist',
                [
                    'rolePrefix' => $rolePrefix,
                ]
            )
            ->with(
                'success',
                'adjective_updated_success'
            );
    }

    /**
     * Show Pads belonging to an Adjective.
     */
    public function adjectivePadsShow(
        $rolePrefix,
        Category $adjective
    ) {
        $locale = $this->resolveLocale();

        if (!$this->isAdjective($adjective)) {
            abort(404);
        }

        /**
         * Translation helper.
         */
        $t = function (
            $model,
            string $field
        ) use ($locale): string {
            return $this->t(
                $model,
                $field,
                $locale
            );
        };

        /**
         * Get related Pads.
         */
        $pads = $adjective
            ->pads()
            ->with([
                'categories:id,type,value',
                'recordedVersion',
            ])
            ->latest()
            ->get()
            ->map(function ($pad) use ($t) {
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

                    'establish_date' => $pad->establish_date
                        ? Carbon::parse(
                            $pad->establish_date
                        )->format('Y-m-d')
                        : null,

                    'created_at' => optional(
                        $pad->created_at
                    )?->toIso8601String(),

                    'updated_at' => optional(
                        $pad->updated_at
                    )?->toIso8601String(),

                    'categories' => $pad->categories
                        ->map(
                            fn($category) => [
                                'id' => $category->id,

                                'type' => $t(
                                    $category,
                                    'type'
                                ),

                                'value' => $t(
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
                            $pad->recordedVersion->id,

                            'media_type' =>
                            $pad->recordedVersion->media_type,

                            'file_url' =>
                            $pad->recordedVersion->file_url,

                            'singer' => $t(
                                $pad->recordedVersion,
                                'singer'
                            ),

                            'publisher' => $t(
                                $pad->recordedVersion,
                                'publisher'
                            ),

                            'vocalization' => $t(
                                $pad->recordedVersion,
                                'vocalization'
                            ),

                            'recording_type' =>
                            $pad->recordedVersion
                                ->recording_type,
                        ]
                        : null,
                ];
            });

        $adjectivePayload = [
            'id' => $adjective->id,

            'name' => $this->t(
                $adjective,
                'value',
                $locale
            ),

            'type' => $this->t(
                $adjective,
                'type',
                $locale
            ),
        ];

        return Inertia::render(
            'Admin/Categories/Adjectives/AdjectivesShowPads',
            [
                'adjective' => $adjectivePayload,

                'pads' => $pads,

                'locale' => $locale,

                'languages' => $this->languages(),
            ]
        );
    }

    /**
     * Delete single Adjective.
     */
    public function adjectiveDestroy(
        $rolePrefix,
        Request $request,
        $id
    ) {
        $adjective = Category::findOrFail($id);

        if (!$this->isAdjective($adjective)) {
            abort(404);
        }

        $deleteRelatedPads =
            $request->boolean('delete_related_pads');

        if ($deleteRelatedPads) {
            $padIds = $adjective
                ->pads()
                ->pluck('pads.id');

            if ($padIds->isNotEmpty()) {
                Pad::whereIn(
                    'id',
                    $padIds
                )->delete();
            }
        }

        $adjective->delete();

        return back()->with(
            'success',
            $deleteRelatedPads
                ? 'adjective_and_pads_deleted_success'
                : 'adjective_deleted_success'
        );
    }

    /**
     * Bulk Delete Adjectives.
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

        $ids = $request->input(
            'ids',
            []
        );

        if (empty($ids)) {
            return back()->with(
                'error',
                'select_at_least_one_adjective'
            );
        }

        $adjectives = Category::whereIn(
            'id',
            $ids
        )
            ->get()
            ->filter(
                fn($category) =>
                $this->isAdjective($category)
            );

        if ($adjectives->isEmpty()) {
            return back()->with(
                'error',
                'select_at_least_one_adjective'
            );
        }

        $deletePads =
            $request->boolean('delete_related_pads');

        if ($deletePads) {
            $padIds = collect();

            foreach ($adjectives as $adjective) {
                $padIds = $padIds->merge(
                    $adjective
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

        Category::whereIn(
            'id',
            $adjectives->pluck('id')
        )->delete();

        return back()->with(
            'success',
            $deletePads
                ? 'adjectives_and_pads_deleted_success'
                : 'adjectives_deleted_success'
        );
    }
}
