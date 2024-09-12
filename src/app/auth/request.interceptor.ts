import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { TokenService } from "./token/token.service";
import { AuthService } from "../auth/auth.service";


@Injectable()
export class RequestInterceptor implements HttpInterceptor {
    refreshTokenInProgress = false;
    accessTokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>('')
    constructor(
        private tokenService: TokenService,
        private authService: AuthService
    ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if(req.url.startsWith('https://gastos-back-dot') || req.url.startsWith('https://admin-back-dot')){            
            req = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${this.tokenService.getToken()}`)
            });
            return next.handle(req).pipe(
                catchError((e: HttpErrorResponse) => {
                    var isTokenExpired = this.tokenService.isTokenExpired();
                    //console.log(e,"   -   ",isTokenExpired )
                    //console.log(e instanceof HttpErrorResponse )
                    if (e instanceof HttpErrorResponse && e.status === 401 && isTokenExpired) {
                        //console.log("INTERCEPTOR");
                        if (!this.refreshTokenInProgress) {
                            this.refreshTokenInProgress = true;
                            this.accessTokenSubject.next('');
                            return this.authService.refresh(this.tokenService.getToken())
                                .pipe(
                                switchMap((authResponse: {[k: string]: any}) => {
                                    console.log(authResponse);
                                    this.refreshTokenInProgress = false;
                                    this.accessTokenSubject.next(authResponse.access_token);
                                    this.tokenService.setTokens(authResponse.access_token);
                                    req = req.clone({
                                        setHeaders: {
                                            authorization: `Bearer ${authResponse.access_token}`
                                        }
                                    });
                                    return next.handle(req);
                                }),
                                catchError((e: HttpErrorResponse) => {
                                    this.refreshTokenInProgress = false;
                                    this.authService.logout();
                                    return throwError(e);
                                })
                            )
                        } else {
                            return this.accessTokenSubject.pipe(
                                filter(access_token => access_token !== ''),
                                take(1),
                                switchMap(access_token => {
                                    req = req.clone({
                                        setHeaders: {
                                            authorization: `Bearer ${access_token}`
                                        }
                                    });
                                    return next.handle(req);
                                }));
                        }
                    }
                    return throwError(e);
                })
            )
        }else{
            return next.handle(req);
        }
    }
}