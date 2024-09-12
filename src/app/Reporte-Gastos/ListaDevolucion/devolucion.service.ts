import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { from, Observable, of, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { DevolucionesList, Causa, DevolucionesDetalle} from './devolucion';
import { devolucionLists, devolucionDetalles} from './devolucion-data';
import { environment } from '../../../environments/environment';
import { TokenService } from '../../auth/token/token.service';

const API = environment.ApiUrl;
const API1='https://inp.inegi.org.mx/SistemaINPs/inpcwsprod/webresources/entidades.capturacausas/';

@Injectable({
    providedIn: 'root'
})
export class ServiceinvoiceService {
    private invoiceList: DevolucionesList[] = [];
    private devolucionDetalle: DevolucionesDetalle[] = [];


   
    private getDevoluciones() {
        return from(devolucionLists);
    }
    private getDevolucionesDetalle() {
        return from(devolucionDetalles);
    }


    constructor(private http: HttpClient,private tokenService: TokenService) {
        this.getDevoluciones().subscribe((data) => this.invoiceList.push(data)  );
        this.getDevolucionesDetalle().subscribe((data) => this.devolucionDetalle.push(data) );
    }

    public getDevolucionesList() {
        return this.invoiceList;
    }
    public updateDevolucionesList(id: number, arr: DevolucionesList) {
        let element = this.invoiceList.filter(x => x.DevolucionRf_Id === id);
        let index:number = this.invoiceList.indexOf(element[0]);
        this.invoiceList[index] = arr;
    }
    
    public addDevoluciones(repgasto: DevolucionesDetalle) {
        this.devolucionDetalle.splice(0,0,repgasto);
    }
 
    public getDevolucionesDetalleList(id:number) {
            return this.devolucionDetalle.filter(x => x.DevolucionRf_Id === id);
    }
   public updateDevoluciones(id: number, arr: DevolucionesDetalle) {
        let element = this.devolucionDetalle.filter(x => x.DevolucionRf_Id === id);
        let index:number = this.devolucionDetalle.indexOf(element[0]);
        this.devolucionDetalle[index] = arr;
    }

  


    listaCausa(){
        return this.http.get
            <Causa[]>(`${API1}`) // Assures to return a OBJECT ARRAY 
    }
}
