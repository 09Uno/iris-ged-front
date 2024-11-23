export class FileUtils {

  static getFileExtension(file: File): string {
    const fileName = file.name;
    const parts = fileName.split('.');
    return parts.length > 1 ? `.${parts.pop()}` : '';
  }
 
  static getMimeType(extension: string): string {
    switch (extension.toLowerCase()) {
      case '.html':
        return 'text/html';
      case '.pdf':
        return 'application/pdf';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.txt':
        return 'text/plain';
      default:
        return 'application/octet-stream';
    }
  }


  static getDocumentIcon(fileType: string): string {
    console.log(fileType);
    switch (fileType) {
      case '.pdf':
        return 'assets/pdf.svg';
      case '.html':
        return 'assets/html.svg';
      default:
        return 'assets/default-icon.svg';
    }
  }
}
