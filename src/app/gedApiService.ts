import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { DocumentItem, HtmlDocumentItem, HtmlItemDocumentToEdit } from './models/document/documentItemModel';
import { AuthService } from './services/authservices';

export const apiUrl = 'https://localhost:5001/';

@Injectable({
  providedIn: 'root'
})
export default class GedApiService {

  constructor(private http: HttpClient, private authService: AuthService) { }
  

  
  
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
    
    try {
      const token = await this.authService.getToken();

      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      return this.http.post<any>(`${apiUrl}api/Document/SaveDocs`, formData, { headers, observe: 'response' }).pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in saveDocument request:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          return throwError(error);
        })
      );
    } catch (error) {
      console.error('Error while constructing FormData:', error);
      throw error;
    }
  }

  // Método para salvar documento HTML
  async saveHtmlDocument(item: HtmlDocumentItem): Promise<Observable<any>> {
        
    const formData = new FormData();

    formData.append('FileName', item.FileName);
    formData.append('DocumentType', item.DocumentType);
    formData.append('ProcessIdentifier', item.ProcessIdentifier);
    formData.append('DocumentDate', item.DocumentDate);
    formData.append('Description', item.Description);

    return this.authService.getToken().then((token: any) => {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.post<any>(`${apiUrl}api/Document/SaveDocsHtml`, formData, { headers }).pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in saveHtmlDocument request:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          return throwError(error);
        })
      );
    });
  }

  // Método para atualizar documento HTML
  async updateHtmlDocument(item: HtmlItemDocumentToEdit): Promise<Observable<any>> {

    const formData = new FormData();
    formData.append('id', item.id.toString());
    formData.append('ProcessIdentifier', item.processIdentifier);
    formData.append('HtmlContent', item.htmlContent);

    return this.authService.getToken().then((token: any) => {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.post<any>(`${apiUrl}api/Document/EditDocsHtml`, formData, { headers }).pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in updateHtmlDocument request:', error);
          return throwError(() => new Error('Document update failed'));
        })
      );
    });
  }

  // Método para buscar documentos por identificador de processo
  async fetchDocumentsByProcess(identifier: string): Promise<Observable<DocumentItem[]>> {
    const token = await this.authService.getToken();
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const encodedString = encodeURIComponent(identifier);
    return this.http.get<DocumentItem[]>(`${apiUrl}api/Document/getDocs?processIdentifier=${encodedString}`, { headers });
  }

  // Método para buscar arquivo de um documento
  async fetchDocumentFile(documentId: number): Promise<Observable<Blob>> {

    return this.authService.getToken().then((token: any) => {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get(`${apiUrl}api/Document/DownloadDocument?documentId=${documentId}`, {
        responseType: 'blob', headers
      });
    });
  }
}
