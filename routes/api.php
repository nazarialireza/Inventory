<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
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
    $currentLocale = App::getLocale();
    $availableLocales = config('app.available_locales');
    
    return response()->json([
        'current_locale' => $currentLocale,
        'available_locales' => $availableLocales,
        'current_locale_info' => $availableLocales[$currentLocale] ?? null
    ]);
});

// User notification routes
Route::middleware('auth')->group(function () {
    Route::get('/user/notifications', [UserController::class, 'getNotifications']);
    Route::patch('/user/notifications/{id}/read', [UserController::class, 'markNotificationAsRead']);
    Route::patch('/user/notifications/mark-all-read', [UserController::class, 'markAllNotificationsAsRead']);
    Route::delete('/user/notifications/{id}', [UserController::class, 'deleteNotification']);
    Route::delete('/user/notifications/clear-all', [UserController::class, 'clearAllNotifications']);
});

Route::middleware('auth')->get('/user', function (Request $request) {
    return $request->user();
});