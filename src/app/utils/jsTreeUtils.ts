import { DocumentFetchDTO } from '../models/documentItem';
import { FileUtils } from '../utils/FileUtils';

declare var $: any;

export class JsTreeUtil {
  /**
   * Initializes the jsTree with data and configuration.
   * 
   * @param elementId - The ID of the DOM element where jsTree will be initialized.
   * @param documents - The array of documents to be displayed in the tree.
   * @param processIdentifier - The identifier of the process for the root node.
   * @param onSelectCallback - Callback function to handle document selection.
   */
  static initializeJsTree(
    elementId: string, 
    documents: any[], 
    processIdentifier: string, 
    onSelectCallback: (id: number, extension: string) => void
  ): void {
    $(`#${elementId}`).jstree('destroy').empty();
    $(`#${elementId}`).jstree({
      core: {
        data: this.mapDocumentsToJsTreeData(documents, processIdentifier),
        check_callback: true,
        themes: {
          stripes: true
        }
      },
      plugins: []
    });

    // Set up the document selection event
    $(`#${elementId}`).on('select_node.jstree', (event: any, data: any) => {
      const selectedDocumentId = parseInt(data.node.id, 10);
      const extension = data.node.a_attr.extension;
      onSelectCallback(selectedDocumentId, extension);
    });
  }

   
  private static mapDocumentsToJsTreeData(documents:  DocumentFetchDTO[] , processIdentifier: string): any[] {
    if (documents.length === 0) return [];

    return [
      {
        id: "root_process",
        text: `Process ${processIdentifier}`,
        state: { opened: true },
        children: documents.map(doc => ({
          id: doc.id.toString(),
          text: doc.fileName,
          icon: FileUtils.getDocumentIcon(doc.fileExtension),
          a_attr: { extension: doc.fileExtension }
        }))
      }
    ];
  }

 
  static destroyJsTree(elementId: string): void {
    $(`#${elementId}`).jstree('destroy').empty();
  }
}
