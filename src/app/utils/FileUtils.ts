import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import htmlToPdfmake from 'html-to-pdfmake';

import { TDocumentDefinitions } from "pdfmake/interfaces";

export class FileUtils {

  static getFileExtension(file: File): string {
    const fileName = file.name;
    const parts = fileName.split('.');
    return parts.length > 1 ? `.${parts.pop()}` : '';
  }

  // Método para retornar o tipo MIME com base na extensão
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

  // Método para obter o ícone do arquivo
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

  // Função para converter as imagens do HTML para base64
  static async convertImagesInHtmlToBase64(htmlContent: string): Promise<string> {
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
    const images = doc.querySelectorAll('img');

    for (let img of images) {
      const imageUrl = img.src;

      // Verifica se a imagem tem uma URL
      if (imageUrl) {
        const base64Image = await FileUtils.convertImageToBase64(imageUrl);
        img.src = base64Image;  // Substitui a URL pela string base64
      }
    }

    // Retorna o HTML com as imagens convertidas para base64
    return doc.documentElement.outerHTML;
  }

  // Função auxiliar para converter uma imagem para base64
  static convertImageToBase64(imageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous"; // Habilita cross-origin
      img.onload = function () {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Define dimensões automaticamente ou valores padrão
        const width = img.width || 200;  // Usa 200 como valor padrão se width for 0
        const height = img.height || 200;

        canvas.width = width;
        canvas.height = height;

        // Desenha a imagem no canvas
        ctx!.drawImage(img, 0, 0, width, height);

        // Converte para base64
        const dataUrl = canvas.toDataURL("image/png");
        resolve(dataUrl);
      };

      img.onerror = function () {
        reject("Erro ao carregar a imagem.");
      };

      img.src = imageUrl;
    });
  }


  // Função para gerar o PDF com o HTML modificado
  static async generatePdfFromHtml(htmlContent: string, fileName: string) {
    try {
      if (htmlContent) {
        // Converte as imagens no HTML para base64, se necessário
        const updatedHtml = await FileUtils.convertImagesInHtmlToBase64(htmlContent);

        // Converte o HTML para um formato compatível com pdfMake
        const converted = htmlToPdfmake(updatedHtml);

        const documentDefinition: TDocumentDefinitions = {
          content: converted,
          defaultStyle: {
            font: 'Arial', 
          },
        };

        // Gera o PDF e faz o download
        pdfMake.createPdf(documentDefinition).download(fileName + '.pdf');
      } else {
        console.error('Erro: O conteúdo HTML está vazio.');
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    }
  }

  static sanitizeHtmlContent(htmlContent: string): string {
    // Remove estilos inválidos ou valores mal formatados
    return htmlContent.replace(/(\d+)auto/g, '$1px'); // Substitui '40auto' por '40px'
  }

  static createNewHeader(): HTMLElement {
    const newHeader = document.createElement('header');
    newHeader.id = 'header';
    newHeader.style.textAlign = 'center';
    newHeader.style.marginBottom = '30px';
    newHeader.style.padding = '20px 0';
    newHeader.style.borderBottom = '2px solid #000';
  
    const img = document.createElement('img');
    img.src = 'http://localhost:4200/assets/brasil.png';
    img.alt = 'Brasão do Brasil';
    img.style.width = '150px';
    img.style.height = 'auto';
    img.style.marginBottom = '20px';
  
    const h3 = document.createElement('h3');
    h3.style.fontSize = '16px';
    h3.style.margin = '0';
    h3.textContent = 'SERVIÇO PÚBLICO FEDERAL';
  
    const h2_1 = document.createElement('h2');
    h2_1.style.fontSize = '18px';
    h2_1.style.margin = '10px 0';
    h2_1.textContent = 'CONSELHO REGIONAL DE ENGENHARIA E AGRONOMIA DA BAHIA - CREA-BA';
  
    const h2_2 = document.createElement('h2');
    h2_2.style.fontSize = '16px';
    h2_2.style.margin = '5px 0';
    h2_2.textContent = 'TERMO DE REFERÊNCIA';
  
    newHeader.appendChild(img);
    newHeader.appendChild(h3);
    newHeader.appendChild(h2_1);
    newHeader.appendChild(h2_2);
  
    return newHeader;
  }

}
