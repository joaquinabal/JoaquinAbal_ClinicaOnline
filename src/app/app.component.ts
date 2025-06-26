import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoadingOverlayComponent } from './components/loading-overlay/loading-overlay.component';
import { LoadingService } from './services/loading.service';
import { SupabaseService } from './services/supabase.service';
import { supabase } from './supabase/supabaseClient';
import { trigger, transition, style, animate } from '@angular/animations';


@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, LoadingOverlayComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
   animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'none' }))
      ])
    ])
  ]
})
export class AppComponent implements OnInit{
    cargando = false;
    cargandoRuta = false; 
    user: any;
      isAdmin = false;
  title = 'clinica-online';


  
   constructor(private router: Router, private loadingService: LoadingService, private supabasex: SupabaseService) {

        this.loadingService.loading$.subscribe(valor => {
      this.cargando = valor;
    }); 
  }

    async ngOnInit() {
    
    this.supabasex.user$.subscribe(user => {
      this.user = user;
      // Acá podrías también disparar checkAdmin(user?.id) si querés
    });
      console.log('1isAdmin flag:', this.isAdmin)
    // 2) Nos suscribimos a cambios de auth
    supabase.auth.onAuthStateChange(async (_event, session) => {
      this.user = session?.user ?? null;
        
    });

    //   await  this.checkAdmin();
    //   console.log('2isAdmin flag:', this.isAdmin)
  }

  
  private async checkAdmin() {

      this.isAdmin = await this.supabasex.esAdministrador(this.user.id);
    }
  
  }
  

