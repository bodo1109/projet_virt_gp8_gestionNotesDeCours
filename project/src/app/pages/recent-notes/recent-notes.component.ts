import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoteService } from '../../services/note.service';
import { Note } from '../../models/note.model';
import { NoteCardComponent } from '../../components/note-card/note-card.component';

@Component({
  selector: 'app-recent-notes',
  standalone: true,
  imports: [CommonModule, NoteCardComponent],
  template: `
    <div class="recent-notes-page">
      <header class="page-header">
        <h1>Recent Notes</h1>
      </header>
      
      <div class="notes-list" *ngIf="notes.length > 0; else noNotes">
        <app-note-card 
          *ngFor="let note of notes" 
          [note]="note"
          (onShare)="shareNote($event)"
          (onDelete)="deleteNote($event)"
        ></app-note-card>
      </div>
      
      <ng-template #noNotes>
        <div class="empty-state">
          <p>No recent notes found.</p>
          <button routerLink="/upload" class="upload-btn">Upload a Note</button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .recent-notes-page {
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
    
    .upload-btn:hover {
      background-color: var(--primary-dark, #1D4ED8);
    }
  `]
})
export class RecentNotesComponent implements OnInit {
  notes: Note[] = [];
  
  constructor(private noteService: NoteService) {}
  
  ngOnInit(): void {
    this.loadRecentNotes();
  }
  
  private loadRecentNotes(): void {
    this.noteService.getRecentNotes(10).subscribe(notes => {
      this.notes = notes;
    });
  }
  
  shareNote(note: Note): void {
    // In a real app, this would open a share dialog
    console.log('Share note:', note);
  }
  
  deleteNote(note: Note): void {
    this.noteService.deleteNote(note.id).subscribe(success => {
      if (success) {
        this.notes = this.notes.filter(n => n.id !== note.id);
      }
    });
  }
}