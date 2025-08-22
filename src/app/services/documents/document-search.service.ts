import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { DocumentService } from './document.service';
import { AdvancedSearchRequest, AdvancedSearchResponse, SearchDocumentItem, DocumentFetchDTO } from '../../types';

export interface SearchOptions {
  incluirGerados?: boolean;
  incluirExternos?: boolean;
  page?: number;
  pageSize?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentSearchService {

  constructor(private documentService: DocumentService) {}

  async searchByProtocol(
    protocol: string, 
    options: SearchOptions = {}
  ): Promise<Observable<AdvancedSearchResponse>> {
    const searchRequest: AdvancedSearchRequest = {
      protocol: protocol,
      searchType: 'protocol',
      includeGenerated: options.incluirGerados ?? true,
      includeExternal: options.incluirExternos ?? true,
      page: options.page ?? 1,
      pageSize: options.pageSize ?? 100
    };

    return this.documentService.advancedSearch(searchRequest);
  }

  async searchByDocumentName(
    documentName: string, 
    options: SearchOptions = {}
  ): Promise<Observable<AdvancedSearchResponse>> {
    const searchRequest: AdvancedSearchRequest = {
      searchText: documentName,
      searchType: 'document',
      includeExternal: options.incluirGerados ?? true,
      includeGenerated: options.incluirExternos ?? true,
      page: options.page ?? 1,
      pageSize: options.pageSize ?? 100
    };

    return this.documentService.advancedSearch(searchRequest);
  }

  async searchByIdentifier(
    identifier: string, 
    options: SearchOptions = {}
  ): Promise<Observable<AdvancedSearchResponse>> {
    const searchRequest: AdvancedSearchRequest = {
      uniqueIdentifier: identifier,
      searchType: 'documentos',
      includeGenerated: options.incluirGerados ?? true,
      includeExternal: options.incluirExternos ?? true,
      page: options.page ?? 1,
      pageSize: options.pageSize ?? 50
    };

    return this.documentService.advancedSearch(searchRequest);
  }

  convertSearchResultsToTreeData(results: SearchDocumentItem[]): DocumentFetchDTO[] {
    const treeData: DocumentFetchDTO[] = results.map(item => ({
      id: item.id,
      fileName: item.name,
      documentType: item.documentType,
      documentDate: item.documentDate,
      description: item.subject || '',
      fileExtension: item.extension || '',
      stackPosition: item.treeOrder,
      processId: item.id
    }));

    return treeData.sort((a, b) => a.stackPosition - b.stackPosition);
  }

  extractProtocolFromSearchResults(results: SearchDocumentItem[]): string | null {
    if (results.length === 0) return null;
    
    const firstResult = results[0];
    return firstResult.protocolNumber || firstResult.generatedProtocol || null;
  }
}