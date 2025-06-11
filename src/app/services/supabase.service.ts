import { Injectable } from '@angular/core';
import { supabase } from '../supabase/supabaseClient';

export type UserRole = 'paciente' | 'especialista' | 'administrador';

export interface Especialidad {
  id?: number; // Supabase suele asignar IDs automáticos
  nombre: string;
  // Puedes añadir otros campos si tu tabla los tiene, ej: descripcion: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  constructor() {}

  

  async signInUser(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password });
  }

   async signOutUser() {
    return await supabase.auth.signOut();
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

  
  
async getEspecialidades(): Promise<string[]> {
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

} 
