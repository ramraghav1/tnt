import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly LANGUAGE_KEY = 'language';

  constructor(private translate: TranslateService) {}

  /**
   * Initialize the translation service with saved or default language
   */
  init(): void {
    const savedLang = this.getSavedLanguage();
    this.setLanguage(savedLang);
  }

  /**
   * Get the currently active language
   */
  getCurrentLanguage(): string {
    return this.translate.currentLang || this.translate.defaultLang || 'en';
  }

  /**
   * Set the active language
   * @param lang Language code (e.g., 'en', 'np')
   */
  setLanguage(lang: string): void {
    if (this.translate.langs.includes(lang)) {
      this.translate.use(lang);
      this.saveLanguage(lang);
      
      // Update HTML lang attribute for accessibility
      document.documentElement.lang = lang;
    }
  }

  /**
   * Get list of available languages
   */
  getAvailableLanguages(): readonly string[] {
    return this.translate.langs;
  }

  /**
   * Get translation for a specific key
   * @param key Translation key
   * @param params Optional interpolation parameters
   */
  instant(key: string, params?: any): string {
    return this.translate.instant(key, params);
  }

  /**
   * Get translation asynchronously
   * @param key Translation key
   * @param params Optional interpolation parameters
   */
  get(key: string, params?: any) {
    return this.translate.get(key, params);
  }

  /**
   * Save language preference to localStorage
   */
  private saveLanguage(lang: string): void {
    localStorage.setItem(this.LANGUAGE_KEY, lang);
  }

  /**
   * Get saved language from localStorage or return default
   */
  private getSavedLanguage(): string {
    return localStorage.getItem(this.LANGUAGE_KEY) || this.translate.defaultLang || 'en';
  }

  /**
   * Get language display name
   * @param lang Language code
   */
  getLanguageDisplayName(lang: string): string {
    const displayNames: { [key: string]: string } = {
      'en': 'English',
      'np': 'नेपाली'
    };
    return displayNames[lang] || lang;
  }
}
