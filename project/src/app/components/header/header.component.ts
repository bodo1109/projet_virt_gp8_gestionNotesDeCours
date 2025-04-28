import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <div class="logo">
        <h1>StudyNotes</h1>
      </div>
      <div class="search-bar">
        <input 
          type="text" 
          placeholder="Search notes..." 
          (keyup.enter)="onSearch($event)"
        >
      </div>
      <div class="actions">
        <button class="upload-btn" (click)="navigateToUpload()">Upload Note</button>
        <button class="theme-toggle" (click)="toggleTheme()">
          <span *ngIf="isDarkTheme">☀️</span>
          <span *ngIf="!isDarkTheme">🌙</span>
        </button>
      </div>
    </header>
  `,
  styles: [`
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      background-color: var(--primary-color, #2563EB);
      color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .logo h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
    }
    
    .search-bar {
      flex: 1;
      max-width: 500px;
      margin: 0 24px;
    }
    
    .search-bar input {
      width: 100%;
      padding: 8px 16px;
      border: none;
      border-radius: 24px;
      font-size: 14px;
    }
    
    .actions {
      display: flex;
      gap: 16px;
    }
    
    .upload-btn {
      padding: 8px 16px;
      background-color: white;
      color: var(--primary-color, #2563EB);
      border: none;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .upload-btn:hover {
      background-color: #f0f0f0;
    }
    
    .theme-toggle {
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
    }
    
    .theme-toggle:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 12px;
        padding: 12px;
      }
      
      .search-bar {
        width: 100%;
        max-width: none;
        margin: 8px 0;
      }
    }
  `]
})
export class HeaderComponent {
  isDarkTheme = false;
  
  constructor(
    private router: Router,
    private themeService: ThemeService
  ) {
    this.themeService.isDarkTheme$.subscribe(isDark => {
      this.isDarkTheme = isDark;
    });
  }
  
  navigateToUpload(): void {
    this.router.navigate(['/upload']);
  }
  
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
  
  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (value.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: value } });
    }
  }
}