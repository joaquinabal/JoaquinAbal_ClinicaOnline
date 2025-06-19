// src/app/components/solicitar-turno/solicitar-turno.component.ts
import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-solicitar-turno',
  templateUrl: './solicitar-turno.component.html',
  styleUrls: ['./solicitar-turno.component.css']
})
export class SolicitarTurnoComponent implements OnInit {
  form!: FormGroup;
  especialidades: string[] = [];
  especialistas: any[] = [];
  fechasDisponibles: string[] = [];
  horariosDisponibles: { hora_inicio: string, hora_fin: string }[] = [];

  // Cache para evitar recargar
  disponibilidades: any[] = [];

  constructor(
    private supabase: SupabaseService,
    private fb: FormBuilder
  ) {}

  async ngOnInit() {
    this.form = this.fb.group({
      especialidad: ['', Validators.required],
      especialista: ['', Validators.required],
      fecha: ['', Validators.required],
      horario: ['', Validators.required]
    });

    // Cargar especialidades
    this.especialidades = await this.supabase.getEspecialidades();

    // Cuando cambia especialidad
    this.form.get('especialidad')?.valueChanges.subscribe(async (esp) => {
      this.form.get('especialista')?.reset();
      this.form.get('fecha')?.reset();
      this.form.get('horario')?.reset();
      this.fechasDisponibles = [];
      this.horariosDisponibles = [];
      this.especialistas = await this.supabase.getEspecialistasPorEspecialidad(esp);
    });

    // Cuando cambia especialista
    this.form.get('especialista')?.valueChanges.subscribe(async (especialistaId) => {
      const especialidad = this.form.value.especialidad;
      this.form.get('fecha')?.reset();
      this.form.get('horario')?.reset();
      this.horariosDisponibles = [];
      this.disponibilidades = await this.supabase.getDisponibilidadesEspecialista(especialistaId, especialidad);
      this.generarFechasDisponibles();
    });

    // Cuando cambia fecha
    this.form.get('fecha')?.valueChanges.subscribe(async (fecha) => {
      this.form.get('horario')?.reset();
      await this.generarHorariosDisponibles(fecha);
    });
  }

  // Calcula los próximos 15 días donde haya disponibilidad
  generarFechasDisponibles() {
    this.fechasDisponibles = [];
    const hoy = new Date();
    for (let i = 0; i < 15; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      const diaSemana = fecha.toLocaleDateString('es-AR', { weekday: 'long' }).toLowerCase();
      // Solo agregar fechas en las que haya disponibilidad
      if (this.disponibilidades.some(d => d.dia_semana.toLowerCase() === diaSemana)) {
        this.fechasDisponibles.push(fecha.toISOString().split('T')[0]);
      }
    }
  }

  // Genera bloques de 20 min solo si están libres
  async generarHorariosDisponibles(fechaSeleccionada: string) {
    this.horariosDisponibles = [];
    const especialistaId = this.form.value.especialista;
    const fecha = new Date(fechaSeleccionada);
    const diaSemana = fecha.toLocaleDateString('es-AR', { weekday: 'long' }).toLowerCase();
    // Bloques posibles
    const bloques = this.disponibilidades.filter(d => d.dia_semana.toLowerCase() === diaSemana);
    // Turnos ya tomados
    const ocupados = await this.supabase.getTurnosTomados(especialistaId, fechaSeleccionada);

    for (let disp of bloques) {
      let [h, m] = disp.hora_inicio.split(':').map(Number);
      const [hFin, mFin] = disp.hora_fin.split(':').map(Number);

      while (h < hFin || (h === hFin && m < mFin)) {
        const inicio = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        let nextH = h;
        let nextM = m + 20;
        if (nextM >= 60) {
          nextH += 1;
          nextM -= 60;
        }
        const fin = `${nextH.toString().padStart(2, '0')}:${nextM.toString().padStart(2, '0')}`;
        if (!ocupados.includes(inicio)) {
          this.horariosDisponibles.push({ hora_inicio: inicio, hora_fin: fin });
        }
        h = nextH;
        m = nextM;
      }
    }
  }

  async solicitarTurno() {
    if (this.form.invalid) return;
    const user = await this.supabase.getUser();
    if (!user) {
      alert('Debe estar logueado');
      return;
    }
    const turno = {
      paciente_id: user.id,
      especialista_id: this.form.value.especialista,
      especialidad: this.form.value.especialidad,
      inicio: `${this.form.value.fecha} ${this.form.value.horario.hora_inicio}`,
      fin: `${this.form.value.fecha} ${this.form.value.horario.hora_fin}`,
      estado: 'Solicitado',
      creado_en: new Date().toISOString(),
      administrador_id: null
    };
    const ok = await this.supabase.crearTurno(turno);
    if (ok) {
      alert('Turno solicitado correctamente');
      this.form.reset();
    } else {
      alert('Error al solicitar turno');
    }
  }
}
