/* The `EditorHtmlComponent` class in TypeScript is a component used for editing HTML content with
features like search, replace, undo, redo, and updating the document through a service. */
/* The `import { Component, AfterViewInit, ViewChild, ElementRef, EventEmitter, Output, Inject } from
'@angular/core';` statement in TypeScript is importing various decorators and classes from the
`@angular/core` module. Here is a brief explanation of each import: */
import { Component, AfterViewInit, ViewChild, ElementRef, EventEmitter, Output, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuillEditorComponent, QuillModule } from 'ngx-quill';
import 'quill/dist/quill.snow.css';
import { DocumentService } from '../../services/documents/document.service';
import { htmlItemDocumentToEdit } from '../../types';
import { HtmlItemDocumentToEdit } from '../../types';
import { mapToHtmlItemDocumentToEdit } from './editor.config';
import { lastValueFrom } from 'rxjs';
import Quill from 'quill';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { defaultUiControllers } from '../../domains/documents/components/document-manager/document-manager-core/document-manager.config';

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
  @ViewChild('quillEditor') quillEditorComponent!: QuillEditorComponent;

  @Output() startDocumentCallback = new EventEmitter<{ docID: number; extension: string; name: string }>();
  documentItem: HtmlItemDocumentToEdit = { ...htmlItemDocumentToEdit };
  uiControllers = { ...defaultUiControllers }
  searchTerm: string = '';

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
  searchResults: number[] = [];
  replaceTerm: string = '';
  currentSearchIndex: number = -1;
  private quillEditor: Quill | null = null;

  // Fullscreen property
  isFullscreen: boolean = false;

  // Version control
  showVersionPanel: boolean = false;
  documentVersions: any[] = [];
  isLoadingVersions: boolean = false;
  currentVersionNumber: number = 1;
  hasUnsavedChanges: boolean = false;
  originalContent: string = '';

  constructor(
    private documentService: DocumentService,
    public dialogRef: MatDialogRef<EditorHtmlComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.content = data.content;
    this.originalContent = data.content;
    this.processIdentifier = data.processIdentifier;
    this.documentId = data.documentId;
    this.currentVersionNumber = data.versionNumber || 1;

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
    this.quillEditor = editor;
    editor.clipboard.addMatcher(Node.TEXT_NODE, (node: any) => {
      if (!this.allowHtmlPaste) {
        return document.createTextNode(node.textContent);
      }
      return node;
    });

    // Detectar mudanças no conteúdo
    editor.on('text-change', () => {
      this.hasUnsavedChanges = this.content !== this.originalContent;
    });
  }

  undo() {
    const editor = this.quillEditor;
    if (editor) {
      editor.history.undo();
    } else {
      console.error('Editor not found');
    }
  }

  redo() {
    const editor = this.quillEditor;
    if (editor) {
      editor.history.redo();
    } else {
      console.error('Editor not found ');
    }

  }

  search() {
    const editor = this.quillEditor;
    if (editor) {
      const text = editor.getText();
      this.searchResults = [];
      let index = text.indexOf(this.searchTerm);
      while (index !== -1) {
        this.searchResults.push(index);
        index = text.indexOf(this.searchTerm, index + this.searchTerm.length);
      }
      if (this.searchResults.length > 0) {
        this.currentSearchIndex = 0;
        editor.setSelection(this.searchResults[this.currentSearchIndex], this.searchTerm.length);
      } else {
        editor.setSelection(this.searchResults[0], 0);
      }
    } else {
      console.error('Editor not found');
    }
  }
  nextSearch() {
    const editor = this.quillEditor;
    if (editor && this.searchResults.length > 0) {
      this.currentSearchIndex = (this.currentSearchIndex + 1) % this.searchResults.length;
      editor.setSelection(this.searchResults[this.currentSearchIndex], this.searchTerm.length);
    }
  }

  prevSearch() {
    const editor = this.quillEditor;
    if (editor && this.searchResults.length > 0) {
      this.currentSearchIndex = (this.currentSearchIndex - 1 + this.searchResults.length) % this.searchResults.length;
      editor.setSelection(this.searchResults[this.currentSearchIndex], this.searchTerm.length);
    }
  }

  replace() {
    const editor = this.quillEditor;
    if (editor && this.searchResults.length > 0 && this.replaceTerm) {
      const currentIndex = this.searchResults[this.currentSearchIndex];
      editor.deleteText(currentIndex, this.searchTerm.length);
      editor.insertText(currentIndex, this.replaceTerm);
      this.search();
    }
  }

  replaceAll() {
    const editor = this.quillEditor;
    if (editor && this.searchResults.length > 0 && this.replaceTerm) {
      for (let i = this.searchResults.length - 1; i >= 0; i--) {
        editor.deleteText(this.searchResults[i], this.searchTerm.length);
        editor.insertText(this.searchResults[i], this.replaceTerm);
      }
      this.search();
    }
  }

  execCmd(command: string, value: string | null = null) {
    const iframeDocument = this.iframe.nativeElement.contentDocument || this.iframe.nativeElement.contentWindow.document;
    if (iframeDocument) {
      iframeDocument.execCommand(command, false, value);
    }
  }

  async updateDocumentHtml() {
    this.uiControllers.isLoading = true;
    const item = mapToHtmlItemDocumentToEdit(this.processIdentifier, this.documentId, this.content);

    if (!item) {
      console.error('Failed to map document item');
      this.uiControllers.isLoading = false;
      return;
    }

    try {
      const result = await lastValueFrom(await this.documentService.updateDocumentHtml(item));

      // Atualizar controle de versões
      this.originalContent = this.content;
      this.hasUnsavedChanges = false;
      this.currentVersionNumber++;

      this.startDocumentCallback.emit({
        docID: result.updatedDocument.id,
        extension: result.updatedDocument.extension,
        name: result.updatedDocument.name,
      });

      // Recarregar versões se o painel estiver aberto
      if (this.showVersionPanel) {
        await this.loadVersions();
      }

      this.uiControllers.isLoading = false;
      console.log('Document saved successfully. Version:', this.currentVersionNumber);
    } catch (error) {
      this.uiControllers.isLoading = false;
      console.error('Error updating document:', error);
    }
  }

  toggleVersionPanel() {
    this.showVersionPanel = !this.showVersionPanel;
    if (this.showVersionPanel && this.documentVersions.length === 0) {
      this.loadVersions();
    }
  }

  async loadVersions() {
    this.isLoadingVersions = true;
    try {
      // TODO: Implementar chamada para API de versões quando backend estiver pronto
      // const versions = await this.documentService.getDocumentVersions(this.documentId);
      // this.documentVersions = versions;

      // Mock temporário
      this.documentVersions = [
        {
          versionNumber: this.currentVersionNumber,
          createdAt: new Date().toISOString(),
          createdBy: 'Usuário Atual',
          changeDescription: 'Versão atual',
          isCurrent: true
        }
      ];

      this.isLoadingVersions = false;
    } catch (error) {
      console.error('Error loading versions:', error);
      this.isLoadingVersions = false;
    }
  }

  async restoreVersion(version: any) {
    if (this.hasUnsavedChanges) {
      const confirm = window.confirm(
        'Você tem alterações não salvas. Deseja continuar e perder essas alterações?'
      );
      if (!confirm) return;
    }

    this.uiControllers.isLoading = true;
    try {
      // TODO: Implementar chamada para API de restauração quando backend estiver pronto
      // const restoredContent = await this.documentService.restoreVersion(this.documentId, version.versionNumber);
      // this.content = restoredContent;

      console.log('Restoring version:', version.versionNumber);
      alert('Funcionalidade de restauração será implementada quando o backend estiver pronto.');

      this.uiControllers.isLoading = false;
    } catch (error) {
      console.error('Error restoring version:', error);
      this.uiControllers.isLoading = false;
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
    
    if (this.isFullscreen) {
      // Set dialog to fullscreen
      this.dialogRef.updateSize('100vw', '100vh');
      this.dialogRef.updatePosition();
      document.body.style.overflow = 'hidden';
    } else {
      // Reset dialog size
      this.dialogRef.updateSize('80%', '90%');
      this.dialogRef.updatePosition();
      document.body.style.overflow = 'auto';
    }
  }

  closeDocument() {
    // Reset body overflow when closing
    document.body.style.overflow = 'auto';
    this.dialogRef.close();
  }
}