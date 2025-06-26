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
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('400ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class UsuariosComponent {
 opcion: 'ver' | 'registrar' | 'historia-clinica' | null = null;
}
