import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { AmPmPipe } from '../../../pipes/ampm/ampm.pipe';
import { ToastrService } from 'ngx-toastr';

@Component({
  standalone: true,
  selector: 'app-solicitar-turno',
  templateUrl: './solicitar-turno.component.html',
  styleUrls: ['./solicitar-turno.component.css'],
  imports: [CommonModule, AmPmPipe]
})
export class SolicitarTurnoComponent implements OnInit {
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
    this.especialistas = await this.supabase.getEspecialistasConImagen();
    this.cargando = false;
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
    // Buscar los próximos 15 días con bloques disponibles de 30 min
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
    if (!this.turnoSeleccionado || !this.especialistaSeleccionado || !this.especialidadSeleccionada) {
      this.toastr.error('Seleccioná todos los datos');
      return;
    }
    const user = await this.supabase.getUser();
    if (!user) {
      this.toastr.error('Debe estar logueado');
      return;
    }
    const turno = {
      paciente_id: user.id,
      especialista_id: this.especialistaSeleccionado.id,
      especialidad: this.especialidadSeleccionada,
      inicio: this.turnoSeleccionado.inicio,
      fin: this.turnoSeleccionado.fin,
      estado: 'Solicitado',
      creado_en: new Date().toISOString()
    };
    const ok = await this.supabase.crearTurno(turno);
    if (ok) {
      this.toastr.success('Turno solicitado correctamente');
      this.especialistaSeleccionado = null;
      this.especialidadSeleccionada = null;
      this.turnosDisponibles = [];
      this.turnoSeleccionado = null;
    } else {
      this.toastr.error('Error al solicitar turno');
    }
  }
}
