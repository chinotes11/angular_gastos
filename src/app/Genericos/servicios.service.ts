
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { from, Observable, of, throwError } from 'rxjs';
import { Injectable } from '@angular/core';

import { moneda } from './catalogos/moneda-data';
import { Monedas } from './catalogos/moneda';
import { TipoSolicitud } from './catalogos/tiposolicitud';
import { tipoSol } from './catalogos/tiposolicitud-data';
import { environment } from '../../environments/environment';
import { TokenService } from '../auth/token/token.service';

const API = environment.ApiUrl;

@Injectable({
    providedIn: 'root'
})
export class WorkFlowService { 
    private monedaLista: Monedas[] = [];   
    private tiposolLista: TipoSolicitud[] = [];  
    
    private getMonedas() {
        return from(moneda);
    }
    private getTipoSolicitud() {
        return from(tipoSol);
    }
    constructor(private http: HttpClient,private tokenService: TokenService) {
        
        this.getMonedas().subscribe((data) =>
            this.monedaLista.push(data)
        );
        this.getTipoSolicitud().subscribe((data) =>
            this.tiposolLista.push(data)
        );
    }

    public getMonedaList() {
        return this.monedaLista;      
    }

    public getTipoSolicitudList() {
        return this.tiposolLista;      
    }


}
