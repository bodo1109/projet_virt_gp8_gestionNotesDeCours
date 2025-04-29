import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PdfViewerService } from '../../services/pdf-viewer.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pdf-viewer',
  imports: [CommonModule],
  
  template:`
  <div class="pdf-container">
  <canvas id="pdfCanvas"></canvas>
  <div *ngIf="loading" class="loading">Loading PDF...</div>
  <div *ngIf="error" class="error">{{ error }}</div>
</div>`,
  styles: [`.preview-container {
    padding: 24px;
    min-height: 400px;
  }`]
})
export class PdfViewerComponent implements OnChanges {
  @Input() fileUrl: string = '';
  loading: boolean = false;
  error: string = '';

  constructor(private pdfViewerService: PdfViewerService) {}

  ngOnInit(): void {
    this.loadPdf();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fileUrl'] && this.fileUrl) {
      this.loadPdf();
    }
  }

  async loadPdf(): Promise<void> {
    this.loading = true;
    this.error = '';
    
    try {
      await this.pdfViewerService.renderPdf(this.fileUrl, 'pdfCanvas');
    } catch (err) {
      this.error = 'Failed to load PDF';
      console.error(err);
    } finally {
      this.loading = false;
    }
  }
}