<?php

namespace App\Http\Controllers\Kirtan;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Kirtan;
use App\Models\Pad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class KirtanController extends Controller
{


  //KIRTAN LIST PAGE
  public function KirtanList(Request $request)
  {
    // $kirtans = Kirtan::latest()->paginate(10);
    $query = Kirtan::withCount('pads')->latest();

    if ($request->filled('search')) {
      $query->where('title', 'like', '%' . $request->search . '%');
    }
    if ($request->filled('status')) {
      $query->where('status', $request->status);
    }
    $kirtans = $query->paginate(10)->withQueryString();



    // Folder:Admin->Kirtans->Index
    return Inertia::render('Admin/Kirtans/ListView/KirtanList', [
      'kirtans' => $kirtans,
      'filters' => $request->only(['search', 'status']),
    ]);
  }



  //CREATE KIRTAN PAGE
  public function Create()
  {
    $categories = Category::orderBy('type')->orderBy('value')->get(['id', 'type', 'value']);
    return Inertia::render('Admin/Kirtans/Create', [
      'categories' => $categories,
    ]);
  }


  //STORE THE DATA OF PAD
  public function store(Request $request)
  {
    // dd($request->all());
    // dd(Auth::id());
    $request->validate([
      'title' => 'nullable|string',
      'status' => 'in:save,draft',
      'pads' => 'nullable|array',
      'pads.*.title' => 'required|string',
      'pads.*.value' => 'required|string',
      'pads.*.status' => 'required|string',
      'pads.*.establish_date' => 'nullable|date',
      'pads.*.categories' => 'nullable|array',
      'pads.*.categories.*.type' => 'required|string',
      'pads.*.categories.*.value' => 'required|string',
      'pads.*.recorded_version' => 'nullable|array',
      'pads.*.recorded_version.media_type' => 'nullable|in:audio,video',
      'pads.*.recorded_version.file' => 'nullable|file|mimes:mp3,wav,m4a,ogg,mp4,mov,avi|max:51200',
      'pads.*.recorded_version.*.singer' => 'nullable|string',
      'pads.*.recorded_version.*.publisher' => 'nullable|string',
      'pads.*.recorded_version.*.vocalization' => 'nullable|string',
      'pads.*.recorded_version.*.recording_type' => 'nullable|in:live,studio',
    ]);



    // Create Kirtan
    $kirtan = Kirtan::create([
      'title' => $request->title,
      'status' => $request->status,
      'created_by' => Auth::id(),
    ]);


    // Create Pads
    foreach ($request->pads as $pad) {
      $newPad = $kirtan->pads()->create([
        'title' => $pad['title'],
        'value' => $pad['value'],
        'status' => $pad['status'] ?? 'draft',
        'establish_date' => $pad['establish_date'] ?? null,
        'created_by' => Auth::id(),
      ]);

      if (!empty($pad['recorded_version'])) {

        $media = $pad['recorded_version'];

        $path = null;

        if (!empty($media['file'])) {
          $path = $media['file']->store('pad-media', 'public');
        }

        $newPad->recordedVersion()->create([
          'media_type'     => $media['media_type'] ?? null,
          'file_url'       => $path,
          'singer'         => $media['singer'] ?? null,
          'publisher'      => $media['publisher'] ?? null,
          'vocalization'   => $media['vocalization'] ?? null,
          'recording_type' => $media['recording_type'] ?? null,
        ]);
      }

      $categoryIds = [];
      foreach ($pad['categories'] ?? [] as $cat) {

        // Create or get existing category
        $category = Category::firstOrCreate(
          [
            'type' => $cat['type'],
            'value' => $cat['value'],
          ],
          [
            'created_by' => Auth::id(),
          ]
        );

        $categoryIds[] = $category->id;
      }

      if (!empty($categoryIds)) {
        $newPad->categories()->sync($categoryIds);
      }
    }
    return redirect()->route('pads.list')
      ->with('success', 'Pad created successfully');
  }


  //SHOW DATA
  public function show(Kirtan $kirtan)
  {
    $kirtan->load([
      'pads' => function ($q) {
        $q->with(['categories:id,type,value', 'recordedVersion'])->latest();
      },
    ]);

    return Inertia::render('Admin/Kirtans/Show', [
      'kirtan' => $kirtan,
    ]);
  }



  // IF I CLICK THE EDIT BUTTON THEN EXISTING DATA SHOWS
  public function edit(Kirtan $kirtan)
  {
    $kirtan->load([
      'pads' => function ($query) {
        $query->with([
          'categories:id,type,value',
          'recordedVersion'
        ])->latest();
      },
    ]);

    $categories = Category::orderBy('type')
      ->orderBy('value')
      ->get(['id', 'type', 'value']);

    return Inertia::render('Admin/Kirtans/Edit', [
      'kirtan' => [
        'id' => $kirtan->id,
        'title' => $kirtan->title,
        'status' => $kirtan->status,
        'pads' => $kirtan->pads->map(function ($pad) {
          return [
            'id' => $pad->id,
            'title' => $pad->title,
            'value' => $pad->value,
            'status' => $pad->status,
            'establish_date' => optional($pad->establish_date)->format('Y-m-d'),
            'categories' => $pad->categories->map(function ($category) {
              return [
                'id' => $category->id,
                'type' => $category->type,
                'value' => $category->value,
              ];
            })->values(),

            'recorded_version' => $pad->recordedVersion ? [
              'id' => $pad->recordedVersion->id,
              'media_type' => $pad->recordedVersion->media_type,
              'file_url' => $pad->recordedVersion->file_url,
              'singer' => $pad->recordedVersion->singer,
              'publisher' => $pad->recordedVersion->publisher,
              'vocalization' => $pad->recordedVersion->vocalization,
              'recording_type' => $pad->recordedVersion->recording_type,
            ] : null,
          ];
        })->values(),
      ],

      'categories' => $categories,
    ]);
  }



  // IF I CLICK THE UPDATE BUTTON THEN UPDATE THE DATA
  public function update(Request $request, Kirtan $kirtan)
  {
    $request->validate([
      'title'  => 'required|string|max:255',
      'status' => 'required|in:save,draft',
      'pads'   => 'nullable|array',

      'pads.*.id'             => 'nullable|integer|exists:pads,id',
      'pads.*.title'          => 'required|string|max:255',
      'pads.*.value'          => 'required|string',
      'pads.*.status'         => 'nullable|in:save,draft',
      'pads.*.establish_date' => 'nullable|date',

      'pads.*.categories'         => 'nullable|array',
      'pads.*.categories.*.type'  => 'required|string|max:100',
      'pads.*.categories.*.value' => 'required|string|max:255',

      'pads.*.recorded_version'                  => 'nullable|array',
      'pads.*.recorded_version.id'               => 'nullable|integer',
      'pads.*.recorded_version.media_type'       => 'nullable|in:audio,video',
      'pads.*.recorded_version.file'             => 'nullable|file|mimes:mp3,wav,m4a,ogg,mp4,mov,avi|max:51200',
      'pads.*.recorded_version.singer'           => 'nullable|string',
      'pads.*.recorded_version.publisher'        => 'nullable|string',
      'pads.*.recorded_version.vocalization'     => 'nullable|string',
      'pads.*.recorded_version.recording_type'   => 'nullable|in:live,studio',
    ]);

    DB::transaction(function () use ($request, $kirtan) {

      // Update kirtan
      $kirtan->update([
        'title'  => $request->title,
        'status' => $request->status,
      ]);

      $incomingPadIds = collect($request->pads ?? [])
        ->pluck('id')
        ->filter()
        ->all();

      // Delete removed pads (and cascade recordedVersion if FK is set)
      $kirtan->pads()
        ->whereNotIn('id', $incomingPadIds)
        ->delete();

      foreach ($request->pads ?? [] as $padData) {

        // Find or create pad
        $pad = isset($padData['id'])
          ? Pad::find($padData['id'])
          : new Pad([
            'kirtan_id'  => $kirtan->id,
            'created_by' => Auth::id(),
          ]);

        $pad->fill([
          'kirtan_id'      => $kirtan->id,
          'title'          => $padData['title'],
          'value'          => $padData['value'],
          'status'         => $padData['status'] ?? 'draft',
          'establish_date' => $padData['establish_date'] ?? null,
        ])->save();

        // ── Categories (same as store) ──────────────────────────────
        $categoryIds = [];

        foreach ($padData['categories'] ?? [] as $cat) {
          $category = Category::firstOrCreate(
            [
              'type'  => $cat['type'],
              'value' => $cat['value'],
            ],
            [
              'created_by' => Auth::id(),
            ]
          );

          $categoryIds[] = $category->id;
        }

        $pad->categories()->sync($categoryIds);

        // ── Recorded version (aligned with store) ───────────────────
        if (!empty($padData['recorded_version'])) {
          $media = $padData['recorded_version'];

          $path = null;

          // New file uploaded → store it
          if (!empty($media['file']) && $media['file'] instanceof \Illuminate\Http\UploadedFile) {
            $path = $media['file']->store('pad-media', 'public');
          }

          $recordedVersionData = [
            'media_type'     => $media['media_type'] ?? null,
            'singer'         => $media['singer'] ?? null,
            'publisher'      => $media['publisher'] ?? null,
            'vocalization'   => $media['vocalization'] ?? null,
            'recording_type' => $media['recording_type'] ?? null,
          ];

          // Only overwrite file_url when a new file was uploaded
          if ($path !== null) {
            $recordedVersionData['file_url'] = $path;
          }

          $existing = $pad->recordedVersion;

          if ($existing) {
            // Optional: delete old file from disk when replacing
            if ($path !== null && !empty($existing->file_url)) {
              Storage::disk('public')->delete($existing->file_url);
            }

            $existing->update($recordedVersionData);
          } else {
            // Create only if there is something useful to save
            if ($path !== null || array_filter($recordedVersionData)) {
              $pad->recordedVersion()->create(array_merge(
                $recordedVersionData,
                ['file_url' => $path]
              ));
            }
          }
        }
      }
    });

    return redirect()->route('admin.kirtans.list')
      ->with('success', 'Kirtan updated successfully.');
  }

  public function destroy(Pad $pad)
  {
    // Detach pivot rows then delete pads, then kirtan
    $pad->pads->each(fn($pad) => $pad->categories()->detach());
    $pad->pads()->delete();
    $pad->delete();  

    return back()->with('success', 'Kirtan deleted successfully.');
  }
}
