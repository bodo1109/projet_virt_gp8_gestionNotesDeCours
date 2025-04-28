import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Note } from '../models/note.model';
import { catchError, map } from 'rxjs/operators';
import { AwsService } from './aws.service';

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private MOCK_NOTES: Note[] = [
    {
      id: '1',
      title: 'Calculus Lecture 1',
      fileName: 'calculus_lecture_1.pdf',
      fileType: 'pdf',
      subjectId: '1',
      subjectName: 'Mathematics',
      fileSize: 2500000,
      uploadDate: new Date('2025-05-01'),
      lastAccessDate: new Date('2025-05-10'),
      tags: ['calculus', 'derivatives'],
      isShared: false,
      fileKey: 'notes/1/calculus_lecture_1.pdf'
    },
    {
      id: '2',
      title: 'Mechanics Notes',
      fileName: 'mechanics_notes.pdf',
      fileType: 'pdf',
      subjectId: '2',
      subjectName: 'Physics',
      fileSize: 1800000,
      uploadDate: new Date('2025-05-03'),
      tags: ['mechanics', 'forces'],
      isShared: true,
      sharedWith: ['friend1@example.com'],
      fileKey: 'notes/2/mechanics_notes.pdf'
    },
    {
      id: '3',
      title: 'Data Structures Summary',
      fileName: 'data_structures.txt',
      fileType: 'txt',
      subjectId: '3',
      subjectName: 'Computer Science',
      fileSize: 150000,
      uploadDate: new Date('2025-05-05'),
      lastAccessDate: new Date('2025-05-12'),
      tags: ['algorithms', 'data structures'],
      isShared: false,
      fileKey: 'notes/3/data_structures.txt'
    }
  ];

  constructor(private awsService: AwsService) {}
  
  getNotes(): Observable<Note[]> {
    // Mock implementation
    return of(this.MOCK_NOTES);
    
    // Real implementation
    // return this.awsService.queryItems({
    //   TableName: 'Notes'
    // }).pipe(
    //   map(response => response.Items as Note[]),
    //   catchError(error => {
    //     console.error('Error fetching notes:', error);
    //     return of([]);
    //   })
    // );
  }
  
  getNotesBySubject(subjectId: string): Observable<Note[]> {
    // Mock implementation
    return of(this.MOCK_NOTES.filter(note => note.subjectId === subjectId));
    
    // Real implementation
    // return this.awsService.queryItems({
    //   TableName: 'Notes',
    //   KeyConditionExpression: 'subjectId = :subjectId',
    //   ExpressionAttributeValues: {
    //     ':subjectId': subjectId
    //   }
    // }).pipe(
    //   map(response => response.Items as Note[]),
    //   catchError(error => {
    //     console.error(`Error fetching notes for subject ${subjectId}:`, error);
    //     return of([]);
    //   })
    // );
  }
  
  getNoteById(id: string): Observable<Note | null> {
    // Mock implementation
    const note = this.MOCK_NOTES.find(n => n.id === id);
    return of(note || null);
    
    // Real implementation
    // return this.awsService.getItem({
    //   TableName: 'Notes',
    //   Key: { id }
    // }).pipe(
    //   map(response => response.Item as Note),
    //   catchError(error => {
    //     console.error(`Error fetching note ${id}:`, error);
    //     return of(null);
    //   })
    // );
  }
  
  getSharedNotes(): Observable<Note[]> {
    // Mock implementation
    return of(this.MOCK_NOTES.filter(note => note.isShared));
    
    // Real implementation would query DynamoDB with appropriate filter
  }
  
  getRecentNotes(limit: number = 5): Observable<Note[]> {
    // Mock implementation - sort by uploadDate descending and take the first 'limit' items
    return of([...this.MOCK_NOTES]
      .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime())
      .slice(0, limit)
    );
    
    // Real implementation would query DynamoDB with appropriate sort and limit
  }
  
  searchNotes(query: string): Observable<Note[]> {
    // Basic mock implementation - search in title and tags
    const lowercaseQuery = query.toLowerCase();
    return of(this.MOCK_NOTES.filter(note => 
      note.title.toLowerCase().includes(lowercaseQuery) || 
      note.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    ));
    
    // Real implementation would use DynamoDB query or Lambda for more advanced search
  }
  
  uploadNote(note: Omit<Note, 'id' | 'uploadDate' | 'fileKey'>, file: File): Observable<Note> {
    // In a real implementation, this would:
    // 1. Upload the file to S3
    // 2. Create a metadata record in DynamoDB
    
    const newNote: Note = {
      ...note,
      id: Date.now().toString(), // Generate a temporary ID
      uploadDate: new Date(),
      fileKey: `notes/${note.subjectId}/${file.name}`,
      fileSize: file.size
    };
    
    // Simulate adding to the list for demo
    this.MOCK_NOTES.push(newNote);
    
    return of(newNote);
  }
  
  shareNote(noteId: string, email: string): Observable<boolean> {
    // Mock implementation
    const noteIndex = this.MOCK_NOTES.findIndex(n => n.id === noteId);
    if (noteIndex === -1) {
      return of(false);
    }
    
    const note = this.MOCK_NOTES[noteIndex];
    note.isShared = true;
    note.sharedWith = note.sharedWith || [];
    if (!note.sharedWith.includes(email)) {
      note.sharedWith.push(email);
    }
    
    this.MOCK_NOTES[noteIndex] = note;
    return of(true);
    
    // Real implementation would update the record in DynamoDB
  }
  
  deleteNote(id: string): Observable<boolean> {
    // Mock implementation
    const initialLength = this.MOCK_NOTES.length;
    this.MOCK_NOTES = this.MOCK_NOTES.filter(n => n.id !== id);
    
    return of(this.MOCK_NOTES.length < initialLength);
    
    // Real implementation would delete the file from S3 and the record from DynamoDB
  }
}