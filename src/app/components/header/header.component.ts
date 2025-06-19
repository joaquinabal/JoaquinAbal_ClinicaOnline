import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Input } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { LoadingService } from '../../services/loading.service';
import { OnChanges } from '@angular/core';
import { SimpleChanges } from '@angular/core';
@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})


export class HeaderComponent implements OnChanges {

  @Input() isAdmin: boolean = false;
  @Input() user: any;
  rol: 'paciente' | 'especialista' | 'administradore' | null = null;

  constructor(private supabase: SupabaseService, private loadingService: LoadingService) {}

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['user'] && this.user && this.user.id) {
      // Cada vez que el usuario cambia, recalculamos el rol
      const resultado = await this.supabase.obtenerDatosUsuarioConRol(this.user.id);
      this.rol = resultado.rol;
      this.loadingService.ocultar();
      // Podés usar console.log para debuggear el rol:
      console.log('Nuevo rol:', this.rol);
    } else if (changes['user'] && !this.user) {
      // Si el user se vuelve null (logout), reseteamos el rol
      this.rol = null;
    }
  }

  logout() {
    this.supabase.signOutUser();
    console.log(this.user)
  }
  
}

