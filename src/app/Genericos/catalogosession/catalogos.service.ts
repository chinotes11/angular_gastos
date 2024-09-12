
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { forkJoin, from, Observable, of, throwError } from 'rxjs';
import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { TokenService } from '../../auth/token/token.service';

const API = environment.ApiUrl;
const APIAdmin= environment.ApiUrlAdmin;
const API1='https://inp.inegi.org.mx/SistemaINPs/inpcwsprod/webresources/entidades.capturacausas/';


@Injectable({
    providedIn: 'root'
})
export class catalogoService {
    constructor(private http: HttpClient) { }
    
    //public causaCatalogo(pedido: Pedido): Observable<any> {
    public causaCatalogo() {
        const headers = new HttpHeaders    
        headers.append('Content-type', 'applicartion.json')
        //return this.http.get<any>(`${API}`, pedido, { headers: headers })
        return this.http.get<any>(`${API1}`, { headers: headers })
    }

    public getWorkFlow() {
        const headers = new HttpHeaders    
        headers.append('Content-type', 'applicartion.json')
        //return this.http.get<any>(`${API}`, pedido, { headers: headers })
        return   this.http.get<any>(`${API}workflows/`, { headers: headers })
    }

    public getWorkFlows (idempresa:any) : Observable<any>  {
        const headers = new HttpHeaders    
        headers.append('Content-type', 'applicartion.json')
        //return this.http.get<any>(`${API}`, pedido, { headers: headers })
        let Catwork =this.http.get<any>(`${API}workflows/`, { headers: headers });
        let bancos=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=bancos`, { headers: headers });
        let centrosCostos=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=centrosCostos`, { headers: headers });
        let conceptosCatalogoSAT=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=conceptosCatalogoSAT`, { headers: headers });
        let areas=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=monedas`, { headers: headers });
        let monedas=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=monedas`, { headers: headers });
        let proyectos=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=proyectos`, { headers: headers });
        let tipoGastos=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=tipoGastos&filtro1=idEmpresas=${idempresa}`, { headers: headers });
        let regimenFiscal=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=regimenFiscal`, { headers: headers }); 
        let tipoSolicitud=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=tipoSolicitud`, { headers: headers });    
        let empresas=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=empresas`, { headers: headers }); 
        let metodosPago=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=metodosPago`, { headers: headers });  
        let formasPagos=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=formasPago`, { headers: headers }); 
        return forkJoin([Catwork, bancos, centrosCostos, conceptosCatalogoSAT, areas, monedas, proyectos, tipoGastos, regimenFiscal, tipoSolicitud, empresas, metodosPago, formasPagos]);         
    }

    


}