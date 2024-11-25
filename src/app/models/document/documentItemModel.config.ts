import { DocumentItem, HtmlDocumentItem, HtmlItemDocumentToEdit } from "./documentItemModel"

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

  export const htmlItemDocumentToEdit : HtmlItemDocumentToEdit = {
    id: 0,
    processIdentifier: '',
    htmlContent: ''
  }