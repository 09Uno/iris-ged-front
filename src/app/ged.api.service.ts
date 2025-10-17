import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError, lastValueFrom, tap, of, from, switchMap } from 'rxjs';
import { DocumentItem, HtmlDocumentItem, HtmlItemDocumentToEdit, NewDocumentDTO, AdvancedSearchRequest, AdvancedSearchResponse, DocumentType, GetDefaultRolesResponse, GetDefaultPermissionsResponse } from './types';
import { UserMeDto, GetPagedUsersParamsDto, PagedUsersResponseDto, CreateUserManagementDto, UpdateUserManagementDto, GetUserManagementResponse } from './types/user.types';
import { UpdateUserPermissionsDto } from './types/permissions.types';
import { AuthService } from './services/authentication/auth.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export default class GedApiService {

  // #region Constructor
  constructor(private http: HttpClient, private authService: AuthService) { }
  // #endregion

  // #region Document Operations
  // Método para salvar um documento
  async saveDocument(item: DocumentItem): Promise<Observable<any>> {
    const formData = new FormData();
    formData.append('FileName', item.FileName);
    formData.append('DocumentType', item.DocumentType);
    formData.append('ProcessIdentifier', item.ProcessIdentifier);
    formData.append('DocumentDate', item.DocumentDate);
    formData.append('FileContent', item.FileContent);
    formData.append('Description', item.Description);
    formData.append('FileExtension', item.FileExtension);

    try {
      const token = await this.authService.getToken();

      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      return this.http.post<any>(`${environment.apiUrl}v1/Document/SaveDocs`, formData, { headers, observe: 'response' }).pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in saveDocument request:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          return throwError(error);
        })
      );
    } catch (error) {
      console.error('Error while constructing FormData:', error);
      throw error;
    }
  }

  // Método para salvar documento HTML
  async saveHtmlDocument(item: HtmlDocumentItem): Promise<Observable<any>> {

    const formData = new FormData();

    formData.append('FileName', item.FileName);
    formData.append('DocumentType', item.DocumentType);
    formData.append('ProcessIdentifier', item.ProcessIdentifier);
    formData.append('DocumentDate', item.DocumentDate);
    formData.append('Description', item.Description);

    return this.authService.getToken().then((token: any) => {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.post<any>(`${environment.apiUrl}v1/Document/SaveDocsHtml`, formData, { headers }).pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in saveHtmlDocument request:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          return throwError(error);
        })
      );
    });
  }

  // Método para baixar documento como PDF
  async downloadDocumentAsPdf(documentId: number): Promise<Observable<any>> {
    try {
      const token = await this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      const response = this.http.get(`${environment.apiUrl}v1/Document/DownloadDocumetAsPdf?documentId=${documentId}`, {
        headers,
        responseType: 'blob' as 'json'
      });

      return response as Observable<Blob>; // Retorna o Blob
    } catch (error) {
      console.error('Erro ao baixar o documento:', error);
      throw error; // Lança o erro para ser tratado externamente
    }
  }

  // Método para atualizar documento HTML
  async updateHtmlDocument(item: HtmlItemDocumentToEdit): Promise<Observable<any>> {

    const formData = new FormData();
    formData.append('id', item.id.toString());
    formData.append('ProcessIdentifier', item.processIdentifier);
    formData.append('HtmlContent', item.htmlContent);

    return this.authService.getToken().then((token: any) => {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.post<any>(`${environment.apiUrl}v1/Document/EditDocsHtml`, formData, { headers }).pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in updateHtmlDocument request:', error);
          return throwError(() => new Error('Document update failed'));
        })
      );
    });
  }
  // #endregion

  // #region Document Search and Retrieval
  // Método para buscar documentos por identificador de processo
  async fetchDocumentsByProcess(identifier: string): Promise<Observable<DocumentItem[]>> {
    const token = await this.authService.getToken();

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const encodedString = encodeURIComponent(identifier);
    return this.http.get<DocumentItem[]>(`${environment.apiUrl}v1/Document/getDocs?processIdentifier=${encodedString}`, { headers });
  }

  // Método para buscar arquivo de um documento
  async fetchDocumentFile(documentId: number): Promise<Observable<Blob>> {

    return this.authService.getToken().then((token: any) => {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get(`${environment.apiUrl}v1/Document/DownloadDocument?documentId=${documentId}`, {
        responseType: 'blob', headers
      });
    });
  }
  // #endregion

  // #region Authentication Methods
  checkAuthentication(): any {
    try {
      const token = this.authService.getGovBrToken();

      if (!token) {
        console.error('Token inválido ou ausente.');
        throw new Error('Token inválido ou ausente.');
      }


      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      // Certifique-se de que o URL da API está correto
      return this.http.get(`${environment.apiUrl}Auth/ValidateToken`, { headers }).subscribe({
        next: (response: any) => {
          console.log('Response:', response);
          return response;
        },
        error: (error: any) => {
          console.error('Erro na requisição:', error);
          throw error;
        }
      });
    } catch (error) {
      console.error('Erro ao tentar autorizar:', error);
      throw error;
    }
  }

  logoutGovBr() {
    try {
      const token = this.authService.getGovBrToken();

      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      // Certifique-se de que o URL da API está correto
      return this.http.get(`${environment.apiUrl}Auth/LogOutGovBr?token=${token}`, { headers }).subscribe({
        next: (response: any) => {
          console.log('Response:', response);
          return response;
        },
        error: (error: any) => {
          console.error('Erro na requisição:', error);
          throw error;
        }
      });
    } catch (error) {
      console.error('Erro ao tentar fazer logout:', error);
      throw error;
    }
  }
  // #endregion

  // #region New Document Operations
  // Método para salvar um novo documento usando NewDocumentDTO
  async saveNewDocument(document: NewDocumentDTO): Promise<Observable<any>> {
    console.log('DEBUG API: Recebido DocumentNumber:', document.DocumentNumber);

    const formData = new FormData();

    // Map DTO properties to FormData (matching backend CreateDocumentDto)
    formData.append('Name', document.name);
    formData.append('DocumentDate', document.documentDate);
    formData.append('File', document.file);
    formData.append('DocumentTypeId', document.documentTypeId.toString());
    if (document.subject) formData.append('Subject', document.subject);
    formData.append('Status', document.status);
    formData.append('IsPublic', document.isPublic.toString());
    formData.append('IsConfidential', document.isConfidential.toString());
    if (document.keywords) formData.append('Keywords', document.keywords);
    formData.append('CreatedByUserId', document.creatorUserId.toString()); // Backend usa CreatedByUserId
    if (document.observations) formData.append('Notes', document.observations); // Backend usa Notes

    if (document.DocumentNumber) {
      formData.append('ProcessIdentifier', document.DocumentNumber);
      console.log('DEBUG API: ProcessIdentifier adicionado ao FormData:', document.DocumentNumber);
    } else {
      console.log('DEBUG API: DocumentNumber está vazio/undefined');
    }

    // Adicionar novos campos para numeração manual
    if (document.useManualProtocol !== undefined) {
      formData.append('UseManualProtocol', document.useManualProtocol.toString());
      console.log('DEBUG API: UseManualProtocol adicionado ao FormData:', document.useManualProtocol);
    }

    if (document.manualProtocolNumber) {
      formData.append('ManualProtocolNumber', document.manualProtocolNumber);
      console.log('DEBUG API: ManualProtocolNumber adicionado ao FormData:', document.manualProtocolNumber);
    }

    // TreeOrder will be calculated automatically on backend

    try {
      const token = await this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      return this.http.post<any>(`${environment.apiUrl}v1/Document/SaveDocument `, formData, {
        headers,
        observe: 'response'
      }).pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in saveNewDocument request:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          return throwError(error);
        })
      );
    } catch (error) {
      console.error('Error while constructing FormData:', error);
      throw error;
    }
  }
  // #endregion

  // #region Advanced Search Operations
  async advancedSearch(searchRequest: AdvancedSearchRequest): Promise<Observable<AdvancedSearchResponse>> {
    try {
      const token = await this.authService.getToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      return this.http.post<AdvancedSearchResponse>(`${environment.apiUrl}v1/Document/AdvancedSearch`, searchRequest, {
        headers
      }).pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in advancedSearch request:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          return throwError(error);
        })
      );
    } catch (error) {
      console.error('Error in advancedSearch:', error);
      throw error;
    }
  }
  // #endregion

  // #region Document Type Operations
  async getDocumentTypes(): Promise<Observable<DocumentType[]>> {
    try {
      const token = await this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<DocumentType[]>(`${environment.apiUrl}v1/Document/GetDocumentsType`, { headers });
    } catch (error) {
      console.error('Error in getDocumentTypes:', error);
      throw error;
    }
  }

  async addDocumentType(documentType: any): Promise<Observable<any>> {
    try {
      const token = await this.authService.getToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      return this.http.post<any>(`${environment.apiUrl}v1/Document/AddDocumentType`, documentType, { headers }).pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in addDocumentType request:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          return throwError(error);
        })
      );
    } catch (error) {
      console.error('Error in addDocumentType:', error);
      throw error;
    }
  }

  async updateDocumentType(id: number, documentType: any): Promise<Observable<any>> {
    try {
      const token = await this.authService.getToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      return this.http.put<any>(`${environment.apiUrl}v1/Document/UpdateDocumentType/${id}`, documentType, { headers }).pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in updateDocumentType request:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          return throwError(error);
        })
      );
    } catch (error) {
      console.error('Error in updateDocumentType:', error);
      throw error;
    }
  }

  async getDocumentTypeById(id: number): Promise<Observable<DocumentType>> {
    try {
      const token = await this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<DocumentType>(`${environment.apiUrl}v1/Document/GetDocumentType/${id}`, { headers }).pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in getDocumentTypeById:', error);
          return throwError(error);
        })
      );
    } catch (error) {
      console.error('Error in getDocumentTypeById:', error);
      throw error;
    }
  }

  // #endregion

  //#region User Management Operations
  // Métodos relacionados à gestão de usuários 

  //Buscar as roles disponíveis
  async GetDefaultRoles(): Promise<Observable<GetDefaultRolesResponse[]>> {
    try {
      const token = await this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<GetDefaultRolesResponse[]>(`${environment.apiUrl}v1/Permission/roles`, { headers });
    } catch (error) {
      console.error('Error in getDocumentTypes:', error);
      throw error;
    }
  }

  //Buscar as permissões do sistema
  async GetAllPermissions(): Promise<Observable<GetDefaultPermissionsResponse[]>> {
    try {
      const token = await this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<GetDefaultPermissionsResponse[]>(`${environment.apiUrl}v1/Permission/permissions`, { headers });
    } catch (error) {
      console.error('Error in getAllPermissions:', error);
      throw error;
    }
  }

  // Buscar as permissões de uma role específica
  async GetRolePermissions(roleId: number): Promise<Observable<GetDefaultPermissionsResponse[]>> {
    try {
      const token = await this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      const url = `${environment.apiUrl}v1/Permission/roles/${roleId}/permissions`;
      console.log('🌐 GedApiService: GetRolePermissions chamado para role:', roleId);
      console.log('🌐 GedApiService: URL completa:', url);

      return this.http.get<any[]>(url, { headers }).pipe(
        tap((response) => {
          console.log('✅ GedApiService: Resposta recebida:', response);
          console.log('✅ GedApiService: Tipo da resposta:', typeof response);
          console.log('✅ GedApiService: É array?', Array.isArray(response));
          console.log('✅ GedApiService: Quantidade de itens:', response?.length);
          if (response && response.length > 0) {
            console.log('✅ GedApiService: Primeira permissão:', response[0]);
          }
        }),
        catchError((error) => {
          console.error('❌ GedApiService: Erro ao buscar permissões da role:', error);
          console.error('❌ GedApiService: Status do erro:', error?.status);
          console.error('❌ GedApiService: URL que falhou:', error?.url);

          // Se der 404, usar dados mockados baseados na role
          if (error?.status === 404) {
            console.log('🔄 GedApiService: API não encontrada, usando permissões mockadas para role', roleId);

            let mockPermissions: GetDefaultPermissionsResponse[] = [];

            if (roleId === 8) { // Administrador
              mockPermissions = [
                { id: 1, name: 'ACTIVATE_USERS', description: 'Ativar/desativar usuários' },
                { id: 2, name: 'ADVANCED_SEARCH_DOCUMENTS', description: 'Busca avançada de documentos' },
                { id: 3, name: 'CREATE_ROLES', description: 'Criar novas roles' },
                { id: 4, name: 'MANAGE_USERS', description: 'Gerenciar usuários' },
                { id: 5, name: 'MANAGE_PERMISSIONS', description: 'Gerenciar permissões' },
                { id: 6, name: 'VIEW_ADMIN_PANEL', description: 'Acessar painel administrativo' },
                { id: 7, name: 'DELETE_DOCUMENTS', description: 'Excluir documentos' },
                { id: 8, name: 'MODIFY_SYSTEM_SETTINGS', description: 'Modificar configurações do sistema' }
              ].map(p => ({ ...p, module: 'admin', action: 'manage', resource: 'system' }));
            } else if (roleId === 2) { // Usuário
              mockPermissions = [
                { id: 2, name: 'ADVANCED_SEARCH_DOCUMENTS', description: 'Busca avançada de documentos' },
                { id: 9, name: 'VIEW_DOCUMENTS', description: 'Visualizar documentos' },
                { id: 10, name: 'CREATE_DOCUMENTS', description: 'Criar documentos' },
                { id: 11, name: 'EDIT_OWN_DOCUMENTS', description: 'Editar próprios documentos' }
              ].map(p => ({ ...p, module: 'documents', action: 'access', resource: 'documents' }));
            } else { // Outras roles
              mockPermissions = [
                { id: 2, name: 'ADVANCED_SEARCH_DOCUMENTS', description: 'Busca avançada de documentos' },
                { id: 9, name: 'VIEW_DOCUMENTS', description: 'Visualizar documentos' }
              ].map(p => ({ ...p, module: 'documents', action: 'view', resource: 'documents' }));
            }

            return of(mockPermissions);
          }

          throw error;
        })
      );
    } catch (error) {
      console.error('Error in getRolePermissions:', error);
      throw error;
    }
  }

  async GetUserPermissions(): Promise<Observable<string[]>> {
    try {
      const token = await this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<string[]>(`${environment.apiUrl}v1/Permission/user-permissions`, { headers });
    } catch (error) {
      console.error('Error in getUserPermissions:', error);
      throw error;
    }
  }

  // #region User Operations

  // Método para buscar informações do usuário logado (/me)
  async getUserMe(): Promise<Observable<UserMeDto>> {
    try {
      console.log('🔧 GedApiService: getUserMe - Obtendo token...');
      const token = await this.authService.getToken();
      console.log('🔧 GedApiService: getUserMe - Token obtido:', token ? 'Token presente' : 'Sem token');

      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      const url = `${environment.apiUrl}AuthAzure/me`;

      console.log('🔧 GedApiService: getUserMe - Fazendo request para:', url);
      console.log('🔧 GedApiService: getUserMe - Headers:', headers.keys());

      return this.http.get<UserMeDto>(url, { headers }).pipe(
        tap((response) => {
          console.log('✅ GedApiService: getUserMe - Resposta recebida:', response);
        }),
        catchError((error) => {
          console.error('❌ GedApiService: getUserMe - Erro HTTP:', error);
          console.error('❌ GedApiService: getUserMe - Status:', error?.status);
          console.error('❌ GedApiService: getUserMe - URL:', error?.url);
          throw error;
        })
      );
    } catch (error) {
      console.error('❌ GedApiService: getUserMe - Erro geral:', error);
      throw error;
    }
  }

  // Método para buscar usuários paginados
  async getPagedUsers(params: GetPagedUsersParamsDto): Promise<Observable<PagedUsersResponseDto>> {
    try {
      console.log('🌐 GedApiService: getPagedUsers chamado com:', params);
      const token = await this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      const queryParams = new URLSearchParams();
      if (params.pageNumber) queryParams.append('PageNumber', params.pageNumber.toString());
      if (params.pageSize) queryParams.append('PageSize', params.pageSize.toString());
      if (params.searchTerm) queryParams.append('SearchTerm', params.searchTerm);

      const url = `${environment.apiUrl}v1/User/GetUsers?${queryParams.toString()}`;
      console.log('🌐 GedApiService: URL da requisição:', url);
      console.log('🌐 GedApiService: Headers:', headers.keys());

      return this.http.get<PagedUsersResponseDto>(url, { headers }).pipe(
        tap((response) => {
          console.log('✅ GedApiService: Resposta recebida:', response);
        }),
        catchError((error) => {
          console.error('❌ GedApiService: Erro HTTP:', error);
          console.error('❌ GedApiService: Status:', error?.status);
          console.error('❌ GedApiService: URL:', error?.url);

          // Se der 404, usar dados mockados
          if (error?.status === 404) {
            console.log('🔄 GedApiService: API não encontrada, usando dados mockados');
            const mockData: PagedUsersResponseDto = {
              users: [
                {
                  id: 1,
                  name: 'Bruno Administrador',
                  email: 'bruno@admin.com',
                  role: { id: 1, name: 'Administrador', description: 'Administrador do sistema' },
                  permissions: [],
                  isActive: true,
                  createdAt: new Date().toISOString()
                },
                {
                  id: 2,
                  name: 'Maria Silva',
                  email: 'maria@empresa.com',
                  role: { id: 2, name: 'Usuário', description: 'Usuário padrão' },
                  permissions: [],
                  isActive: true,
                  createdAt: new Date().toISOString()
                },
                {
                  id: 3,
                  name: 'João Santos',
                  email: 'joao@empresa.com',
                  role: { id: 2, name: 'Usuário', description: 'Usuário padrão' },
                  permissions: [],
                  isActive: false,
                  createdAt: new Date().toISOString()
                }
              ],
              totalCount: 3,
              totalPages: 1,
              currentPage: 1,
              pageSize: params.pageSize || 6
            };
            return of(mockData);
          }

          throw error;
        })
      );
    } catch (error) {
      console.error('❌ GedApiService: Erro geral:', error);
      throw error;
    }
  }

  // Método para atualizar permissões de usuário
  async updateUserPermissions(updateDto: UpdateUserPermissionsDto): Promise<Observable<any>> {
    try {
      const token = await this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.put(`${environment.apiUrl}v1/permission/permissions`, updateDto, { headers });
    } catch (error) {
      console.error('Error in updateUserPermissions:', error);
      throw error;
    }
  }
  // #endregion

  // #region Document Lifecycle Management
  // Método para cancelar documento
  async cancelDocument(documentId: number, userId: number, reason: string): Promise<Observable<any>> {
    try {
      const token = await this.authService.getToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const payload = { userId, reason };

      return this.http.post(
        `${environment.apiUrl}v1/Document/${documentId}/cancel`,
        payload,
        { headers }
      ).pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in cancelDocument request:', error);
          return throwError(() => error);
        })
      );
    } catch (error) {
      console.error('Error while canceling document:', error);
      throw error;
    }
  }

  // Método para reativar documento
  async reactivateDocument(documentId: number, userId: number, reason: string): Promise<Observable<any>> {
    try {
      const token = await this.authService.getToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const payload = { userId, reason };

      return this.http.post(
        `${environment.apiUrl}v1/Document/${documentId}/reactivate`,
        payload,
        { headers }
      ).pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in reactivateDocument request:', error);
          return throwError(() => error);
        })
      );
    } catch (error) {
      console.error('Error while reactivating document:', error);
      throw error;
    }
  }
  // #endregion

  // #region User Management
  // Método para criar usuário (v1/UserManagement)
 createUserManagement(dto: CreateUserManagementDto): Observable<any> {
  return from(this.authService.getToken()).pipe(
    switchMap(token => {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      console.log('🔧 GedApi: Enviando POST UserManagement');
      console.log('🔧 URL:', `${environment.apiUrl}v1/UserManagement`);
      console.log('🔧 Body:', JSON.stringify(dto, null, 2));

      return this.http.post(
        `${environment.apiUrl}v1/UserManagement`,
        dto,
        { headers }
      );
    }),
    catchError((error: HttpErrorResponse) => {
      console.error('❌ Error in createUserManagement request:', error);
      console.error('❌ Status:', error.status);
      console.error('❌ Response:', error.error);
      return throwError(() => error);
    })
  );
}

  // Método para atualizar usuário (v1/UserManagement - PUT com ID no body)
async updateUserManagement(dto: UpdateUserManagementDto): Promise<Observable<any>> {
  try {
    const token = await this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    // ✅ Adicione o ID na URL
    const userId = dto.id; // ou dto.Id, dependendo do seu DTO
    
    console.log('🔧 GedApi: Enviando PUT UserManagement');
    console.log('🔧 URL:', `${environment.apiUrl}v1/UserManagement/${userId}`);
    console.log('🔧 Body:', JSON.stringify(dto, null, 2));

    return this.http.put(
      `${environment.apiUrl}v1/UserManagement/${userId}`,  // ← ID adicionado aqui
      dto,
      { headers }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Error in updateUserManagement request:', error);
        console.error('❌ Status:', error.status);
        console.error('❌ Response:', error.error);
        return throwError(() => error);
      })
    );
  } catch (error) {
    console.error('Error while updating user:', error);
    throw error;
  }
}

  // Método para obter usuário por ID (v1/UserManagement/{id})
  async getUserManagementById(id: number): Promise<Observable<GetUserManagementResponse>> {
    try {
      const token = await this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      return this.http.get<GetUserManagementResponse>(
        `${environment.apiUrl}v1/UserManagement/${id}`,
        { headers }
      ).pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in getUserManagementById request:', error);
          return throwError(() => error);
        })
      );
    } catch (error) {
      console.error('Error while getting user:', error);
      throw error;
    }
  }
  // #endregion

  //#endregion
}
