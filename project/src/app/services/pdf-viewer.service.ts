import { Injectable } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';

@Injectable({
  providedIn: 'root'
})
export class PdfViewerService {
  constructor() {
    // Configuration du worker avec le chemin correct
    //pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/pdf.worker.min.js';
  }

  /**
   * Charge un document PDF depuis une URL
   * @param url L'URL du document PDF
   * @returns Promise avec le document PDF chargé
   */
  async loadPdf(url: string): Promise<pdfjsLib.PDFDocumentProxy> {
    try {
      const loadingTask = pdfjsLib.getDocument({
        url: url,
        disableAutoFetch: true,
        disableStream: true
      });
      return await loadingTask.promise;
    } catch (error) {
      console.error('Error loading PDF:', error);
      throw new Error('Failed to load PDF document');
    }
  }

  /**
   * Rend une page PDF sur un canvas
   * @param pdf Document PDF chargé
   * @param pageNum Numéro de la page à rendre
   * @param canvasId ID de l'élément canvas
   * @param scale Facteur d'échelle (par défaut: 1)
   * @returns Promise résolue quand le rendu est complet
   */
  async renderPage(
    pdf: pdfjsLib.PDFDocumentProxy,
    pageNum: number,
    canvasId: string,
    scale: number = 1.0
  ): Promise<void> {
    try {
      const page = await pdf.getPage(pageNum);
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
      
      if (!canvas) throw new Error('Canvas not found');
  
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas context not available');
  
      const viewport = page.getViewport({ scale });
      
      // Ajustez la taille du canvas
      canvas.height = viewport.height;
      canvas.width = viewport.width;
  
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
  
    } catch (error) {
      console.error('Error rendering PDF:', error);
      throw error;
    }
  }

  async extractTextFromPdf(url: string): Promise<string> {
    try {
      const pdf = await pdfjsLib.getDocument(url).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map(item => ('str' in item) ? item.str : '')
          .join(' ');
        
        fullText += pageText + '\n\n';
      }
      
      return fullText;
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      throw error;
    }
  }

  async renderPdf(url: string, canvasId: string): Promise<void> {
    try {
      const pdf = await pdfjsLib.getDocument(url).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.0 });
      
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
      const context = canvas.getContext('2d');
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      if (!context) {
        throw new Error('Canvas context is null');
      }

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
    } catch (error) {
      console.error('PDF rendering error:', error);
      throw error;
    }
  }

}