import { Component, Input } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatMenuTrigger} from '@angular/material/menu';
import {ViewChild} from '@angular/core';
import {MatMenuModule} from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tool-bar',
  standalone: true,
  imports: [
    MatToolbarModule,
     MatButtonModule, 
     MatIconModule, 
     MatMenuTrigger, 
     MatMenuModule,
     RouterModule
  ],
  templateUrl: './tool-bar.component.component.html',
  styleUrl: './tool-bar.component.component.scss'
})

export class ToolBarComponentComponent {
  @ViewChild(MatMenuTrigger) trigger!: MatMenuTrigger;
  @Input() title : string = '';


  logo = 'assets/logo_big.png';
  
  someMethod() {
    this.trigger.openMenu();
  }

  gotoHome() {
    
    
  }

  logout() {
  }
}
