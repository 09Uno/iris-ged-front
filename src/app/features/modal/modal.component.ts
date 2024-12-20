import { MatDialog } from '@angular/material/dialog';
import { EditorHtmlComponent } from '../editor-html/editor-html.component';

@Component({
  selector: 'app-document-editor',
  templateUrl: './document-editor.component.html',
  styleUrls: ['./document-editor.component.scss']
})
export class DocumentEditorComponent {

  managerAttributes = {
    processIdentifier: 'process_123',
    documentId: 456,
    selectedDocumentString: 'Texto do Documento'
  };

  constructor(private dialog: MatDialog) {}

  openEditorModal() {
    const dialogRef = this.dialog.open(EditorHtmlComponent, {
      width: '600px',
      data: {
        content: this.managerAttributes.selectedDocumentString,
        processIdentifier: this.managerAttributes.processIdentifier,
        documentId: this.managerAttributes.documentId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('O modal foi fechado');
    });
  }
}
function Component(arg0: { selector: string; templateUrl: string; styleUrls: string[]; }): (target: typeof DocumentEditorComponent) => void | typeof DocumentEditorComponent {
  throw new Error('Function not implemented.');
}

