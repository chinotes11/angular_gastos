import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
import { Component, ViewChild, OnInit, Inject } from '@angular/core';
import { OperacionService } from '../operacion.service';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Data, NavigationEnd, Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MensajesService } from "../../Genericos/mensajes/mensajes.service";
import { DatePipe } from '@angular/common';
import { forkJoin, Observable, Subscription, throwError } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { catchError, filter, map, mergeMap } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { DateAdapter, ErrorStateMatcher, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DataService } from "../../Genericos/data.service";
import { serviciosService } from "../../Genericos/servicios/servicios.service";
import * as _moment from 'moment';
import { ExcelServiceService } from '../../Genericos/excelService/ExcelService.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenService } from '../../auth/token/token.service';
import { environment } from '../../../environments/environment';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_FORMATS } from '../../Genericos/utilidades/funciones';
const APIAdmin = environment.ApiUrlAdmin;
const API = environment.ApiUrl;
const headers = new HttpHeaders
headers.append('Content-type', 'applicartion.json')
const moment = _moment;
interface TipoComprobantes {
  id: number;
  tipo: string;
}
const tipocomprobantes: TipoComprobantes[] = [
  {
    id: 1,
    tipo: 'Fiscal'
  },
  {
    id: 2,
    tipo: 'No Fiscal'
  },
];

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}


@Component({
  //selector: 'app-invoice-list',
  templateUrl: './Poliza-Contable.component.html',
  styleUrls: ['./Poliza-Contable.component.scss'],
  providers: [{provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},{provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}]
})
export class PolizaContableComponent implements OnInit {
  antList: MatTableDataSource<any>;
  antPagList: MatTableDataSource<any>;
  comGasList: MatTableDataSource<any>;
  reemList: MatTableDataSource<any>;
  reemPagList: MatTableDataSource<any>;
  devolList: MatTableDataSource<any>;
  estructuraList: MatTableDataSource<any>;

  subscription!: Subscription;
  selection = new SelectionModel<any>(true, []);
  pageInfo: Data = Object.create(null);
  message: any;
  arrsesion: any;
  transaccion: any;
  TipoComprobante: any;
  arrSelecto: any;
  layout: string = '0';
  MonedaL: any;
  formaPagos: any;
  FiltroOperacion: any;
  FiltroTrans: any;
  FiltroEstatus: any;
  FiltroTrnsDet: any;
  CentroCosto: any;
  Empresas: any;
  Transacciones: any;
  Estatus: any;
  FechaInicial: any;
  FechaFinal: any;
  idRol: any;
  datSess: any;
  Proyectos: any;

  arrBusquEstat: any;
  arrBusquEmp: any;
  arrBusquCC: any;
  arrBusquIni: any;
  arrBusquFin: any;

  bsqAnticipo: any;
  bsqPagAnt: any;
  bsqCompGas: any;
  bsqReembolso: any;
  bsPagReem: any;
  bsqDevol: any;
  bsqEstructura:any='a';
  filtroGral: any = '';

  empresaSel: any;
  empresaId: number = 0;
  empresaName: string = '';
  estructura: any;
  estructuraPlana: any;
  estructuraPlanaOrig: any;

  checked: any = false;
  encabezado:boolean=true;
  nomEmpresa:any;
  nomCC:any;

  // antColumns: string[] = ['fechaOperacion', 'tipoTransaccion', 'estatus', 'idTransaccion', 'monto', 'area', 'descripcionCentrosCostos', 'idCuentaContable', 'descripcionCuentaContable'];
  // antPagColumns: string[] = ['fechaOperacion', 'tipoTransaccion', 'estatus', 'idTransaccion', 'monto', 'area', 'descripcionCentrosCostos', 'idCuentaContable', 'descripcionCuentaContable'];
  // gastoColumns: string[] = ['fechaOperacion', 'tipoTransaccion', 'estatus', 'idTransaccion', 'monto', 'area', 'descripcionCentrosCostos', 'idCuentaContable', 'descripcionCuentaContable'];
  // reemColumns: string[] = ['fechaOperacion', 'tipoTransaccion', 'estatus', 'idTransaccion', 'monto', 'area', 'descripcionCentrosCostos', 'idCuentaContable', 'descripcionCuentaContable'];
  // reemPagColumns: string[] = ['fechaOperacion', 'tipoTransaccion', 'estatus', 'idTransaccion', 'monto', 'area', 'descripcionCentrosCostos', 'idCuentaContable', 'descripcionCuentaContable'];
  // devolColumns: string[] = ['fechaOperacion', 'tipoTransaccion', 'estatus', 'idTransaccion', 'monto', 'area', 'descripcionCentrosCostos', 'idCuentaContable', 'descripcionCuentaContable'];
  // estColumns: string[] = ['select', 'descripcionEstructura', 'descripcionPuesto', 'descripcionCentroCostos'];
 
  antColumns: string[] = ['fechaOperacion', 'tipoTransaccion', 'estatus', 'idTransaccion', 'monto', 'area', 'descripcionCentrosCostos'];
  antPagColumns: string[] = ['fechaOperacion', 'tipoTransaccion', 'estatus', 'idTransaccion', 'monto', 'area', 'descripcionCentrosCostos'];
  gastoColumns: string[] = ['fechaOperacion', 'tipoTransaccion', 'estatus', 'idTransaccion', 'monto', 'area', 'descripcionCentrosCostos'];
  reemColumns: string[] = ['fechaOperacion', 'tipoTransaccion', 'estatus', 'idTransaccion', 'monto', 'area', 'descripcionCentrosCostos'];
  reemPagColumns: string[] = ['fechaOperacion', 'tipoTransaccion', 'estatus', 'idTransaccion', 'monto', 'area', 'descripcionCentrosCostos'];
  devolColumns: string[] = ['fechaOperacion', 'tipoTransaccion', 'estatus', 'idTransaccion', 'monto', 'area', 'descripcionCentrosCostos'];
  estColumns: string[] = ['select', 'descripcionEstructura', 'descripcionPuesto', 'descripcionCentroCostos'];
  //antColumns:string[]=['select','Empresa','BancoEmisor','CuentaEmisora','Proyecto','CentrodeCostos','TipoCambio','FechaGenLay','TipoTransaccion','Moneda', 'PagoManual'];
  
  @ViewChild('sort0', { read: MatSort })   sort0: MatSort = new MatSort;
  @ViewChild('paginator0', {read: MatPaginator}) paginator0: MatPaginator | undefined;
  @ViewChild('sort1', { read: MatSort })   sort1: MatSort = new MatSort;
  @ViewChild('paginator1', {read: MatPaginator}) paginator1: MatPaginator | undefined;
  @ViewChild('sort2', { read: MatSort })   sort2: MatSort = new MatSort;
  @ViewChild('paginator2', {read: MatPaginator}) paginator2: MatPaginator | undefined;
  @ViewChild('sort3', { read: MatSort })   sort3: MatSort = new MatSort;
  @ViewChild('paginator3', {read: MatPaginator}) paginator3: MatPaginator | undefined;
  @ViewChild('sort4', { read: MatSort })   sort4: MatSort = new MatSort;
  @ViewChild('paginator4', {read: MatPaginator}) paginator4: MatPaginator | undefined;
  @ViewChild('sort5', { read: MatSort })   sort5: MatSort = new MatSort;
  @ViewChild('paginator5', {read: MatPaginator}) paginator5: MatPaginator | undefined;


  constructor(
    private opService: OperacionService,
    private servicios: serviciosService,
    private excelExporta: ExcelServiceService,
    public dialog: MatDialog,
    public datePipe: DatePipe,
    private router: Router,
    private titleService: Title,
    private activatedRoute: ActivatedRoute,
    private mensajes: MensajesService,
    private datosPaso: DataService,
    private http: HttpClient,
    private token: TokenService) {
    this.datSess = token.readToken('id', '');
    this.datSess = this.datSess.split(',');
    this.idRol = token.readToken('rlsRol', 'GASTOS');
    this.FiltroOperacion = {
      idEmpresa: 0,
      idCentrosCostos: 0,
      lstaTrans: [],
      lstaEstatus: [],
      FechaInicio: '',
      FechaFin: ''
    };
    this.FiltroTrans = this.opService.getTransacciones();
    this.FiltroEstatus = this.opService.getEstatusF();
    this.FiltroTrnsDet = this.opService.getTrans();
    this.antList = new MatTableDataSource();
    this.antPagList = new MatTableDataSource();
    this.comGasList = new MatTableDataSource();
    this.reemList = new MatTableDataSource();
    this.reemPagList = new MatTableDataSource();
    this.devolList = new MatTableDataSource();
    this.estructuraList = new MatTableDataSource();

    
    this.getUsuario(this.datSess[0], this.datSess[1]).subscribe((rsUs: any) => {
      this.arrsesion = rsUs[0];
      this.arrsesion.map((t1: any) => { t1.idEmpresa = Number(this.datSess[1]); t1.idRoles = this.idRol; });
      this.getDatos(this.datSess[1], this.arrsesion[0].idEstructura, this.datSess[0]).subscribe((resp: any) => {
        this.MonedaL = resp[0];
        
        this.FiltroOperacion.idCentrosCostos=resp[5][0].idCentrosCostos;
        let arrCC:any =[]
        resp[1].forEach((e:any) => {arrCC.push({idCentrosCostos:e.idCentrosCostos, descripcionCentrosCostos:e.descripcionCentrosCostos})});
        const ids = arrCC.map((o:any) => o.idCentrosCostos)
        const filtered = arrCC.filter(({idCentrosCostos}:any, index:any) => !ids.includes(idCentrosCostos, index + 1))
        this.CentroCosto = filtered;
        //this.CentroCosto = resp[1];
        console.log("---------",resp[5][0].idCentrosCostos)
        
        this.Empresas = resp[2];
        this.Proyectos = resp[3];
        this.formaPagos = resp[4];
        this.FiltroOperacion.idEmpresa=this.Empresas[0].id;
        //this.FiltroOperacion.idCentrosCostos=this.CentroCosto[0].idCentrosCostos;
        this.TipoComprobante = tipocomprobantes;
        this.arrBusquEmp = this.FiltroOperacion.idEmpresa;
        this.arrBusquCC = this.FiltroOperacion.idCentrosCostos;
        this.nomEmpresa =this.Empresas[0].clave;
        this.nomCC = this.CentroCosto[0].descripcionCentrosCostos;        
        this.cargaEstructura();
        this.encabezado=false;
      });
    });

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .pipe(map(() => this.activatedRoute))
      .pipe(
        map(route => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        })
      )
      .pipe(filter(route => route.outlet === 'primary'))
      .pipe(mergeMap(route => route.data))
      .subscribe(event => {
        this.titleService.setTitle(event['title']);
        this.pageInfo = event;
      });
  }
  reinicioTablas(){
    this.antList = new MatTableDataSource();
    this.antPagList = new MatTableDataSource();
    this.comGasList = new MatTableDataSource();
    this.reemList = new MatTableDataSource();
    this.reemPagList = new MatTableDataSource();
    this.devolList = new MatTableDataSource();
  }

  Inicio(params: any, tipo: any) {
    console.log('RES', params, tipo);
    this.reinicioTablas();    
    this.servicios.getUnParametro('catalogos', '?catalogo=vwReporteOperacion&filtro1=' + encodeURIComponent(params))
      .pipe(catchError(err => { this.antList = new MatTableDataSource(); return throwError(err); }))
      .subscribe(
        (res: any) => {
          console.log('res', res, tipo);
          let arrTabla = [];
          arrTabla = res;//.map( (t1:any) => ({ ...t1, ...this.arrsesion.find((t2:any) => t2.idUser === t1.idUser) }) ) 
          arrTabla.map((t1: any) => { t1.fechaOperacion = String(moment(new Date(t1.fechaOperacion)).format("DD/MM/YYYY")); });
          //res.length==0?this.bsqAnticipo = '':'';
          switch (tipo) {
            case 'Anticipo':
              this.antList = new MatTableDataSource(arrTabla);
              this.antList.paginator = this.paginator0!;
              this.antList.sort = this.sort0;              
              break;
            case 'Pago Anticipo':
              this.antPagList = new MatTableDataSource(arrTabla);
              this.antPagList.paginator = this.paginator1!;
              this.antPagList.sort = this.sort1;              
              break;
            case 'ComprobacionGastos':
              this.comGasList = new MatTableDataSource(arrTabla);
              this.comGasList.paginator = this.paginator2!;
              this.comGasList.sort = this.sort2;
              break;
            case 'Reembolso':
              this.reemList = new MatTableDataSource(arrTabla);
              this.reemList.paginator = this.paginator3!;
              this.reemList.sort = this.sort3;
              break;
            case 'Pago Reembolso':
              this.reemPagList = new MatTableDataSource(arrTabla);
              this.reemPagList.paginator = this.paginator4!;
              this.reemPagList.sort = this.sort4;
              break;
            case 'Devolucion':
              this.devolList = new MatTableDataSource(arrTabla);
              this.devolList.paginator = this.paginator5!;
              this.devolList.sort = this.sort5;
              break;
          }

          const sortState: Sort = { active: 'fechaOperacion', direction: 'desc' };
          this.sort0.active = sortState.active;
          this.sort0.direction = sortState.direction;
          this.sort0.sortChange.emit(sortState);

          this.sort1.active = sortState.active;
          this.sort1.direction = sortState.direction;
          this.sort1.sortChange.emit(sortState);

          this.sort2.active = sortState.active;
          this.sort2.direction = sortState.direction;
          this.sort2.sortChange.emit(sortState);

          this.sort3.active = sortState.active;
          this.sort3.direction = sortState.direction;
          this.sort3.sortChange.emit(sortState);

          this.sort4.active = sortState.active;
          this.sort4.direction = sortState.direction;
          this.sort4.sortChange.emit(sortState);

          this.sort5.active = sortState.active;
          this.sort5.direction = sortState.direction;
          this.sort5.sortChange.emit(sortState);
        },
        (err: any) => { });

  }

  ngOnInit() {
    this.subscription = this.datosPaso.currentMessage.subscribe((message) => { this.message = message; console.log(message); }); // {{message[0].filtro.name}}
    this.bsqAnticipo = '';
    this.bsqPagAnt = '';
    this.bsqCompGas = '';
    this.bsqReembolso = '';
    this.bsPagReem = '';
    this.bsqDevol = '';
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  pasoFiltros() {
    this.datosPaso.changeMessage([{ filtro: '', tipo: '' }])
  }

  filtrado(evento: any, arr: any, tipo: any) {
    let valor: any;
    if (evento.value) {
      valor = evento.value;
    } else {
      valor = evento.target.value;
    }
    //console.log(valor, '  --   ', tipo)

    switch (tipo) {
      case 'EM':
        this.arrBusquEmp = valor;
        this.FiltroOperacion.idEmpresa=valor;     
        this.cargaEstructura();
        console.log(evento, arr, tipo, valor);
        break;

      case 'CC':
        this.arrBusquCC = valor;
        this.FiltroOperacion.idCentrosCostos=valor;
        console.log(evento, arr, tipo, valor);
        break;

      case 'FI':
        this.arrBusquIni = moment(new Date(valor)).format("YYYY-MM-DD");
        console.log(evento, arr, tipo, valor);
        break;

      case 'FF':
        this.arrBusquFin = moment(new Date(valor)).format("YYYY-MM-DD");
        console.log(evento, arr, tipo, valor);
        break;

      case 'TR':      
        console.log(valor.find((a:any)=>a==99))        
        this.arrBusquEstat = valor.find((a:any)=>a==99)?[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]: valor; 
        console.log(evento, arr, tipo, valor);
        break;
    }
  }

  getTotalAnt() { return this.antList.data.map((t: any) => t.monto).reduce((acc: any, value: any) => acc + value, 0); }
  getTotalAntAp() { let sum = 0; this.antList.data.forEach((v) => { if (v.estatus == 'Aprobado') { sum += v.monto; } }); return sum; }
  getTotalAntPag() { let sum = 0; this.antList.data.forEach((v) => { if (v.estatus == 'Pagada') { sum += v.monto; } }); return sum; }
  getTotalAntPp() { let sum = 0; this.antList.data.forEach((v) => { if (v.estatus == 'Pagado Parcial') { sum += v.monto; } }); return sum; }
  getTotalPagAnt() { return this.antPagList.data.map((t: any) => t.monto).reduce((acc: any, value: any) => acc + value, 0); }
  getTotalPagAntP() { let sum = 0; this.antPagList.data.forEach((v) => { if (v.estatus == 'Pagado') { sum += v.monto; } }); return sum; }
  getTotalGasto() { return this.comGasList.data.map((t: any) => t.monto).reduce((acc: any, value: any) => acc + value, 0); }
  getTotalGstAp() { let sum = 0; this.comGasList.data.forEach((v) => { if (v.estatus == 'Aprobado') { sum += v.monto; } }); return sum; }
  getTotalGstPag() { let sum = 0; this.comGasList.data.forEach((v) => { if (v.estatus == 'Pagado') { sum += v.monto; } }); return sum; }
  getTotalGstPp() { let sum = 0; this.comGasList.data.forEach((v) => { if (v.estatus == 'Pagado Parcial') { sum += v.monto; } }); return sum; }
  getTotalReem() { return this.reemList.data.map((t: any) => t.monto).reduce((acc: any, value: any) => acc + value, 0); }
  getTotalReemAp() { let sum = 0; this.reemList.data.forEach((v) => { if (v.estatus == 'Aprobado') { sum += v.monto; } }); return sum; }
  getTotalReemPag() { let sum = 0; this.reemList.data.forEach((v) => { if (v.estatus == 'Pagado') { sum += v.monto; } }); return sum; }
  getTotalReemPp() { let sum = 0; this.reemList.data.forEach((v) => { if (v.estatus == 'Pagado Parcial') { sum += v.monto; } }); return sum; }
  getTotalPagReem() { return this.reemPagList.data.map((t: any) => t.monto).reduce((acc: any, value: any) => acc + value, 0); }
  getTotalPagReemP() { let sum = 0; this.reemPagList.data.forEach((v) => { if (v.estatus == 'Pagado') { sum += v.monto; } }); return sum; }
  getTotalDev() { return this.devolList.data.map((t: any) => t.monto).reduce((acc: any, value: any) => acc + value, 0); }
  getTotalDevAp() { let sum = 0; this.devolList.data.forEach((v) => { if (v.estatus == 'Aprobado') { sum += v.monto; } }); return sum; }
  getTotalDevCon() { let sum = 0; this.devolList.data.forEach((v) => { if (v.estatus == 'Pagado') { sum += v.monto; } }); return sum; }

  buscar() {
    this.filtroGral = '';
    this.bsqAnticipo = '';
    this.bsqPagAnt = '';
    this.bsqCompGas = '';
    this.bsqReembolso = '';
    this.bsPagReem = '';
    this.bsqDevol = '';
    let bscEstruc:any='';
    let ctaAnt = 0, ctaPgAnt = 0, ctaGas = 0, ctaReem = 0, ctaPgReem = 0, ctaDev = 0;
    if (this.arrBusquEmp) { this.filtroGral += `idEmpresas=${this.arrBusquEmp} AND `; } else { this.mensajes.mensaje('Debe seleccionar una Empresa en el filtro.', '', 'danger'); return false; }
    if (this.arrBusquCC) { this.filtroGral += `idCentrosCostos=${this.arrBusquCC} AND `; } else { }//this.mensajes.mensaje('Debe seleccionar un Centro de Costos en el filtro.','','danger'); return false;   
    if (this.arrBusquEstat) { } else { this.mensajes.mensaje('Debe seleccionar un tipo de estatus en el filtro.', '', 'danger'); return false; }
    if (this.arrBusquIni) { if (this.arrBusquFin) { this.filtroGral += `fechaOperacion BETWEEN '${this.arrBusquIni}' AND '${this.arrBusquFin}' AND `; } else { this.mensajes.mensaje('Debe seleccionar fecha Inicial y fecha Final.', '', 'danger'); return false; } }
    //this.selection.selected.length === 0 ?
    if (this.selection.selected.length > 0) {
      bscEstruc='';
      this.selection.selected.map((t1:any) => { bscEstruc+="'"+t1.descripcionEstructura+"',";}); bscEstruc=bscEstruc.replace(/,(\s+)?$/, '');  
      this.filtroGral += `area IN (${bscEstruc}) AND `;
      console.log("bscEstruc",bscEstruc);
    }
    this.arrBusquEstat.forEach((e: any) => {
      if (e >= 1 && e <= 3) {
        this.bsqAnticipo += e == 1 ? "'Aprobado'," : '';
        this.bsqAnticipo += e == 2 ? "'Pagada'," : '';
        this.bsqAnticipo += e == 3 ? "'Pagado Parcial'," : '';
        ctaAnt++;
      }
      if (e == 4) {
        this.bsqPagAnt = e == 4 ? "'Pagado'" : '';
        ctaPgAnt++;
      }
      if (e >= 5 && e <= 7) {
        this.bsqCompGas += e == 5 ? "'Aprobado'," : '';
        this.bsqCompGas += e == 6 ? "'Pagado'," : '';
        this.bsqCompGas += e == 7 ? "'Pagado Parcial'," : '';
        ctaGas++;
      }
      if (e >= 8 && e <= 10) {
        this.bsqReembolso += e == 8 ? "'Aprobado'," : '';
        this.bsqReembolso += e == 9 ? "'Pagado'," : '';
        this.bsqReembolso += e == 10 ? "'Pagado Parcial'," : '';
        ctaReem++;
      }
      if (e == 11) {
        this.bsPagReem = e == 11 ? "'Pagado'" : '';
        ctaPgReem++;
      }
      if (e >= 12 && e <= 13) {
        this.bsqDevol += e == 12 ? "'Aprobado'," : '';
        this.bsqDevol += e == 13 ? "'Pagado'," : '';
        ctaDev++;
      }
    });
    ctaAnt > 0 ? this.bsqAnticipo = this.bsqAnticipo.substring(0, this.bsqAnticipo.length - 1) : '';
    ctaAnt > 0 ? this.bsqAnticipo = `${this.filtroGral} tipo IN ('Anticipo') AND estatus IN (${this.bsqAnticipo}) ` : '';
    ctaPgAnt > 0 ? this.bsqPagAnt = `${this.filtroGral} tipo IN ('Pago Anticipo') AND estatus IN (${this.bsqPagAnt}) ` : '';
    ctaGas > 0 ? this.bsqCompGas = this.bsqCompGas.substring(0, this.bsqCompGas.length - 1) : '';
    ctaGas > 0 ? this.bsqCompGas = `${this.filtroGral} tipo IN ('ComprobacionGastos') AND estatus IN (${this.bsqCompGas}
      
      ) ` : '';
    ctaReem > 0 ? this.bsqReembolso = this.bsqReembolso.substring(0, this.bsqReembolso.length - 1) : '';
    ctaReem > 0 ? this.bsqReembolso = `${this.filtroGral} tipo IN ('Reembolso') AND estatus IN (${this.bsqReembolso}) ` : '';
    ctaPgReem > 0 ? this.bsPagReem = `${this.filtroGral} tipo IN ('Pago Reembolso') AND estatus IN (${this.bsPagReem}) ` : '';
    ctaDev > 0 ? this.bsqDevol = this.bsqDevol.substring(0, this.bsqDevol.length - 1) : '';
    ctaDev > 0 ? this.bsqDevol = `${this.filtroGral} tipo IN ('Devolucion') AND estatus IN (${this.bsqDevol}) ` : '';

    this.bsqAnticipo.length > 0 ? this.Inicio(this.bsqAnticipo, 'Anticipo') : '';
    this.bsqPagAnt.length > 0 ? this.Inicio(this.bsqPagAnt, 'Pago Anticipo') : '';
    this.bsqCompGas.length > 0 ? this.Inicio(this.bsqCompGas, 'ComprobacionGastos') : '';
    this.bsqReembolso.length > 0 ? this.Inicio(this.bsqReembolso, 'Reembolso') : '';
    this.bsPagReem.length > 0 ? this.Inicio(this.bsPagReem, 'Pago Reembolso') : '';
    this.bsqDevol.length > 0 ? this.Inicio(this.bsqDevol, 'Devolucion') : '';
    //this.Inicio('','');  
  }

  step = 5;
  setStep(index: number) {
    this.step = index;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.estructuraList.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.estructuraList.data.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  showOptions(event: MatCheckboxChange, arr: any): void {
    this.layout = this.selection.selected.length > 1 ? '1' : '0';
  }

  filter(filterValue: string) {
    this.estructuraList.filter = filterValue.trim().toLowerCase();
  }

  applyFilter(filterValue: string) {
    this.estructuraList.filter = filterValue.trim().toLowerCase();
  }

  exportar() {
    this.selection.selected.length === 0 ? this.generaExcel(this.antList.data, '') : this.generaExcel(this.selection.selected, '');
  }

  generaExcelTodo() {
    this.encabezado=true;
    let tbl1, tbl2, tbl3, tbl4, tbl5, tbl6, tbl7, tbl8;
    let rep: any = [];
    let config = { raw: true, type: 'string' }; 
    setTimeout(()=> { 
      tbl8 = document.getElementById("EncabezadoTabla")
      let worksheet8 = XLSX.utils.table_to_sheet(tbl8);
      let t8 = XLSX.utils.sheet_to_json(worksheet8, { header: 1 })
      rep = rep.concat([['']]).concat(t8);  

      if (this.bsqAnticipo != ''  && this.antList.data.length > 0 ) {
        tbl1 = document.getElementById("AnticipoTabla")
        let worksheet = XLSX.utils.table_to_sheet(tbl1, config);
        let b = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        rep = rep.concat([[''], ['ANTICIPO']]).concat(b)
      }
      if (this.bsqPagAnt != '' && this.antPagList.data.length > 0 ) {
        tbl2 = document.getElementById("AnticipoPagTabla");
        let worksheet = XLSX.utils.table_to_sheet(tbl2, config);
        let b = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        rep = rep.concat([[''], ['PAGO DE ANTICIPO']]).concat(b)
      }
      if (this.bsqCompGas != '' && this.comGasList.data.length > 0 ) {
        tbl3 = document.getElementById("GastoTabla")
        let worksheet = XLSX.utils.table_to_sheet(tbl3, config);
        let b = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        rep = rep.concat([[''], ['COMPROBACIÓN DE GASTOS']]).concat(b)
      }
      if (this.bsqReembolso != '' && this.reemList.data.length > 0 ) {
        tbl4 = document.getElementById("ReemTabla")
        let worksheet = XLSX.utils.table_to_sheet(tbl4, config);
        let b = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        rep = rep.concat([[''], ['REEMBOLSOS']]).concat(b)
      }
      if (this.bsPagReem != '' && this.reemPagList.data.length > 0 ) {
        tbl5 = document.getElementById("ReemPagTabla")
        let worksheet = XLSX.utils.table_to_sheet(tbl5, config);
        let b = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        rep = rep.concat([[''], ['PAGO DE REEMBOLSOS']]).concat(b)
      }
      if (this.bsqDevol != ''  && this.devolList.data.length > 0 ) {
        tbl6 = document.getElementById("DevolTabla")
        let worksheet = XLSX.utils.table_to_sheet(tbl6);
        let b = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        rep = rep.concat([[''], ['DEVOLUCIONES']]).concat(b)
      }
      
      tbl7 = document.getElementById("TotalTabla")
      let worksheet = XLSX.utils.table_to_sheet(tbl7);
      let t = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      rep = rep.concat([['']]).concat(t);

      let worksheetX = XLSX.utils.json_to_sheet(rep, { skipHeader: true });
      const new_workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(new_workbook, worksheetX, "Reporte_Operación")
      XLSX.writeFile(new_workbook, 'Reporte_Op_' +moment(new Date(Date.now())).format("DDMMYYYY")+'-'+ moment(new Date(Date.now())).format("HHmm")+'-'+this.arrBusquEmp+'.xls');
      
      this.encabezado=false;
    }, 100);  
  }

  generaExcel(arr: any, tipo: any) {
    let ArrExporta = [];
    tipo == 'Anticipo' ? ArrExporta = this.antList.data : [];
    tipo == 'Pago Anticipo' ? ArrExporta = this.antPagList.data : [];
    tipo == 'ComprobacionGastos' ? ArrExporta = this.comGasList.data : [];
    tipo == 'Reembolso' ? ArrExporta = this.reemList.data : [];
    tipo == 'Pago Reembolso' ? ArrExporta = this.reemPagList.data : [];
    tipo == 'Devolucion' ? ArrExporta = this.devolList.data : [];
    let exportar: any = [];
    ArrExporta.map((ex: any) => {
      exportar.push({
        FechaOperacion: moment(new Date(ex.fechaOperacion)).format("MM/DD/YYYY"),
        TipoTransaccion: ex.tipoTransaccion,
        Estatus: ex.estatus,
        IdTransaccion: ex.idTransaccion,
        Monto: ex.monto,
        Area: ex.area,
        CentrosCostos: ex.descripcionCentrosCostos,
        IdCuentaContable: ex.idCuentaContable,
        CuentaContable: ex.descripcionCuentaContable,
      });
    });
    console.log(tipo);
    this.excelExporta.exportAsExcelFileOp(exportar, tipo, 'RepOp_'+moment(new Date(Date.now())).format("DDMMYYYY")+'-'+ moment(new Date(Date.now())).format("HHmm")+'-'+this.arrBusquEmp+'-'+tipo);
  }

  cargaEstructura() {
    this.empresaName = this.Empresas.filter((e: any) => e.id == this.arrBusquEmp)[0].descripcion;
    this.estructuraPlana = [];
    this.estructura = [];
    this.servicios.getUnParametro('catalogos', '?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1=' + encodeURIComponent(`idEmpresas=${this.arrBusquEmp}`))
      .subscribe(
        (estructura: any) => {
          this.estructuraPlana = JSON.parse(JSON.stringify(estructura));
          console.log('this.estructuraPlana -',this.estructuraPlana)
          let parents = this.estructuraPlana.filter((x: any) => x.idEstructuraPadre === 0);
          let children = this.estructuraPlana.filter((x: any) => x.idEstructuraPadre !== 0);
          let z: any = 0;
          for (z of children) {
            let index = parents.findIndex((obj: any) => obj.idEstructura === z.idEstructuraPadre);
            parents.splice(index + 1, 0, z);
          }
          this.estructuraList = new MatTableDataSource(parents);
          this.estructuraPlanaOrig = parents;
          this.estructuraPlana = parents;
          //this.estructura = this.armaJerarquia(estructura, { id: 'idEstructura', parentId: 'idEstructuraPadre', extras: true });
          //console.log('this.estructura', this.estructura);
        },
        (response: any) => {
          console.log("POST call in error", response);
          return response;
        },
        () => { });
  }

  doFilter(ArrOrig:any) {
    this.estructuraPlana=  this.filtroAut(ArrOrig) 
  }
  filtroAut(values:any) {
    return values.filter((j:any) => j.descripcionEstructura.toLowerCase().includes(this.FiltroOperacion.estructura))
  }

  onCheck(item: any) {
  }

  onCheckedKeys(item: any) {
  }
  onNodesChanged(item: any) {
  }

  armaJerarquia(jsonData: any, options: any) {
    return jsonData.filter((elt: any, idx: any, arr: any) => {
      const parent = arr.find((e: any) => e[options.id] === elt[options.parentId]);
      if (!parent) return true;
      if (options.extras) parent.hasChildren = true;
      (parent.children = parent.children || []).push(elt);
      if (options.extras) parent.leaves = (parent.children || []).length;
      elt.checked = false;
    });
  }

  onexpand(item: any) {
    console.log(item);
    if (item.expanded) {
      if (item.nivelEstructura > 1) {
        console.log('qq', item);
        item.expanded = true;
      }
      //item.expanded = !item.expanded;
      return;
    } else {
      if (item.children) {
        if (item.children.length > 0) {
          item.expanded = true;
        } else {
          item.expanded = false;
        }
        if (item.nivelEstructura > 1) {
          console.log('nivelEstructura', item);
          item.expanded = true;
        }
      }
    }
  }

  check() {
    this.checked = !this.checked;
    this.checkRecursive(this.checked);
  }

  checkRecursive(state: boolean) {
    this.estructura.forEach((d: any) => {
      d.checked = state;
      // d.checkRecursive(state);
    });
  }

  open(item: any) {
    item.isOpen = !item.isOpen;
    if (!item.children) {
      item.loading = "...."
      this.estructura(item.id).subscribe((res: any) => {
        item.loading = null
        item.children = res;
      })
    }
  }

  

  public getDatos(idempresa: any, idCC: any, usuario: any): Observable<any> {
    let monedas = this.http.get<any>(`${APIAdmin}catalogo/?catalogo=monedas`, { headers: headers });
    let centrosCostos = this.http.get<any>(API + 'catalogos/?catalogo=vwCentrosCostos&filtro1=' + encodeURIComponent('idEmpresas=' + idempresa), { headers: headers });
    let empresas = this.http.get<any>(APIAdmin + 'catalogo/?catalogo=empresas&filtro1=' + encodeURIComponent('id=' + idempresa), { headers: headers });
    let proyectos = this.http.get<any>(API + 'catalogos/?catalogo=vwProyectos&filtro1=' + encodeURIComponent('nivelEstructura=' + idCC + ' and idEmpresas=' + idempresa), { headers: headers });
    let formasPagos = this.http.get<any>(`${APIAdmin}catalogo/?catalogo=formasPago`, { headers: headers });
    let centrosCostosUsr = this.http.get<any>(API + 'catalogos/?catalogo=vwCentrosCostos&filtro1=' + encodeURIComponent('idEstructura=' + idCC + ' and idEmpresas=' + idempresa), { headers: headers });
    return forkJoin([monedas, centrosCostos, empresas, proyectos, formasPagos, centrosCostosUsr]);
  }

  public getUsuario(id: any, idempresa: any): Observable<any> {
    let usuario = this.http.get<any>(API + 'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1=' + encodeURIComponent('idOcupantePuesto=' + id + ' and idEmpresas=' + idempresa), { headers: headers });
    return forkJoin([usuario]);
  }

}