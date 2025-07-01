import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { provideNativeDateAdapter } from '@angular/material/core';
import { AssignmentsService } from '../../shared/assignments.service';
import { MatiereService } from '../../shared/matieres.service';
import { AuthService } from '../../shared/auth.service';
import { Router } from '@angular/router';
import { Assignment } from '../assignment.model';
import { Matiere } from '../../matieres/matieres.model';
import { users } from '../../home/auth.model';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, startWith, map } from 'rxjs/operators';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  providers: [provideNativeDateAdapter()],
  selector: 'app-add-assignment',
 imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatSelectModule,
  ],
  templateUrl: './add-assignment.component.html',
  styleUrl: './add-assignment.component.css'
})

export class AddAssignmentComponent implements OnInit {
  assignmentForm!: FormGroup;
  matieres: Matiere[] = [];
  filteredMatieres$!: Observable<Matiere[]>;
  searchSubject = new Subject<string>();
  auteur!: users;
  today = new Date(); // Pour restreindre le datepicker


  constructor(
    private fb: FormBuilder,
    private assignmentsService: AssignmentsService,
    private matiereService: MatiereService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialogRef: MatDialogRef<AddAssignmentComponent>,
  ) {}


  ngOnInit(): void {
    // Initialiser le formulaire réactif
    this.assignmentForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      dateDeRendu: ['', Validators.required],
      matiereId: ['', Validators.required],
    });

    // Ajouter un écouteur pour déboguer l'état du formulaire
    this.assignmentForm.valueChanges.subscribe((value) => {
      console.log('Formulaire :', value, 'Valide :', this.assignmentForm.valid);
    });

    // Configurer la recherche dynamique pour les matières
    this.filteredMatieres$ = this.searchSubject.pipe(
      startWith(''),
      debounceTime(300), // Attendre 300ms avant de lancer la requête
      distinctUntilChanged(),
      switchMap((search) => this.loadMatieres(search))
    );


    // Récupérer l’utilisateur connecté
    const token = localStorage.getItem('token');
    if (token) {
      this.authService.getProfile(token).subscribe({
        next: (profile) => {
          this.auteur = profile;
          // Déclencher la recherche initiale
          this.searchSubject.next('');
        },
        error: (err) => {
          console.error('Erreur de profil', err);
          this.snackBar.open('Erreur de connexion. Veuillez vous reconnecter.', 'Fermer', { duration: 3000 });
          this.router.navigate(['/login']);
        },
      });
    } else {
      this.snackBar.open('Veuillez vous connecter.', 'Fermer', { duration: 3000 });
      this.router.navigate(['/login']);
    }
  }


  loadMatieres(search: string = ''): Observable<Matiere[]> {
    // Utiliser la pagination pour limiter à 10 matières par requête
    return this.matiereService.getMatieresAvecPagination(1, 10, search).pipe(
      map((res) => res.docs || []),
      map((matieres) => {
        this.matieres = matieres; // Synchroniser this.matieres
        return matieres;
      })
    );
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }


  // Fonction de comparaison pour mat-select
  compareMatiereById = (a: any, b: any): boolean => a?._id === b?._id;

  onMatiereSelected(event: MatAutocompleteSelectedEvent): void {
    const matiereId = event.option.value;
    this.assignmentForm.get('matiereId')?.setValue(matiereId);
    console.log('Matière sélectionnée :', matiereId, 'Formulaire valide :', this.assignmentForm.valid);
  }

  displayMatiere(matiere: Matiere): string {
    console.log("hahahah : ", matiere ? matiere.nom : '')
    console.log(matiere);
    return matiere ? matiere.nom : '';
  }

  isUser(responsable: string | users | undefined): responsable is users {
    return responsable != null && typeof responsable === 'object' && 'name' in responsable && 'surname' in responsable && 'image' in responsable;
  }

  onSubmit(): void {
    if (this.assignmentForm.invalid) {
      this.snackBar.open('Veuillez remplir tous les champs requis.', 'Fermer', { duration: 3000 });
      return;
    }

    const newAssignment = new Assignment();
    newAssignment.nom = this.assignmentForm.value.nom;
    newAssignment.dateDeRendu = this.assignmentForm.value.dateDeRendu;
    newAssignment.matiere = this.assignmentForm.value.matiereId._id;
    console.log("matiere id hopefully : ", this.assignmentForm.value.matiereId._id );
    newAssignment.auteur = this.auteur._id;
    newAssignment.rendu = false;

    console.log(newAssignment)

    this.assignmentsService.addAssignment(newAssignment).subscribe({
      next: () => {
        this.snackBar.open('Assignment créé avec succès !', 'Fermer', { duration: 3000 });
        this.dialogRef.close();
        this.router.navigate(['/main/assignments']);
      },
      error: (err) => {
        console.error('Erreur lors de l’ajout de l’assignment', err);
        this.snackBar.open('Erreur lors de la création de l’assignment. Réessayez.', 'Fermer', { duration: 3000 });
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
