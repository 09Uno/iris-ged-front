import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ToolBarComponent } from "../../../features/tool-bar.component/tool-bar.component";
import { FormsModule } from '@angular/forms';
import {MatDatepickerModule} from '@angular/material/datepicker';


@Component({
  selector: 'app-videos',
  standalone: true,
  templateUrl: './video-gallery.component.html',
  styleUrls: ['./video-gallery.component.scss'],
  imports: [CommonModule, ToolBarComponent, FormsModule,MatDatepickerModule]
})
export class VideoGalleryComponent implements OnInit {
[x: string]: any;
  
title: string = 'Vídeos';
isProfessional: boolean = false;
isCorporative: boolean = true;

searchQuery: string = ''; // Texto de pesquisa
  selectedDate: string = ''; // Data selecionada no filtro
  selectedCameras: { [key: number]: boolean } = {}; // Estados das câmaras selecionadas

  // Lista dinâmica de câmaras
  cameras = [
    { id: 1, nome: 'Câmara 1' },
    { id: 2, nome: 'Câmara 2' },
    { id: 3, nome: 'Câmara 3' }
  ];

  ngOnInit(): void {
    console.log('Video Gallery Component');
  }

  videos = [
    {
      nome: 'Tutorial Angular',
      descricao: 'Aprenda os conceitos básicos do Angular.',
      url: 'https://www.w3schools.com/html/mov_bbb.mp4'
    },
    {
      nome: 'Design Responsivo',
      descricao: 'Dicas para criar layouts responsivos.',
      url: 'https://www.w3schools.com/html/movie.mp4'
    },
    {
      nome: 'Como usar Flexbox',
      descricao: 'Entenda como funciona o CSS Flexbox.',
      url: 'https://www.w3schools.com/html/mov_bbb.mp4'
    }
  ];

  viewMode: 'grid' | 'list' = 'grid'; // Inicialização do viewMode
}
