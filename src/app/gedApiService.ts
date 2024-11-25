import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { DocumentItem, HtmlDocumentItem, HtmlItemDocumentToEdit } from './models/document/documentItemModel';
import { formatDate } from '@angular/common';

export const apiUrl = 'http://localhost:5020/';
//export const apiUrl = 'http://187.32.49.178:5005/'

@Injectable({
  providedIn: 'root'
})
export default class GedApiService {

  constructor(private http: HttpClient) { }

  // Método para salvar um documento
  async saveDocument(item: DocumentItem): Promise<Observable<any>> {
    const formData = new FormData();

    formData.append('FileName', item.FileName);
    formData.append('DocumentType', item.DocumentType);
    formData.append('ProcessIdentifier', item.ProcessIdentifier);
    formData.append('DocumentDate', item.DocumentDate);
    formData.append('FileContent', item.FileContent);
    formData.append('Description', item.Description);
    formData.append('FileExtension', item.FileExtension);

    console.log(item.FileContent);

    try {
      return this.http.post<any>(`${apiUrl}api/Document/SaveDocs`, formData, { observe: 'response' }).pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in saveDocument request:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          console.error('Error:', error.error);
          return throwError(error);
        })
      );
    } catch (error) {
      console.error('Error while constructing FormData:', error);
      throw error;
    }
  }

  // Método para salvar documento HTML
  saveHtmlDocument(item: HtmlDocumentItem): Observable<any> {
    const formData = new FormData();

    formData.append('FileName', item.FileName);
    formData.append('DocumentType', item.DocumentType);
    formData.append('ProcessIdentifier', item.ProcessIdentifier);
    formData.append('DocumentDate', item.DocumentDate);
    formData.append('Description', item.Description);

    try {
      return this.http.post<any>(`${apiUrl}api/Document/SaveDocsHtml`, formData, { observe: 'response' }).pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in saveHtmlDocument request:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          console.error('Error:', error.error);
          return throwError(error);
        })
      );
    } catch (error) {
      console.error('Error while saving HTML document:', error);
      throw error;
    }
  }

  updateHtmlDocument(item: HtmlItemDocumentToEdit): Observable<any> {
    const formData = new FormData();
    formData.append('id', item.id.toString());
    formData.append('ProcessIdentifier', item.processIdentifier);
    formData.append('HtmlContent', item.htmlContent);
  
    return this.http.post<any>(`${apiUrl}api/Document/EditDocsHtml`, formData).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error in saveHtmlDocument request:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('Error:', error.error);
  
        return throwError(() => new Error('Document update failed'));
      })
    );
  }
  

  // Método para buscar documentos por identificador de processo
  async fetchDocumentsByProcess(identifier: string): Promise<Observable<DocumentItem[]>> {
    let encodedString = encodeURIComponent(identifier);
    return this.http.get<DocumentItem[]>(`${apiUrl}api/Document/getDocs?processIdentifier=${encodedString}`);
  }

  // Método para buscar arquivo de um documento
  fetchDocumentFile(documentId: number): Observable<Blob> {
    return this.http.get(`${apiUrl}api/Document/DownloadDocument?documentId=${documentId}`, {
      responseType: 'blob'
    });
  }
}
