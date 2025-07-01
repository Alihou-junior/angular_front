import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Assignment } from '../assignment.model';
import { users } from '../../home/auth.model';
import { AssignmentsService } from '../../shared/assignments.service';
import { MatiereService } from '../../shared/matieres.service';
import { Matiere } from '../../matieres/matieres.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-edit-assignment',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatIconModule
  ],
  templateUrl: './edit-assignment.component.html',
  styleUrls: ['./edit-assignment.component.css']
})
export class EditAssignmentComponent implements OnInit {
  assignmentId!: string;
  assignment!: Assignment;
  matiere!: Matiere;
  editForm!: FormGroup;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private assignmentsService: AssignmentsService,
    private matiereService: MatiereService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.assignmentId = this.route.snapshot.paramMap.get('id') || '';
    this.loadAssignment();
  }

  loadAssignment(): void {
    this.assignmentsService.getAssignment(this.assignmentId).subscribe({
      next: (assignment) => {
        this.assignment = assignment;
        this.loadMatiere(assignment.matiere);
        this.initForm(assignment);
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
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Impossible de charger la matière.', 'Fermer', { duration: 3000 });
      }
    });
  }

  initForm(assignment: Assignment): void {
    this.editForm = this.fb.group({
      note: [assignment.note ?? '', [Validators.min(0), Validators.max(20)]],
      remarques: [assignment.remarques ?? '']
    });
  }

  onSubmit(): void {
    if (this.editForm.invalid) {
      this.snackBar.open('Formulaire invalide', 'Fermer', { duration: 3000 });
      return;
    }

    const updated: Partial<Assignment> = {
      note: this.editForm.value.note,
      remarques: this.editForm.value.remarques,
      rendu: true // on considère que si le prof attribue une note, le devoir est rendu
    };

    this.assignmentsService.updateAssignment(this.assignmentId, updated).subscribe({
      next: () => {
        this.snackBar.open('Assignment mis à jour !', 'Fermer', { duration: 3000 });
        this.router.navigate(['/main/assignments']);
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Erreur lors de la mise à jour.', 'Fermer', { duration: 3000 });
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/main/assignments']);
  }

  isUser(responsable: string | users | undefined): responsable is users {
    console.log("isUser : ",responsable != null && typeof responsable === 'object' && 'name' in responsable && 'surname' in responsable && 'image' in responsable);
    console.log(responsable);
    return responsable != null && typeof responsable === 'object' && 'name' in responsable && 'surname' in responsable && 'image' in responsable;
  }

}
