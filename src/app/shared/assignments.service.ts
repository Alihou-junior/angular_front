import { Injectable } from '@angular/core';
import { Assignment } from '../assignments/assignment.model';
import { forkJoin, Observable, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

import { bdInitialAssignments } from './data';

@Injectable({
  providedIn: 'root'
})
export class AssignmentsService {
  //private backendURL = 'http://localhost:8010/api/assignments';
  //backendURL = 'https://angularbackm2mbdsesatic2024-2025.onrender.com/api/assignments';
  private backendURL = 'https://angular-back-shog.onrender.com/api/assignments';
  //private backendURL = 'https://angular-back-gxb9.onrender.com/api/assignments';


assignments:Assignment[] = [];

  constructor(private http:HttpClient) { }

  // GET avec pagination + filtres
  getAssignmentsPagines(page:number, limit:number, search?: string, matiereId?: string, rendu?: boolean):Observable<any> {
    console.log("Service:getAssignments appelée !");

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    if (matiereId) {
      params = params.set('matiere', matiereId);
    }

    if (rendu !== null && rendu !== undefined) {
      params.set('rendu', rendu.toString());
    }

    return this.http.get<any>(`${this.backendURL}/paginated`, { params }) ; // http://localhost:8010/api/assignments/paginated

  }

  // GET par ID
  getAssignment(_id:string):Observable<Assignment> {
    console.log("Service:getAssignment appelée avec id = " + _id);
    return this.http.get<Assignment>(`${this.backendURL}/${_id}`); //http://localhost:8010/api/assignments/:id
  }

  // POST
  addAssignment(assignment:Assignment):Observable<Assignment> {
    // On ajoute l'assignment passé en paramètres
    // en l'envoyant par POST au backend
     return this.http.post<Assignment>(this.backendURL, assignment); //http://localhost:8010/api/assignments
  }

  // PUT
  updateAssignment(id: string, assignment:Partial<Assignment>):Observable<Assignment> {
    // On met à jour l'assignment passé en paramètres
    // en l'envoyant par PUT au backend
    return this.http.put<Assignment>(`${this.backendURL}/${id}`, assignment);
  }

  // DELETE
  deleteAssignment(assignmentId:string):Observable<Assignment> {
    // On supprime l'assignment passé en paramètres
    // en l'envoyant par DELETE au backend
    return this.http.delete<Assignment>(`${this.backendURL}/${assignmentId}`);
  }

  // GET par auteur (avec pagination)
  getAssignmentsByAuteurAvecPagination(auteurId: string, page:number, limit:number, search?: string, matiereId?: string, rendu?: boolean) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    if (matiereId) {
      params = params.set('matiere', matiereId);
    }

    if (rendu !== null && rendu !== undefined) {
      params = params.set('rendu', rendu.toString());
    }

    return this.http.get<any>(`${this.backendURL}/auteur/${auteurId}/paginated`, {params}) // http://localhost:8010/api/assignments/auteur/:id/paginated
  }

  // GET par matiere (avec pagination)
  getAssignmentsByMatiereAvecPagination(matiereId: string, page:number, limit:number, search?: string, rendu?: boolean) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    if (rendu !== null && rendu !== undefined) {
      params = params.set('rendu', rendu.toString());
    }

    return this.http.get<any>(`${this.backendURL}/matiere/${matiereId}/paginated`, {params}); // http://localhost:8010/api/assignments/matiere/:id/paginated
  }






  // Pour la génération de données de test
  peuplerBD() {
    bdInitialAssignments.forEach(a => {
      // on va construire un nouvel assignment
      let nouvelAssignment = new Assignment();
      nouvelAssignment.nom = a.nom;
      nouvelAssignment.dateDeRendu = new Date(a.dateDeRendu);
      nouvelAssignment.rendu = a.rendu;

      // J'appelle le service d'insertion d'un assignment
      // et je l'insère dans la base de données via le
      // backend
      this.addAssignment(nouvelAssignment)
      .subscribe(message => {
        console.log(message);
      });
    });
  }

  // VERSION AMELIOREE QUI RENVOIE UN OBSERVABLE ! Et qui permet donc
  // de savoir quand toutes les insertions sont terminées
  peuplerBDavecForkJoin():Observable<any> {
    let appelsVersAddAssignment:Observable<any>[] = [];

    bdInitialAssignments.forEach(a => {
      const nouvelAssignment = new Assignment();
      nouvelAssignment.nom = a.nom;
      nouvelAssignment.dateDeRendu = new Date(a.dateDeRendu);
      nouvelAssignment.rendu = a.rendu;

      appelsVersAddAssignment.push(this.addAssignment(nouvelAssignment))
    });

    // On renvoie un observable qui va nous permettre de savoir
    // quand toutes les insertions sont terminées
    return forkJoin(appelsVersAddAssignment);
  }

}
