# Multi-Language Support Implementation Guide

## Overview

This project now supports multi-language functionality with English and Nepali. Users can switch between languages using the language selector in the topbar, and their preference is saved across sessions.

## Frontend (Angular) Implementation

### Setup

**Installed Packages:**
- `@ngx-translate/core` - Translation framework
- `@ngx-translate/http-loader` - HTTP loader for translation files

### Configuration

**1. App Configuration ([src/app.config.ts](src/app.config.ts))**
```typescript
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// In providers array:
importProvidersFrom(
    TranslateModule.forRoot({
        defaultLanguage: 'en',
        loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
        }
    })
)
```

**2. App Component ([src/app.component.ts](src/app.component.ts))**
Initializes the translation service on app startup and loads saved language preference.

### Translation Files

Location: `src/assets/i18n/`

**Available Languages:**
- English: `en.json`
- Nepali: `np.json`

**Structure:**
```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    ...
  },
  "auth": {
    "login": "Login",
    "email": "Email",
    ...
  },
  ...
}
```

### Services

**Translation Service** ([src/app/shared/services/translation.service.ts](src/app/shared/services/translation.service.ts))

A centralized service for managing translations:

```typescript
// Get current language
getCurrentLanguage(): string

// Set language
setLanguage(lang: string): void

// Get translation instantly
instant(key: string, params?: any): string

// Get translation asynchronously
get(key: string, params?: any): Observable<string>

// Get language display name
getLanguageDisplayName(lang: string): string
```

### Components

**Language Selector** ([src/app/layout/component/language-selector/language-selector.component.ts](src/app/layout/component/language-selector/language-selector.component.ts))

A dropdown component in the topbar that allows users to switch languages. Displays language name with flag icon.

### Usage in Templates

**Using the Translate Pipe:**

```html
<!-- Simple translation -->
<button>{{ 'common.save' | translate }}</button>

<!-- Translation with parameters -->
<span>{{ 'validation.minLength' | translate: {min: 8} }}</span>

<!-- Attribute binding -->
<input [placeholder]="'auth.email' | translate" />
```

**Using the Translate Directive:**

```html
<p translate>auth.welcome</p>
<p [translate]="'auth.welcome'" [translateParams]="{name: userName}"></p>
```

**Programmatic Usage:**

```typescript
constructor(private translationService: TranslationService) {}

// Get translation instantly
const message = this.translationService.instant('common.save');

// Get translation asynchronously
this.translationService.get('common.save').subscribe(text => {
  console.log(text);
});
```

## Backend (.NET) Implementation

### Configuration

**Program.cs:**
- Configured localization with support for `en-US` and `ne-NP` cultures
- Added `RequestLocalizationMiddleware` to detect and apply culture from:
  - Query string parameter
  - Cookie
  - Accept-Language header

### Resource Files

Location: `server/Resources/`

**Files:**
- `Messages.resx` - English (default)
- `Messages.ne-NP.resx` - Nepali

**Format:** Standard .NET .resx files with key-value pairs

### Services

**Localization Service** ([Bussiness/Services/LocalizationService.cs](../../TNT/Bussiness/Services/LocalizationService.cs))

```csharp
public interface ILocalizationService
{
    string GetLocalizedString(string key);
    string GetLocalizedString(string key, params object[] arguments);
}
```

**Usage in Controllers/Services:**

```csharp
public class MyController : ControllerBase
{
    private readonly ILocalizationService _localizationService;
    
    public MyController(ILocalizationService localizationService)
    {
        _localizationService = localizationService;
    }
    
    public IActionResult Create()
    {
        // Get localized message
        var message = _localizationService.GetLocalizedString("Success_Created");
        return Ok(new { message });
    }
}
```

### Error Handling

The `GlobalExceptionHandler` now returns localized error messages based on the request's culture.

### API Usage

**Setting Language:**

Clients can specify their preferred language using:

1. **Accept-Language Header:**
```http
GET /api/users
Accept-Language: ne-NP
```

2. **Query String:**
```http
GET /api/users?culture=ne-NP
```

3. **Cookie:**
Set a cookie named `.AspNetCore.Culture` with value like `c=ne-NP|uic=ne-NP`

## Adding New Languages

### Frontend

1. Create a new translation file in `src/assets/i18n/` (e.g., `es.json`)
2. Copy structure from `en.json` and translate all values
3. Update `app.component.ts` to add the language:
   ```typescript
   this.translate.addLangs(['en', 'np', 'es']);
   ```
4. Add language to selector in `language-selector.component.ts`:
   ```typescript
   languages: Language[] = [
     { code: 'en', name: 'English', flag: 'us' },
     { code: 'np', name: 'नेपाली', flag: 'np' },
     { code: 'es', name: 'Español', flag: 'es' }
   ];
   ```

### Backend

1. Create a new resource file: `Messages.{culture}.resx` (e.g., `Messages.es.resx`)
2. Add translations for all keys from the default `Messages.resx`
3. Update supported cultures in `Program.cs`:
   ```csharp
   var supportedCultures = new[]
   {
       new CultureInfo("en-US"),
       new CultureInfo("ne-NP"),
       new CultureInfo("es")
   };
   ```

## Adding New Translation Keys

### Frontend

1. Add the key-value pair to all language files:
   ```json
   // en.json
   {
     "myModule": {
       "myKey": "My English Text"
     }
   }
   
   // np.json
   {
     "myModule": {
       "myKey": "मेरो नेपाली पाठ"
     }
   }
   ```

2. Use in templates:
   ```html
   {{ 'myModule.myKey' | translate }}
   ```

### Backend

1. Open both `Messages.resx` and `Messages.ne-NP.resx`
2. Add the same key with translated values:
   - In `Messages.resx`: `MyModule_MyKey` = "My English Text"
   - In `Messages.ne-NP.resx`: `MyModule_MyKey` = "मेरो नेपाली पाठ"

3. Use in code:
   ```csharp
   var text = _localizationService.GetLocalizedString("MyModule_MyKey");
   ```

## Best Practices

1. **Never hardcode user-facing text** - Always use translation keys
2. **Use descriptive key names** - Group by module/feature (e.g., `booking.create`, `user.delete`)
3. **Keep translations flat where possible** - Avoid deep nesting
4. **Provide fallbacks** - The default language (English) is used if a translation is missing
5. **Test in all languages** - Ensure UI looks good in both English and Nepali (different text lengths)
6. **Use parameters for dynamic content** - `{{ 'messages.welcome' | translate: {name: userName} }}`

## Testing Multi-Language Support

### Frontend Testing

1. Open the application
2. Look for the language selector in the topbar
3. Switch between English and Nepali
4. Verify:
   - UI text changes immediately
   - Choice persists after page reload
   - All visible text is translated

### Backend Testing

Test API responses with different cultures:

```bash
# English response
curl -H "Accept-Language: en-US" http://localhost:5000/api/test

# Nepali response
curl -H "Accept-Language: ne-NP" http://localhost:5000/api/test
```

## Common Issues & Solutions

### Issue: Translation not showing
**Solution:** Check that:
- The translation key exists in the JSON file
- The JSON file has valid syntax
- The language file is in `src/assets/i18n/`

### Issue: Language doesn't persist
**Solution:** Check browser's localStorage for the `language` key. Ensure localStorage is not disabled.

### Issue: .NET resource not found
**Solution:** 
- Ensure resource files are in `server/Resources/` directory
- Verify the Build Action is set to "Embedded Resource"
- Check that the culture code matches exactly (case-sensitive)

## Performance Considerations

- Translation files are loaded on-demand via HTTP
- Language preference is cached in localStorage
- .NET resource files are compiled into assemblies for fast lookup
- Consider lazy-loading translations per module for very large applications

## Completed Tasks

✅ Install and configure ngx-translate in Angular
✅ Create translation file structure (en.json, np.json)
✅ Configure .NET localization
✅ Create .NET resource files (Messages.resx, Messages.ne-NP.resx)
✅ Create translation service in Angular
✅ Create language selector component
✅ Add language selector to topbar
✅ Translate login page (example)
✅ Create localization service in .NET
✅ Localize API error responses

## Remaining Tasks

The foundation is complete! To fully translate the application:

- Translate remaining auth pages (register, forgot password, etc.)
- Translate all dashboard components
- Translate booking module
- Translate clinic module  
- Translate organization module
- Translate remittance module
- Translate UIKit demo pages
- Add validation message translations
- Add date/time localization
- Add number/currency formatting
- Testing and refinement

## Support

For questions or issues with multi-language support, refer to:
- [ngx-translate documentation](https://github.com/ngx-translate/core)
- [.NET Localization documentation](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/localization)
