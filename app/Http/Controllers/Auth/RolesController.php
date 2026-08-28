<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;


class RolesController extends Controller
{
  public function index(Request $request)
  {
    return $this->list($request);
  }

  public function list(Request $request)
  {
    $query = Role::with('permissions')
      ->withCount('users');


    if ($search = $request->input('search')) {
      $query->where('name', 'like', "%{$search}%");
    }

    $roles = $query->latest()->paginate(10)->withQueryString();

    // Group permissions by module for the frontend
    // $permissions = Permission::all()->groupBy('module');
    return Inertia::render('Admin/Roles/List', [
      'roles' => $roles,
      'filters' => $request->only(['search']),
      // 'permissions' => $permissions,
    ]);
  }

  public function create()
  {
    // $permissions = Permission::all()->groupBy('module');
    $permissions = Permission::all()
      ->map(function ($permission) {
        return [
          'id' => $permission->id,
          'name' => $permission->name,
          'module' => $permission->module,
          'module_name' => __("permissions.modules.{$permission->module}"),
          'action' => $permission->action,
          'display_name' => __("permissions.{$permission->name}"),
        ];
      })
      ->groupBy('module');

    return Inertia::render('Admin/Roles/Form', [
      'role'        => null,
      'permissions' => $permissions,
    ]);
  }

  public function edit($rolePrefix, Role $role)
  {
    $role->load('permissions');

    // $permissions = Permission::all()->groupBy('module');
    $permissions = Permission::all()
      ->map(function ($permission) {
        return [
          'id' => $permission->id,
          'name' => $permission->name,
          'module' => $permission->module,
          'module_name' => __("permissions.modules.{$permission->module}"),
          'action' => $permission->action,
          'display_name' => __("permissions.{$permission->name}"),
        ];
      })
      ->groupBy('module');


    return Inertia::render('Admin/Roles/Form', [
      'role'        => $role,
      'permissions' => $permissions,
    ]);
  }


  public function store($rolePrefix, Request $request)
  {
    $request->validate([
      'name' => 'required|string|max:255|unique:roles,name',
      'permissions'   => 'array',
    ]);
    $locale = app()->getLocale();

    if (!in_array($locale, ['en', 'gu'], true)) {
      $locale = 'en';
    }
    $role = Role::create([
      'name' => $request->name,
    ]);
    if ($request->filled('permissions')) {
      $role->permissions()->sync($request->permissions);
    }
    return redirect()
      ->route('role.roles.list', [
        'rolePrefix' => $rolePrefix,
      ])
      ->with('success', $locale === 'gu'
        ? 'ભૂમિકા સફળતાપૂર્વક બનાવવામાં આવી.'
        : 'Role created successfully.');
  }

  public function update($rolePrefix, Request $request, Role $role)
  {
    $request->validate([
      'name' => 'required|string|max:255|unique:roles,name,' . $role->id,
      'permissions'   => 'array',
    ]);
    $locale = app()->getLocale();

    if (!in_array($locale, ['en', 'gu'], true)) {
      $locale = 'en';
    }
    $role->update([
      'name' => $request->name,
    ]);

    $role->permissions()->sync($request->permissions ?? []);

    return redirect()
      ->route('role.roles.list', [
        'rolePrefix' => $rolePrefix,
      ])
      ->with('success', $locale === 'gu'
        ? 'ભૂમિકા સફળતાપૂર્વક અપડેટ કરવામાં આવી.'
        : 'Role updated successfully.');
  }

  public function destroy($rolePrefix,Role $role)
  {
    $locale = app()->getLocale();

    if (!in_array($locale, ['en', 'gu'], true)) {
      $locale = 'en';
    }
    $role->delete();

    return redirect()
      ->back()
      ->with('success', $locale === 'gu'
        ? 'ભૂમિકા સફળતાપૂર્વક કાઢી નાખવામાં આવી.'
        : 'Role deleted successfully.');
  }

  public function bulkDestroy($rolePrefix, Request $request)
  {
    $locale = app()->getLocale();

    if (!in_array($locale, ['en', 'gu'], true)) {
      $locale = 'en';
    }
    $request->validate([
      'ids'   => 'required|array',
      'ids.*' => 'integer|exists:roles,id',
    ]);

    Role::whereIn('id', $request->ids)->delete();

    return redirect()
      ->back()
      ->with('success', $locale === 'gu'
        ? 'ભૂમિકાઓ સફળતાપૂર્વક કાઢી નાખવામાં આવી.'
        : 'Roles deleted successfully.');
  }
}
