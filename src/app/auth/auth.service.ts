import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHeaders, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { TokenService } from './token/token.service';
import { environment } from '../../environments/environment';
import { Observable, Observer } from 'rxjs';

const API2 = environment.ApiUrlAdmin;
//https://admin-back-dot-dev-zzas-portal.ue.r.appspot.com/api/v1/auth/login
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private tokenService: TokenService) { }
  authenticate(userName: string, password: string) {
    console.log("AUTENYICA");
    return this.http
      .post(`${API2}auth/login`,{"userName":userName,"password":password}, {headers:{skip:"true"}} )
      .pipe(tap((res:any) => {  
        console.log("TOKE"+res.access_token) ; 
        let tok=''+res.access_token;       
        this.tokenService.setToken(tok,1); 
      }));
  }
	activate(userName: string, password: string, token: string) {
		return new Observable((observer: Observer<HttpEvent<any>>) => {
			const request = new Request(API2 + 'auth/finalize', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + token,
				},
				body: JSON.stringify({
					'userName': userName,
					'password': password,
				})
			});
			fetch(request).then((r) => {
				r.json().then((body) => {
					const headers = new HttpHeaders();
					r?.headers.forEach((value, name) => {
						headers.append(name, value);
					});
					observer.next(
						new HttpResponse({
							url: r.url,
							status: r.status,
							statusText: r.statusText,
							body: body,
							headers: headers,
						})
					);
				});
			});
		});

		return this.http.post(
			API2 + 'auth/finalize',
			{
				userName: userName,
				password: password,
			},
			{
				headers: {
					Authorization: 'Bearer ' + token,
				},
			}
		);
	}

	reset(password: string, token: string) {
		return this.http.post(
			API2 + 'auth/resetpassword',
			{
				password: password,
			},
			{
				headers: {
					Authorization: 'Bearer ' + token,
				},
			}
		);
	}

	refresh(token: string) {
		return this.http.post(API2 + 'auth/refresh', { token: token });
	}

	logout() {
		this.tokenService.removeToken();
		//this.tokenService.removeUser();
		//this.tokenService.removePermisos();
    window.location.href = 'https://dev-zzas-portal.ue.r.appspot.com/login';
	}
}