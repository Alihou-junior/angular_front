import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Matiere } from '../matieres/matieres.model';


@Injectable({
  providedIn: 'root'
})
export class MatiereService {

  private backendURL = 'http://localhost:8010/api/matieres';
  //private backendURL = 'https://angular-back-gxb9.onrender.com/api/matieres';

  constructor(private http: HttpClient) {}


  // GET sans pagination
  getMatieres(search?: string): Observable<Matiere[]> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<Matiere[]>(this.backendURL, { params });  // 'http://localhost:8010/api/matieres?search=value
  }

  // GET par ID
  getMatiereById(id: string): Observable<Matiere> {
    return this.http.get<Matiere>(`${this.backendURL}/${id}`); // http://localhost:8010/api/matieres/:id
  }

  // POST
  addMatiere(matiere: Matiere): Observable<Matiere> {
    return this.http.post<Matiere>(this.backendURL, matiere); // http://localhost:8010/api/matieres
  }

  // PUT
  updateMatiere(id: string, matiere: Partial<Matiere>): Observable<Matiere> {  // Partial<Matiere> signifie : "un objet qui a zéro ou plusieurs propriétés de Matiere".
    return this.http.put<Matiere>(`${this.backendURL}/${id}`, matiere); //http://localhost:8010/api/matieres/:id
  }

  // DELETE
  deleteMatiere(id: string): Observable<any> {
    return this.http.delete(`${this.backendURL}/${id}`);
  }

  // GET avec pagination + filtres
  getMatieresAvecPagination(page: number, limit: number, search?: string, responsableId?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    if (responsableId) {
      params = params.set('responsable', responsableId);
    }

    return this.http.get<any>(`${this.backendURL}/paginated`, { params }); // http://localhost:8010/api/matieres/paginated
  }

  // GET par responsable (avec pagination)
  getMatieresByResponsableAvecPagination(responsableId: string, page: number, limit: number, search?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<any>(`${this.backendURL}/responsable/${responsableId}/paginated`, { params }); // http://localhost:8010/api/matieres/responsable/:id/paginated
  }

}
