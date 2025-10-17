import { DocumentItem, HtmlDocumentItem, HtmlItemDocumentToEdit, AdvancedSearchRequest, AdvancedSearchResponse, DocumentType } from '../../types';
import { Injectable } from '@angular/core';
import { catchError, lastValueFrom, Observable, of, tap } from 'rxjs';
import { FileUtils } from '../../utils/FileUtils';
import GedApiService from '../../ged.api.service';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  constructor(private gedApi: GedApiService) { }

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
    return (await this.gedApi.fetchDocumentFile(documentId)).pipe(
      tap((blob) => {
        console.log('Document successfully loaded:', blob);
        console.log('Blob size:', blob.size);
      }),
      catchError((error) => {
        console.error('Error loading document:', error);
        console.error('Error details:', {
          status: error.status,
          message: error.message,
          url: error.url
        });
        // Retorna um blob vazio mas também relança o erro para o component tratar
        throw error;
      })
    );
  }

  async downloadDocumentAsPdf(documentId: number): Promise<Blob> {
    try {
      const response = lastValueFrom(await this.gedApi.downloadDocumentAsPdf(documentId));
      console.log('Document successfully loaded.');
      return response;
    } catch (error) {
      console.error('Error loading document:', error);
      return new Blob(); 
    }
  }
  
  async addDocument(documentItem: DocumentItem, selectedFile: File): Promise<Observable<any>> {
    documentItem.FileExtension = FileUtils.getFileExtension(selectedFile);
    console.log(documentItem);
    documentItem.FileContent = selectedFile;
    return this.gedApi.saveDocument(documentItem);
  }

  addHtmlDocument(htmlDocumentItem: HtmlDocumentItem): Promise<Observable<any>> {
    return this.gedApi.saveHtmlDocument(htmlDocumentItem);
  }

  async getHtmlContent(documentBlob: Blob): Promise<string | null> {
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

  updateDocumentHtml(documentItem: HtmlItemDocumentToEdit): Promise<Observable<any>> {
    return this.gedApi.updateHtmlDocument(documentItem);
  }

  async advancedSearch(searchRequest: AdvancedSearchRequest): Promise<Observable<AdvancedSearchResponse>> {
    return (await this.gedApi.advancedSearch(searchRequest)).pipe(
      tap(() => console.log('Advanced search completed successfully.')),
      catchError((error) => {
        console.error('Error in advanced search:', error);
        return of({
          success: false,
          data: [],
          pagination: {
            totalCount: 0,
            page: 1,
            pageSize: 10,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false
          },
          searchSummary: '',
          message: 'Erro na busca'
        } as AdvancedSearchResponse);
      })
    );
  }

  async getDocumentsTypes(): Promise<Observable<DocumentType[]>> {
    return (await this.gedApi.getDocumentTypes()).pipe(
      tap(() => console.log('Successfully fetched document types.')),
      catchError((error) => {
        console.error('Error fetching document types:', error);
        return of([]);
      })
    );
  }

  async addType(documentType: any): Promise<Observable<any>> {
    return this.gedApi.addDocumentType(documentType);
  }

  async updateType(id: number, documentType: any): Promise<Observable<any>> {
    return this.gedApi.updateDocumentType(id, documentType);
  }

  async getTypeById(id: number): Promise<Observable<any>> {
    return this.gedApi.getDocumentTypeById(id);
  }

  async cancelDocument(documentId: number, userId: number, reason: string): Promise<Observable<any>> {
    return this.gedApi.cancelDocument(documentId, userId, reason);
  }

  async reactivateDocument(documentId: number, userId: number, reason: string): Promise<Observable<any>> {
    return this.gedApi.reactivateDocument(documentId, userId, reason);
  }

}
