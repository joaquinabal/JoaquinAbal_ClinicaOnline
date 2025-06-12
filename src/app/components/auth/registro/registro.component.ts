import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router'; // Importar RouterModule
import { CommonModule } from '@angular/common'; // Importar CommonModule
import { Router } from '@angular/router';
import { NgModule } from '@angular/core';
@Component({
  selector: 'app-registro',
  standalone: false, // Este componente es parte de un módulo (RegistroModule)
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {
constructor(private router: Router) {}


  
}