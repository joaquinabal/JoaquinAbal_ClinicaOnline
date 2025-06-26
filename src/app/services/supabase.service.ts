import { Injectable } from '@angular/core';
import { supabase } from '../supabase/supabaseClient';
import { BehaviorSubject } from 'rxjs';

export type UserRole = 'paciente' | 'especialista' | 'administrador';

export interface Especialidad {
  id?: number; // Supabase suele asignar IDs automáticos
  nombre: string;
  // Puedes añadir otros campos si tu tabla los tiene, ej: descripcion: string;
}


  interface Disponibilidad {
  hora_inicio: string;
  hora_fin: string;
}

@Injectable({
  providedIn: 'root'
  
})
export class SupabaseService {
  public user$ = new BehaviorSubject<any>(null);

  constructor() {

     supabase.auth.onAuthStateChange((_event, session) => {
      this.user$.next(session?.user ?? null);
    });
    // También inicializar por si la página se recarga y ya está logueado
    this.getUser().then(u => this.user$.next(u));
  }
  

  async esEspecialistaDeshabilitado(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('especialistas')
    .select('habilitado')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error al verificar si es especialista deshabilitado:', error.message);
    return false;
  }

  return data?.habilitado === false;
}

async obtenerEspecialidades(): Promise<string[]> {
  const { data, error } = await supabase.from('especialistas').select('especialidad');
  return [...new Set(data?.map(e => e.especialidad))]; // sin repetidos
}

async obtenerEspecialistas(): Promise<any[]> {
  const { data } = await supabase.from('especialistas').select('id, nombre, apellido, especialidades');
  return data || [];
}

async obtenerDisponibilidades(especialistaId: string, especialidad: string) {
  const { data } = await supabase
    .from('disponibilidades')
    .select('*')
    .eq('especialista_id', especialistaId)
    .eq('especialidad', especialidad)
    .eq('activa', true);
  return data || [];
}

async insertarTurno(turno: any) {
  return await supabase.from('turnos').insert(turno);
}

  async getDisponibilidades(userId: string) {
  const { data, error } = await supabase
    .from('disponibilidades')
    .select('*')
    .eq('especialista_id', userId)
    .eq('activa', true); // solo activas
    console.log(data)
  return error ? [] : data;
}

async getEspecialidadesDeEspecialista(userId: string) {
  const { data, error } = await supabase
    .from('especialistas')
    .select('especialidades')
    .eq('id', userId)
    .single();

  return error ? [] : data?.especialidades ?? [];
}

async agregarDisponibilidad(disponibilidad: {
  especialista_id: string,
  especialidad: string,
  dia_semana: string,
  hora_inicio: string,
  hora_fin: string
}) {
  return await supabase.from('disponibilidades').insert([disponibilidad]);
}

async insertarDisponibilidades(disponibilidades: any[]) {
  return await supabase
    .from('disponibilidades')
    .insert(disponibilidades);
}

async chequearDisponibilidad(disponibilidad: any) {
  return await supabase
    .from('disponibilidades')
    .select('id')
    .eq('especialista_id', disponibilidad.especialista_id)
    .eq('dia_semana', disponibilidad.dia_semana)
    .eq('hora_inicio', disponibilidad.hora_inicio)
    .eq('hora_fin', disponibilidad.hora_fin)
    .eq('activa', true);

}

async obtenerPacientes() {
  const { data, error } = await supabase
    .from('pacientes')
    .select('id, nombre, apellido, dni, mail, imagen1')
    
  if (error) {
    console.error('Error al obtener pacientes:', error.message);
    return [];
  }

  return data;
}

async obtenerEspecialistasPorEspecialidad(nombreEspecialidad: string) {
  const { data, error } = await supabase
    .from('especialistas')
    .select('id, nombre, apellido, email')
    .contains('especialidades', [nombreEspecialidad]) // operador `cs`
    .eq('activo', true);

  if (error) {
    console.error('Error al obtener especialistas:', error.message);
    return [];
  }

  
  return data;
}

async obtenerEspecialistasPorEspecialidadParaTurno(nombreEspecialidad: string) {
  const { data, error } = await supabase
    .from('especialistas')
    .select('id, nombre, apellido, especialidades')
    .contains('especialidades', [nombreEspecialidad])
    .eq('habilitado', true);

  return data || [];
}

 async getEspecialidadesTurno(): Promise<string[]> {
    const { data, error } = await supabase
      .from('especialidades')
      .select('nombre')
      .order('nombre', { ascending: true });
    if (error) {
      console.error('Error al obtener especialidades:', error.message);
      return [];
    }
    return data.map((e: any) => e.nombre);
  }



async obtenerEspecialidadesDelEspecialista() {
  const user = await this.getUser();
  if(user){ // asumimos que existe
  return await supabase
    .from('especialistas_especialidades')
    .select('nombre')
    .eq('especialista_id', user.id);}
    return null;
}


async desactivarDisponibilidad(id: string) {
  return await supabase
    .from('disponibilidades')
    .update({ activa: false })
    .eq('id', id);
}

  async signInUser(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password });
  }

  async obtenerDatosUsuarioConRol(userId: string): Promise<{ rol: any, data: any }> {
  const tablas = ['pacientes', 'especialistas', 'administradores'];

  for (const tabla of tablas) {
    const { data, error } = await supabase.from(tabla).select('*').eq('id', userId).single();
    if (data && !error) {
      return { rol: tabla.slice(0, -1) as 'paciente' | 'especialista' | 'administrador', data };
    }
  }

  return { rol: null, data: null };
}

  
  async signOutUser() {
    const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error al cerrar sesión:', error);
  } else {
    console.log('signOut completado');
  }
  } 

   async esAdministrador(userId: string): Promise<boolean> {
    const { count, error } = await supabase
      .from('administradores')
      .select('*', { count: 'exact', head: true })
      .eq('id', userId);

    if (error) {
      console.error('Error checando administrador:', error.message);
      return false;
    }
    
  console.log('esAdministrador count:', count);  // debug
  return (count ?? 0) > 0;
  }

   async getCurrentSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error al obtener la sesión:', error);
      return null;
    }
    return data.session;
  }
async getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
  
  

   async getUserProfile(userId: string) {
    // Asumiendo que tu tabla de perfiles se llama 'usuarios' y tiene un campo 'id'
    // que coincide con el 'id' de auth.users, y un campo 'rol'.
    return await supabase
      .from('usuarios')
      .select('id, rol, nombre, apellido, habilitado') // Selecciona los campos que necesitas
      .eq('id', userId)
      .single(); // Usa .single() si esperas solo un resultado para un ID único
  }


async obtenerHorariosDisponibles(
  especialistaId: string,
  dia: string,
  fechaSeleccionada: string
) {
  // 1. Traer disponibilidades activas
  const { data: disponibilidades, error: error1 } = await supabase
    .from('disponibilidades')
    .select('hora_inicio, hora_fin')
    .eq('especialista_id', especialistaId)
    .eq('dia_semana', dia)
    .eq('activo', true);

  if (error1) {
    console.error('Error al obtener disponibilidades:', error1.message);
    return [];
  }

  // 2. Traer turnos ya tomados ese día
  const { data: turnosTomados, error: error2 } = await supabase
    .from('turnos')
    .select('hora_inicio, hora_fin')
    .eq('especialista_id', especialistaId)
    .eq('fecha', fechaSeleccionada)
    .in('estado', ['aceptado', 'pendiente']);

  if (error2) {
    console.error('Error al obtener turnos tomados:', error2.message);
    return [];
  }

  const horariosTomados = turnosTomados?.map(t => t.hora_inicio) ?? [];

  // 3. Generar bloques de 20 minutos
  const disponibles: { hora_inicio: string; hora_fin: string }[] = [];

  (disponibilidades as Disponibilidad[]).forEach((bloque: Disponibilidad) => {
    let [h, m] = bloque.hora_inicio.split(':').map(Number);
    const [hFin, mFin] = bloque.hora_fin.split(':').map(Number);

    while (h < hFin || (h === hFin && m < mFin)) {
      const inicio = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      m += 20;
      if (m >= 60) {
        m -= 60;
        h++;
      }
      const fin = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

      if (!horariosTomados.includes(inicio)) {
        disponibles.push({ hora_inicio: inicio, hora_fin: fin });
      }
    }
  });

  return disponibles;
}


async crearTurno(turno: any /*{
  paciente_id: string;
  especialista_id: string;
  fecha: string; // formato YYYY-MM-DD
  hora_inicio: string; // HH:mm
  hora_fin: string; // HH:mm
}*/) {
  const { error } = await supabase
    .from('turnos')
    .insert([
      {
        ...turno
      }
    ]);

  if (error) {
    console.error('Error al crear el turno:', error.message);
    return false;
  }

  return true;
}



async getSpecialistProfile(userId: string) {
    // Puedes seleccionar solo el campo 'habilitado' si es lo único que necesitas
    return await supabase
      .from('especialistas')
      .select('id, habilitado')
      .eq('id', userId)
      .single(); // Usa .single() si esperas una sola fila por ID
  }

 async signUpUser(email: string, password: string, role: UserRole) {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          rol: role // ¡Esto guardará el rol en user_metadata!
        }
      }
    });
  }
    async uploadImage(bucket: string, file: File, path: string): Promise<string> {
    try {
      const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
        upsert: true
      });

      if (error) {
        console.error("Error al subir imagen:", error);
        throw error;
      }

      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);
      return publicUrlData.publicUrl;
    } catch (e) {
      console.error("Excepción al subir imagen:", e);
      throw e;
    }
  }

  getStateChange(user: any){
     supabase.auth.onAuthStateChange((_event, session) => {
    user = session?.user ?? null;
  });
  }


  insertPaciente(paciente: any) {
    return supabase.from('pacientes').insert(paciente);
  }

 async insertEspecialista(especialistaData: any) {
    return await supabase.from('especialistas').insert(especialistaData);
  }   

  insertAdministrador(admin: any) {
    return supabase.from('administradores').insert(admin);
  }

async agregarEspecialidad(nueva: string): Promise<{ error: any | null }> {
  // Convertir a formato estándar (mayúscula inicial, minúsculas después, opcional)
  const nombreFormateado = nueva.trim();

  const { error } = await supabase
    .from('especialidades')
    .insert({ nombre: nombreFormateado });

  if (error) {
    console.error('Error al insertar especialidad:', error.message);
  }

  return { error };
}

  
  
async   getEspecialidades(): Promise<string[]> {
  const { data, error } = await supabase
    .from('especialidades')
    .select('nombre')
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Error al obtener especialidades:', error.message);
    return [];
  }

  return data.map((e: any) => e.nombre);
}

 getPacientes() {
    return supabase
      .from('pacientes')
      .select('*')
  }

   getEspecialistas() {
    return supabase
      .from('especialistas')
      .select('*')
  }

   getAdministradores() {
    return supabase
      .from('administradores')
      .select('*')
  }

   updateEspecialistaHabilitacion(id: number,estado: boolean) {
    return supabase
      .from('especialistas')
      .update({ habilitado: estado })
      .eq('id', id);
  }

async agregarHistoriaClinica(historia: {
  paciente_id: string;
  especialista_id: string;  
  turno_id: string;
  altura: number;
  peso: number;
  temperatura: number;
  presion: string;
  adicionales: { clave: string, valor: string }[];
}) {
  const { error } = await supabase
    .from('historia_clinica')
    .insert([
      {
        ...historia,
        adicionales: historia.adicionales.length > 0 ? historia.adicionales : null
      }
    ]);
  return !error;
}
  // Crea la historia clínica y la asocia al turno
async cargarHistoriaClinica(turno: any, historia: any) {
  // turno debe tener id, paciente_id, especialista_id
  console.log(turno)
  const { data, error } = await supabase
    .from('historia_clinica')
    .insert([{
      turno_id: turno.id,
      paciente_id: turno.paciente_id,
      especialista_id: turno.especialista_id,
      altura: historia.altura,
      peso: historia.peso,
      temperatura: historia.temperatura,
      presion: historia.presion,
      adicionales: historia.adicionales // array de objetos clave/valor
    }])
    .select()
    .single();

  if (error) {
    console.error('Error al guardar historia clínica:', error.message);
    return null;
  }
  return data;
}

async tieneHistoriaClinica(turnoId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('historias_clinicas')
    .select('id')
    .eq('turno_id', turnoId)
    .maybeSingle();

  return !!data && !error;
}

async getHistoriasClinicasPorPaciente(pacienteId: string) {
  const { data, error } = await supabase
    .from('historia_clinica')
    .select('*')
    .eq('paciente_id', pacienteId)
    .order('turno_id', { ascending: false });
  if (error) {
    console.error('Error al obtener historias clínicas:', error.message);
    return [];
  }
  return data;
}

async getHistoriasClinicasAtendidosPorEspecialista(especialistaId: string) {
  const { data, error } = await supabase
    .from('historia_clinica')
    .select(`
      *,
      pacientes:paciente_id (
        nombre,
        apellido
      )
    `)
    .eq('especialista_id', especialistaId)
    .order('creado_en', { ascending: false });

  if (error) {
    console.error('Error al obtener historias clínicas de pacientes atendidos:', error.message);
    return [];
  }
  return data;
}

async getHistoriasClinicasPorTurnos(turnoIds: string[]): Promise<any[]> {
  if (!turnoIds.length) return [];
  const { data, error } = await supabase
    .from('historia_clinica')
    .select('*')
    .in('turno_id', turnoIds);
  if (error) {
    console.error('Error obteniendo historias clínicas:', error.message);
    return [];
  }
  return data;
} 

async getHistoriasDePacienteClinicasPorTurnos(turnoIds: string[]): Promise<{ [turnoId: string]: any }> {
  if (!turnoIds.length) return {};
  const { data, error } = await supabase
    .from('historia_clinica')
    .select('*')
    .in('turno_id', turnoIds);

  if (error) {
    console.error('Error obteniendo historias clínicas:', error);
    return {};
  }
  // Mapa turno_id -> historia
  const map: { [turnoId: string]: any } = {};
  (data || []).forEach(hc => map[hc.turno_id] = hc);
  return map;
}

// SupabaseService
async getTodasHistoriasClinicas() {
  const { data, error } = await supabase
    .from('historia_clinica')
    .select(`
      *,
      pacientes:paciente_id (
        nombre,
        apellido
      ),
      especialistas:especialista_id (
        nombre,
        apellido
      )
    `)
    .order('creado_en', { ascending: false });

  if (error) {
    console.error('Error al obtener todas las historias clínicas:', error.message);
    return [];
  }
  return data;
}


  // TURNOS


  // 2. Traer especialistas que tengan la especialidad seleccionada
  async getEspecialistasPorEspecialidad(nombreEspecialidad: string) {
    const { data, error } = await supabase
      .from('especialistas')
      .select('id, nombre, apellido, especialidades, habilitado')
      .contains('especialidades', [nombreEspecialidad]) // asume que especialidades es array
      .eq('habilitado', true);
    if (error) {
      console.error('Error al obtener especialistas:', error.message);
      return [];
    }
    return data;
  }

  // 3. Traer disponibilidades activas del especialista y esa especialidad
  async getDisponibilidadesEspecialista(especialistaId: string, especialidad: string) {
    const { data, error } = await supabase
      .from('disponibilidades')
      .select('id, dia_semana, hora_inicio, hora_fin, activa')
      .eq('especialista_id', especialistaId)
      .eq('especialidad', especialidad)
      .eq('activa', true);
    if (error) {
      console.error('Error al obtener disponibilidades:', error.message);
      return [];
    }
    return data;
  }

  // 4. Traer turnos ocupados (aceptados o pendientes) para ese especialista, esa fecha
  async getTurnosTomados(especialistaId: string, fecha: string) {
    const { data, error } = await supabase
      .from('turnos')
      .select('inicio, fin')
      .eq('especialista_id', especialistaId)
      .eq('inicio', fecha) // 'inicio' debe ser de tipo fecha (YYYY-MM-DD), adaptá si es necesario
      .in('estado', ['pendiente', 'aceptado']);
    if (error) {
      console.error('Error al obtener turnos tomados:', error.message);
      return [];
    }
    // Retorna array de horas ocupadas
    return data.map((t: any) => t.inicio.slice(11, 16)); // Extrae hora "HH:mm"
  }

async getTurnosPorPaciente(pacienteId: string) {
  const { data, error } = await supabase
    .from('turnos')
    .select(`
      *,
      especialistas (
        nombre,
        apellido
      )
    `)
    .eq('paciente_id', pacienteId)
    .order('inicio', { ascending: false });

  if (error) throw error;

  return data.map(turno => ({
    ...turno,
    nombreEspecialista: turno.especialistas?.nombre ?? '',
    apellidoEspecialista: turno.especialistas?.apellido ?? '',
  }));
}

async cancelarTurno(turnoId: string, motivo: string) {
  const { error } = await supabase
    .from('turnos')
    .update({
      estado: 'Cancelado',
      comentario_cancelacion: motivo
    })
    .eq('id', turnoId);

  if (error) throw error;
} 

async calificarTurno(turnoId: string, comentario: string, puntuacion: number) {
  const { error } = await supabase
    .from('turnos')
    .update({
      calificacion: puntuacion,
      comentario_calificacion: comentario
    })
    .eq('id', turnoId);

  if (error) throw error;
}

async getTurnosPorEspecialista(especialistaId: string) {
  const { data, error } = await supabase
    .from('turnos')
    .select(`
      *,
      pacientes (
        nombre,
        apellido
      )
    `)
    .eq('especialista_id', especialistaId)
    .order('inicio', { ascending: false });

  if (error) throw error;

  return data.map(turno => ({
    ...turno,
    nombrePaciente: turno.pacientes?.nombre ?? '',
    apellidoPaciente: turno.pacientes?.apellido ?? ''
  }));
}

async actualizarEstadoTurno(turnoId: string, nuevoEstado: string) {
  const { error } = await supabase
    .from('turnos')
    .update({ estado: nuevoEstado })
    .eq('id', turnoId);

  if (error) throw error;
}

async rechazarTurno(turnoId: string, motivo: string) {
  const { error } = await supabase
    .from('turnos')
    .update({
      estado: 'Rechazado',
      comentario_cancelacion: motivo
    })
    .eq('id', turnoId);

  if (error) throw error;
}

async finalizarTurno(turnoId: string, resena: string) {
  const { error } = await supabase
    .from('turnos')
    .update({
      estado: 'Realizado',
      resena: resena
    })
    .eq('id', turnoId);

  if (error) throw error;
}

// Trae todos los especialistas con imagen y sus especialidades
async getEspecialistasConImagen() {
  const { data, error } = await supabase
    .from('especialistas')
    .select('id, nombre, apellido, imagen1, especialidades'); // suponiendo que especialidades es array

  if (error) {
    console.error(error);
    return [];
  }

  // Si especialidades es string separado por coma
  return data.map(e => ({
    ...e,
    especialidades: Array.isArray(e.especialidades)
      ? e.especialidades
      : (e.especialidades || '').split(',').map((x: string) => x.trim())
  }));
}

// Trae bloques de 30 min disponibles para ese especialista y especialidad en los próximos 15 días
async getTurnosDisponibles(especialistaId: string, especialidad: string) {
  // Trae disponibilidades activas para esa especialidad
  const { data: disponibilidades, error: errDisp } = await supabase
    .from('disponibilidades')
    .select('*')
    .eq('especialista_id', especialistaId)
    .eq('especialidad', especialidad)
    .eq('activa', true);

  if (errDisp) return [];

  // Busca turnos ya tomados
  const turnosDisponibles: any[] = [];
  const hoy = new Date();
  for (let i = 0; i < 15; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() + i);
    const yyyy_mm_dd = fecha.toISOString().split('T')[0];
    const diaSemana = fecha.toLocaleDateString('es-AR', { weekday: 'long' });

    // Filtro las disponibilidades de ese día
    const disponiblesHoy = disponibilidades.filter(d => {
      // Supone que en la DB los días están como "Lunes", "Martes"...
      return (d.dia_semana || '').toLowerCase() === diaSemana.toLowerCase();
    });
    if (disponiblesHoy.length === 0) continue;

    // Turnos ya reservados ese día
    const { data: turnosTomados, error: errTurnos } = await supabase
      .from('turnos')
      .select('inicio')
      .eq('especialista_id', especialistaId)
      .eq('especialidad', especialidad)
      .gte('inicio', `${yyyy_mm_dd}T00:00`)
      .lte('inicio', `${yyyy_mm_dd}T23:59`);

    const ocupados = (turnosTomados || []).map(t => t.inicio?.substring(11, 16)); // "HH:mm"

    // Para cada franja disponible, genero los bloques de 30 minutos
    for (let disp of disponiblesHoy) {
      let [h, m] = disp.hora_inicio.split(':').map(Number);
      const [hFin, mFin] = disp.hora_fin.split(':').map(Number);

      while (h < hFin || (h === hFin && m < mFin)) {
        const inicio = `${yyyy_mm_dd} ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        m += 30;
        if (m >= 60) {
          h++;
          m -= 60;
        }
        const fin = `${yyyy_mm_dd} ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        // Si ya está tomado no lo muestro
        if (!ocupados.includes(inicio.substring(11, 16))) {
          turnosDisponibles.push({ inicio, fin });
        }
      }
    }
  }
  return turnosDisponibles;
}

// Trae todos los turnos, con JOIN para traer nombre de paciente/especialista (ajusta a tus columnas reales)
async getTurnosAdmin() {
  const { data, error } = await supabase
    .from('turnos')
    .select(`
      id, especialidad, inicio, fin, estado,
      especialista_id, paciente_id,
      especialistas (nombre, apellido),
      pacientes (nombre, apellido)
    `)
    .order('inicio', { ascending: true });

  if (error) {
    console.error('Error obteniendo turnos:', error);
    return [];
  }

  // Mapea a formato amigable
  return (data || []).map((t: any) => ({
    ...t,
    especialista_nombre: t.especialistas ? `${t.especialistas.nombre} ${t.especialistas.apellido}` : '',
    paciente_nombre: t.pacientes ? `${t.pacientes.nombre} ${t.pacientes.apellido}` : ''
  }));
}

// Cancela turno como admin (actualiza estado y guarda comentario)
async cancelarTurnoAdmin(turnoId: string, comentario: string) {
  const { error } = await supabase
    .from('turnos')
    .update({ estado: 'Cancelado', comentario_cancelacion: comentario })
    .eq('id', turnoId);

  if (error) {
    console.error('Error al cancelar turno:', error);
  }
  return !error;
}


// Para completar encuesta
async completarEncuestaTurno(turnoId: string, comentario: string) {
  return await supabase
    .from('turnos')
    .update({ encuesta_completada: true, comentario_encuesta: comentario })
    .eq('id', turnoId);
}

// Para calificar atención
async calificarAtencionTurno(turnoId: string, comentario: string) {
  return await supabase
    .from('turnos')
    .update({ calificacion: comentario })
    .eq('id', turnoId);
}

async calificarAtencion(turnoId: string, puntaje: number, comentario: string): Promise<boolean> {
  const { error } = await supabase
    .from('turnos')
    .update({
      calificacion: puntaje,
      comentario_calificacion: comentario
    })
    .eq('id', turnoId);

  if (error) {
    console.error('Error al calificar atención:', error.message);
    return false;
  }
  return true;
}

} 
