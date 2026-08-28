<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Contact_submissions;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactController extends Controller
{
    public function index(Request $request)
    {
        return $this->list($request);
    }

    public function new(Request $request)
    {
        return $this->list($request, 'new');
    }

    public function read(Request $request)
    {
        return $this->list($request, 'read');
    }

    public function resolved(Request $request)
    {
        return $this->list($request, 'resolved');
    }

    public function list(Request $request, ?string $status = null)
    {
        $query = Contact_submissions::with('user')->latest();

        if ($status) {
            $query->where('status', $status);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('reason_for_contact', 'like', "%{$search}%");
            });
        }

        $contacts = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Contacts/List', [
            'contacts' => $contacts,
            'filters'  => [
                'search' => $request->input('search'),
                'status' => $status,
            ],
        ]);
    }

    public function show($rolePrefix, Contact_submissions $contact)
    {
        $contact->load('user');

        // Auto-mark as read when opened (optional)
        if ($contact->status === 'new') {
            $contact->update(['status' => 'read']);
        }

        return Inertia::render('Contacts/Show', [
            'contact' => $contact->fresh('user'),
        ]);
    }

    public function updateStatus($rolePrefix, Request $request, Contact_submissions $contact)
    {
        $locale = app()->getLocale();

        if (!in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }
        $request->validate([
            'status' => 'required|in:new,read,resolved',
        ]);

        $contact->update(['status' => $request->status]);

        return redirect()
            ->back()
            ->with('success', $locale === 'gu'
                ? 'સ્થિતિ સફળતાપૂર્વક અપડેટ કરવામાં આવી.'
                : 'Status updated successfully.');
    }

    public function destroy($rolePrefix, Contact_submissions $contact)
    {
        $locale = app()->getLocale();

        if (!in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }
        $contact->delete();

        return redirect()
            ->back()
            ->with('success', $locale === 'gu'
                ? 'સંપર્ક સફળતાપૂર્વક કાઢી નાખવામાં આવ્યો.'
                : 'Contact deleted successfully.');
    }

    public function bulkDestroy($rolePrefix, Request $request)
    {
        $locale = app()->getLocale();

        if (!in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }
        $request->validate([
            'ids'   => 'required|array',
            'ids.*' => 'integer|exists:contact_submissions,id',
        ]);

        contact_submissions::whereIn('id', $request->ids)->delete();

        return redirect()
            ->back()
            ->with('success', $locale === 'gu'
                ? 'સંપર્કો સફળતાપૂર્વક કાઢી નાખવામાં આવ્યા.'
                : 'Contacts deleted successfully.');
    }
}
