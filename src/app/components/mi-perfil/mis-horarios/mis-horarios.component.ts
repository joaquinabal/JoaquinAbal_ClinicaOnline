import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';
import { LoadingService } from '../../../services/loading.service';
@Component({
  selector: 'app-mis-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-horarios.component.html',
  styleUrl: './mis-horarios.component.css'
})
export class MisHorariosComponent implements OnInit {
  user: any = null;
  userId: string = '';
  especialidades: string[] = [];
   especialidadSeleccionada: string | null = null;  
  disponibilidades: any[] = [];

  nuevaDisponibilidad = {
    especialidad: '',
    dia: '',
    hora_inicio: '',
    hora_fin: ''
  };

  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    diaSeleccionado: string | null = null;
    horarioSeleccionado: { hora_inicio: string; hora_fin: string } | null = null; 
    bloquesHorario: { hora_inicio: string; hora_fin: string; seleccionado: boolean }[] = [];

  constructor(private supabase: SupabaseService, private loadingService: LoadingService) {}

  async ngOnInit() {
        this.generarBloquesHorarios();
        this.loadingService.mostrar();
    this.cargarEspecialidades();
    this.loadingService.ocultar();

      

    this.user = await this.supabase.getUser();
    if (!this.user) return;

    this.userId = this.user.id;
    this.loadingService.mostrar(); 
    this.especialidades = await this.supabase.getEspecialidadesDeEspecialista(this.user.id);
    this.disponibilidades = await this.supabase.getDisponibilidades(this.user.id);
    this.loadingService.ocultar(); 
  }

   generarBloquesHorarios() {
  const bloques: any[] = [];
  const inicio = 8 * 60; // 08:00
  const fin = 20 * 60;   // 20:00

  for (let m = inicio; m < fin; m += 20) {
    const formato = (x: number) => x.toString().padStart(2, '0');
    const h1 = Math.floor(m / 60), m1 = m % 60;
    const h2 = Math.floor((m + 20) / 60), m2 = (m + 20) % 60;

    bloques.push({
      hora_inicio: `${formato(h1)}:${formato(m1)}`,
      hora_fin: `${formato(h2)}:${formato(m2)}`
    });
  }

  this.bloquesHorario = bloques;
}

   async guardarDisponibilidad() {
    if (!this.especialidadSeleccionada || !this.diaSeleccionado || !this.horarioSeleccionado) return alert('Completa todos los campos');

const disponibilidad = {
    especialista_id: this.user?.id,
  especialidad: this.especialidadSeleccionada,
  dia_semana: this.diaSeleccionado,
  hora_inicio: this.horarioSeleccionado.hora_inicio,
  hora_fin: this.horarioSeleccionado.hora_fin,
  activa: true
};
           this.loadingService.mostrar(); 
 const { data: disponibilidadExistente, error: errorConsulta } = await this.supabase.chequearDisponibilidad(disponibilidad)
              this.loadingService.ocultar(); 
  if (errorConsulta) {
    console.error('Error consultando disponibilidad existente:', errorConsulta.message);
    alert('Hubo un error al verificar disponibilidad existente.');
    return;
  }

  if (disponibilidadExistente && disponibilidadExistente.length > 0) {
    alert('Ya existe una disponibilidad activa para ese día y horario.');
    return;
  }
           this.loadingService.mostrar(); 
const {data:  error } = await this.supabase.insertarDisponibilidades([disponibilidad]);
console.log(error)
            this.loadingService.ocultar(); 

    if (error) return alert('Error al guardar');

    alert('Disponibilidades guardadas correctamente');
    this.bloquesHorario.forEach(b => b.seleccionado = false);
        this.loadingService.mostrar();
    this.cargarEspecialidades();
    this.loadingService.ocultar();
  } 

   async cargarEspecialidades() {
    const { data, error } = await this.supabase.getEspecialidadesDeEspecialista(this.userId);
    if (!error) this.especialidades = data.map((e: any) => e.nombre);
  }


async eliminarDisponibilidad(id: string) {
  await this.supabase.desactivarDisponibilidad(id);
  this.disponibilidades = await this.supabase.getDisponibilidades(this.userId);
}

generarHorarios(): string[] {
  const horarios: string[] = [];
  const start = 8 * 60; // 8:00 en minutos
  const end = 20 * 60;  // 20:00 en minutos

  for (let mins = start; mins < end; mins += 20) {
    const hora = Math.floor(mins / 60);
    const minutos = mins % 60;
    const formato = (n: number) => n.toString().padStart(2, '0');
    horarios.push(`${formato(hora)}:${formato(minutos)}`);
  }

  return horarios;
}

}
