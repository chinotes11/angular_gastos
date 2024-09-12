/** Modulo Angular que muestra un listado con devoluciones 
 * @module 1. Edita Reportes
 * reportegasto-edita.component.ts  
 */

import { Component, Inject, OnInit, Optional, Provider, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, NgForm, FormGroupDirective } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WorkFlowService } from '../../../Genericos/servicios.service'
import { ErrorStateMatcher, MatOption, MAT_DATE_FORMATS, MAT_DATE_LOCALE, DateAdapter} from '@angular/material/core';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import { DialogService } from '../../acciones/dialog.service';
import { DatePipe } from '@angular/common';
import * as _moment from 'moment';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { serviciosService } from "../../../Genericos/servicios/servicios.service";
import { forkJoin, Observable, Subscription, throwError } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MensajesService } from "../../../Genericos/mensajes/mensajes.service";
import { animate, state, style, transition, trigger } from '@angular/animations';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { TokenService } from '../../../auth/token/token.service';
import { MY_FORMATS } from '../../../Genericos/utilidades/funciones';
const API = environment.ApiUrl;
const APIAdmin = environment.ApiUrlAdmin;
const headers = new HttpHeaders
headers.append('Content-type', 'applicartion.json');
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
const options2 = { style: 'currency', currency: 'MXN' };
const numberFormat2 = new Intl.NumberFormat('es-MX', options2);

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
/**
  * componente Principal para listar y editar los reportes 
  */
@Component({
  //selector: 'app-edit-gastos',
  templateUrl: './reportegasto-edita.component.html',
  styleUrls: ['./reportegasto-edita.component.scss'],
  providers: [{provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},{provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
/** El nombre del modulo EditaReporteGastoComponent */

export class EditaReporteGastoComponent implements OnInit {
  id: any;
  ubica:any;
  reporte: any;
  dataReporte: any;
  //repgastos: ReporteGastoDetalle;
  concepDetalle: any;
  causaLista: any;
  workInicial: any;
  workFGral: any;
  workOrigen!: string;
  idWorkflow: any;
  bloqueoWf: string = '0';
  blockInput: boolean = false;
  bloqTieneAnt: boolean = false;
  bloqAnt:boolean = false;
  bloqMismoUsr:boolean=false;
  bloqColab:any = 1;
  FechaI: any;
  FechaF: any;

  unionFecha: any = ''
  subTotal = 0;
  vat = 0;
  grandTotal = 0;
  Historial: any;
  arrUslogin: any;
  arrsesion: any;
  UsSuperior:any=[];
  TipoSol: any;
  MonedaL: any;
  CentroCosto: any;
  TipoComprobante: any;
  Proyectos: any;
  Empresas: any;
  Tipogasto: any;
  formasPagos: any;
  EmpTipoGsto:any;
  TipoGstGral:any;
  cuenta: any;
  FechaReg: any;
  provLista: Provider[] = [];
  iniLista: any = 0;
  LstGstos: any;
  step:any;
  fechaHoy: Date=new Date(Date.now());
  tipoCambio:any=21;
  limiteMonto:any=3;
  tolerancia: any;
  FechaTolerancia: boolean = false;
  toleraDias:any;

  isTableExpanded: boolean = false;
  bloqueo: boolean = false;
  btnGda: string = '0';
  idRol: any;
  datSess: any;
  GastosList: MatTableDataSource<any>;
  totalesTabla: MatTableDataSource<any>;
  histColumns: string[] = ['fechaRegistro', 'idUser', 'evento', 'estatus', 'comentarios'];
  displayedColumns: string[] = ['vista', 'id', 'tipodegasto', 'fechaGasto', 'fechaEmision', 'TipoComprobante', 'formaPago', 'CuentaPago', 'subtotal', 'total', 'montoAprobado', 'valido', 'estatus', 'Acciones'];
  detalleColumns: string[] = ['descripcion', 'cantidad', 'unidadMedida', 'montoIeps', 'montoIva', 'precioUnitario', 'descuento', 'importe', 'montoAprobado', 'Acciones'];
  totalColumns: string[] = ['Tipogastos', 'Montototal'];
   @ViewChild('sort', { read: MatSort })   sort: MatSort = new MatSort;
   @ViewChild('sorth', { read: MatSort })  sorth: MatSort = new MatSort;
   @ViewChild('sort1', { read: MatSort })  sort1: MatSort = new MatSort;
   @ViewChild('paginator', {read: MatPaginator}) paginator: MatPaginator | undefined;
   @ViewChild('paginatorh', {read: MatPaginator}) paginatorh: MatPaginator | undefined;
   @ViewChild('paginator1', {read: MatPaginator}) paginator1: MatPaginator | undefined;
  /**
   * Consulta catálogos y servicios.
   */
  constructor(activatedRouter: ActivatedRoute,
    private servicios: serviciosService,
    public datePipes: DatePipe,
    public workService: WorkFlowService,
    private router: Router,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private mensajes: MensajesService,
    private http: HttpClient,
    private token: TokenService) {
    this.datSess = token.readToken('id', '')
    this.datSess = this.datSess.split(',');
    this.id = activatedRouter.snapshot.paramMap.get('id');
    this.ubica = activatedRouter.snapshot.paramMap.get('ubica');    
    this.step = Number(this.ubica)==0?0:1;
    this.idRol = token.readToken('rlsRol', 'GASTOS');
    this.reporte = { estatus: null };
    //this.cuenta = JSON.parse(window.sessionStorage.getItem("cuenta")!);
    this.totalesTabla = new MatTableDataSource();
    this.GastosList = new MatTableDataSource();

    this.getUsuario(this.datSess[0], this.datSess[1]).subscribe(rsUsLog => {
      this.arrUslogin = rsUsLog[0];
      this.tolerancia = rsUsLog[2];
      this.validaTolerancias(this.tolerancia[0])
      this.arrUslogin.map((t1: any) => { t1.NombreCompleto = `${t1.nombre} ${t1.apellidoPaterno} ${t1.apellidoMaterno}`; t1.idUser = t1.idOcupantePuesto; t1.idEmpresa = Number(this.datSess[1]); t1.idRoles = this.idRol; });
      this.servicios.getUnParametro('reportes', this.id)
        .pipe(catchError(err => { return throwError(err); })
        ).subscribe((repDato: any) => {
          this.dataReporte = repDato;
          this.getUsuario(repDato.idUser, this.datSess[1]).subscribe(rsUs => {
            this.arrsesion = rsUs[0];
            this.UsSuperior=rsUs[1][0];
            this.arrsesion.map((t1: any) => { t1.NombreCompleto = `${t1.nombre} ${t1.apellidoPaterno} ${t1.apellidoMaterno}`; t1.idUser = t1.idOcupantePuesto; t1.idEmpresa = Number(this.datSess[1]); t1.idRoles = this.idRol; });
            this.getDatos(this.datSess[1], this.arrsesion[0].idEstructura, repDato.idUser, this.arrsesion[0].nivelEstructura).subscribe(resp => {
              this.MonedaL = resp[0];
              this.TipoSol = resp[1];
              this.CentroCosto = resp[2];
              this.Empresas = resp[3];
              this.Proyectos = resp[4];
              this.Tipogasto = resp[5];
              this.formasPagos = resp[6];
              this.cuenta = resp[7];
              this.EmpTipoGsto=resp[8];
              this.TipoComprobante = tipocomprobantes;
              this.servicios.getUnParametro('catalogos', '?catalogo=workflows&filtro1=' + encodeURIComponent('idEmpresa=' + this.datSess[1]))
                .pipe().subscribe((res: any) => {
                  this.workInicial = res;
                  this.workInicial.map((t1: any) => { t1.evento = JSON.parse(t1.evento) });
                  this.workFGral = this.workInicial;
                  console.log('zzzzzzzzzzzzzzzz ',this.workInicial)
                  this.Inicio(repDato);
                });
            });
          });
        });
    });
    /* 
    this.FechaReg= this.datePipes.transform(new Date(this.reporte.createdAt), 'yyyy-MM-dd'); 
    */
    this.concepDetalle = {
      antid: 0,
      antMontocomprobado: 0,
      antMontoAutorizado: 0,

      totGaid: 0,
      totGaMontocomprobado: 0,
      totGaMontoAutorizado: 0,

      reemid: 0,
      reemMontocomprobado: 0,
      reemMontoAutorizado: 0,

      devoid: 0,
      devoMontocomprobado: 0,
      devoMontoAutorizado: 0,
      idMoneda: 'MXN'
    }
  }
  /**
    * @function
    * @name Inicio 
    * Metodo principal que inicia el consumo del servicio
    * @param {string} reportes 
    * @returns {Array.<string>} Regresa el servicio reportes consultado correspondiente al idUser
    */
  Inicio(res: any) {
    

    this.concepDetalle.antMontocomprobado = res.monto;
    this.concepDetalle.antMontoAutorizado = res.monto;
    this.servicios.getUnParametro('gastos', `?idReporte=${res.id}?idUsuario=${this.arrsesion[0].idUser}`)
      .pipe(catchError(err => { return throwError(err); })
      ).subscribe((gst: any) => {      
        this.Historia();
        this.reporte = [res].map((t1: any) => ({ ...t1, ...this.arrsesion.find((t2: { idUser: any; }) => t2.idUser === t1.idUser) }));
        this.reporte.map((t1: any) => {
          t1.descripcion = !t1.idUsoFondos ? '' : this.TipoSol.filter((tipo: any) => tipo.id == t1.idUsoFondos)[0].descripcion;
          t1.diasDura=moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days')<0?0:
                         t1.idUsoFondos==1?moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days') + 1:moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days');
          //t1.diasDura = moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days') < 0 ? 0 : moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days');

          //t1.NombreCompleto= `${t1.nombre} ${t1.apellidoPaterno} ${t1.apellidoMaterno}`;
          t1.fechaReg = moment(new Date(t1.createdAt)).add(2, 'days').format("MM/DD/YYYY");
          t1.fechaIni = moment(new Date(t1.fechaIni)).add(1, 'days').format("YYYY-MM-DD");
          t1.fechaFin = moment(new Date(t1.fechaFin)).add(1, 'days').format("YYYY-MM-DD");
          t1.idAnticipoFondos==0 || t1.idAnticipoFondos == null?this.bloqTieneAnt=false:this.bloqTieneAnt=true;
          //bloqTieneAnt
        });
        this.reporte = this.reporte[0];
        this.FechaI = moment(new Date(this.reporte.fechaIni)).add(1, 'days').format("YYYY-MM-DD"); 
        this.FechaF = moment(new Date(this.reporte.fechaFin)).add(1, 'days').format("YYYY-MM-DD"); 
        
        console.log('this.reporte', this.reporte);
        this.workOrigen = this.reporte.estatus;
        this.asignaTipoGasto();

        if (this.reporte.estatus !== "Aprobado" && this.reporte.estatus !== 'Pagado') {
          this.idWorkflow = this.workInicial.filter((dato: any) => dato.nombreObjeto == "Reporte de Gastos" && dato.evento.some((o2: any) => o2.siguienteEstatus === res.estatus));
          this.idWorkflow = this.idWorkflow[0].id;
          this.workInicial = this.workInicial.filter((dato: any) => dato.estatusActual == this.reporte.estatus && dato.nombreObjeto == "Reporte de Gastos")
          console.log('||||||||||||||||||||--------------',this.workInicial)
          this.workInicial = this.workInicial ? this.workInicial[0].evento? this.workInicial[0].evento:[]:[];
          this.valida(this.reporte);
          //
        } else {
          this.workInicial = [];
          this.bloqueoWf = '0';
          this.valida(this.reporte);
        }        
       

        if (gst.length > 0) {
          let provider: Provider[] = [];
          this.provLista = provider;
          gst.map((gtr: any) => { this.provLista.push(gtr.id) });
          this.tablaGastos(this.provLista);
        }
      }, () => { console.log('Termino'); }
      );

  }
  
  /**
   * @function
   * @name Historia 
   * Metodo  que consulta el servicio, para obtener el hisorial
   * @param {string} devoluciones 
   * @returns Regresa el arreglo Historial para devoluciones consultando el servicio correspondiente
   */
  Historia() {
    this.servicios.getUnParametro('reportes', `${this.id}/historial`)
      .pipe(catchError(err => { return throwError(err); })
      ).subscribe((hist: any) => {
        hist.map((h:any)=>{ h.fechaRegistro=moment(h.fechaRegistro).format('YYYY-MM-DD HH:mm:ss') })
        hist.length > 0 ? this.Historial = new MatTableDataSource(hist) : this.Historial = new MatTableDataSource();
        this.Historial.paginator = this.paginatorh;
        this.Historial.sort = this.sorth;
      }, () => { }
      );
  }

  asignaTipoGasto(){
    switch (this.reporte.idUsoFondos) {
      case 1:
        this.TipoGstGral=this.EmpTipoGsto.filter((t1:any)=>t1.tipo==="V" || t1.tipo==="A" || t1.tipo==="C");   //C no        
        break;
      case 2:
        this.TipoGstGral=this.EmpTipoGsto.filter((t1:any)=>t1.tipo==="C" || t1.tipo==="A" || t1.tipo==="V")  //V no         
        break;
      default:
        this.TipoGstGral=this.EmpTipoGsto;
      break;
    } 
  }

  politica(arr:any, id:any){
    let valor=0, suma=0;
    let diasIncompleto=this.reporte.diasDura -1;
    console.log(" DIAS-|- ",this.reporte.diasDura," -Incompleto- ",diasIncompleto," - | -",id);
    let politica=this.EmpTipoGsto.filter((val:any) => { return val.idTipoGastos == id; });  
    if(politica.length ===0){
      return 0;
    }      

    if(politica[0].diaCompleto ===1){
      if(politica[0].montoDia!=null){
        valor=politica[0].montoDia;
      }
      if(politica[0].montoEvento!=null){
        valor=politica[0].montoEvento;
      }
      if(politica[0].montoMes!=null){
        valor=politica[0].montoMes/Number(moment(new Date(Date.now()), "YYYY-MM").daysInMonth());
        valor=valor;
      }
      if(politica[0].montoSemana!=null){              
        valor=politica[0].montoSemana/7;
        valor=valor;
      }
    } else {
      if(politica[0].montoDia!=null){
        valor=politica[0].montoDia;
      }
      if(politica[0].montoEvento!=null){
        valor=politica[0].montoEvento;
      }
      if(politica[0].montoMes!=null){
        valor=politica[0].montoMes/Number(moment(new Date(Date.now()), "YYYY-MM").daysInMonth());
        valor=valor;
      }
      if(politica[0].montoSemana!=null){              
        valor=politica[0].montoSemana/7;
        valor=valor;
      }
    }
    politica[0].monto=valor;
    suma=suma+valor;  
    console.log(suma,"   - POLITICA ###  -  ", politica)
    return suma;
  }

  // politica(arr:any, id:any){
  //   let valor=0, suma=0;
  //   let diasIncompleto=this.reporte.diasDura -1;
  //   console.log(" DIAS-|- ",this.reporte.diasDura," -Incompleto- ",diasIncompleto," - | -",id);
  //   let politica=this.EmpTipoGsto.filter((val:any) => { return val.idTipoGastos == id; });  
  //   if(politica.length ===0){
  //     return 0;
  //   }      

  //   //console.log("politica - " , politica);
  //   if(politica[0].diaCompleto ===1){
  //     if(politica[0].montoDia!=null){
  //       valor=this.reporte.diasDura*politica[0].montoDia;
  //     }
  //     if(politica[0].montoEvento!=null){
  //       valor=politica[0].montoEvento;
  //     }
  //     if(politica[0].montoMes!=null){
  //       valor=politica[0].montoMes/Number(moment(new Date(Date.now()), "YYYY-MM").daysInMonth());
  //       valor=this.reporte.diasDura*valor;
  //     }
  //     if(politica[0].montoSemana!=null){              
  //       valor=politica[0].montoSemana/7;
  //       valor=this.reporte.diasDura*valor;
  //     }
  //   } else {
  //     if(politica[0].montoDia!=null){
  //       valor=diasIncompleto*politica[0].montoDia;
  //     }
  //     if(politica[0].montoEvento!=null){
  //       valor=politica[0].montoEvento;
  //     }
  //     if(politica[0].montoMes!=null){
  //       valor=politica[0].montoMes/Number(moment(new Date(Date.now()), "YYYY-MM").daysInMonth());
  //       valor=diasIncompleto*valor;
  //     }
  //     if(politica[0].montoSemana!=null){              
  //       valor=politica[0].montoSemana/7;
  //       valor=diasIncompleto*valor;
  //     }
  //   }
  //   politica[0].monto=valor;
  //   suma=suma+valor;  
  //   console.log(suma,"   - POLITICA ###  -  ", politica)
  //   return suma;
  // }

  validaTolerancias(tolera:any){
    if(tolera.id){
      if(!tolera.diasInicio && !tolera.diasFin){
        this.FechaTolerancia = true ;
      } else{
        if(tolera.diasInicio){        
          this.FechaTolerancia = moment(Date.now()).isBetween(moment().startOf('month'), moment().startOf('month').add(tolera.diasInicio,'d'));
        } else{
          this.FechaTolerancia = moment(Date.now()).isBetween(moment().endOf('month').subtract(tolera.diasFin,'d'), moment().endOf('month'));
        }  
      }
    } else{
      this.FechaTolerancia = true ;
    }
  }

  toleranciaVal(){
    let msj = this.tolerancia[0].diasInicio? `los primeros ${this.tolerancia[0].diasInicio} dias del siguiente mes para editar un reporte de gastos.`:`los ultimos ${this.tolerancia[0].diasFin} dias del siguiente mes para editar un eporte de gastos.`
    this.mensajes.mensaje(`Debe esperar hasta ${msj}`,'','zazz');    
  }

  ngOnInit(): void {
  }
  
  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }
  /**
   * @function
   * @name CalcDias 
   * Metodo  que switchea el origen para calcular dias con fecha inicio o fecha fin 
   * @param {string} origen 
   * @returns Regresa un true o false
   */
  CalcDias(event: any, arr: any, origen: number) {
    let resulta;
    console.log(this.reporte);
    switch (origen) {
      case 1:
        //this.reporte.fechaIni = new Date(event.value);
        this.reporte.fechaIni = moment(new Date(event.value)).format("yyyy-MM-DD");
        this.FechaI = new Date(event.value);  
        break;
      case 2:
        //this.reporte.fechaFin = new Date(event.value);
        this.reporte.fechaFin = moment(new Date(event.value)).format("yyyy-MM-DD");
        this.FechaF = new Date(event.value); 
        break;
    } // */
    
    if (moment(this.FechaF).format("YYYY-MM-DD") >= moment(this.FechaI).format("YYYY-MM-DD")) { } 
    else { 
      this.reporte.diasDura =0
      this.mensajes.mensaje('La fecha final no debe ser mayor a la fecha inicial.', '', 'zazz'); 
      return false; 
    };
    resulta = (moment(this.FechaF, 'YYYY-MM-DD').diff(moment(this.FechaI, 'YYYY-MM-DD'), 'days')) + 1;
    this.reporte.diasDura = resulta ;

    // this.reporte.diasDura = resulta < 0 ? 0 : resulta;
    // this.reporte.diasDura = isNaN(this.reporte.diasDura) ? 0 : this.reporte.diasDura;
    // this.reporte.diasDura = this.reporte.diasDura>0 && this.reporte.idUsoFondos === 1? this.reporte.diasDura + 1:this.reporte.diasDura;    
    
    this.GastosList.data.map((t1: any, i: any) => {        
      if(Number(t1.total)+20 <= this.politica(t1,t1.idTipoGasto)){
        t1.valido=1;                    
      } else {
        t1.blockPolitica=true;
      }
      //console.log('*****GASTOS - ', t1);
    });
    //*/
    this.valida(this.reporte);
  }
  /**
   * @function
   * @name guardarReporteGasto  
   * Metodo que guarda los inputs en el arreglo guardar, para subirlos a la base
   * @returns {Array.<string>} guardar Regresa un Array con valores
   */
  guardarReporteGasto() {
    let mensajeD = this.reporte.idAnticipoFondos === 0 ? '  ¿ Esta seguro de guardar el reporte de gastos sin asociar ningún Anticipo ?' : '  ¿ Esta seguro de guardar el reporte de gastos ?';
    this.dialogService.openConfirmDialog(mensajeD)
      .afterClosed().subscribe(res => {
        if (res) {
          console.log(this.reporte.fechaIni);  
          console.log(this.reporte.fechaFin);
          console.log(this.FechaI);  
          console.log(this.FechaF); 

          let guardar = {            
            id: this.reporte.id,
            idEmpresa: Number(this.reporte.idEmpresa),
            idProyecto: this.reporte.idProyecto,
            idUser: Number(this.reporte.idUser),
            idAnticipoFondos: this.reporte.idAnticipoFondos,
            idCentrosCostos: this.reporte.idCentrosCostos,
            idUsoFondos: this.reporte.idUsoFondos,
            //fechaIni:moment(new Date(this.reporte.fechaIni)).add(1, 'days').format("YYYY-MM-DD"),
            //fechaFin: moment(new Date(this.reporte.fechaFin)).add(1, 'days').format("YYYY-MM-DD"),
            fechaIni:this.reporte.fechaIni,
            fechaFin:this.reporte.fechaFin,
            //fechaIni:moment(new Date(this.FechaI)).format("yyyy-MM-DD"),
            //fechaFin:moment(new Date(this.FechaF)).format("yyyy-MM-DD"),
            notas: String(this.reporte.notas),
            montoAprobado: this.reporte.montoAprobado,
            monto: this.reporte.monto,
            estatus: this.reporte.estatus,
          }

          console.log(guardar);
          this.servicios.putDatos(`reportes/${this.reporte.id}`, guardar)
            .pipe(catchError(err => { return throwError(err); })
            ).subscribe(
              (res: any) => {
                this.mensajes.mensaje('Se guardo con exito la información.','','success');
                //this.router.navigate([`reportesgastos/reportegasto`]);
              },
              (err: any) => { this.mensajes.mensaje('Hubo un error al guardar la información intente de nuevo.','','danger');});//*/
        }
      });
  }
  /**
   * @function
   * @name cerrarDialog  
   * Metodo que reedirecciona a paginas switcheadas dependiendo de su origen
   * @returns {boolean} Regresa un true o un false
   */

  cerrarReporteGasto() {
    this.dialogService.openConfirmDialog(' ¿ Esta seguro desea salir del reporte de gasto ? ')
      .afterClosed().subscribe(res => {
        if (res) {
          switch (window.sessionStorage.getItem("_origen")) {
            case 'edoCta':
              window.sessionStorage.setItem("_origen", '');
              this.router.navigate(['/estadocuenta']);
              break;
            default:
              window.sessionStorage.setItem("_origen", '');
              this.router.navigate(['/reportesgastos/reportegasto']);
              break;
          }

        } else {

        }
      });
  }
  /**
 * @function
  * @name cambiaTipoSol
  * Metodo que habilita por cambio de Tipo de Solicitud 
  * @returns {Boolean} Regresa un true o false 
  */
   cambiaTipoSol(evento:any, arr:any){
    //this.anticipo.TipoSolicitud=(evento.source.selected as MatOption).viewValue; 
    this.reporte.idUsoFondos=evento.value; 
    this.asignaTipoGasto();   
    //this.valida(this.reporte);
  }
  /**
 * @function
  * @name cambiaMoneda
  * Metodo que habilita por cambio de moneda 
  * @returns  {Boolean} Regresa un true o false 
  */
   cambiaMoneda(evento:any, arr:any){
    //this.reporte.Moneda=(evento.source.selected as MatOption).viewValue; 
    this.reporte.idMoneda=evento.value; 
    //this.valida(this.anticipo);   
  }

  numerico(valor: any) {
    return numberFormat2.format(valor)
 }

  devolucionIr(id: number) {
  }

  reembolsoIr(id: number) {
  }
  /**
   * @function
   * @name aprobarComprobante  
   * Metodo que aprueba un comprobante y lo guarda como aprobado en la base
   * @returns {boolean} Regresa un true o un false
   */

  aprobarComprobante(arr: any) {
    console.log(arr); 
    if(arr.idFormasPago==0 || arr.idFormasPago==null){this.mensajes.mensaje('Debe seleccionar una forma de pago.', '', 'danger'); return; }
    if(arr.idCuenta==0 || arr.idCuenta==null){if(arr.idFormasPago != 1){this.mensajes.mensaje('Debe seleccionar una cuenta de pago.', '', 'danger'); return; }  } 
    this.dialogService.openConfirmDialog(` ¿ Esta seguro desea aprobar el gasto ${arr.id} ? `)
      .afterClosed().subscribe(res => {
        if (res) {   
          if (arr.montoAprobado > 0 && arr.montoAprobado !=null ){
            let ev :any = { value:arr.montoAprobado}
            this.Cambio(ev,arr,'montoAprobado')
          } else {       
            if (arr.idTipoComprobante === 1) {
              this.servicios.putDatosV(`gastos/${arr.id}/autorizacomprobante`)
                .pipe(catchError(err => { console.log("ERROR"); return throwError(err); })
                ).subscribe((gst: any) => {
                  console.log(gst);
                  this.GastosList.data = this.GastosList.data.filter((val) => { 
                    if (val.id === arr.id) { 
                      val.automatico=1;
                      val.montoAprobado = arr.total.toFixed(2); 
                      val.estatus = 'Aprobado'; 
                      val.automatico = 1; 
                      //val.blockCaptura=(val.automatico==1 && val.montoAprobado>0)  || val.automatico==2?true:false;    
                      //val.blockPolitica=(val.automatico==1 && val.montoAprobado>0)  || val.automatico==2?true:false;
                    } 
                    return true; });
                  this.GastosList.data.map((val) => { val.detalle.data.map((det: any) => { if (det.idesGastos === arr.id) { det.montoAprobado = arr.importe; } return true; }); });
                  this.mensajes.mensaje('Gasto aprobado con exito.', '', 'success');
                  this.sumarTotales();
                },
                  (err: any) => { });
            } else {
              this.servicios.putDatosV(`gastosnofiscales/${arr.id}/autorizacomprobante`)
                .pipe(catchError(err => { console.log("ERROR"); return throwError(err); })
                ).subscribe((gst: any) => {
                  console.log(gst);
                  this.GastosList.data = this.GastosList.data.filter((val) => { 
                    if (val.id === arr.id) { 
                      val.automatico=1;
                      val.montoAprobado = arr.total.toFixed(2); 
                      val.estatus = 'Aprobado'; 
                      //val.blockCaptura=(val.automatico==1 && val.montoAprobado>0) || val.automatico==2?true:false;    
                      //val.blockPolitica=(val.automatico==1 && val.montoAprobado>0) || val.automatico==2?true:false;
                    } 
                    return true; });
                  this.GastosList.data.map((val) => { val.detalle.data.map((det: any) => { if (det.idesGastos === arr.id) { det.montoAprobado = arr.importe; } return true; }); });
                  this.mensajes.mensaje('Gasto aprobado con exito.', '', 'success');
                  this.sumarTotales();
                },
                  (err: any) => { });
            }
          }
        } else {
        }
      })
  }

  Cambio(evento: any, arr: any, campo: string) {
    let valor: any;
    console.log(evento);
    if (evento.value) {
      valor = evento.value;
    } else {
      valor = evento.target.value;
    }    
    console.log(' ***** ',campo,' - ',valor, '  - arr  -  ', arr);
    
    let guardar :any = {
      idEmpresa: arr.idEmpresa,
      idProyecto: arr.idProyecto,
      idCentrosCostos: arr.idCentrosCostos,
      idUser: arr.idUser,
      idTipoComprobante: arr.idTipoComprobante,
      idTipoGasto: campo == 'idTipoGasto' ? Number(valor) : arr.idTipoGasto,
      notas: arr.notas,     
      automatico: campo == 'montoAprobado' ? 0 : arr.automatico,
      estatus:campo == 'montoAprobado'?Number(valor)>0? 'Aprobado':'Nuevo':arr.estatus,
      idFormasPago:campo=='idFormasPago' ? Number(valor): arr.idFormasPago==null?0:arr.idFormasPago,
      idCuenta:campo=='idCuenta' ? Number(valor) : arr.idCuenta,      
    } 

    if(arr.fechaGasto){
      guardar.fechaGasto=moment(new Date(arr.fechaGasto)).add(1, 'days').format("YYYY-MM-DD"); 
    }

    if(campo =='idFormasPago' && Number(valor) === 8){guardar.idCuenta=0;}
    campo=='fchGsto' ? guardar.fechaGasto=this.datePipes.transform( new Date(valor), 'yyyy-MM-dd'):arr.fechaGasto;    
        
    if(arr.montoAprobado == null || arr.montoAprobado == ''){ 
      guardar.montoAprobado=0;
    }else{  
      if(campo== 'montoAprobado'){
        console.log(Number(valor) ,'  -  ', arr.total);
        if( Number(valor) <= arr.total + this.limiteMonto){
          guardar.montoAprobado = Number(valor);
        } else {
           this.GastosList.data.map((x:any) => {x.montoAprobado= x.id === arr.id? 0 : x.montoAprobado});
           this.mensajes.mensaje(`No puede ingresar un monto mayor a ${numberFormat2.format(Number(arr.total))}.`, '', 'danger'); return false;
        }        
      } else{
        guardar.montoAprobado = arr.montoAprobado;
      }  
    }
    if(arr.idMoneda!="MXN" && arr.idMoneda!=null){
        guardar.idMonedaTipoCambio=1;
        guardar.tipoCambio=Number(arr.tipoCambio)
    }
 
    console.log(" *** guardar",guardar);
    this.servicios.putDatos(`gastos/${arr.id}`, guardar)
      .pipe(catchError(err => { return throwError(err); })
      ).subscribe((gst: any) => {
        if (arr.idTipoComprobante == 1) {        
              this.GastosList.data = this.GastosList.data.filter((val) => {
                if (val.id === arr.id) {
                  val.montoAprobado = campo == 'montoAprobado' ? Number(valor) : arr.montoAprobado;
                  val.estatus=campo == 'montoAprobado'?Number(valor)>0? 'Aprobado':'Nuevo':arr.estatus,
                  val.idTipoGasto = campo == 'idTipoGasto' ? Number(valor) : arr.idTipoGasto;              
                  switch (campo) {
                    case 'fchGsto':
                      val.fechaGasto = valor;
                      break;
                    case 'idFormasPago':
                      val.idFormasPago = valor;
                      if(Number(valor) === 1){val.idCuenta=0; val.bloFormaPag=true; } else{val.bloFormaPag=false;}
                      break;
                    case 'idCuenta':
                      val.idCuenta = valor;
                      break;
                    case 'idTipoGasto':
                      console.log("this.politica(arr,valor) - ",this.politica(arr,valor));
                      if(Number(val.total)+20 <= this.politica(arr,valor)  ){
                        val.valido=1;    
                        val.blockPolitica=false;   
                        val.blockCaptura=val.estatus=="Aprobado" || val.estatus=="Rechazado"?true:false;   
                        val.bloFormaPag=val.estatus=="Aprobado" || val.estatus=="Rechazado"?true:false;              
                      } else {
                        val.valido=0; 
                        val.blockPolitica=true;
                      }
                      //console.log("Limite - ",this.politica(arr,valor));
                      break;                  
                  }
                }
                return true;
              });
              this.sumarTotales();
        } else {

          let guardarNoF = {
            folioComprobante: arr.folioComprobante != null ? arr.folioComprobante : '',
            fechaEmision: arr.fechaEmision != null ? this.datePipes.transform(new Date(arr.fechaEmision), 'yyyy-MM-dd') : this.datePipes.transform(new Date(Date.now()), 'yyyy-MM-dd'),
            razonSocialEmisor: arr.razonSocialEmisor != null ? arr.razonSocialEmisor : '',
            concepto: arr.concepto != null ? arr.concepto : '',
            importeTotal: arr.total != null ? Number(arr.total) : 0,
            idMoneda: arr.idMoneda != null ? arr.idMoneda : 'MXN',
            metodoPago: arr.formaPago != null ? campo == 'formaPago' ? valor : arr.formaPago : '',
            importeAprobado: arr.montoAprobado != null ? Number(campo == 'montoAprobado' ? Number(valor) : arr.montoAprobado) : 0
          }
          console.log(guardarNoF);

          this.servicios.putDatos(`gastosnofiscales/${arr.id}?idWorkflow=${this.idWorkflow}`, guardarNoF)
            .pipe( catchError(err => { return throwError(err); }) ).subscribe((nog: any) => {
                this.GastosList.data = this.GastosList.data.filter((val) => {
                  if (val.id === arr.id) {
                    val.montoAprobado = campo == 'montoAprobado' ? Number(valor) : arr.montoAprobado;
                    val.idTipoGasto = campo == 'idTipoGasto' ? valor : arr.idTipoGasto;
                    switch (campo) {
                      case 'fchGsto':
                        val.fechaGasto = valor;
                        break;
                      case 'idFormasPago':
                        val.idFormasPago = valor;
                        break;
                      case 'idCuenta':
                        val.idCuenta = valor;
                        break;
                        case 'idTipoGasto':
                          if(Number(val.total)+20 <= this.politica(arr,valor)  ){
                            val.valido=1;  
                            val.blockPolitica=false;                     
                          } else {
                            val.valido=0; 
                            val.blockPolitica=true;
                          }
                        break;  
                    }
                  }
                  return true;
                });
                this.sumarTotales();
              },
              (err: any) => {this.mensajes.mensaje('Hubo un error al guardar la información intente de nuevo.','','danger'); });//*/
        }
      },
      (err: any) => { this.mensajes.mensaje('Hubo un error al guardar la información intente de nuevo.','','danger');});//*/

  }
  /**
   * @function
   * @name editarComprobante  
   * Metodo que configura el tamalo del dialogo que edita el comprobante
   * @returns {Array.<string>} guardar Regresa un Array con valores
   */
  editarComprobante(arr: any) {
    arr.RGcatTiposGastos=this.TipoGstGral;
    arr.RGdiasDura=this.reporte.diasDura;
    arr.EstReport=this.reporte.estatus;
    arr.RepFchIni=this.FechaI;
    arr.RepFchFin=this.FechaF;
    arr.idUsrSesion=Number(this.datSess[0]);
    const dialogRefE = this.dialog.open(EditaGastoDialog, {
      width: '75%',
      height: '90%',
      data: arr,
    });
    dialogRefE.afterClosed().subscribe(result => {
      console.log(result.detalle)
      if (result.aprobRechz === 1) {
        let guardar:any = {
          idEmpresa: Number(result.detalle.idEmpresa),
          idProyecto: Number(result.detalle.idProyecto),
          idCentrosCostos: Number(result.detalle.idCentrosCostos),
          idUser: Number(result.detalle.idUser),
          idTipoComprobante: Number(result.detalle.idTipoComprobante),
          idTipoGasto: Number(result.detalle.idTipoGasto),
          notas: result.detalle.notas,
          //montoAprobado: Number(result.detalle.montoAprobado),
          estatus: result.detalle.estatus,
          idFormasPago: Number(result.detalle.idFormasPago),
          idCuenta:Number(result.detalle.idCuenta),
          automatico: result.detalle.automatico,
          //fechaGasto: this.datePipes.transform(new Date(result.detalle.fechaGasto), 'yyyy-MM-dd'),
        }

        if(Number(result.detalle.idFormasPago) === 1){result.detalle.idCuenta=0; result.detalle.bloFormaPag=true; } else{result.detalle.bloFormaPag=false;}

        if(result.detalle.fechaGasto == null || result.detalle.fechaGasto == ''){}else{
          guardar.fechaGasto= this.datePipes.transform( new Date(result.detalle.fechaGasto), 'yyyy-MM-dd') ;
        }
        
        if(result.detalle.montoAprobado == null ||  result.detalle.montoAprobado == ''){ guardar.montoAprobado=0;}else{
          guardar.montoAprobado= Number(result.detalle.montoAprobado);
        }
     
        console.log(guardar);
        
        this.servicios.putDatos(`gastos/${result.detalle.id}`, guardar)
          .pipe(catchError(err => { return throwError(err); })
          ).subscribe((gst: any) => {

              if (arr.idTipoComprobante == 1) {                
                    this.GastosList.data = this.GastosList.data.filter((val) => {
                      if (val.id === arr.id) {
                        val.montoAprobado = result.detalle.montoAprobado;
                        val.idTipoGasto = result.detalle.idTipoGasto;
                        val.fchComp = result.detalle.fchComp;
                        val.idFormasPago = result.detalle.idFormasPago;
                        val.idCuenta = result.detalle.idCuenta;
                        val.fechaGasto = result.detalle.fechaGasto;
                        val.estatus = 'Aprobado'; 
                        if(Number(result.detalle.idFormasPago) === 1){
                          val.idCuenta=0; val.bloFormaPag=true; 
                          val.blockCaptura=(val.automatico==1 && val.montoAprobado>0)  || val.automatico==2?true:false; 
                        } else{
                          val.bloFormaPag=false;
                          val.blockCaptura=(val.automatico==1 && val.montoAprobado>0)  || val.automatico==2?true:false; 
                        }                                                  
                      }
                      return true;
                    });
                    this.sumarTotales();                

              } else {
                let guardarNoF = {
                  folioComprobante: result.detalle.folioComprobante != null ? result.detalle.folioComprobante : '',
                  fechaEmision: result.detalle.fechaEmision != null ? this.datePipes.transform(new Date(result.detalle.fechaEmision), 'yyyy-MM-dd') : this.datePipes.transform(new Date(Date.now()), 'yyyy-MM-dd'),
                  razonSocialEmisor: result.detalle.razonSocialEmisor != null ? result.detalle.razonSocialEmisor : '',
                  concepto: result.detalle.concepto != null ? result.detalle.concepto : '',
                  importeTotal: result.detalle.total != null ? Number(result.detalle.total) : 0,
                  idMoneda: result.detalle.idMoneda != null ? result.detalle.idMoneda : 'MXN',
                  metodoPago: result.detalle.formaPago != null ? result.detalle.formaPago : '',
                  importeAprobado: result.detalle.montoAprobado != null ? Number(result.detalle.montoAprobado) : 0
                }
                this.servicios.putDatos(`gastosnofiscales/${result.detalle.id}?idWorkflow=${this.idWorkflow}`, guardarNoF)
                  .pipe(
                    catchError(err => { return throwError(err); })
                  ).subscribe(
                    (res: any) => {
                      console.log(res);
                      this.GastosList.data = this.GastosList.data.filter((val) => {
                        if (val.id === arr.id) {
                          val.montoAprobado = result.detalle.montoAprobado;
                          val.idTipoGasto = result.detalle.idTipoGasto;
                          val.fchComp = result.detalle.fchComp;
                          val.idFormasPago = result.detalle.formaPago;
                          val.ctaPago = result.detalle.ctaPago;
                          val.fechaGasto = result.detalle.fechaGasto;
                          val.estatus = 'Aprobado'; 
                          if(Number(result.detalle.idFormasPago) === 1){
                            val.idCuenta=0; val.bloFormaPag=true; 
                            val.blockCaptura=(val.automatico==1 && val.montoAprobado>0)  || val.automatico==2?true:false; 
                          } else{
                            val.bloFormaPag=false;
                            val.blockCaptura=(val.automatico==1 && val.montoAprobado>0)  || val.automatico==2?true:false; 
                          }
                            
                        }
                        return true;
                      });
                      this.sumarTotales();
                    },
                    (err: any) => { },
                    () => { console.log('Termino'); }
                  );//*/
              }

            },
            (err: any) => { },
            () => { console.log('Termino'); }
          );//*/

      } else {
      }
    });
  }
  /**
   * @function
   * @name cancelarComprobante  
   * Metodo que cancela el comprobante en la base
   * @returns {Array.<string>} Regresa un push a la base
   */
  cancelarComprobante(arr: any) {
    
    this.dialogService.openConfirmDialog(` ¿ Esta seguro desea rechazar el gasto ${arr.id} ? `)
      .afterClosed().subscribe(res => {
        if (res) {
          if (arr.idTipoComprobante === 1) {
            this.servicios.putDatosV(`gastos/${arr.id}/rechazacomprobante`)
              .pipe(catchError(err => { console.log("ERROR"); return throwError(err); })
              ).subscribe((gst: any) => {
                console.log(gst);
                this.GastosList.data = this.GastosList.data.filter((val) => { 
                  if (val.id === arr.id) { 
                    val.automatico=2;
                    val.montoAprobado = 0; val.estatus = 'Rechazado'; 
                    val.blockCaptura=val.automatico==1 || val.automatico==2?true:false;    
                    //val.blockPolitica=val.automatico==1 || val.automatico==2?true:false; 
                  } 
                  return true; });
                this.GastosList.data.map((val) => { val.detalle.data.map((det: any) => { if (det.idesGastos === arr.id) { det.montoAprobado = 0; } return true; }); });
                this.mensajes.mensaje('Gasto rechazado con exito.', '', 'success');
                this.sumarTotales();
              },
                (err: any) => { },
                () => { console.log('Termino'); });
          } else {
            this.servicios.putDatosV(`gastosnofiscales/${arr.id}/rechazacomprobante`)
              .pipe(catchError(err => { console.log("ERROR"); return throwError(err); })
              ).subscribe((gst: any) => {
                console.log(gst);
                this.GastosList.data = this.GastosList.data.filter((val) => { 
                  if (val.id === arr.id) { 
                    val.automatico=2;
                    val.montoAprobado = 0; val.estatus = 'Rechazado'; 
                    val.blockCaptura=val.automatico==1 || val.automatico==2?true:false;    
                    //val.blockPolitica=val.automatico==1 || val.automatico==2?true:false;  
                  } 
                  return true; });
                this.GastosList.data.map((val) => { val.detalle.data.map((det: any) => { if (det.idesGastos === arr.id) { det.montoAprobado = 0; } return true; }); });
                this.mensajes.mensaje('Gasto rechazado con exito.', '', 'success');
                this.sumarTotales();
              },
                (err: any) => { },
                () => { 
                  this.servicios.sendEmailNotification(
                    this.arrsesion[0].email,//'gerardo.mauriesr@gmail.com',
                    this.arrsesion[0].NombreCompleto,
                    'Rechazo de Gasto',
                    'Rechazo de Gasto',
                    'Se le informa que <b>'+this.UsSuperior.nombre + ' ' + this.UsSuperior.apellidoPaterno + ' ' + this.UsSuperior.apellidoMaterno+' </b>, rechazo el <b> Gasto '+arr.id+'</b> .',
                    '',
                    this.Empresas[0].id
                  ).subscribe(results => { 
                    this.mensajes.mensaje('Se ha enviado el rechazo del Gasto al correo '+this.arrsesion[0].email, '', 'success');
                  });   
                });
          }
        } else {

        }
      })
  }
  /**
   * @function
   * @name eliminarComprobante  
   * Metodo que elimina el comprobante en la base
   * @returns {Array.<string>} Regresa un push a la base
   */
  eliminarComprobante(arr: any) {
    this.dialogService.openConfirmDialog(` ¿ Esta seguro desea quitar el gasto ${arr.id} para este reporte ? `)
      .afterClosed().subscribe(res => {
        if (res) {
          console.log(arr);
          let envReporte = { idReportesGastos: 0 };
          let envEstatus={estatus:'Nuevo'}; 
          this.servicios.patchDatos(`gastos/${arr.id}/asociareporte`, envReporte)
            .pipe(catchError(err => { console.log("ERROR"); return throwError(err); }))
            .subscribe((irep: any) => {
              this.servicios.patchDatos(`gastos/${arr.id}`, envEstatus)
                .pipe(catchError(err => {console.log("ERROR"); return throwError(err);}))
                .subscribe((res:any) => {
                  this.GastosList.data = this.GastosList.data.filter((val) => { return val.id !== arr.id; });
                  this.provLista = this.provLista.filter((p) => { return p !== arr.id; });
                  console.log(this.GastosList.data);
                  this.sumarTotales();
                  this.mensajes.mensaje('Gasto removido del reporte con exito.', '', 'success');
                },
                (err:any) => { this.mensajes.mensaje('Hubo un error al guardar la infromación.', '', 'danger'); }); 
            }, (err: any) => {this.mensajes.mensaje('Hubo un error al guardar la infromación.', '', 'danger'); },
              () => { console.log('Termino'); }
            );
        }
      });
  }
  /**
   * @function
   * @name AnticipoDialog  
   * Metodo que configura el tamalo del dialogo que edita el anticipo
   * @returns {Array.<string>} guardar Regresa un Array con valores
   */
  AnticipoDialog(action: string, obj: any) {
    console.log(obj)
    obj.action = action;
    const dialogRefs = this.dialog.open(ListaAnticipoEditDialog, {
      width: '90%',
      height: '90%',
      data: obj,
    });
    dialogRefs.afterClosed().subscribe(result => {
      console.log("--------- ",result.anticipo[0])
      if (result.anticipo.length > 0) {
        let guardar = {
          idEmpresa: this.reporte.idEmpresa,
          idProyecto: this.reporte.idProyecto,
          idUser: this.reporte.idUser,
          idAnticipoFondos: result.anticipo[0].id,
          idCentrosCostos: this.reporte.idCentrosCostos,
          idUsoFondos: this.reporte.idUsoFondos,
          fechaIni: result.anticipo[0].fechaIni,
          fechaFin: result.anticipo[0].fechaFin,
          notas: String(this.reporte.notas),
          montoAprobado: result.anticipo[0].monto,
          monto: result.anticipo[0].montoP,
          estatus: this.reporte.estatus,
        }
        console.log(guardar);
        guardar.idAnticipoFondos==0 || guardar.idAnticipoFondos == null?this.bloqTieneAnt=false:this.bloqTieneAnt=true;
        this.servicios.putDatos(`reportes/${this.reporte.id}`, guardar)
          .pipe(catchError(err => { return throwError(err); })
          ).subscribe(
            (res: any) => {
              this.reporte.fechaIni = moment(new Date(result.anticipo[0].fechaIni)).add(1, 'days').format("YYYY-MM-DD");
              this.reporte.fechaFin = moment(new Date(result.anticipo[0].fechaFin)).add(1, 'days').format("YYYY-MM-DD");
              this.FechaI = moment(new Date(result.anticipo[0].fechaIni)).add(1, 'days').format("YYYY-MM-DD");
              this.FechaF = moment(new Date(result.anticipo[0].fechaFin)).add(1, 'days').format("YYYY-MM-DD");
              this.concepDetalle.antMontocomprobado = result.anticipo[0].montoP;
              this.concepDetalle.antMontoAutorizado = result.anticipo[0].montoP;
              this.reporte.monto = result.anticipo[0].montoP;
              this.reporte.notas = result.anticipo[0].motivo;
              this.reporte.diasDura = result.anticipo[0].diasDura;
              this.reporte.idAnticipoFondos=result.anticipo[0].id;
              this.sumarTotales();
            },
            (err: any) => { },
            () => { }
          );//*/
      }
    });
  }
  /**
   * @function
   * @name GastoDialog  
   * Metodo que configura el tamalo del dialogo que edita el anticipo
   * @returns {Array.<string>} guardar Regresa un Array con valores
   */
  GastoDialog(action: string, obj: any) {
    console.log(obj)
    obj.action = action;
    const dialogRefG = this.dialog.open(ListaGastoEditDialog, {
      width: '90%',
      height: '90%',
      data: obj,
    });
    dialogRefG.afterClosed().subscribe(result => {
      if (result.gastos) {
        console.log(result.gastos);
        let provider: Provider[] = [];
        provider = result.gastos
        console.log(result);
        let envReporte = { idReportesGastos: this.reporte.id };
        forkJoin(
          provider.map(n =>
            this.servicios.patchDatos(`gastos/${n}/asociareporte`, envReporte)
          )).subscribe((n: Provider[][]) => {
            console.log('n', n);
            this.servicios.getUnParametro('gastos', `?idReporte=${this.id}?idUsuario=${this.arrsesion[0].idUser}`)
            .pipe(catchError(err => { return throwError(err); })
            ).subscribe((gst: any) => {
                let provider: Provider[] = [];
                this.provLista = provider;
              if (gst.length > 0) {                
                gst.map((gtr: any) => { this.provLista.push(gtr.id) });
                this.iniLista = 0;
                this.tablaGastos(this.provLista);
              }else{
                this.tablaGastos(this.provLista);
              }
            },
            (err: any) => { },
            () => { });                
            //this.tablaGastos(result.gastos);
          },
            (err: any) => { },
            () => { });
      }
    });
  };
  /**
   * @function
   * @name gestionDetalle  
   * Metodo que switchea la aprobacion o rechazo del detalle para los gastos en la base
   * @returns {Array.<string>} guardar Regresa un Array con valores
   */
  gestionDetalle(arr: any, tipo: string) {
    let opcion = '', importe: any = 0, impuesto = 0;
    this.dialogService.openConfirmDialog(` ¿ Esta seguro desea ${tipo} el concepto ${arr.descripcion} para el gasto ${arr.idesGastos} ? `)
      .afterClosed().subscribe(res => {
        if (res) {
          console.log(arr);
          //this.Cambio('',arr,'montoAprobado');
          let envReporte;
          if (tipo === 'aprobar') {
            impuesto = !arr.montoIeps ? Number(arr.montoIva) : Number(arr.montoIeps);
            opcion = 'aprobado';
            importe = Number(arr.importe).toFixed(2);
            envReporte = { detalle_id: arr.id, importeAprobado: arr.importe + impuesto };
          }
          if (tipo === 'rechazar') {
            opcion = 'rechazado';
            importe = 0;
            envReporte = { detalle_id: arr.id, importeAprobado: 0 };            
          }
          this.servicios.patchDatos(`gastos/${arr.idesGastos}/comprobantedetalle`, envReporte)
            .pipe(catchError(err => { console.log("ERROR"); return throwError(err); }))
            .subscribe((irep: any) => {
              this.GastosList.data.map((val) => {
                val.detalle.data.map((det: any) => {
                  if (det.id === arr.id) {
                    if (importe != 0) {
                      console.log(importe);
                      det.montoAprobado = Number(importe).toFixed(2);
                      det.montoAprobado += Number(det.montoIva);
                      if (det.montoIeps) { det.montoAprobado += Number(det.montoIeps); }
                    } else {
                      det.montoAprobado = 0;
                    }
                  }
                  return true;
                });
                if (val.id === arr.idesGastos) { val.montoAprobado = 0; }
              });
              //this.mensajes.mensaje(`Gasto ${opcion} del reporte con exito.`,'','success');
              this.sumarTotales();
            }, (err: any) => { },
              () => { console.log('Termino'); }
            );
        } else {

        }
      });
  }
  /**
   * @function
   * @name editarDetalle  
   * Metodo que configura el tamaño del dialogo que edita el Detalle
   * @returns {Array.<string>} guardar Regresa un Array con valores
   */
  editarDetalle(arr: any) {
    //arr.reporte=this.reporte;
    const dialogRefE = this.dialog.open(EditaGastoDialog, {
      width: '100%',
      height: '90%',
      data: arr
    });
    console.log(dialogRefE);
    dialogRefE.afterClosed().subscribe(result => {
      console.log(result.detalle)
    });
  }
  /**
   * @function
   * @name cambiaCC
   * Metodo que habilita por cambio de centro de costos 
   * @returns  {Boolean} Regresa un true o false 
   */
  cambiaCC(evento: any, arr: any) {
    this.reporte.idCentrosCostos = evento.value;
    console.log(this.reporte);
  }
  /**
   * @function
   * @name cambiaProy 
   * Metodo que habilita por cambio de Proyecto 
   * @returns  {Boolean} Regresa un true o false 
   */
  cambiaProy(evento: any, arr: any) {
    this.reporte.idProyecto = evento.value;
    this.valida(this.reporte);
  }
  /**
   * @function
   * @name cambiaEmp 
   * Metodo que habilita por cambio de Empresa 
   * @returns  {Boolean} Regresa un true o false 
   */
  cambiaEmp(evento: any, arr: any) {
    this.reporte.idEmpresa = evento.value;
    this.valida(this.reporte);
  }

  tablaGastos(arr: Provider[] = []) {
    //Revisa si es la primera vez que entra a la tabla
    if (this.iniLista === 0 && this.provLista.length > 0 && arr.length > 0) {
      this.iniLista = 1;
    } else {
      arr.forEach((gtr: any) => { console.log('gtr', gtr); this.provLista.push(gtr) });
      this.provLista.filter((v, i, a) => a.indexOf(v) === i);
      arr = this.provLista;
    }
    console.log('PROV ', arr);
    // Se pasa un arreglo tipo provider pcon el id de cada gasto  consultar
    forkJoin(
      arr.map(a =>
        this.servicios.getUnParametro('gastos', `${a}`)
      )).subscribe((a: Provider[][]) => {
        console.log('GastosList - ',a);
        let providers: Provider[] = [];
        let providersNo: Provider[] = [];
        //Asigna datos de catalogos en base a los id ´s
        let gsatosListData = a.map(
          (t1: any) => ({
            ...t1, ...this.arrsesion.find((t2: any) => t2.idUser === t1.idUser),
            ...t1, ...this.MonedaL.find((t2: any) => t2.id === t1.idMoneda),
            ...t1, ...this.TipoSol.find((t2: any) => t2.id === t1.idUsoFondos),
          })
        );
        //Valida si son combropantes que estan pendientes e identifica si son Fiscales o no para generar otro arreglo provider y poder consultar
        // el wbesrvice que corresponda  
        gsatosListData.map((t1: any, i: any) => {          
          t1.automatico = t1.automatico == null ? 0 : t1.automatico;
          t1.isExpanded = false;
          t1.blockPolitica=false;
          t1.blockCaptura=false;
          t1.detalle = [];
          t1.valido = 0;
          t1.montoMaxPol=this.politica(t1,t1.idTipoGasto);
          t1.TipoComprobante = t1.idTipoComprobante == 0 ? 'Pendiente' : this.TipoComprobante.filter((tc: any) => tc.id == t1.idTipoComprobante)[0].tipo;
          t1.estatus = t1.automatico == 2 ? 'Rechazado' : t1.automatico == 1 && t1.montoAprobado>0? 'Aprobado':t1.estatus== 'Aprobado'?'Aprobado': 'Nuevo';           
          if (t1.TipoComprobante == 'Pendiente') { 
            t1.importetotal = 0; t1.subtotal = 0; 
            t1.idMoneda = 1; 
            t1.tipodegasto = 'Pendiente'; 
            console.log(this.MonedaL, " - idMoneda - ", t1.idMoneda);
            t1.moneda = this.MonedaL.filter((mon: any) => mon.id == t1.idMoneda)[0].tipo; 
          } else { t1.tipodegasto = t1.idTipoGasto === 0 ? '' : this.Tipogasto.filter((tp: any) => tp.id == t1.idTipoGasto)[0].nombreGasto; }
          switch (t1.idTipoComprobante) {
            case 1:
              if (t1.rutaXml != null) {
                providers.push(t1.id);
              }
              break;
            case 2:
              if (t1.rutaArchivo != null) {
                providersNo.push(t1.id);
              }
              break;
          }          
          if(Number(t1.total) <= t1.montoMaxPol+1){
            t1.valido=1;  
            t1.blockCaptura=(t1.automatico==1 && t1.montoAprobado>0) || t1.automatico==2?true:false;    
            //t1.blockPolitica=(t1.automatico==1 && t1.montoAprobado>0) || t1.automatico==2?true:false;             
          } else {
            t1.blockPolitica=true;
            //t1.blockCaptura=t1.automatico==1 || t1.automatico==2?true:false;
            //t1.blockCaptura=t1.estatus=="Aprobado" || t1.estatus=="Rechazado"?true:false;
          }
          
          t1.blockCaptura=this.reporte.estatus=="Aprobado"?true:false; 
          t1.blockPolitica=this.reporte.estatus=="Aprobado"?true:false;  
          t1.bloFormaPag=this.reporte.estatus=="Aprobado"?true:false;   
                       
          if (this.arrUslogin[0].idUser == this.reporte.idUser) {
            t1.blockCaptura=this.reporte.estatus=="Por Aprobar"?true:false; 
            t1.blockPolitica=this.reporte.estatus=="Por Aprobar"?true:false;  
            t1.bloFormaPag=this.reporte.estatus=="Por Aprobar"?true:false;  
          }
          if(t1.idFormasPago == 1){t1.idCuenta=0; t1.bloFormaPag=true; } 
          
          if(t1.idTipoComprobante==1){
            if(t1.idMoneda!='MXN'){
              t1.subtotal=t1.subtotal * t1.tipoCambio;
              t1.total=t1.total * t1.tipoCambio;
             }   
           }           
        });
        console.log('gsatosListData',gsatosListData);
        //console.log(providers);
        //console.log(providersNo);
        if (providers.length > 0) {
          forkJoin(
            providers.map(c =>
              this.servicios.getUnParametro('gastos', `${c}/comprobante`)
            )).subscribe((c: Provider[][]) => {
              console.log('comprobante', c);
              gsatosListData.map((x: any) => {
                let valcomp = 0, metodoPago = '', formaPago = '', idesGastos = 0;
                c.map((e: any, i:any) => {
                  // if (e[i].idGastos == x.id) {
                  //   valcomp = e[i].id; 
                  //   metodoPago = e[i].metodoPago; 
                  //   idesGastos = e[i].idGastos;
                  //   if (x.idTipoComprobante === 1) { formaPago = e[i].formaPago; x.montoIva = e[i].montoIva; x.montoIeps = e[i].montoIeps; x.descuento = e[i].descuento; }
                  // };
                  if (e.idGastos == x.id) {
                    valcomp = e.id; 
                    metodoPago = e.metodoPago; 
                    idesGastos = e.idGastos;
                    if (x.idTipoComprobante === 1) { formaPago = e.formaPago; x.montoIva = e.montoIva; x.montoIeps = e.montoIeps; x.descuento = e.descuento; }
                  };
                }); // formaPago=e.formaPago;
                x.metodoPago = metodoPago;   x.idComprobante = valcomp; x.idesGastos = idesGastos;
                if (x.idTipoComprobante === 1) { x.formaPago = formaPago; }
              });
              forkJoin(
                providers.map(p =>
                  this.servicios.getUnParametro('gastos', `${p}/comprobantedetalle`)
                )).subscribe((p: Provider[][]) => {
                  console.log('comprobantedetalle',p)

                  if (providersNo.length > 0) {
                    forkJoin(
                      providersNo.map(n =>
                        this.servicios.getUnParametro('gastosnofiscales', `?idGasto=${n}`)
                      )).subscribe((n: Provider[][]) => {
                        console.log("------------------------------------------");
                        console.log(n);

                        if (p.length > 0) {
                          gsatosListData.map((gt: any) => {
                            if (gt.idTipoComprobante === 1) {
                              p.map((comp: any) => {
                                comp.forEach((dt: any) => { 
                                  if (dt.idGastosComprobantes === gt.idComprobante) { 
                                    dt.idMoneda = gt.idMoneda; dt.metodoPago = gt.metodoPago; dt.formaPago = gt.formaPago; dt.idesGastos = gt.idesGastos; gt.detalle.push(dt) } });
                              });
                            } else {
                              n.map((sinc: any) => {
                                sinc.forEach((nof: any) => {
                                  if (nof.idGastos === gt.id) {
                                    gt.folioComprobante = nof.folioComprobante; gt.formaPago = nof.metodoPago; gt.razonSocialEmisor = nof.razonSocialEmisor; gt.concepto = nof.concepto; gt.idMoneda = nof.idMoneda; gt.fechaEmision = nof.fechaEmision; gt.montoAprobado = nof.importeAprobado;
                                    gt.detalle.push({ descripcion: nof.concepto, importe: nof.importeTotal, idMoneda: gt.idMoneda, metodoPago: gt.metodoPag, idesGastos: gt.idesGastos });
                                  }
                                });
                              });
                            }
                            gt.detalle = new MatTableDataSource(gt.detalle);
                            //gt.detalle.paginator = this.paginator2!;
                            //gt.detalle.sort = this.sort2;
                          });
                        } else {
                          gsatosListData.map((gt: any) => {
                            if (gt.idTipoComprobante === 1) {
                              p.map((comp: any) => {
                                comp.forEach((dt: any) => { if (dt.idGastosComprobantes === gt.idComprobante) { dt.idMoneda = gt.idMoneda; dt.metodoPago = gt.metodoPago; dt.formaPago = gt.formaPago; dt.idesGastos = gt.idesGastos; gt.detalle.push(dt) } });
                              });
                            }
                            gt.detalle = new MatTableDataSource(gt.detalle);

                            //gt.detalle.paginator = this.paginator2!;
                            //gt.detalle.sort = this.sort2;
                          });
                        }
                        console.log('gsatosListData-1S', gsatosListData);
                        this.GastosList = new MatTableDataSource(gsatosListData);
                        this.GastosList.paginator = this.paginator!;
                        this.GastosList.sort = this.sort;
                        const sortState: Sort = { active: 'createdAt', direction: 'desc' };
                        this.sort.active = sortState.active;
                        this.sort.direction = sortState.direction;
                        this.sort.sortChange.emit(sortState);
                        this.sumarTotales();
                      }), (err: any) => { console.log(err); };
                  } else {
                    gsatosListData.map((gt: any) => {
                      if (gt.idTipoComprobante === 1) {
                        p.map((comp: any) => {
                          comp.forEach((dt: any) => { if (dt.idGastosComprobantes === gt.idComprobante) { dt.idMoneda = gt.idMoneda; dt.metodoPago = gt.metodoPago; dt.formaPago = gt.formaPago; dt.idesGastos = gt.idesGastos; gt.detalle.push(dt) } });
                        });
                      }
                      gt.detalle = new MatTableDataSource(gt.detalle);
                      //gt.detalle.paginator = this.paginator2!;
                      //gt.detalle.sort = this.sort2;
                    });
                    console.log('gsatosListData-2S', gsatosListData);
                    this.GastosList = new MatTableDataSource(gsatosListData);
                    this.GastosList.paginator = this.paginator!;
                    this.GastosList.sort = this.sort;
                    const sortState: Sort = { active: 'createdAt', direction: 'desc' };
                    this.sort.active = sortState.active;
                    this.sort.direction = sortState.direction;
                    this.sort.sortChange.emit(sortState);
                    this.sumarTotales();
                  }
                }), (err: any) => { console.log(err); };
            });
        } else {
          if (providersNo.length > 0) {
            forkJoin(
              providersNo.map(n =>
                this.servicios.getUnParametro('gastosnofiscales', `?idGasto=${n}`)
              )).subscribe((n: Provider[][]) => {
                console.log("------------------------------------------");
                console.log(n);
                gsatosListData.map((gt: any) => {
                  n.map((sinc: any) => {
                    sinc.forEach((nof: any) => {
                      if (nof.idGastos === gt.id) {
                        gt.folioComprobante = nof.folioComprobante; gt.formaPago = nof.metodoPago; gt.razonSocialEmisor = nof.razonSocialEmisor; gt.concepto = nof.concepto; gt.idMoneda = nof.idMoneda; gt.fechaEmision = nof.fechaEmision; gt.montoAprobado = nof.importeAprobado;
                        gt.detalle.push({ descripcion: nof.concepto, importe: nof.importeTotal, idMoneda: gt.idMoneda, metodoPago: gt.metodoPag, idesGastos: gt.idesGastos });
                      }
                    });
                  });
                  gt.detalle = new MatTableDataSource(gt.detalle);
                });
                console.log(gsatosListData);
                this.GastosList = new MatTableDataSource(gsatosListData);
                this.GastosList.paginator = this.paginator!;
                this.GastosList.sort = this.sort;
                const sortState: Sort = { active: 'createdAt', direction: 'desc' };
                this.sort.active = sortState.active;
                this.sort.direction = sortState.direction;
                this.sort.sortChange.emit(sortState);
                this.sumarTotales();
              }), (err: any) => { console.log(err); };
          }
        }
      }), (err: any) => { console.log(err); };
  }

  sumarTotales() {    
    console.log("******************SUMAR***********************",this.reporte);
    let montogst = 0, montoaut = 0, montoautDet = 0, arrOrigen = [], valTipoDambio=this.tipoCambio;
    console.log(this.GastosList.data);
    this.concepDetalle.reemMontocomprobado = 0;
    this.concepDetalle.reemMontoAutorizado = 0;
    this.concepDetalle.devoMontocomprobado = 0;
    this.concepDetalle.devoMontoAutorizado = 0;

    this.GastosList.data.forEach(function (obj) {
      obj.detalle.data.map((det: any) => { 
        if (det.idesGastos === obj.id) { 
          if (det.montoAprobado) { 
            montoautDet += Number(det.montoAprobado); obj.montoAprobado = Number(montoautDet); 
          } 
        } return true; });
      if (obj.total) { if(obj.idMoneda!='MXN'){montogst += Number(obj.total) ;}else{montogst += Number(obj.total);} }
      if (obj.montoAprobado) { if(obj.idMoneda!='MXN'){montoaut += Number(obj.montoAprobado) ;}else{montoaut += Number(obj.montoAprobado);}  }
      montoautDet = 0;
    });
    this.concepDetalle.totGaMontocomprobado = !montogst ? 0 : Number(montogst).toFixed(2);
    this.concepDetalle.totGaMontoAutorizado = !montoaut ? 0 : Number(montoaut).toFixed(2);
    this.concepDetalle.idMoneda = 'MXN';
    arrOrigen = this.GastosList.data;
    arrOrigen.map((t1: any) => {
      t1.tipodegasto = t1.idTipoGasto === 0 ? '' : this.Tipogasto.filter((tp: any) => tp.id == t1.idTipoGasto)[0].nombreGasto;
    });

    console.log(arrOrigen);
    let map = arrOrigen.reduce(function (map, gst) {
      //let idMoneda = gst.idMoneda;
      let Tipogastos = gst.tipodegasto;
      let monto = + !gst.montoAprobado ? 0 : gst.montoAprobado;
      map[Tipogastos] = (map[Tipogastos] || 0) +'|'+ monto//  idMoneda
      return map
    }, {})
    //console.log("map - ", map);

    let arreglo = Object.keys(map).map(function (name) {
      //console.log(map[name]);
      let monMon=map[name].split('|');      
      return {
        Tipogastos: name,
        Montototal: String(monMon.filter((a:any)=> Number(a) > 0 )),
        //idMoneda: monMon[1]
      }
    });
    //console.log("*********arreglo - ", arreglo);

    this.totalesTabla = new MatTableDataSource(arreglo);
    this.totalesTabla.paginator = this.paginator1!;
    this.totalesTabla.sort = this.sort1;
    let sumaRemDev = 0;
    
    if (this.concepDetalle.antMontoAutorizado) {
      sumaRemDev = this.concepDetalle.totGaMontoAutorizado - this.concepDetalle.antMontoAutorizado;
      console.log(this.concepDetalle.totGaMontoAutorizado , "---AUTORIZADOS--",this.concepDetalle.antMontoAutorizado, '   |||   ' ,sumaRemDev)
      if (sumaRemDev >= 0) {
        this.concepDetalle.reemMontoAutorizado = Math.abs(sumaRemDev);
      } else {
        if (this.concepDetalle.totGaMontoAutorizado > 0) { }
        this.concepDetalle.devoMontoAutorizado = Math.abs(sumaRemDev);        
      }
    } else {
      if (this.concepDetalle.totGaMontoAutorizado >= 0) {
        this.concepDetalle.reemMontoAutorizado = this.concepDetalle.totGaMontoAutorizado;
      }
    } 
    console.log("---AUTORIZADOS--",this.concepDetalle.devoMontoAutorizado)

    let guardar:any = {
      id: this.reporte.id,
      idEmpresa: this.reporte.idEmpresa,
      idProyecto: this.reporte.idProyecto,
      idUser: this.reporte.idUser,
      idAnticipoFondos: this.reporte.idAnticipoFondos,
      idCentrosCostos: this.reporte.idCentrosCostos,
      idUsoFondos: this.reporte.idUsoFondos,  
      fechaIni:isNaN(this.FechaI)?this.FechaI:moment(new Date(this.FechaI)).format("yyyy-MM-DD"),
      fechaFin:isNaN(this.FechaF)?this.FechaF:moment(new Date(this.FechaF)).format("yyyy-MM-DD"),
      notas: String(this.reporte.notas),
      montoAprobado: Number(this.concepDetalle.totGaMontoAutorizado),
      monto: this.reporte.monto,
      estatus: this.reporte.estatus,
    }

    console.log(" - Sumar Totales - ",guardar);
    this.servicios.putDatos(`reportes/${this.reporte.id}`, guardar)
      .pipe(catchError(err => { return throwError(err); })
      ).subscribe(
        (res: any) => { },
        (err: any) => { });

    this.valida(this.reporte);
  }
  /**
   * @function
   * @name ReembDevo  
   * Metodo que configura el tamaño del dialogo que edita el Reembolso
   * @returns {Array.<string>} guardar Regresa un Array con valores
   */
  ReembDevo(arr: any, tipo: string) {
    arr.tipo = tipo;
    arr.reporte = this.reporte;
    if (tipo === '1') {
      const dialogRemDev = this.dialog.open(ReembRepoDialog, {
        width: '90%',
        height: '90%',
        data: arr,
      });
      dialogRemDev.afterClosed().subscribe(result => {
        if (result.reembolso) {
          let guardar = {
            idEmpresa: Number(result.reembolso.idEmpresa),
            idCentrosCostos: Number(result.reembolso.idCentrosCostos),
            idUser: Number(result.reembolso.idUser),
            idAnticiposFondos: Number(result.reembolso.idAnticiposFondos),
            idReportesGastos: Number(result.reembolso.idReportesGastos),
            idProyecto: Number(result.reembolso.idProyecto),
            monto: Number(result.reembolso.monto),
            idMoneda: '1',
            observaciones: result.reembolso.observaciones,
            estatus: result.reembolso.estatus
          }
          // estatus: result.reembolso.estatus
          console.log(guardar);
          console.log(result.origen);
          if (result.origen == 0) {
            this.servicios.postDatos('reembolsos', guardar)//,`?idWorkflow=`
              .pipe(catchError(err => { console.log("ERROR"); return throwError(err); })
              ).subscribe((reem: any) => {
                console.log(reem);
                this.mensajes.mensaje('Reembolso asignado con exito.', '', 'success');
              },
                (err: any) => { },
                () => { console.log('Termino'); });
          } else {
            //guardar[0].id
            this.servicios.putDatosP('reembolsos', result.reembolso.id, guardar)//,`?idWorkflow=`
              .pipe(catchError(err => { console.log("ERROR"); return throwError(err); })
              ).subscribe((reem: any) => {
                console.log(reem);
                this.mensajes.mensaje('Reembolso actualizado con exito.', '', 'success');
              },
                (err: any) => { },
                () => { console.log('Termino'); });
          }
        }
      });
    } else {
      const dialogRemDev = this.dialog.open(DevolRepoDialog, {
        width: '90%',
        height: '90%',
        data: arr,
      });
      dialogRemDev.afterClosed().subscribe(result => {
        console.log('devolucion', result)
        if (result.devolucion) {
          let guardar = {
            idEmpresa: Number(result.devolucion.idEmpresa),
            idCentrosCostos: Number(result.devolucion.idCentrosCostos),
            idUser: Number(result.devolucion.idUser),
            idAnticiposFondos: Number(result.devolucion.idAnticiposFondos),
            idReportesGastos: Number(result.devolucion.idReportesGastos),
            concepto: result.devolucion.concepto,
            monto: Number(result.devolucion.monto),
            idMoneda: 'MXN',
            comprobante: result.devolucion.comprobante,
            observaciones: result.devolucion.observaciones,
            validado: result.devolucion.validado,
            estatus: result.devolucion.estatus
          }
          // estatus: result.reembolso.estatus
          console.log(guardar);
          console.log(result.origen);
          if (result.origen == 0) {
            this.servicios.postDatos('devoluciones', guardar)//,`?idWorkflow=`
              .pipe(catchError(err => { console.log("ERROR"); return throwError(err); })
              ).subscribe((devo: any) => {
                console.log(devo);
                this.mensajes.mensaje('Devolución asignado con exito.', '', 'success');
              },
                (err: any) => { },
                () => { console.log('Termino'); });
          } else {
            this.servicios.putDatosP('devoluciones', result.devolucion.id, guardar)//,`?idWorkflow=`
              .pipe(catchError(err => { console.log("ERROR"); return throwError(err); })
              ).subscribe((devo: any) => {
                console.log(devo);
                this.mensajes.mensaje('Devolución actualizado con exito.', '', 'success');
              },
                (err: any) => { },
                () => { console.log('Termino'); });
          }
        }
      });

    }
  }

  toggleTableRows() {
    this.isTableExpanded = !this.isTableExpanded;
    this.GastosList.data.forEach((row: any) => {
      row.isExpanded = this.isTableExpanded;
    })
  }

  cambiaWork(evento: any, arr: any) {
    console.log('ENTRA')
    if(this.FechaTolerancia){
      const options2 = { style: 'currency', currency: 'MXN' };
      const numberFormat2 = new Intl.NumberFormat('es-MX', options2);
      let devolucionArr: any, reembolsoArr: any;
      let devReem = this.bloqueoWf = (Number(this.concepDetalle.reemMontoAutorizado) == 0) ?  (Number(this.concepDetalle.devoMontoAutorizado) == 0 )? '' : ' que contiene una Devolución de ' + numberFormat2.format(this.concepDetalle.devoMontoAutorizado) : ' que contiene un Reembolso de ' + numberFormat2.format(this.concepDetalle.reemMontoAutorizado);
      let valFpg=0, valFchgs=0, valCtapg=0, valEstCer=0, valSinEstat=0, valBand=0;
      this.GastosList.data.forEach((gst: any) => {
        console.log(gst)    
        gst.fechaGasto==null || gst.fechaGasto==''?gst.formaPago==28 || gst.formaPago=='28' || gst.idFormasPago==1?'':valFchgs++:'';
        gst.idFormasPago==null || gst.idFormasPago==0?valFpg++:'';
        gst.idCuenta==null || gst.idCuenta==''?gst.formaPago==28 || gst.formaPago=='28' || gst.idFormasPago==1?'':valCtapg++:'';
        //gst.automatico!== 1 && gst.automatico !== 2 ? valSinEstat++:'';
        gst.automatico== 1 && gst.montoAprobado == 0 ? valEstCer++:'';
      });
      
      this.dialogService.openConfirmDialog('  ¿ Esta seguro que desea cambiar al estatus ' + (evento.source.selected as MatOption).viewValue + ' ' + devReem + ' ?')
        .afterClosed().subscribe(res => {
          let Workflow = this.workFGral;
          console.log(arr);
          console.log(evento.source.value);
          console.log(this.workInicial, '  - ', this.workOrigen);           
          if((evento.source.selected as MatOption).viewValue != 'Enviar A Correcciones' ){ 
            if(valFchgs>0){
              this.reporte.estatus = this.workOrigen;  
              this.mensajes.mensaje(`No se pudo cambiar el estatus.\n Debe asignarle una fecha de gasto a todos los comprobantes.`, '', 'danger'); 
              res=false;
              //gst.formaPago=='28' || gst.idFormasPago==1
            }
            if(this.workOrigen!='Nuevo'){
              if(valFpg>0){this.reporte.estatus = this.workOrigen;  this.mensajes.mensaje(`No se pudo cambiar el estatus.\n Debe asignarle una forma de pago a todos los comprobantes.`, '', 'danger'); res=false;}
              if(valCtapg>0){this.reporte.estatus = this.workOrigen;  this.mensajes.mensaje(`No se pudo cambiar el estatus.\n Debe asignar una cuenta al todos los comprobantes.`, '', 'danger'); res=false;}
              if(valEstCer>0){ this.reporte.estatus = this.workOrigen; this.mensajes.mensaje(`No se pudo cambiar el estatus. \n Debe ingresar un monto mayor a cero a todos los comprobantes.`, '', 'danger'); res=false;  }
            }
          }        
          console.log(res);
          if (res) {
            console.log(this.arrsesion,' - ',this.UsSuperior );
            console.log(this.arrsesion[0].email,
              this.arrsesion[0].NombreCompleto,
            'Solicitud de corrección de ',
            'Solicitud de Correcciones',
            'Se le informa que <b>'+this.UsSuperior.nombre + ' ' + this.UsSuperior.apellidoPaterno + ' ' + this.UsSuperior.apellidoMaterno+' </b>, requiere de su atención para la aprobación del <b>REEMBOLSO</b> con monto de ',
            '',
            this.Empresas[0].id);

            let envEstatus = { estatus: arr.estatus }
            this.idWorkflow = Workflow.filter((dato: any) => dato.nombreObjeto == "Reporte de Gastos" && dato.evento.some((o2: any) => o2.siguienteEstatus === evento.source.value));
            console.log(this.idWorkflow,'  -++++++++++++++++-  ', this.concepDetalle.totGaMontocomprobado);
            console.log(this.workOrigen,'this.reporte', this.reporte);

            if (this.workOrigen == 'Por Aprobar' ) { 
              if((evento.source.selected as MatOption).viewValue == 'Enviar A Correcciones'){
                console.log('CORRECCIONES');
                this.servicios.patchDatos(`reportes/${this.reporte.id}?idWorkflow=${this.idWorkflow.id}`, envEstatus)
                .pipe(catchError(err => { console.log("ERROR"); return throwError(err); }))
                .subscribe((rep: any) => {
                  console.log(rep);
                  this.reporte.estatus = arr.estatus;
                  this.servicios.sendEmailNotification(
                    this.arrsesion[0].email,//'gerardo.mauriesr@gmail.com',
                    this.arrsesion[0].NombreCompleto,
                    'Solicitud de corrección de ',
                    'Solicitud de Correcciones',
                    'Se le informa que <b>'+this.UsSuperior.nombre + ' ' + this.UsSuperior.apellidoPaterno + ' ' + this.UsSuperior.apellidoMaterno+' </b>, requiere de su atención para la Correcciones del un <b>Reporte de Gastos '+this.reporte.id+'</b> .',
                    '',
                    this.Empresas[0].id
                  ).subscribe(results => { 
                    this.valida(this.reporte);
                    this.mensajes.mensaje('Se ha enviado la solicitud de corrección del Reporte de Gastos al correo '+this.arrsesion[0].email, '', 'success');
                  });    
                });

              } else{
                if((evento.source.selected as MatOption).viewValue == 'Rechazar'){
                  console.log('RECHAZO');
                  this.servicios.patchDatos(`reportes/${this.reporte.id}?idWorkflow=${this.idWorkflow.id}`, envEstatus)
                    .pipe(catchError(err => { console.log("ERROR"); return throwError(err); }))
                    .subscribe((rep: any) => {
                      console.log(rep);
                      this.reporte.estatus = arr.estatus;
                      this.servicios.sendEmailNotification(
                        this.arrsesion[0].email,//'gerardo.mauriesr@gmail.com',
                        this.arrsesion[0].NombreCompleto,
                        'Rechazo de solicitud de ',
                        'Rechazo de solicitud',
                        'Se le informa que <b>'+this.UsSuperior.nombre + ' ' + this.UsSuperior.apellidoPaterno + ' ' + this.UsSuperior.apellidoMaterno+' </b>, rechazo el <b>Reporte de Gastos '+this.reporte.id+'</b> .',
                        '',
                        this.Empresas[0].id
                      ).subscribe(results => { 
                        this.valida(this.reporte);
                        this.mensajes.mensaje('Se ha enviado el Rechazo del Reporte de Gastos al correo '+this.arrsesion[0].email, '', 'success');
                      });    
                    });

                } else{
                  console.log('APROBAR');
                  if (Number(this.concepDetalle.reemMontoAutorizado) > 0) {
                    this.servicios.getUnParametro('reembolsos/reporte', this.reporte.id)
                      .pipe(catchError(err => { return throwError(err); })
                      ).subscribe((ree: any) => {
                        console.log(ree);
                        if (ree.length > 0) {
                          reembolsoArr = ree[0];
                          reembolsoArr.monto = Number(this.concepDetalle.reemMontoAutorizado).toFixed(2);
                          this.servicios.patchDatos(`reportes/${this.reporte.id}?idWorkflow=${this.idWorkflow.id}`, envEstatus)
                            .pipe(catchError(err => { console.log("ERROR"); return throwError(err); }))
                            .subscribe((rep: any) => {
                              console.log(rep);
                              this.reporte.estatus = arr.estatus;
                              this.mensajes.mensaje('Cambio a estatus ' + this.reporte.estatus + ' con exito.', '', 'success');
                              this.bloqueo=this.reporte.estatus=='Por Aprobar'?false:true;
                              this.valida(this.reporte);
                            },
                              (err: any) => { }
                            );
                        } else {
                          reembolsoArr = {
                            idEmpresa: this.reporte.idEmpresa,
                            idProyecto: this.reporte.idProyecto,
                            idCentrosCostos: this.reporte.idCentrosCostos,
                            idUser: this.reporte.idUser,
                            idReportesGastos: this.reporte.id,
                            idAnticiposFondos: this.reporte.idAnticipoFondos,
                            monto: Number(this.concepDetalle.reemMontoAutorizado),
                            //motivo:this.reporte.notas,
                            idMoneda: '1',
                            observaciones: this.reporte.notas,
                            estatus: 'Aprobado',
                          };
                          this.servicios.postDatos('reembolsos', reembolsoArr)//,`?idWorkflow=`
                            .pipe(catchError(err => { console.log("ERROR"); return throwError(err); })
                            ).subscribe((reem: any) => {
                              console.log(reem);
                              this.servicios.patchDatos(`reportes/${this.reporte.id}?idWorkflow=${this.idWorkflow.id}`, envEstatus)
                                .pipe(catchError(err => { console.log("ERROR"); return throwError(err); }))
                                .subscribe((rep: any) => {
                                  console.log(rep);
                                  this.reporte.estatus = arr.estatus;

                                  this.servicios.sendEmailNotification(
                                    this.arrsesion[0].email,//'gerardo.mauriesr@gmail.com',
                                    this.arrsesion[0].NombreCompleto,
                                    'Solicitud de aprobación de ',
                                    'Solicitud de aprobación',
                                    'Se le informa que <b>'+this.UsSuperior.nombre + ' ' + this.UsSuperior.apellidoPaterno + ' ' + this.UsSuperior.apellidoMaterno+' </b>, requiere de su atención para la aprobación de un <b>REEMBOLSO</b> con monto de '+numberFormat2.format(Number(this.concepDetalle.totGaMontoAutorizado)),
                                    '',
                                    this.Empresas[0].id
                                  ).subscribe(results => { 
                                    this.mensajes.mensaje('Se ha enviado la solicitud de aprobación del Reembolso al correo '+this.arrsesion[0].email, '', 'success');
                                  });            
                                  
                                  this.bloqueo=this.reporte.estatus=='Por Aprobar'?false:true;
                                  this.valida(this.reporte);
                                });
                            },
                              (err: any) => { },
                              () => {  this.valida(this.reporte); });
                        }
                        console.log(reembolsoArr);
                      },
                        (err: any) => { });
                  }
                  if (Number(this.concepDetalle.devoMontoAutorizado) > 0) {
                    this.servicios.getUnParametro('devoluciones/reporte', this.reporte.id)
                      .pipe(catchError(err => { return throwError(err); })
                      ).subscribe((dev: any) => {
                        console.log(dev);
                        if (dev.length > 0) {
                          devolucionArr = dev[0];
                          devolucionArr.monto = this.concepDetalle.reemMontoAutorizado;
                          this.servicios.patchDatos(`reportes/${this.reporte.id}?idWorkflow=${this.idWorkflow.id}`, envEstatus)
                            .pipe(catchError(err => { console.log("ERROR"); return throwError(err); }))
                            .subscribe((rep: any) => {
                              console.log(rep);
                              this.reporte.estatus = arr.estatus;
                              this.mensajes.mensaje('Cambio a estatus ' + this.reporte.estatus + ' con exito.', '', 'success');
                              this.bloqueo=this.reporte.estatus=='Por Aprobar'?false:true;
                              this.valida(this.reporte);
                            });
                        } else {
                          devolucionArr = {
                            idEmpresa: Number(this.reporte.idEmpresa),
                            idCentrosCostos: Number(this.reporte.idCentrosCostos),
                            idUser: Number(this.reporte.idUser),
                            idReportesGastos: this.reporte.id,
                            idAnticiposFondos: this.reporte.idAnticipoFondos,
                            concepto: this.reporte.notas,
                            monto: Number(this.concepDetalle.devoMontoAutorizado),
                            idMoneda: 'MXN',
                            comprobante: '',
                            observaciones: '',
                            //motivo:this.reporte.notas,
                            validado: true,
                            estatus: 'Nuevo',
                          };
                          this.servicios.postDatos('devoluciones', devolucionArr)//,`?idWorkflow=`
                            .pipe(catchError(err => { console.log("ERROR"); return throwError(err); })
                            ).subscribe((dev: any) => {
                              console.log(dev);
                              this.servicios.patchDatos(`reportes/${this.reporte.id}?idWorkflow=${this.idWorkflow.id}`, envEstatus)
                                .pipe(catchError(err => { console.log("ERROR"); return throwError(err); }))
                                .subscribe((rep: any) => {
                                  console.log(rep);
                                  this.reporte.estatus = arr.estatus;
                                  this.servicios.sendEmailNotification(
                                    this.arrsesion[0].email,//'gerardo.mauriesr@gmail.com',
                                    this.arrsesion[0].NombreCompleto,
                                    'Solicitud de aprobación de ',
                                    'Solicitud de aprobación',
                                    'Se le informa que <b>'+this.UsSuperior.nombre + ' ' + this.UsSuperior.apellidoPaterno + ' ' + this.UsSuperior.apellidoMaterno+' </b>, requiere de su atención para la aprobación de una <b>DEVOLUCIÓN</b> con monto de '+numberFormat2.format(Number(this.concepDetalle.totGaMontoAutorizado)),
                                    '',
                                    this.Empresas[0].id
                                  ).subscribe(results => { 
                                    this.mensajes.mensaje('Se ha enviado la solicitud de aprobación de la Devolución al correo '+ this.arrsesion[0].email, '', 'success');
                                  }); 
                                  this.mensajes.mensaje('Devolución asignado con exito.', '', 'success');
                                  this.bloqueo=this.reporte.estatus=='Por Aprobar'?false:true;
                                  this.valida(this.reporte);
                                });
                            },(err: any) => { });
                        }
                        console.log(devolucionArr);
                      });
                  }
                }              
              }
            } else {
              console.log('NUEVO');
              this.servicios.patchDatos(`reportes/${this.reporte.id}?idWorkflow=${this.idWorkflow.id}`, envEstatus)
                .pipe(catchError(err => { console.log("ERROR"); return throwError(err); }))
                .subscribe((rep: any) => {
                  console.log(rep);
                  this.reporte.estatus = arr.estatus;
                  //this.bloqueo=this.reporte.estatus=='Por Aprobar'?false:true;
                  this.servicios.sendEmailNotification(
                    this.UsSuperior.email,//'gerardo.mauriesr@gmail.com',
                    this.UsSuperior.nombre + ' ' + this.UsSuperior.apellidoPaterno + ' ' + this.UsSuperior.apellidoMaterno,
                    'Solicitud de aprobación de ',
                    'Solicitud de aprobación',
                    'Se le informa que <b>'+this.arrsesion[0].NombreCompleto+' </b>, requiere de su atención para la aprobación del un <b>Reporte de Gastos '+this.reporte.id+'</b> con monto de '+numberFormat2.format(Number(this.concepDetalle.totGaMontocomprobado)),
                    '',
                    this.Empresas[0].id
                  ).subscribe(results => { 
                    this.valida(this.reporte);
                    this.mensajes.mensaje('Se ha enviado la solicitud de aprobación del Reporte de Gastos al correo '+this.UsSuperior.email, '', 'success');
                  });    
                });
            }
          } else {
            this.reporte.estatus = this.workOrigen;
          }
        });
    } else{
      this.toleranciaVal()
      this.reporte.estatus = this.workOrigen;
    }
  }

  /**
   * @function
   * @name valida 
   * Metodo que habilita el estatus del boton guardar, si algo fue modificado, switcheando aprobaciones o rechaxos
   * @returns  {Boolean} Regresa un true o false 
   */
  valida(event: any) {
    this.bloqueoWf = '1';
    console.log("*************************************VALIDA*******");
    console.log(this.reporte.estatus);  
    let resulta;
    resulta=(moment(this.FechaF, 'YYYY-MM-DD').diff(moment(this.FechaI, 'YYYY-MM-DD'), 'days'))+1; 
    this.reporte.diasDura=resulta;
    // this.reporte.diasDura=resulta<0?0:resulta;
    // this.reporte.diasDura=isNaN(this.reporte.diasDura)?1:this.reporte.diasDura;
    // this.reporte.diasDura = this.reporte.diasDura>0 && this.reporte.idUsoFondos === 1? this.reporte.diasDura + 1:this.reporte.diasDura;  

    if (this.reporte.estatus === 'Por Aprobar' || this.reporte.estatus === 'Aprobado' || this.reporte.estatus === 'Pagado' ) {
      if (this.reporte.estatus === 'Aprobado' || this.reporte.estatus === 'Pagado') {
        this.bloqueo = true;
        this.blockInput = true;
        this.bloqueoWf = '0';
        this.btnGda = '0';
        this.bloqTieneAnt=true;
        this.GastosList.data.map((val) => { 
            val.blockPolitica=true          
            val.blockCaptura=true;    
            val.blockPolitica=true;
            val.bloFormaPag=true;  
          });
      } else {
        if (this.arrUslogin[0].idUser == this.reporte.idUser) {
          this.bloqueo = true;
          this.blockInput = true;
          this.bloqueoWf = '0';
          this.btnGda = '0';
          this.bloqMismoUsr=true;
          this.bloqColab=0;
        } else {
          this.bloqueo = false;
          this.blockInput = true;
          this.bloqTieneAnt=true;
          this.bloqueoWf = '1';
          this.btnGda = '0';
        }
      }
    } else {
      if (this.reporte.estatus === 'Rechazado') {
        this.bloqueo = false;
        this.blockInput = true;
        this.bloqueoWf = '0';
        this.btnGda = '0';
        this.bloqTieneAnt=true;
      } else {
        this.bloqColab=(this.arrUslogin[0].idUser == this.reporte.idUser)?0:1;         
        if (this.FechaF != '') { } else { return false; };
        if (this.FechaI != '') { } else { return false; };
        if (moment(this.FechaF).format("YYYY-MM-DD") >= moment(this.FechaI).format("YYYY-MM-DD")) { } else { return false; };
        if (this.arrUslogin[0].idUser != this.reporte.idUser) {
          this.bloqueoWf = Number(this.concepDetalle.reemMontoAutorizado) == 0 ? Number(this.concepDetalle.devoMontoAutorizado) == 0 ? '0' : '1' : '1';
        }
        this.btnGda = '1';
      }
    }
  }

  public getDatos(idempresa: any, idCC: any, usuario: any, nivCC: any): Observable<any> {
    let monedas = this.http.get<any>(`${APIAdmin}catalogo/?catalogo=monedas`, { headers: headers });
    let tipoSolicitud = this.http.get<any>(`${APIAdmin}catalogo/?catalogo=tipoSolicitud`, { headers: headers });
    let centrosCostos = this.http.get<any>(API + 'catalogos/?catalogo=vwCentrosCostos&filtro1=' + encodeURIComponent('idEstructura=' + idCC + ' and idEmpresas=' + idempresa), { headers: headers });
    let empresas = this.http.get<any>(APIAdmin + 'catalogo/?catalogo=empresas&filtro1=' + encodeURIComponent('id=' + idempresa), { headers: headers });
    let proyectos = this.http.get<any>(API + 'catalogos/?catalogo=vwProyectos&filtro1=' + encodeURIComponent('nivelEstructura=' + nivCC + ' and idEmpresas=' + idempresa), { headers: headers });
    let tipoGastos = this.http.get<any>(`${APIAdmin}catalogo/?catalogo=tipoGastos&filtro1=idEmpresas=${idempresa}`, { headers: headers });
    let formasPagos = this.http.get<any>(`${APIAdmin}catalogo/?catalogo=formasPago`, { headers: headers });
    let cuentas = this.http.get<any>(API + 'catalogos/?catalogo=vwDatosBancarios&filtro1=' + encodeURIComponent('id=' + usuario), { headers: headers });
    let empTipoGsto = this.http.get<any>(API + 'catalogos/?catalogo=vwTipoGastosEmpresaCosto&filtro1='+encodeURIComponent('idEmpresas='+idempresa+' and nivelEstructura='+nivCC), { headers: headers });
    return forkJoin([monedas, tipoSolicitud, centrosCostos, empresas, proyectos, tipoGastos, formasPagos, cuentas, empTipoGsto]);
  }

  public getUsuario(id: any, idempresa: any): Observable<any> {
    let usuario = this.http.get<any>(API + 'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1=' + encodeURIComponent('idOcupantePuesto=' + id + ' and idEmpresas=' + idempresa), { headers: headers });
    let superior = this.http.get<any>(API + 'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1=' + encodeURIComponent('idEstructura in (select idEstructuraPadre from gastos.vwEstructuraOrganizacionalEmpresa where idOcupantePuesto = ' + id + ')'), { headers: headers });
    let tolerancia = this.http.get<any>(API + 'catalogos/?catalogo=vwEmpresasToleranciasGastos&filtro1=' + encodeURIComponent('idEmpresas=' + idempresa), { headers: headers });
    return forkJoin([usuario,superior,tolerancia]);
  }
}

/**
 * componente  para listar y editar los anticipos 
 */
@Component({
  selector: 'lista_anticiposE',
  templateUrl: 'lista_anticiposE.html',
})
/** El nombre del modulo ListaAnticipoEditDialog */

export class ListaAnticipoEditDialog {
  anticipoColumns: string[] = ['select', 'id', 'createdAt', 'descripcion', 'motivo', 'fechaIni', 'fechaFin', 'diasDura', 'estatus', 'monto', 'tipo'];
  searchText: any;
  local_data: any;
  action: string;
  arrsesion: any;
  TipoSol: any;
  MonedaL: any;
  anticipoList: MatTableDataSource<any>;
  selection = new SelectionModel<any>(true, []);
  subscription!: Subscription;

  @ViewChild(MatSort) sort: MatSort = Object.create(null);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
  /**
   * Consulta catálogos y servicios.
   * 
   * 
   */
  constructor(public dialogRefs: MatDialogRef<ListaAnticipoEditDialog>,
    private servicios: serviciosService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    @Optional() @Inject(MAT_DIALOG_DATA) public LstAnt: any,
    private http: HttpClient,
    private token: TokenService) {
    let datSess: any = token.readToken('id', '')
    datSess = datSess.split(',');
    this.local_data = { ...data };
    this.action = this.local_data.action;
    this.anticipoList = new MatTableDataSource();



    console.log('*********-ANTICIPOS', this.local_data);
    this.servicios.getUnParametro('catalogos', '?catalogo=vwAnticiposFondos&filtro1=' + encodeURIComponent(`idEmpresa=${datSess[1]} and idUser=${this.local_data.idUser} and estatus IN ('Pagado','Pagado Parcial') `))
      .pipe(catchError(err => { this.anticipoList = new MatTableDataSource(); return throwError(err); }))
      .subscribe(
        (antDato: any) => {
          this.getUsuario(datSess[0], datSess[1]).subscribe(rsUs => {
            this.arrsesion = rsUs[0];
            this.arrsesion.map((t1: any) => { t1.NombreCompleto = `${t1.nombre} ${t1.apellidoPaterno} ${t1.apellidoMaterno}`; t1.idUser = t1.idOcupantePuesto; t1.idEmpresa = datSess[1]; });
            this.getDatos(this.arrsesion[0].idEmpresa).subscribe(resp => {
              this.MonedaL = resp[0];
              this.TipoSol = resp[1];
              this.Inicio(antDato);
            });
          });
        },
        (err: any) => { }, () => { }
      );
  }
  /**
   * @function
   * @name Inicio 
   * Metodo principal que inicia el consumo del servicio
   * @param {string} anticipos 
   * @returns {Array.<string>} Regresa el servicio anticipos consultado correspondiente al idUser
   */
  Inicio(res: any) {
    let anticipoListData = res.map(
      (t1: any) => ({ ...t1, ...this.arrsesion.find((t2: { idUser: any; }) => t2.idUser === t1.idUser) }))
      anticipoListData=anticipoListData.filter((x: any) => x.idReporteGastos === null);
    anticipoListData.map((t1: any) => {
      t1.tipo = !t1.idMoneda ? '' : t1.moneda = this.MonedaL.filter((mon: any) => mon.id == t1.idMoneda)[0].clave;
      t1.descripcion = !t1.idUsoFondos ? '' : this.TipoSol.filter((tipo: any) => tipo.id == t1.idUsoFondos)[0].descripcion;
      t1.fechaFin = t1.fechaFin == '1969-12-31' ? '' : moment(new Date(t1.fechaFin)).format("YYYY-MM-DD");
      t1.fechaIni = t1.fechaIni == '1969-12-31' ? '' : moment(new Date(t1.fechaIni)).format("YYYY-MM-DD");
      t1.diasDura = moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days') <= 0 ? 1 : moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days') + 1;
      t1.excluded = false;
      t1.montoP=t1.estatus=="Pagado"?t1.monto:t1.montoPagado;
    });

    console.log("----ANT ---",anticipoListData)
    this.anticipoList = new MatTableDataSource(anticipoListData);
    this.anticipoList.paginator = this.paginator!;
    this.anticipoList.sort = this.sort;
    const sortState: Sort = { active: 'createdAt', direction: 'desc' };
    this.sort.active = sortState.active;
    this.sort.direction = sortState.direction;
    this.sort.sortChange.emit(sortState);
  }
  /**
   * @function
   * @name isAllSelected
   * Si el número de elementos seleccionados coincide con el número total de filas  
   * @returns  {Boolean} true false
   */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.anticipoList.data.length;
    return numSelected === numRows;
  }
  /**
   * @function
   * @name masterToggle
   * @param dataSource
   * Selecciona todas las filas si no están todas seleccionadas, de lo contrario borra la selección. 
   * @returns {Array.<string>} Regresa un nuevo arreglo con lo seleccionado
   */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.anticipoList.data.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    if (this.selection.isSelected(row) == true) {
      this.anticipoList.data.map((ant: any) => { ant.excluded = true; });
      row.excluded = false;
    }
    if (this.selection.selected.length === 0) { row.excluded = false; }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  showOptions(event: MatCheckboxChange, arr: any): void {
    let Seleccion = this.selection.selected.length === 1 ? '1' : '0';
  }

  filter(filterValue: string) {
    this.anticipoList.filter = filterValue.trim().toLowerCase();
  }

  doAction() {
    this.dialogRefs.close({ event: this.action, data: this.local_data, anticipo: this.selection.selected });
  }

  closeDialog() {
    this.dialogRefs.close({ event: 'Cancel' });
  }
  public getDatos(idempresa: any): Observable<any> {
    let monedas = this.http.get<any>(`${APIAdmin}catalogo/?catalogo=monedas`, { headers: headers });
    let tipoSolicitud = this.http.get<any>(`${APIAdmin}catalogo/?catalogo=tipoSolicitud`, { headers: headers });
    return forkJoin([monedas, tipoSolicitud]);
  }

  public getUsuario(id: any, idempresa: any): Observable<any> {
    let usuario = this.http.get<any>(API + 'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1=' + encodeURIComponent('idOcupantePuesto=' + id + ' and idEmpresas=' + idempresa), { headers: headers });
    return forkJoin([usuario]);
  }
}
/**
 * componente  para listar y editar los anticipos 
 */

@Component({
  selector: 'lista_gastos',
  templateUrl: 'lista_gastos.html',
  styleUrls: ['lista_gastos.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
/** El nombre del modulo ListaGastoEditDialog */

export class ListaGastoEditDialog {
  GastosList: MatTableDataSource<any>;
  subscription!: Subscription;
  selection = new SelectionModel<any>(true, []);
  searchText: any;
  local_data: any;
  action: string;
  message: any;
  arrsesion: any;
  TipoSol: any;
  MonedaL: any;
  CentroCosto: any;
  Tipogasto: any;
  datSess: any ;
  TipoComprobante: any;
  ArrSelGst: Provider[] = [];
  displayedColumns: string[] = ['select', 'vista', 'id', 'TipoComprobante', 'createdAt', 'fechaEmision', 'tipodegasto', 'estatus', 'subtotal', 'total', 'idMoneda'];
  detalleColumns: string[] = ['descripcion', 'cantidad', 'unidadMedida', 'tasaIva', 'montoIva', 'precioUnitario', 'descuento', 'importe', 'montoAprobado'];

  isTableExpanded: boolean = false;

  @ViewChild(MatSort) sort: MatSort = Object.create(null);
  @ViewChild(MatSort) sort2: MatSort = Object.create(null);
  @ViewChildren('innerSort') innerSort!: QueryList<MatSort>;
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator2: MatPaginator = Object.create(null);
  /**
   * Consulta catálogos y servicios.
   * 
   * 
   */
  constructor(public dialogRefG: MatDialogRef<ListaGastoEditDialog>,
    private servicios: serviciosService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    @Optional() @Inject(MAT_DIALOG_DATA) public LstAnt: any,
    private http: HttpClient,
    private token: TokenService) {
    this.datSess = token.readToken('id', '')
    this.datSess = this.datSess.split(',');
    this.local_data = { ...data };
    this.action = this.local_data.action;
    this.arrsesion = JSON.parse(window.sessionStorage.getItem("persona")!);
    this.GastosList = new MatTableDataSource();
    //this.servicios.getUnParametro('catalogos', '?catalogo=gastos&filtro1=' + encodeURIComponent(`idEmpresa=${datSess[1]} and idUser=${datSess[0]} and estatus='Por Aprobar' `))    
    this.servicios.getUnParametro('gastos', '?noAsociado=1?idEmpresa=' + this.datSess[1])
      .pipe(
        catchError(err => { this.GastosList = new MatTableDataSource(); return throwError(err); })
      ).subscribe(
        (resGasto: any) => {
          let resGas=resGasto;
          console.log('resGas', resGas, resGas[0].idUser);          
 
          resGas = resGasto.filter((r1:any) => r1.idTipoComprobante==1 ?
                r1.idReportesGastos==null && r1.idTipoGasto>0 && Number(r1.subtotal) > 0 &&  r1.rutaArchivo!=null && r1.rutaXml!=null && r1.rutaXml!='' && r1.rutaArchivo!='':
                r1.idReportesGastos==null && r1.idTipoGasto>0 && Number(r1.subtotal) > 0 &&  r1.rutaArchivo!=null && r1.rutaArchivo!=''
          );

          if(resGas.length > 0){
          this.getUsuario(resGas[0].idUser, this.datSess[1]).subscribe(rsUs => {
              this.arrsesion = rsUs[0];
              this.arrsesion.map((t1: any) => { t1.NombreCompleto = `${t1.nombre} ${t1.apellidoPaterno} ${t1.apellidoMaterno}`; t1.idUser = t1.idOcupantePuesto; t1.idEmpresa = Number(this.datSess[1]); });
              this.getDatos(this.datSess[1], this.arrsesion[0].idEstructura).subscribe(resp => {
                this.MonedaL = resp[0];
                this.TipoSol = resp[1];
                this.CentroCosto = resp[2];
                this.Tipogasto = resp[3];
                this.TipoComprobante = tipocomprobantes;
                this.Inicio(resGas);
              });
            });
          } else{
            this.Inicio(resGas);
          }
          

        }, (err: any) => { },
      );
  }
  /**
   * @function
   * @name Inicio 
   * Metodo que inicia el consumo del servicio para gastos
   * @param {string} gastos 
   * @returns {Array.<string>} Regresa el servicio gastos consultado correspondiente al idUser
   */
  Inicio(res: any) {
    let providers: Provider[] = [];
    let providersNo: Provider[] = [];
    let gsatosListData:any=[]; 
    let GastosOrig = res.map((t1: any) => ({ ...t1, ...this.arrsesion.find((t2: any) => t2.idUser === t1.idUser), }) );
    GastosOrig.forEach((gst:any) =>{       
      if(gst.estatus==="Nuevo"){
        if(gst.idMoneda=='MXN'){
          if(gst.idUser ==this.datSess[0]){
            gsatosListData.push(gst);
          }          
        }else{
          if(gst.idUser ==this.datSess[0]){
            gst.tipoCambio=gst.tipoCambio?gst.tipoCambio:0;
            if(gst.tipoCambio>0){
              gsatosListData.push(gst);
            }           
          }
        }
      }
    }); 
    console.log('gsatosListData 2 ', GastosOrig);
    
    gsatosListData.map((t1: any, i: any) => {
      t1.isExpanded = false;
      t1.detalle = [];
      console.log('t1',t1);
      t1.TipoComprobante = t1.idTipoComprobante == 0 ? 'Pendiente' : this.TipoComprobante.filter((tc: any) => tc.id == t1.idTipoComprobante)[0].tipo;
      if (t1.TipoComprobante == 'Pendiente') { t1.importetotal = 0; t1.subtotal = 0; t1.idMoneda = 'MXN'; t1.tipodegasto = 'Pendiente'; t1.moneda = this.MonedaL.filter((mon: any) => mon.clave == t1.idMoneda)[0].clave; }
      //else{t1.tipodegasto= t1.idTipoGasto===0?'':this.Tipogasto.filter((tp:any) => tp.id == t1.idTipoGasto)[0].nombreGasto;}           
      else { t1.tipodegasto = t1.idTipoGasto === 0 ? '' : this.Tipogasto.filter((tp: any) => tp.id == t1.idTipoGasto)[0].nombreGasto; t1.moneda = t1.moneda ? this.MonedaL.filter((mon: any) => mon.clave == t1.idMoneda)[0].clave : 'MXN'; }
      if (t1.idReportesGastos === null) {
        switch (t1.idTipoComprobante) {
          case 1:
            if (t1.rutaXml != null) {
              providers.push(t1.id);
            }
            break;
          case 2:
            if (t1.rutaArchivo != null) {
              providersNo.push(t1.id);
            }
            break;
        }
      } else { }      
      
      if(t1.idTipoComprobante==1){
        if(t1.idMoneda!='MXN'){
          t1.subtotal=t1.subtotal * t1.tipoCambio;
          t1.total=t1.total * t1.tipoCambio;
         }   
       } 
    });

    console.log('gsatosListData 3 ', gsatosListData);

     console.log("provider",providers);
     console.log("providersNo",providersNo);
    if (providers.length > 0) {
      forkJoin(
        providers.map(c =>
          this.servicios.getUnParametro('gastos', `${c}/comprobante`)
        )).subscribe((c: Provider[][]) => {
          // console.log("------------------------------------------");
          // console.log(c);
          gsatosListData.map((x: any) => { let valcomp = 0; c.map((e: any) => { if (e.idGastos === x.id) { valcomp = e.id }; }); x.idComprobante = valcomp; });
          forkJoin(
            providers.map(p =>
              this.servicios.getUnParametro('gastos', `${p}/comprobantedetalle`)
            )).subscribe((p: Provider[][]) => {
              // console.log(p)
              // console.log('length', providersNo.length);
              if (providersNo.length > 0) {
                forkJoin(
                  providersNo.map(n =>
                    this.servicios.getUnParametro('gastosnofiscales', `?idGasto=${n}`)
                  )).subscribe((n: Provider[][]) => {
                    if (p.length > 0) {
                      gsatosListData.map((gt: any) => {
                        if (gt.idTipoComprobante === 1) {
                          p.map((comp: any) => {
                            comp.forEach((dt: any) => { if (dt.idGastosComprobantes === gt.idComprobante) { dt.idMoneda = gt.idMoneda; gt.detalle.push(dt) } });
                          });
                        } else {
                          n.map((sinc: any) => {
                            sinc.forEach((nof: any) => { if (nof.idGastos === gt.id) { gt.detalle.push({ descripcion: nof.concepto, importe: nof.importeTotal, idMoneda: gt.idMoneda }) } });
                          });
                        }
                        gt.detalle = new MatTableDataSource(gt.detalle);
                        //gt.detalle.paginator = this.paginator2!;
                        //gt.detalle.sort = this.sort2;
                      });
                      console.log('A', gsatosListData)
                    } else {
                      gsatosListData.map((gt: any) => {
                        if (gt.idTipoComprobante === 1) {
                          p.map((comp: any) => {
                            comp.forEach((dt: any) => { if (dt.idGastosComprobantes === gt.idComprobante) { dt.idMoneda = gt.idMoneda; gt.detalle.push(dt) } });
                          });
                        }
                        gt.detalle = new MatTableDataSource(gt.detalle);
                        //gt.detalle.paginator = this.paginator2!;
                        //gt.detalle.sort = this.sort2;
                      });
                      //console.log('B', gsatosListData)
                    }
                    //console.log('gsatosListData - 2-', gsatosListData);
                    this.GastosList = new MatTableDataSource(gsatosListData);
                    this.GastosList.paginator = this.paginator!;
                    this.GastosList.sort = this.sort;
                    const sortState: Sort = { active: 'createdAt', direction: 'desc' };
                    this.sort.active = sortState.active;
                    this.sort.direction = sortState.direction;
                    this.sort.sortChange.emit(sortState);
                  }), (err: any) => { console.log(err); };
              } else {
                //console.log('ENTRA');
                if (p.length > 0) {
                  gsatosListData.map((gt: any) => {
                    if (gt.idTipoComprobante === 1) {
                      p.map((comp: any) => {
                        comp.forEach((dt: any) => { if (dt.idGastosComprobantes === gt.idComprobante) { dt.idMoneda = gt.idMoneda; gt.detalle.push(dt) } });
                      });
                    }
                    gt.detalle = new MatTableDataSource(gt.detalle);
                    //gt.detalle.paginator = this.paginator2!;
                    //gt.detalle.sort = this.sort2;
                  });
                  //console.log('A', gsatosListData)
                } else {
                  gsatosListData.map((gt: any) => {
                    if (gt.idTipoComprobante === 1) {
                      p.map((comp: any) => {
                        comp.forEach((dt: any) => { if (dt.idGastosComprobantes === gt.idComprobante) { dt.idMoneda = gt.idMoneda; gt.detalle.push(dt) } });
                      });
                    }
                    gt.detalle = new MatTableDataSource(gt.detalle);
                    //gt.detalle.paginator = this.paginator2!;
                    //gt.detalle.sort = this.sort2;
                  });
                  //console.log('B', gsatosListData)
                }
                //console.log('gsatosListData - 2-', gsatosListData);
                this.GastosList = new MatTableDataSource(gsatosListData);
                this.GastosList.paginator = this.paginator!;
                this.GastosList.sort = this.sort;
                const sortState: Sort = { active: 'createdAt', direction: 'desc' };
                this.sort.active = sortState.active;
                this.sort.direction = sortState.direction;
                this.sort.sortChange.emit(sortState);
                /*
                forkJoin(
                  providersNo.map(n =>
                    this.servicios.getUnParametro('gastosnofiscales', `?idGasto=${n}`)   
                  )).subscribe((n: Provider[][]) => {
                    if(p.length>0){
                     console.log('ENTRA - 2');
                        gsatosListData.map((gt: any) =>{  
                          if(gt.idTipoComprobante===1){
                            p.map((comp:any) => { 
                              comp.forEach((dt:any) => {if(dt.idGastosComprobantes=== gt.idComprobante){ dt.idMoneda=gt.idMoneda;  gt.detalle.push(dt)} });
                            });
                          } 
                          gt.detalle=new MatTableDataSource(gt.detalle);
                          //gt.detalle.paginator = this.paginator2!;
                          //gt.detalle.sort = this.sort2;
                        }); 
                    }          
                    console.log(gsatosListData);
                    this.GastosList = new MatTableDataSource(gsatosListData);
                    this.GastosList.paginator = this.paginator!;
                    this.GastosList.sort = this.sort;
                    const sortState: Sort = {active: 'createdAt', direction: 'desc'};
                    this.sort.active = sortState.active;
                    this.sort.direction = sortState.direction;
                    this.sort.sortChange.emit(sortState);  
                  }),(err:any) => { console.log(err); }; 
                  //*/
              }
            }), (err: any) => { console.log(err); };
        });
    } else {
      if (providersNo.length > 0) {
        forkJoin(
          providersNo.map(n =>
            this.servicios.getUnParametro('gastosnofiscales', `?idGasto=${n}`)
          )).subscribe((n: Provider[][]) => {
            gsatosListData.map((gt: any) => {
              n.map((sinc: any) => {
                sinc.forEach((nof: any) => { if (nof.idGastos === gt.id) { gt.detalle.push({ descripcion: nof.concepto, importe: nof.importeTotal, idMoneda: gt.idMoneda }) } });
              });
              gt.detalle = new MatTableDataSource(gt.detalle);
            });
            console.log(gsatosListData);
            this.GastosList = new MatTableDataSource(gsatosListData);
            this.GastosList.paginator = this.paginator!;
            this.GastosList.sort = this.sort;
            const sortState: Sort = { active: 'createdAt', direction: 'desc' };
            this.sort.active = sortState.active;
            this.sort.direction = sortState.direction;
            this.sort.sortChange.emit(sortState);
          }), (err: any) => { console.log(err); };
      }
    }


  }

  toggleTableRows() {
    this.isTableExpanded = !this.isTableExpanded;
    this.GastosList.data.forEach((row: any) => {
      row.isExpanded = this.isTableExpanded;
    })
  }
  /**
   * @function
   * @name isAllSelected
   * Si el número de elementos seleccionados coincide con el número total de filas  
   * @returns  {Boolean} true false
   */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.GastosList.data.length;
    return numSelected === numRows;
  }
  /**
   * @function
   * @name masterToggle
   * @param dataSource
   * Selecciona todas las filas si no están todas seleccionadas, de lo contrario borra la selección. 
   * @returns {Array.<string>} Regresa un nuevo arreglo con lo seleccionado
   */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.GastosList.data.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  showOptions(event: MatCheckboxChange, arr: any): void {
    let provider: Provider[] = [];
    this.ArrSelGst = provider;
    this.selection.selected.map((row: any) => {
      this.ArrSelGst.push(row.id);
    })
    console.log(this.selection.selected);
  }

  filter(filterValue: string) {
    this.GastosList.filter = filterValue.trim().toLowerCase();
  }

  doAction() {
    this.dialogRefG.close({ event: this.action, data: this.local_data, gastos: this.ArrSelGst });
  }

  closeDialog() {
    this.dialogRefG.close({ event: 'Cancel' });
  }


  public getDatos(idempresa: any, idCC: any): Observable<any> {
    let monedas = this.http.get<any>(`${APIAdmin}catalogo/?catalogo=monedas`, { headers: headers });
    let tipoSolicitud = this.http.get<any>(`${APIAdmin}catalogo/?catalogo=tipoSolicitud`, { headers: headers });
    let centrosCostos = this.http.get<any>(API + 'catalogos/?catalogo=vwCentrosCostos&filtro1=' + encodeURIComponent('idEstructura=' + idCC + ' and idEmpresas=' + idempresa), { headers: headers });
    let tipoGastos = this.http.get<any>(`${APIAdmin}catalogo/?catalogo=tipoGastos&filtro1=idEmpresas=${idempresa}`, { headers: headers });
    return forkJoin([monedas, tipoSolicitud, centrosCostos, tipoGastos]);
  }

  public getUsuario(id: any, idempresa: any): Observable<any> {
    let usuario = this.http.get<any>(API + 'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1=' + encodeURIComponent('idOcupantePuesto=' + id + ' and idEmpresas=' + idempresa), { headers: headers });
    return forkJoin([usuario]);
  }
}
/**
 * componente  para listar y editar los Reportes 
 */
@Component({
  selector: 'editar-repgastos',
  templateUrl: 'editar-repgastos.html',
})
/** El nombre del modulo EditaMontoDialogContent */

export class EditaMontoDialogContent {
  LstGst: any;
  cuenta: any;
  formasPagos: any;
  Tipogasto: any;
  EditaMonto: any;
  local_data: any;
  searchText: any;
  arrsesion: any;
  //dataSource = new MatTableDataSource(this.LstGst);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  /**
   * Consulta catálogos y servicios.
   */
  constructor(public dialogRefE: MatDialogRef<EditaMontoDialogContent>,
    //public editaService: any,
    private dialogService: DialogService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    @Optional() @Inject(MAT_DIALOG_DATA) public edita: any,
    private http: HttpClient,
    private token: TokenService) {
    let datSess: any = token.readToken('id', '')
    datSess = datSess.split(',');
    this.cuenta = JSON.parse(window.sessionStorage.getItem("cuenta")!);
    this.getUsuario(datSess[0], datSess[1]).subscribe(rsUs => {
      this.arrsesion = rsUs[0];
      this.arrsesion.map((t1: any) => { t1.NombreCompleto = `${t1.nombre} ${t1.apellidoPaterno} ${t1.apellidoMaterno}`; t1.idUser = t1.idOcupantePuesto; t1.idEmpresa = Number(datSess[1]); });
      this.getDatos(datSess[1], this.arrsesion[0].idEstructura).subscribe(resp => {
        this.Tipogasto = resp[0];
        this.formasPagos = resp[1];
        this.EditaMonto = { ...data };
        [this.EditaMonto].map((em: any) => { em.PrSrvVal = em.valido == 0 ? 'SI' : 'NO' });
        console.log(this.EditaMonto);
      });
    });
  }
  /**
   * @function
   * @name cambiaTipoG 
   * Metodo que habilita por cambio de Tipo de Producto 
   */
  cambiaTipoG(evento: any, arr: any) {
    this.EditaMonto.idTipoGasto = evento.value;
  }
  /**
   * @function
   * @name cambiaCuenta 
   * Metodo que habilita por cambio de cuenta
   */
  cambiaCuenta(evento: any, arr: any) {
    this.EditaMonto.ctaPago = evento.value;
  }

  /**
   * @function
   * @name aceptarDialog  
   * Metodo que guarda los inputs en el arreglo guardar, para subirlos a la base
   * @returns {Array.<string>} guardar Regresa un Array con valores
   */
  aceptarDialog() {
    this.dialogService.openConfirmDialog('¿ Esta seguro que desea guardar los cambios ?')
      .afterClosed().subscribe(res => {
        console.log(res);
        if (res) {
          //this.editaService.updateEditaMonto(this.EditaMonto.Idcomp, this.EditaMonto);
          this.dialogRefE.close({ detalle: this.EditaMonto });
        }
      });
  }
  /**
   * @function
   * @name cerrarDialog  
   * Metodo que reedirecciona a paginas switcheadas dependiendo de su origen
   * @returns {boolean} Regresa un true o un false
   */
  cerrarDialog() {
    this.dialogService.openConfirmDialog('¿ Esta seguro que desea salir sin guardar los cambios ?')
      .afterClosed().subscribe(res => {
        console.log(res);
        if (res) {
          this.dialogRefE.close({ event: 'Cancel' });
        }
      });
  }

  numerico(valor: any) {
    return numberFormat2.format(valor)
 }

  public getDatos(idempresa: any, idCC: any): Observable<any> {
    let tipoGastos = this.http.get<any>(`${APIAdmin}catalogo/?catalogo=tipoGastos&filtro1=idEmpresas=${idempresa}`, { headers: headers });
    let formasPagos = this.http.get<any>(`${APIAdmin}catalogo/?catalogo=formasPago`, { headers: headers });
    return forkJoin([tipoGastos, formasPagos]);
  }

  public getUsuario(id: any, idempresa: any): Observable<any> {
    let usuario = this.http.get<any>(API + 'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1=' + encodeURIComponent('idOcupantePuesto=' + id + ' and idEmpresas=' + idempresa), { headers: headers });
    return forkJoin([usuario]);
  }
}
/**
 * componente  para listar y editar los comprobantes 
 */
@Component({
  selector: 'editar-comprobante',
  templateUrl: 'editar-comprobante.html',
  providers: [{provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},{provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}],
})
/** El nombre del modulo EditaGastoDialog */

export class EditaGastoDialog {
  LstGst: any;
  cuenta: any;
  formasPagos: any;
  Tipogasto: any;
  EditaMonto: any;
  searchText: any;
  AprobRech: any;
  rechazar: any;
  FechaI: any;
  arrsesion: any;
  blockInput: boolean = false;
  blockAprob: boolean = false;
  //dataSource = new MatTableDataSource(this.LstGst);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  /**
   * Consulta catálogos y servicios.
   * 
   * 
   */
  constructor(public dialogRefE: MatDialogRef<EditaGastoDialog>,
    //public editaService: any,
    private dialogService: DialogService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private mensajes: MensajesService,
    private http: HttpClient,
    private token: TokenService) {
    let datSess: any = token.readToken('id', '')
    datSess = datSess.split(',');
    
    this.EditaMonto = { ...data };
    console.log('this.EditaMonto ', [this.EditaMonto]);
    this.FechaI = moment(new Date(this.EditaMonto.createdAt)).add(2, 'days').format("YYYY-MM-DD");
    [this.EditaMonto].map((em: any) => { em.PrSrvVal = em.valido == 1 ? 'SI' : 'NO' });
    this.EditaMonto.montopreAprobado = this.EditaMonto.total;   
    
    // if(this.EditaMonto.estatus === "Nuevo"  && this.EditaMonto.valido === 1){
    //   this.blockInput = false;
    // } else{
    //   this.blockInput = true;
    // }
    console.log(this.EditaMonto);
    this.getUsuario(this.EditaMonto.idUser, datSess[1]).subscribe(rsUs => {
      this.arrsesion = rsUs[0];
      this.arrsesion.map((t1: any) => { t1.NombreCompleto = `${t1.nombre} ${t1.apellidoPaterno} ${t1.apellidoMaterno}`; t1.idUser = t1.idOcupantePuesto; t1.idEmpresa = Number(datSess[1]); });
      console.log(this.arrsesion, datSess[0])
      if(Number(this.EditaMonto.idUser) == Number(datSess[0])){
        this.blockAprob = true;
      } else{
        this.blockInput =this.EditaMonto.EstReport==="Nuevo"?false:true;
      }

      this.getDatos(datSess[1],this.EditaMonto.idUser).subscribe(resp => {
        this.Tipogasto = resp[0];
        this.formasPagos = resp[1];
        this.cuenta = resp[2]; 
      });
    });
  }

  /**
   * @function
   * @name cambiaFcha 
   * Metodo que habilita por cambio de Tipo de Fecha 
   */
  cambiaFcha(event: any, arr: any) {
    this.EditaMonto.fechaIni = new Date(event.value);
  }
  /**
   * @function
   * @name cambiaTipoG 
   * Metodo que habilita por cambio de Tipo de Producto 
   */
  cambiaTipoG(evento: any, arr: any) {
    this.EditaMonto.idTipoGasto = evento.value;
  }
  /**
   * @function
   * @name cambiaCuenta 
   * Metodo que habilita por cambio de Tipo de Cuenta 
   */
  cambiaCuenta(evento: any, arr: any) {
    this.EditaMonto.idCuenta = evento.value;
  }
  /**
   * @function
   * @name cambiaFormaP 
   * Metodo que habilita por cambio de Tipo de Forma de Pago 
   */
  cambiaFormaP(evento: any, arr: any) {
    this.EditaMonto.idFormasPago = evento.value;
  }

  AprobRechz(val: number) {
    this.AprobRech = val;
  }
  /**
   * @function
   * @name aceptarDialog  
   * Metodo que guarda los inputs en el arreglo guardar, para subirlos a la base
   * @returns {Array.<string>} guardar Regresa un Array con valores
   */
  aceptarDialog(val: number) {

    console.log('this.EditaMonto',this.EditaMonto);
    if(this.EditaMonto.montopreAprobado=='' || this.EditaMonto.montopreAprobado==null){this.mensajes.mensaje('Asignar un monto para aprobar.', '', 'danger'); return; } 
    if(this.EditaMonto.idFormasPago==0 || this.EditaMonto.idFormasPago==null){if(this.EditaMonto.idFormasPago != 1){this.mensajes.mensaje('Debe seleccionar una forma de pago.', '', 'danger'); return;} }
    if(this.EditaMonto.idCuenta==0 || this.EditaMonto.idCuenta==null){this.mensajes.mensaje('Debe seleccionar una cuenta de pago.', '', 'danger'); return; }  
    if(this.EditaMonto.fechaGasto=='' || this.EditaMonto.fechaGasto==null){this.mensajes.mensaje('Debe seleccionar la fecha del gasto.', '', 'danger'); return; }  

    this.dialogService.openConfirmDialog('¿ Esta seguro que desea guardar los cambios ?')
      .afterClosed().subscribe(res => {
        console.log(res);
        if (res) {
          this.AprobRech = val;
          this.EditaMonto.montoAprobado=this.EditaMonto.montopreAprobado == this.EditaMonto.total?this.EditaMonto.total:this.EditaMonto.montopreAprobado;
          this.EditaMonto.automatico =this.EditaMonto.montopreAprobado == this.EditaMonto.total?1:0;
          this.dialogRefE.close({ detalle: this.EditaMonto, aprobRechz: this.AprobRech });
        }
      });
  }
  /**
   * @function
   * @name cerrarDialog  
   * Metodo que reedirecciona a paginas switcheadas dependiendo de su origen
   * @returns {boolean} Regresa un true o un false
   */
  cerrarDialog() {
    this.dialogService.openConfirmDialog('¿ Esta seguro que desea salir sin guardar los cambios ?')
      .afterClosed().subscribe(res => {
        console.log(res);
        if (res) {
          this.dialogRefE.close({ event: 'Cancel' });
        }
      });
  }

  public getDatos(idempresa: any, usuario: any): Observable<any> {
    let tipoGastos = this.http.get<any>(`${APIAdmin}catalogo/?catalogo=tipoGastos&filtro1=idEmpresas=${idempresa}`, { headers: headers });
    let formasPagos = this.http.get<any>(`${APIAdmin}catalogo/?catalogo=formasPago`, { headers: headers });
    let cuentas = this.http.get<any>(API + 'catalogos/?catalogo=vwDatosBancarios&filtro1=' + encodeURIComponent('id=' + usuario), { headers: headers });
    return forkJoin([tipoGastos, formasPagos, cuentas]);
  }

  public getUsuario(id: any, idempresa: any): Observable<any> {
    let usuario = this.http.get<any>(API + 'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1=' + encodeURIComponent('idOcupantePuesto=' + id + ' and idEmpresas=' + idempresa), { headers: headers });
    return forkJoin([usuario]);
  }
}
/**
 * componente  para listar y editar los Devoluciones 
 */
@Component({
  selector: 'devol-gasto-content',
  templateUrl: 'devol-gasto-content.html',
})
/** El nombre del modulo DevolRepoDialog */

export class DevolRepoDialog {

  Devolucion: any;
  reporte: any;
  arrsesion: any;
  workInicial: any;
  Empresas: any;
  CentroCosto: any;
  fechaReg: any;
  workOrigen: any;
  workFGral:any;
  idWorkflow: any;
  devolucionArr: any;
  bloqueo: boolean = true;
  btnGda: string = '1';
  Historial: any;
  tipo: string = 'POST';
  origen: number = 0;
  id: any;
  idRol: any;
  datSess: any;
  histColumns: string[] = ['fechaRegistro', 'idUser', 'evento', 'estatus', 'comentarios'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatSort) sort: MatSort = Object.create(null);
  searchText: any;
  displayedCol: string[] = ['select', 'id', 'descripcion'];
  dataSource = new MatTableDataSource();
  selection = new SelectionModel<any>(true, []);
  /**
   * Consulta catálogos y servicios.
   */
  constructor(public dialogRefV: MatDialogRef<DevolRepoDialog>,
    private dialogService: DialogService,
    private servicios: serviciosService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private token: TokenService) {
    this.datSess = token.readToken('id', '')
    this.datSess = this.datSess.split(',');
    this.idRol = token.readToken('rlsRol', 'GASTOS');
    this.Devolucion = { ...data };
    this.devolucionArr = { estatus: null };
    this.reporte = { idCentroCostos: 0, idCentrosCostos: 0, idEmpresa: 0, idEmpresas: 0 };
    this.getUsuario(this.datSess[0], this.datSess[1]).subscribe(rsUs => {
      this.arrsesion = rsUs[0];
      this.arrsesion.map((t1: any) => { t1.NombreCompleto = `${t1.nombre} ${t1.apellidoPaterno} ${t1.apellidoMaterno}`; t1.idUser = t1.idOcupantePuesto; t1.idRoles = this.idRol; });
      this.getDatos(this.datSess[1], this.arrsesion[0].idEstructura).subscribe(resp => {
        this.CentroCosto = resp[0];
        this.Empresas = resp[1];
        this.servicios.getUnParametro('catalogos', '?catalogo=workflows&filtro1=' + encodeURIComponent('idEmpresa=' + this.datSess[1]))
          .pipe().subscribe((res: any) => {
            this.workInicial = res;
            this.workInicial.map((t1: any) => { t1.evento = JSON.parse(t1.evento) });
            this.workFGral=this.workInicial;
            this.reporte = [this.Devolucion.reporte].map((t1: any) => ({ ...t1, ...this.arrsesion.find((t2: any) => t2.idUser === t1.idUser) }))
            this.reporte.map((t1: any) => { t1.fechaReg = new Date(Date.now()) });
            this.reporte = this.reporte[0];
            console.log('this.reporte', this.reporte);
            this.servicios.getUnParametro('devoluciones/reporte', this.reporte.id)
              .pipe(catchError(err => { return throwError(err); })
              ).subscribe((ree: any) => {
                console.log(ree);
                if (ree.length > 0) {
                  this.devolucionArr = ree[0];
                  this.devolucionArr.monto = this.Devolucion.devoMontoAutorizado;
                  this.origen = 1;
                  this.Historia();
                } else {
                  this.devolucionArr = {
                    idEmpresa: Number(this.reporte.idEmpresa),
                    idCentrosCostos: Number(this.reporte.idCentrosCostos),
                    idUser: Number(this.reporte.idUser),
                    idReportesGastos: this.reporte.id,
                    idAnticiposFondos: this.reporte.idAnticipoFondos,
                    concepto: '',
                    monto: this.Devolucion.devoMontoAutorizado,
                    idMoneda: this.Devolucion.idMoneda,
                    comprobante: '',
                    observaciones: '',
                    validado: true,
                    estatus: 'Nuevo',
                  };
                }
                console.log(this.devolucionArr);

                this.workOrigen = this.devolucionArr.estatus;
                // this.idWorkflow=this.workInicial.filter((dato:any) => dato.nombreObjeto=="Pagos de Anticipos y reembolsos" && this.arrsesion[0].nombreRol==dato.nombreRol &&  dato.evento.some((o2:any) => o2.siguienteEstatus === res.estatus));
                this.idWorkflow = this.workInicial.filter((dato: any) => dato.nombreObjeto == "Pagos de Anticipos y reembolsos");//&& this.arrsesion[0].nombreRol==dato.nombreRol
                this.idWorkflow = this.idWorkflow[0].id;
                this.workInicial = this.workInicial.filter((dato: any) => dato.estatusActual == this.devolucionArr.estatus && dato.nombreObjeto == "Pagos de Anticipos y reembolsos")
                this.workInicial = this.workInicial[0].evento;
                console.log('id', this.idWorkflow);
                console.log('Ini', this.workInicial);
              },
                (err: any) => { },
                () => { console.log('Termino'); });

          });
      });
    });
  }
  /**
   * @function
   * @name Historia 
   * Metodo  que consulta el servicio, para obtener el hisorial
   * @param {string} devoluciones 
   * @returns Regresa el arreglo Historial para devoluciones consultando el servicio correspondiente
   */
  Historia() {
    this.servicios.getUnParametro('devoluciones', `${this.devolucionArr.id}/historial`)
      .pipe(catchError(err => { return throwError(err); })
      ).subscribe((hist: any) => {
        hist.map((h:any)=>{ h.fechaRegistro=moment(h.fechaRegistro).format('YYYY-MM-DD HH:mm:ss') })
        hist.length > 0 ? this.Historial = new MatTableDataSource(hist) : this.Historial = new MatTableDataSource();
        this.Historial.paginator = this.paginator;
        this.Historial.sort = this.sort;
      }, () => { }
      );
  }

  cambiaWork(evento: any, arr: any) {
    this.dialogService.openConfirmDialog('  ¿Esta seguro que desea cambiar al estatus ' + (evento.source.selected as MatOption).viewValue + '?')
      .afterClosed().subscribe(res => {
        let Workflow = this.workFGral;
        console.log(arr);
        console.log(evento.source.value);

        if (res) {
          let envEstatus = { estatus: arr.estatus }
          this.idWorkflow = Workflow.filter((dato: any) => dato.nombreObjeto == "Pagos de Anticipos y reembolsos" && dato.evento.some((o2: any) => o2.siguienteEstatus === evento.source.value));
          console.log(this.idWorkflow);
          /*
          this.servicios.patchDatos(`reportes/${this.devolucionArr.id}?idWorkflow=${this.idWorkflow}`, envEstatus)
            .pipe(catchError(err => {console.log("ERROR"); return throwError(err);}))
            .subscribe((res:any) => {
                console.log(res);
                this.devolucionArr.estatus=arr.estatus;
                this.bloqueo=this.devolucionArr.estatus=='Por Aprobar'?false:true;
              },
              (err:any) => {  },
              () => {console.log('Termino'); }
            );//*/

        } else {
          this.devolucionArr.estatus = this.workOrigen;
        }
      });
  }
  /**
   * @function
   * @name aceptarDialog  
   * Metodo que guarda los inputs en el arreglo guardar, para subirlos a la base
   * @returns {Array.<string>} guardar Regresa un Array con valores
   */
  aceptarDialog() {
    let texto = '';
    this.origen === 1 ? texto = 'actualizar la' : texto = 'generar una';
    this.dialogService.openConfirmDialog(`¿ Esta seguro que desea ${texto} solicitud de devolución ?`)
      .afterClosed().subscribe(res => {
        console.log(res);
        if (res) {
          this.dialogRefV.close({ devolucion: this.devolucionArr, origen: this.origen });
        }
      });
  }
  /**
   * @function
   * @name cerrarDialog  
   * Metodo que reedirecciona a paginas switcheadas dependiendo de su origen
   * @returns {boolean} Regresa un true o un false
   */
  cerrarDialog() {
    this.dialogService.openConfirmDialog('¿ Esta seguro que desea salir de la pantalla ?')
      .afterClosed().subscribe(res => {
        if (res) {
          this.dialogRefV.close({ event: 'Cancel' });
        }
      });
  }
  public getDatos(idempresa: any, idCC: any): Observable<any> {
    let centrosCostos = this.http.get<any>(API + 'catalogos/?catalogo=vwCentrosCostos&filtro1=' + encodeURIComponent('idEstructura=' + idCC + ' and idEmpresas=' + idempresa), { headers: headers });
    let empresas = this.http.get<any>(APIAdmin + 'catalogo/?catalogo=empresas&filtro1=' + encodeURIComponent('id=' + idempresa), { headers: headers });
    return forkJoin([centrosCostos, empresas]);
  }

  public getUsuario(id: any, idempresa: any): Observable<any> {
    let usuario = this.http.get<any>(API + 'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1=' + encodeURIComponent('idOcupantePuesto=' + id + ' and idEmpresas=' + idempresa), { headers: headers });
    return forkJoin([usuario]);
  }
}
/**
 * componente  para listar y editar los reembolsos gastos
 */
@Component({
  selector: 'reemb-gasto-content',
  templateUrl: 'reemb-gasto-content.html',
})
/** El nombre del modulo ReembRepoDialog */

export class ReembRepoDialog {

  Reembolso: any;
  reporte: any;
  arrsesion: any;
  workInicial: any;
  Empresas: any;
  CentroCosto: any;
  fechaReg: any;
  workOrigen: any;
  idWorkflow: any;
  reembolsoArr: any;
  bloqueo: boolean = true;
  btnGda: string = '1';
  Historial: any;
  tipo: string = 'POST';
  origen: number = 0;
  id: any;
  histColumns: string[] = ['fechaRegistro', 'idUser', 'evento', 'estatus', 'comentarios'];
  idRol: any;
  datSess: any;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatSort) sort: MatSort = Object.create(null);
  searchText: any;
  displayedCol: string[] = ['select', 'id', 'descripcion'];
  dataSource = new MatTableDataSource();
  selection = new SelectionModel<any>(true, []);
  /**
   * Consulta catálogos y servicios.
   */
  constructor(public dialogRefV: MatDialogRef<ReembRepoDialog>,
    private dialogService: DialogService,
    private servicios: serviciosService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private token: TokenService) {
    this.datSess = token.readToken('id', '')
    this.datSess = this.datSess.split(',');
    this.idRol = token.readToken('rlsRol', 'GASTOS');
    this.Reembolso = { ...data };
    this.reembolsoArr = { estatus: null };
    this.reporte = { idCentroCostos: 0, idCentrosCostos: 0, idEmpresa: 0, idEmpresas: 0 };
    this.Historial = new MatTableDataSource();

    this.getUsuario(this.datSess[0], this.datSess[1]).subscribe(rsUs => {
      this.arrsesion = rsUs[0];
      this.arrsesion.map((t1: any) => { t1.NombreCompleto = `${t1.nombre} ${t1.apellidoPaterno} ${t1.apellidoMaterno}`; t1.idUser = t1.idOcupantePuesto; t1.idRoles = this.idRol; });
      this.getDatos(this.datSess[1], this.arrsesion[0].idEstructura).subscribe(resp => {
        this.CentroCosto = resp[0];
        this.Empresas = resp[1];
        this.servicios.getUnParametro('catalogos', '?catalogo=workflows&filtro1=' + encodeURIComponent('idEmpresa=' + this.datSess[1]))
          .pipe().subscribe((res: any) => {
            this.workInicial = res;
            this.workInicial.map((t1: any) => { t1.evento = JSON.parse(t1.evento) });
            this.reporte = [this.Reembolso.reporte].map((t1: any) => ({ ...t1, ...this.arrsesion.find((t2: any) => t2.idUser === t1.idUser) }))
            this.reporte.map((t1: any) => { t1.fechaReg = new Date(Date.now()) });
            this.reporte = this.reporte[0];
            this.servicios.getUnParametro('reembolsos/reporte', this.reporte.id)
              .pipe(catchError(err => { return throwError(err); })
              ).subscribe((ree: any) => {
                console.log(ree);
                if (ree.length > 0) {
                  this.reembolsoArr = ree[0];
                  this.reembolsoArr.monto = Number(this.Reembolso.reemMontoAutorizado).toFixed(2),
                    this.origen = 1;
                  this.Historia();
                } else {
                  this.reembolsoArr = {
                    idEmpresa: this.reporte.idEmpresa,
                    idProyecto: this.reporte.idProyecto,
                    idCentrosCostos: this.reporte.idCentrosCostos,
                    idUser: this.reporte.idUser,
                    idReportesGastos: this.reporte.id,
                    idAnticiposFondos: this.reporte.idAnticipoFondos,
                    monto: Number(this.Reembolso.reemMontoAutorizado).toFixed(2),
                    idMoneda: this.Reembolso.idMoneda == 'MXN' ? '1' : '1',
                    observaciones: '',
                    estatus: 'Nuevo',
                  };
                }
                this.workOrigen = this.reembolsoArr.estatus;
                // this.idWorkflow=this.workInicial.filter((dato:any) => dato.nombreObjeto=="Pagos de Anticipos y reembolsos" && this.arrsesion[0].nombreRol==dato.nombreRol &&  dato.evento.some((o2:any) => o2.siguienteEstatus === res.estatus));
                this.idWorkflow = this.workInicial.filter((dato: any) => dato.nombreObjeto == "Pagos de Anticipos y reembolsos");//&& this.arrsesion[0].nombreRol==dato.nombreRol
                this.idWorkflow = this.idWorkflow[0].id;
                this.workInicial = this.workInicial.filter((dato: any) => dato.estatusActual == this.reembolsoArr.estatus && dato.nombreObjeto == "Pagos de Anticipos y reembolsos")
                this.workInicial = this.workInicial[0].evento;
                console.log(this.reembolsoArr);
                console.log(this.reporte);
                console.log(this.Reembolso);
              },
                (err: any) => { },
                () => { console.log('Termino'); });
          });
      });
    });
  }
  /**
   * @function
   * @name Historia 
   * Metodo  que consulta el servicio, para obtener el hisorial
   * @param {string} devoluciones 
   * @returns Regresa el arreglo Historial para devoluciones consultando el servicio correspondiente
   */
  Historia() {
    this.servicios.getUnParametro('reembolsos', `${this.reembolsoArr.id}/historial`)
      .pipe(catchError(err => { return throwError(err); })
      ).subscribe((hist: any) => {
        hist.map((h:any)=>{ h.fechaRegistro=moment(h.fechaRegistro).format('YYYY-MM-DD HH:mm:ss') })
        hist.length > 0 ? this.Historial = new MatTableDataSource(hist) : this.Historial = new MatTableDataSource();
        this.Historial.paginator = this.paginator;
        this.Historial.sort = this.sort;
      }, () => { }
      );
  }

  cambiaWork(evento: any, arr: any) {
    this.dialogService.openConfirmDialog('  ¿Esta seguro que desea cambiar al estatus ' + (evento.source.selected as MatOption).viewValue + '?')
      .afterClosed().subscribe(res => {
        let Workflow = JSON.parse(window.sessionStorage.getItem("workflow")!);
        console.log(arr);
        console.log(evento.source.value);

        if (res) {
          let envEstatus = { estatus: arr.estatus }
          this.idWorkflow = Workflow.filter((dato: any) => dato.nombreObjeto == "Pagos de Anticipos y reembolsos" && dato.evento.some((o2: any) => o2.siguienteEstatus === evento.source.value));
          console.log(this.idWorkflow);
          /*
          this.servicios.patchDatos(`reportes/${this.reembolsoArr.id}?idWorkflow=${this.idWorkflow}`, envEstatus)
            .pipe(catchError(err => {console.log("ERROR"); return throwError(err);}))
            .subscribe((res:any) => {
                console.log(res);
                this.reembolsoArr.estatus=arr.estatus;
                this.bloqueo=this.reembolsoArr.estatus=='Por Aprobar'?false:true;
              },
              (err:any) => {  },
              () => {console.log('Termino'); }
            );//*/

        } else {
          this.reembolsoArr.estatus = this.workOrigen;
        }
      });
  }
  /**
   * @function
   * @name aceptarDialog  
   * Metodo que guarda los inputs en el arreglo guardar, para subirlos a la base
   * @returns {Array.<string>} guardar Regresa un Array con valores
   */
  aceptarDialog() {
    let texto = '';
    this.origen == 1 ? texto = 'actualizar la' : texto = 'generar una';
    //this.reembolsoArr.observaciones=this.reembolsoArr.observaciones;
    this.dialogService.openConfirmDialog(`¿ Esta seguro que desea ${texto} solicitud de reembolso ?`)
      .afterClosed().subscribe(res => {
        console.log(res);
        if (res) {
          this.dialogRefV.close({ reembolso: this.reembolsoArr, origen: this.origen });
        }
      });
  }
  /**
   * @function
   * @name cerrarDialog  
   * Metodo que reedirecciona a paginas switcheadas dependiendo de su origen
   * @returns {boolean} Regresa un true o un false
   */
  cerrarDialog() {
    this.dialogService.openConfirmDialog('¿ Esta seguro que desea salir de la pantalla ?')
      .afterClosed().subscribe(res => {
        if (res) {
          this.dialogRefV.close({ event: 'Cancel' });
        }
      });
  }
  public getDatos(idempresa: any, idCC: any): Observable<any> {
    let centrosCostos = this.http.get<any>(API + 'catalogos/?catalogo=vwCentrosCostos&filtro1=' + encodeURIComponent('idEstructura=' + idCC + ' and idEmpresas=' + idempresa), { headers: headers });
    let empresas = this.http.get<any>(APIAdmin + 'catalogo/?catalogo=empresas&filtro1=' + encodeURIComponent('id=' + idempresa), { headers: headers });
    return forkJoin([centrosCostos, empresas]);
  }

  public getUsuario(id: any, idempresa: any): Observable<any> {
    let usuario = this.http.get<any>(API + 'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1=' + encodeURIComponent('idOcupantePuesto=' + id + ' and idEmpresas=' + idempresa), { headers: headers });
    return forkJoin([usuario]);
  }
}