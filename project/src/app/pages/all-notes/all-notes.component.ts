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
  
  ngOnInit() {
    this.loadNotes();
    this.loadSubjects();
  }
  
  
   
  
  loadNotes() {
    this.noteService.getNotes().subscribe(
      (rawNotes: any[]) => {
        console.log('Raw notes from API:', rawNotes);
        
        this.notes = rawNotes.map(note => ({
          ...note,
          // Assure que uploadDate est un objet Date
          uploadDate: note.uploadDate ? new Date(note.uploadDate) : new Date(),
          // Ajoute subjectName si nécessaire
          subjectName: this.getSubjectName(note.subjectId)
        }));
        
        console.log('Processed notes:', this.notes);
        this.applyFilters(); // Applique les filtres après la récupération
      },
      error => {
        console.error('Failed to load notes:', error);
      }
    );
  }

  private getSubjectName(subjectId: string): string {
    const subject = this.subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  }
  
  private loadSubjects(): void {
    this.subjectService.getSubjects().subscribe(subjects => {
      this.subjects = subjects;
      // Recharge les notes si les sujets sont chargés après
      if (this.notes.length > 0) {
        this.notes = this.notes.map(note => ({
          ...note,
          subjectName: this.getSubjectName(note.subjectId)
        }));
        this.applyFilters();
      }
    });
  }
  
  applyFilters() {
    console.log('Applying filters:', this.subjectFilter, this.typeFilter, this.sortBy);

    // Filtrage initial - toutes les notes
    this.filteredNotes = [...this.notes];

    // Filtrage par sujet (utilise subjectId au lieu de subjectName)
    if (this.subjectFilter) {
      this.filteredNotes = this.filteredNotes.filter(note => 
        note.subjectId === this.subjectFilter
      );
    }

    // Filtrage par type
    if (this.typeFilter) {
      this.filteredNotes = this.filteredNotes.filter(note => 
        note.fileType === this.typeFilter
      );
    }

    // Tri
    this.filteredNotes.sort((a, b) => {
      if (this.sortBy === 'newest') {
        return b.uploadDate.getTime() - a.uploadDate.getTime();
      } else if (this.sortBy === 'oldest') {
        return a.uploadDate.getTime() - b.uploadDate.getTime();
      } else if (this.sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    console.log('Filtered notes:', this.filteredNotes);
  }
  
  shareNote(note: Note): void {
    // In a real app, this would open a share dialog
    console.log('Share note:', note);
  }
  
  deleteNote(note: Note): void {
    this.noteService.deleteNote(note).subscribe(success => {
      if (success) {
        this.notes = this.notes.filter(n => n.id !== note.id);
        this.applyFilters(); // Applique à nouveau les filtres après la suppression
      }
    });
  }
}
