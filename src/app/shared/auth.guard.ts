import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CanMatchFn, Route, UrlSegment } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(private authService: AuthService, private router: Router) {}

  canMatch: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
    const isAuthenticated = this.authService.isAuthenticated();
    if (isAuthenticated) {
      console.log('Vous êtes connecté');
      return true;  // L'accès à la route est autorisé
    } else {
      console.log('Vous n\'êtes pas connecté, redirection vers login');
      this.router.navigate(['login']);  // Rediriger vers la page de login
      return false;  // Bloquer l'accès à la route
    }
  };
}
