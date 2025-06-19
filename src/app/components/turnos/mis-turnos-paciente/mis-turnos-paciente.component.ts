import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';


@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./mis-turnos-paciente.component.html"
})
export class MisTurnosComponent implements OnInit {
  turnos: any[] = [];
  filtroEspecialidad = '';
  filtroEspecialista = '';
  userId: string = '';

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    const user = await this.supabase.getUser();
    if(user){
      this.userId = user.id;
    } 
    this.turnos = await this.supabase.getTurnosPorPaciente(this.userId);
  }

  turnosFiltrados() {
    return this.turnos.filter(turno => {
      const coincideEspecialidad = turno.especialidad.toLowerCase().includes(this.filtroEspecialidad.toLowerCase());
      const nombreCompleto = `${turno.nombreEspecialista} ${turno.apellidoEspecialista}`.toLowerCase();
      const coincideEspecialista = nombreCompleto.includes(this.filtroEspecialista.toLowerCase());
      return coincideEspecialidad && coincideEspecialista;
    });
  }

  // Visibilidad de acciones
  puedeCancelar(estado: string): boolean {
    return estado !== 'Realizado' && estado !== 'Cancelado';
  }

  puedeVerResena(turno: any): boolean {
    return turno.resena && turno.resena.trim() !== '';
  }

  puedeCompletarEncuesta(turno: any): boolean {
    return turno.estado === 'Realizado' && !turno.encuesta_completada;
  }

  puedeCalificar(turno: any): boolean {
    return turno.estado === 'Realizado' && !turno.calificacion;
  }

  // Acciones (en desarrollo)
  cancelarTurno(turno: any) {
    const motivo = prompt('¿Por qué deseas cancelar este turno?');
    if (motivo) {
      this.supabase.cancelarTurno(turno.id, motivo).then(() => {
        turno.estado = 'Cancelado';
      });
    }
  }

  verResena(turno: any) {
    alert(`Reseña del especialista:\n\n${turno.resena}`);
  }

  completarEncuesta(turno: any) {
    // Lógica para redirigir a encuesta
    alert('Redirigiendo a encuesta (por implementar)...');
  }

  calificarAtencion(turno: any) {
    const comentario = prompt('Deja un comentario sobre la atención recibida:');
    const puntuacion = prompt('Calificá la atención del 1 al 5:');
    if (comentario && puntuacion) {
      this.supabase.calificarTurno(turno.id, comentario, parseInt(puntuacion)).then(() => {
        turno.calificacion = parseInt(puntuacion);
      });
    }
  }

  estadoClass(estado: string) {
    switch (estado) {
      case 'Cancelado': return 'text-danger fw-bold';
      case 'Realizado': return 'text-success fw-bold';
      case 'Pendiente': return 'text-primary fw-bold';
      case 'Aceptado': return 'text-warning fw-bold';
      default: return 'text-secondary';
    }
  }
}
