import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NoteService } from '../../services/note.service';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-note-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="note-details-page" *ngIf="note; else loading">
      <header class="page-header">
        <div class="header-content">
          <h1>{{ note.title }}</h1>
          <div class="subject-badge" [style.background-color]="getSubjectColor()">
            {{ note.subjectName }}
          </div>
        </div>
        <div class="header-actions">
          <button class="action-btn" [class.active]="isSharing" (click)="toggleShareView()">
            <span>{{ isSharing ? 'Close' : 'Share' }}</span>
          </button>
          <button class="action-btn delete" (click)="confirmDelete()">Delete</button>
        </div>
      </header>
      
      <div class="note-content">
        <div class="file-preview">
          <div class="file-header">
            <div class="file-info">
              <div class="file-type" [ngClass]="note.fileType">
                {{ note.fileType.toUpperCase() }}
              </div>
              <div class="file-details">
                <div class="file-name">{{ note.fileName }}</div>
                <div class="file-meta">
                  {{ formatFileSize(note.fileSize) }} • Uploaded {{ note.uploadDate | date }}
                </div>
              </div>
            </div>
            <button class="download-btn" (click)="downloadFile()">Download</button>
          </div>
          
          <div class="preview-container">
            <!-- In a real app, this would show a PDF viewer or text content -->
            <div class="preview-placeholder">
              <p *ngIf="note.fileType === 'pdf'">
                PDF Preview would be displayed here in a real application.
              </p>
              <p *ngIf="note.fileType === 'txt'">
                Text content would be displayed here in a real application.
              </p>
            </div>
          </div>
        </div>
        
        <div class="note-sidebar">
          <div class="sidebar-section">
            <h3>Tags</h3>
            <div class="tags-list" *ngIf="note.tags && note.tags.length > 0">
              <span class="tag" *ngFor="let tag of note.tags">{{ tag }}</span>
            </div>
            <div class="empty-tags" *ngIf="!note.tags || note.tags.length === 0">
              No tags available
            </div>
          </div>
          
          <div class="sidebar-section" *ngIf="isSharing">
            <h3>Share Note</h3>
            <div class="share-form">
              <input 
                type="email" 
                [(ngModel)]="shareEmail" 
                placeholder="Enter email address"
              >
              <button 
                class="share-btn" 
                [disabled]="!isValidEmail()"
                (click)="shareNote()"
              >
                Share
              </button>
            </div>
            
            <div class="shared-with" *ngIf="note.isShared && note.sharedWith && note.sharedWith.length > 0">
              <h4>Shared with:</h4>
              <ul>
                <li *ngFor="let email of note.sharedWith">{{ email }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <ng-template #loading>
      <div class="loading-state">
        <p>Loading note...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .note-details-page {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }
    
    .header-content h1 {
      font-size: 28px;
      font-weight: 700;
      color: var(--title-color, #1F2937);
      margin-bottom: 8px;
    }
    
    .subject-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 16px;
      color: white;
      font-size: 14px;
      font-weight: 500;
    }
    
    .header-actions {
      display: flex;
      gap: 12px;
    }
    
    .action-btn {
      padding: 8px 16px;
      border-radius: 4px;
      border: none;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      background-color: var(--gray-100);
      color: var(--gray-700);
      transition: background-color 0.2s;
    }
    
    .action-btn:hover {
      background-color: var(--gray-200);
    }
    
    .action-btn.active {
      background-color: var(--primary-color);
      color: white;
    }
    
    .action-btn.delete {
      background-color: var(--error-light);
      color: var(--error-color);
    }
    
    .action-btn.delete:hover {
      background-color: var(--error-color);
      color: white;
    }
    
    .note-content {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 24px;
    }
    
    .file-preview {
      background-color: var(--card-bg, white);
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    .file-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid var(--border-color, #E5E7EB);
    }
    
    .file-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .file-type {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 4px;
      color: white;
      font-weight: bold;
    }
    
    .file-type.pdf {
      background-color: #DC2626;
    }
    
    .file-type.txt {
      background-color: #2563EB;
    }
    
    .file-name {
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .file-meta {
      font-size: 14px;
      color: var(--text-secondary, #6B7280);
    }
    
    .download-btn {
      padding: 8px 16px;
      border-radius: 4px;
      background-color: var(--primary-color, #2563EB);
      color: white;
      border: none;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .download-btn:hover {
      background-color: var(--primary-dark, #1D4ED8);
    }
    
    .preview-container {
      padding: 24px;
      min-height: 400px;
    }
    
    .preview-placeholder {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      background-color: var(--gray-100);
      border-radius: 4px;
      padding: 32px;
      color: var(--text-secondary, #6B7280);
    }
    
    .note-sidebar {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    .sidebar-section {
      background-color: var(--card-bg, white);
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 16px;
    }
    
    .sidebar-section h3 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    
    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .tag {
      background-color: var(--tag-bg, #F3F4F6);
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 14px;
    }
    
    .empty-tags {
      color: var(--text-secondary, #6B7280);
      font-style: italic;
    }
    
    .share-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }
    
    .share-form input {
      padding: 8px 12px;
      border: 1px solid var(--border-color, #D1D5DB);
      border-radius: 4px;
      font-size: 14px;
    }
    
    .share-btn {
      padding: 8px 16px;
      border-radius: 4px;
      background-color: var(--primary-color, #2563EB);
      color: white;
      border: none;
      font-weight: 500;
      cursor: pointer;
    }
    
    .share-btn:disabled {
      background-color: var(--gray-400);
      cursor: not-allowed;
    }
    
    .shared-with {
      margin-top: 16px;
    }
    
    .shared-with h4 {
      font-size: 14px;
      margin-bottom: 8px;
    }
    
    .shared-with ul {
      list-style: none;
      padding: 0;
    }
    
    .shared-with li {
      padding: 4px 0;
      font-size: 14px;
    }
    
    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 300px;
      background-color: var(--card-bg, white);
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    @media (max-width: 768px) {
      .note-content {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class NoteDetailsComponent implements OnInit {
  note: Note | null = null;
  isSharing = false;
  shareEmail = '';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private noteService: NoteService
  ) {}
  
  ngOnInit(): void {
    this.loadNote();
  }
  
  private loadNote(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.noteService.getNoteById(id).subscribe(note => {
        this.note = note;
      });
    }
  }
  
  getSubjectColor(): string {
    // This would ideally get the color from the subject service
    // For now, we'll use a default color
    return this.note?.subjectId === '1' ? '#2563EB' :
           this.note?.subjectId === '2' ? '#7C3AED' :
           this.note?.subjectId === '3' ? '#0D9488' :
           this.note?.subjectId === '4' ? '#DC2626' :
           '#6B7280';
  }
  
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  toggleShareView(): void {
    this.isSharing = !this.isSharing;
  }
  
  isValidEmail(): boolean {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(this.shareEmail);
  }
  
  shareNote(): void {
    if (!this.note || !this.isValidEmail()) {
      return;
    }
    
    this.noteService.shareNote(this.note.id, this.shareEmail).subscribe(
      (success) => {
        if (success) {
          // Reload the note to get the updated shared status
          this.loadNote();
          this.shareEmail = '';
        }
      }
    );
  }
  
  downloadFile(): void {
    console.log('Downloading file...');
    // In a real app, this would trigger a file download
    // using a service to get the file from S3
  }
  
  confirmDelete(): void {
    if (!this.note) return;
    
    const confirmDelete = confirm('Are you sure you want to delete this note?');
    if (confirmDelete) {
      this.noteService.deleteNote(this.note.id).subscribe(
        (success) => {
          if (success) {
            this.router.navigate(['/all-notes']);
          }
        }
      );
    }
  }
}