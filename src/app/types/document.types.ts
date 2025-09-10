export interface DocumentItem {
  Id: number | null;
  FileName: string;
  DocumentType: string;
  ProcessIdentifier: string;
  DocumentDate: string;
  FileContent: File | Blob | string;
  Description: string;
  FileExtension: string;
}

export interface HtmlDocumentItem {
  FileName: string;
  DocumentType: string;
  ProcessIdentifier: string;
  DocumentDate: string;
  Description: string;
}

export interface DocumentFetchDTO {
  id: number;
  fileName: string;
  documentType: string;
  documentDate: string;
  description: string;
  fileExtension: string;
  stackPosition: number;
  processId: number;
}

export interface HtmlItemDocumentToEdit {
  id: number;
  processIdentifier: string;
  htmlContent: string;
}

export interface NewDocumentDTO {
  name: string;
  documentDate: string;
  file: File;
  documentTypeId: number;
  subject?: string;
  interestedPartyName?: string;
  senderName?: string;
  recipientName?: string;
  originAgency?: string;
  originUnit?: string;
  status: string;
  isPublic: boolean;
  isConfidential: boolean;
  observations?: string;
  keywords?: string;
  creatorUserId: number;
  DocumentNumber?: string;
  useManualProtocol?: boolean;
  manualProtocolNumber?: string;
}

export interface AdvancedSearchRequest {
  // Basic Filters
  searchText?: string;
  documentNumber?: string;
  subject?: string;

  // Specific Filters
  generatingAgency?: string;
  documentTypeId?: number;
  author?: string;

  // Date Filters
  startDate?: string;
  endDate?: string;

  // Protocol and Identifier Filters
  process?: string; // Backend usa Process em vez de protocol
  uniqueIdentifier?: string;

  // Search Options
  searchType?: string; // "documents" or "processes"
  includeGenerated?: boolean;
  includeExternal?: boolean;

  // Status Filters
  status?: string;
  onlyPublic?: boolean;
  onlyConfidential?: boolean;

  // Pagination
  page?: number;
  pageSize?: number;

  // Sorting
  orderBy?: string; // e.g. "data_criacao"
  orderDirection?: string; // "ASC" or "DESC"
}

export interface AdvancedSearchResponse {
  success: boolean;
  data: SearchDocumentItem[];
  pagination: {
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  searchSummary: string;
  message: string;
}

export interface SearchDocumentItem {
  id: number;
  name: string;
  processIdentifier?: string;
  generatedProtocol?: string;
  uniqueIdentifier?: string;
  treeOrder: number;
  parentProtocol?: string;
  documentDate: string;
  filePath: string;
  extension?: string;
  fileSize?: number;
  documentTypeId: number;
  documentType: string;
  subject?: string;

  interestedPartyName?: string;
  senderName?: string;
  recipientName?: string;

  originAgency?: string;
  originUnit?: string;

  status: string;
  isPublic: boolean;
  isConfidential: boolean;

  author: string;
  createdAt: string;
  lastModifierUser?: string;
  lastModifiedAt: string;

  observations?: string;
  keywords?: string;
  version: number;
  isActive: boolean;
}


export interface DocumentType {
  id: number;
  name: string;
  code: string;
  category: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  prefix: string;
}


// Default configuration objects
export const documentItem: DocumentItem = {
  Id: null,
  FileName: '',
  DocumentType: '',
  ProcessIdentifier: '',
  DocumentDate: new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date()),
  FileContent: '',
  Description: '',
  FileExtension: ''
};

export const htmlDocumentItem: HtmlDocumentItem = {
  FileName: '',
  DocumentType: '',
  ProcessIdentifier: '',
  DocumentDate: new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date()),
  Description: ''
};

export const documentFetchDTO: DocumentFetchDTO = {
  id: 0,
  fileName: '',
  documentType: '',
  documentDate: '',
  description: '',
  fileExtension: '',
  stackPosition: 0,
  processId: 0,
};

export const htmlItemDocumentToEdit: HtmlItemDocumentToEdit = {
  id: 0,
  processIdentifier: '',
  htmlContent: ''
};

