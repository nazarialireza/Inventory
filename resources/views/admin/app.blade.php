<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="csrf-token" content="{{ csrf_token() }}" />
    <title>Invextry</title>
    
    @php
        // Get current locale and determine if it's RTL
        $currentLocale = app()->getLocale();
        $availableLocales = config('app.available_locales', ['en' => ['name' => 'English', 'dir' => 'ltr'], 'prs' => ['name' => 'دری', 'dir' => 'rtl']]);
        $isRTL = isset($availableLocales[$currentLocale]) && $availableLocales[$currentLocale]['dir'] === 'rtl';
        $cssFile = $isRTL ? 'resources/admin-resources/assets/css/main-rtl.css' : 'resources/admin-resources/assets/css/main.css';
    @endphp
    
    {{-- Load appropriate CSS based on language direction --}}
    @vite($cssFile)
</head>
<body class="{{ $isRTL ? 'rtl' : 'ltr' }}">
    <div id="invextry-admin"></div>
    @vite('resources/admin-resources/main.js')
</body>
</html>