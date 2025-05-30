import { Routes } from '@angular/router';
import { AssignmentsComponent } from './assignments/assignments.component';
import { AddAssignmentComponent } from './assignments/add-assignment/add-assignment.component';
import { NavigationErrorComponent } from './navigation-error-component/navigation-error-component.component';
import { AssignmentDetailComponent } from './assignments/assignment-detail/assignment-detail.component';
import { EditAssignmentComponent } from './assignments/edit-assignment/edit-assignment.component';
import { AboutmeComponent } from './assignments/aboutme/aboutme.component';
import { LoginComponent } from './home/login/login.component';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './home/register/register.component';
import { AuthGuard } from './shared/auth.guard';
import { MainLayoutComponent } from './main-layout/main-layout.component';

export const routes: Routes = [
    // Redirection vers la page de connexion par défaut
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },

    // Routes publiques (accessible sans authentification)
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },

    // Route protégée : nécessite une authentification
    {
        path: 'main',
        component: MainLayoutComponent,
        canMatch: [AuthGuard], // Protection avec AuthGuard (décommenter si nécessaire)
        children: [
            // Redirection par défaut vers "assignments" lorsque "main" est visité
            { path: 'home', redirectTo: 'assignments', pathMatch: 'full' },
            { path: 'assignments', component: AssignmentsComponent },
            { path: 'assignments/add', component: AddAssignmentComponent }, // Ajout sous le layout
            { path: 'assignments/:id', component: AssignmentDetailComponent },
            { path: 'assignments/:id/edit', component: EditAssignmentComponent },
        ]
    },
    { path: 'about', component: AboutmeComponent },

    // Route pour l'erreur 404 (page non trouvée)
    { path: '**', component: NavigationErrorComponent }
];
