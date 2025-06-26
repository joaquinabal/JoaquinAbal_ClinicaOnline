import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-historias-clinicas-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historias-clinicas-admin.component.html'
})
export class HistoriasClinicasAdminComponent implements OnInit {
  historiasClinicas: any[] = [];
  filtro: string = '';

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    this.historiasClinicas = await this.supabase.getTodasHistoriasClinicas();
    console.log(this.historiasClinicas)
  }

  historiasFiltradas() {
    const buscar = this.filtro.toLowerCase();
    return this.historiasClinicas.filter(historia => {
      const paciente = `${historia.pacientes?.nombre || ''} ${historia.pacientes?.apellido || ''}`.toLowerCase();
      const especialista = `${historia.especialistas?.nombre || ''} ${historia.especialistas?.apellido || ''}`.toLowerCase();
      const otros = [
        historia.altura,
        historia.peso,
        historia.temperatura,
        historia.presion,
        ...(historia.adicionales?.map((ad: any) => ad.clave + ' ' + ad.valor) || [])
      ].join(' ').toLowerCase();
      return paciente.includes(buscar) || especialista.includes(buscar) || otros.includes(buscar);
    });
  }
}
