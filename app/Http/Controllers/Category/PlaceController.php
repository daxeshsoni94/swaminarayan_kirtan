<?php

namespace App\Http\Controllers\Category;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Language;
use App\Models\Pad;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Lang;
use Inertia\Inertia;

class PlaceController extends Controller
{
    /**
     * Get all supported language codes from database.
     */
    private function supportedLocales(): array
    {
        $codes = Language::query()
            ->whereNotNull('code')
            ->pluck('code')
            ->filter()
            ->map(fn ($code) => trim((string) $code))
            ->filter()
            ->values()
            ->all();

        return !empty($codes) ? $codes : ['en'];
    }

    /**
     * Resolve current locale against available languages.
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
     * Get translated value from a translatable model.
     *
     * Current locale -> first available language -> empty string.
     */
    private function t($model, string $field, ?string $locale = null): string
    {
        if (!$model) {
            return '';
        }

        $locale = $this->resolveLocale($locale);

        $value = $model->getTranslation($field, $locale, false);

        if (is_string($value) && trim($value) !== '') {
            return $value;
        }

        foreach ($this->supportedLocales() as $code) {
            $fallback = $model->getTranslation($field, $code, false);

            if (is_string($fallback) && trim($fallback) !== '') {
                return $fallback;
            }
        }

        return '';
    }

    /**
     * Get the translated "Place" type label.
     *
     * This first tries the application's translation files.
     * If the translation key is not available, sensible fallbacks
     * are used for English/Gujarati.
     */
    private function placeTypeTranslation(string $locale): string
    {
        $locale = $this->resolveLocale($locale);

        $translated = Lang::get('place', [], $locale);

        if (
            is_string($translated) &&
            $translated !== 'place' &&
            trim($translated) !== ''
        ) {
            return $translated;
        }

        return match ($locale) {
            'gu' => 'સ્થળ',
            default => 'Place',
        };
    }

    /**
     * Check whether a category is a Place category.
     *
     * The check is performed against all configured languages.
     */
    private function isPlaceType(Category $category): bool
    {
        foreach ($this->supportedLocales() as $locale) {
            $storedType = $category->getTranslation('type', $locale, false);

            if (!is_string($storedType) || trim($storedType) === '') {
                continue;
            }

            $storedType = trim($storedType);

            $expectedType = trim($this->placeTypeTranslation($locale));

            if (
                mb_strtolower($storedType) === mb_strtolower($expectedType)
            ) {
                return true;
            }

            /*
             * Also compare against the English canonical type.
             * This keeps existing records working if their type is
             * stored as "Place".
             */
            if (
                mb_strtolower($storedType) === 'place'
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Build the Place type JSON for all configured languages.
     */
    private function placeTypeTranslations(): array
    {
        $type = [];

        foreach ($this->supportedLocales() as $locale) {
            $type[$locale] = $this->placeTypeTranslation($locale);
        }

        return $type;
    }

    /**
     * Get all language values from a request.
     */
    private function getLanguageValues(Request $request, string $field = 'value'): array
    {
        $values = [];

        foreach ($this->supportedLocales() as $locale) {
            $values[$locale] = trim(
                (string) $request->input("{$field}.{$locale}", '')
            );
        }

        return $values;
    }

    /**
     * Check whether at least one translated value exists.
     */
    private function hasAnyValue(array $values): bool
    {
        foreach ($values as $value) {
            if (trim((string) $value) !== '') {
                return true;
            }
        }

        return false;
    }

    /**
     * Validate all dynamic language fields.
     */
    private function validateLanguageValues(Request $request): void
    {
        $rules = [];

        foreach ($this->supportedLocales() as $locale) {
            $rules["value.{$locale}"] = [
                'nullable',
                'string',
                'max:255',
            ];
        }

        $request->validate($rules);
    }

    /**
     * Return the validation error key according to current locale.
     */
    private function requiredErrorKey(Request $request): string
    {
        $locale = $this->resolveLocale(
            $request->input('locale', app()->getLocale())
        );

        return "value.{$locale}";
    }

    /**
     * PLACE LIST
     */
    public function placeList(Request $request)
    {
        $locale = $this->resolveLocale(
            $request->input('locale', app()->getLocale())
        );

        $search = trim($request->input('search', ''));
        $letter = trim($request->input('letter', ''));

        /*
         * Only Place categories.
         */
        $query = Category::query()
            ->where(function ($q) {
                foreach ($this->supportedLocales() as $locale) {
                    $placeType = $this->placeTypeTranslation($locale);

                    $q->orWhereRaw(
                        "LOWER(JSON_UNQUOTE(JSON_EXTRACT(type, ?))) = ?",
                        [
                            '$.' . $locale,
                            mb_strtolower($placeType),
                        ]
                    );

                    /*
                     * Existing records may contain English "Place".
                     */
                    if ($locale !== 'en') {
                        $q->orWhereRaw(
                            "LOWER(JSON_UNQUOTE(JSON_EXTRACT(type, ?))) = ?",
                            [
                                '$.' . $locale,
                                'place',
                            ]
                        );
                    }
                }
            })
            ->withCount('pads');

        /*
         * Alphabet / letter filter.
         *
         * It uses the currently selected language.
         */
        if ($letter !== '') {
            $query->where(function ($q) use ($letter, $locale) {
                $path = '$.' . $locale;

                $q->whereRaw(
                    "JSON_UNQUOTE(JSON_EXTRACT(value, ?)) LIKE ?",
                    [
                        $path,
                        $letter . '%',
                    ]
                );
            });
        }

        /*
         * Global search.
         *
         * Search through:
         * - ID
         * - Place value in all languages
         * - Place type in all languages
         * - Related pad title/value
         * - Pad status/date
         * - Pad categories
         * - Recorded version
         */
        if ($search !== '') {
            $searchLike = '%' . $search . '%';

            $query->where(function ($q) use ($search, $searchLike) {
                /*
                 * Category ID
                 */
                if (is_numeric($search)) {
                    $q->orWhere('id', $search)
                        ->orWhere('id', 'like', $searchLike);
                }

                /*
                 * Place value + type in every language.
                 */
                foreach ($this->supportedLocales() as $locale) {
                    $valuePath = '$.' . $locale;
                    $typePath = '$.' . $locale;

                    $q->orWhereRaw(
                        "JSON_UNQUOTE(JSON_EXTRACT(value, ?)) LIKE ?",
                        [$valuePath, $searchLike]
                    );

                    $q->orWhereRaw(
                        "JSON_UNQUOTE(JSON_EXTRACT(type, ?)) LIKE ?",
                        [$typePath, $searchLike]
                    );
                }

                /*
                 * Related Pads
                 */
                $q->orWhereHas('pads', function ($padQuery) use ($searchLike) {

                    /*
                     * Pad title + value in all languages.
                     */
                    $padQuery->where(function ($translatedPadQuery) use ($searchLike) {

                        foreach ($this->supportedLocales() as $locale) {
                            $titlePath = '$.' . $locale;
                            $valuePath = '$.' . $locale;

                            $translatedPadQuery
                                ->orWhereRaw(
                                    "JSON_UNQUOTE(JSON_EXTRACT(title, ?)) LIKE ?",
                                    [$titlePath, $searchLike]
                                )
                                ->orWhereRaw(
                                    "JSON_UNQUOTE(JSON_EXTRACT(value, ?)) LIKE ?",
                                    [$valuePath, $searchLike]
                                );
                        }
                    });

                    /*
                     * Pad status / date
                     */
                    $padQuery
                        ->orWhere('status', 'LIKE', $searchLike)
                        ->orWhere('establish_date', 'LIKE', $searchLike);

                    /*
                     * Pad categories.
                     */
                    $padQuery->orWhereHas(
                        'categories',
                        function ($categoryQuery) use ($searchLike) {

                            $categoryQuery->where(function ($translatedCategoryQuery) use ($searchLike) {

                                foreach ($this->supportedLocales() as $locale) {
                                    $typePath = '$.' . $locale;
                                    $valuePath = '$.' . $locale;

                                    $translatedCategoryQuery
                                        ->orWhereRaw(
                                            "JSON_UNQUOTE(JSON_EXTRACT(type, ?)) LIKE ?",
                                            [$typePath, $searchLike]
                                        )
                                        ->orWhereRaw(
                                            "JSON_UNQUOTE(JSON_EXTRACT(value, ?)) LIKE ?",
                                            [$valuePath, $searchLike]
                                        );
                                }
                            });
                        }
                    );

                    /*
                     * Recorded version.
                     */
                    $padQuery->orWhereHas(
                        'recordedVersion',
                        function ($recordingQuery) use ($searchLike) {

                            $recordingQuery->where(function ($translatedRecordingQuery) use ($searchLike) {

                                foreach ($this->supportedLocales() as $locale) {
                                    $singerPath = '$.' . $locale;
                                    $publisherPath = '$.' . $locale;
                                    $vocalizationPath = '$.' . $locale;

                                    $translatedRecordingQuery
                                        ->orWhereRaw(
                                            "JSON_UNQUOTE(JSON_EXTRACT(singer, ?)) LIKE ?",
                                            [$singerPath, $searchLike]
                                        )
                                        ->orWhereRaw(
                                            "JSON_UNQUOTE(JSON_EXTRACT(publisher, ?)) LIKE ?",
                                            [$publisherPath, $searchLike]
                                        )
                                        ->orWhereRaw(
                                            "JSON_UNQUOTE(JSON_EXTRACT(vocalization, ?)) LIKE ?",
                                            [$vocalizationPath, $searchLike]
                                        );
                                }
                            });

                            $recordingQuery
                                ->orWhere('media_type', 'LIKE', $searchLike)
                                ->orWhere('recording_type', 'LIKE', $searchLike)
                                ->orWhere('file_url', 'LIKE', $searchLike);
                        }
                    );
                });
            });
        }

        $places = $query
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Categories/Place/PlaceList', [
            'places' => $places,

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
        ]);
    }

    /**
     * PLACE FORM
     */
    public function placeForm()
    {
        $locale = $this->resolveLocale();

        return Inertia::render('Admin/Categories/Place/PlaceForm', [
            'locale' => $locale,

            'languages' => Language::query()
                ->orderBy('id')
                ->get([
                    'id',
                    'code',
                    'name',
                ]),
        ]);
    }

    /**
     * PLACE STORE
     */
    public function placeStore($rolePrefix, Request $request)
    {
        $this->validateLanguageValues($request);

        $values = $this->getLanguageValues($request);

        /*
         * At least one language is required.
         */
        if (!$this->hasAnyValue($values)) {
            return back()
                ->withErrors([
                    $this->requiredErrorKey($request) =>
                        'place_name_required',
                ])
                ->withInput();
        }

        Category::create([
            'type' => $this->placeTypeTranslations(),
            'value' => $values,
            'created_by' => auth()->id(),
        ]);

        return redirect()
            ->route('role.category.placelist', [
                'rolePrefix' => $rolePrefix,
            ])
            ->with('success', 'place_created_success');
    }

    /**
     * PLACE EDIT
     */
    public function placeEdit($rolePrefix, Category $place)
    {
        if (!$this->isPlaceType($place)) {
            abort(404);
        }

        $value = [];

        foreach ($this->supportedLocales() as $locale) {
            $value[$locale] =
                $place->getTranslation('value', $locale, false) ?: '';
        }

        return Inertia::render('Admin/Categories/Place/PlaceForm', [
            'place' => [
                'id' => $place->id,
                'value' => $value,
            ],

            'locale' => $this->resolveLocale(),

            'languages' => Language::query()
                ->orderBy('id')
                ->get([
                    'id',
                    'code',
                    'name',
                ]),
        ]);
    }

    /**
     * PLACE UPDATE
     */
    public function placeUpdate(
        $rolePrefix,
        Request $request,
        Category $place
    ) {
        if (!$this->isPlaceType($place)) {
            abort(404);
        }

        $this->validateLanguageValues($request);

        $values = $this->getLanguageValues($request);

        /*
         * At least one language is required.
         */
        if (!$this->hasAnyValue($values)) {
            return back()
                ->withErrors([
                    $this->requiredErrorKey($request) =>
                        'place_name_required',
                ])
                ->withInput();
        }

        /*
         * Update Place type for every configured language.
         */
        $place->setTranslations(
            'type',
            $this->placeTypeTranslations()
        );

        /*
         * Update Place values for every configured language.
         */
        $place->setTranslations(
            'value',
            $values
        );

        $place->save();

        return redirect()
            ->route('role.category.placelist', [
                'rolePrefix' => $rolePrefix,
            ])
            ->with('success', 'place_updated_success');
    }

    /**
     * SHOW PLACE PADS
     */
    public function placePadsShow($rolePrefix, Category $place)
    {
        if (!$this->isPlaceType($place)) {
            abort(404, 'This category is not a Place.');
        }

        $locale = $this->resolveLocale();

        /*
         * Translation helper.
         */
        $t = function ($model, string $field) use ($locale): string {
            return $this->t($model, $field, $locale);
        };

        /*
         * Get all Pads linked to this Place.
         */
        $pads = $place->pads()
            ->with([
                'categories:id,type,value',
                'recordedVersion',
            ])
            ->latest()
            ->get()
            ->map(function ($pad) use ($t) {
                return [
                    'id' => $pad->id,

                    'title' => $t($pad, 'title'),

                    'value' => $t($pad, 'value'),

                    'status' => $pad->status,

                    'establish_date' => $pad->establish_date
                        ? Carbon::parse($pad->establish_date)->format('Y-m-d')
                        : null,

                    'created_at' => optional($pad->created_at)?->toIso8601String(),

                    'updated_at' => optional($pad->updated_at)?->toIso8601String(),

                    'categories' => $pad->categories
                        ->map(fn ($category) => [
                            'id' => $category->id,
                            'type' => $t($category, 'type'),
                            'value' => $t($category, 'value'),
                        ])
                        ->values(),

                    'recorded_version' => $pad->recordedVersion
                        ? [
                            'id' => $pad->recordedVersion->id,

                            'media_type' =>
                                $pad->recordedVersion->media_type,

                            'file_url' =>
                                $pad->recordedVersion->file_url,

                            'singer' =>
                                $t($pad->recordedVersion, 'singer'),

                            'publisher' =>
                                $t($pad->recordedVersion, 'publisher'),

                            'vocalization' =>
                                $t($pad->recordedVersion, 'vocalization'),

                            'recording_type' =>
                                $pad->recordedVersion->recording_type,
                        ]
                        : null,
                ];
            });

        $placePayload = [
            'id' => $place->id,

            'name' => $t($place, 'value'),

            'type' => $t($place, 'type'),
        ];

        return Inertia::render(
            'Admin/Categories/Place/PlaceShowPads',
            [
                /*
                 * Keep "place" as the proper frontend key.
                 *
                 * If your existing frontend currently expects "swami",
                 * you can keep "swami" temporarily.
                 */
                'place' => $placePayload,

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
     * DELETE PLACE
     */
    public function placeDestroy(
        $rolePrefix,
        Request $request,
        $id
    ) {
        $place = Category::findOrFail($id);

        if (!$this->isPlaceType($place)) {
            abort(404);
        }

        $deleteRelatedPads =
            $request->boolean('delete_related_pads');

        if ($deleteRelatedPads) {
            $padIds = $place->pads()->pluck('pads.id');

            if ($padIds->isNotEmpty()) {
                Pad::whereIn('id', $padIds)->delete();
            }
        }

        $place->delete();

        return back()->with(
            'success',
            $deleteRelatedPads
                ? 'place_and_pads_deleted_success'
                : 'place_deleted_success'
        );
    }

    /**
     * BULK DELETE PLACES
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
                'select_at_least_one_place'
            );
        }

        /*
         * Only retrieve categories that are actually Places.
         */
        $places = Category::whereIn('id', $ids)
            ->get()
            ->filter(fn ($category) => $this->isPlaceType($category))
            ->values();

        if ($places->isEmpty()) {
            return back()->with(
                'error',
                'select_at_least_one_place'
            );
        }

        $deletePads =
            $request->boolean('delete_related_pads');

        if ($deletePads) {
            foreach ($places as $place) {
                $padIds = $place->pads()->pluck('pads.id');

                if ($padIds->isNotEmpty()) {
                    Pad::whereIn('id', $padIds)->delete();
                }
            }
        }

        Category::whereIn(
            'id',
            $places->pluck('id')
        )->delete();

        return back()->with(
            'success',
            $deletePads
                ? 'places_and_pads_deleted_success'
                : 'places_deleted_success'
        );
    }
}
