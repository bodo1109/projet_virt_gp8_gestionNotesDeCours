import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Subject } from '../models/subject.model';
import { catchError, map } from 'rxjs/operators';
import { AwsService } from './aws.service';
import { Note } from '../models/note.model';
import { NoteService } from './note.service';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private MOCK_SUBJECTS: Subject[] = [
    { id: '1', name: 'Mathematics', color: '#2563EB', noteCount: 5 },
    { id: '2', name: 'Physics', color: '#7C3AED', noteCount: 3 },
    { id: '3', name: 'Computer Science', color: '#0D9488', noteCount: 7 },
    { id: '4', name: 'History', color: '#DC2626', noteCount: 2 }
  ];

  constructor(private awsService: AwsService,
    private noteService: NoteService
  ) {}
  
  
   // Fonction pour obtenir tous les sujets (mock + DynamoDB)
   getSubjects(): Observable<Subject[]> {
    return this.awsService.scan({ TableName: 'Subjects' }).pipe(
      map((response) => {
        const dynamoSubjects = (response.Items || []).map((item: any) => ({
          id: item.id.S,
          name: item.name.S,
          color: item.color.S,
        }));

        // Ajouter les sujets mock et les sujets DynamoDB
        return [...this.MOCK_SUBJECTS, ...dynamoSubjects];
      })
    );
  }
  
   // Fonction pour obtenir un sujet par son ID, avec les notes comptées
   getSubject(id: string): Observable<Subject | null> {
    return this.getSubjects().pipe(
      map((subjects) => {
        return subjects.find(subject => subject.id === id) || null;
      })
    );
  }

  
  createSubject(subject: Omit<Subject, 'id'>): Observable<Subject> {
    // Real implementation would create an item in DynamoDB
    const newSubject: Subject = {
      ...subject,
      id: Date.now().toString(), // Generate a temporary ID
      noteCount: 0
    };
    
    // Simulate adding to the list for demo
    this.MOCK_SUBJECTS.push(newSubject);
    
    return of(newSubject);
  }
  
  updateSubject(subject: Subject): Observable<Subject> {
    // Real implementation would update an item in DynamoDB
    const index = this.MOCK_SUBJECTS.findIndex(s => s.id === subject.id);
    if (index !== -1) {
      this.MOCK_SUBJECTS[index] = subject;
    }
    
    return of(subject);
  }
  
  deleteSubject(id: string): Observable<boolean> {
    // Real implementation would delete from DynamoDB
    const initialLength = this.MOCK_SUBJECTS.length;
    this.MOCK_SUBJECTS = this.MOCK_SUBJECTS.filter(s => s.id !== id);
    
    return of(this.MOCK_SUBJECTS.length < initialLength);
  }

  

  getSubjectsWithNoteCounts(notes: Note[]): Observable<Subject[]> {
    return this.getSubjects().pipe(
      map((subjects) => {
        return subjects.map(subject => ({
          ...subject,
          noteCount: notes.filter(note => note.subjectId === subject.id).length,
        }));
      })
    );
  }
}