import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SubjectService } from '../../services/subject.service';
import { Subject } from '../../models/subject.model';

@Component({
  selector: 'app-manage-subjects',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="manage-subjects-page">
      <header class="page-header">
        <h1>Manage Subjects</h1>
      </header>
      
      <div class="content-container">
        <div class="subjects-list">
          <h2>Your Subjects</h2>
          
          <div class="subjects" *ngIf="subjects.length > 0; else noSubjects">
            <div 
              *ngFor="let subject of subjects" 
              class="subject-card"
              [style.border-left-color]="subject.color"
            >
              <div class="subject-info">
                <h3>{{ subject.name }}</h3>
                <p>{{ subject.noteCount || 0 }} notes</p>
              </div>
              <div class="subject-actions">
                <button class="edit-btn" (click)="editSubject(subject)">Edit</button>
                <button class="delete-btn" (click)="deleteSubject(subject)">Delete</button>
              </div>
            </div>
          </div>
          
          <ng-template #noSubjects>
            <div class="empty-state">
              <p>No subjects created yet.</p>
            </div>
          </ng-template>
        </div>
        
        <div class="add-subject">
          <h2>{{ editingSubject ? 'Edit Subject' : 'Add New Subject' }}</h2>
          
          <form [formGroup]="subjectForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="name">Subject Name</label>
              <input 
                type="text" 
                id="name" 
                formControlName="name"
                placeholder="Enter subject name"
              >
              <div class="error-message" *ngIf="hasError('name')">
                Subject name is required
              </div>
            </div>
            
            <div class="form-group">
              <label for="color">Color</label>
              <input 
                type="color" 
                id="color" 
                formControlName="color"
              >
            </div>
            
            <div class="form-group">
              <label for="description">Description (Optional)</label>
              <textarea 
                id="description" 
                formControlName="description"
                placeholder="Enter subject description"
                rows="3"
              ></textarea>
            </div>
            
            <div class="form-actions">
              <button 
                type="button" 
                class="cancel-btn" 
                *ngIf="editingSubject"
                (click)="cancelEdit()"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="submit-btn"
                [disabled]="subjectForm.invalid"
              >
                {{ editingSubject ? 'Update Subject' : 'Add Subject' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .manage-subjects-page {
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
    
    .content-container {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 32px;
    }
    
    h2 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 16px;
      color: var(--title-color, #1F2937);
    }
    
    .subjects {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .subject-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: var(--card-bg, white);
      border-radius: 8px;
      padding: 16px;
      border-left: 4px solid;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .subject-info h3 {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 4px;
    }
    
    .subject-info p {
      color: var(--text-secondary, #6B7280);
      font-size: 14px;
      margin: 0;
    }
    
    .subject-actions {
      display: flex;
      gap: 8px;
    }
    
    .edit-btn, .delete-btn {
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      border: none;
    }
    
    .edit-btn {
      background-color: var(--primary-color, #2563EB);
      color: white;
    }
    
    .delete-btn {
      background-color: var(--error-light, #FEE2E2);
      color: var(--error, #DC2626);
    }
    
    .add-subject {
      background-color: var(--card-bg, white);
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
    }
    
    input[type="text"],
    textarea {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--border-color, #D1D5DB);
      border-radius: 4px;
      font-size: 14px;
    }
    
    input[type="color"] {
      width: 100%;
      height: 40px;
      padding: 2px;
      border: 1px solid var(--border-color, #D1D5DB);
      border-radius: 4px;
    }
    
    .error-message {
      color: var(--error, #DC2626);
      font-size: 14px;
      margin-top: 4px;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    
    .submit-btn, .cancel-btn {
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border: none;
    }
    
    .submit-btn {
      background-color: var(--primary-color, #2563EB);
      color: white;
    }
    
    .submit-btn:disabled {
      background-color: var(--gray-400);
      cursor: not-allowed;
    }
    
    .cancel-btn {
      background-color: var(--gray-100);
      color: var(--gray-700);
    }
    
    .empty-state {
      background-color: var(--card-bg, white);
      border-radius: 8px;
      padding: 32px;
      text-align: center;
    }
    
    .empty-state p {
      color: var(--text-secondary, #6B7280);
    }
    
    @media (max-width: 768px) {
      .content-container {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ManageSubjectsComponent implements OnInit {
  subjects: Subject[] = [];
  subjectForm: FormGroup;
  editingSubject: Subject | null = null;
  
  constructor(
    private fb: FormBuilder,
    private subjectService: SubjectService
  ) {
    this.subjectForm = this.createForm();
  }
  
  ngOnInit(): void {
    this.loadSubjects();
  }
  
  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      color: ['#2563EB'],
      description: ['']
    });
  }
  
  private loadSubjects(): void {
    this.subjectService.getSubjects().subscribe(subjects => {
      this.subjects = subjects;
    });
  }
  
  hasError(field: string): boolean {
    const control = this.subjectForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
  
  editSubject(subject: Subject): void {
    this.editingSubject = subject;
    this.subjectForm.patchValue({
      name: subject.name,
      color: subject.color || '#2563EB',
      description: subject.description || ''
    });
  }
  
  cancelEdit(): void {
    this.editingSubject = null;
    this.subjectForm.reset({
      color: '#2563EB'
    });
  }
  
  deleteSubject(subject: Subject): void {
    if (confirm(`Are you sure you want to delete ${subject.name}?`)) {
      this.subjectService.deleteSubject(subject.id).subscribe(success => {
        if (success) {
          this.subjects = this.subjects.filter(s => s.id !== subject.id);
          if (this.editingSubject?.id === subject.id) {
            this.cancelEdit();
          }
        }
      });
    }
  }
  
  onSubmit(): void {
    if (this.subjectForm.invalid) {
      return;
    }
    
    const formValue = this.subjectForm.value;
    
    if (this.editingSubject) {
      const updatedSubject: Subject = {
        ...this.editingSubject,
        ...formValue
      };
      
      this.subjectService.updateSubject(updatedSubject).subscribe(subject => {
        const index = this.subjects.findIndex(s => s.id === subject.id);
        if (index !== -1) {
          this.subjects[index] = subject;
        }
        this.cancelEdit();
      });
    } else {
      this.subjectService.createSubject(formValue).subscribe(subject => {
        this.subjects.push(subject);
        this.subjectForm.reset({
          color: '#2563EB'
        });
      });
    }
  }
}