import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-turnos-especialista.component.html',
})
export class MisTurnosComponent implements OnInit {
  turnos: any[] = [];
  filtroEspecialidad = '';
  filtroPaciente = '';
  userId: string = '';

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    const user = await this.supabase.getUser();
    if(user){
      this.userId = user.id;
    }
    this.turnos = await this.supabase.getTurnosPorEspecialista(this.userId);
  }

  turnosFiltrados() {
    return this.turnos.filter(turno => {
      const coincideEspecialidad = turno.especialidad.toLowerCase().includes(this.filtroEspecialidad.toLowerCase());
      const nombreCompleto = `${turno.nombrePaciente} ${turno.apellidoPaciente}`.toLowerCase();
      const coincidePaciente = nombreCompleto.includes(this.filtroPaciente.toLowerCase());
      return coincideEspecialidad && coincidePaciente;
    });
  }

  puedeAceptar(estado: string) {
    return !['Realizado', 'Cancelado', 'Rechazado'].includes(estado);
  }

  puedeRechazar(estado: string) {
    return !['Aceptado', 'Realizado', 'Cancelado', 'Rechazado'].includes(estado);
  }

  puedeCancelar(estado: string) {
    return !['Aceptado', 'Realizado', 'Rechazado'].includes(estado);
  }

  puedeFinalizar(estado: string) {
    return estado === 'Aceptado';
  }

  puedeVerResena(turno: any) {
    return turno.resena && turno.resena.trim() !== '';
  }

  async aceptarTurno(turno: any) {
    await this.supabase.actualizarEstadoTurno(turno.id, 'Aceptado');
    turno.estado = 'Aceptado';
  }

  async rechazarTurno(turno: any) {
    const motivo = prompt('Motivo del rechazo:');
    if (motivo) {
      await this.supabase.rechazarTurno(turno.id, motivo);
      turno.estado = 'Rechazado';
    }
  }

  async cancelarTurno(turno: any) {
    const motivo = prompt('Motivo de la cancelación:');
    if (motivo) {
      await this.supabase.cancelarTurno(turno.id, motivo);
      turno.estado = 'Cancelado';
    }
  }

  async finalizarTurno(turno: any) {
    const resena = prompt('Ingrese la reseña / diagnóstico del turno:');
    if (resena) {
      await this.supabase.finalizarTurno(turno.id, resena);
      turno.estado = 'Realizado';
      turno.resena = resena;
    }
  }

  verResena(turno: any) {
    alert(`Reseña:\n\n${turno.resena}`);
  }

  estadoClass(estado: string) {
    switch (estado) {
      case 'Cancelado': return 'text-danger fw-bold';
      case 'Realizado': return 'text-success fw-bold';
      case 'Pendiente': return 'text-primary fw-bold';
      case 'Aceptado': return 'text-warning fw-bold';
      case 'Rechazado': return 'text-muted fw-bold';
      default: return 'text-secondary';
    }
  }
}
