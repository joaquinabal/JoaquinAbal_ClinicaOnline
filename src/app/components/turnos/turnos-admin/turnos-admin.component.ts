import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoadingService } from '../../../services/loading.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-turnos-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './turnos-admin.component.html',
  styleUrls: ['./turnos-admin.component.css']
})
export class TurnosAdminComponent implements OnInit {
  turnos: any[] = [];
  especialidades: string[] = [];
  especialistas: any[] = [];

  filtroEspecialidad: string | null = null;
  filtroEspecialistaId: string | null = null;

  // Para cancelar turno
  turnoACancelar: any = null;
  comentarioCancelacion: string = '';

  cargando = false;

  constructor(private supabase: SupabaseService, private loadingService: LoadingService) {}

  async ngOnInit() {
    this.loadingService.mostrar();
    this.especialidades = await this.supabase.getEspecialidades();
    this.especialistas = await this.supabase.obtenerEspecialistas();
    await this.cargarTurnos();
    this.loadingService.ocultar();
  }

  async cargarTurnos() {
    this.cargando = true;
    this.turnos = await this.supabase.getTurnosAdmin();
    this.cargando = false;
  }

  filtrarTurnos() {
    let filtrados = [...this.turnos];
    if (this.filtroEspecialidad)
      filtrados = filtrados.filter(t => t.especialidad === this.filtroEspecialidad);
    if (this.filtroEspecialistaId)
      filtrados = filtrados.filter(t => t.especialista_id === this.filtroEspecialistaId);
    return filtrados;
  }

  puedeCancelar(turno: any) {
    // Solo si estado !== aceptado, realizado o rechazado
    return !['aceptado', 'realizado', 'rechazado', 'cancelado'].includes((turno.estado || '').toLowerCase());
  }

  seleccionarTurnoParaCancelar(turno: any) {
    this.turnoACancelar = turno;
    this.comentarioCancelacion = '';
  }

  async confirmarCancelacion() {
    if (!this.comentarioCancelacion.trim()) {
      alert('Debe ingresar un comentario para cancelar el turno.');
      return;
    }
    await this.supabase.cancelarTurnoAdmin(this.turnoACancelar.id, this.comentarioCancelacion);
    alert('Turno cancelado');
    await this.cargarTurnos();
    this.turnoACancelar = null;
  }
}
