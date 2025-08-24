<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
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
            // Get locale from session or use default
            $locale = Session::get('locale', config('app.locale'));
        }
        
        // Ensure the locale is supported
        if (!in_array($locale, $availableLocales)) {
            $locale = config('app.locale');
        }
        
        // Set the application locale
        App::setLocale($locale);
        
        return $next($request);
    }
}