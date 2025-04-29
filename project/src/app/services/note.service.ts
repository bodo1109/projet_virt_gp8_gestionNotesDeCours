import { Injectable } from '@angular/core';
import { Observable, of, firstValueFrom, from, forkJoin  } from 'rxjs';
import { Note } from '../models/note.model';
import { catchError, delay, map, switchMap, tap } from 'rxjs/operators';
import { AwsService } from './aws.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import emailjs from 'emailjs-com';


@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private readonly BUCKET_NAME = 'student-notes-bucket';
  private readonly LOCALSTACK_ENDPOINT = 'http://localhost:4566';
  
  private readonly EMAILJS_CONFIG = {
    serviceId : 'service_hvhwtgq',
    templateId: 'template_zgjabur',
    userId: 'iHY_Pg5VlxDguqRiz'
};

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
      fileKey: 'notes/1/calculus_lecture_1.pdf',
      content: 'This is a sample calculus lecture covering the basics of derivatives and their applications.'
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
      fileKey: 'notes/2/mechanics_notes.pdf',
      content: 'Introduction to classical mechanics: Newton\'s laws of motion and their applications in everyday physics.'
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
      fileKey: 'notes/3/data_structures.txt',
      content: `Common Data Structures:

1. Arrays
- Fixed size collection
- O(1) access time
- Contiguous memory allocation

2. Linked Lists
- Dynamic size
- O(n) access time
- Non-contiguous memory

3. Trees
- Hierarchical structure
- Binary trees: max 2 children
- BST: ordered nodes

4. Hash Tables
- Key-value pairs
- O(1) average access
- Uses hash function`
    }
  ];

  private bucketUrl = 'http://localhost:4566/student-notes-bucket/';

  constructor(private awsService: AwsService, private http: HttpClient) {
    emailjs.init(this.EMAILJS_CONFIG.userId);
  }
  

  getFileUrl(fileKey: string): string {
    return `http://localhost:4566/student-notes-bucket/${fileKey}`;  }

    listFilesInBucket() {
      return this.http.get(this.bucketUrl, { responseType: 'text' as 'json' }).pipe(
        map((xmlString: any) => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
          const contents = Array.from(xmlDoc.getElementsByTagName('Contents'));
          return contents.map((content: any) => {
            const key = content.getElementsByTagName('Key')[0]?.textContent || '';
            const size = content.getElementsByTagName('Size')[0]?.textContent || '0';
            return { key, size };
          });
        }),
        catchError(error => {
          console.error('Erreur parsing XML :', error);
          return of([]);
        })
      );
    }

    
    // Dans note.service.ts

    shareNoteWithEmail(note: Note, recipientEmail: string): Observable<boolean> {
      return new Observable(subscriber => {
        // Structure des paramètres AVEC vérification
        const templateParams = {
          message: `Titre: ${note.title || 'Pas de titre'} | URL: ${this.getFileUrl(note.fileKey)}`, // Message obligatoire
          to_email: recipientEmail, // Champ technique obligatoire
          from_name: 'NotesApp' // Champ technique obligatoire
        };
    
        console.log('Paramètres vérifiés:', JSON.stringify(templateParams, null, 2));
    
        emailjs.send(
          this.EMAILJS_CONFIG.serviceId,
          this.EMAILJS_CONFIG.templateId,
          templateParams
        ).then(
          (response) => {
            console.log('Email envoyé. Réponse complète:', response);
            subscriber.next(true);
            subscriber.complete();
          },
          (error) => {
            console.error('Erreur technique:', {
              status: error.status,
              text: error.text,
              details: error.response
            });
            subscriber.next(false);
            subscriber.complete();
          }
        );
      });
    }
    
    

    private updateNoteSharedStatus(noteId: string, email: string): Observable<boolean> {
      return this.getNoteById(noteId).pipe(
        switchMap(note => {
          if (!note) return of(false);
          
          const updatedNote = {
            ...note,
            isShared: true,
            sharedWith: [...(note.sharedWith || []), email]
          };
  
          return from(this.awsService.putItem({
            TableName: 'Notes',
            Item: this.convertToDynamoFormat(updatedNote)
          })).pipe(
            map(() => true),
            catchError(error => {
              console.error('Update failed:', error);
              return of(false);
            })
          );
        })
      );
    }
  

    private convertToDynamoFormat(note: Note): any {
      return {
        id: { S: note.id },
        title: { S: note.title },
        fileName: { S: note.fileName },
        fileType: { S: note.fileType },
        subjectId: { S: note.subjectId },
        subjectName: { S: note.subjectName || '' },
        fileSize: { N: note.fileSize.toString() },
        uploadDate: { S: note.uploadDate.toISOString() },
        lastAccessDate: note.lastAccessDate ? { S: note.lastAccessDate.toISOString() } : { NULL: true },
        tags: { L: note.tags?.map(tag => ({ S: tag })) || { L: [] } },
        isShared: { BOOL: note.isShared },
        sharedWith: { L: note.sharedWith?.map(email => ({ S: email })) || { L: [] } },
        fileKey: { S: note.fileKey },
        content: note.content ? { S: note.content } : { NULL: true }
      };
    }
    
    getNotes(): Observable<Note[]> {
      // 1. Récupération des notes réelles depuis DynamoDB
      const realNotes$ = from(this.awsService.scan({ TableName: 'Notes' })).pipe(
        map(response => response.Items ? response.Items.map((item : any)  => this.mapDynamoNote(item)) : []),
        catchError(error => {
          console.error('Error fetching from DynamoDB, using empty array', error);
          return of([]);
        })
      );
    
      // 2. Notes mockées
      const mockNotes$ = of(this.MOCK_NOTES);
    
      // 3. Combine les deux sources
      return forkJoin([realNotes$, mockNotes$]).pipe(
        map(([realNotes, mockNotes]) => {
          // Fusionne et supprime les doublons
          return [...realNotes, ...mockNotes].filter((note, index, self) =>
            index === self.findIndex(n => n.id === note.id)
          );
        })
      );
    }
    
  
  getNotesBySubject(subjectId: string): Observable<Note[]> {
    // Mock implementation
    // return of(this.MOCK_NOTES.filter(note => note.subjectId === subjectId));
    
    // Real implementation
    return this.awsService.queryItems({
      TableName: 'Notes',
      IndexName: 'SubjectIndex', // ← important : on interroge l’index secondaire
      KeyConditionExpression: 'subjectId = :subjectId',
      ExpressionAttributeValues: {
        ':subjectId': subjectId
      }
    }).pipe(
      map(response => response.Items as Note[]),
      catchError(error => {
        console.error(`Error fetching notes for subject ${subjectId}:`, error);
        return of([]);
      })
    );
  }

  async getPresignedUrl(fileKey: string): Promise<string> {
    // Implémentation réelle utiliserait AWS SDK
    return this.getFileUrl(fileKey); // Pour LocalStack, l'URL directe fonctionne
  }
  
  getNoteById(id: string): Observable<Note> {
    return from(this.awsService.getItem({
      TableName: 'Notes',
      Key: { id }
    })).pipe(
      map(response => {
        // Si la note existe, elle sera dans `response.Item`
        return response.Item;
      }),
      catchError(error => {
        console.error('Error fetching note:', error);
        throw error;
      })
    );
  }
  
  
  getSharedNotes(): Observable<Note[]> {
    // Mock implementation
    return of(this.MOCK_NOTES.filter(note => note.isShared));
    
    // Real implementation would query DynamoDB with appropriate filter
  }
 

getRecentNotes(count: number = 3): Observable<Note[]> {
  return this.getNotes().pipe(
    map(notes => {
      return notes
        .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
        .slice(0, count);
    })
  );
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
  
  uploadNote(noteData: Omit<Note, 'id' | 'uploadDate' | 'fileKey'>, file: File): Observable<Note> {
    const id = crypto.randomUUID();
    const fileKey = `notes/${id}/${file.name}`;
    
    const note: Note = {
      ...noteData,
      id,
      uploadDate: new Date(),
      fileKey,
      fileSize: file.size
    };

    // Version à stocker dans DynamoDB avec les dates converties
    const noteToSave = {
      ...note,
      uploadDate: note.uploadDate.toISOString(),
      lastAccessDate: note.lastAccessDate?.toISOString() // ← si elle existe
    };

    return from(this.awsService.uploadFile(fileKey, file)).pipe(
      switchMap(() => this.awsService.putItem({
        TableName: 'Notes',
        Item: noteToSave
      })),
      map(() => note),
      catchError(error => {
        console.error('Error uploading note:', error);
        throw error;
      })
    );
  }


  getFileContent(noteId: string): Observable<string> {
    return this.getNoteById(noteId).pipe(
      switchMap(note => {
        if (!note) {
          throw new Error('Note not found');
        }
        return from(this.awsService.getFileContent(note.fileKey));
      })
    );
  }

  private mapDynamoNote(raw: any): Note {
    return {
      id: raw.id?.S,
      title: raw.title?.S,
      fileName: raw.fileName?.S,
      fileType: raw.fileType?.S,
      subjectId: raw.subjectId?.S,
      subjectName: raw.subjectName?.S,
      fileSize: raw.fileSize?.N ? Number(raw.fileSize.N) : 0,
      uploadDate: raw.uploadDate?.S ? new Date(raw.uploadDate.S) : new Date(),
      lastAccessDate: raw.lastAccessDate?.S ? new Date(raw.lastAccessDate.S) : undefined,
      tags: raw.tags?.L ? raw.tags.L.map((tag: any) => tag.S) : [],
      isShared: raw.isShared?.BOOL ?? false,
      sharedWith: raw.sharedWith?.L ? raw.sharedWith.L.map((user: any) => user.S) : [],
      fileKey: raw.fileKey?.S,
      content: raw.content?.S
    };
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
  
  deleteNote(note: Note): Observable<boolean> {
    return from(this.awsService.deleteFile(note.fileKey)).pipe(
      switchMap(() => 
        this.awsService.deleteItem({
          TableName: 'Notes',
          Key: {
            id: { S: note.id }
          }
        })
      ),
      map(() => true),
      catchError(error => {
        console.error('Error deleting note:', error);
        return of(false);
      })
    );
  }
  

  // Version améliorée de getNoteContent
  async getNoteContent(noteId: string): Promise<string> {
    try {
      const note = await firstValueFrom(this.getNoteById(noteId));
      
      if (!note || note.fileType !== 'txt') return '';
  
      const url = this.getFileUrl(note.fileKey);
      const response = await this.safeFetch(url);
      
      return await response.text();
    } catch (error) {
      console.error('Error loading note content:', error);
      return 'Error loading content';
    }
  }


  private activeRequests = new Set<AbortController>();

  private async safeFetch(url: string): Promise<Response> {
    const controller = new AbortController();
    // const timeout = setTimeout(() => controller.abort(), 5000); // Timeout après 5s
    this.activeRequests.add(controller);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
  
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response;
    } finally {
      this.activeRequests.delete(controller);
      // clearTimeout(timeout);
    }
  }
  cancelAllRequests() {
    this.activeRequests.forEach(controller => controller.abort());
    this.activeRequests.clear();
  }
  
 
}