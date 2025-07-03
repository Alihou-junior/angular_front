import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../shared/auth.service';
import { UploadService } from '../../shared/upload.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-edit-profile',
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
  editForm: FormGroup;
  user: any;
  imageUrl: string | null = null;
  isPasswordSectionVisible = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private uploadService: UploadService
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      oldPassword: [''],
      newPassword: ['', [Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.authService.getProfile(token).subscribe({
        next: (user) => {
          this.user = user;
          this.imageUrl = user.image;
          this.editForm.patchValue({
            name: user.name,
            surname: user.surname,
            username: user.username,
            email: user.email
          });
        },
        error: (err) => console.error('Erreur lors du chargement du profil', err)
      });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadService.uploadImage(file).subscribe({
        next: (response) => {
          this.imageUrl = response.imageUrl;
        },
        error: (err) => console.error('Erreur lors de l\'upload', err)
      });
    }
  }

  togglePasswordSection(): void {
    this.isPasswordSectionVisible = !this.isPasswordSectionVisible;
  }

  onSubmit(): void {
    if (this.editForm.valid) {
      const token = localStorage.getItem('token');
      if (token) {
        const formValue = this.editForm.value;
        this.authService.editProfile(
          token,
          this.user._id,
          formValue.name,
          formValue.surname,
          formValue.username,
          formValue.email,
          formValue.oldPassword,
          formValue.newPassword,
          this.imageUrl
        ).subscribe({
          next: (updatedUser) => {
            alert('Profil mis à jour avec succès!');
            window.location.reload();
          },
          error: (err) => {
            console.error('Erreur lors de la mise à jour', err);
            alert('Erreur lors de la mise à jour: ' + (err.error?.message || err.message));
          }
        });
      }
    }
  }
}
