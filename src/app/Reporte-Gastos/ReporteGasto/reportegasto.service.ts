import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { from, Observable, of, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { ReporteGastoList, Causa, ReporteGastoDetalle, CompGastoList, TotalesList, ConceptosDetalle, EditaMontoDetalle} from './reportegasto';
import { reportegastoLists, reportegastoDetalles, compgastoLists, totalesLists, conceptosDetalles, editamontoDetalles} from './reportegasto-data';
import { environment } from '../../../environments/environment';
import { TokenService } from '../../auth/token/token.service';

const API = environment.ApiUrl;
const API1='https://inp.inegi.org.mx/SistemaINPs/inpcwsprod/webresources/entidades.capturacausas/';

@Injectable({
    providedIn: 'root'
})
export class ServiceinvoiceService {
    private invoiceList: ReporteGastoList[] = [];
    private reportegastoDetalle: ReporteGastoDetalle[] = [];
    private compgastoList: CompGastoList[] = [];
    private totaleList: TotalesList[] = [];
    private cocneptoDetalle: ConceptosDetalle[] = [];
    private editamontoDetalle: EditaMontoDetalle[] = [];

   
    private getReporteGasto() {
        return from(reportegastoLists);
    }
    private getReporteGastoDetalle() {
        return from(reportegastoDetalles);
    }

    private getCompGasto() {
        return from(compgastoLists);
    }

    private getTotales() {
        return from(totalesLists);
    }

    private getConceptoDetalle() {
        return from(conceptosDetalles);
    }

    private getEditaMontoDetalle() {
        return from(editamontoDetalles);
    }


    constructor(private http: HttpClient,private tokenService: TokenService) {
        this.getReporteGasto().subscribe((data) => this.invoiceList.push(data)  );
        this.getReporteGastoDetalle().subscribe((data) => this.reportegastoDetalle.push(data) );
        this.getCompGasto().subscribe((data) => this.compgastoList.push(data) );
        this.getTotales().subscribe((data) => this.totaleList.push(data) );
        this.getConceptoDetalle().subscribe((data) => this.cocneptoDetalle.push(data) );
        this.getEditaMontoDetalle().subscribe((data) => this.editamontoDetalle.push(data) );
    }

    public getReporteGastoList() {
        return this.invoiceList;
    }
    public deleteReporteGasto(id: number) {
        this.invoiceList = this.invoiceList.filter(CId => CId.exr_id !== id);
    }
    


    public getReporteGastoDetalleList(id:number) {
        return this.reportegastoDetalle.filter(x => x.exr_id === id);
    }
    public addReporteGasto(repgasto: ReporteGastoDetalle) {
        this.reportegastoDetalle.splice(0,0,repgasto);
    }
    public updateReporteGasto(id: number, arr: ReporteGastoDetalle) {
        let element = this.reportegastoDetalle.filter(x => x.exr_id === id);
        let index:number = this.reportegastoDetalle.indexOf(element[0]);
        this.reportegastoDetalle[index] = arr;
    }


    public getCompGastoList(id:number) {
        return this.compgastoList.filter(x => x.idgasto === id);
    }

    public getTotalesList(id:number) {
        return this.totaleList.filter(x => x.idgasto === id);
    }

    public getConceptoDetalleList(id:number) {
        return this.cocneptoDetalle.filter(x => x.idgasto === id);
    }


    public getEditaMontoDetalleList(id:number) {
        return this.editamontoDetalle.filter(x => x.Idcomp === id);
    }    
    public updateEditaMonto(id: number, arr: EditaMontoDetalle) {
        let element = this.editamontoDetalle.filter(x => x.Idcomp === id);
        let index:number = this.editamontoDetalle.indexOf(element[0]);
        this.editamontoDetalle[index] = arr;
    }


    /*
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
    }*/

    listaCausa(){
        return this.http.get
            <Causa[]>(`${API1}`) // Assures to return a OBJECT ARRAY 
    }
}
