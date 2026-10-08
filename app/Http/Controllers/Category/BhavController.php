<?php

namespace App\Http\Controllers\Category;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Language;
use App\Models\Pad;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class BhavController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Supported Locales
    |--------------------------------------------------------------------------
    */

    private function supportedLocales(): array
    {
        $codes = Language::query()
            ->pluck('code')
            ->filter()
            ->values()
            ->all();

        return !empty($codes)
            ? $codes
            : ['en'];
    }

    /*
    |--------------------------------------------------------------------------
    | Resolve Locale
    |--------------------------------------------------------------------------
    */

    private function resolveLocale(?string $locale = null): string
    {
        $locale = $locale ?: app()->getLocale();

        $locales = $this->supportedLocales();

        return in_array($locale, $locales, true)
            ? $locale
            : ($locales[0] ?? 'en');
    }

    /*
    |--------------------------------------------------------------------------
    | Read Translation JSON Files
    |--------------------------------------------------------------------------
    |
    | Reads:
    | lang/{locale}/{locale}.json
    | lang/{locale}/messages.json
    |
    */

    private function translationValues(string $locale): array
    {
        $values = [];

        $files = [
            base_path("lang/{$locale}/{$locale}.json"),
            base_path("lang/{$locale}/messages.json"),
        ];

        foreach ($files as $file) {
            if (!File::exists($file)) {
                continue;
            }

            $json = json_decode(
                File::get($file),
                true
            );

            if (is_array($json)) {
                $values = array_merge($values, $json);
            }
        }

        return $values;
    }

    /*
    |--------------------------------------------------------------------------
    | Bhav Category Type Translation
    |--------------------------------------------------------------------------
    */

    private function categoryTypeTranslation(
        string $locale
    ): string {
        $translations = $this->translationValues($locale);

        return trim(
            (string) ($translations['bhav'] ?? 'Bhav')
        );
    }

    /*
    |--------------------------------------------------------------------------
    | All Bhav Type Translations
    |--------------------------------------------------------------------------
    */

    private function categoryTypeTranslations(): array
    {
        $types = [];

        foreach ($this->supportedLocales() as $locale) {
            $type = $this->categoryTypeTranslation($locale);

            if ($type !== '') {
                $types[$locale] = $type;
            }
        }

        return $types;
    }

    /*
    |--------------------------------------------------------------------------
    | Check Whether Category Is Bhav
    |--------------------------------------------------------------------------
    */

    private function isBhav(Category $category): bool
    {
        $typeValues = [];

        foreach ($this->supportedLocales() as $locale) {
            $value = $category->getTranslation(
                'type',
                $locale,
                false
            );

            if (is_string($value) && trim($value) !== '') {
                $typeValues[] = mb_strtolower(
                    trim($value)
                );
            }

            $expected = $this->categoryTypeTranslation(
                $locale
            );

            if ($expected !== '') {
                $typeValues[] = mb_strtolower(
                    trim($expected)
                );
            }
        }

        $typeValues = array_unique($typeValues);

        $actualTypes = [];

        foreach ($this->supportedLocales() as $locale) {
            $actual = $category->getTranslation(
                'type',
                $locale,
                false
            );

            if (is_string($actual) && trim($actual) !== '') {
                $actualTypes[] = mb_strtolower(
                    trim($actual)
                );
            }
        }

        return !empty(array_intersect(
            $actualTypes,
            $typeValues
        ));
    }

    /*
    |--------------------------------------------------------------------------
    | Translate Model Field
    |--------------------------------------------------------------------------
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

        if (
            is_string($value) &&
            trim($value) !== ''
        ) {
            return $value;
        }

        foreach ($this->supportedLocales() as $code) {
            $fallback = $model->getTranslation(
                $field,
                $code,
                false
            );

            if (
                is_string($fallback) &&
                trim($fallback) !== ''
            ) {
                return $fallback;
            }
        }

        return '';
    }

    /*
    |--------------------------------------------------------------------------
    | Get Language Values
    |--------------------------------------------------------------------------
    */

    private function getLanguageValues(
        Category $category,
        string $field = 'value'
    ): array {
        $values = [];

        foreach ($this->supportedLocales() as $locale) {
            $values[$locale] = $category->getTranslation(
                $field,
                $locale,
                false
            ) ?: '';
        }

        return $values;
    }

    /*
    |--------------------------------------------------------------------------
    | Bhav List
    |--------------------------------------------------------------------------
    */

    public function bhavList(Request $request)
    {
        $locale = $this->resolveLocale(
            $request->input(
                'locale',
                app()->getLocale()
            )
        );

        $locales = $this->supportedLocales();

        $search = trim(
            $request->input('search', '')
        );

        $letter = trim(
            $request->input('letter', '')
        );

        /*
        |--------------------------------------------------------------------------
        | Base Query
        |--------------------------------------------------------------------------
        */

        $query = Category::query()
            ->where(function ($q) use ($locales) {

                foreach ($locales as $index => $code) {

                    $type = $this->categoryTypeTranslation(
                        $code
                    );

                    if ($type === '') {
                        continue;
                    }

                    $method = $index === 0
                        ? 'whereRaw'
                        : 'orWhereRaw';

                    $q->{$method}(
                        "LOWER(JSON_UNQUOTE(JSON_EXTRACT(type, '$.{$code}'))) = ?",
                        [
                            mb_strtolower(
                                $type
                            ),
                        ]
                    );
                }
            })
            ->withCount('pads');

        /*
        |--------------------------------------------------------------------------
        | Alphabet Filter
        |--------------------------------------------------------------------------
        */

        if ($letter !== '') {

            $query->where(function ($q) use (
                $letter,
                $locales
            ) {

                foreach ($locales as $index => $code) {

                    $method = $index === 0
                        ? 'whereRaw'
                        : 'orWhereRaw';

                    $q->{$method}(
                        "JSON_UNQUOTE(JSON_EXTRACT(value, '$.{$code}')) LIKE ?",
                        [
                            $letter . '%',
                        ]
                    );
                }
            });
        }

        /*
|--------------------------------------------------------------------------
| Search
|--------------------------------------------------------------------------
*/

        if ($search !== '') {

            $searchLike = '%' . $search . '%';

            $query->where(function ($q) use (
                $search,
                $searchLike,
                $locales
            ) {

                /*
        |--------------------------------------------------------------------------
        | ID Search
        |--------------------------------------------------------------------------
        */

                if (is_numeric($search)) {
                    $q->where('id', $search)
                        ->orWhere('id', 'like', $searchLike);
                }

                /*
        |--------------------------------------------------------------------------
        | Bhav Value + Type
        |--------------------------------------------------------------------------
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
        |--------------------------------------------------------------------------
        | Related Pads – FIXED
        |--------------------------------------------------------------------------
        */

                $q->orWhereHas(
                    'pads',
                    function ($padQuery) use (
                        $searchLike,
                        $locales
                    ) {

                        // Wrap pad-level conditions so foreign key stays AND
                        $padQuery->where(function ($pq) use ($searchLike, $locales) {

                            /*
                    |--------------------------------------------------------------------------
                    | Pad Title + Value
                    |--------------------------------------------------------------------------
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
                    |--------------------------------------------------------------------------
                    | Pad Normal Fields
                    |--------------------------------------------------------------------------
                    */

                            $pq->orWhere('status', 'LIKE', $searchLike)
                                ->orWhere('establish_date', 'LIKE', $searchLike);
                        })

                            /*
                |--------------------------------------------------------------------------
                | Pad Categories – FIXED
                |--------------------------------------------------------------------------
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
                |--------------------------------------------------------------------------
                | Recorded Version – FIXED
                |--------------------------------------------------------------------------
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


        /*
        |--------------------------------------------------------------------------
        | Pagination
        |--------------------------------------------------------------------------
        */

        $bhavs = $query
            ->latest()
            ->paginate(10)
            ->withQueryString();

        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'Admin/Categories/Bhav/BhavList',
            [
                'bhavs' => $bhavs,

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

    /*
    |--------------------------------------------------------------------------
    | Bhav Form
    |--------------------------------------------------------------------------
    */

    public function bhavForm()
    {
        $locale = $this->resolveLocale();

        return Inertia::render(
            'Admin/Categories/Bhav/BhavForm',
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

    /*
    |--------------------------------------------------------------------------
    | Store Bhav
    |--------------------------------------------------------------------------
    */

    public function bhavStore(
        $rolePrefix,
        Request $request
    ) {
        $locale = $this->resolveLocale(
            $request->input(
                'locale',
                app()->getLocale()
            )
        );

        $locales = $this->supportedLocales();

        /*
        |--------------------------------------------------------------------------
        | Dynamic Validation
        |--------------------------------------------------------------------------
        */

        $rules = [
            'locale' => [
                'nullable',
                'string',
                Rule::in($locales),
            ],
        ];

        foreach ($locales as $code) {
            $rules["value.{$code}"] = [
                'nullable',
                'string',
                'max:255',
            ];
        }

        $request->validate($rules);

        /*
        |--------------------------------------------------------------------------
        | Build Dynamic Values
        |--------------------------------------------------------------------------
        */

        $value = [];

        foreach ($locales as $code) {
            $value[$code] = trim(
                (string) $request->input(
                    "value.{$code}",
                    ''
                )
            );
        }

        /*
        |--------------------------------------------------------------------------
        | At Least One Language Required
        |--------------------------------------------------------------------------
        */

        $hasValue = collect($value)
            ->contains(
                fn($item) =>
                trim((string) $item) !== ''
            );

        if (!$hasValue) {

            return back()
                ->withErrors([
                    "value.{$locale}" =>
                    'bhav_name_required',
                ])
                ->withInput();
        }

        /*
        |--------------------------------------------------------------------------
        | Dynamic Category Type
        |--------------------------------------------------------------------------
        */

        $type = [];

        foreach ($locales as $code) {
            $type[$code] =
                $this->categoryTypeTranslation(
                    $code
                );
        }

        /*
        |--------------------------------------------------------------------------
        | Create
        |--------------------------------------------------------------------------
        */

        Category::create([
            'type' => $type,
            'value' => $value,
            'created_by' => auth()->id(),
        ]);

        return redirect()
            ->route(
                'role.category.bhavlist',
                [
                    'rolePrefix' => $rolePrefix,
                ]
            )
            ->with(
                'success',
                'bhav_created_success'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Edit Bhav
    |--------------------------------------------------------------------------
    */

    public function bhavEdit(
        $rolePrefix,
        Category $bhav
    ) {
        if (!$this->isBhav($bhav)) {
            abort(404);
        }

        $locale = $this->resolveLocale();

        return Inertia::render(
            'Admin/Categories/Bhav/BhavForm',
            [
                'bhav' => [
                    'id' => $bhav->id,

                    'value' =>
                    $this->getLanguageValues(
                        $bhav,
                        'value'
                    ),
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

    /*
    |--------------------------------------------------------------------------
    | Update Bhav
    |--------------------------------------------------------------------------
    */

    public function bhavUpdate(
        $rolePrefix,
        Request $request,
        Category $bhav
    ) {
        if (!$this->isBhav($bhav)) {
            abort(404);
        }

        $locales = $this->supportedLocales();

        $locale = $this->resolveLocale(
            $request->input(
                'locale',
                app()->getLocale()
            )
        );

        /*
        |--------------------------------------------------------------------------
        | Dynamic Validation
        |--------------------------------------------------------------------------
        */

        $rules = [
            'locale' => [
                'nullable',
                'string',
                Rule::in($locales),
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
        |--------------------------------------------------------------------------
        | Build Values
        |--------------------------------------------------------------------------
        */

        $value = [];

        foreach ($locales as $code) {
            $value[$code] = trim(
                (string) (
                    $validated['value'][$code]
                    ?? ''
                )
            );
        }

        /*
        |--------------------------------------------------------------------------
        | At Least One Language Required
        |--------------------------------------------------------------------------
        */

        $hasValue = collect($value)
            ->contains(
                fn($item) =>
                trim((string) $item) !== ''
            );

        if (!$hasValue) {

            return back()
                ->withErrors([
                    "value.{$locale}" =>
                    'bhav_name_required',
                ])
                ->withInput();
        }

        /*
        |--------------------------------------------------------------------------
        | Update Type For Every Language
        |--------------------------------------------------------------------------
        */

        foreach ($locales as $code) {

            $bhav->setTranslation(
                'type',
                $code,
                $this->categoryTypeTranslation(
                    $code
                )
            );

            $bhav->setTranslation(
                'value',
                $code,
                $value[$code]
            );
        }

        $bhav->save();

        return redirect()
            ->route(
                'role.category.bhavlist',
                [
                    'rolePrefix' => $rolePrefix,
                ]
            )
            ->with(
                'success',
                'bhav_updated_success'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Show Bhav Pads
    |--------------------------------------------------------------------------
    */

    public function bhavPadsShow(
        $rolePrefix,
        Category $bhav
    ) {
        if (!$this->isBhav($bhav)) {
            abort(404);
        }

        $locale = $this->resolveLocale();

        /*
        |--------------------------------------------------------------------------
        | Load Pads
        |--------------------------------------------------------------------------
        */

        $bhav->load([
            'pads' => function ($q) {
                $q->latest();
            },
        ]);

        /*
        |--------------------------------------------------------------------------
        | Translate Helper
        |--------------------------------------------------------------------------
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

        /*
        |--------------------------------------------------------------------------
        | Pads
        |--------------------------------------------------------------------------
        */

        $pads = $bhav->pads()
            ->with([
                'categories:id,type,value',
                'recordedVersion',
            ])
            ->latest()
            ->get()
            ->map(
                function ($pad) use ($t) {

                    return [
                        'id' =>
                        $pad->id,

                        'title' =>
                        $t(
                            $pad,
                            'title'
                        ),

                        'value' =>
                        $t(
                            $pad,
                            'value'
                        ),

                        'status' =>
                        $pad->status,

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
                                $pad->recordedVersion->id,

                                'media_type' =>
                                $pad->recordedVersion->media_type,

                                'file_url' =>
                                $pad->recordedVersion->file_url,

                                'singer' =>
                                $t(
                                    $pad->recordedVersion,
                                    'singer'
                                ),

                                'publisher' =>
                                $t(
                                    $pad->recordedVersion,
                                    'publisher'
                                ),

                                'vocalization' =>
                                $t(
                                    $pad->recordedVersion,
                                    'vocalization'
                                ),

                                'recording_type' =>
                                $pad->recordedVersion->recording_type,
                            ]
                            : null,
                    ];
                }
            );

        /*
        |--------------------------------------------------------------------------
        | Bhav Payload
        |--------------------------------------------------------------------------
        */

        $bhavPayload = [
            'id' =>
            $bhav->id,

            'name' =>
            $t(
                $bhav,
                'value'
            ),

            'type' =>
            $t(
                $bhav,
                'type'
            ),
        ];

        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'Admin/Categories/Bhav/BhavShowPads',
            [
                'bhav' =>
                $bhavPayload,

                'pads' =>
                $pads,

                'locale' =>
                $locale,

                'languages' =>
                Language::query()
                    ->orderBy('id')
                    ->get([
                        'id',
                        'code',
                        'name',
                    ]),
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Destroy Single Bhav
    |--------------------------------------------------------------------------
    */

    public function bhavDestroy(
        $rolePrefix,
        Request $request,
        $id
    ) {
        $bhav = Category::findOrFail($id);

        /*
        |--------------------------------------------------------------------------
        | Make Sure It Is Actually Bhav
        |--------------------------------------------------------------------------
        */
        if (!$this->isBhav($bhav)) {
            abort(404);
        }

        $deleteRelatedPads =
            $request->boolean(
                'delete_related_pads'
            );

        /*
        |--------------------------------------------------------------------------
        | Delete Related Pads
        |--------------------------------------------------------------------------
        */

        if ($deleteRelatedPads) {

            $padIds = $bhav->pads()
                ->pluck('pads.id');

            if ($padIds->isNotEmpty()) {

                Pad::whereIn(
                    'id',
                    $padIds
                )->delete();
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Delete Bhav
        |--------------------------------------------------------------------------
        */

        $bhav->delete();

        return back()->with(
            'success',
            $deleteRelatedPads
                ? 'bhav_and_pads_deleted_success'
                : 'bhav_deleted_success'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Bulk Destroy
    |--------------------------------------------------------------------------
    */

    public function bulkDestroy(
        $rolePrefix,
        Request $request
    ) {
        $locales = $this->supportedLocales();

        /*
        |--------------------------------------------------------------------------
        | Validation
        |--------------------------------------------------------------------------
        */

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

        $deletePads =
            $request->boolean(
                'delete_related_pads'
            );

        if (empty($ids)) {

            return back()->with(
                'error',
                'select_at_least_one_bhav'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Get Only Actual Bhavs
        |--------------------------------------------------------------------------
        */

        $categories = Category::whereIn(
            'id',
            $ids
        )->get();

        $bhavs = $categories
            ->filter(
                fn($category) =>
                $this->isBhav($category)
            )
            ->values();

        if ($bhavs->isEmpty()) {

            return back()->with(
                'error',
                'select_at_least_one_bhav'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Delete Related Pads
        |--------------------------------------------------------------------------
        */

        if ($deletePads) {

            foreach ($bhavs as $bhav) {

                $padIds = $bhav->pads()
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
        |--------------------------------------------------------------------------
        | Delete Only Bhavs
        |--------------------------------------------------------------------------
        */

        Category::whereIn(
            'id',
            $bhavs->pluck('id')
        )->delete();

        /*
        |--------------------------------------------------------------------------
        | Success
        |--------------------------------------------------------------------------
        */

        return back()->with(
            'success',
            $deletePads
                ? 'bhavs_and_pads_deleted_success'
                : 'bhavs_deleted_success'
        );
    }
}
