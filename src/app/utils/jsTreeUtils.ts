import { DocumentFetchDTO } from '../types';
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
    onSelectCallback: (id: number, extension: string, name: string) => void
  ): void {
    console.log('JsTreeUtil.initializeJsTree chamado com:', {
      elementId,
      documents,
      processIdentifier,
      documentsLength: documents?.length
    });
    
    const element = $(`#${elementId}`);
    console.log('Elemento encontrado:', element.length > 0 ? 'SIM' : 'NÃO');
    
    element.jstree('destroy').empty();
    
    const treeData = this.mapDocumentsToJsTreeData(documents, processIdentifier);
    console.log('Dados mapeados para árvore:', treeData);
    
    element.jstree({
      core: {
        data: treeData,
        check_callback: true,
        themes: {
          stripes: true
        }
      },
      plugins: []
    });

    // Set up the document selection event
    $(`#${elementId}`).on('select_node.jstree', (event: any, data: any) => {
      console.log('Evento select_node.jstree disparado:', { event, data });
      console.log('Node selecionado:', data.node);
      
      if (data.node.id === 'root_process') {
        console.log('Node raiz selecionado, ignorando...');
        return;
      }
      
      const selectedDocumentId = parseInt(data.node.id, 10);
      const extension = data.node.a_attr?.extension;
      const name = data.node.a_attr?.name;
      
      console.log('Dados extraídos do node:', {
        selectedDocumentId,
        extension,
        name
      });
      
      console.log('Chamando callback com:', { selectedDocumentId, extension, name });
      onSelectCallback(selectedDocumentId, extension, name);
    });
  }

   
  private static mapDocumentsToJsTreeData(documents:  DocumentFetchDTO[] , processIdentifier: string): any[] {
    console.log('mapDocumentsToJsTreeData chamado com:', {
      documents,
      processIdentifier,
      documentsLength: documents?.length
    });
    
    if (!documents || documents.length === 0) {
      console.log('Nenhum documento encontrado, retornando array vazio');
      return [];
    }

    const mappedData = [
      {
        id: "root_process",
        text: `Protocolo ${processIdentifier}`,
        state: { opened: true },
        children: documents.map(doc => {
          console.log('Mapeando documento:', doc);
          return {
            id: doc.id.toString(),
            text: doc.fileName,
            icon: FileUtils.getDocumentIcon(doc.fileExtension),
            a_attr: {
               extension: doc.fileExtension,
               name: doc.fileName,
             }
          };
        })
      }
    ];
    
    console.log('Dados mapeados finais:', mappedData);
    return mappedData;
  }

 
  static destroyJsTree(elementId: string): void {
    $(`#${elementId}`).jstree('destroy').empty();
  }
}
