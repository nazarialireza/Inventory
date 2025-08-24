# Multilingual Implementation for Invextry

## Overview

This implementation adds comprehensive multilingual support to the Invextry Inventory Management System, including:

- **English (en)** - Default language (LTR)
- **Dari (prs)** - Persian/Dari language support (RTL)
- Dynamic language switching
- RTL (Right-to-Left) layout support
- Comprehensive translation system

## Implementation Details

### Backend (Laravel)

#### 1. Language Configuration
- Added `available_locales` to `config/app.php`
- Created language middleware (`LanguageMiddleware.php`)
- Added translation controller (`TranslationController.php`)

#### 2. API Endpoints
- `GET /api/locale` - Get current locale information
- `POST /api/locale` - Switch application language
- `GET /api/translations/{locale}` - Get translations for specific locale
- `GET /api/translations` - Get all translations

#### 3. Translation Files
- `resources/lang/en/admin.php` - English translations
- `resources/lang/prs/admin.php` - Dari translations

### Frontend (Vue.js)

#### 1. Internationalization Composable
- `composables/useI18n.js` - Core i18n functionality
- Provides `t()` function for translations
- Handles language switching
- Manages RTL/LTR state

#### 2. Components
- `LanguageSwitcher.vue` - Language selection component
- Updated existing components to use translations
- Added RTL support to all UI components

#### 3. CSS Support
- `assets/css/main-rtl.css` - Comprehensive RTL styling
- Bootstrap RTL overrides
- Custom component RTL support

## Usage

### In Vue Components

```javascript
import { useI18n } from '../composables/useI18n';

export default {
  setup() {
    const { t, switchLanguage, isRTL } = useI18n();
    
    return {
      t,
      switchLanguage,
      isRTL
    };
  }
};
```

### In Templates

```vue
<template>
  <div :class="{ 'rtl': isRTL }">
    <h1>{{ t('dashboard.title') }}</h1>
    <button>{{ t('general.save') }}</button>
  </div>
</template>
```

### Language Switching

```javascript
// Switch to Dari
await switchLanguage('prs');

// Switch to English
await switchLanguage('en');
```

## Translation Keys Structure

```javascript
{
  general: {
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    // ...
  },
  navigation: {
    dashboard: 'Dashboard',
    products: 'Products',
    // ...
  },
  warehouses: {
    title: 'Warehouses',
    add_warehouse: 'Add Warehouse',
    // ...
  }
  // ... other sections
}
```

## RTL Support

### Automatic Features
- Text direction changes automatically
- Layout adjustments (margins, paddings, flexbox)
- Icon positioning
- Dropdown menus
- Form elements
- Navigation elements

### CSS Classes
- `.rtl` - Applied to body when RTL is active
- `.ltr` - Applied to body when LTR is active
- Components automatically adapt based on these classes

## Adding New Translations

### 1. Add to English file
```php
// resources/lang/en/admin.php
'new_section' => [
    'title' => 'New Section',
    'description' => 'Section description',
],
```

### 2. Add to Dari file
```php
// resources/lang/prs/admin.php
'new_section' => [
    'title' => 'بخش جدید',
    'description' => 'توصیف بخش',
],
```

### 3. Use in components
```vue
<template>
  <h1>{{ t('new_section.title') }}</h1>
  <p>{{ t('new_section.description') }}</p>
</template>
```

## Testing

### API Endpoints
```bash
# Get current locale
curl -X GET http://localhost:8000/api/locale

# Switch to Dari
curl -X POST http://localhost:8000/api/locale -d "locale=prs"

# Get English translations
curl -X GET http://localhost:8000/api/translations/en

# Get Dari translations
curl -X GET http://localhost:8000/api/translations/prs
```

### Frontend Testing
1. Use the language switcher in the navbar
2. Verify text changes to selected language
3. Check RTL layout when switching to Dari
4. Test navigation and form elements

## File Structure

```
resources/
├── lang/
│   ├── en/
│   │   └── admin.php
│   └── prs/
│       └── admin.php
└── admin-resources/
    ├── composables/
    │   └── useI18n.js
    ├── components/
    │   └── LanguageSwitcher.vue
    └── assets/
        └── css/
            └── main-rtl.css

app/Http/
├── Controllers/Api/
│   └── TranslationController.php
└── Middleware/
    └── LanguageMiddleware.php
```

## Browser Support

- Modern browsers with ES6+ support
- CSS Grid and Flexbox support
- Unicode/UTF-8 support for Dari text

## Notes

1. **Performance**: Translations are loaded asynchronously and cached
2. **Fallback**: English is used as fallback if translation missing
3. **Persistence**: Language preference is stored in Laravel session
4. **SEO**: HTML lang and dir attributes are set automatically
5. **Accessibility**: Proper ARIA attributes for RTL content

## Future Enhancements

1. Add more languages
2. Implement lazy loading for large translation files
3. Add plural forms support
4. Date/time localization
5. Number formatting based on locale
6. Currency formatting