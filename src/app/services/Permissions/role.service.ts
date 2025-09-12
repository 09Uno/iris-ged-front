import { Injectable } from "@angular/core";
import { GetDefaultRolesResponse } from "../../types/permissions.types";
import GedApiService from "../../ged.api.service";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class RoleService {


    constructor(private gedApi: GedApiService) { }
    
    async getAllRoles(): Promise<Observable<GetDefaultRolesResponse[]>> {
      return await this.gedApi.GetDefaultRoles();
    }

}