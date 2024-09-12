import { HttpClient} from '@angular/common/http';
import { from } from 'rxjs';
import { Injectable } from '@angular/core';
import { ConfigFiltro, FiltroTransaccion, FiltroEstatus, Transacciones} from './operacion';
import { configfiltro, filtrotrans, filtroestatus, transacciones} from './operacion-data';
import { environment } from '../../environments/environment';
import { TokenService } from '../auth/token/token.service';
const API = environment.ApiUrl;

@Injectable({
    providedIn: 'root'
})
export class OperacionService {
    private confFiltro: ConfigFiltro[] = [];
    private filtroTrans: FiltroTransaccion[] = [];
    private filtroEstat: FiltroEstatus[] = [];
    private transAccion: Transacciones[] = [];

   
    private getFiltro() {
        return from(configfiltro);
    }

    private getFiltroTrans() {
        return from(filtrotrans);
    }

    private getFiltroEstat() {
        return from(filtroestatus);
    }

    private getTransaccion() {
        return from(transacciones);
    }


    constructor(private http: HttpClient,private tokenService: TokenService) {
        this.getFiltro().subscribe((data) => this.confFiltro.push(data)  );
        this.getFiltroTrans().subscribe((data) => this.filtroTrans.push(data));
        this.getFiltroEstat().subscribe((data) => this.filtroEstat.push(data)  );
        this.getTransaccion().subscribe((data) => this.transAccion.push(data)  );
    }

    public getFiltroList() {
        return this.confFiltro;
    }
    public getTransacciones() {
        return this.filtroTrans;
    }
    public getEstatusF() {
        return this.filtroEstat;
    }
    public getTrans() {
        return this.transAccion;
    }
}
