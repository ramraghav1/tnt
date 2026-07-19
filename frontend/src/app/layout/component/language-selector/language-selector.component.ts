import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationService } from '../../../shared/services/translation.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="language-toggle-container">
      <button 
        [class.active]="selectedLanguage === 'en'"
        (click)="setLanguage('en')"
        class="toggle-btn">
        EN
      </button>
      <button 
        [class.active]="selectedLanguage === 'np'"
        (click)="setLanguage('np')"
        class="toggle-btn">
        ने
      </button>
      <div class="slider" [class.slide-right]="selectedLanguage === 'np'"></div>
    </div>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      height: 40px;
    }
    
    .language-toggle-container {
      position: relative;
      display: inline-flex;
      background: var(--surface-100);
      border-radius: 20px;
      padding: 2px;
      box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
      align-items: center;
    }
    
    .toggle-btn {
      position: relative;
      padding: 5px 12px;
      border: none;
      background: transparent;
      color: var(--text-color-secondary);
      cursor: pointer;
      border-radius: 18px;
      font-weight: 600;
      font-size: 0.75rem;
      transition: color 0.3s ease;
      z-index: 1;
      min-width: 40px;
    }
    
    .toggle-btn.active {
      color: white;
    }
    
    .slider {
      position: absolute;
      top: 2px;
      left: 2px;
      width: calc(50% - 2px);
      height: calc(100% - 4px);
      background: var(--primary-color);
      border-radius: 18px;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      z-index: 0;
    }
    
    .slider.slide-right {
      transform: translateX(calc(100% + 2px));
    }

    :host-context(.app-dark) .language-toggle-container {
      background: var(--surface-800);
      box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
    }

    :host-context(.app-dark) .toggle-btn {
      color: var(--surface-400);
    }

    :host-context(.app-dark) .toggle-btn.active {
      color: white;
    }
  `]
})
export class LanguageSelectorComponent implements OnInit {
  selectedLanguage: string = 'en';

  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    this.selectedLanguage = this.translationService.getCurrentLanguage();
  }

  setLanguage(lang: string): void {
    this.selectedLanguage = lang;
    this.translationService.setLanguage(lang);
  }
}
