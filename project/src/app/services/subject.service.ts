import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Subject } from '../models/subject.model';
import { catchError, map } from 'rxjs/operators';
import { AwsService } from './aws.service';

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

  constructor(private awsService: AwsService) {}
  
  getSubjects(): Observable<Subject[]> {
    // For demo purposes, we're returning mock data
    // In a real app, this would fetch from DynamoDB
    return of(this.MOCK_SUBJECTS);
    
    // Real implementation would be:
    // return this.awsService.queryItems({
    //   TableName: 'Subjects',
    // }).pipe(
    //   map(response => response.Items as Subject[]),
    //   catchError(error => {
    //     console.error('Error fetching subjects:', error);
    //     return of([]);
    //   })
    // );
  }
  
  getSubject(id: string): Observable<Subject | null> {
    // Mock implementation
    const subject = this.MOCK_SUBJECTS.find(s => s.id === id);
    return of(subject || null);
    
    // Real implementation
    // return this.awsService.getItem({
    //   TableName: 'Subjects',
    //   Key: { id }
    // }).pipe(
    //   map(response => response.Item as Subject),
    //   catchError(error => {
    //     console.error(`Error fetching subject ${id}:`, error);
    //     return of(null);
    //   })
    // );
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
}