import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { RouterLink, RouterModule } from '@angular/router';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.css'
})
export class MiPerfilComponent implements OnInit {
  historias: any[] = [];
  user: any = null;
  dataUsuario: any = null;
  rol: 'paciente' | 'especialista' | 'administrador' | null = null;

  constructor(private supabase: SupabaseService, private loadingService: LoadingService) {}

  async ngOnInit() {
    this.user = await this.supabase.getUser();
    if (this.user) {
      // Obtener el rol e info del usuario
      this.loadingService.mostrar();
      const resultado = await this.supabase.obtenerDatosUsuarioConRol(this.user.id);
      this.historias = await this.supabase.getHistoriasClinicasPorPaciente(this.user.id);
            this.loadingService.ocultar();
      console.log(this.historias)
      this.rol = resultado.rol;
      this.dataUsuario = resultado.data;
    }
  }
}
