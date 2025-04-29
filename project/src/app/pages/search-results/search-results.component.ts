import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NoteService } from '../../services/note.service';
import { Note } from '../../models/note.model';
import { NoteCardComponent } from '../../components/note-card/note-card.component';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, NoteCardComponent],
  template: `
    <div class="search-results-page">
      <header class="page-header">
        <h1>Search Results: "{{ searchQuery }}"</h1>
      </header>
      
      <div class="results-count">
        Found {{ notes.length }} result{{ notes.length !== 1 ? 's' : '' }}
      </div>
      
      <div class="notes-list" *ngIf="notes.length > 0; else noResults">
        <app-note-card 
          *ngFor="let note of notes" 
          [note]="note"
          (onShare)="shareNote($event)"
          (onDelete)="deleteNote($event)"
        ></app-note-card>
      </div>
      
      <ng-template #noResults>
        <div class="empty-state">
          <p>No results found for "{{ searchQuery }}".</p>
          <p>Try using different keywords or browse all notes.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .search-results-page {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .page-header {
      margin-bottom: 16px;
    }
    
    .page-header h1 {
      font-size: 28px;
      font-weight: 700;
      color: var(--title-color, #1F2937);
    }
    
    .results-count {
      margin-bottom: 24px;
      font-size: 16px;
      color: var(--text-secondary, #6B7280);
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
  `]
})
export class SearchResultsComponent implements OnInit {
  searchQuery: string = '';
  notes: Note[] = [];
  
  constructor(
    private route: ActivatedRoute,
    private noteService: NoteService
  ) {}
  
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      this.searchNotes();
    });
  }
  
  private searchNotes(): void {
    if (this.searchQuery) {
      this.noteService.searchNotes(this.searchQuery).subscribe(notes => {
        this.notes = notes;
      });
    } else {
      this.notes = [];
    }
  }
  
  shareNote(note: Note): void {
    // In a real app, this would open a share dialog
    console.log('Share note:', note);
  }
  
  deleteNote(note: Note): void {
    // In a real app, this would show a confirmation dialog first
    this.noteService.deleteNote(note).subscribe(success => {
      if (success) {
        this.notes = this.notes.filter(n => n.id !== note.id);
      }
    });
  }
}