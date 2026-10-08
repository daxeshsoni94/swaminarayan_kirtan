<?php

namespace App\Http\Controllers;

use App\Models\Contact_submissions;
use App\Models\Language;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactController extends Controller
{
    /**
     * Get all supported language codes from database.
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
     * Resolve current locale dynamically.
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
     * Contact list.
     */
    public function index(Request $request)
    {
        return $this->list($request);
    }

    /**
     * New contacts.
     */
    public function new(Request $request)
    {
        return $this->list($request, 'new');
    }

    /**
     * Read contacts.
     */
    public function read(Request $request)
    {
        return $this->list($request, 'read');
    }

    /**
     * Resolved contacts.
     */
    public function resolved(Request $request)
    {
        return $this->list($request, 'resolved');
    }

    /**
     * Contact listing.
     */
    public function list(
        Request $request,
        ?string $status = null
    ) {
        $query = Contact_submissions::with('user')->latest();

        /*
        |--------------------------------------------------------------------------
        | Status filter
        |--------------------------------------------------------------------------
        */
        if ($status) {
            $query->where('status', $status);
        }

        /*
        |--------------------------------------------------------------------------
        | Search
        |--------------------------------------------------------------------------
        */
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere(
                        'reason_for_contact',
                        'like',
                        "%{$search}%"
                    );
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Pagination
        |--------------------------------------------------------------------------
        */
        $contacts = $query
            ->paginate(10)
            ->withQueryString();

        /*
        |--------------------------------------------------------------------------
        | Inertia response
        |--------------------------------------------------------------------------
        */
        return Inertia::render('Admin/Contacts/List', [
            'contacts' => $contacts,

            'filters' => [
                'search' => $request->input('search'),
                'status' => $status,
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
     * Show contact details.
     */
    public function show(
        $rolePrefix,
        Contact_submissions $contact
    ) {
        $contact->load('user');

        /*
        |--------------------------------------------------------------------------
        | Automatically mark new contact as read
        |--------------------------------------------------------------------------
        */
        if ($contact->status === 'new') {
            $contact->update([
                'status' => 'read',
            ]);
        }

        return Inertia::render('Contacts/Show', [
            'contact' => $contact->fresh('user'),

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
     * Update contact status.
     */
    public function updateStatus(
        $rolePrefix,
        Request $request,
        Contact_submissions $contact
    ) {
        $request->validate([
            'status' => 'required|in:new,read,resolved',
        ]);

        $contact->update([
            'status' => $request->status,
        ]);

        /*
        |--------------------------------------------------------------------------
        | Return translation key.
        |
        | Layout.tsx will translate this key according to current locale.
        |--------------------------------------------------------------------------
        */
        return redirect()
            ->back()
            ->with(
                'success',
                'contact_status_updated_success'
            );
    }

    /**
     * Delete single contact.
     */
    public function destroy(
        $rolePrefix,
        Contact_submissions $contact
    ) {
        $contact->delete();

        /*
        |--------------------------------------------------------------------------
        | Return translation key.
        |--------------------------------------------------------------------------
        */
        return redirect()
            ->back()
            ->with(
                'success',
                'contact_deleted_success'
            );
    }

    /**
     * Delete multiple contacts.
     */
    public function bulkDestroy(
        $rolePrefix,
        Request $request
    ) {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:contact_submissions,id',
        ]);

        Contact_submissions::whereIn(
            'id',
            $request->input('ids')
        )->delete();

        /*
        |--------------------------------------------------------------------------
        | Return translation key.
        |--------------------------------------------------------------------------
        */
        return redirect()
            ->back()
            ->with(
                'success',
                'contacts_deleted_success'
            );
    }
}
