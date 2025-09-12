import { Injectable } from "@angular/core";
import { Permission } from "../../types/base.types";
import GedApiService from "app/ged.api.service";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root',
})

export class PermissionService {
  constructor(private gedApi: GedApiService) { }   
  
  async GetAllPermissions(): Promise<Observable<Permission[]>> {
    return this.gedApi.GetAllPermissions();
  }

  
  
}