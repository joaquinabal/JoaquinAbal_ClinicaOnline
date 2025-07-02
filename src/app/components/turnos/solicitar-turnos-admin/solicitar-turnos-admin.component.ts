import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { AmPmPipe } from '../../../pipes/ampm/ampm.pipe';
import { ToastrService } from 'ngx-toastr';

@Component({
  standalone: true,
  selector: 'app-solicitar-turnos-admin',
  templateUrl: './solicitar-turnos-admin.component.html',
  styleUrls: ['./solicitar-turnos-admin.component.css'],
  imports: [CommonModule, AmPmPipe]
})
export class SolicitarTurnosAdminComponent implements OnInit {
  pacientes: any[] = [];
  pacienteSeleccionado: any = null;

  especialistas: any[] = [];
  especialistaSeleccionado: any = null;

  especialidades: string[] = [];
  especialidadSeleccionada: string | null = null;

  turnosDisponibles: any[] = [];
  turnoSeleccionado: any = null;

  cargando = false;

  constructor(private supabase: SupabaseService, private toastr: ToastrService) {}

  async ngOnInit() {
    this.cargando = true;
    this.pacientes = await this.supabase.obtenerPacientes();
    this.cargando = false;
  }

  async seleccionarPaciente(paciente: any) {
    this.pacienteSeleccionado = paciente;
    this.especialistas = await this.supabase.getEspecialistasConImagen();
    this.especialistaSeleccionado = null;
    this.especialidades = [];
    this.especialidadSeleccionada = null;
    this.turnosDisponibles = [];
    this.turnoSeleccionado = null;
  }

  async seleccionarEspecialista(especialista: any) {
    this.especialistaSeleccionado = especialista;
    this.especialidades = especialista.especialidades || [];
    this.especialidadSeleccionada = null;
    this.turnosDisponibles = [];
    this.turnoSeleccionado = null;
  }

  async seleccionarEspecialidad(especialidad: string) {
    this.especialidadSeleccionada = especialidad;
    this.turnosDisponibles = await this.supabase.getTurnosDisponibles(
      this.especialistaSeleccionado.id,
      this.especialidadSeleccionada
    );
    this.turnoSeleccionado = null;
  }

  seleccionarTurno(turno: any) {
    this.turnoSeleccionado = turno;
  }

  async solicitarTurno() {
    if (!this.turnoSeleccionado || !this.especialistaSeleccionado || !this.especialidadSeleccionada || !this.pacienteSeleccionado) {
      this.toastr.error('Seleccioná todos los datos');
      return;
    }
    const turno = {
      paciente_id: this.pacienteSeleccionado.id,
      especialista_id: this.especialistaSeleccionado.id,
      especialidad: this.especialidadSeleccionada,
      inicio: this.turnoSeleccionado.inicio,
      fin: this.turnoSeleccionado.fin,
      estado: 'Solicitado',
      creado_en: new Date().toISOString(),
      administrador_id: null // Si querés podés poner el id del admin logueado
    };
    const ok = await this.supabase.crearTurno(turno);
    if (ok) {
      this.toastr.success('Turno solicitado correctamente');
      this.pacienteSeleccionado = null;
      this.especialistaSeleccionado = null;
      this.especialidadSeleccionada = null;
      this.turnosDisponibles = [];
      this.turnoSeleccionado = null;
    } else {
      this.toastr.error('Error al solicitar turno');
    }
  }
}
