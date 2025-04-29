import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NoteService } from '../../services/note.service';
import { Note } from '../../models/note.model';
import { PdfViewerComponent } from "../../components/pdf-viewer/pdf-viewer.component"; 
import { firstValueFrom } from 'rxjs';
import { PdfViewerService } from '../../services/pdf-viewer.service';
import { Observable } from 'rxjs';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { finalize } from 'rxjs/operators';


@Component({
  selector: 'app-note-details',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfViewerModule],
  template: `<ng-container *ngIf="note; else loadingTemplate">
  <div class="note-details-page">
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
      <!-- Contenu principal -->
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
          <a class="download-btn" [href]="fileUrl" target="_blank">Download</a>
        </div>

        <div class="preview-container">
          <!-- Affichage du contenu du fichier texte -->
          <div *ngIf="note.fileType === 'txt'" class="text-viewer">
            <h3>Contenu du fichier :</h3>
            <pre>{{ textContent }}</pre>
          </div>

          <!-- Affichage du fichier PDF -->
          <pdf-viewer 
            *ngIf="note.fileType === 'pdf'" 
            [src]="fileUrl" 
            [render-text]="true"
            class="pdf-viewer"
          ></pdf-viewer>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="note-sidebar" *ngIf="isSharing">
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
      [class.valid]="isValidEmail()"
      [class.error]="shareEmail && !isValidEmail()" 
    >
    <div class="validation-feedback" *ngIf="shareEmail">
      <span *ngIf="isValidEmail()" class="valid">✓ Valid email</span>
      <span *ngIf="!isValidEmail()" class="invalid">Please enter a valid email</span>
    </div>
    
    <button 
      class="share-btn" 
      [disabled]="!isValidEmail()"
      (click)="shareNote()"
    >
      Share
    </button>
  
  </div>

  

  <ng-container *ngIf="note; else noNote">
    <div class="shared-with" *ngIf="note.isShared && note.sharedWith && note.sharedWith.length > 0">
      <h4>Shared with:</h4>
      <ul>
        <li *ngFor="let email of note.sharedWith">{{ email }}
        <span class="shared-icon">✓</span>
        </li>
      </ul>
    </div>
  </ng-container>

  <ng-template #noNote>
    <p class="error">No note selected</p>
  </ng-template>
</div>
        </div>
      </div>
    </div>
  
</ng-container>

<ng-template #loadingTemplate>
  <div class="loading-state">
    <p>Loading note...</p>
  </div>
</ng-template>
  `,
  styles: [`
    .note-details-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Dans les styles du composant */
.error {
  border-color: #ff4444 !important;
}

/* Styles de validation */
.valid {
  border-color: #4CAF50 !important;
}

.invalid {
  border-color: #f44336 !important;
}

.validation-feedback {
  margin: 5px 0;
  font-size: 14px;
}

.validation-feedback .valid {
  color: #4CAF50;
}

.validation-feedback .invalid {
  color: #f44336;
}

/* Icône de partage réussi */
.shared-icon {
  color: #4CAF50;
  margin-left: 8px;
}

/* Bouton disabled */
.share-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #ff4444;
  font-size: 12px;
  margin-top: 4px;
}

.debug-info {
  background: black;
  padding: 10px;
  margin-top: 15px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
}

.debug-info p {
  margin: 5px 0;
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

/* Nouvelle organisation du contenu principal */
.note-content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px; /* Contenu principal + sidebar fixe */
  gap: 30px;
  align-items: start;
}

.file-preview {
  background-color: var(--card-bg, white);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  grid-column: 1;
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
  text-decoration: none;
  display: inline-block;
}

.download-btn:hover {
  background-color: var(--primary-dark, #1D4ED8);
}

.preview-container {
  padding: 24px;
  min-height: 400px;
}

/* Sidebar repositionnée */
.note-sidebar {
  grid-column: 2;
  position: sticky;
  top: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: fit-content;
}

.sidebar-section {
  background-color: var(--card-bg, white);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.sidebar-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--title-color, #1F2937);
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
  gap: 12px;
  margin-bottom: 16px;
}

.share-form input {
  padding: 10px 12px;
  border: 1px solid var(--border-color, #D1D5DB);
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
}

.share-btn {
  padding: 10px 16px;
  border-radius: 4px;
  background-color: var(--primary-color, #2563EB);
  color: white;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.share-btn:hover:not(:disabled) {
  background-color: var(--primary-dark, #1D4ED8);
}

.share-btn:disabled {
  background-color: var(--gray-400);
  cursor: not-allowed;
  opacity: 0.7;
}

.shared-with {
  margin-top: 16px;
}

.shared-with h4 {
  font-size: 14px;
  margin-bottom: 8px;
  color: var(--text-primary, #374151);
}

.shared-with ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.shared-with li {
  padding: 4px 0;
  font-size: 14px;
  color: var(--text-secondary, #6B7280);
}

/* Contenu texte/PDF */
.text-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: monospace;
  background-color: var(--gray-50, #f5f5f5);
  padding: 15px;
  border-radius: 4px;
  max-height: 600px;
  overflow-y: auto;
}

.text-viewer {
  padding: 16px;
  background: var(--card-bg, white);
  border-radius: 4px;
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  overflow-x: auto;
  border: 1px solid var(--border-color, #E5E7EB);
}

.pdf-viewer {
  width: 100%;
  height: 600px;
  border: 1px solid var(--border-color, #E5E7EB);
  border-radius: 4px;
}

/* États */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  background-color: var(--card-bg, white);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .note-content {
    grid-template-columns: 1fr;
  }
  
  .note-sidebar {
    position: static;
    grid-column: 1;
    margin-top: 30px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
    margin-top: 10px;
  }
}
  `]
})
export class NoteDetailsComponent implements OnInit {
  note: Note | null = null;
  isSharing = false;
  shareEmail = '';
  textContent: string = ''; 
  isLoading = false;
  error = '';
  pdfUrl : string = '';
  pdfTextContent: string = '';
   fileUrl: string = '';
   senderEmail: string = '';
   debug = true;
   isSending = false;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private noteService: NoteService,
    private pdfViewerService: PdfViewerService
  ) {}
  ngOnInit(): void {
    this.loadNote();
  }



  onEmailInput() {
    console.log('Email input:', this.shareEmail);
    console.log('Is valid:', this.isValidEmail());
  }

  // Méthode principale pour charger la note
  async loadNote(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
  
    try {
      // 1. Essayer de charger depuis la base de données
      this.note = await firstValueFrom(this.noteService.getNoteById(id));
  
      // 2. Si non trouvé, chercher dans les notes mockées
      if (!this.note) {
        const mockNotes = await firstValueFrom(this.noteService.getNotes());
        this.note = mockNotes.find(n => n.id === id) || null;
      }
  
      if (this.note) {
        // Traitement commun pour les notes (mockées ou réelles)
        this.fileUrl = this.noteService.getFileUrl(this.note.fileKey);
        
        // Convertir la date si nécessaire (pour les mock data)
        if (typeof this.note.uploadDate === 'string') {
          this.note.uploadDate = new Date(this.note.uploadDate);
        }
  
        // Charger le contenu selon le type
        if (this.note.fileType === 'txt') {
          this.textContent = this.note.content || await this.loadTextContent();
        }
      } else {
        console.error('Note not found with id:', id);
      }
    } catch (error) {
      console.error('Error loading note:', error);
      // Option: Charger les données mockées en fallback
      this.loadMockNote(id);
    }
  }
  
  private async loadMockNote(id: string): Promise<void> {
    try {
      const mockNotes = await firstValueFrom(this.noteService.getNotes());
      this.note = mockNotes.find(n => n.id === id) || null;
      
      if (this.note) {
        // Assurer que les champs obligatoires existent
        this.note = {
          ...this.note,
          fileKey: this.note.fileKey || `notes/${id}/${this.note.fileName}`,
          uploadDate: this.note.uploadDate ? new Date(this.note.uploadDate) : new Date(),
          content: this.note.content || 'Contenu mocké non disponible'
        };
        this.fileUrl = this.noteService.getFileUrl(this.note.fileKey);
      }
    } catch (error) {
      console.error('Failed to load mock note:', error);
    }
  }

  async loadContent() {
    if (!this.note) return;
  
    if (this.note.fileType === 'pdf') {
      try {
        const pdfUrl = this.getFileUrl(this.note.fileKey);
        this.pdfTextContent = await this.pdfViewerService.extractTextFromPdf(pdfUrl);
      } catch (error) {
        console.error('Failed to extract PDF text:', error);
        this.pdfTextContent = 'Could not load PDF content';
      }
    } 
    else if (this.note.fileType === 'txt') {
      this.textContent = await this.loadTextContent();
    }
  }

  getFileUrl(fileKey: string): string {
    // Supprimez le slash initial si présent
    const cleanKey = fileKey.startsWith('/') ? fileKey.slice(1) : fileKey;
    return `http://localhost:4566/student-notes-bucket/${cleanKey}`;
  }

  // // Méthode pour générer l'URL du fichier
  // getFileUrl(): string {
  //   const baseUrl = 'https://<bucket-name>.s3.<region>.amazonaws.com/'; // Remplace par ton URL S3
  //   return `${baseUrl}${this.note?.fileKey}`;
  // }

  getSubjectColor(): string {
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
    if (!this.shareEmail) return false;
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(this.shareEmail);
  }


  shareNote(): void {
  if (!this.note || !this.isValidEmail()) return;

  this.isSending = true;
  
  this.noteService.shareNoteWithEmail(this.note, this.shareEmail)
    .pipe(
      finalize(() => this.isSending = false)
    )
    .subscribe({
      next: (success) => {
        if (success) {
          // Mise à jour optimiste de l'interface
          if (!this.note!.sharedWith) {
            this.note!.sharedWith = [];
          }
          this.note!.sharedWith.push(this.shareEmail);
          this.note!.isShared = true;
          this.shareEmail = '';
          
          // Feedback utilisateur
          alert('Note partagée avec succès !');
        } else {
          alert("Échec de l'envoi. Veuillez réessayer.");
        }
      },
      error: (err) => {
        console.error('Erreur:', err);
        alert("Une erreur s'est produite. Voir la console.");
      }
    });
}

  async getTextContent(): Promise<void> {
    if (this.note?.fileType !== 'txt') {
      this.textContent = '';
      return;
    }
    
    try {
      this.textContent = await this.loadTextContent();
    } catch (error) {
      console.error('Error loading text content:', error);
      this.textContent = 'Error loading content';
    }
  }
  
  // Méthode pour charger le contenu d'un fichier texte
  private async loadTextContent(): Promise<string> {
    try {
      const response = await fetch(this.fileUrl);
      if (response.ok) {
        const text = await response.text();
        return text;
      } else {
        throw new Error('Erreur lors du chargement du texte.');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du contenu du fichier:', error);
      return '';
    }
  }

  downloadFile(): void {
    if (!this.note?.fileKey) return;
  
    const fileUrl = this.getFileUrl(this.note.fileKey); // Passez fileKey en paramètre
    console.log('Downloading from:', fileUrl);
    
    window.open(fileUrl, '_blank');
  }

  
  confirmDelete(): void {
    if (!this.note) return;
  
    const confirmed = confirm('Are you sure you want to delete this note?');
    if (!confirmed) return;
  
    this.noteService.deleteNote(this.note).subscribe(
      (success) => {
        if (success) {
          this.router.navigate(['/all-notes']);
        } else {
          alert('Failed to delete the note. Please try again.');
        }
      },
      (error) => {
        console.error('Error during deletion:', error);
        alert('An error occurred while deleting the note.');
      }
    );
  }
  

  ngOnDestroy() {
    this.noteService.cancelAllRequests();
  }
}