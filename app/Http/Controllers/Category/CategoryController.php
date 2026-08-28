<?php

namespace App\Http\Controllers\Category;

use App\Http\Controllers\Controller;
use App\Models\Kirtan;
use Illuminate\Http\Request;
use App\Models\Category;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CategoryController extends Controller
{

  public function CreateCategory()
  {
    return Inertia::render('Admin/Categories/CreateCategory');
  }

  public function store(Request $request)
  {
    $request->validate([
      'type.en'   => 'required|string|max:255',
      'type.gu'   => 'nullable|string|max:255',
      'values'    => 'required|array|min:1',
      'values.*.en' => 'required|string|max:255',
      'values.*.gu' => 'nullable|string|max:255',
    ]);

    foreach ($request->values as $val) {
      $cat = new Category(['created_by' => Auth::id()]);
      $cat->setTranslations('type', [
        'en' => trim($request->input('type.en')),
        'gu' => trim($request->input('type.gu') ?? ''),
      ]);
      $cat->setTranslations('value', [
        'en' => trim($val['en']),
        'gu' => trim($val['gu'] ?? ''),
      ]);
      $cat->save();
    }

    return back()->with('success', 'Categories created successfully!');
  }
}
