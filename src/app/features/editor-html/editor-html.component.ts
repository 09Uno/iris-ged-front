import { Component, AfterViewInit, ViewChild, ElementRef, Input, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import 'quill/dist/quill.snow.css';
import { DocumentService } from '../../services/documentService';
import { htmlItemDocumentToEdit } from '../../models/document/documentItemModel.config';
import { HtmlItemDocumentToEdit } from '../../models/document/documentItemModel';
import { mapToHtmlItemDocumentToEdit } from './editor.config';
import { lastValueFrom } from 'rxjs';
import { JsTreeUtil } from '../../utils/jsTreeUtils';

@Component({
  selector: 'app-editor-html',
  standalone: true,
  imports: [
    QuillModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './editor-html.component.html',
  styleUrls: ['./editor-html.component.scss'],
})
export class EditorHtmlComponent implements AfterViewInit {
  @ViewChild('iframe') iframe!: ElementRef;
  @Input() content: string = '';
  @Input() processIdentifier : string = '';
  @Input() documentId : number = 0;
  @Output() startDocumentCallback = new EventEmitter<{ docID: number; extension: string }>();
  documentItem : HtmlItemDocumentToEdit = {...htmlItemDocumentToEdit}



  constructor(
    private documentService: DocumentService
  ) { }

  startDocument(id: number, ext: string) {
    this.startDocumentCallback.emit({ docID: id, extension: ext });
  }



  allowHtmlPaste = true;
  quillModules = {
    toolbar: [
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'align': [] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ]
  };

  ngAfterViewInit() {
    const iframeElement = this.iframe.nativeElement;
    iframeElement.srcdoc = `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Editor HTML</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              line-height: 1.6;
            }
            p {
              margin: 0;
            }
          </style>
        </head>
        <body contenteditable="true">
          <p>${this.content}</p> <!-- Insere o conteúdo HTML aqui -->
        </body>
      </html>
    `;
  }

  // Configuração para interceptar o comportamento de colagem
  onEditorCreated(editor: any) {
    const editorInstance = editor;

    // Interceptando o comportamento de colagem
    editorInstance.clipboard.addMatcher(Node.TEXT_NODE, (node: any) => {
      if (!this.allowHtmlPaste) {
        // Colar como texto simples, removendo tags HTML
        return document.createTextNode(node.textContent);
      }
      return node;  // Mantém as tags HTML se a opção estiver ativada
    });
  }

  execCmd(command: string, value: string | null = null) {
    const iframeDocument = this.iframe.nativeElement.contentDocument || this.iframe.nativeElement.contentWindow.document;
    if (iframeDocument) {
      iframeDocument.execCommand(command, false, value);
    }
  }

  
  async updateDocumentHtml() {
    let item = mapToHtmlItemDocumentToEdit(this.processIdentifier, this.documentId, this.content);
  
    try {
      if (item !== null) {
        const result = await lastValueFrom(await this.documentService.updateDocumentHtml(item));
        console.log('Document updated:', result.updatedDocument.id);
        this.startDocument(result.updatedDocument.id, result.updatedDocument.extension);
      }
    } catch (error) {
      console.error('Error updating document:', error);
    }
  }
  
}
