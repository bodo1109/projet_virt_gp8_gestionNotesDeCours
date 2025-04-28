import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="not-found-page">
      <div class="not-found-container">
        <div class="error-code">404</div>
        <h1>Page Not Found</h1>
        <p>The page you are looking for doesn't exist or has been moved.</p>
        <button routerLink="/dashboard">Go to Dashboard</button>
      </div>
    </div>
  `,
  styles: [`
    .not-found-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 70vh;
    }
    
    .not-found-container {
      text-align: center;
      background-color: var(--card-bg, white);
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 48px;
      max-width: 500px;
      width: 100%;
    }
    
    .error-code {
      font-size: 80px;
      font-weight: 700;
      color: var(--primary-color, #2563EB);
      margin-bottom: 16px;
    }
    
    h1 {
      font-size: 28px;
      margin-bottom: 16px;
    }
    
    p {
      color: var(--text-secondary, #6B7280);
      margin-bottom: 24px;
    }
    
    button {
      background-color: var(--primary-color, #2563EB);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    button:hover {
      background-color: var(--primary-dark, #1D4ED8);
    }
  `]
})
export class NotFoundComponent {}