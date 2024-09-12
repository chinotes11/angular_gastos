import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { from, Observable, of, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { GastosZList, Causa, GastosDetalle, ProdServList, CfdiRelacion, CompNoFiscal } from './gastosz';
import { gastoszLists, gastoszDetalles, prodservLists, cfdirelLists, compnofiscalDetalles} from './gastosz-data';
import { environment } from '../../environments/environment';
import { TokenService } from '../auth/token/token.service';

const API = environment.ApiUrl;
const API1='https://inp.inegi.org.mx/SistemaINPs/inpcwsprod/webresources/entidades.capturacausas/';

@Injectable({
    providedIn: 'root'
})
export class ServiceinvoiceService {
    private invoiceList: GastosZList[] = [];
    private gastoDetalle: GastosDetalle[] = [];
    private prodserveList: ProdServList[] = [];
    private cfdirelList: CfdiRelacion[] = [];
    private compnofiscalDetalle: CompNoFiscal[] = [];

   
    private getGastosZ() {
        return from(gastoszLists);
    }
    private getGastosDetalle() {
        return from(gastoszDetalles);
    }

    private getProdServ() {
        return from(prodservLists);
    }

    private getCfdiRelacion() {
        return from(cfdirelLists);
    }

    private getCompNoFiscal() {
        return from(compnofiscalDetalles);
    }


    constructor(private http: HttpClient,private tokenService: TokenService) {
        this.getGastosZ().subscribe((data) => this.invoiceList.push(data)  );
        this.getGastosDetalle().subscribe((data) => this.gastoDetalle.push(data) );
        this.getProdServ().subscribe((data) => this.prodserveList.push(data) );
        this.getCfdiRelacion().subscribe((data) => this.cfdirelList.push(data) );
        this.getCompNoFiscal().subscribe((data) => this.compnofiscalDetalle.push(data) );
    }

    public getGastosZList() {
        return this.invoiceList;
    }
    public deleteGastosZ(id: number) {
        this.invoiceList = this.invoiceList.filter(CId => CId.idgasto !== id);
    }
    public addGastosZ(invoice: GastosZList) {
        this.invoiceList.splice(0,0,invoice);
    }
    public updateGastosZ(id: number, invoice: GastosZList) {
        let element = this.invoiceList.filter(x => x.idgasto === id);
        let index:number = this.invoiceList.indexOf(element[0]);
        this.invoiceList[index] = invoice;
    }
    public getGastosDetalleList(id:number) {
        return this.gastoDetalle.filter(x => x.idgasto === id);
    }
    public getProdServList(id:number) {
        return this.prodserveList.filter(x => x.idgasto === id);
    }
    public getCfdiRelacionList(id:number) {
        return this.cfdirelList.filter(x => x.idgasto === id);
    }
    
    public getCompNoFiscalDetalle(id:number) {
        return this.compnofiscalDetalle.filter(x => x.idgasto === id);
    }
    public addNoFiscal(nofiscal: CompNoFiscal) {
        this.compnofiscalDetalle.splice(0,0,nofiscal);
    }
    public updateNoFiscal(id: number, nofiscal: CompNoFiscal) {
        let element = this.compnofiscalDetalle.filter(x => x.idgasto === id);
        let index:number = this.compnofiscalDetalle.indexOf(element[0]);
        this.compnofiscalDetalle[index] = nofiscal;
    }

    listaCausa(){
        return this.http.get
            <Causa[]>(`${API1}`) // Assures to return a OBJECT ARRAY 
    }
}
