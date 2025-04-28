import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  { 
    path: 'all-notes', 
    loadComponent: () => import('./pages/all-notes/all-notes.component').then(m => m.AllNotesComponent)
  },
  { 
    path: 'upload', 
    loadComponent: () => import('./pages/upload/upload.component').then(m => m.UploadComponent)
  },
  { 
    path: 'subject/:id', 
    loadComponent: () => import('./pages/subject-notes/subject-notes.component').then(m => m.SubjectNotesComponent)
  },
  { 
    path: 'note/:id', 
    loadComponent: () => import('./pages/note-details/note-details.component').then(m => m.NoteDetailsComponent)
  },
  { 
    path: 'search', 
    loadComponent: () => import('./pages/search-results/search-results.component').then(m => m.SearchResultsComponent)
  },
  { 
    path: 'subjects/manage', 
    loadComponent: () => import('./pages/manage-subjects/manage-subjects.component').then(m => m.ManageSubjectsComponent)
  },
  { 
    path: 'shared', 
    loadComponent: () => import('./pages/shared-notes/shared-notes.component').then(m => m.SharedNotesComponent)
  },
  { 
    path: 'recent', 
    loadComponent: () => import('./pages/recent-notes/recent-notes.component').then(m => m.RecentNotesComponent)
  },
  { 
    path: '**', 
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];