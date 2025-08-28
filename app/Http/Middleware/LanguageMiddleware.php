<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class LanguageMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get available locales from config
        $availableLocales = array_keys(config('app.available_locales'));
        
        // Check if locale is provided in request
        if ($request->has('locale') && in_array($request->locale, $availableLocales)) {
            $locale = $request->locale;
            Session::put('locale', $locale);
        } else {
            // Priority order: User settings > Session > Default
            $locale = $this->determineLocale($availableLocales);
        }
        
        // Ensure the locale is supported
        if (!in_array($locale, $availableLocales)) {
            $locale = config('app.locale');
        }
        
        // Set the application locale
        App::setLocale($locale);
        
        return $next($request);
    }
    
    /**
     * Determine the appropriate locale based on priority
     * 
     * @param array $availableLocales
     * @return string
     */
    private function determineLocale(array $availableLocales): string
    {
        // For authenticated users, check their language preference first
        if (Auth::check()) {
            $user = Auth::user();
            $userSettings = $user->settings;
            
            if ($userSettings && $userSettings->language && in_array($userSettings->language, $availableLocales)) {
                // Update session to match user preference
                Session::put('locale', $userSettings->language);
                return $userSettings->language;
            }
        }
        
        // Fall back to session or default
        return Session::get('locale', config('app.locale'));
    }
}