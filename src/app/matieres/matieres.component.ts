import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { Matiere } from './matieres.model';
import { MatiereService } from '../shared/matieres.service';
import { users } from '../home/auth.model';
import { AuthService } from '../shared/auth.service';
import { AddMatiereComponent } from './add-matiere/add-matiere.component';
import { EditMatiereComponent } from './edit-matiere/edit-matiere.component';
@Component({
  selector: 'app-matieres',
  imports: [
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './matieres.component.html',
  styleUrl: './matieres.component.css'
})
export class MatieresComponent implements OnInit {

  titre = 'Mes Matieres';
  matieres: Matiere[] = [];

  // Pour la pagination
  page = 1;
  limit = 5 ;
  totalDocs = 2000;
  totalPages = 667;
  pagingCounter = 1;
  hasPrevPage = false;
  hasNextPage = true;
  prevPage = null;
  nextPage = null;
  responsable!: users;
  search: string = "";


  constructor(private matiereService: MatiereService, private authService: AuthService, private router: Router, private dialog: MatDialog) {}

  ngOnInit() {
    // Récupération des info du user connecté
    const token = localStorage.getItem('token');
    if (token) {
      this.authService.getProfile(token).subscribe({
        next: (profile) => {
          this.responsable = profile;
          this.getMatieres();  // Appel initial après récupération du profil
        },
        error: (err) => {
          console.error("Erreur de profil", err);
          this.router.navigate(['/login']);
        }
      });
    } else {
      this.router.navigate(['/login']);
    }

    this.page = 1;
    this.limit = 5;
    this.totalDocs = 0;
    this.pagingCounter = 1;
    this.hasPrevPage = false;
    this.hasNextPage = false;
    this.prevPage = null;
    this.nextPage = null;
  }

  pageSuivante() {
    this.page++;
    this.getMatieres();
  }

  pagePrecedente() {
    this.page--;
    this.getMatieres();
  }

  dernierePage() {
    this.page = this.totalPages;
    this.getMatieres();
  }
  premierePage() {
    this.page = 1;
    this.getMatieres();
  }

  // Récupérer matieres
  public getMatieres(): void {
    if (!this.responsable || !this.responsable._id) return;

    this.matiereService.getMatieresByResponsableAvecPagination(this.responsable._id, this.page, this.limit, this.search)
      .subscribe({
        next: (response) => {
          this.matieres = response.docs;
          this.totalDocs = response.totalDocs;
          this.totalPages = response.totalPages;
          this.pagingCounter = response.pagingCounter;
          this.hasPrevPage = response.hasPrevPage;
          this.hasNextPage = response.hasNextPage;
          this.prevPage = response.prevPage;
          this.nextPage = response.nextPage;
        },
        error: (err) => {
          console.error("Erreur lors de la récupération des matières :", err);
        }
      });
  }

  navigateToAssignments(matiereId: string) {
    this.router.navigate(['/main/assignments'], {
      queryParams: { matiere: matiereId }
    });
  }



  deleteMatiere(id: string): void {
    if (confirm('Voulez-vous vraiment supprimer cette matière ?')) {
      this.matiereService.deleteMatiere(id).subscribe(() => {
        this.getMatieres(); // Rafraîchir la liste après suppression
      });
    }
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(AddMatiereComponent, {
      width: '60vw', // Augmentez la largeur
      height: '50vh',
      maxWidth: '90vw', // Maximum 90% de la largeur de l'écran
      maxHeight: '90vh', // Maximum 90% de la hauteur de l'écran
      panelClass: 'custom-dialog-container', // Classe CSS personnalisée
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getMatieres();
      }
    });
  }

  openEditDialog(matiere: Matiere) {
    const dialogRef = this.dialog.open(EditMatiereComponent, {
      width: '60vw', // Augmentez la largeur
      height: '50vh',
      maxWidth: '90vw', // Maximum 90% de la largeur de l'écran
      maxHeight: '90vh', // Maximum 90% de la hauteur de l'écran
      panelClass: 'custom-dialog-container', // Classe CSS personnalisée
      disableClose: true,
      data: matiere,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getMatieres();
      }
    });
  }
}



