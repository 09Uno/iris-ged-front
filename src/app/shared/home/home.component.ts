import { Component, Inject, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { createClaimsTable } from '../../utils/claim-utils';  // Corrigido para importar a função
import { MsalBroadcastService, MsalService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { AuthenticationResult, InteractionStatus, InteractionType } from '@azure/msal-browser';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { ToolBarComponent } from "../../features/tool-bar.component/tool-bar.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true, // Componente Stand-alone
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    ToolBarComponent
],
})
export class HomeComponent  {
  loginDisplay = false;
  dataSource: any = [];
  displayedColumns: string[] = ['claim', 'value', 'description'];
  isAuthenticated: boolean = false;
  userName: string = '';


  constructor(
    
  ) { }





 


  
}