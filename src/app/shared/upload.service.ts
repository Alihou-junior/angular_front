import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UploadService {
  //private backendURL = 'http://localhost:8010/api/upload';
  //private backendURL = 'https://angular-back-gxb9.onrender.com/api/upload';
  private backendURL = 'https://angular-back-shog.onrender.com/api/upload';

  constructor(private http: HttpClient) { }

  // Méthode pour envoyer l'image au backend
  uploadImage(file: File): Observable<{ success: boolean, imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<{ success: boolean, imageUrl: string }>(`${this.backendURL}/image`, formData);
  }

}
