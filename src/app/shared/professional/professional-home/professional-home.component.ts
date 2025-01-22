import { AuthService } from '../../../services/authentication/auth.service';
import { Component, OnInit } from '@angular/core';
import { ToolBarComponent } from "../../../features/tool-bar.component/tool-bar.component";
import { CommonModule } from '@angular/common';
import GedApiService from '../../../ged.api.service';

@Component({
  selector: 'app-professional-home',
  standalone: true,
  imports: [
    ToolBarComponent,
    CommonModule,
  ],
  templateUrl: './professional-home.component.html',
  styleUrls: ['./professional-home.component.scss'] // Corrigido de styleUrl para styleUrls
})
export class ProfessionalHomeComponent implements OnInit { // Agora implementa OnInit corretamente
  isProfessional: boolean = true;
  isCorporative: boolean = false;
  isAuthenticated: boolean = false;
  home = 'assets/home.png';

  constructor(private authService: AuthService, private gedApi : GedApiService) {}

  // Agora, o método ngOnInit está correto, implementado via OnInit
  async ngOnInit(): Promise<void> {
   
    (this.authService.isGovBrAuthenticated()).subscribe((authStatus: boolean) => {
      this.isAuthenticated = authStatus;
      console.log('isAuthenticated:', this.isAuthenticated);
    });  
  } 
  }

