<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    // public function update(ProfileUpdateRequest $request): RedirectResponse
    // {
    //     dd($request);
    //     $request->user()->fill($request->validated());

    //     if ($request->user()->isDirty('email')) {
    //         $request->user()->email_verified_at = null;
    //     }

    //     $request->user()->save();

    //     return Redirect::route('profile.edit');
    // }
    public function update(Request $request)
    {

        // Log::info('Profile update request', [
        //     'method' => $request->method(),
        //     'all' => $request->all(),
        //     'files' => $request->allFiles(),
        //     'content_type' => $request->header('Content-Type'),
        // ]);
        $user = $request->user();
        // dd($user);
        $locale = app()->getLocale();
        if (!in_array($locale, ['en', 'gu'])) {
            $locale = 'en';
        }
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],

            'logo' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],
        ]);
        //  Update bilingual name
        $name = $user->name ?? [];
        if (!is_array($name)) {
            $name = [];
        }

        $name[$locale] = $validated['name'];

        $user->name = $name;
        //update email
        $user->email = $validated['email'];
        // Upload logo if selected
        if ($request->hasFile('logo')) {

            // Delete old logo
            if (
                $user->profile &&
                Storage::disk('public')->exists($user->profile)
            ) {
                Storage::disk('public')->delete($user->profile);
            }

            // Store new logo
            $profilePath = $request->file('logo')->store(
                'admin/logos',
                'public'
            );

            $user->profile = $profilePath;
        }

        $user->save();

        return back()->with(
            'success',
            $locale === 'gu'
                ? 'પ્રોફાઇલ સફળતાપૂર્વક અપડેટ થઈ ગઈ છે.'
                : 'Profile updated successfully.'
        );
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();


        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
