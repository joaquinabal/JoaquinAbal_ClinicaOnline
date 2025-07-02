import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AmPmPipe } from '../../../pipes/ampm/ampm.pipe';
import { FechaPipe } from '../../../pipes/fechaEspañol/fecha-español.pipe';

@Component({
  selector: 'app-mis-turnos-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AmPmPipe, FechaPipe, ReactiveFormsModule],
  templateUrl: './mis-turnos-paciente.component.html',
})
export class MisTurnosPacienteComponent implements OnInit {
  turnos: any[] = [];
  filtroTurno = '';
  filtroEspecialidad = '';
  filtroEspecialista = '';
  userId: string = '';
  mensaje: { [turnoId: string]: string } = {};
  abierto: { [turnoId: string]: string | null } = {};
  calificacion: { [turnoId: string]: number } = {};
  comentario: { [turnoId: string]: string } = {};
  // encuesta: { [turnoId: string]: any } = {}; // Si más adelante la habilitas
  historiasClinicasMap: { [turnoId: string]: any } = {};
    encuestaAbierta: { [turnoId: string]: boolean } = {};
  nuevaEncuesta: { [turnoId: string]: {
    especialista: number;
    clinica: number;
    administrativo: number;
      }} = {};

        encuestas: any[] = [];



  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
  const user = await this.supabase.getUser();
  if (user) {
    this.userId = user.id;
    this.turnos = await this.supabase.getTurnosPorPaciente(this.userId);
    const ids = this.turnos.map(t => t.id);
    // Carga historias clínicas asociadas a estos turnos
    this.historiasClinicasMap = await this.supabase.getHistoriasDePacienteClinicasPorTurnos(ids);
  }
      this.encuestas = await this.supabase.getEncuestasPorPaciente(this.userId);


  
}

  tieneEncuesta(turno: any): boolean {
    return this.encuestas.some(e => e.turno_id === turno.id);
  }

  puedeAbrirEncuesta(turno: any): boolean {
    return turno.estado === 'Realizado' && !this.tieneEncuesta(turno);
  }

  abrirEncuesta(turno: any) {
    this.encuestaAbierta[turno.id] = true;
    this.nuevaEncuesta[turno.id] = {
      especialista: 5,
      clinica: 5,
      administrativo: 5
    };
  }

  cerrarEncuesta(turno: any) {
    this.encuestaAbierta[turno.id] = false;
  }

  // envía al servicio
  async enviarEncuesta(turno: any) {
    const e = this.nuevaEncuesta[turno.id];
    const ok = await this.supabase.crearEncuestaTurno({
      turno_id: turno.id,
      paciente_id: this.userId,
      especialista: e.especialista,
      clinica: e.clinica,
      administrativo: e.administrativo
    });
    if (ok) {
      this.encuestas.unshift({ 
        turno_id: turno.id, 
        especialista: e.especialista, 
        clinica: e.clinica, 
        administrativo: e.administrativo,
        creado_en: new Date().toISOString()
      });
      this.cerrarEncuesta(turno);
    } else {
      alert('Error al guardar la encuesta');
    }
  }

 turnosFiltrados() {
  const f = this.filtroTurno?.toLowerCase() ?? '';

  return this.turnos.filter(turno => {
    // Búsqueda por campos principales
    const camposPrincipales = [
      `especialidad: ${turno.especialidad}`,
      `especialista: ${turno.nombreEspecialista} ${turno.apellidoEspecialista}`,
      `estado: ${turno.estado}`,
      `fecha: ${turno.inicio}`,
      `hora: ${turno.inicio} ${turno.fin}`,
      `resena: ${turno.resena}`,
      `calificacion: ${turno.calificacion}`
    ].map(x => (x ?? '').toString().toLowerCase());

    // Búsqueda por historia clínica (si existe)
    let historiaCampos: string[] = [];
    const historia = this.historiasClinicasMap[turno.id];
    if (historia) {
      historiaCampos = [
        `altura: ${historia.altura}`,
        `peso: ${historia.peso}`,
        `temperatura: ${historia.temperatura}`,
        `presion: ${historia.presion}`,
        ...(historia.adicionales?.map((ad: any) => `${ad.clave}: ${ad.valor}`) ?? [])
      ].map(x => (x ?? '').toString().toLowerCase());
    }

    const allCampos = [...camposPrincipales, ...historiaCampos];
    return allCampos.some(campo => campo.includes(f));
  });
}
  puedeCancelar(estado: string) {
    return estado !== 'Realizado' && estado !== 'Cancelado' && estado !== 'Rechazado';
  }

  puedeCalificar(turno: any) {
    return turno.estado === 'Realizado' && !turno.calificacion;
  }

  puedeCompletarEncuesta(turno: any) {
    // Siempre retorna true, pero el botón estará disabled
    return true;
  }

  puedeVerResena(turno: any) {
    return !!(turno.resena && turno.resena.trim() !== '');
  }

  abrirCalificacion(turno: any) {
    this.abierto[turno.id] = 'calificacion';
    this.calificacion[turno.id] = 5;
    this.comentario[turno.id] = '';
    this.mensaje[turno.id] = '';
  }

  async enviarCalificacion(turno: any) {
    if (!this.calificacion[turno.id]) return;
    // Supón que tienes método en tu service para guardar calificación
    const ok = await this.supabase.calificarAtencion(turno.id, this.calificacion[turno.id], this.comentario[turno.id]);
    if (ok) {
      turno.calificacion = this.calificacion[turno.id];
      this.abierto[turno.id] = null;
      this.mensaje[turno.id] = 'Calificación registrada correctamente.';
    } else {
      this.mensaje[turno.id] = 'Error al calificar.';
    }
  }

  cancelarCalificacion(turno: any) {
    this.abierto[turno.id] = null;
    this.mensaje[turno.id] = '';
  }

  verResena(turno: any) {
    this.abierto[turno.id] = 'resena';
  }

  cerrarResena(turno: any) {
    this.abierto[turno.id] = null;
  }

  estadoClass(estado: string) {
    switch (estado) {
      case 'Cancelado': return 'text-danger fw-bold';
      case 'Realizado': return 'text-success fw-bold';
      case 'Solicitado': return 'text-primary fw-bold';
      case 'Aceptado': return 'text-warning fw-bold';
      case 'Rechazado': return 'text-muted fw-bold';
      default: return 'text-secondary';
    }
  }
}
