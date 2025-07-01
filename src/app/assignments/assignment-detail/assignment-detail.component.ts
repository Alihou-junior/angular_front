import { Component, Input, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AssignmentsService } from '../../shared/assignments.service';
import { MatiereService } from '../../shared/matieres.service';
import { AuthService } from '../../shared/auth.service';
import { Assignment } from '../assignment.model';
import { Matiere } from '../../matieres/matieres.model';
import { users } from '../../home/auth.model';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-assignment-detail',
  imports: [
    MatCardModule,
    CommonModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
  ],
  templateUrl: './assignment-detail.component.html',
  styleUrl: './assignment-detail.component.css',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('800ms ease-out', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideInLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-50px)' }),
        animate('800ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('slideInRight', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(50px)' }),
        animate('800ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('zoomIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('800ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class AssignmentDetailComponent implements OnInit {
  assignment: Assignment | null = null;
  matiere: Matiere | null = null;
  responsable!:users|string;
  connectedUser!:users;
  isUserRole: boolean = false;
  isAdminRole: boolean = false;
  isLoading = true;


  constructor(
    private route: ActivatedRoute,
    private assignmentsService: AssignmentsService,
    private matiereService: MatiereService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    public router: Router
  ) {}


  // Initialisation
  ngOnInit(): void {
    // Récupération de l’utilisateur connecté
    const token = localStorage.getItem('token');
    if (token) {
      this.authService.getProfile(token).subscribe({
        next: (profile) => {
          this.connectedUser = profile;
          this.checkUserRole();
          this.loadAssignment();

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


  // Determiner si l'utilisateur connecté est un user ou admin
  checkUserRole() {
    this.isAdminRole = this.connectedUser.role === 'admin';
    this.isUserRole = this.connectedUser.role === 'user';
  }


  // Récupérer l'assignment par ID
  loadAssignment() {
    const assignmentId = this.route.snapshot.paramMap.get('id');

    if(!assignmentId) {
      return;
    }

    this.assignmentsService.getAssignment(assignmentId).subscribe({
      next: (assignment) => {
        this.assignment = assignment;
        this.loadMatiere(assignment.matiere);
        //this.initForm(assignment);
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Impossible de charger l’assignment.', 'Fermer', { duration: 3000 });
        this.router.navigate(['/main/assignments']);
      }
    });


  }

  loadMatiere(matiereId: string): void {
    this.matiereService.getMatiereById(matiereId).subscribe({
      next: (matiere) => {
        this.matiere = matiere;
        this.loadResponsable(matiere.responsable);
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Impossible de charger la matière.', 'Fermer', { duration: 3000 });
        this.router.navigate(['/main/assignments']);
      }
    });
  }

  loadResponsable(user:users|string) {
    this.responsable = user;
    this.isLoading = false;
  }

  isUser(responsable: string | users | undefined): responsable is users {
    console.log("isUser : ",responsable != null && typeof responsable === 'object' && 'name' in responsable && 'surname' in responsable && 'image' in responsable);
    console.log(responsable);
    return responsable != null && typeof responsable === 'object' && 'name' in responsable && 'surname' in responsable && 'image' in responsable;
  }

}
