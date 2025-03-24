import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AssignmentsService } from '../shared/assignments.service';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet, 
    MatButtonModule, 
    MatDividerModule, 
    MatIconModule, 
    RouterLink,
    MatSidenavModule,
    MatListModule,
    MatSlideToggleModule,
    MatToolbarModule,
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent {
  titre = 'Premier projet Angular';
  auteur = 'Alihou Junior';
  opened: boolean = false; // Typage corrigé

  constructor(private assignmentsService: AssignmentsService,private authService: AuthService, private router: Router) {}

  genererDonneesDeTest() {
    console.log("Génération des données de test");

    this.assignmentsService.peuplerBDavecForkJoin()
      .subscribe(() => {
        console.log("Toutes les données de test ont été insérées");

        // Redirection vers /home
        window.location.href = '/home';
      });
  }
  onLogout() {
    // Appeler la méthode logout() du AuthService
    this.authService.logout();

    // Rediriger vers la page de connexion après la déconnexion
    this.router.navigate(['/']);
  }
}
