import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../authentication/auth.service';
import { environment } from '../../../environments/environment';
import { Workflow, CreateWorkflowDto, CompleteWorkflowDto } from '../../types/workflow.types';

@Injectable({
  providedIn: 'root'
})
export class WorkflowService {
  private baseUrl = `${environment.apiUrl}v1/Workflow`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // ========================================
  // TRAMITAR DOCUMENTO
  // ========================================

  async forwardDocument(dto: CreateWorkflowDto): Promise<Observable<any>> {
    const token = await this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.baseUrl}/forward`, dto, { headers });
  }

  // ========================================
  // FINALIZAR TRAMITAÇÃO
  // ========================================

  async completeWorkflow(workflowId: number, dto: CompleteWorkflowDto): Promise<Observable<any>> {
    const token = await this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.baseUrl}/${workflowId}/complete`, dto, { headers });
  }

  // ========================================
  // CONSULTAR WORKFLOWS
  // ========================================

  async getWorkflowById(id: number): Promise<Observable<Workflow>> {
    const token = await this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<Workflow>(`${this.baseUrl}/${id}`, { headers });
  }

  async getDocumentHistory(documentId: number): Promise<Observable<Workflow[]>> {
    const token = await this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<Workflow[]>(
      `${this.baseUrl}/document/${documentId}/history`,
      { headers }
    );
  }

  async getDocumentHistoryDetailed(documentId: number): Promise<Observable<any>> {
    const token = await this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<any>(
      `${this.baseUrl}/document/${documentId}/history-detailed`,
      { headers }
    );
  }

  async getPendingWorkflowsByDepartment(department: string): Promise<Observable<Workflow[]>> {
    const token = await this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<Workflow[]>(
      `${this.baseUrl}/department/${department}`,
      { headers }
    );
  }
}
