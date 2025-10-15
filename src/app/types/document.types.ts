import { Permission, Role, User } from "./base.types";

// Enums
export enum DestinacaoFinal {
  EliminacaoImediata = 0,
  GuardaPermanente = 1,
  EliminacaoAposGuarda = 2
}

// Classes Documentais
export interface DocumentClass {
  id: number;
  code: string;
  fullTerm: string;
  description?: string;
  parentClassId?: number;
  currentRetentionPeriod: number;
  intermediateRetentionPeriod: number;
  finalDisposition: DestinacaoFinal;
  notes?: string;
  active: boolean;
  createdAt: string;
  inactivatedAt?: string;
}

export interface CreateDocumentClassDto {
  code: string;
  fullTerm: string;
  description?: string;
  parentClassId?: number;
  currentRetentionPeriod: number;
  intermediateRetentionPeriod: number;
  finalDisposition: DestinacaoFinal;
  notes?: string;
  createdByUserId: number;
}

export interface UpdateDocumentClassDto {
  code: string;
  description?: string;
  parentClassId?: number;
  currentRetentionPeriod: number;
  intermediateRetentionPeriod: number;
  finalDisposition: DestinacaoFinal;
  notes?: string;
}

export interface DocumentClassHierarchy extends DocumentClass {
  children?: DocumentClassHierarchy[];
  level?: number;
}

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

// Versionamento de Documentos
export interface DocumentVersion {
  id: number;
  documentId: number;
  versionNumber: number;
  htmlContent: string;
  createdAt: string;
  createdBy: string;
  createdByUserId: number;
  changeDescription?: string;
  fileSize?: number;
  checksum?: string;
}

export interface CreateDocumentVersionDto {
  documentId: number;
  htmlContent: string;
  changeDescription?: string;
}

export interface DocumentVersionListResponse {
  versions: DocumentVersion[];
  currentVersion: number;
  totalVersions: number;
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
  documentTypeId?: number;
  producer?: string;           // produtor
  recipient?: string;          // destinatario
  currentDepartment?: string;  // setor_atual

  // Date Filters
  startDate?: string;
  endDate?: string;

  // Protocol and Identifier Filters
  process?: string;            // identificador_processo (apenas)
  uniqueIdentifier?: string;   // identificador_unico (exato)

  // Search Options
  searchType?: string;         // "documents" or "processes"
  includeGenerated?: boolean;
  includeExternal?: boolean;

  // Status Filters
  status?: string;             // situacao
  onlyPublic?: boolean;        // publico = 1
  onlyConfidential?: boolean;  // confidencial = 1

  // Additional Fields
  keywords?: string;           // palavras_chave
  notes?: string;              // observacoes

  // Pagination
  page?: number;
  pageSize?: number;

  // Sorting
  orderBy?: string;            // e.g. "data_criacao"
  orderDirection?: string;     // "ASC" or "DESC"
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
  classeDocumentalId?: number;
  classeDocumentalCodigo?: string;
  classeDocumentalDescricao?: string;
  linkTemplate?: string;
  htmlTemplateFileName?: string;
  hasHtmlTemplate?: boolean;
  supportsHtmlEditing?: boolean;
  htmlTemplateContent?: string;
}

// DTO para criar tipo de documento
export interface CreateDocumentTypeDto {
  name: string;
  code: string;
  category: string;
  description?: string;
  prefix: string;
  isActive: boolean;
  classeDocumentalId?: number;
  htmlTemplateContent?: string;
  templateFileName?: string;
  supportsHtmlEditing?: boolean;
}

// DTO para atualizar tipo de documento
export interface UpdateDocumentTypeDto {
  id: number;
  name: string;
  code: string;
  category: string;
  description?: string;
  prefix: string;
  isActive: boolean;
  classeDocumentalId?: number;
  htmlTemplateContent?: string;
  templateFileName?: string;
  supportsHtmlEditing?: boolean;
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

