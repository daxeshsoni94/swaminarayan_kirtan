<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class VelzonRoutesController extends Controller
{
    public function index()
    {
        return Inertia::render('DashboardEcommerce/index');
    }
    // public function dashboard()
    // {
    //     return Inertia::render('DashboardEcommerce/index');
    // }


    public function apps_calendar()
    {
        return Inertia::render('Calendar/index');
    }

    public function apps_calendar_month_grid()
    {
        return Inertia::render('Calendar/monthGrid');
    }
    public function apps_mailbox()
    {
        return Inertia::render('EmailInbox/index');
    }

    public function apps_email_basic()
    {
        return Inertia::render('Email/EmailTemplates/BasicAction/index');
    }

    public function apps_email_ecommerce()
    {
        return Inertia::render('Email/EmailTemplates/EcommerceAction/index');
    }


    // forms

    public function forms_elements()
    {
        return Inertia::render('Forms/BasicElements/BasicElements');
    }

    public function forms_select()
    {
        return Inertia::render('Forms/FormSelect/FormSelect');
    }




    //Logout
    public function auth_logout_basic()
    {
        return Inertia::render('AuthInner/Logout/BasicLogout');
    }

    public function auth_logout_cover()
    {
        return Inertia::render('AuthInner/Logout/CoverLogout');
    }

    // tables

    public function tables_basic()
    {
        return Inertia::render('Tables/BasicTables/BasicTables');
    }

    public function tables_react()
    {
        return Inertia::render('Tables/ReactTables/index');
    }


    // icons

    public function icons_remix()
    {
        return Inertia::render('Icons/RemixIcons/RemixIcons');
    }



    // pages

    public function pages_starter()
    {
        return Inertia::render('Pages/Starter/Starter');
    }

    public function pages_profile()
    {
        return Inertia::render('Pages/Profile/SimplePage/SimplePage');
    }

    public function pages_profile_settings()
    {
        return Inertia::render('Pages/Profile/Settings/Settings');
    }


    // auth inner

    public function auth_signin_basic()
    {
        return Inertia::render('AuthInner/Login/BasicSignIn');
    }

    public function auth_signin_cover()
    {
        return Inertia::render('AuthInner/Login/CoverSignIn');
    }
    public function auth_signup_basic()
    {
        return Inertia::render('AuthInner/Register/BasicSignUp');
    }

    public function auth_signup_cover()
    {
        return Inertia::render('AuthInner/Register/CoverSignUp');
    }


    // Landing

    public function landing()
    {
        return Inertia::render('Landing/OnePage/index');
    }

    public function profile()
    {
        return Inertia::render('Auth/user-profile');
    }
}
