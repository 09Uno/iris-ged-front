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

// HtmlDocumentItem interface (equivalente a ItemDocumentosHTML)
export interface HtmlDocumentItem {
  FileName: string;
  DocumentType: string;
  ProcessIdentifier: string;
  DocumentDate: string;
  Description: string;
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

export interface HtmlItemDocumentToEdit  {
  id: number;
  processIdentifier: string;
  htmlContent: string;
}