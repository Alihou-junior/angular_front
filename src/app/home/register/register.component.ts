import { Component } from '@angular/core';
import { AuthService } from '../../shared/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-register',
  imports: [CommonModule,FormsModule],
  standalone: true,//suggeré par chatgpt pour éviter les erreurs de compilation
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})

export class RegisterComponent {
  email: string = '';
  username: string = '';
  name:string = '';
  surname:string = '';
  password: string = '';
  role: string = 'user'; // Valeur par défaut

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    console.log(`On a soumis le formulaire avec email = ${this.email},
      username = ${this.username}, password = ${this.password}`);
    this.authService.register(this.username, this.name, this.surname, this.email, this.password, this.role)
      .subscribe({
        next: (response) => {
          console.log('Inscription réussie', response);
          alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
          // Redirection vers la page de connexion après l'inscription
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Erreur lors de l\'inscription', error);
          alert('Erreur lors de l\'inscription. Veuillez réessayer.');
        }
      });
    }
  }
