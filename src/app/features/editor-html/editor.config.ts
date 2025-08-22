import { HtmlItemDocumentToEdit } from "../../types";

export const mapToHtmlItemDocumentToEdit = ( processIdentifier: string ,docId : number, content: string) : HtmlItemDocumentToEdit => {
    return {
    processIdentifier: processIdentifier,
    id: docId,
    htmlContent: content
    }
}