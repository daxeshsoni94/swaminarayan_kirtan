<?php

namespace App\Http\Controllers\Category;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Pad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CreatorController extends Controller
{

    public function creatorList(Request $request)
    {
        $locale = app()->getLocale();
        if (! in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }

        $search = trim($request->get('search', ''));

        $letter = trim($request->get('letter', ''));


        $query = Category::query()
            ->where(function ($q) {
                // Only Creator type
                $q->where(function ($q2) {
                    $q2->whereRaw("LOWER(JSON_UNQUOTE(JSON_EXTRACT(type, '$.en'))) = 'creator'")
                        ->orWhereRaw("JSON_UNQUOTE(JSON_EXTRACT(type, '$.gu')) IN ('રચયિતા', 'રચયિતા')");
                });
            })
            ->withCount('pads');   // important for the "Total Pads" column

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
             * Creator itself
             */
                // Search in BOTH English and Gujarati values
                $q->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(value, '$.en')) LIKE ?", [$searchLike])
                    ->orWhereRaw("JSON_UNQUOTE(JSON_EXTRACT(value, '$.gu')) LIKE ?", [$searchLike])

                    // Optional: also search type (rarely needed)
                    ->orWhereRaw("JSON_UNQUOTE(JSON_EXTRACT(type, '$.en')) LIKE ?", [$searchLike])
                    ->orWhereRaw("JSON_UNQUOTE(JSON_EXTRACT(type, '$.gu')) LIKE ?", [$searchLike]);


                //   Related Pads

                $q->orWhereHas('pads', function ($padQuery) use ($searchLike) {

                    /*
                 * Pad title + lyrics
                 */
                    $padQuery->whereRaw(
                        "JSON_UNQUOTE(JSON_EXTRACT(title, '$.en')) LIKE ?",
                        [$searchLike]
                    )
                        ->orWhereRaw(
                            "JSON_UNQUOTE(JSON_EXTRACT(title, '$.gu')) LIKE ?",
                            [$searchLike]
                        )
                        ->orWhereRaw(
                            "JSON_UNQUOTE(JSON_EXTRACT(value, '$.en')) LIKE ?",
                            [$searchLike]
                        )
                        ->orWhereRaw(
                            "JSON_UNQUOTE(JSON_EXTRACT(value, '$.gu')) LIKE ?",
                            [$searchLike]
                        )

                        /*
                 * Pad normal fields
                 */
                        ->orWhere('status', 'LIKE', $searchLike)
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
                 * Recording
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

        $creators = $query
            ->latest()
            ->paginate(10)
            ->withQueryString();   // keeps the search param in pagination links


        return Inertia::render('Admin/Categories/Creator/CreatorList', [   // adjust path if needed
            'creators' => $creators,
            'filters'  => [
                'search' => $search,
                'letter' => $letter,
            ],
            'locale'   => $locale,
        ]);
    }

    public function creatorForm()
    {
        return Inertia::render('Admin/Categories/Creator/CreatorForm');
    }

    public function creatorStore($rolePrefix, Request $request)
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

        // At least one language value required
        $valueEn = trim($validated['value']['en'] ?? '');
        $valueGu = trim($validated['value']['gu'] ?? '');

        if ($valueEn === '' && $valueGu === '') {
            return back()->withErrors([
                "value.{$locale}" => $locale === 'gu'
                    ? 'રચયિતાનું નામ જરૂરી છે.'
                    : 'Creator name is required.',
            ])->withInput();
        }

        $category = new Category();
        $category->setTranslation('type', 'en', 'Creator');
        $category->setTranslation('type', 'gu', 'રચયિતા');
        $category->setTranslation('value', 'en', $valueEn);
        $category->setTranslation('value', 'gu', $valueGu);
        $category->created_by = auth()->id();
        $category->save();

        return redirect()
            ->route('role.category.creatorlist', [
                'rolePrefix' => $rolePrefix,
            ])
            ->with(
                'success',
                $locale === 'gu'
                    ? 'રચયિતા સફળતાપૂર્વક ઉમેરાયું.'
                    : 'Creator added successfully.'
            );
    }

    public function creatorEdit($rolePrefix, Category $category)
    {
        // Ensure it is a Creator type
        // dd([
        //     'id' => $category->id,
        //     'raw_type' => $category->getRawOriginal('type'),
        //     'type' => $category->type,
        //     'translation' => $category->getTranslation('type', 'en', false),
        // ]);
        $typeEn = $category->getTranslation('type', 'en', false);

        if ($typeEn !== 'Creator') {
            abort(404);
        }

        return Inertia::render('Admin/Categories/Creator/CreatorForm', [
            'creator' => [
                'id'    => $category->id,
                'value' => [
                    'en' => $category->getTranslation('value', 'en', false) ?: '',
                    'gu' => $category->getTranslation('value', 'gu', false) ?: '',
                ],
            ],
        ]);
    }

    public function creatorUpdate($rolePrefix, Request $request, Category $category)
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
                    ? 'ક્રિએટરનું નામ જરૂરી છે.'
                    : 'Creator name is required.',
            ])->withInput();
        }

        $category->setTranslation('type', 'en', 'Creator');
        $category->setTranslation('type', 'gu', 'રચયિતા');
        $category->setTranslation('value', 'en', $valueEn);
        $category->setTranslation('value', 'gu', $valueGu);
        $category->save();

        return redirect()
            ->route('role.category.creatorlist', [
                'rolePrefix' => $rolePrefix,
            ])
            ->with(
                'success',
                $locale === 'gu'
                    ? 'ક્રિએટર અપડેટ થયું.'
                    : 'Creator updated successfully.'
            );
    }

    public function creatorPadsShow($rolePrefix, Category $category)
    {
        $locale = app()->getLocale();
        if (! in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }

        // Only allow Creator type categories
        $typeEn = $category->getTranslation('type', 'en', false);
        $typeGu = $category->getTranslation('type', 'gu', false);

        if (
            ! in_array(strtolower($typeEn), ['creator']) &&
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
        $pads = $category->pads()                          // ← relation must exist
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

        $creatorPayload = [
            'id'    => $category->id,
            'name'  => $t($category, 'value'),   // "Bramhanand swami" / "બ્રહ્માનંદ સ્વામી"
            'type'  => $t($category, 'type'),    // "Creator" / "રચયિતા"
        ];

        return Inertia::render('Admin/Categories/Creator/CreatorShowPads', [
            'swami'  => $creatorPayload,   // keep key name "swami" for frontend
            'pads'   => $pads,
            'locale' => $locale,
        ]);
    }

    // Single delete
    public function destroy($rolePrefix, Request $request, $id)
    {
        // dd($request->all());
        $creator = Category::findOrFail($id);   // or Creator model

        $deleteRelatedPads = $request->boolean('delete_related_pads');
        $locale = app()->getLocale();

        if ($deleteRelatedPads) {
            // Get only pads linked to this creator
            $padIds = $creator->pads()->pluck('pads.id'); // or ->pluck('pad_id')

            // Delete those pads
            if ($padIds->isNotEmpty()) {
                \App\Models\Pad::whereIn('id', $padIds)->delete();
            }
        }
        $creator->delete();

        $message = $deleteRelatedPads
            ? ($locale === 'gu'
                ? 'રચયિતા અને તેના બધા પદો સફળતાપૂર્વક કાઢી નાખ્યા.'
                : 'Creator and its related pads deleted successfully.')
            : ($locale === 'gu'
                ? 'રચયિતા સફળતાપૂર્વક કાઢી નાખ્યું.'
                : 'Creator deleted successfully.');

        return redirect()
            ->route('role.category.creatorlist', [
                'rolePrefix' => $rolePrefix,
            ])
            ->with('success', $message);
    }



    public function bulkDestroy($rolePrefix, Request $request)
    {
        // dd($request->all());
        $request->validate([
            'ids'   => 'required|array',
            'ids.*' => 'integer|exists:categories,id',  // adjust table
        ]);

        $ids = $request->input('ids', []);
        $deletePads = $request->boolean('delete_related_pads');
        $locale = app()->getLocale();

        if (empty($ids)) {
            $message = $locale === 'gu'
                ? 'કોઈ રચયિતા પસંદ કરેલ નથી.'
                : 'No creators selected.';

            return back()->with('error', $message);
        }

        $creators = Category::whereIn('id', $ids)->get();

        if ($deletePads) {
            foreach ($creators as $creator) {
                $creator->pads()->delete();
            }
        }

        Category::whereIn('id', $ids)->delete();

        $message = $deletePads
            ? ($locale === 'gu'
                ? 'રચયિતા અને તેના બધા પદો સફળતાપૂર્વક કાઢી નાખ્યા.'
                : 'Creators and their related pads deleted successfully.')
            : ($locale === 'gu'
                ? 'રચયિતા સફળતાપૂર્વક કાઢી નાખ્યા.'
                : 'Creators deleted successfully.');

        return back()->with('success', $message);
    }
}
