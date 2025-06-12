import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoadingOverlayComponent } from './components/loading-overlay/loading-overlay.component';
import { LoadingService } from './services/loading.service';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, LoadingOverlayComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
    cargando = false;
    cargandoRuta = false; 
  title = 'clinica-online';

   constructor(private router: Router, private loadingService: LoadingService) {
   /* this.router.events.subscribe(event => { 
      if (event instanceof NavigationStart) {
        this.cargandoRuta = true;
      }
      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        setTimeout(() => { // 👈 retrasa ocultarlo
    this.cargandoRuta = false;
  }, 300);
      }
    });*/

        this.loadingService.loading$.subscribe(valor => {
      this.cargando = valor;
    }); 
  }
}
