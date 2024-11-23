import { DocumentItem, HtmlDocumentItem } from '../models/documentItem';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { FileUtils } from '../utils/FileUtils';
import GedApiService from '../gedApiService';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  constructor(private gedApi: GedApiService) {}

  async fetchDocumentsByProcess(processIdentifier: string): Promise<Observable<any>> {
    return (await this.gedApi.fetchDocumentsByProcess(processIdentifier)).pipe(
      tap(() => console.log('Successfully fetched documents.')),
      catchError((error) => {
        console.error('Error fetching documents:', error);
        return of(null);
      })
    );
  }

  async fetchDocumentFile(documentId: number): Promise<Observable<Blob>> {
    return this.gedApi.fetchDocumentFile(documentId).pipe(
      tap(() => console.log('Document successfully loaded.')),
      catchError((error) => {
        console.error('Error loading document:', error);
        return of(new Blob());
      })
    );
  }

  async addDocument(documentItem: DocumentItem, selectedFile: File): Promise<Observable<any>> {
    documentItem.FileExtension = FileUtils.getFileExtension(selectedFile);
    console.log(documentItem);
    documentItem.FileContent = selectedFile;
    return this.gedApi.saveDocument(documentItem);
  }

  addHtmlDocument(htmlDocumentItem: HtmlDocumentItem): Observable<any> {
    return this.gedApi.saveHtmlDocument(htmlDocumentItem);
  }

  async getHtmlContent(documentBlob: Blob): Promise<string | null> {
    // Verifies the MIME type to ensure it's HTML
    if (documentBlob.type !== 'text/html') {
      console.error('The selected file is not an HTML document.');
      return null;
    }

    // Reads the Blob content as text
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject('Error reading the HTML document.');
      reader.readAsText(documentBlob);
    });
  }
}
