import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkTheme = new BehaviorSubject<boolean>(false);
  isDarkTheme$ = this.darkTheme.asObservable();
  
  constructor() {
    // Check if user has saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.darkTheme.next(true);
    }
  }
  
  toggleTheme(): void {
    const newTheme = !this.darkTheme.value;
    this.darkTheme.next(newTheme);
    
    // Save theme preference
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  }
}