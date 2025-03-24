import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router'; // Si vous souhaitez rediriger après la connexion
import { AuthService } from '../../shared/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [RouterLink , CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {

    // Appelez le service d'authentification pour effectuer la connexion
    this.authService.login(this.username, this.password).subscribe(
      (response) => {
        console.log('Connexion réussie', response);
        localStorage.setItem('token', response.token);
        // localStorage.setItem('testKey', 'testValue');
        console.log("valeur localstorage",localStorage);  // Devrait afficher "testValue"
        // Redirigez l'utilisateur vers la page d'accueil ou une autre page
        this.router.navigate(['main/assignments']);
      },
      (error) => {
        console.error('Erreur de connexion', error);
        alert('Nom d\'utilisateur ou mot de passe incorrect');
      }
    );
  }
  logout() {
    // Supprimer le jeton d'authentification (si stocké localement)
    this.authService.logout();  // Dépend de votre service d'authentification

    // Redirection vers la page de connexion
    this.router.navigate(['/login']);
  }
}
