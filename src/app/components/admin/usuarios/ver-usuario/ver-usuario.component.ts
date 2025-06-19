import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../../../services/supabase.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-ver-usuarios',
  templateUrl: './ver-usuario.component.html',
  styleUrls: ['./ver-usuario.component.css']
})
export class VerUsuarioComponent implements OnInit {
  pacientes: any[] = [];
  especialistas: any[] = [];
  administradores: any[] = [];

  cargando = false;

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit(): void {
    this.obtenerUsuarios();
  }

  async obtenerUsuarios() {
    this.cargando = true;

    const [pacRes, espRes, adminRes] = await Promise.all([
      this.supabaseService.getPacientes(),
      this.supabaseService.getEspecialistas(),
      this.supabaseService.getAdministradores()
    ]);

    this.pacientes = pacRes.data || [];
    this.especialistas = espRes.data || [];
    this.administradores = adminRes.data || [];

    this.cargando = false;
  }

  async toggleHabilitacion(especialista: any) {
    const nuevoEstado = !especialista.habilitado;
    const res = await this.supabaseService.updateEspecialistaHabilitacion(especialista.id, nuevoEstado);
    if (!res.error) {
      especialista.habilitado = nuevoEstado;
    }
  }
}