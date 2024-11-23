// DocumentItem interface (equivalente a ItemDocumentos)
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


// Default value for DocumentItem
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
}

// HtmlDocumentItem interface (equivalente a ItemDocumentosHTML)
export interface HtmlDocumentItem {
  FileName: string;
  DocumentType: string;
  ProcessIdentifier: string;
  DocumentDate: string;
  Description: string;
}

// Default value for HtmlDocumentItem
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
}




// DocumentFetchDTO interface (equivalente a DocumentosFetchDTO)
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


// Default value for DocumentFetchDTO
export const documentFetchDTO = {
  id: 0,
  fileName: '',
  documentType: '',
  documentDate: '',
  description: '',
  fileExtension: '',
  stackPosition: 0,
  processId: 0,
}
