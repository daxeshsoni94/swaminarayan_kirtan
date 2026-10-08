<?php

namespace App\Http\Controllers\Category;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Language;
use App\Models\Pad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EventController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Get all supported language codes from languages table.
     *
     * Example:
     * ['en', 'gu', 'hi']
     */
    private function supportedLocales(): array
    {
        $codes = Language::query()
            ->pluck('code')
            ->filter()
            ->values()
            ->all();

        return !empty($codes) ? $codes : ['en', 'gu'];
    }

    /**
     * Resolve current/requested locale safely.
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
     * Get translated value with fallback.
     *
     * Priority:
     * 1. Requested locale
     * 2. Other supported languages
     */
    private function t($model, string $field, string $locale): string
    {
        if (!$model) {
            return '';
        }

        $value = $model->getTranslation($field, $locale, false);

        if (is_string($value) && $value !== '') {
            return $value;
        }

        foreach ($this->supportedLocales() as $code) {
            $fallback = $model->getTranslation($field, $code, false);

            if (is_string($fallback) && $fallback !== '') {
                return $fallback;
            }
        }

        return '';
    }

    /**
     * Canonical database type key.
     *
     * English is always stored as "Event".
     */
    private function eventTypeKey(): string
    {
        return 'Event';
    }

    /**
     * Check whether category is an Event.
     *
     * We use English canonical type so this remains
     * independent from the current UI language.
     */
    private function isEventType(Category $category): bool
    {
        $typeEn = strtolower(
            trim($category->getTranslation('type', 'en', false) ?? '')
        );

        return $typeEn === strtolower($this->eventTypeKey());
    }

    /**
     * Get translated type value for a language.
     *
     * Add more language-specific translations here later
     * if required.
     */
    private function eventTypeTranslation(string $code): string
    {
        return match ($code) {
            'en' => 'Event',
            'gu' => 'પ્રસંગ',
            default => 'Event',
        };
    }

    // ─────────────────────────────────────────────────────────────────────
    // LIST
    // ─────────────────────────────────────────────────────────────────────

    public function eventList(Request $request)
    {
        $locale = $this->resolveLocale();
        $locales = $this->supportedLocales();

        $search = trim((string) $request->get('search', ''));
        $letter = trim((string) $request->get('letter', ''));

        $query = Category::query()
            ->where(function ($q) use ($locales) {

                /*
                 * Match Event type in every supported language.
                 *
                 * English canonical value is always Event.
                 */
                foreach ($locales as $code) {
                    $q->orWhere(
                        "type->{$code}",
                        $this->eventTypeKey()
                    );
                }

                /*
                 * Existing Gujarati records.
                 */
                $q->orWhere(
                    'type->gu',
                    'પ્રસંગ'
                );
            })
            ->withCount('pads');

        // ───────────────────────────────────────────────────────────────
        // LETTER FILTER
        // ───────────────────────────────────────────────────────────────

        if ($letter !== '') {
            $query->where(function ($q) use (
                $letter,
                $locale,
                $locales
            ) {
                // Current language first
                $q->orWhere(
                    "value->{$locale}",
                    'like',
                    $letter . '%'
                );

                // Other supported languages
                foreach ($locales as $code) {
                    if ($code === $locale) {
                        continue;
                    }

                    $q->orWhere(
                        "value->{$code}",
                        'like',
                        $letter . '%'
                    );
                }
            });
        }

        // ───────────────────────────────────────────────────────────────
        // SEARCH
        // ───────────────────────────────────────────────────────────────

        if ($search !== '') {
            $searchLike = '%' . $search . '%';

            $query->where(function ($q) use (
                $search,
                $searchLike,
                $locales
            ) {

                // Search by ID
                if (is_numeric($search)) {
                    $q->where('id', $search)
                        ->orWhere('id', 'like', $searchLike);
                }

                // Event name + event type in every language
                foreach ($locales as $code) {
                    $q->orWhere(
                        "value->{$code}",
                        'like',
                        $searchLike
                    )->orWhere(
                        "type->{$code}",
                        'like',
                        $searchLike
                    );
                }

                // ───────────────────────────────────────────────────────
                // RELATED PADS – FIXED
                // ───────────────────────────────────────────────────────

                $q->orWhereHas('pads', function ($padQuery) use (
                    $searchLike,
                    $locales
                ) {

                    // Wrap pad-level conditions so foreign key stays AND
                    $padQuery->where(function ($pq) use ($searchLike, $locales) {

                        // Pad title + value
                        foreach ($locales as $code) {
                            $pq->orWhere(
                                "title->{$code}",
                                'like',
                                $searchLike
                            )->orWhere(
                                "value->{$code}",
                                'like',
                                $searchLike
                            );
                        }

                        // Pad status + establish date
                        $pq->orWhere('status', 'like', $searchLike)
                            ->orWhere('establish_date', 'like', $searchLike);
                    })

                        // Pad categories – FIXED
                        ->orWhereHas(
                            'categories',
                            function ($categoryQuery) use (
                                $searchLike,
                                $locales
                            ) {
                                $categoryQuery->where(function ($cq) use ($searchLike, $locales) {
                                    foreach ($locales as $code) {
                                        $cq->orWhere(
                                            "type->{$code}",
                                            'like',
                                            $searchLike
                                        )->orWhere(
                                            "value->{$code}",
                                            'like',
                                            $searchLike
                                        );
                                    }
                                });
                            }
                        )

                        // Recorded version – FIXED
                        ->orWhereHas(
                            'recordedVersion',
                            function ($recordingQuery) use (
                                $searchLike,
                                $locales
                            ) {
                                $recordingQuery->where(function ($rq) use ($searchLike, $locales) {
                                    foreach ($locales as $code) {
                                        $rq->orWhere(
                                            "singer->{$code}",
                                            'like',
                                            $searchLike
                                        )->orWhere(
                                            "publisher->{$code}",
                                            'like',
                                            $searchLike
                                        )->orWhere(
                                            "vocalization->{$code}",
                                            'like',
                                            $searchLike
                                        );
                                    }

                                    $rq->orWhere('media_type', 'like', $searchLike)
                                        ->orWhere('recording_type', 'like', $searchLike)
                                        ->orWhere('file_url', 'like', $searchLike);
                                });
                            }
                        );
                });
            });
        }
        // ───────────────────────────────────────────────────────────────
        // PAGINATION + LOCALIZED RESPONSE
        // ───────────────────────────────────────────────────────────────

        $events = $query
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(function ($category) use ($locale) {
                return [
                    'id' => $category->id,

                    'type' => $this->t(
                        $category,
                        'type',
                        $locale
                    ),

                    'value' => $this->t(
                        $category,
                        'value',
                        $locale
                    ),

                    // Keep complete translations for frontend if needed
                    'value_map' => $category->getTranslations('value'),

                    'pads_count' => $category->pads_count,

                    'created_at' => optional(
                        $category->created_at
                    )?->toIso8601String(),
                ];
            });

        return Inertia::render(
            'Admin/Categories/Event/EventList',
            [
                'events' => $events,

                'filters' => [
                    'search' => $search,
                    'letter' => $letter,
                ],

                'locale' => $locale,
            ]
        );
    }

    // ─────────────────────────────────────────────────────────────────────
    // CREATE FORM
    // ─────────────────────────────────────────────────────────────────────

    public function eventForm()
    {
        return Inertia::render(
            'Admin/Categories/Event/EventForm',
            [
                'languages' => Language::orderBy('id')
                    ->get(['id', 'code', 'name']),
            ]
        );
    }

    // ─────────────────────────────────────────────────────────────────────
    // STORE
    // ─────────────────────────────────────────────────────────────────────

    public function eventStore($rolePrefix, Request $request)
    {
        $locale = $this->resolveLocale(
            $request->input('locale')
        );

        $locales = $this->supportedLocales();

        // Dynamic validation
        $rules = [
            'locale' => 'nullable|string',
        ];

        foreach ($locales as $code) {
            $rules["value.{$code}"] = 'nullable|string|max:255';
        }

        $validated = $request->validate($rules);

        // At least one language is required
        $hasValue = false;

        foreach ($locales as $code) {
            if (
                trim(
                    $validated['value'][$code] ?? ''
                ) !== ''
            ) {
                $hasValue = true;
                break;
            }
        }

        if (!$hasValue) {
            return back()
                ->withErrors([
                    "value.{$locale}" => 'event_name_required',
                ])
                ->withInput();
        }

        $event = new Category();

        $event->created_by = Auth::id();

        // Canonical Event type
        $event->setTranslation(
            'type',
            'en',
            $this->eventTypeKey()
        );

        // Set Event translation for every supported language
        foreach ($locales as $code) {
            if ($code === 'en') {
                continue;
            }

            $event->setTranslation(
                'type',
                $code,
                $this->eventTypeTranslation($code)
            );
        }

        // Set submitted values
        foreach ($locales as $code) {
            $text = trim(
                $validated['value'][$code] ?? ''
            );

            if ($text !== '') {
                $event->setTranslation(
                    'value',
                    $code,
                    $text
                );
            }
        }

        $event->save();

        return redirect()
            ->route(
                'role.category.eventlist',
                [
                    'rolePrefix' => $rolePrefix,
                ]
            )
            ->with(
                'success',
                'event_created_success'
            );
    }

    // ─────────────────────────────────────────────────────────────────────
    // EDIT FORM
    // ─────────────────────────────────────────────────────────────────────

    public function eventEdit(
        $rolePrefix,
        Category $event
    ) {
        if (!$this->isEventType($event)) {
            abort(404);
        }

        $locales = $this->supportedLocales();

        $valueMap = [];

        foreach ($locales as $code) {
            $valueMap[$code] = $event->getTranslation(
                'value',
                $code,
                false
            ) ?: '';
        }

        return Inertia::render(
            'Admin/Categories/Event/EventForm',
            [
                'event' => [
                    'id' => $event->id,
                    'value' => $valueMap,
                ],

                'languages' => Language::orderBy('id')
                    ->get(['id', 'code', 'name']),
            ]
        );
    }

    // ─────────────────────────────────────────────────────────────────────
    // UPDATE
    // ─────────────────────────────────────────────────────────────────────

    public function eventUpdate(
        $rolePrefix,
        Request $request,
        Category $event
    ) {
        if (!$this->isEventType($event)) {
            abort(404);
        }

        $locale = $this->resolveLocale(
            $request->input('locale')
        );

        $locales = $this->supportedLocales();

        // Dynamic validation
        $rules = [
            'locale' => 'nullable|string',
        ];

        foreach ($locales as $code) {
            $rules["value.{$code}"] = 'nullable|string|max:255';
        }

        $validated = $request->validate($rules);

        // At least one language must contain value
        $hasValue = false;

        foreach ($locales as $code) {
            if (
                trim(
                    $validated['value'][$code] ?? ''
                ) !== ''
            ) {
                $hasValue = true;
                break;
            }
        }

        if (!$hasValue) {
            return back()
                ->withErrors([
                    "value.{$locale}" =>
                    'event_name_required',
                ])
                ->withInput();
        }

        // Keep canonical Event type
        $event->setTranslation(
            'type',
            'en',
            $this->eventTypeKey()
        );

        // Keep Event type translations dynamic
        foreach ($locales as $code) {
            if ($code === 'en') {
                continue;
            }

            $event->setTranslation(
                'type',
                $code,
                $this->eventTypeTranslation($code)
            );
        }

        // Update values
        foreach ($locales as $code) {
            $text = trim(
                $validated['value'][$code] ?? ''
            );

            if ($text !== '') {
                $event->setTranslation(
                    'value',
                    $code,
                    $text
                );
            }
        }

        $event->save();

        return redirect()
            ->route(
                'role.category.eventlist',
                [
                    'rolePrefix' => $rolePrefix,
                ]
            )
            ->with(
                'success',
                'event_updated_success'
            );
    }

    // ─────────────────────────────────────────────────────────────────────
    // SHOW PADS
    // ─────────────────────────────────────────────────────────────────────

    public function eventPadsShow(
        $rolePrefix,
        Category $event
    ) {
        if (!$this->isEventType($event)) {
            abort(
                404,
                'This category is not an Event.'
            );
        }

        $locale = $this->resolveLocale();

        $pads = $event->pads()
            ->with([
                'categories:id,type,value',
                'recordedVersion',
            ])
            ->latest()
            ->get()
            ->map(function ($pad) use ($locale) {

                return [
                    'id' => $pad->id,

                    'title' => $this->t(
                        $pad,
                        'title',
                        $locale
                    ),

                    'value' => $this->t(
                        $pad,
                        'value',
                        $locale
                    ),

                    'status' => $pad->status,

                    'establish_date' =>
                    $pad->establish_date
                        ? \Carbon\Carbon::parse(
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
                        ->map(function ($category) use (
                            $locale
                        ) {
                            return [
                                'id' => $category->id,

                                'type' => $this->t(
                                    $category,
                                    'type',
                                    $locale
                                ),

                                'value' => $this->t(
                                    $category,
                                    'value',
                                    $locale
                                ),
                            ];
                        })
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

                            'singer' => $this->t(
                                $pad->recordedVersion,
                                'singer',
                                $locale
                            ),

                            'publisher' => $this->t(
                                $pad->recordedVersion,
                                'publisher',
                                $locale
                            ),

                            'vocalization' => $this->t(
                                $pad->recordedVersion,
                                'vocalization',
                                $locale
                            ),

                            'recording_type' =>
                            $pad->recordedVersion
                                ->recording_type,
                        ]
                        : null,
                ];
            });

        return Inertia::render(
            'Admin/Categories/Event/EventShowPads',
            [
                'swami' => [
                    'id' => $event->id,

                    'name' => $this->t(
                        $event,
                        'value',
                        $locale
                    ),

                    'type' => $this->t(
                        $event,
                        'type',
                        $locale
                    ),
                ],

                'pads' => $pads,

                'locale' => $locale,
            ]
        );
    }

    // ─────────────────────────────────────────────────────────────────────
    // DESTROY
    // ─────────────────────────────────────────────────────────────────────

    public function eventDestroy(
        $rolePrefix,
        Request $request,
        $id
    ) {
        $event = Category::findOrFail($id);

        if (!$this->isEventType($event)) {
            abort(404);
        }

        $deleteRelatedPads =
            $request->boolean('delete_related_pads');

        if ($deleteRelatedPads) {

            $padIds = $event->pads()
                ->pluck('pads.id');

            if ($padIds->isNotEmpty()) {
                Pad::whereIn(
                    'id',
                    $padIds
                )->delete();
            }
        }

        $event->delete();

        return redirect()
            ->route(
                'role.category.eventlist',
                [
                    'rolePrefix' => $rolePrefix,
                ]
            )
            ->with(
                'success',
                $deleteRelatedPads
                    ? 'event_and_pads_deleted_success'
                    : 'event_deleted_success'
            );
    }

    // ─────────────────────────────────────────────────────────────────────
    // BULK DESTROY
    // ─────────────────────────────────────────────────────────────────────

    public function bulkDestroy(
        $rolePrefix,
        Request $request
    ) {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' =>
            'integer|exists:categories,id',
        ]);

        $ids = $request->input('ids', []);

        $deletePads =
            $request->boolean('delete_related_pads');

        if (empty($ids)) {
            return back()->with(
                'error',
                'select_at_least_one'
            );
        }

        $events = Category::whereIn(
            'id',
            $ids
        )->get();

        foreach ($events as $event) {

            // Only process Event categories
            if (!$this->isEventType($event)) {
                continue;
            }

            if ($deletePads) {

                $padIds = $event->pads()
                    ->pluck('pads.id');

                if ($padIds->isNotEmpty()) {
                    Pad::whereIn(
                        'id',
                        $padIds
                    )->delete();
                }
            }
        }

        // Delete only Event categories
        foreach ($events as $event) {
            if ($this->isEventType($event)) {
                $event->delete();
            }
        }

        return back()->with(
            'success',
            $deletePads
                ? 'events_and_pads_deleted_success'
                : 'events_deleted_success'
        );
    }
}
