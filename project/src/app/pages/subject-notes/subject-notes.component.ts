import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NoteService } from '../../services/note.service';
import { SubjectService } from '../../services/subject.service';
import { Note } from '../../models/note.model';
import { Subject } from '../../models/subject.model';
import { NoteCardComponent } from '../../components/note-card/note-card.component';

@Component({
  selector: 'app-subject-notes',
  standalone: true,
  imports: [CommonModule, NoteCardComponent],
  template: `
    <div class="subject-notes-page">
      <header class="page-header" *ngIf="subject">
        <h1>{{ subject.name }}</h1>
        <p class="note-count">{{ notes.length }} note{{ notes.length !== 1 ? 's' : '' }}</p>
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
          <p>No notes found for this subject.</p>
          <button routerLink="/upload" class="upload-btn">Add First Note</button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .subject-notes-page {
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
      margin-bottom: 8px;
    }
    
    .note-count {
      color: var(--text-secondary, #6B7280);
      font-size: 16px;
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
export class SubjectNotesComponent implements OnInit {
  notes: Note[] = [];
  subject: Subject | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private noteService: NoteService,
    private subjectService: SubjectService
  ) {}
  
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const subjectId = params['id'];
      if (subjectId) {
        this.loadSubject(subjectId);
        this.loadNotes(subjectId);
      }
    });
  }
  
  private loadSubject(id: string): void {
    this.subjectService.getSubject(id).subscribe(subject => {
      this.subject = subject;
    });
  }
  
  private loadNotes(subjectId: string): void {
    this.noteService.getNotesBySubject(subjectId).subscribe(notes => {
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