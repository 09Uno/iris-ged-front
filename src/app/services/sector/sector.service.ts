import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../authentication/auth.service';
import { environment } from '../../../environments/environment';
import { Sector, CreateSectorDto, UpdateSectorDto } from '../../types/sector.types';

@Injectable({
  providedIn: 'root'
})
export class SectorService {
  private baseUrl = `${environment.apiUrl}v1/Sector`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  async getAllSectors(): Promise<Observable<Sector[]>> {
    const token = await this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<Sector[]>(`${this.baseUrl}`, { headers });
  }

  async getActiveSectors(): Promise<Observable<Sector[]>> {
    const token = await this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<Sector[]>(`${this.baseUrl}/active`, { headers });
  }

  async getSectorById(id: number): Promise<Observable<Sector>> {
    const token = await this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<Sector>(`${this.baseUrl}/${id}`, { headers });
  }

  async createSector(dto: CreateSectorDto): Promise<Observable<Sector>> {
    const token = await this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<Sector>(`${this.baseUrl}`, dto, { headers });
  }

  async updateSector(id: number, dto: UpdateSectorDto): Promise<Observable<Sector>> {
    const token = await this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.put<Sector>(`${this.baseUrl}/${id}`, dto, { headers });
  }

  async deleteSector(id: number): Promise<Observable<any>> {
    const token = await this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete(`${this.baseUrl}/${id}`, { headers });
  }

  async deactivateSector(id: number): Promise<Observable<any>> {
    const token = await this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(`${this.baseUrl}/${id}/deactivate`, {}, { headers });
  }

  async activateSector(id: number): Promise<Observable<any>> {
    const token = await this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(`${this.baseUrl}/${id}/activate`, {}, { headers });
  }
}
