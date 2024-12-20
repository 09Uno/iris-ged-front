import { Component, AfterViewInit, ViewChild, ElementRef, EventEmitter, Output, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import 'quill/dist/quill.snow.css';
import { DocumentService } from '../../services/documentService';
import { htmlItemDocumentToEdit } from '../../models/document/documentItemModel.config';
import { HtmlItemDocumentToEdit } from '../../models/document/documentItemModel';
import { mapToHtmlItemDocumentToEdit } from './editor.config';
import { lastValueFrom } from 'rxjs';
import Quill from 'quill';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

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
  @Output() startDocumentCallback = new EventEmitter<{ docID: number; extension: string; name: string }>();
  documentItem: HtmlItemDocumentToEdit = { ...htmlItemDocumentToEdit };

  allowHtmlPaste = true;
  quillModules = {
    toolbar: [
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'align': [] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean'],
    ],
    history: {
      delay: 1000,    // Atraso para agrupamento de ações
      maxStack: 50,   // Limite de estados armazenados
      userOnly: true, // Apenas alterações do usuário contam no histórico
    },
  };

  content: string;
  processIdentifier: string;
  documentId: number;
  
  private quillEditor: Quill | null = null;

  constructor(
    private documentService: DocumentService,
    public dialogRef: MatDialogRef<EditorHtmlComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.content = data.content;
    this.processIdentifier = data.processIdentifier;
    this.documentId = data.documentId;

    const Font = Quill.import('formats/font') as any;
    Font.whitelist = ['roboto', 'montserrat', 'arial', 'times-new-roman', 'courier'];
    Quill.register(Font, true);
  }

  ngAfterViewInit() {
    this.initializeIframe();
  }

  private initializeIframe() {
    const iframeElement = this.iframe.nativeElement;
    iframeElement.srcdoc = `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Editor HTML</title>
          <style>
            body {
              padding: 20px;
              line-height: 1.6;
              font-family: 'Arial', sans-serif;
            }
            p {
              margin: 0;
            }
          </style>
        </head>
        <body contenteditable="true">
          ${this.content || ''}
        </body>
      </html>
    `;
  }

  onEditorCreated(editor: any) {
    editor.clipboard.addMatcher(Node.TEXT_NODE, (node: any) => {
      if (!this.allowHtmlPaste) {
        return document.createTextNode(node.textContent);
      }
      return node;
    });
  }

  undo() {
    if (this.quillEditor) {
      this.quillEditor.history.undo();
    }
  }

  redo() {
    if (this.quillEditor) {
      this.quillEditor.history.redo();
    }
  }


  execCmd(command: string, value: string | null = null) {
    const iframeDocument = this.iframe.nativeElement.contentDocument || this.iframe.nativeElement.contentWindow.document;
    if (iframeDocument) {
      iframeDocument.execCommand(command, false, value);
    }
  }

  async updateDocumentHtml() {
    const item = mapToHtmlItemDocumentToEdit(this.processIdentifier, this.documentId, this.content);

    if (!item) {
      console.error('Failed to map document item');
      return;
    }

    try {
      const result = await lastValueFrom(await this.documentService.updateDocumentHtml(item));
      this.startDocumentCallback.emit({
        docID: result.updatedDocument.id,
        extension: result.updatedDocument.extension,
        name: result.updatedDocument.name,
      });
    } catch (error) {
      console.error('Error updating document:', error);
    }
  }

  closeDocument() {
    this.dialogRef.close();
  }
}