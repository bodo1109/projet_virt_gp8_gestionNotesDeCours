import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-note-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
   <div class="note-card">
  <div class="file-icon" [ngClass]="note.fileType">
    {{ note.fileType ? note.fileType.toUpperCase() : 'UNKNOWN' }}
  </div>
  <div class="note-content">
    <h3 class="note-title">{{ note.title }}</h3>
    <p class="subject">
      {{ note.subjectName ? note.subjectName : 'Aucune matière' }}
    </p>
    <div class="meta">
      <span class="file-info">{{ formatFileSize(note.fileSize) }}</span>
      <span class="upload-date">{{ note.uploadDate | date:'mediumDate' }}</span>
    </div>
    <div class="tags" *ngIf="note.tags && note.tags.length > 0">
      <span class="tag" *ngFor="let tag of note.tags">{{ tag }}</span>
    </div>
  </div>
  <div class="actions">
    <button class="view-btn" [routerLink]="['/note', note.id]">View</button>
    <button class="share-btn" *ngIf="!note.isShared" (click)="onShare.emit(note)">Share</button>
    <button class="shared-btn" *ngIf="note.isShared" (click)="onShare.emit(note)">Shared</button>
    <button class="delete-btn" (click)="onDelete.emit(note)">Delete</button>
  </div>
</div>

  `,
  styles: [`
    .note-card {
      display: flex;
      background-color: var(--card-bg, white);
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 16px;
      margin-bottom: 16px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .note-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    .file-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 64px;
      height: 64px;
      border-radius: 8px;
      margin-right: 16px;
      font-weight: bold;
      color: white;
    }
    
    .file-icon.pdf {
      background-color: #DC2626;
    }
    
    .file-icon.txt {
      background-color: #2563EB;
    }
    
    .note-content {
      flex: 1;
    }
    
    .note-title {
      margin: 0 0 4px;
      font-size: 18px;
      font-weight: 600;
      color: var(--title-color, #1F2937);
    }
    
    .subject {
      margin: 0 0 8px;
      font-size: 14px;
      color: var(--primary-color, #2563EB);
    }
    
    .meta {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: var(--text-secondary, #6B7280);
      margin-bottom: 8px;
    }
    
    .tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    
    .tag {
      background-color: var(--tag-bg, #f3f4f6);
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      color: var(--tag-color, #4B5563);
    }
    
    .actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
      justify-content: center;
    }
    
    button {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .view-btn {
      background-color: var(--primary-color, #2563EB);
      color: white;
    }
    
    .view-btn:hover {
      background-color: var(--primary-dark, #1D4ED8);
    }
    
    .share-btn {
      background-color: var(--secondary-color, #0D9488);
      color: white;
    }
    
    .share-btn:hover {
      background-color: var(--secondary-dark, #0F766E);
    }
    
    .shared-btn {
      background-color: var(--accent-color, #7C3AED);
      color: white;
    }
    
    .delete-btn {
      background-color: var(--error-light, #FEE2E2);
      color: var(--error, #DC2626);
    }
    
    .delete-btn:hover {
      background-color: var(--error, #DC2626);
      color: white;
    }
    
    @media (max-width: 640px) {
      .note-card {
        flex-direction: column;
      }
      
      .file-icon {
        margin-right: 0;
        margin-bottom: 12px;
        align-self: flex-start;
      }
      
      .actions {
        flex-direction: row;
        margin-top: 12px;
      }
    }
  `]
})
export class NoteCardComponent {
  @Input() note!: Note;
  @Output() onShare = new EventEmitter<Note>();
  @Output() onDelete = new EventEmitter<Note>();
  
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}