import { Component,  OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AssignmentsService } from '../shared/assignments.service';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../shared/auth.service';
import { users } from '../home/auth.model';
import { RouterLinkActive } from '@angular/router';

//
interface MenuItem {
  title: string;
  icon: string;
  link: string;
  visible: boolean;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLinkActive,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    RouterLink,
    MatSidenavModule,
    MatListModule,
    MatSlideToggleModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  titre = 'Premier projet Angular';
  auteur = 'Alihou Junior';
  opened: boolean = true; // Typage corrigé
  connectedUser!:users;

  // Info sur l'utilisateur connecté
  isAdmin: boolean = false;
  userName:string = '';
  userSurname:string = '';
  userImage:string = '';

  // Onglets du menu latéral
  sideMenuItems: MenuItem[] = [];

  // setting pour l'effet collapse du menu latéral
  collapsed:boolean = false;
  menuSize:string = this.collapsed ? '90px' : '350px' ;
  imageSize:string = this.collapsed ? '40px' : '150px' ;
  iconSize:string = this.collapsed ? '' : '' ;



  constructor(private assignmentsService: AssignmentsService,private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.authService.getProfile(token).subscribe(profile => {
        this.isAdmin = profile.role === 'admin';
        this.userName = profile.name;
        this.userSurname = profile.surname;
        this.userImage = profile.image;

        // Générer les onglets du menu latérale selon le role de l'utilisateur
        this.generateSideMenu();
      });
    }

  }

  generateSideMenu() {
    this.sideMenuItems = [
      { title: 'Mes devoirs', icon: 'assignment', link: '/main/assignments', visible: this.isAdmin? false : true },
      { title: 'Mes matières', icon: 'book', link: '/main/matieres', visible: this.isAdmin? true : false  },
      { title: 'Profil', icon: 'person', link: '/main/profile', visible: true},
      { title: 'About Us', icon: 'info', link: '/main/about', visible: true }
    ];
  }

  onSideMenu() {
    this.collapsed = !this.collapsed;
    this.menuSize = this.collapsed ? '90px' : '350px' ;
    this.imageSize = this.collapsed ? '70px' : '150px' ;

  }

  genererDonneesDeTest() {
    console.log("Génération des données de test");

    this.assignmentsService.peuplerBDavecForkJoin()
      .subscribe(() => {
        console.log("Toutes les données de test ont été insérées");

        // Redirection vers /home
        window.location.href = '/home';
      });
  }


  onLogout() {
    // Appeler la méthode logout() du AuthService
    this.authService.logout();

    // Rediriger vers la page de connexion après la déconnexion
    this.router.navigate(['/']);
  }
}
