export interface Note {
  id: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'txt';
  subjectId: string;
  subjectName?: string;
  fileSize: number;
  uploadDate: Date;
  lastAccessDate?: Date;
  tags?: string[];
  isShared: boolean;
  sharedWith?: string[];
  fileKey: string; // S3 file key
  content?: string;
  
}