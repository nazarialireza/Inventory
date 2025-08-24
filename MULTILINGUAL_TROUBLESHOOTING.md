# Multilingual Troubleshooting Guide

## Issues Fixed:

### 1. ✅ Navigation Menu Not Getting Translated
**Problem**: Menu items were defined statically and didn't update when language changed.

**Solution**: 
- Made navigation links reactive using `computed()` 
- Added `currentLocale` dependency to force re-evaluation
- Updated key prop to force component re-render: `:key="\`${currentLocale}-${index}\`"`

### 2. ✅ RTL Layout Not Working Properly  
**Problem**: RTL CSS wasn't being applied correctly, especially to sidebar.

**Solution**:
- Enhanced RTL CSS with `!important` declarations
- Fixed sidebar positioning and flex direction
- Added proper direction inheritance: `body.rtl *`
- Fixed navbar and menu item alignment

### 3. ✅ Language Toggling Not Working
**Problem**: Translation state wasn't reactive and components weren't updating.

**Solution**:
- Improved `useI18n` composable with better reactivity
- Added `translationsLoaded` state tracking
- Enhanced `switchLanguage` function with proper state updates
- Added force DOM updates with `nextTick()`

### 4. ✅ Dari Text Not Displaying
**Problem**: Translations weren't loading or not being applied to components.

**Solution**:
- Fixed translation loading with better error handling
- Improved `trans()` function with fallbacks
- Added debugging capabilities and console logging

## Testing Your Fixes:

### Method 1: Use the Debug Component
1. Navigate to: `http://localhost:8000/admin/i18n-test`
2. This shows a comprehensive debug panel with:
   - Current locale status
   - Translation loading status
   - Real-time translation examples
   - Language switching buttons
   - Debug information

### Method 2: Test Navigation Menu
1. Go to the main admin panel
2. Use the language switcher in the top navbar
3. Verify that:
   - Menu items change language immediately
   - RTL layout applies when switching to Dari
   - All text updates properly

### Method 3: Browser Console Debugging
1. Open browser dev tools (F12)
2. Switch languages and watch console logs
3. Look for messages like:
   ```
   Loading translations for locale: prs
   Language switched to prs, RTL: true
   Document dir set to: rtl
   ```

## Expected Behavior:

### When Switching to Dari (prs):
✅ Menu items should translate to Dari text  
✅ Layout should flip to RTL (right-to-left)  
✅ Sidebar should move to the right side  
✅ Text alignment should change to right  
✅ Document direction should be set to "rtl"  
✅ Body should have "rtl" class  

### When Switching to English (en):
✅ Menu items should show in English  
✅ Layout should be LTR (left-to-right)  
✅ Sidebar should be on the left side  
✅ Text alignment should be left  
✅ Document direction should be set to "ltr"  
✅ Body should have "ltr" class  

## Common Issues and Solutions:

### Issue: Translations not loading
**Check**: 
- Laravel server is running: `php artisan serve`
- API endpoints are accessible: `/api/locale` and `/api/translations/prs`
- Browser console for error messages

### Issue: RTL not applying
**Check**:
- `rtl.css` is being loaded
- Body has the correct class (`rtl` or `ltr`)
- Document direction attribute is set correctly

### Issue: Menu not updating
**Check**:
- Sidebar component is using the `computed()` navigation links
- Component keys are updating with locale changes
- Translation functions are reactive

## Development Commands:

```bash
# Start Laravel server
php artisan serve

# Start frontend dev server (if needed)
npm run dev

# Check API endpoints
curl http://localhost:8000/api/locale
curl http://localhost:8000/api/translations/en
curl http://localhost:8000/api/translations/prs
```

## File Changes Summary:

### Core Files Modified:
- ✅ `useI18n.js` - Enhanced reactivity and debugging
- ✅ `Sidebar.vue` - Made navigation reactive
- ✅ `LanguageSwitcher.vue` - Improved reliability
- ✅ `rtl.css` - Enhanced RTL support
- ✅ `main.js` - Better initialization
- ✅ `TestI18n.vue` - Comprehensive debug component

### Key Improvements:
1. **Reactive Navigation**: Menu items now update immediately
2. **Better RTL Support**: Comprehensive CSS for proper RTL layout
3. **Debug Tools**: Easy testing with debug component
4. **Error Handling**: Better error reporting and fallbacks
5. **Console Logging**: Detailed logs for troubleshooting

## Next Steps:

1. **Test the debug component** at `/admin/i18n-test`
2. **Try switching languages** using the navbar switcher
3. **Check browser console** for any error messages
4. **Verify API endpoints** are working correctly

If you're still experiencing issues, check the browser console for error messages and verify that all API endpoints are responding correctly.