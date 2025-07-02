import { Component } from '@angular/core';
import { RegistroUsuarioComponent } from './registrar-usuario/registrar-usuario.component';
import { VerUsuarioComponent } from './ver-usuario/ver-usuario.component';
import { CommonModule } from '@angular/common';
import { HistoriasClinicasAdminComponent } from './historias-clinicas-admin/historias-clinicas-admin.component';
import { trigger, transition, style, animate } from '@angular/animations';


@Component({
  standalone: true,
  selector: 'app-usuarios',
  imports: [RegistroUsuarioComponent, VerUsuarioComponent, CommonModule, HistoriasClinicasAdminComponent],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
  animations: [
     trigger('slideInOut', [
  // Al entrar: desde -100% (izquierda) a 0
  transition(':enter', [
    style({ transform: 'translateX(-100%)', opacity: 0 }),
    animate('800ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
  ]),
  // Al salir: de 0 a +100% (derecha)
  transition(':leave', [
    animate('800ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
  ])
])]
})  
export class UsuariosComponent {
 opcion: 'ver' | 'registrar' | 'historia-clinica' | null = null;
}
