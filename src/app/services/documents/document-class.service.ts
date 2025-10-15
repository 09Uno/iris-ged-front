import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap, throwError, of, map } from 'rxjs';
import { AuthService } from '../authentication/auth.service';
import { environment } from '../../../environments/environment';
import {
  DocumentClass,
  CreateDocumentClassDto,
  UpdateDocumentClassDto,
  DocumentClassHierarchy
} from '../../types/document.types';

// Interface para o formato do backend
interface DocumentClassBackend {
  id: number;
  codigo: string;
  termoCompleto: string | null;
  descricao: string;
  classePaiId: number | null;
  prazoGuardaCorrente: number;
  prazoGuardaIntermediaria: number;
  destinacaoFinal: number;
  observacoes: string | null;
  ativa: boolean;
  dataCriacao: string;
  dataInativacao: string | null;
  usuarioCriadorId: number;
}

@Injectable({
  providedIn: 'root',
})
export class DocumentClassService {
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Mapeia dados do backend para o formato frontend
   */
  private mapBackendToFrontend(backend: DocumentClassBackend): DocumentClass {
    return {
      id: backend.id,
      code: backend.codigo,
      fullTerm: backend.termoCompleto || backend.descricao, // Se termoCompleto é null, usa descrição
      description: backend.descricao,
      parentClassId: backend.classePaiId || undefined,
      currentRetentionPeriod: backend.prazoGuardaCorrente,
      intermediateRetentionPeriod: backend.prazoGuardaIntermediaria,
      finalDisposition: backend.destinacaoFinal,
      notes: backend.observacoes || undefined,
      active: backend.ativa,
      createdAt: backend.dataCriacao,
      inactivatedAt: backend.dataInativacao || undefined
    };
  }

  /**
   * Mapeia hierarquia do backend para o formato frontend
   */
  private mapHierarchyBackendToFrontend(backend: any): DocumentClassHierarchy {
    const base = this.mapBackendToFrontend(backend);
    return {
      ...base,
      children: backend.children ? backend.children.map((c: any) => this.mapHierarchyBackendToFrontend(c)) : undefined,
      level: backend.level
    };
  }

  /**
   * Mapeia dados do frontend para o formato backend (create)
   */
  private mapFrontendToBackendCreate(dto: CreateDocumentClassDto): any {
    return {
      codigo: dto.code,
      termoCompleto: dto.fullTerm,
      descricao: dto.description || dto.fullTerm,
      classePaiId: dto.parentClassId || null,
      prazoGuardaCorrente: dto.currentRetentionPeriod,
      prazoGuardaIntermediaria: dto.intermediateRetentionPeriod,
      destinacaoFinal: dto.finalDisposition,
      observacoes: dto.notes || null,
      usuarioCriadorId: dto.createdByUserId
    };
  }

  /**
   * Mapeia dados do frontend para o formato backend (update)
   */
  private mapFrontendToBackendUpdate(dto: UpdateDocumentClassDto): any {
    return {
      codigo: dto.code,
      descricao: dto.description,
      classePaiId: dto.parentClassId || null,
      prazoGuardaCorrente: dto.currentRetentionPeriod,
      prazoGuardaIntermediaria: dto.intermediateRetentionPeriod,
      destinacaoFinal: dto.finalDisposition,
      observacoes: dto.notes || null
    };
  }

  /**
   * Buscar todas as classes documentais
   */
  async getAll(): Promise<Observable<DocumentClass[]>> {
    try {
      const token = await this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      return this.http.get<DocumentClassBackend[]>(`${environment.apiUrl}v1/DocumentClass`, { headers }).pipe(
        map(classes => classes.map(c => this.mapBackendToFrontend(c))),
        tap(() => console.log('Successfully fetched document classes.')),
        catchError((error: HttpErrorResponse) => {
          console.error('Error fetching document classes:', error);
          return of([]);
        })
      );
    } catch (error) {
      console.error('Error in getAll:', error);
      throw error;
    }
  }

  /**
   * Buscar classe documental por ID
   */
  async getById(id: number): Promise<Observable<DocumentClass>> {
    try {
      const token = await this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      return this.http.get<DocumentClassBackend>(`${environment.apiUrl}v1/DocumentClass/${id}`, { headers }).pipe(
        map(c => this.mapBackendToFrontend(c)),
        tap((result) => console.log('Document class fetched:', result)),
        catchError((error: HttpErrorResponse) => {
          console.error('Error fetching document class by ID:', error);
          return throwError(() => error);
        })
      );
    } catch (error) {
      console.error('Error in getById:', error);
      throw error;
    }
  }

  /**
   * Buscar classe documental por código
   */
  async getByCode(code: string): Promise<Observable<DocumentClass>> {
    try {
      const token = await this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      return this.http.get<DocumentClassBackend>(`${environment.apiUrl}v1/DocumentClass/code/${code}`, { headers }).pipe(
        map(c => this.mapBackendToFrontend(c)),
        tap((result) => console.log('Document class fetched by code:', result)),
        catchError((error: HttpErrorResponse) => {
          console.error('Error fetching document class by code:', error);
          return throwError(() => error);
        })
      );
    } catch (error) {
      console.error('Error in getByCode:', error);
      throw error;
    }
  }

  /**
   * Buscar hierarquia completa de classes documentais
   */
  async getHierarchy(): Promise<Observable<DocumentClassHierarchy[]>> {
    try {
      const token = await this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      return this.http.get<any[]>(`${environment.apiUrl}v1/DocumentClass/hierarchy`, { headers }).pipe(
        map(hierarchies => hierarchies.map(h => this.mapHierarchyBackendToFrontend(h))),
        tap(() => console.log('Successfully fetched document class hierarchy.')),
        catchError((error: HttpErrorResponse) => {
          console.error('Error fetching document class hierarchy:', error);
          return of([]);
        })
      );
    } catch (error) {
      console.error('Error in getHierarchy:', error);
      throw error;
    }
  }

  /**
   * Buscar classes filhas de uma classe pai específica
   */
  async getByParent(parentId?: number): Promise<Observable<DocumentClass[]>> {
    try {
      const token = await this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      const url = parentId
        ? `${environment.apiUrl}v1/DocumentClass/children/${parentId}`
        : `${environment.apiUrl}v1/DocumentClass/children`;

      return this.http.get<DocumentClassBackend[]>(url, { headers }).pipe(
        map(classes => classes.map(c => this.mapBackendToFrontend(c))),
        tap(() => console.log('Successfully fetched child document classes.')),
        catchError((error: HttpErrorResponse) => {
          console.error('Error fetching child document classes:', error);
          return of([]);
        })
      );
    } catch (error) {
      console.error('Error in getByParent:', error);
      throw error;
    }
  }

  /**
   * Criar nova classe documental
   */
  async create(dto: CreateDocumentClassDto): Promise<Observable<{ id: number }>> {
    try {
      const token = await this.authService.getToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const backendDto = this.mapFrontendToBackendCreate(dto);

      return this.http.post<{ id: number }>(`${environment.apiUrl}v1/DocumentClass`, backendDto, { headers }).pipe(
        tap((result) => console.log('Document class created:', result)),
        catchError((error: HttpErrorResponse) => {
          console.error('Error creating document class:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          return throwError(() => error);
        })
      );
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }

  /**
   * Atualizar classe documental
   */
  async update(id: number, dto: UpdateDocumentClassDto): Promise<Observable<{ message: string }>> {
    try {
      const token = await this.authService.getToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const backendDto = this.mapFrontendToBackendUpdate(dto);

      return this.http.put<{ message: string }>(`${environment.apiUrl}v1/DocumentClass/${id}`, backendDto, { headers }).pipe(
        tap((result) => console.log('Document class updated:', result)),
        catchError((error: HttpErrorResponse) => {
          console.error('Error updating document class:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          return throwError(() => error);
        })
      );
    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    }
  }

  /**
   * Deletar classe documental
   */
  async delete(id: number): Promise<Observable<{ message: string }>> {
    try {
      const token = await this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      return this.http.delete<{ message: string }>(`${environment.apiUrl}v1/DocumentClass/${id}`, { headers }).pipe(
        tap((result) => console.log('Document class deleted:', result)),
        catchError((error: HttpErrorResponse) => {
          console.error('Error deleting document class:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          return throwError(() => error);
        })
      );
    } catch (error) {
      console.error('Error in delete:', error);
      throw error;
    }
  }

  /**
   * Buscar classes ativas para seleção em formulários
   */
  async getActiveClasses(): Promise<Observable<DocumentClass[]>> {
    try {
      const allClasses = await this.getAll();
      return new Observable(observer => {
        allClasses.subscribe({
          next: (classes) => {
            const activeClasses = classes.filter(c => c.active);
            observer.next(activeClasses);
            observer.complete();
          },
          error: (error) => observer.error(error)
        });
      });
    } catch (error) {
      console.error('Error in getActiveClasses:', error);
      throw error;
    }
  }
}
