import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';
import { LoadingService } from '../../../services/loading.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-mis-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-horarios.component.html',
  styleUrls: ['./mis-horarios.component.css']
})
export class MisHorariosComponent implements OnInit {
  user: any = null;
  userId: string = '';
  especialidades: string[] = [];
  especialidadSeleccionada: string | null = null;
  disponibilidades: any[] = [];

  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  diaSeleccionado: string | null = null;
  horaInicioSeleccionada: string | null = null;
  horaFinSeleccionada: string | null = null;
  horarios: string[] = [];

  constructor(private supabase: SupabaseService, private loadingService: LoadingService,   private toastr: ToastrService,) {}

  async ngOnInit() {
    this.generarHorarios();
    this.loadingService.mostrar();
    this.user = await this.supabase.getUser();
    if (!this.user) return;

    this.userId = this.user.id;
    this.especialidades = await this.supabase.getEspecialidadesDeEspecialista(this.user.id);
    this.disponibilidades = await this.supabase.getDisponibilidades(this.user.id);
    this.loadingService.ocultar();
  }

  generarHorarios() {
    this.horarios = [];
    const inicio = 8 * 60; // 8:00 en minutos
    const fin = 20 * 60;   // 20:00 en minutos
    for (let m = inicio; m <= fin; m += 30) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      this.horarios.push(`${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
    }
  }

  async guardarDisponibilidad() {
    if (!this.especialidadSeleccionada || !this.diaSeleccionado || !this.horaInicioSeleccionada || !this.horaFinSeleccionada) {
      this.toastr.error("Completa todos los campos.");
      return
    }

    // Verifica que inicio < fin
    if (this.horaInicioSeleccionada >= this.horaFinSeleccionada) {
      return alert('El horario de inicio debe ser menor que el de fin.');
    }

    // Genera bloques de 30 minutos entre inicio y fin
    const bloques: any[] = [];
    let [h, m] = this.horaInicioSeleccionada.split(':').map(Number);
    const [hFin, mFin] = this.horaFinSeleccionada.split(':').map(Number);

    while (h < hFin || (h === hFin && m < mFin)) {
      const hora_inicio = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      m += 30;
      if (m >= 60) {
        m -= 60;
        h += 1;
      }
      const hora_fin = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      if (hora_fin > this.horaFinSeleccionada) break;

      bloques.push({
        especialista_id: this.user?.id,
        especialidad: this.especialidadSeleccionada,
        dia_semana: this.diaSeleccionado,
        hora_inicio,
        hora_fin,
        activa: true
      });
    }

    // Opcional: chequea duplicados en la base (uno por uno)
    for (const disponibilidad of bloques) {
      this.loadingService.mostrar();
      const { data: disponibilidadExistente, error: errorConsulta } = await this.supabase.chequearDisponibilidad(disponibilidad);
      this.loadingService.ocultar();
      if (errorConsulta) {
        console.error('Error consultando disponibilidad existente:', errorConsulta.message);
        alert('Hubo un error al verificar disponibilidad existente.');
        return;
      }
      if (disponibilidadExistente && disponibilidadExistente.length > 0) {
        alert(`Ya existe una disponibilidad activa para ${disponibilidad.dia_semana} de ${disponibilidad.hora_inicio} a ${disponibilidad.hora_fin}.`);
        return;
      }
    }

    // Inserta todos los bloques válidos
    this.loadingService.mostrar();
    const { error } = await this.supabase.insertarDisponibilidades(bloques);
    this.loadingService.ocultar();
    if (error) return alert('Error al guardar');
    alert('Disponibilidades guardadas correctamente');
    // Limpiar selección
    this.horaInicioSeleccionada = null;
    this.horaFinSeleccionada = null;
    this.diaSeleccionado = null;
    this.especialidadSeleccionada = null;
    this.disponibilidades = await this.supabase.getDisponibilidades(this.user.id);
  }

  async eliminarDisponibilidad(id: string) {
    await this.supabase.desactivarDisponibilidad(id);
    this.disponibilidades = await this.supabase.getDisponibilidades(this.userId);
  }
}
