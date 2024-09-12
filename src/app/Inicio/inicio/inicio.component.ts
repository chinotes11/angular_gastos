import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, ActivatedRoute } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError, filter, map, mergeMap } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { TokenService } from '../../auth/token/token.service';
//import * as _moment from '../../../../node_modules/angular-jwt';
//const jwt = require('angular-jwt');
//const jwtt = require('angular-jwt.jwt');
//import { jwtHelper } from 'angular-jwt';

@Component({
  //selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss']
})
export class InicioComponent {
  constructor(private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private token: TokenService) {
    console.log('INICIO');
    //this.token.setToken("eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2MzI4NTQ2OTIsImV4cCI6MTYzMjg1ODI5MiwianRpIjoiNTZhMjk2ODEtNDBiYS00OWM4LTlhYjUtYzdkOGZjOTRhODg3IiwiaWQiOjEsInJscyI6IkFETU9OOjI6dmVtfHZjb3x2cnB8dmN0fHZlb3x2Y2N8dnJnfHZ3ZixHQVNUT1M6NDp2YXJ8dmV2fHZlcnx2YXN8dnRjfHZvcnx2d2YiLCJyZl9leHAiOjE2MzI5NDEwOTJ9.f0hgZrgo7JTUSmuCZR2VZ4cODDRRRfjoV5ZFIltcxfI",0);   

    this.route.queryParams
      .subscribe(params => {
        console.log(params);
        let token: string = params.tk;
        let empresa: string = params.e;
        //console.log('token',token);
        //console.log('empresa',empresa);
        this.token.setToken(token, empresa);
        window.location.href = '/anticipos';
      },
        (err: any) => { console.log(err); },
        () => { }
      );
    //*/  
    /*         
  this.auth.authenticate('zahzeadmin', 'Zahze#gcp$')
  //this.auth.authenticate('guillermo.fischer', 'Abcde12345')
   .pipe(catchError(err => { return throwError(err); })
   ).subscribe((res:any) => {
     console.log('RESPONDER', res);
      this.router.navigate(['/anticipos']);
    },
    (err:any) => {  },
    () => {console.log('Termino'); }
  ); //*/
  }

}