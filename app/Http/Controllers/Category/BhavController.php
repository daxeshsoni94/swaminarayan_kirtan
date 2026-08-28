<?php

namespace App\Http\Controllers\Category;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BhavController extends Controller
{

    public function bhavList(Request $request)
    {
        $locale = app()->getLocale();

        if (!in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }

        $search = trim($request->input('search', ''));
        $letter = trim($request->get('letter', ''));
        $query = Category::query()
            ->where(function ($q) {
                // Only Bhav categories
                $q->whereRaw(
                    "LOWER(JSON_UNQUOTE(JSON_EXTRACT(type, '$.en'))) = ?",
                    ['bhav']
                )
                    ->orWhereRaw(
                        "JSON_UNQUOTE(JSON_EXTRACT(type, '$.gu')) LIKE ?",
                        ['%ભાવ%']
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
             * Bhav value
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
             * Bhav type
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

        $bhavs = $query
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Categories/Bhav/BhavList', [
            'bhavs' => $bhavs,
            'filters' => [
                'search' => $search,
                'letter' => $letter,
            ],
            'locale' => $locale,
        ]);
    }
    public function bhavForm()
    {
        return Inertia::render('Admin/Categories/Bhav/BhavForm', [
            'locale' => app()->getLocale(),
        ]);
    }

    // public function showPads(Category $bhav)
    // {
    //     $bhav->load(['pads' => function ($q) {
    //         $q->latest();
    //     }]);

    //     return Inertia::render('Admin/Categories/Bhavs/Pads', [
    //         'bhav' => $bhav,
    //         'pads'  => $bhav->pads,
    //     ]);
    // }

    public function bhavStore($rolePrefix, Request $request)
    {
        // dd($request->all());
        $locale = app()->getLocale();
        if (! in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }
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
                    'value.en' => 'Bhav name is required.',
                ])
                ->withInput();
        }

        Category::create([
            'type' => [
                'en' => 'Bhav',
                'gu' => 'ભાવ ',
            ],
            'value' => $value,
            'created_by' => auth()->id(),
        ]);

        return redirect()
            ->route('role.category.bhavlist', [
                'rolePrefix' => $rolePrefix,
            ])
            ->with('success', $locale === 'gu'
                ? 'ભાવ સફળતાપૂર્વક ઉમેરવામાં આવ્યો.'
                : 'Bhav created successfully.');
    }



    public function bhavEdit($rolePrefix, Category $bhav)
    {
        // dd($bhav);
        $typeEn = $bhav->getTranslation('type', 'en', false);
        if ($typeEn !== 'Bhav') {
            abort(404);
        }

        return Inertia::render('Admin/Categories/Bhav/BhavForm', [
            'bhav' => [
                'id'    => $bhav->id,
                'value' => [
                    'en' => $bhav->getTranslation('value', 'en', false) ?: '',
                    'gu' => $bhav->getTranslation('value', 'gu', false) ?: '',
                ],
            ],
        ]);
    }

    public function bhavUpdate($rolePrefix, Request $request, Category $bhav)
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
                    ? 'ભાવ નુ નામ જરૂરી છે.'
                    : 'Bhav name is required.',
            ])->withInput();
        }

        $bhav->setTranslation('type', 'en', 'Bhav');
        $bhav->setTranslation('type', 'gu', 'ભાવ ');
        $bhav->setTranslation('value', 'en', $valueEn);
        $bhav->setTranslation('value', 'gu', $valueGu);
        $bhav->save();

        return redirect()
            ->route('role.category.bhavlist', [
                'rolePrefix' => $rolePrefix,
            ])
            ->with('success', $locale === 'gu'
                ? 'ભાવ અપડેટ થયું.'
                : 'Bhav updated successfully.');
    }


    public function bhavPadsShow($rolePrefix, Category $bhav)
    {
        // dd('');
        $locale = app()->getLocale();
        if (! in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }

        // Only allow Creator type categories
        $typeEn = $bhav->getTranslation('type', 'en', false);
        $typeGu = $bhav->getTranslation('type', 'gu', false);

        if (
            ! in_array(strtolower($typeEn), ['bhav']) &&
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
        $pads = $bhav->pads()                          // ← relation must exist
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

        $bhavPayload = [
            'id'    => $bhav->id,
            'name'  => $t($bhav, 'value'),   // "Bramhanand swami" / "બ્રહ્માનંદ સ્વામી"
            'type'  => $t($bhav, 'type'),    // "Creator" / "રચયિતા"
        ];

        return Inertia::render('Admin/Categories/Bhav/BhavShowPads', [
            'swami'  => $bhavPayload,   // keep key name "swami" for frontend
            'pads'   => $pads,
            'locale' => $locale,
        ]);
    }


    public function bhavDestroy($rolePrefix, Request $request, $id)
    {
        $bhav = Category::findOrFail($id);

        // Make sure this category is actually Bhav
        $typeEn = $bhav->getTranslation('type', 'en', false);

        if ($typeEn !== 'Bhav') {
            abort(404);
        }

        $locale = app()->getLocale();

        $deleteRelatedPads = $request->boolean('delete_related_pads');

        if ($deleteRelatedPads) {

            // Get only pads linked to this Bhav
            $padIds = $bhav->pads()->pluck('pads.id');

            // Delete related pads
            if ($padIds->isNotEmpty()) {
                \App\Models\Pad::whereIn('id', $padIds)->delete();
            }
        }

        // Delete Bhav
        $bhav->delete();

        $message = $deleteRelatedPads
            ? ($locale === 'gu'
                ? 'ભાવ અને તેના બધા પદો સફળતાપૂર્વક કાઢી નાખ્યા.'
                : 'Bhav and its related pads deleted successfully.')
            : ($locale === 'gu'
                ? 'ભાવ સફળતાપૂર્વક કાઢી નાખ્યો.'
                : 'Bhav deleted successfully.');

        return back()->with('success', $message);
    }


    public function bulkDestroy($rolePrefix, Request $request)
    {
        $locale = app()->getLocale();
        if (! in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }
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
                    ? 'કોઈ ભાવ પસંદ કરવામાં આવ્યો નથી.'
                    : 'No Bhavs selected.'
            );
        }

        $bhavs = Category::whereIn('id', $ids)->get();

        if ($deletePads) {
            foreach ($bhavs as $bhav) {

                // Get pads linked to this Bhav
                $padIds = $bhav->pads()->pluck('pads.id');

                // Delete actual pads
                if ($padIds->isNotEmpty()) {
                    \App\Models\Pad::whereIn('id', $padIds)->delete();
                }
            }
        }

        // Delete Bhavs
        Category::whereIn('id', $ids)->delete();

        $message = $deletePads
            ? ($locale === 'gu'
                ? 'ભાવ અને તેમના બધા પદો સફળતાપૂર્વક કાઢી નાખવામાં આવ્યા.'
                : 'Bhavs and their related pads deleted successfully.')
            : ($locale === 'gu'
                ? 'ભાવ સફળતાપૂર્વક કાઢી નાખવામાં આવ્યા.'
                : 'Bhavs deleted successfully.');

        return back()->with('success', $message);
    }
}
