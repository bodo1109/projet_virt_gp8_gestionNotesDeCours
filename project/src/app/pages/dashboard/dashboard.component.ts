import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NoteService } from '../../services/note.service';
import { SubjectService } from '../../services/subject.service';
import { Note } from '../../models/note.model';
import { Subject } from '../../models/subject.model';
import { NoteCardComponent } from '../../components/note-card/note-card.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NoteCardComponent],
  template: `
   <div class="dashboard">
  <header class="page-header">
    <h1>Dashboard</h1>
  </header>

  <section class="stats-section">
    <div class="stat-card">
      <div class="stat-value">{{ totalNotes }}</div>
      <div class="stat-label">Total Notes</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">{{ subjects.length }}</div>
      <div class="stat-label">Subjects</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">{{ sharedNotes }}</div>
      <div class="stat-label">Shared Notes</div>
    </div>
  </section>

  <section class="recent-notes">
    <div class="section-header">
      <h2>Recent Notes</h2>
      <a routerLink="/all-notes" class="view-all">View All</a>
    </div>

    <div class="notes-list" *ngIf="recentNotes.length > 0; else noNotes">
      <app-note-card 
        *ngFor="let note of recentNotes; trackBy: trackByNoteId"  
        [note]="note"
        (onShare)="shareNote($event)"
        (onDelete)="deleteNote($event)"
      ></app-note-card>
    </div>

    <ng-template #noNotes>
      <div class="empty-state">
        <p>You haven't uploaded any notes yet.</p>
        <button routerLink="/upload" class="upload-btn">Upload Your First Note</button>
      </div>
    </ng-template>
  </section>

  <section class="files-section">
    <div class="section-header">
      <h2>Files in Bucket</h2>
      <a routerLink="/all-files" class="view-all">View All Files</a>
    </div>

    <div class="files-list" *ngIf="files.length > 0; else noFiles">
      <div *ngFor="let file of files" class="file-card">
        <h3>{{ file.key }}</h3>
        <div class="file-size">{{ file.size }} bytes</div>
      </div>
    </div>

    <ng-template #noFiles>
      <div class="empty-state">
        <p>No files found in the bucket.</p>
      </div>
    </ng-template>
  </section>

  <section class="subjects">
    <div class="section-header">
      <h2>Your Subjects</h2>
      <a routerLink="/subjects/manage" class="view-all">Manage</a>
    </div>

    <div class="subject-cards" *ngIf="subjects.length > 0; else noSubjects">
      <div 
        *ngFor="let subject of subjects" 
        class="subject-card"
        [style.background-color]="subject.color + '20'"
        [style.border-left-color]="subject.color"
        [routerLink]="['/subject', subject.id]"
      >
        <h3>{{ subject.name }}</h3>
           </div>
    </div>

    <ng-template #noSubjects>
      <div class="empty-state">
        <p>You haven't created any subjects yet.</p>
        <button routerLink="/subjects/manage" class="create-btn">Create Your First Subject</button>
      </div>
    </ng-template>
  </section>
</div>

  `,
  styles: [`
    .dashboard {
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
    
    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }
    
    .stat-card {
      background-color: var(--card-bg, white);
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
    
    .stat-value {
      font-size: 36px;
      font-weight: 700;
      color: var(--primary-color, #2563EB);
      margin-bottom: 8px;
    }
    
    .stat-label {
      font-size: 16px;
      color: var(--text-secondary, #6B7280);
    }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .section-header h2 {
      font-size: 20px;
      font-weight: 600;
      color: var(--title-color, #1F2937);
      margin: 0;
    }
    
    .view-all {
      color: var(--primary-color, #2563EB);
      text-decoration: none;
      font-weight: 500;
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
    
    .upload-btn, .create-btn {
      background-color: var(--primary-color, #2563EB);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
    }
    
    .subject-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 16px;
    }
    
    .subject-card {
      background-color: var(--card-bg, white);
      border-radius: 8px;
      padding: 16px;
      border-left: 4px solid;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: transform 0.2s;
    }
    
    .subject-card:hover {
      transform: translateY(-2px);
    }
    
    .subject-card h3 {
      margin: 0 0 8px;
      font-size: 18px;
      font-weight: 600;
    }
    
    .note-count {
      font-size: 14px;
      color: var(--text-secondary, #6B7280);
    }
  `]
})


export class DashboardComponent implements OnInit {
  recentNotes: Note[] = [];
  subjects: Subject[] = [];
  totalNotes: number = 0;
  sharedNotes: number = 0;
  files: any[] = [];

  
  constructor(
    private noteService: NoteService,
    private subjectService: SubjectService
  ) {}
  
  ngOnInit(): void {
    this.loadDashboardData();
    this.loadRecentNotes();
    this.loadFiles();
  }
  
  private loadRecentNotes(): void {
    this.noteService.getRecentNotes(3).subscribe(notes => {
      this.recentNotes = notes;
    });
  }
  
  loadFiles() {
    this.noteService.listFilesInBucket().subscribe(files => {
      this.files = files;
    });
  }

  
  
  private loadSubjectsAndStats(): void {
    forkJoin({
      subjects: this.subjectService.getSubjects(),
      notes: this.noteService.getNotes()
    }).subscribe(({ subjects, notes }) => {
      // Ajouter le nombre de notes par matière
      this.subjects = subjects.map(subject => ({
        ...subject,
        noteCount: notes.filter((note:any) => 
          note.subjectId?.toLowerCase() === subject.id?.toLowerCase()
        ).length
      }));
  
      // Statistiques globales
      this.totalNotes = notes.length;
      this.sharedNotes = notes.filter((note:any) => note.isShared).length;
    });
  }
  
  
  

  trackByNoteId(index: number, note: Note): string {
    return note.id;
  }
  
  
  
  
  shareNote(note: Note): void {
    // In a real app, this would open a share dialog
    console.log('Share note:', note);
  }
  
  deleteNote(note: Note): void {
    const confirmed = confirm('Are you sure you want to delete this note?');
    if (!confirmed) return;
  
    this.noteService.deleteNote(note).subscribe(success => {
      if (success) {
        // 1. Mettre à jour la liste des notes récentes
        this.recentNotes = this.recentNotes.filter(n => n.id !== note.id);
        
        // 2. Mettre à jour les statistiques
        this.totalNotes--;
        if (note.isShared) {
          this.sharedNotes--;
        }
        
        // 3. Mettre à jour le compteur de notes pour les sujets si nécessaire
        this.subjects = this.subjects.map(subject => {
          if (subject.id === note.subjectId) {
            return {
              ...subject,
              noteCount: subject.noteCount ? subject.noteCount - 1 : 0
            };
          }
          return subject;
        });
      }
    });
  }
  private loadDashboardData(): void {
    forkJoin({
      notes: this.noteService.getNotes(),
      subjects: this.subjectService.getSubjects()
    }).subscribe({
      next: ({ notes, subjects }) => {
        this.totalNotes = notes.length;
        this.sharedNotes = notes.filter((note : any) => note.isShared).length;
        this.subjects = subjects;
      },
      error: (err) => console.error('Error loading dashboard data:', err)
    });
  }
  
}