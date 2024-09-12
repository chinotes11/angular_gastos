import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { from, Observable, of, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { TesoreriaList, Causa, TransaccionPago, CompGastoList, TotalesList, ConceptosDetalle, EditaMontoDetalle, TipoTransaccion, ConfigPago} from './tesoreria';
import { tesoreriaLists, tesoreriaDetalles, compgastoLists, totalesLists, conceptosDetalles, editamontoDetalles, tipotransaccion, configpago} from './tesoreria-data';
import { environment } from '../../../environments/environment';
import { TokenService } from '../../auth/token/token.service';

const API = environment.ApiUrl;
const API1='https://inp.inegi.org.mx/SistemaINPs/inpcwsprod/webresources/entidades.capturacausas/';

@Injectable({
    providedIn: 'root'
})
export class ServiceinvoiceService {
    private invoiceList: TesoreriaList[] = [];
    private tesoreriaDetalle: TransaccionPago[] = [];
    private compgastoList: CompGastoList[] = [];
    private totaleList: TotalesList[] = [];
    private cocneptoDetalle: ConceptosDetalle[] = [];
    private editamontoDetalle: EditaMontoDetalle[] = [];
    private configPago: ConfigPago[] = [];
    private tipoTransaccion: TipoTransaccion[] = [];

   
    private getTesoreria() {
        return from(tesoreriaLists);
    }

    private getTransaccionPago() {
        return from(tesoreriaDetalles);
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

    private getConfigPago() {
        return from(configpago);
    }

    private getTipoTransaccion() {
        return from(tipotransaccion);
    }


    constructor(private http: HttpClient,private tokenService: TokenService) {
        this.getTesoreria().subscribe((data) => this.invoiceList.push(data)  );
        this.getTransaccionPago().subscribe((data) => this.tesoreriaDetalle.push(data) );
        this.getCompGasto().subscribe((data) => this.compgastoList.push(data) );
        this.getTotales().subscribe((data) => this.totaleList.push(data) );
        this.getConceptoDetalle().subscribe((data) => this.cocneptoDetalle.push(data) );
        this.getEditaMontoDetalle().subscribe((data) => this.editamontoDetalle.push(data) );
        this.getConfigPago().subscribe((data) => this.configPago.push(data) );
        this.getTipoTransaccion().subscribe((data) => this.tipoTransaccion.push(data) );
    }

    public getTesoreriaList() {
        return this.invoiceList;
    }
    public deleteTesoreria(id: number) {
        this.invoiceList = this.invoiceList.filter(CId => CId.IdColaborador !== id);
    }
    


    public getTransaccionPagoList(id:number) {
        return this.tesoreriaDetalle.filter(x => x.IdPago === id);
    }
    public addTesoreria(repgasto: TransaccionPago) {
        this.tesoreriaDetalle.splice(0,0,repgasto);
    }
    public updateTesoreria(id: number, arr: TransaccionPago) {
        let element = this.tesoreriaDetalle.filter(x => x.IdPago === id);
        let index:number = this.tesoreriaDetalle.indexOf(element[0]);
        this.tesoreriaDetalle[index] = arr;
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

    public getConfigPagoD() {
        return this.configPago;
    }
    public getTipoTransaccionCat() {
        return this.tipoTransaccion;
    }
}
