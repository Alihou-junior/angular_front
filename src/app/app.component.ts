import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav'; // Ajout du module MatSidenav
import { AssignmentsService } from './shared/assignments.service';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    MatButtonModule, 
    MatDividerModule, 
    MatIconModule, 
    // RouterLink,
    MatSidenavModule, // Ajout du module MatSidenav ici
    MatListModule,
    MatSlideToggleModule,
    MatToolbarModule,
    
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] // Changement de styleUrl à styleUrls pour que l'array fonctionne
})
export class AppComponent {
  titre = 'Premier projet Angular';
  auteur = 'Alihou Junior';
opened: any;

  constructor(private assignmentsService: AssignmentsService) {}

  genererDonneesDeTest() {
    console.log("Génération des données de test");
    //this.assignmentsService.peuplerBD()

    this.assignmentsService.peuplerBDavecForkJoin()
    .subscribe(() => {
      console.log("Toutes les données de test ont été insérées");

      // Je navigue vers la page qui affiche la liste des assignments
      window.location.href = '/home';
    });
  }
}
