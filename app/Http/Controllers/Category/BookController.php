<?php

namespace App\Http\Controllers\Category;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Language;
use App\Models\Pad;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

class BookController extends Controller
{
    /**
     * Get all languages configured in the database.
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
     * Resolve the current locale against languages configured in DB.
     */
    private function resolveLocale(?string $locale = null): string
    {
        $locale = strtolower(trim($locale ?: app()->getLocale()));
        $locales = $this->supportedLocales();

        return in_array($locale, $locales, true)
            ? $locale
            : ($locales[0] ?? 'en');
    }

    /**
     * Get language records for frontend.
     */
    private function getLanguages()
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
     * Read custom translation JSON files.
     *
     * Merges:
     * lang/{locale}/{locale}.json
     * lang/{locale}/messages.json
     */
    private function translationValues(string $locale): array
    {
        $locale = $this->resolveLocale($locale);

        $translations = [];

        $files = [
            base_path("lang/{$locale}/{$locale}.json"),
            base_path("lang/{$locale}/messages.json"),
        ];

        foreach ($files as $file) {
            if (!File::exists($file)) {
                continue;
            }

            $content = File::get($file);
            $json = json_decode($content, true);

            if (is_array($json)) {
                $translations = array_merge(
                    $translations,
                    $json
                );
            }
        }

        return $translations;
    }

    /**
     * Get a translation value from custom JSON files.
     */
    private function translation(string $key, string $locale, string $fallback = ''): string
    {
        $translations = $this->translationValues($locale);

        $value = $translations[$key] ?? null;

        return is_string($value) && trim($value) !== ''
            ? $value
            : $fallback;
    }

    /**
     * Get translated category type.
     *
     * Example:
     * en => Book
     * gu => પુસ્તક
     * hi => पुस्तक
     */
    private function categoryTypeTranslation(
        string $locale,
        string $fallback = 'Book'
    ): string {
        return $this->translation(
            'book',
            $locale,
            $fallback
        );
    }

    /**
     * Get Book translations for every supported language.
     */
    private function categoryTypeTranslations(): array
    {
        $translations = [];

        foreach ($this->supportedLocales() as $locale) {
            $translations[$locale] = $this->categoryTypeTranslation(
                $locale,
                $locale === 'en' ? 'Book' : ''
            );
        }

        return $translations;
    }

    /**
     * Check whether a category is actually a Book.
     */
    private function isBook(Category $category): bool
    {
        $typeTranslations = $this->categoryTypeTranslations();

        foreach ($typeTranslations as $type) {
            if (
                is_string($type) &&
                trim($type) !== '' &&
                $category->getTranslation('type', array_search($type, $typeTranslations, true), false) === $type
            ) {
                return true;
            }
        }

        /*
         * More reliable check:
         * compare the category's type against every supported locale.
         */
        foreach ($this->supportedLocales() as $locale) {
            $storedType = $category->getTranslation(
                'type',
                $locale,
                false
            );

            $bookType = $this->categoryTypeTranslation(
                $locale,
                $locale === 'en' ? 'Book' : ''
            );

            if (
                is_string($storedType) &&
                is_string($bookType) &&
                trim($storedType) !== '' &&
                trim($bookType) !== '' &&
                mb_strtolower(trim($storedType)) === mb_strtolower(trim($bookType))
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Resolve a translated model field.
     *
     * Current locale first, then every configured locale.
     */
    private function translatedValue(
        $model,
        string $field,
        string $locale
    ): string {
        if (!$model) {
            return '';
        }

        $locales = $this->supportedLocales();

        $orderedLocales = array_values(
            array_unique(
                array_merge(
                    [$locale],
                    $locales
                )
            )
        );

        foreach ($orderedLocales as $code) {
            $value = $model->getTranslation(
                $field,
                $code,
                false
            );

            if (
                is_string($value) &&
                trim($value) !== ''
            ) {
                return $value;
            }
        }

        return '';
    }

    /**
     * Resolve a model field for all languages.
     */
    private function getLanguageValues(
        $model,
        string $field
    ): array {
        $values = [];

        foreach ($this->supportedLocales() as $locale) {
            $values[$locale] = $model
                ? ($model->getTranslation(
                    $field,
                    $locale,
                    false
                ) ?: '')
                : '';
        }

        return $values;
    }

    /**
     * Book List
     */
    public function bookList(Request $request)
    {
        $locale = $this->resolveLocale(
            $request->input('locale')
        );

        $search = trim(
            $request->input('search', '')
        );

        $letter = trim(
            $request->input('letter', '')
        );

        $locales = $this->supportedLocales();

        /*
         * Get translated Book type values.
         */
        $bookTypes = [];

        foreach ($locales as $code) {
            $type = $this->categoryTypeTranslation(
                $code,
                $code === 'en' ? 'Book' : ''
            );

            if ($type !== '') {
                $bookTypes[] = mb_strtolower(
                    trim($type)
                );
            }
        }

        /*
         * Find Book categories dynamically.
         */
        $query = Category::query()
            ->where(function ($q) use ($locales, $bookTypes) {
                foreach ($locales as $index => $code) {
                    $typesForLocale = array_filter(
                        $bookTypes,
                        fn($type) => $type !== ''
                    );

                    if (empty($typesForLocale)) {
                        continue;
                    }

                    foreach ($typesForLocale as $type) {
                        $method = ($index === 0)
                            ? 'whereRaw'
                            : 'orWhereRaw';

                        $q->{$method}(
                            "LOWER(JSON_UNQUOTE(JSON_EXTRACT(type, '$.{$code}'))) = ?",
                            [$type]
                        );
                    }
                }
            })
            ->withCount('pads');

        /*
         * Alphabet filter.
         *
         * The alphabet is applied to the currently selected locale.
         */
        if ($letter !== '') {
            $query->where(function ($q) use (
                $locale,
                $letter
            ) {
                $value = mb_strtolower(
                    $letter
                );

                $q->whereRaw(
                    "LOWER(JSON_UNQUOTE(JSON_EXTRACT(value, '$.{$locale}'))) LIKE ?",
                    [$value . '%']
                );
            });
        }

        /*
 * Search.
 */
        if ($search !== '') {
            $searchLike = '%' . $search . '%';

            $query->where(function ($q) use (
                $search,
                $searchLike,
                $locales
            ) {
                /*
         * ID
         */
                if (is_numeric($search)) {
                    $q->where('id', (int) $search)
                        ->orWhere('id', 'like', $searchLike);
                }

                /*
         * Book value + type in every language.
         */
                foreach ($locales as $code) {
                    $q->orWhereRaw(
                        "JSON_UNQUOTE(JSON_EXTRACT(value, '$.{$code}')) LIKE ?",
                        [$searchLike]
                    );

                    $q->orWhereRaw(
                        "JSON_UNQUOTE(JSON_EXTRACT(type, '$.{$code}')) LIKE ?",
                        [$searchLike]
                    );
                }

                /*
         * Related Pads – FIXED
         */
                $q->orWhereHas(
                    'pads',
                    function ($padQuery) use (
                        $searchLike,
                        $locales
                    ) {
                        // Wrap all pad-level conditions so foreign key stays AND
                        $padQuery->where(function ($pq) use ($searchLike, $locales) {
                            /*
                     * Pad title + value.
                     */
                            foreach ($locales as $code) {
                                $pq->orWhereRaw(
                                    "JSON_UNQUOTE(JSON_EXTRACT(title, '$.{$code}')) LIKE ?",
                                    [$searchLike]
                                );

                                $pq->orWhereRaw(
                                    "JSON_UNQUOTE(JSON_EXTRACT(value, '$.{$code}')) LIKE ?",
                                    [$searchLike]
                                );
                            }

                            /*
                     * Normal Pad fields.
                     */
                            $pq->orWhere('status', 'LIKE', $searchLike)
                                ->orWhere('establish_date', 'LIKE', $searchLike);
                        })

                            /*
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
                                                "JSON_UNQUOTE(JSON_EXTRACT(type, '$.{$code}')) LIKE ?",
                                                [$searchLike]
                                            );

                                            $cq->orWhereRaw(
                                                "JSON_UNQUOTE(JSON_EXTRACT(value, '$.{$code}')) LIKE ?",
                                                [$searchLike]
                                            );
                                        }
                                    });
                                }
                            )

                            /*
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
                                                "JSON_UNQUOTE(JSON_EXTRACT(singer, '$.{$code}')) LIKE ?",
                                                [$searchLike]
                                            );

                                            $rq->orWhereRaw(
                                                "JSON_UNQUOTE(JSON_EXTRACT(publisher, '$.{$code}')) LIKE ?",
                                                [$searchLike]
                                            );

                                            $rq->orWhereRaw(
                                                "JSON_UNQUOTE(JSON_EXTRACT(vocalization, '$.{$code}')) LIKE ?",
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
        $books = $query
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render(
            'Admin/Categories/Book/BookList',
            [
                'books' => $books,

                'filters' => [
                    'search' => $search,
                    'letter' => $letter,
                ],

                'locale' => $locale,

                'languages' => $this->getLanguages(),
            ]
        );
    }

    /**
     * Book Form.
     */
    public function bookForm()
    {
        $locale = $this->resolveLocale();

        return Inertia::render(
            'Admin/Categories/Book/BookForm',
            [
                'locale' => $locale,
                'languages' => $this->getLanguages(),
            ]
        );
    }

    /**
     * Store Book.
     */
    public function bookStore(
        $rolePrefix,
        Request $request
    ) {
        $locales = $this->supportedLocales();

        /*
         * Dynamic validation rules.
         */
        $rules = [];

        foreach ($locales as $locale) {
            $rules["value.{$locale}"] = [
                'nullable',
                'string',
                'max:255',
            ];
        }

        $request->validate($rules);

        /*
         * Build multilingual value dynamically.
         */
        $value = [];

        foreach ($locales as $locale) {
            $value[$locale] = trim(
                $request->input(
                    "value.{$locale}",
                    ''
                )
            );
        }

        /*
         * At least one language is required.
         */
        $hasValue = collect($value)
            ->contains(
                fn($item) =>
                is_string($item) &&
                    trim($item) !== ''
            );

        if (!$hasValue) {
            $errorLocale = $this->resolveLocale(
                $request->input('locale')
            );

            return back()
                ->withErrors([
                    "value.{$errorLocale}" => $this->translation(
                        'book_name_required',
                        $errorLocale,
                        'Book name is required.'
                    ),
                ])
                ->withInput();
        }

        /*
         * Dynamic Book type.
         */
        $type = [];

        foreach ($locales as $locale) {
            $type[$locale] = $this->categoryTypeTranslation(
                $locale,
                $locale === 'en' ? 'Book' : ''
            );
        }

        Category::create([
            'type' => $type,
            'value' => $value,
            'created_by' => auth()->id(),
        ]);

        return redirect()
            ->route(
                'role.category.booklist',
                [
                    'rolePrefix' => $rolePrefix,
                ]
            )
            ->with(
                'success',
                'book_created_success'
            );
    }

    /**
     * Edit Book.
     */
    public function bookEdit(
        $rolePrefix,
        Category $book
    ) {
        if (!$this->isBook($book)) {
            abort(404);
        }

        $locale = $this->resolveLocale();

        return Inertia::render(
            'Admin/Categories/Book/BookForm',
            [
                'book' => [
                    'id' => $book->id,

                    'value' => $this->getLanguageValues(
                        $book,
                        'value'
                    ),
                ],

                'locale' => $locale,

                'languages' => $this->getLanguages(),
            ]
        );
    }

    /**
     * Update Book.
     */
    public function bookUpdate(
        $rolePrefix,
        Request $request,
        Category $book
    ) {
        if (!$this->isBook($book)) {
            abort(404);
        }

        $locales = $this->supportedLocales();

        $locale = $this->resolveLocale(
            $request->input('locale')
        );

        /*
         * Dynamic validation.
         */
        $rules = [
            'locale' => [
                'nullable',
                'string',
            ],
        ];

        foreach ($locales as $code) {
            $rules["value.{$code}"] = [
                'nullable',
                'string',
                'max:255',
            ];
        }

        $validated = $request->validate(
            $rules
        );

        /*
         * Build multilingual values.
         */
        $value = [];

        foreach ($locales as $code) {
            $value[$code] = trim(
                $validated['value'][$code] ?? ''
            );
        }

        /*
         * At least one language is required.
         */
        $hasValue = collect($value)
            ->contains(
                fn($item) =>
                is_string($item) &&
                    trim($item) !== ''
            );

        if (!$hasValue) {
            return back()
                ->withErrors([
                    "value.{$locale}" => $this->translation(
                        'book_name_required',
                        $locale,
                        'Book name is required.'
                    ),
                ])
                ->withInput();
        }

        /*
         * Update Book type dynamically.
         */
        foreach ($locales as $code) {
            $book->setTranslation(
                'type',
                $code,
                $this->categoryTypeTranslation(
                    $code,
                    $code === 'en' ? 'Book' : ''
                )
            );
        }

        /*
         * Update value dynamically.
         */
        foreach ($locales as $code) {
            $book->setTranslation(
                'value',
                $code,
                $value[$code]
            );
        }

        $book->save();

        return redirect()
            ->route(
                'role.category.booklist',
                [
                    'rolePrefix' => $rolePrefix,
                ]
            )
            ->with(
                'success',
                'book_updated_success'
            );
    }

    /**
     * Show Pads belonging to a Book.
     */
    public function bookPadsShow(
        $rolePrefix,
        Category $book
    ) {
        if (!$this->isBook($book)) {
            abort(
                404,
                $this->translation(
                    'not_a_book',
                    $this->resolveLocale(),
                    'This category is not a Book.'
                )
            );
        }

        $locale = $this->resolveLocale();

        /*
         * Get Pads linked to this Book.
         */
        $pads = $book
            ->pads()
            ->with([
                'categories:id,type,value',
                'recordedVersion',
            ])
            ->latest()
            ->get()
            ->map(function ($pad) use ($locale) {
                return [
                    'id' => $pad->id,

                    'title' => $this->translatedValue(
                        $pad,
                        'title',
                        $locale
                    ),

                    'value' => $this->translatedValue(
                        $pad,
                        'value',
                        $locale
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

                                'type' => $this->translatedValue(
                                    $category,
                                    'type',
                                    $locale
                                ),

                                'value' => $this->translatedValue(
                                    $category,
                                    'value',
                                    $locale
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

                            'singer' =>
                            $this->translatedValue(
                                $pad->recordedVersion,
                                'singer',
                                $locale
                            ),

                            'publisher' =>
                            $this->translatedValue(
                                $pad->recordedVersion,
                                'publisher',
                                $locale
                            ),

                            'vocalization' =>
                            $this->translatedValue(
                                $pad->recordedVersion,
                                'vocalization',
                                $locale
                            ),

                            'recording_type' =>
                            $pad->recordedVersion->recording_type,
                        ]
                        : null,
                ];
            })
            ->values();

        /*
         * Send the complete multilingual Book object.
         */
        $bookPayload = [
            'id' => $book->id,

            'name' => $this->getLanguageValues(
                $book,
                'value'
            ),

            'type' => $this->getLanguageValues(
                $book,
                'type'
            ),
        ];

        return Inertia::render(
            'Admin/Categories/Book/BookShowPads',
            [
                'book' => $bookPayload,

                'pads' => $pads,

                'locale' => $locale,

                'languages' => $this->getLanguages(),
            ]
        );
    }

    /**
     * Delete single Book.
     */
    public function bookDestroy(
        $rolePrefix,
        Request $request,
        $id
    ) {
        $book = Category::findOrFail($id);

        if (!$this->isBook($book)) {
            abort(404);
        }

        $deleteRelatedPads =
            $request->boolean(
                'delete_related_pads'
            );

        if ($deleteRelatedPads) {
            $padIds = $book
                ->pads()
                ->pluck('pads.id');

            if ($padIds->isNotEmpty()) {
                Pad::whereIn(
                    'id',
                    $padIds
                )->delete();
            }
        }

        $book->delete();

        $message = $deleteRelatedPads
            ? 'book_and_pads_deleted_success'
            : 'book_deleted_success';

        return back()->with(
            'success',
            $message
        );
    }

    /**
     * Bulk delete Books.
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
                'select_at_least_one_book'
            );
        }

        /*
         * IMPORTANT:
         * Only select actual Book categories.
         */
        $books = Category::whereIn(
            'id',
            $ids
        )
            ->get()
            ->filter(
                fn($category) =>
                $this->isBook($category)
            )
            ->values();

        if ($books->isEmpty()) {
            return back()->with(
                'error',
                'select_at_least_one_book'
            );
        }

        $deletePads =
            $request->boolean(
                'delete_related_pads'
            );

        if ($deletePads) {
            foreach ($books as $book) {
                $padIds = $book
                    ->pads()
                    ->pluck('pads.id');

                if ($padIds->isNotEmpty()) {
                    Pad::whereIn(
                        'id',
                        $padIds
                    )->delete();
                }
            }
        }

        /*
         * Delete only the Book IDs.
         */
        Category::whereIn(
            'id',
            $books->pluck('id')
        )->delete();

        $message = $deletePads
            ? 'books_and_pads_deleted_success'
            : 'books_deleted_success';

        return back()->with(
            'success',
            $message
        );
    }
}
