<?php

namespace App\Http\Controllers\Category;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventController extends Controller
{
    // public function eventList(Request $request)
    // {
    //     $search = $request->input('search');

    //     $events = Category::query()
    //         ->where('type->en', 'Event')
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

    //     return Inertia::render('Admin/Categories/Event/EventList', [
    //         'events' => $events,
    //         'filters' => [
    //             'search' => $search,
    //         ],
    //         'locale' => app()->getLocale(),
    //     ]);
    // }

    public function eventList($rolePrefix, Request $request)
    {
        $locale = app()->getLocale();

        if (!in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }
        $search = trim($request->input('search', ''));
        $letter = trim($request->get('letter', ''));

        $query = Category::query()
            ->where(function ($q) {
                // Only Event categories
                $q->whereRaw(
                    "LOWER(JSON_UNQUOTE(JSON_EXTRACT(type, '$.en'))) = ?",
                    ['event']
                )
                    ->orWhereRaw(
                        "JSON_UNQUOTE(JSON_EXTRACT(type, '$.gu')) LIKE ?",
                        ['%પ્રસંગ%']
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
             * Event value
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
             * Event type
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
                            //    Recorded Version
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

        $events = $query
            ->withCount('pads')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Categories/Event/EventList', [
            'events' => $events,
            'filters' => [
                'search' => $search,
                'letter' => $letter,
            ],
            'locale' => app()->getLocale(),
        ]);
    }

    public function eventForm()
    {
        return Inertia::render('Admin/Categories/Event/EventForm', [
            'locale' => app()->getLocale(),
        ]);
    }

    // public function showPads(Category $event)
    // {
    //     $event->load(['pads' => function ($q) {
    //         $q->latest();
    //     }]);

    //     return Inertia::render('Admin/Categories/Events/Pads', [
    //         'event' => $event,
    //         'pads'  => $event->pads,
    //     ]);
    // }

    public function eventStore($rolePrefix, Request $request)
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
                    'value.en' => 'Event name is required.',
                ])
                ->withInput();
        }

        Category::create([
            'type' => [
                'en' => 'Event',
                'gu' => 'પ્રસંગ',
            ],
            'value' => $value,
            'created_by' => auth()->id(),
        ]);

        return redirect()
            ->route('role.category.eventlist', [
                'rolePrefix' => $rolePrefix,
            ])
            ->with('success', 'Event created successfully.');
    }


    public function eventEdit($rolePrefix, Category $event)
    {
        // dd($event);
        $typeEn = $event->getTranslation('type', 'en', false);
        if ($typeEn !== 'Event') {
            abort(404);
        }

        return Inertia::render('Admin/Categories/Event/EventForm', [
            'event' => [
                'id'    => $event->id,
                'value' => [
                    'en' => $event->getTranslation('value', 'en', false) ?: '',
                    'gu' => $event->getTranslation('value', 'gu', false) ?: '',
                ],
            ],
        ]);
    }

    public function eventUpdate($rolePrefix, Request $request, Category $event)
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
                    : 'Event name is required.',
            ])->withInput();
        }

        $event->setTranslation('type', 'en', 'Event');
        $event->setTranslation('type', 'gu', 'પ્રસંગ');
        $event->setTranslation('value', 'en', $valueEn);
        $event->setTranslation('value', 'gu', $valueGu);
        $event->save();

        return redirect()
            ->route('role.category.creatorlist', [
                'rolePrefix' => $rolePrefix,
            ])
            ->with('success', $locale === 'gu'
                ? 'પ્રસંગ અપડેટ થયું.'
                : 'Event updated successfully.');
    }


    public function eventPadsShow($rolePrefix, Category $event)
    {
        // dd($event);
        $locale = app()->getLocale();
        if (! in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }

        // Only allow Creator type categories
        $typeEn = $event->getTranslation('type', 'en', false);
        $typeGu = $event->getTranslation('type', 'gu', false);

        // dd($typeEn);
        if (
            ! in_array(strtolower($typeEn), ['event']) &&
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
        $pads = $event->pads()                          // ← relation must exist
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
        $eventPayload = [
            'id'    => $event->id,
            'name'  => $t($event, 'value'),   // "Bramhanand swami" / "બ્રહ્માનંદ સ્વામી"
            'type'  => $t($event, 'type'),    // "Creator" / "રચયિતા"
        ];

        return Inertia::render('Admin/Categories/Event/EventShowPads', [
            'swami'  => $eventPayload,   // keep key name "swami" for frontend
            'pads'   => $pads,
            'locale' => $locale,
        ]);
    }


    public function eventDestroy($rolePrefix, Request $request, $id)
    {
        $event = Category::findOrFail($id);

        // Make sure this category is actually Event
        $typeEn = $event->getTranslation('type', 'en', false);

        if ($typeEn !== 'Event') {
            abort(404);
        }

        $locale = app()->getLocale();

        $deleteRelatedPads = $request->boolean('delete_related_pads');

        if ($deleteRelatedPads) {

            // Get only pads linked to this Event
            $padIds = $event->pads()->pluck('pads.id');

            // Delete related pads
            if ($padIds->isNotEmpty()) {
                \App\Models\Pad::whereIn('id', $padIds)->delete();
            }
        }

        // Delete Event
        $event->delete();

        $message = $deleteRelatedPads
            ? ($locale === 'gu'
                ? 'પ્રસંગ અને તેના બધા પદો સફળતાપૂર્વક કાઢી નાખ્યા.'
                : 'Event and its related pads deleted successfully.')
            : ($locale === 'gu'
                ? 'પ્રસંગ સફળતાપૂર્વક કાઢી નાખી.'
                : 'Event deleted successfully.');

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
                    ? 'કોઈ પ્રસંગ પસંદ કરવામાં આવ્યો નથી.'
                    : 'No events selected.'
            );
        }

        $events = Category::whereIn('id', $ids)->get();

        if ($deletePads) {
            foreach ($events as $event) {

                // Get only pads linked to this Event
                $padIds = $event->pads()->pluck('pads.id');

                // Delete related pads
                if ($padIds->isNotEmpty()) {
                    \App\Models\Pad::whereIn('id', $padIds)->delete();
                }
            }
        }

        // Delete Events
        Category::whereIn('id', $ids)->delete();

        $message = $deletePads
            ? ($locale === 'gu'
                ? 'પ્રસંગો અને તેમના બધા પદો સફળતાપૂર્વક કાઢી નાખવામાં આવ્યા.'
                : 'Events and their related pads deleted successfully.')
            : ($locale === 'gu'
                ? 'પ્રસંગો સફળતાપૂર્વક કાઢી નાખવામાં આવ્યા.'
                : 'Events deleted successfully.');

        return back()->with('success', $message);
    }
}
