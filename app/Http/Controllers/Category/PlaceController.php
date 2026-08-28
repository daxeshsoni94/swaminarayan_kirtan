<?php

namespace App\Http\Controllers\Category;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlaceController extends Controller
{
    // public function placeList(Request $request)
    // {
    //     $locale = app()->getLocale();

    //     if (!in_array($locale, ['en', 'gu'], true)) {
    //         $locale = 'en';
    //     }
    //     $search = trim($request->input('search', ''));

    //     $places = Category::query()
    //         ->where('type->en', 'Place')
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

    //     return Inertia::render('Admin/Categories/Place/PlaceList', [
    //         'places' => $places,
    //         'filters' => [
    //             'search' => $search,
    //         ],
    //         'locale' => app()->getLocale(),
    //     ]);
    // }

    public function placeList(Request $request)
    {
        $locale = app()->getLocale();

        if (!in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }

        $search = trim($request->input('search', ''));
        $letter = trim($request->get('letter', ''));

        $query = Category::query()
            ->where(function ($q) {
                // Only Place categories
                $q->whereRaw(
                    "LOWER(JSON_UNQUOTE(JSON_EXTRACT(type, '$.en'))) = ?",
                    ['place']
                )
                    ->orWhereRaw(
                        "JSON_UNQUOTE(JSON_EXTRACT(type, '$.gu')) LIKE ?",
                        ['%સ્થળ%']
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
             * Place value
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
             * Place type
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
        ]);
    }
    public function placeForm()
    {
        return Inertia::render('Admin/Categories/Place/PlaceForm', [
            'locale' => app()->getLocale(),
        ]);
    }

    public function placeStore($rolePrefix, Request $request)
    {
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
                    'value.en' => 'Place name is required.',
                ])
                ->withInput();
        }

        Category::create([
            'type' => [
                'en' => 'Place',
                'gu' => 'પ્રસંગ',
            ],
            'value' => $value,
            'created_by' => auth()->id(),
        ]);

        return redirect()
            ->route('role.category.placelist', [
                'rolePrefix' => $rolePrefix,
            ])
            ->with('success', 'Place created successfully.');
    }



    public function placeEdit($rolePrefix,Category $place)
    {
        // dd($place);
        $typeEn = $place->getTranslation('type', 'en', false);
        if ($typeEn !== 'Place') {
            abort(404);
        }

        return Inertia::render('Admin/Categories/Place/PlaceForm', [
            'place' => [
                'id'    => $place->id,
                'value' => [
                    'en' => $place->getTranslation('value', 'en', false) ?: '',
                    'gu' => $place->getTranslation('value', 'gu', false) ?: '',
                ],
            ],
        ]);
    }

    public function placeUpdate($rolePrefix, Request $request, Category $place)
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
                    : 'Place name is required.',
            ])->withInput();
        }

        $place->setTranslation('type', 'en', 'Place');
        $place->setTranslation('type', 'gu', 'પ્રસંગ');
        $place->setTranslation('value', 'en', $valueEn);
        $place->setTranslation('value', 'gu', $valueGu);
        $place->save();

        return redirect()
            ->route('role.category.placelist', [
                'rolePrefix' => $rolePrefix,
            ])
            ->with('success', $locale === 'gu'
                ? 'પ્રસંગ અપડેટ થયું.'
                : 'Place updated successfully.');
    }


    public function placePadsShow($rolePrefix, Category $place)
    {
        // dd('');
        $locale = app()->getLocale();
        if (! in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }

        // Only allow Creator type categories
        $typeEn = $place->getTranslation('type', 'en', false);
        $typeGu = $place->getTranslation('type', 'gu', false);


        // dd($typeEn);
        if (
            ! in_array(strtolower($typeEn), ['place']) &&
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
        $pads = $place->pads()                          // ← relation must exist
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

        $placePayload = [
            'id'    => $place->id,
            'name'  => $t($place, 'value'),   // "Bramhanand swami" / "બ્રહ્માનંદ સ્વામી"
            'type'  => $t($place, 'type'),    // "Creator" / "રચયિતા"
        ];

        return Inertia::render('Admin/Categories/Place/PlaceShowPads', [
            'swami'  => $placePayload,   // keep key name "swami" for frontend
            'pads'   => $pads,
            'locale' => $locale,
        ]);
    }


    public function placeDestroy($rolePrefix, Request $request, $id)
    {
        $place = Category::findOrFail($id);

        // Make sure this category is actually Place
        $typeEn = $place->getTranslation('type', 'en', false);

        if ($typeEn !== 'Place') {
            abort(404);
        }

        $locale = app()->getLocale();

        $deleteRelatedPads = $request->boolean('delete_related_pads');

        if ($deleteRelatedPads) {

            // Get only pads linked to this Place
            $padIds = $place->pads()->pluck('pads.id');

            // Delete related pads
            if ($padIds->isNotEmpty()) {
                \App\Models\Pad::whereIn('id', $padIds)->delete();
            }
        }

        // Delete Place
        $place->delete();

        $message = $deleteRelatedPads
            ? ($locale === 'gu'
                ? 'સ્થળ અને તેના બધા પદો સફળતાપૂર્વક કાઢી નાખ્યા.'
                : 'Place and its related pads deleted successfully.')
            : ($locale === 'gu'
                ? 'સ્થળ સફળતાપૂર્વક કાઢી નાખ્યું.'
                : 'Place deleted successfully.');

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
                    ? 'કોઈ સ્થળ પસંદ કરવામાં આવ્યું નથી.'
                    : 'No places selected.'
            );
        }

        $places = Category::whereIn('id', $ids)->get();

        if ($deletePads) {
            foreach ($places as $place) {

                // Get only pads linked to this Place
                $padIds = $place->pads()->pluck('pads.id');

                // Delete related pads
                if ($padIds->isNotEmpty()) {
                    \App\Models\Pad::whereIn('id', $padIds)->delete();
                }
            }
        }

        // Delete Places
        Category::whereIn('id', $ids)->delete();

        $message = $deletePads
            ? ($locale === 'gu'
                ? 'સ્થળો અને તેમના બધા પદો સફળતાપૂર્વક કાઢી નાખવામાં આવ્યા.'
                : 'Places and their related pads deleted successfully.')
            : ($locale === 'gu'
                ? 'સ્થળો સફળતાપૂર્વક કાઢી નાખવામાં આવ્યા.'
                : 'Places deleted successfully.');

        return back()->with('success', $message);
    }
}
