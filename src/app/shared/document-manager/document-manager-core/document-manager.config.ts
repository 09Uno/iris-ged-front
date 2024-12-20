import { SafeResourceUrl } from '@angular/platform-browser';
import { VisibleButtons, UiControllerElements, DocumentHtmlClassAndId, DocumentManagerAtributes, DocumentMessages, DocumentViewController } from './document-manager.models';

// Valores padrão para cada interface
export const defaultViewController: DocumentViewController = {
  title: 'Documentos',
  subtitle: '',
  docIcon: '',
  selectedModal: '',
  selectedModalNumber: 0
};

export const defaultVisibleButtons: VisibleButtons = {
  showInsertDocumentButton: false,
};

export const defaultUiControllers : UiControllerElements ={
  editableDocument: false,
  validProcess: false,
  showEditor: false,
  isLoading: false,
}

export const defaultManagerAttributes: DocumentManagerAtributes = {
  name: '',
  processIdentifier: '',
  processIdentifierInput: '',
  documents: null, 
  documentId: 0,
  selectedDocument: null, 
  selectedDocumentString: '',
  documentBlob: null, 
  documentCount: 0,
  docIdEvent: 0,
  docExtEvent: '',
  source: ''
};

export const defaultMessages: DocumentMessages = {
  errorMessage: null,
  alertMessage: null
};

export const defaultHtmlClassAndId: DocumentHtmlClassAndId = {
  elementId: 'documentTree',
  cardJsTreeClass: 'card card-bkg-filed',
  cardClass: 'card card-bkg-filed'
};
