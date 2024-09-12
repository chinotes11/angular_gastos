import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { from, Observable, of, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { TesoreriaList,DatosFiscales, DatosFinancieros,DatosUsuario ,Causa, TransaccionPago, CompGastoList, TotalesList, ConceptosDetalle, EditaMontoDetalle} from './tesoreria';
import { tesoreriaLists, datosFiscales, datosFinancieros ,datosUsuario,tesoreriaDetalles, compgastoLists, totalesLists, conceptosDetalles, editamontoDetalles} from './tesoreria-data';
import { environment } from '../../../environments/environment';
import { TokenService } from '../../auth/token/token.service';

const API = environment.ApiUrl;
const API1='https://inp.inegi.org.mx/SistemaINPs/inpcwsprod/webresources/entidades.capturacausas/';

@Injectable({
    providedIn: 'root'
})
export class ServiceinvoiceService {
    private invoiceList: TesoreriaList[] = [];
    private datosList: DatosFiscales[] = [];
    private financierosList: DatosFinancieros[] = [];
    private datosUsuarioList: DatosUsuario[] = [];
    private tesoreriaDetalle: TransaccionPago[] = [];
    private compgastoList: CompGastoList[] = [];
    private totaleList: TotalesList[] = [];
    private cocneptoDetalle: ConceptosDetalle[] = [];
    private editamontoDetalle: EditaMontoDetalle[] = [];

   
    private getTesoreria() {
        return from(tesoreriaLists);
    }
    private getDatos() {
        return from(datosFiscales);
    }
    private getDatosF() {
        return from(datosFinancieros);
    }
    private getDatosU() {
        return from(datosUsuario);
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


    constructor(private http: HttpClient,private tokenService: TokenService) {
        this.getTesoreria().subscribe((data) => this.invoiceList.push(data)  );
        this.getDatos().subscribe((data) => this.datosList.push(data)  );
        this.getDatosF().subscribe((data) => this.financierosList.push(data)  );
        this.getDatosU().subscribe((data) => this.datosUsuarioList.push(data)  );

        this.getTransaccionPago().subscribe((data) => this.tesoreriaDetalle.push(data) );
        this.getCompGasto().subscribe((data) => this.compgastoList.push(data) );
        this.getTotales().subscribe((data) => this.totaleList.push(data) );
        this.getConceptoDetalle().subscribe((data) => this.cocneptoDetalle.push(data) );
        this.getEditaMontoDetalle().subscribe((data) => this.editamontoDetalle.push(data) );
    }

    public getTesoreriaList() {
        return this.invoiceList;
    }
    public getDatosFiscales() {
        return this.datosList;
    }
    public getDatosFinancieros() {
        return this.financierosList;
    }
    public getDatosUsuario() {
        return this.datosUsuarioList;
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

    listaCausa(){
        return this.http.get
            <Causa[]>(`${API1}`) // Assures to return a OBJECT ARRAY 
    }
}
