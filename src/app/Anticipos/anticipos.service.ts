//import { ListaGsto } from './../Solicitud-Fondos/Solicitud-Fondos.component';

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { from, Observable, of, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { TokenService } from '../auth/token/token.service';
const API = environment.ApiUrl;
const APIAdmin = environment.ApiUrlAdmin;
const httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    }) 
}; 

@Injectable({
    providedIn: 'root'
})
export class ServiceAnticipo {   
    constructor(private http: HttpClient,private tokenService: TokenService) { }

    public getAnticipo(idanticipo:number) {
        const headers = new HttpHeaders    
        headers.append('Content-type', 'applicartion.json')
        return this.http.get<any>(`${API}anticipos/${idanticipo}`, { headers: headers })
    }
    public getTipoGastos(empresaId: any) {
        return this.http.get(API+'catalogos/?catalogo=vwTipoGastos&filtro1='+encodeURIComponent('idEmpresas='+empresaId), httpOptions);
  	}

    public getTipoGastosEmpresa(empresaId: any, nivel:any) {
        return this.http.get(API+'catalogos/?catalogo=vwTipoGastosEmpresaCosto&filtro1='+encodeURIComponent('idEmpresas='+empresaId+' and nivelEstructura='+nivel ), httpOptions);
    }

}
