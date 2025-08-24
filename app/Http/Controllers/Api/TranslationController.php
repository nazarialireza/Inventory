<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\App;

class TranslationController extends Controller
{
    /**
     * Get translations for a specific locale
     */
    public function getTranslations($locale)
    {
        // Validate locale
        $availableLocales = array_keys(config('app.available_locales'));
        if (!in_array($locale, $availableLocales)) {
            return response()->json(['error' => 'Invalid locale'], 400);
        }
        
        $translationPath = resource_path("lang/{$locale}/admin.php");
        
        if (!File::exists($translationPath)) {
            // Fallback to English if translation file doesn't exist
            $translationPath = resource_path("lang/en/admin.php");
        }
        
        try {
            $translations = include $translationPath;
            return response()->json($translations);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to load translations'], 500);
        }
    }
    
    /**
     * Get all available translations for frontend caching
     */
    public function getAllTranslations()
    {
        $availableLocales = array_keys(config('app.available_locales'));
        $allTranslations = [];
        
        foreach ($availableLocales as $locale) {
            $translationPath = resource_path("lang/{$locale}/admin.php");
            
            if (File::exists($translationPath)) {
                try {
                    $allTranslations[$locale] = include $translationPath;
                } catch (\Exception $e) {
                    // Skip if translation file is corrupted
                    continue;
                }
            }
        }
        
        return response()->json($allTranslations);
    }
}