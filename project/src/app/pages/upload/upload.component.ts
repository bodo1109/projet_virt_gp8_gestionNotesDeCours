import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NoteService } from '../../services/note.service';
import { SubjectService } from '../../services/subject.service';
import { Subject } from '../../models/subject.model';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="upload-page">
      <header class="page-header">
        <h1>Upload Note</h1>
      </header>
      
      <div class="upload-container">
        <form [formGroup]="uploadForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="title">Title</label>
            <input
              type="text"
              id="title"
              formControlName="title"
              placeholder="Enter note title"
            >
            <div class="error-message" *ngIf="hasError('title')">
              Title is required
            </div>
          </div>
          
          <div class="form-group">
            <label for="subject">Subject</label>
            <select id="subject" formControlName="subjectId">
              <option value="">Select a subject</option>
              <option *ngFor="let subject of subjects" [value]="subject.id">
                {{ subject.name }}
              </option>
            </select>
            <div class="error-message" *ngIf="hasError('subjectId')">
              Subject is required
            </div>
          </div>
          
          <div class="form-group">
            <label for="tags">Tags (comma separated)</label>
            <input
              type="text"
              id="tags"
              formControlName="tags"
              placeholder="e.g., lecture, exam, homework"
            >
          </div>
          
          <div class="form-group">
            <label for="file">File (PDF or TXT)</label>
            <div class="file-upload">
              <input
                type="file"
                id="file"
                (change)="onFileSelected($event)"
                accept=".pdf,.txt"
              >
              <div class="file-preview" *ngIf="selectedFile">
                <span>{{ selectedFile.name }}</span>
                <span>({{ formatFileSize(selectedFile.size) }})</span>
              </div>
            </div>
            <div class="error-message" *ngIf="fileError">
              {{ fileError }}
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" class="cancel-btn" (click)="cancel()">Cancel</button>
            <button 
              type="submit" 
              class="submit-btn" 
              [disabled]="uploadForm.invalid || !selectedFile || isUploading"
            >
              <span *ngIf="!isUploading">Upload Note</span>
              <span *ngIf="isUploading">Uploading...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .upload-page {
      max-width: 800px;
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
    
    .upload-container {
      background-color: var(--card-bg, white);
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 32px;
    }
    
    .form-group {
      margin-bottom: 24px;
    }
    
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: var(--text-color, #374151);
    }
    
    input[type="text"],
    select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--border-color, #D1D5DB);
      border-radius: 4px;
      font-size: 16px;
      transition: border-color 0.2s;
    }
    
    input[type="text"]:focus,
    select:focus {
      border-color: var(--primary-color, #2563EB);
      outline: none;
    }
    
    .file-upload {
      border: 2px dashed var(--border-color, #D1D5DB);
      border-radius: 4px;
      padding: 16px;
      text-align: center;
      transition: border-color 0.2s;
    }
    
    .file-upload:hover {
      border-color: var(--primary-color, #2563EB);
    }
    
    .file-preview {
      margin-top: 12px;
      padding: 8px;
      background-color: var(--light-bg, #F3F4F6);
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
    }
    
    .error-message {
      color: var(--error, #DC2626);
      font-size: 14px;
      margin-top: 4px;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 32px;
    }
    
    button {
      padding: 10px 20px;
      border-radius: 4px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: background-color 0.2s;
    }
    
    .cancel-btn {
      background-color: var(--light-bg, #F3F4F6);
      color: var(--text-color, #374151);
    }
    
    .cancel-btn:hover {
      background-color: var(--border-color, #D1D5DB);
    }
    
    .submit-btn {
      background-color: var(--primary-color, #2563EB);
      color: white;
    }
    
    .submit-btn:hover:not(:disabled) {
      background-color: var(--primary-dark, #1D4ED8);
    }
    
    .submit-btn:disabled {
      background-color: var(--disabled, #9CA3AF);
      cursor: not-allowed;
    }
  `]
})
export class UploadComponent implements OnInit {
  uploadForm: FormGroup;
  subjects: Subject[] = [];
  selectedFile: File | null = null;
  fileError: string | null = null;
  isUploading = false;
  uploadProgress = 0;
  
  // Types de fichiers autorisés
  readonly allowedFileTypes = ['application/pdf', 'text/plain'];
  readonly maxFileSize = 10 * 1024 * 1024; // 10MB

  constructor(
    private fb: FormBuilder,
    private noteService: NoteService,
    private subjectService: SubjectService,
    private router: Router
  ) {
    this.uploadForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      subjectId: ['', Validators.required],
      tags: [''],
      isShared: [false]
    });
  }
  
  ngOnInit(): void {
    this.loadSubjects();
  }
  
  private loadSubjects(): void {
    this.subjectService.getSubjects().subscribe({
      next: (subjects) => this.subjects = subjects,
      error: (err) => console.error('Failed to load subjects:', err)
    });
  }
  
  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    this.fileError = null;
    this.selectedFile = null;

    if (fileInput.files?.length) {
      const file = fileInput.files[0];
      
      // Validation du type de fichier
      if (!this.allowedFileTypes.includes(file.type)) {
        this.fileError = 'Seuls les fichiers PDF et TXT sont autorisés';
        return;
      }
      
      // Validation de la taille du fichier
      if (file.size > this.maxFileSize) {
        this.fileError = `La taille du fichier ne doit pas dépasser ${this.formatFileSize(this.maxFileSize)}`;
        return;
      }
      
      this.selectedFile = file;
    }
  }
  
  getFileType(file: File): 'pdf' | 'txt' {
    return file.type === 'application/pdf' ? 'pdf' : 'txt';
  }
  
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    // Correction: On convertit d'abord en nombre, puis on formate la chaîne
    const sizeValue = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
    return `${sizeValue} ${sizes[i]}`;
  }


  onSubmit(): void {
    if (this.uploadForm.invalid || !this.selectedFile) {
      return;
    }
    
    this.isUploading = true;
    
    const formValue = this.uploadForm.value;
    const tagsList = formValue.tags
      ? formValue.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
      : [];
    
    const subjectName = this.subjects.find(s => s.id === formValue.subjectId)?.name || '';
    
    const noteData = {
      title: formValue.title,
      subjectId: formValue.subjectId,
      subjectName: subjectName,
      fileType: this.getFileType(this.selectedFile),
      fileName: this.selectedFile.name,
      fileSize: this.selectedFile.size,
      tags: tagsList,
      isShared: false
    };
    
    this.noteService.uploadNote(noteData, this.selectedFile).subscribe({
      next: (note) => {
        this.isUploading = false;
        this.router.navigate(['/note', note.id]);
      },
      error: (error) => {
        console.error('Error uploading note:', error);
        this.isUploading = false;
        // In a real app, show an error message to the user
      }
    });
  }
  
  private processTags(tagsInput: string): string[] {
    return tagsInput 
      ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag)
      : [];
  }
  
  private getSubjectName(subjectId: string): string {
    return this.subjects.find(s => s.id === subjectId)?.name || '';
  }
  
  private markFormAsTouched(): void {
    Object.values(this.uploadForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }
  
  cancel(): void {
    if (this.uploadForm.dirty) {
      if (confirm('Voulez-vous vraiment annuler ? Les modifications seront perdues.')) {
        this.router.navigate(['/dashboard']);
      }
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  hasError(controlName: string): boolean {
    const control = this.uploadForm.get(controlName);
    return !!(
      control && 
      control.invalid && 
      (control.dirty || control.touched)
    );
  }

}