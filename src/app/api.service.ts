// src/app/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { ItemDocumentos } from './models/ItemDocumentos';


export const apiUrl = 'http://localhost:5020/'
//export const apiUrl = 'http://187.32.49.178:5005/'

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }
  
  async salvarDocumentos(item: ItemDocumentos): Promise<Observable<any>> {
    const formData = new FormData();
    
    // Adicione cada campo individualmente ao FormData
    formData.append('Nome', item.Nome);
    formData.append('Tipo_documento', item.Tipo_documento); 
    formData.append('Identificador', item.Identificador);
    formData.append('Data_documento', item.Data_documento);
    formData.append('Documento', item.Documento); 
    formData.append('Descricao', item.Descricao);
    formData.append('Extensao', item.Extensao);
  

    console.log(item.Documento);

    try {
      // Enviar o FormData para o backend
      return this.http.post<any>(`${apiUrl}api/Documentos/SalvarDocs`, formData).pipe(
        catchError((error: HttpErrorResponse) => {
          // console.error('Erro na requisição salvarDocumentos:', error);
          // console.error('Status:', error.status);
          // console.error('Mensagem:', error.message);
          console.error('Erro:', error.error);
          return throwError(error);
        })
      );
    } catch (error) {
      console.error('Erro ao construir FormData:', error);
      throw error;
    }
  }
  

  async buscarDocumentosPorProcesso(item: string): Promise<Observable<ItemDocumentos[]>> {
    let encodedString = encodeURIComponent(item);
    return this.http.get<ItemDocumentos[]>(`${apiUrl}api/Documentos/BuscarDocs?identificador=${item}`);
  }

  buscarArquivoDocumento(documentoId: number): Observable<Blob> {
    return this.http.get(`${apiUrl}api/Documentos/BaixarDocumento?documentoId=${documentoId}`, {
      responseType: 'blob' // Especifica que a resposta deve ser um Blob
    });
  }
  


  
}





//   async getPassById(id: UUID): Promise<Observable<ItemPasswordInterfaceDTO>> {
//     const mktoken = await this.gettoken();
//     const headers = new HttpHeaders({ 'Authorization': `Bearer ${mktoken}` });
//     return this.http.get<ItemPasswordInterfaceDTO>(`${Urls.PassUrl}/getPassCredentialsById?id=${id}`, { headers });
//   }

//   async getUsers(): Promise<Observable<ItemUserInterfaceDTO[]>> {
//     const mktoken = await this.gettoken();
//     const headers = new HttpHeaders({ 'Authorization': `Bearer ${mktoken}` });
//     return this.http.get<ItemUserInterfaceDTO[]>(`${Urls.UserUrl}/getUsers`, { headers });
//   }

//   async updatePass(item: ItemPasswordToEditInterfaceDTO): Promise<Observable<any>> {
//     const mktoken = await this.gettoken();
//     const headers = new HttpHeaders({ 'Authorization': `Bearer ${mktoken}` });
//     return this.http.post<any>(`${Urls.PassUrl}/UpadatePassCredentials`, item, { headers });
//   }

//   async savePass(item: ItemPasswordToCreateInterfaceDTO): Promise<Observable<any>> {
//     const mktoken = await this.gettoken();
//     const headers = new HttpHeaders({ 'Authorization': `Bearer ${mktoken}` });
//     // console.log('Dados enviados para savePass:', item);
//     return this.http.post<any>(`${Urls.PassUrl}/createPassCredentials`, item, { headers }).pipe(
//       catchError((error: HttpErrorResponse) => {
//         console.error('Erro na requisição savePass:', error);
//         console.error('Erro na requisição savePass:', error);
//         console.error('Status:', error.status);
//         console.error('Mensagem:', error.message);
//         console.error('Erro:', error.error);
//         return throwError(error);
//       })
//     );
//   }
//  async getXlsFile(pass: string, key: string): Promise<Observable<Blob>> {
//     const mktoken = await this.gettoken(); 
//     const headers = new HttpHeaders({ 'Authorization': `Bearer ${mktoken}` });
//     const encodedString = encodeURIComponent(key);

//     // Configure o responseType para blob
//     return this.http.get<Blob>(`${Urls.PassUrl}/GetXlsFile?pass=${pass}&key=${encodedString}`, { headers, responseType: 'blob' as 'json' });
// }


// }


