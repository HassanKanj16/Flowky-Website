import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Observable, EMPTY, throwError} from 'rxjs';
import {API_URL} from '../env';
import {Email} from './email.model';
import {catchError} from 'rxjs/operators';

@Injectable()
export class EmailsApiService {

  constructor(private http: HttpClient) {
  }

  private static _handleError(err: HttpErrorResponse | any) {
    return Observable.throw(err.message || 'Error: Unable to complete request.');
  }

  // GET list of public, future events
  getEmails(): Observable<Email[]> {
    return this.http
      .get<Email[]>(`${API_URL}/newsletter`)
	  .pipe(
       catchError( err => {
            if (err.status == 401) {
                return EMPTY;
            } else {
                return throwError(err);
            }
       })
   );
  }
  
  addEmail(email: any){
	
	var e = {'email' : email};

	const headers = new HttpHeaders().set('Content-Type','application/json');

	return this.http.post<Email[]>(`${API_URL}/newsletter`,JSON.stringify(e),{headers:headers})
	.subscribe(data => {
	  
	});
  }
  
  uploadFile(file: any): Observable<string>{
	  const formData: FormData = new FormData();
	  formData.append('vid', file);
	  
	  return this.http.post<string>(`${API_URL}/video`, formData);
  }
  
  getProgress(id: any): Observable<string>{
	  return this.http
      .get<string>(`${API_URL}/progress/` + id)
	  .pipe(
       catchError( err => {
            if (err.status == 401) {
                return EMPTY;
            } else {
                return throwError(err);
            }
       })
   );
  }
  
  getStatus(id: any): Observable<string>{
	  return this.http
      .get<string>(`${API_URL}/status/` + id)
	  .pipe(
       catchError( err => {
            if (err.status == 401) {
                return EMPTY;
            } else {
                return throwError(err);
            }
       })
   );
  }
}