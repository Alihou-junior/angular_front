import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Matiere } from '../matieres.model';
import { users } from '../../home/auth.model';
import { MatiereService } from '../../shared/matieres.service';
import { AuthService } from '../../shared/auth.service';
import { UploadService } from '../../shared/upload.service';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-add-matiere',
  imports : [ReactiveFormsModule ],
  templateUrl: './add-matiere.component.html',
  styleUrls: ['./add-matiere.component.css']
})
export class AddMatiereComponent implements OnInit {
  matiereForm: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  isLoading = false;
  responsable!:users;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private matiereService: MatiereService,
    private authService: AuthService,
    private uploadService: UploadService,
    private dialogRef: MatDialogRef<AddMatiereComponent>,
    private snackBar: MatSnackBar
  ) {
    this.matiereForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token) {
      this.authService.getProfile(token).subscribe({
        next: (profile) => {
          this.responsable = profile;
        },
        error: (err) => {
          console.error("Erreur de profil", err);
          this.router.navigate(['/login']);
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
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

  onSubmit(): void {
    if (this.matiereForm.invalid) {
      this.snackBar.open('Veuillez remplir correctement tous les champs', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading = true;

    if (this.selectedFile) {
      this.uploadAndCreateMatiere();
    } else {
      this.createMatiere();
    }
  }

  private uploadAndCreateMatiere(): void {
    // Normalament on peut supprimer cette vérification ar on l'a deja faite dans submit , mais c'est pour au cas ou
    if (!this.selectedFile) {
      this.createMatiere();
      return;
    }

    this.uploadService.uploadImage(this.selectedFile).subscribe({
      next: (response) => {
        if (response.success) {
          this.createMatiere(response.imageUrl);
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

  private createMatiere(imageUrl?: string): void {
    let newMatiere = new Matiere() ;
    newMatiere.nom =   this.matiereForm.value.nom;
    newMatiere.description = this.matiereForm.value.description;

    // verifiez si une image a été selectionnée
    if (imageUrl) {
      newMatiere.image = imageUrl;
    } else {
      newMatiere.image = "https://i.pinimg.com/736x/82/75/ea/8275ea5e8c59e1f95401a6bd72566d41.jpg";
    }

    // Récupérer le profile de l'utilisateur connecté
    newMatiere.responsable = this.responsable._id;


    this.matiereService.addMatiere(newMatiere).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.snackBar.open('Matière créée avec succès', 'Fermer', {
          duration: 3000
        });
        this.dialogRef.close(true); // Ferme le dialog et retourne true pour indiquer un succès
      },
      error: (err) => {
        this.handleError("Erreur lors de la création de la matière");
        console.error('Creation error:', err);
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
