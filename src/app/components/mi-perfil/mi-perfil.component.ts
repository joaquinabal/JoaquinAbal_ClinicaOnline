import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.css'
})
export class MiPerfilComponent implements OnInit {
  user: any = null;
  dataUsuario: any = null;
  rol: 'paciente' | 'especialista' | 'administrador' | null = null;

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    this.user = await this.supabase.getUser();
    if (this.user) {
      // Obtener el rol e info del usuario
      const resultado = await this.supabase.obtenerDatosUsuarioConRol(this.user.id);
      this.rol = resultado.rol;
      this.dataUsuario = resultado.data;
    }
  }
}
