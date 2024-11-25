import { SafeResourceUrl } from '@angular/platform-browser';
import { DocumentFetchDTO } from '../../../models/document/documentItemModel';



export interface DocumentViewController {
    title: string,
    subtitle: string,
    docIcon: string,
    selectedModal: string,
    selectedModalNumber: number
}

export interface UiControllerElements{
    isLoading: boolean;
    validProcess: boolean;
    editableDocument: boolean;
    showEditor: boolean;
} 

export interface VisibleButtons {
    showInsertDocumentButton: boolean;
}


export interface DocumentManagerAtributes {
    processIdentifier: string,
    processIdentifierInput: string,
    documents: DocumentFetchDTO | any,
    documentId:  number,
    selectedDocument: SafeResourceUrl | null,
    selectedDocumentString: any,
    documentBlob: any,
    documentCount: number,
    docIdEvent: number,
    docExtEvent: string,
    source : string
}

export interface DocumentMessages {
    errorMessage: string | null,
    alertMessage: string | null
}

export interface DocumentHtmlClassAndId {
    elementId: string,
    cardJsTreeClass: string,
    cardClass: string
}