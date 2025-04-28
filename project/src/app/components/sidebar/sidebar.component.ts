import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SubjectService } from '../../services/subject.service';
import { Subject } from '../../models/subject.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar" [class.collapsed]="isCollapsed">
      <button class="toggle-btn" (click)="toggleSidebar()">
        {{ isCollapsed ? '>' : '<' }}
      </button>
      
      <nav class="nav-menu">
        <ul>
          <li>
            <a routerLink="/dashboard" routerLinkActive="active">
              <span class="icon">📊</span>
              <span class="text" *ngIf="!isCollapsed">Dashboard</span>
            </a>
          </li>
          <li>
            <a routerLink="/all-notes" routerLinkActive="active">
              <span class="icon">📝</span>
              <span class="text" *ngIf="!isCollapsed">All Notes</span>
            </a>
          </li>
          <li>
            <a routerLink="/recent" routerLinkActive="active">
              <span class="icon">🕒</span>
              <span class="text" *ngIf="!isCollapsed">Recent</span>
            </a>
          </li>
          <li>
            <a routerLink="/shared" routerLinkActive="active">
              <span class="icon">🔄</span>
              <span class="text" *ngIf="!isCollapsed">Shared Notes</span>
            </a>
          </li>
        </ul>
      </nav>
      
      <div class="subjects-section">
        <div class="section-header" (click)="toggleSubjects()" *ngIf="!isCollapsed">
          <h3>Subjects</h3>
          <span>{{ showSubjects ? '▼' : '▶' }}</span>
        </div>
        
        <ul class="subjects-list" *ngIf="showSubjects && !isCollapsed">
          <li *ngFor="let subject of subjects">
            <a [routerLink]="['/subject', subject.id]" routerLinkActive="active">
              {{ subject.name }}
            </a>
          </li>
          <li>
            <a routerLink="/subjects/manage" class="manage-link">
              Manage Subjects
            </a>
          </li>
        </ul>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 240px;
      background-color: var(--sidebar-bg, #f5f7fa);
      border-right: 1px solid var(--border-color, #e2e8f0);
      height: 100%;
      transition: width 0.3s ease;
      position: relative;
      overflow-y: auto;
    }
    
    .sidebar.collapsed {
      width: 60px;
    }
    
    .toggle-btn {
      position: absolute;
      top: 16px;
      right: 8px;
      background: var(--background-color, white);
      border: 1px solid var(--border-color, #e2e8f0);
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10;
    }
    
    .nav-menu {
      padding: 16px 0;
    }
    
    .nav-menu ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .nav-menu li {
      margin-bottom: 4px;
    }
    
    .nav-menu a {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      color: var(--text-color, #4b5563);
      text-decoration: none;
      transition: background-color 0.2s;
    }
    
    .nav-menu a:hover {
      background-color: var(--hover-color, rgba(0, 0, 0, 0.05));
    }
    
    .nav-menu a.active {
      background-color: var(--active-color, rgba(37, 99, 235, 0.1));
      color: var(--primary-color, #2563EB);
      font-weight: 500;
    }
    
    .icon {
      margin-right: 12px;
      font-size: 18px;
    }
    
    .subjects-section {
      padding: 0 16px 16px;
    }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      margin: 8px 0;
    }
    
    .section-header h3 {
      font-size: 16px;
      margin: 0;
      color: var(--text-color, #4b5563);
    }
    
    .subjects-list {
      list-style: none;
      padding: 0 0 0 8px;
      margin: 0;
    }
    
    .subjects-list li {
      margin-bottom: 4px;
    }
    
    .subjects-list a {
      display: block;
      padding: 8px 8px;
      color: var(--text-color, #4b5563);
      text-decoration: none;
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    
    .subjects-list a:hover {
      background-color: var(--hover-color, rgba(0, 0, 0, 0.05));
    }
    
    .subjects-list a.active {
      background-color: var(--active-color, rgba(37, 99, 235, 0.1));
      color: var(--primary-color, #2563EB);
    }
    
    .manage-link {
      color: var(--primary-color, #2563EB) !important;
      font-size: 14px;
      margin-top: 8px;
    }
    
    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        z-index: 1000;
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
      }
    }
  `]
})
export class SidebarComponent implements OnInit {
  isCollapsed = false;
  showSubjects = true;
  subjects: Subject[] = [];
  
  constructor(private subjectService: SubjectService) {}
  
  ngOnInit(): void {
    this.loadSubjects();
  }
  
  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }
  
  toggleSubjects(): void {
    this.showSubjects = !this.showSubjects;
  }
  
  private loadSubjects(): void {
    this.subjectService.getSubjects().subscribe(
      (subjects) => {
        this.subjects = subjects;
      },
      (error) => {
        console.error('Error loading subjects:', error);
      }
    );
  }
}