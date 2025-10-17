import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../authentication/auth.service';
import { environment } from '../../../environments/environment';
import {
  DocumentPersonalPermission,
  DocumentSectoralPermission,
  CreatePersonalPermissionDto,
  CreateSectoralPermissionDto,
  CheckPermissionResponse,
  DocumentPermissionsResponse,
  ShareDocumentDto
} from '../../types/permission.types';

@Injectable({
  providedIn: 'root'
})
export class DocumentPermissionService {
  private baseUrl = `${environment.apiUrl}v1/DocPermission`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // ========================================
  // CRIAR PERMISSÕES
  // ========================================

  async grantPersonalPermission(dto: CreatePersonalPermissionDto): Promise<Observable<any>> {
    const token = await this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.baseUrl}/personal`, dto, { headers });
  }

  async grantSectoralPermission(dto: CreateSectoralPermissionDto): Promise<Observable<any>> {
    const token = await this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.baseUrl}/sectoral`, dto, { headers });
  }

  async shareDocument(dto: ShareDocumentDto): Promise<Observable<any>> {
    const token = await this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.baseUrl}/share`, dto, { headers });
  }

  // ========================================
  // CONSULTAR PERMISSÕES
  // ========================================

  async checkPermission(
    documentId: number,
    userId: number,
    sectorId?: number
  ): Promise<Observable<CheckPermissionResponse>> {
    const token = await this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const params: any = { documentId, userId };
    if (sectorId) params.sectorId = sectorId;

    const queryString = new URLSearchParams(params).toString();
    return this.http.get<CheckPermissionResponse>(
      `${this.baseUrl}/check?${queryString}`,
      { headers }
    );
  }

  async getDocumentPermissions(documentId: number): Promise<Observable<DocumentPermissionsResponse>> {
    const token = await this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<DocumentPermissionsResponse>(
      `${this.baseUrl}/document/${documentId}`,
      { headers }
    );
  }

  async getUserPermissionsForDocument(
    userId: number,
    documentId: number
  ): Promise<Observable<DocumentPersonalPermission[]>> {
    const token = await this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<DocumentPersonalPermission[]>(
      `${this.baseUrl}/user/${userId}/document/${documentId}`,
      { headers }
    );
  }

  // ========================================
  // ATUALIZAR/REVOGAR PERMISSÕES
  // ========================================

  async updatePersonalPermission(
    permissionId: number,
    dto: Partial<CreatePersonalPermissionDto>
  ): Promise<Observable<any>> {
    const token = await this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.put(`${this.baseUrl}/personal/${permissionId}`, dto, { headers });
  }

  async revokePersonalPermission(permissionId: number): Promise<Observable<any>> {
    const token = await this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete(`${this.baseUrl}/personal/${permissionId}`, { headers });
  }

  async revokeSectoralPermission(permissionId: number): Promise<Observable<any>> {
    const token = await this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete(`${this.baseUrl}/sectoral/${permissionId}`, { headers });
  }

  async revokeAllUserPermissions(
    userId: number,
    documentId: number
  ): Promise<Observable<any>> {
    const token = await this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete(
      `${this.baseUrl}/user/${userId}/document/${documentId}`,
      { headers }
    );
  }
}
