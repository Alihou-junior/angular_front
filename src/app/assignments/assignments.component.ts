import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { Assignment } from './assignment.model';
import { Matiere } from '../matieres/matieres.model';
import { users } from '../home/auth.model';
import { AssignmentsService } from '../shared/assignments.service';
import { AuthService } from '../shared/auth.service';
import { MatiereService } from '../shared/matieres.service';
import { AddAssignmentComponent } from './add-assignment/add-assignment.component';
import { EditAssignmentComponent } from './edit-assignment/edit-assignment.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-assignments',
  imports: [
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatButtonToggleModule,
    CommonModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './assignments.component.html',
  styleUrls: ['./assignments.component.css']
})
export class AssignmentsComponent implements OnInit {
  titre = 'Gestion des Devoirs';
  assignments: Assignment[] = [];
  displayedColumns: string[] = ['nom', 'matiere', 'date', 'etat'];

  // Pagination
  page = 1;
  limit = 10;
  totalDocs = 0;
  totalPages = 0;
  hasPrevPage = false;
  hasNextPage = false;

  // Filtres
  search = '';
  rendu: string = 'undefined';
  matieresControl = new FormControl<string[]>([]);
  private searchSubject = new Subject<string>();

  // Données
  matieres: Matiere[] = [];
  matiereId_admin:string = '';
  isLoading = false;
  isAdmin = false;
  isUser = false;

  constructor(
    private assignmentsService: AssignmentsService,
    private authService: AuthService,
    private matiereService: MatiereService,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.checkAuthAndRole();
    this.setupSearchDebounce();

    // Récupérer le paramètre matiere de l'URL si présent
    console.log("after : ", this.isAdmin);

    this.matieresControl.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.page = 1;
      this.getAssignments();
    });


  }

  private checkAuthAndRole() {
    const token = localStorage.getItem('token');
    if (token) {
      this.authService.getProfile(token).subscribe({
        next: (profile) => {
          console.log("role admin: ",profile.role === 'admin');
          this.isAdmin = profile.role === 'admin';
          console.log("admin?: ", this.isAdmin);
          this.isUser = profile.role === 'user';
          this.updateDisplayedColumns();
          this.loadInitialData();

          if(this.isAdmin) {
            console.log("je suis admin");
            this.checkCurrentUrl();

            this.router.events.pipe(
              filter(event => event instanceof NavigationEnd)
            ).subscribe(() => {
              this.checkCurrentUrl();
            });
          } else {
            this.matiereId_admin = '';
          }
        },
        error: () => this.router.navigate(['/login'])
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  private updateDisplayedColumns() {
    this.displayedColumns = ['nom', 'matiere', 'date', 'etat'];
    if (this.isAdmin) {
      this.displayedColumns.splice(3, 0, 'auteur');
    }
    this.displayedColumns.push('actions');
  }

  private setupSearchDebounce() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.getAssignments());
  }

  private loadInitialData() {
    this.isLoading = true;

    if (this.isUser) {
      this.matiereService.getMatieres().subscribe(matieres => {
        this.matieres = matieres;
        this.getAssignments();
      });
    } else {
      this.getAssignments();
    }
  }

  private checkCurrentUrl() {
    this.activatedRoute.queryParams.subscribe(params => {
      const matiereId = params['matiere'];

      if (matiereId) {
        this.matiereId_admin = matiereId;
        localStorage.setItem('lastMatiereId', matiereId); // Sauvegarde
        this.getAssignments();
      } else {
        // Récupère depuis localStorage si pas dans l'URL
        const savedId = localStorage.getItem('lastMatiereId');
        if (savedId) {
          this.matiereId_admin = savedId;
          this.getAssignments();
        }
      }
    });
  }

  getAssignments() {
  this.isLoading = true;
  const token = localStorage.getItem('token');
  if (!token) return;

  this.authService.getProfile(token).subscribe(profile => {
    const selectedMatieres = this.matieresControl.value || [];
    const matiereFilter = selectedMatieres.length > 0 ? selectedMatieres.join(',') : undefined;
    const renduFilter = this.rendu === 'undefined' ? undefined : this.rendu === 'true';

    // Priorité au matiereId_admin s'il est défini (venant de l'URL)
    const finalMatiereFilter = ( this.matiereId_admin !== undefined &&  this.matiereId_admin !==null &&  this.matiereId_admin !== '')? this.matiereId_admin : matiereFilter;

    let serviceCall;

    if (this.isAdmin) {
      if (this.matiereId_admin) {
        // Cas spécifique où l'admin filtre par matière
        serviceCall = this.assignmentsService.getAssignmentsByMatiereAvecPagination(
          this.matiereId_admin,
          this.page,
          this.limit,
          this.search,
          renduFilter
        );
      } else {
        // Cas général pour l'admin (toutes les matières)
        serviceCall = this.assignmentsService.getAssignmentsPagines(
          this.page,
          this.limit,
          this.search,
          undefined, // Pas de filtre matière
          renduFilter
        );
      }
    } else {
      // Cas utilisateur normal
      serviceCall = this.assignmentsService.getAssignmentsByAuteurAvecPagination(
        profile._id,
        this.page,
        this.limit,
        this.search,
        finalMatiereFilter,
        renduFilter
      );
    }

    serviceCall.subscribe({
      next: (data) => {
        this.updatePaginationData(data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.snackBar.open('Erreur lors du chargement', 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  });
}

  private updatePaginationData(data: any) {
    this.assignments = data.docs;
    this.totalDocs = data.totalDocs;
    this.totalPages = data.totalPages;
    this.hasPrevPage = data.hasPrevPage;
    this.hasNextPage = data.hasNextPage;
  }

  // Méthodes de pagination
  premierePage() { this.page = 1; this.getAssignments(); }
  pagePrecedente() { this.page--; this.getAssignments(); }
  pageSuivante() { this.page++; this.getAssignments(); }
  dernierePage() { this.page = this.totalPages; this.getAssignments(); }

  // Gestion des assignments
  afficheDetail(id: string) {
    this.router.navigate(['/main/assignments', id]);
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(AddAssignmentComponent, {
      width: 'auto', // Permet au dialog de s'adapter au contenu
      minWidth: '30vw',
      maxWidth: '70vw', // Largeur maximale (90% de la largeur de l'écran)
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container', // Classe CSS personnalisée
      autoFocus: false,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getAssignments();
    });
  }

  editAssignment(id: string) {
    this.router.navigate(['/main/assignments/'+ id + '/edit']);
  }

  deleteAssignment(id: string, event: MouseEvent) {
    event.stopPropagation();
    if (confirm('Voulez-vous vraiment supprimer ce devoir ?')) {
      this.assignmentsService.deleteAssignment(id).subscribe({
        next: () => {
          this.snackBar.open('Devoir supprimé', 'Fermer', { duration: 2000 });
          this.getAssignments();
        },
        error: () => this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 })
      });
    }
  }

  getMatiereName(matiereId: string): string {
    const matiere = this.matieres.find(m => m._id === matiereId);
    return matiere ? matiere.nom : '';
  }

  onSearchInput() {
    this.searchSubject.next(this.search);
  }

  isMatiere(value: any): value is Matiere {
    return value && typeof value === 'object' && 'nom' in value;
  }

  getAuteurName(auteur: any): string {
    if (!auteur) return 'Inconnu';
    if (typeof auteur === 'string') return auteur;
    return `${auteur.name} ${auteur.surname}`;
  }
}


