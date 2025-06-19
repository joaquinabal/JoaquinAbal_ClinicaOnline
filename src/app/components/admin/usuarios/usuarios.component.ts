import { Component } from '@angular/core';
import { RegistroUsuarioComponent } from './registrar-usuario/registrar-usuario.component';
import { VerUsuarioComponent } from './ver-usuario/ver-usuario.component';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-usuarios',
  imports: [RegistroUsuarioComponent, VerUsuarioComponent, CommonModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent {
 opcion: 'ver' | 'registrar' | null = null;
}
