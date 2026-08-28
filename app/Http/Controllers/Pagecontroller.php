<?php

namespace App\Http\Controllers;

use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class Pagecontroller extends Controller
{
    public function index($rolePrefix, Request $request)
    {
        return $this->list($request);
    }

    public function published($rolePrefix, Request $request)
    {
        return $this->list($request, 'published');
    }

    public function drafts($rolePrefix, Request $request)
    {
        return $this->list($request, 'draft');
    }

    public function list(Request $request, ?string $status = null)
    {
        $query = Page::with('creator')->latest();

        if ($status) {
            $query->where('status', $status);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('page_group', 'like', "%{$search}%");
            });
        }

        if ($group = $request->input('page_group')) {
            $query->where('page_group', $group);
        }

        $pages = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Pages/List', [
            'pages'   => $pages,
            'filters' => $request->only(['search', 'page_group']) + [
                'status' => $status,
            ],
        ]);
    }

    public function show($rolePrefix, string $slug)
    {
        $page = Page::where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        return Inertia::render('Pages/Show', [ // create this page or use a simple view
            'page' => $page,
        ]);
    }
    public function create()
    {
        return Inertia::render('Admin/Pages/Form', [
            'page' => null,
        ]);
    }

    public function edit($rolePrefix, Page $page)
    {
        $page->load('creator');

        return Inertia::render('Admin/Pages/Form', [
            'page' => $page,
        ]);
    }

    public function store($rolePrefix, Request $request)
    {
        $locale = app()->getLocale();

        if (!in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }
        $request->validate([
            'page_group' => 'required|string|max:255',
            'title'      => 'required|string|max:255',
            'slug'       => 'required|string|max:255|unique:pages,slug',
            'content'    => 'required|string',
            'status'     => 'required|in:published,draft',
        ]);

        Page::create([
            'page_group' => $request->page_group,
            'title'      => $request->title,
            'slug'       => Str::slug($request->slug),
            'content'    => $request->content,
            'status'     => $request->status,
            'created_by' => Auth::id(),
        ]);

        return redirect()
            ->route('role.pages.list', [
                'rolePrefix' => $rolePrefix,
            ])
            ->with('success', $locale === 'gu'
                ? 'પેજ સફળતાપૂર્વક બનાવવામાં આવ્યું.'
                : 'Page created successfully.');
    }

    public function update($rolePrefix, Request $request, Page $page)
    {
        $locale = app()->getLocale();

        if (!in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }
        $request->validate([
            'page_group' => 'required|string|max:255',
            'title'      => 'required|string|max:255',
            'slug'       => 'required|string|max:255|unique:pages,slug,' . $page->id,
            'content'    => 'required|string',
            'status'     => 'required|in:published,draft',
        ]);

        $page->update([
            'page_group' => $request->page_group,
            'title'      => $request->title,
            'slug'       => Str::slug($request->slug),
            'content'    => $request->content,
            'status'     => $request->status,
        ]);

        return redirect()
            ->route('role.pages.list', [
                'rolePrefix' => $rolePrefix,
            ])
            ->with('success', $locale === 'gu'
                ? 'પેજ સફળતાપૂર્વક અપડેટ થયું.'
                : 'Page updated successfully.');
    }

    public function destroy($rolePrefix, Page $page)
    {
        $locale = app()->getLocale();

        if (!in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }
        $page->delete();

        return redirect()
            ->back()
            ->with('success', $locale === 'gu'
                ? 'પેજ સફળતાપૂર્વક કાઢી નાખવામાં આવ્યું.'
                : 'Page deleted successfully.');
    }

    public function bulkDestroy($rolePrefix, Request $request)
    {
        $locale = app()->getLocale();

        if (!in_array($locale, ['en', 'gu'], true)) {
            $locale = 'en';
        }
        $request->validate([
            'ids'   => 'required|array',
            'ids.*' => 'integer|exists:pages,id',
        ]);

        Page::whereIn('id', $request->ids)->delete();

        return redirect()
            ->back()
            ->with('success', $locale === 'gu'
                ? 'પેજ સફળતાપૂર્વક કાઢી નાખવામાં આવ્યા.'
                : 'Pages deleted successfully.');
    }
}
