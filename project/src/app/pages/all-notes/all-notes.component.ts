import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoteService } from '../../services/note.service';
import { SubjectService } from '../../services/subject.service';
import { Note } from '../../models/note.model';
import { Subject } from '../../models/subject.model';
import { NoteCardComponent } from '../../components/note-card/note-card.component';

@Component({
  selector: 'app-all-notes',
  standalone: true,
  imports: [CommonModule, FormsModule, NoteCardComponent],
  template: `
    <div class="all-notes-page">
      <header class="page-header">
        <h1>All Notes</h1>
      </header>
      
      <div class="filters">
        <div class="filter-group">
          <label for="subject-filter">Filter by Subject:</label>
          <select 
            id="subject-filter" 
            [(ngModel)]="subjectFilter"
            (change)="applyFilters()"
          >
            <option value="">All Subjects</option>
            <option *ngFor="let subject of subjects" [value]="subject.id">
              {{ subject.name }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="type-filter">Filter by Type:</label>
          <select 
            id="type-filter" 
            [(ngModel)]="typeFilter"
            (change)="applyFilters()"
          >
            <option value="">All Types</option>
            <option value="pdf">PDF</option>
            <option value="txt">TXT</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="sort-by">Sort by:</label>
          <select 
            id="sort-by" 
            [(ngModel)]="sortBy"
            (change)="applyFilters()"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title A-Z</option>
          </select>
        </div>
      </div>
      
      <div class="notes-list" *ngIf="filteredNotes.length > 0; else noNotes">
        <app-note-card 
          *ngFor="let note of filteredNotes" 
          [note]="note"
          (onShare)="shareNote($event)"
          (onDelete)="deleteNote($event)"
        ></app-note-card>
      </div>
      
      <ng-template #noNotes>
        <div class="empty-state">
          <p *ngIf="notes.length === 0">You haven't uploaded any notes yet.</p>
          <p *ngIf="notes.length > 0">No notes match your current filters.</p>
          <button routerLink="/upload" *ngIf="notes.length === 0" class="upload-btn">
            Upload Your First Note
          </button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .all-notes-page {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .page-header {
      margin-bottom: 24px;
    }
    
    .page-header h1 {
      font-size: 28px;
      font-weight: 700;
      color: var(--title-color, #1F2937);
    }
    
    .filters {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 24px;
      padding: 16px;
      background-color: var(--card-bg, white);
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    .filter-group {
      display: flex;
      flex-direction: column;
      min-width: 200px;
    }
    
    .filter-group label {
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-secondary, #6B7280);
    }
    
    .filter-group select {
      padding: 8px 12px;
      border: 1px solid var(--border-color, #D1D5DB);
      border-radius: 4px;
      font-size: 14px;
    }
    
    .notes-list {
      margin-bottom: 32px;
    }
    
    .empty-state {
      background-color: var(--card-bg, white);
      border-radius: 8px;
      padding: 32px;
      text-align: center;
      margin-bottom: 32px;
    }
    
    .empty-state p {
      margin-bottom: 16px;
      color: var(--text-secondary, #6B7280);
    }
    
    .upload-btn {
      background-color: var(--primary-color, #2563EB);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
    }
    
    @media (max-width: 768px) {
      .filters {
        flex-direction: column;
        gap: 12px;
      }
      
      .filter-group {
        width: 100%;
      }
    }
  `]
})
export class AllNotesComponent implements OnInit {
  notes: Note[] = [];
  filteredNotes: Note[] = [];
  subjects: Subject[] = [];
  
  // Filter states
  subjectFilter: string = '';
  typeFilter: string = '';
  sortBy: string = 'newest';
  
  constructor(
    private noteService: NoteService,
    private subjectService: SubjectService
  ) {}
  
  ngOnInit(): void {
    this.loadNotes();
    this.loadSubjects();
  }
  
  private loadNotes(): void {
    this.noteService.getNotes().subscribe(notes => {
      this.notes = notes;
      this.applyFilters();
    });
  }
  
  private loadSubjects(): void {
    this.subjectService.getSubjects().subscribe(subjects => {
      this.subjects = subjects;
    });
  }
  
  applyFilters(): void {
    let filtered = [...this.notes];
    
    // Apply subject filter
    if (this.subjectFilter) {
      filtered = filtered.filter(note => note.subjectId === this.subjectFilter);
    }
    
    // Apply type filter
    if (this.typeFilter) {
      filtered = filtered.filter(note => note.fileType === this.typeFilter);
    }
    
    // Apply sorting
    switch (this.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime());
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
    
    this.filteredNotes = filtered;
  }
  
  shareNote(note: Note): void {
    // In a real app, this would open a share dialog
    console.log('Share note:', note);
  }
  
  deleteNote(note: Note): void {
    // In a real app, this would show a confirmation dialog first
    this.noteService.deleteNote(note.id).subscribe(success => {
      if (success) {
        this.notes = this.notes.filter(n => n.id !== note.id);
        this.applyFilters();
      }
    });
  }
}