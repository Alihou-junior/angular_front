import { Component, OnInit, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Matiere } from '../matieres.model';
import { users } from '../../home/auth.model';
import { MatiereService } from '../../shared/matieres.service';
import { AuthService } from '../../shared/auth.service';
import { UploadService } from '../../shared/upload.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-edit-matiere',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-matiere.component.html',
  styleUrls: ['./edit-matiere.component.css']
})
export class EditMatiereComponent implements OnInit {
  matiereForm: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  isLoading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public matiere: Matiere,  // La matière à modifier
    private fb: FormBuilder,
    private router: Router,
    private matiereService: MatiereService,
    private authService: AuthService,
    private uploadService: UploadService,
    private dialogRef: MatDialogRef<EditMatiereComponent>,
    private snackBar: MatSnackBar
  ) {
    // initialisation du formulaire pré-rempli avec les valeur de la matiere
    this.matiereForm = this.fb.group({
      nom: [this.matiere.nom, [Validators.minLength(3)]],
      description: [this.matiere.description, [Validators.minLength(10)]]
    });

    // Apercu de l'image de la matiere
    this.imagePreview = this.matiere.image;
  }

  ngOnInit() {

  }

  // Quand on clique sur le bouton "choisir une image" -> ouvre l'explorateur de fichier
  triggerFileInput(): void {
    const fileInput = document.getElementById('imageInput') as HTMLInputElement;
    fileInput?.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      // Aperçu de l'image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit() {
    if (this.matiereForm.invalid) {
      this.snackBar.open('Veuillez remplir correctement les champs', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading = true;

    if (this.selectedFile) {
      this.uploadAndEditMatiere();
    } else {
      this.editMatiere();
    }
  }

  uploadAndEditMatiere() {
    if(!this.selectedFile) {
      this.editMatiere();
      return;
    }

    this.uploadService.uploadImage(this.selectedFile).subscribe({
      next: (response) => {
        if (response.success) {
          this.editMatiere(response.imageUrl);
        } else {
          this.handleError("Erreur lors de l'upload de l'image");
        }
      },
      error: (err) => {
        this.handleError("Erreur lors de l'upload de l'image");
        console.error('Upload error:', err);
      }
    });
  }

  editMatiere(imageURL?: string) {
    const updatedData: Partial<Matiere> = {
      nom: this.matiereForm.value.nom,
      description: this.matiereForm.value.description,
      image: imageURL ?? this.matiere.image // utilise la nouvelle image ou garde l'ancienne
    };

    this.matiereService.updateMatiere(this.matiere._id, updatedData).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Matière modifiée avec succès', 'Fermer', {
          duration: 3000
        });
        this.dialogRef.close(true); // Ferme le popup avec succès
      },
      error: (err) => {
        this.handleError("Erreur lors de la mise à jour de la matière");
        console.error('Erreur lors de la mise à jour :', err);
      }
    });
  }

  private handleError(message: string): void {
    this.isLoading = false;
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }

  onCancel(): void {
    this.dialogRef.close(false); // Ferme le dialog sans action
  }

}
