import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError, lastValueFrom } from 'rxjs';
import { DocumentItem, HtmlDocumentItem, HtmlItemDocumentToEdit, NewDocumentDTO, AdvancedSearchRequest, AdvancedSearchResponse, DocumentType } from './types';
import { AuthService } from './services/authentication/auth.service';

export const apiUrl = 'http://localhost/';

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

      return this.http.post<any>(`${apiUrl}v1/Document/SaveDocs`, formData, { headers, observe: 'response' }).pipe(
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
      return this.http.post<any>(`${apiUrl}v1/Document/SaveDocsHtml`, formData, { headers }).pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in saveHtmlDocument request:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          return throwError(error);
        })
      );
    });
  }

  async downloadDocumentAsPdf(documentId: number): Promise<Observable<any>> {
    try {
      const token = await this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      
      const response  =  this.http.get(`${apiUrl}v1/Document/DownloadDocumetAsPdf?documentId=${documentId}`, {
        headers,
        responseType: 'blob' as 'json'
      });
  
      return response as Observable<Blob>; // Retorna o Blob
    } catch (error) {
      console.error('Erro ao baixar o documento:', error);
      throw error; // Lança o erro para ser tratado externamente
    }
  }
  


  // Método para atualizar documento HTML
  async updateHtmlDocument(item: HtmlItemDocumentToEdit): Promise<Observable<any>> {

    const formData = new FormData();
    formData.append('id', item.id.toString());
    formData.append('ProcessIdentifier', item.processIdentifier);
    formData.append('HtmlContent', item.htmlContent);

    return this.authService.getToken().then((token: any) => {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.post<any>(`${apiUrl}v1/Document/EditDocsHtml`, formData, { headers }).pipe(
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
    return this.http.get<DocumentItem[]>(`${apiUrl}v1/Document/getDocs?processIdentifier=${encodedString}`, { headers });
  }

  // Método para buscar arquivo de um documento
  async fetchDocumentFile(documentId: number): Promise<Observable<Blob>> {

    return this.authService.getToken().then((token: any) => {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get(`${apiUrl}v1/Document/DownloadDocument?documentId=${documentId}`, {
        responseType: 'blob', headers
      });
    });
  }



  checkAuthentication(): any {
    try {
      const token = this.authService.getGovBrToken();
  
      if (!token) {
        console.error('Token inválido ou ausente.');
        throw new Error('Token inválido ou ausente.');
      }
  
  
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
      // Certifique-se de que o URL da API está correto
      return this.http.get(`${apiUrl}v1/Auth/ValidateToken`, { headers }).subscribe({
        next: (response: any) => {
          console.log('Response:', response);
          return response;
        },
        error: (error: any) => {
          console.error('Erro na requisição:', error);
          throw error;
        }});
    } catch (error) {
      console.error('Erro ao tentar autorizar:', error);
      throw error;
    }
  }

  logoutGovBr(){
    try {
      const token = this.authService.getGovBrToken();
     
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
      // Certifique-se de que o URL da API está correto
      return this.http.get(`${apiUrl}v1/Auth/LogOutGovBr?token=${token}`, { headers }).subscribe({
        next: (response: any) => {
          console.log('Response:', response);
          return response;
        },
        error: (error: any) => {
          console.error('Erro na requisição:', error);
          throw error;
        }});
    } catch (error) {
      console.error('Erro ao tentar fazer logout:', error);
      throw error;
    }
  }

  // Método para salvar um novo documento usando NewDocumentDTO
  async saveNewDocument(document: NewDocumentDTO): Promise<Observable<any>> {
    const formData = new FormData();
    
    // Map DTO properties to FormData (now using English field names for API)
    formData.append('Name', document.name);
    formData.append('DocumentDate', document.documentDate);
    formData.append('File', document.file);
    formData.append('DocumentTypeId', document.documentTypeId.toString());
    if (document.subject) formData.append('Subject', document.subject);
    if (document.interestedPartyName) formData.append('InterestedPartyName', document.interestedPartyName);
    if (document.senderName) formData.append('SenderName', document.senderName);
    if (document.recipientName) formData.append('RecipientName', document.recipientName);
    if (document.originAgency) formData.append('OriginAgency', document.originAgency);
    if (document.originUnit) formData.append('OriginUnit', document.originUnit);
    formData.append('Status', document.status);
    formData.append('IsPublic', document.isPublic.toString());
    formData.append('IsConfidential', document.isConfidential.toString());
    if (document.observations) formData.append('Observations', document.observations);
    if (document.keywords) formData.append('Keywords', document.keywords);
    formData.append('CreatorUserId', document.creatorUserId.toString());
    // New simplified protocol-based structure
    if (document.existingProtocol) formData.append('ExistingProtocol', document.existingProtocol);
    // TreeOrder will be calculated automatically on backend

    try {
      const token = await this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      return this.http.post<any>(`${apiUrl}v1/Document/SaveDocument `, formData, { 
        headers, 
        observe: 'response' 
      }).pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in saveNewDocument request:', error);
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

  // Método para busca avançada de documentos
  async advancedSearch(searchRequest: AdvancedSearchRequest): Promise<Observable<AdvancedSearchResponse>> {
    try {
      const token = await this.authService.getToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      return this.http.post<AdvancedSearchResponse>(`${apiUrl}v1/Document/AdvancedSearch`, searchRequest, { 
        headers 
      }).pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in advancedSearch request:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          return throwError(error);
        })
      );
    } catch (error) {
      console.error('Error in advancedSearch:', error);
      throw error;
    }
  }
  
  async getDocumentTypes(): Promise<Observable<DocumentType[]>> {
    try {
      const token = await this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<DocumentType[]>(`${apiUrl}v1/Document/GetDocumentsType`, { headers });
    } catch (error) {
      console.error('Error in getDocumentTypes:', error);
      throw error;
    }
  }


}
