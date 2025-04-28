import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoteService } from '../../services/note.service';
import { Note } from '../../models/note.model';
import { NoteCardComponent } from '../../components/note-card/note-card.component';

@Component({
  selector: 'app-shared-notes',
  standalone: true,
  imports: [CommonModule, NoteCardComponent],
  template: `
    <div class="shared-notes-page">
      <header class="page-header">
        <h1>Shared Notes</h1>
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
          <p>No shared notes found.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .shared-notes-page {
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
      color: var(--text-secondary, #6B7280);
    }
  `]
})
export class SharedNotesComponent implements OnInit {
  notes: Note[] = [];
  
  constructor(private noteService: NoteService) {}
  
  ngOnInit(): void {
    this.loadSharedNotes();
  }
  
  private loadSharedNotes(): void {
    this.noteService.getSharedNotes().subscribe(notes => {
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