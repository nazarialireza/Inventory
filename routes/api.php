<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Api\TranslationController;
use App\Http\Controllers\Api\User\UserController;

// Translation routes
Route::get('/translations/{locale}', [TranslationController::class, 'getTranslations']);
Route::get('/translations', [TranslationController::class, 'getAllTranslations']);

// Language switching routes
Route::post('/locale', function (Request $request) {
    $locale = $request->input('locale');
    $availableLocales = array_keys(config('app.available_locales'));
    
    if (in_array($locale, $availableLocales)) {
        Session::put('locale', $locale);
        App::setLocale($locale);
        
        return response()->json([
            'success' => true,
            'locale' => $locale,
            'message' => __('admin.general.language_changed')
        ]);
    }
    
    return response()->json([
        'success' => false,
        'message' => __('admin.general.invalid_language')
    ], 400);
});

Route::get('/locale', function () {
    $availableLocales = config('app.available_locales');
    $currentLocale = App::getLocale();
    
    // For authenticated users, ensure their language preference is applied
    if (Auth::check()) {
        $user = Auth::user();
        $userSettings = $user->settings;
        
        if ($userSettings && $userSettings->language && array_key_exists($userSettings->language, $availableLocales)) {
            $currentLocale = $userSettings->language;
            // Update session to match user preference
            Session::put('locale', $currentLocale);
            App::setLocale($currentLocale);
        }
    }
    
    return response()->json([
        'current_locale' => $currentLocale,
        'available_locales' => $availableLocales,
        'current_locale_info' => $availableLocales[$currentLocale] ?? null
    ]);
});

Route::middleware('auth')->get('/user', function (Request $request) {
    return $request->user();
});
