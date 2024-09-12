import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { from, Observable, of, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { ReembolsosList, Causa, ReembolsosDetalle} from './reembolso';
import { reembolsoLists, reembolsoDetalles} from './reembolso-data';
import { environment } from '../../../environments/environment';
import { TokenService } from '../../auth/token/token.service';

const API = environment.ApiUrl;
const API1='https://inp.inegi.org.mx/SistemaINPs/inpcwsprod/webresources/entidades.capturacausas/';

@Injectable({
    providedIn: 'root'
})
export class ServiceinvoiceService {
    private invoiceList: ReembolsosList[] = [];
    private reembolsoDetalle: ReembolsosDetalle[] = [];


   
    private getReembolsos() {
        return from(reembolsoLists);
    }
    private getReembolsosDetalle() {
        return from(reembolsoDetalles);
    }


    constructor(private http: HttpClient,private tokenService: TokenService) {
        this.getReembolsos().subscribe((data) => this.invoiceList.push(data)  );
        this.getReembolsosDetalle().subscribe((data) => this.reembolsoDetalle.push(data) );
    }

    public getReembolsosList() {
        return this.invoiceList;
    }
    public updateReembolsosList(id: number, arr: ReembolsosList) {
        let element = this.invoiceList.filter(x => x.ReembolsoRr_Id === id);
        let index:number = this.invoiceList.indexOf(element[0]);
        this.invoiceList[index] = arr;
    }
    
    public addReembolsos(repgasto: ReembolsosDetalle) {
        this.reembolsoDetalle.splice(0,0,repgasto);
    }
 
    public getReembolsosDetalleList(id:number) {
            return this.reembolsoDetalle.filter(x => x.ReembolsoRr_Id === id);
    }
   public updateReembolsos(id: number, arr: ReembolsosDetalle) {
        let element = this.reembolsoDetalle.filter(x => x.ReembolsoRr_Id === id);
        let index:number = this.reembolsoDetalle.indexOf(element[0]);
        this.reembolsoDetalle[index] = arr;
    }

  


    listaCausa(){
        return this.http.get
            <Causa[]>(`${API1}`) // Assures to return a OBJECT ARRAY 
    }
}
