<?php

namespace App\Http\Controllers\Category;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NameController extends Controller
{
    // public function nameList(Request $request)
    // {
    //     // dd('dd');
    //     $search = $request->input('search');

    //     $names = Category::query()
    //         ->where('type->en', 'Name')
    //         ->when($search, function ($query) use ($search) {
    //             $query->where(function ($q) use ($search) {
    //                 $q->where('value->en', 'like', "%{$search}%")
    //                     ->orWhere('value->gu', 'like', "%{$search}%");
    //             });
    //         })
    //         ->withCount('pads')
    //         ->latest()
    //         ->paginate(10)
    //         ->withQueryString();

    //     return Inertia::render('Admin/Categories/Names/NamesList', [
    //         'names' => $names,
    //         'filters' => [
    //             'search' => $search,
    //         ],
    //         'locale' => app()->getLocale(),
    //     ]);
    // }

    public function nameList(Request $request)
    {
        $locale = app()->getLocale();

        if (!in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }

        $search = trim($request->input('search', ''));
        $letter = trim($request->get('letter', ''));

        $query = Category::query()
            ->where(function ($q) {
                // Only Name categories
                $q->whereRaw(
                    "LOWER(JSON_UNQUOTE(JSON_EXTRACT(type, '$.en'))) = ?",
                    ['name']
                )
                    ->orWhereRaw(
                        "JSON_UNQUOTE(JSON_EXTRACT(type, '$.gu')) LIKE ?",
                        ['%નામ%']
                    );
            })
            ->withCount('pads');


        if ($letter !== '') {
            $query->where(function ($q) use ($letter, $locale) {

                if ($locale === 'gu') {
                    $q->whereRaw(
                        "JSON_UNQUOTE(JSON_EXTRACT(value, '$.gu')) LIKE ?",
                        [$letter . '%']
                    );
                } else {
                    $q->whereRaw(
                        "LOWER(JSON_UNQUOTE(JSON_EXTRACT(value, '$.en'))) LIKE ?",
                        [strtolower($letter) . '%']
                    );
                }
            });
        }

        if ($search !== '') {
            $searchLike = '%' . $search . '%';

            $query->where(function ($q) use ($search, $searchLike) {
                if (is_numeric($search)) {
                    $q->orWhere('id', $search);   // exact ID match
                    $q->orWhere('id', 'like', $searchLike);
                }

                /*
             * Name value
             */
                $q->whereRaw(
                    "JSON_UNQUOTE(JSON_EXTRACT(value, '$.en')) LIKE ?",
                    [$searchLike]
                )
                    ->orWhereRaw(
                        "JSON_UNQUOTE(JSON_EXTRACT(value, '$.gu')) LIKE ?",
                        [$searchLike]
                    )

                    /*
             * Name type
             */
                    ->orWhereRaw(
                        "JSON_UNQUOTE(JSON_EXTRACT(type, '$.en')) LIKE ?",
                        [$searchLike]
                    )
                    ->orWhereRaw(
                        "JSON_UNQUOTE(JSON_EXTRACT(type, '$.gu')) LIKE ?",
                        [$searchLike]
                    )

                    /*
             * Related Pads
             */
                    ->orWhereHas('pads', function ($padQuery) use ($searchLike) {

                        /*
                 * Pad title
                 */
                        $padQuery
                            ->whereRaw(
                                "JSON_UNQUOTE(JSON_EXTRACT(title, '$.en')) LIKE ?",
                                [$searchLike]
                            )
                            ->orWhereRaw(
                                "JSON_UNQUOTE(JSON_EXTRACT(title, '$.gu')) LIKE ?",
                                [$searchLike]
                            )

                            /*
                     * Pad lyrics / value
                     */
                            ->orWhereRaw(
                                "JSON_UNQUOTE(JSON_EXTRACT(value, '$.en')) LIKE ?",
                                [$searchLike]
                            )
                            ->orWhereRaw(
                                "JSON_UNQUOTE(JSON_EXTRACT(value, '$.gu')) LIKE ?",
                                [$searchLike]
                            )

                            /*
                     * Pad status
                     */
                            ->orWhere('status', 'LIKE', $searchLike)

                            /*
                     * Establish date
                     */
                            ->orWhere('establish_date', 'LIKE', $searchLike)

                            /*
                     * Pad Categories
                     */
                            ->orWhereHas('categories', function ($categoryQuery) use ($searchLike) {

                                $categoryQuery
                                    ->whereRaw(
                                        "JSON_UNQUOTE(JSON_EXTRACT(type, '$.en')) LIKE ?",
                                        [$searchLike]
                                    )
                                    ->orWhereRaw(
                                        "JSON_UNQUOTE(JSON_EXTRACT(type, '$.gu')) LIKE ?",
                                        [$searchLike]
                                    )
                                    ->orWhereRaw(
                                        "JSON_UNQUOTE(JSON_EXTRACT(value, '$.en')) LIKE ?",
                                        [$searchLike]
                                    )
                                    ->orWhereRaw(
                                        "JSON_UNQUOTE(JSON_EXTRACT(value, '$.gu')) LIKE ?",
                                        [$searchLike]
                                    );
                            })

                            /*
                     * Recorded Version
                     */
                            ->orWhereHas('recordedVersion', function ($recordingQuery) use ($searchLike) {

                                $recordingQuery
                                    ->whereRaw(
                                        "JSON_UNQUOTE(JSON_EXTRACT(singer, '$.en')) LIKE ?",
                                        [$searchLike]
                                    )
                                    ->orWhereRaw(
                                        "JSON_UNQUOTE(JSON_EXTRACT(singer, '$.gu')) LIKE ?",
                                        [$searchLike]
                                    )
                                    ->orWhereRaw(
                                        "JSON_UNQUOTE(JSON_EXTRACT(publisher, '$.en')) LIKE ?",
                                        [$searchLike]
                                    )
                                    ->orWhereRaw(
                                        "JSON_UNQUOTE(JSON_EXTRACT(publisher, '$.gu')) LIKE ?",
                                        [$searchLike]
                                    )
                                    ->orWhereRaw(
                                        "JSON_UNQUOTE(JSON_EXTRACT(vocalization, '$.en')) LIKE ?",
                                        [$searchLike]
                                    )
                                    ->orWhereRaw(
                                        "JSON_UNQUOTE(JSON_EXTRACT(vocalization, '$.gu')) LIKE ?",
                                        [$searchLike]
                                    )
                                    ->orWhere('media_type', 'LIKE', $searchLike)
                                    ->orWhere('recording_type', 'LIKE', $searchLike)
                                    ->orWhere('file_url', 'LIKE', $searchLike);
                            });
                    });
            });
        }

        $names = $query
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Categories/Names/NamesList', [
            'names' => $names,
            'filters' => [
                'search' => $search,
                'letter' => $letter,
            ],
            'locale' => $locale,
        ]);
    }
    public function nameForm()
    {
        return Inertia::render('Admin/Categories/Names/NameForm', [
            'locale' => app()->getLocale(),
        ]);
    }

    // public function showPads(Category $name)
    // {
    //     $name->load(['pads' => function ($q) {
    //         $q->latest();
    //     }]);

    //     return Inertia::render('Admin/Categories/Names/Pads', [
    //         'name' => $name,
    //         'pads'  => $name->pads,
    //     ]);
    // }

    public function nameStore($rolePrefix, Request $request)
    {
        $locale = app()->getLocale();

        if (!in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }

        // dd($request->all());
        $request->validate([
            'value.en' => ['nullable', 'string', 'max:255'],
            'value.gu' => ['nullable', 'string', 'max:255'],
        ]);

        $value = [
            'en' => $request->input('value.en', ''),
            'gu' => $request->input('value.gu', ''),
        ];

        // At least one language is required
        if (empty(trim($value['en'])) && empty(trim($value['gu']))) {
            return back()
                ->withErrors([
                    'value.en' => 'Name name is required.',
                ])
                ->withInput();
        }

        Category::create([
            'type' => [
                'en' => 'Name',
                'gu' => 'પ્રસંગ',
            ],
            'value' => $value,
            'created_by' => Auth::id(),
        ]);

        return redirect()
            ->route('role.category.namelist', [
                'rolePrefix' => $rolePrefix,
            ])
            ->with('success', $locale === 'gu'
                ? 'નામ સફળતાપૂર્વક ઉમેરવામાં આવ્યું.'
                : 'Name created successfully.');
    }



    public function nameEdit($rolePrefix, Category $name)
    {
        // dd($name);
        $typeEn = $name->getTranslation('type', 'en', false);
        if ($typeEn !== 'Name') {
            abort(404);
        }

        return Inertia::render('Admin/Categories/Names/NameForm', [
            'names' => [
                'id'    => $name->id,
                'value' => [
                    'en' => $name->getTranslation('value', 'en', false) ?: '',
                    'gu' => $name->getTranslation('value', 'gu', false) ?: '',
                ],
            ],
        ]);
    }

    public function nameUpdate($rolePrefix, Request $request, Category $name)
    {
        $locale = $request->input('locale', app()->getLocale());
        if (! in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }

        $validated = $request->validate([
            'value.en' => ['nullable', 'string', 'max:255'],
            'value.gu' => ['nullable', 'string', 'max:255'],
            'locale'   => ['nullable', 'string', 'in:en,gu'],
        ]);

        $valueEn = trim($validated['value']['en'] ?? '');
        $valueGu = trim($validated['value']['gu'] ?? '');

        if ($valueEn === '' && $valueGu === '') {
            return back()->withErrors([
                "value.{$locale}" => $locale === 'gu'
                    ? 'પ્રસંગનુ નામ જરૂરી છે.'
                    : 'Name name is required.',
            ])->withInput();
        }

        $name->setTranslation('type', 'en', 'Name');
        $name->setTranslation('type', 'gu', 'પ્રસંગ');
        $name->setTranslation('value', 'en', $valueEn);
        $name->setTranslation('value', 'gu', $valueGu);
        $name->save();

        return redirect()
            ->route('role.category.namelist', [
                'rolePrefix' => $rolePrefix,
            ])
            ->with('success', $locale === 'gu'
                ? 'નામ સફળતાપૂર્વક અપડેટ થયું.'
                : 'Name updated successfully.');
    }


    public function namePadsShow($rolePrefix, Category $name)
    {
        // dd('');
        $locale = app()->getLocale();
        if (! in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }

        // Only allow Creator type categories
        $typeEn = $name->getTranslation('type', 'en', false);
        $typeGu = $name->getTranslation('type', 'gu', false);

        if (
            ! in_array(strtolower($typeEn), ['name']) &&
            ! in_array($typeGu, ['રચયિતા', 'રચયિતા'])
        ) {
            abort(404, 'This category is not a Creator.');
        }

        // Helper to resolve translatable fields
        $t = function ($model, string $field) use ($locale): string {
            if (! $model) {
                return '';
            }

            $value = $model->getTranslation($field, $locale, false)
                ?: $model->getTranslation($field, 'en', false)
                ?: $model->getTranslation($field, 'gu', false);

            return is_string($value) ? $value : '';
        };

        // Get all Pads that have this category
        $pads = $name->pads()                          // ← relation must exist
            ->with([
                'categories:id,type,value',
                'recordedVersion',
            ])
            ->latest()
            ->get()
            ->map(function ($pad) use ($t) {
                return [
                    'id'             => $pad->id,
                    'title'          => $t($pad, 'title'),
                    'value'          => $t($pad, 'value'),
                    'status'         => $pad->status,
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

        $namePayload = [
            'id'    => $name->id,
            'name'  => $t($name, 'value'),   // "Bramhanand swami" / "બ્રહ્માનંદ સ્વામી"
            'type'  => $t($name, 'type'),    // "Creator" / "રચયિતા"
        ];

        return Inertia::render('Admin/Categories/Names/NameShowPads', [
            'swami'  => $namePayload,   // keep key name "swami" for frontend
            'pads'   => $pads,
            'locale' => $locale,
        ]);
    }

    public function nameDestroy($rolePrefix, Request $request, $id)
    {
        $name = Category::findOrFail($id);

        // Make sure this category is actually Name
        $typeEn = $name->getTranslation('type', 'en', false);

        if ($typeEn !== 'Name') {
            abort(404);
        }

        $locale = app()->getLocale();

        $deleteRelatedPads = $request->boolean('delete_related_pads');

        if ($deleteRelatedPads) {

            // Get only pads linked to this Name
            $padIds = $name->pads()->pluck('pads.id');

            // Delete related pads
            if ($padIds->isNotEmpty()) {
                \App\Models\Pad::whereIn('id', $padIds)->delete();
            }
        }

        // Delete Name
        $name->delete();

        $message = $deleteRelatedPads
            ? ($locale === 'gu'
                ? 'નામ અને તેના બધા પદો સફળતાપૂર્વક કાઢી નાખ્યા.'
                : 'Name and its related pads deleted successfully.')
            : ($locale === 'gu'
                ? 'નામ સફળતાપૂર્વક કાઢી નાખ્યું.'
                : 'Name deleted successfully.');

        return back()->with('success', $message);
    }


    public function bulkDestroy($rolePrefix, Request $request)
    {
        $request->validate([
            'ids'   => 'required|array',
            'ids.*' => 'integer|exists:categories,id',
        ]);

        $ids = $request->input('ids', []);
        $deletePads = $request->boolean('delete_related_pads');
        $locale = app()->getLocale();

        if (empty($ids)) {
            return back()->with(
                'error',
                $locale === 'gu'
                    ? 'કોઈ નામ પસંદ કરવામાં આવ્યું નથી.'
                    : 'No names selected.'
            );
        }

        $names = Category::whereIn('id', $ids)->get();

        if ($deletePads) {
            foreach ($names as $name) {

                // Get only pads linked to this Name
                $padIds = $name->pads()->pluck('pads.id');

                // Delete related pads
                if ($padIds->isNotEmpty()) {
                    \App\Models\Pad::whereIn('id', $padIds)->delete();
                }
            }
        }

        // Delete Names
        Category::whereIn('id', $ids)->delete();

        $message = $deletePads
            ? ($locale === 'gu'
                ? 'નામો અને તેમના બધા પદો સફળતાપૂર્વક કાઢી નાખવામાં આવ્યા.'
                : 'Names and their related pads deleted successfully.')
            : ($locale === 'gu'
                ? 'નામો સફળતાપૂર્વક કાઢી નાખવામાં આવ્યા.'
                : 'Names deleted successfully.');

        return back()->with('success', $message);
    }
}
