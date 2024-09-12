/** Modulo Angular que muestra un listado con devoluciones 
 * @module 1. Agrega Reportes
 * agrega-reportegasto.component.ts  
 */
import { Component, Inject, OnInit, Optional, Provider, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { ReporteGastoDetalle, ConceptosDetalle } from '../reportegasto';
import { Validators, FormControl, NgForm, FormGroupDirective } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WorkFlowService } from '../../../Genericos/servicios.service'
import { ErrorStateMatcher, MAT_DATE_FORMATS, MAT_DATE_LOCALE, DateAdapter, MatOption} from '@angular/material/core';
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
import { catchError } from 'rxjs/operators';
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
 * componente Principal para listar y agregar los reportes 
 */
@Component({
  //selector: 'app-add-invoice',
  templateUrl: './agrega-reportegasto.component.html',
  styleUrls: ['./agrega-reportegasto.component.scss'],
  providers: [{provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},{provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
/** El nombre del modulo AgregaReporteGastoComponent */

export class AgregaReporteGastoComponent implements OnInit {
  id: any;
  reporte: any;

  concepDetalle: ConceptosDetalle;
  causaLista: any;
  workInicial: any;
  workOrigen: string;
  unionFecha: any = ''
  subTotal = 0;
  vat = 0;
  grandTotal = 0;

  arrsesion: any;
  TipoSol: any;
  MonedaL: any;
  CentroCosto: any;
  TipoComprobante: any;
  Proyectos: any;
  Empresas: any;
  Tipogasto: any;
  FechaReg: any;

  bloqAnt:boolean = false;

  isTableExpanded: boolean = false;
  bloqueo: boolean = false;
  btnGda: string = '0';
  fechaHoy: Date=new Date(Date.now());

  GastosList: MatTableDataSource<any>;
  totalesTabla: MatTableDataSource<any>;
  //selection = new SelectionModel<ProdServList>(true, []);
  displayedColumns: string[] = ['id', 'vista', 'tipodegasto', 'fechaEmision', 'TipoComprobante', 'FormaPago', 'CuentaPago', 'subtotal', 'total', 'montoAprobado', 'estatus', 'Acciones'];
  //displayedColumns: string[] = ['vista','id','TipoComprobante','createdAt','fechaEmision','tipodegasto','estatus','subtotal','total','idMoneda'];
  detalleColumns: string[] = ['descripcion', 'cantidad', 'unidadMedida', 'tasaIva', 'montoIva', 'precioUnitario', 'descuento', 'importe', 'montoAprobado', 'Acciones'];
  totalColumns: string[] = ['Tipogastos', 'Montototal'];
  @ViewChild(MatSort) sort: MatSort = Object.create(null);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
  /**
   * Consulta catálogos y servicios.
   */
  constructor(private servicios: serviciosService,
    public datePipes: DatePipe,
    public workService: WorkFlowService,
    private router: Router,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private mensajes: MensajesService,
    private http: HttpClient,
    private token: TokenService) {
    let datSess: any = token.readToken('id', '')
    datSess = datSess.split(',');
    this.reporte = {
      idEmpresa: Number(datSess[1]),
      idProyecto: 0,
      idCentrosCostos: 0,
      idUser: datSess[0],
      idAnticipoFondos: 0,
      idUsoFondos: 0,
      nombre: '',
      id: Math.round(Math.random() * (1200)),
      fechaIni: '',
      fechaFin: '',
      notas: '',
      estatus: null,
      monto: 0,
      montoAprobado: 0,
      createdAt: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
      idMoneda:0
    }
    this.concepDetalle = {
      idgasto: 1,
      antid: 0,
      antMontocomprobado: 0,
      antMontoAutorizado: 0,

      totGaid: 0,
      totGaMontocomprobado: 0,
      totGaMontoAutorizado: 0,

      reemid: 0,
      reemMontocomprobado: 0,
      reemMontoAutorizado: 0,

      rridid: 0,
      rridMontocomprobado: 0,
      rridMontoAutorizado: 0,

      devoid: 0,
      devoMontocomprobado: 0,
      devoMontoAutorizado: 0,

      rfidid: 0,
      rfidMontocomprobado: 0,
      rfidMontoAutorizado: 0,
    }

    this.FechaReg = this.datePipes.transform(new Date(this.reporte.createdAt), 'dd/MM/yyyy');
    this.totalesTabla = new MatTableDataSource();
    this.GastosList = new MatTableDataSource();
    this.workOrigen = this.reporte.estatus;
    this.getUsuario(datSess[0], datSess[1]).subscribe(rsUs => {
      this.arrsesion = rsUs[0];
      this.arrsesion.map((t1: any) => { t1.NombreCompleto = `${t1.nombre} ${t1.apellidoPaterno} ${t1.apellidoMaterno}`; t1.idUser = t1.idOcupantePuesto; t1.idEmpresa = Number(datSess[1]); });
      this.reporte.nombre = this.arrsesion[0].NombreCompleto;
      this.getDatos(datSess[1], this.arrsesion[0].idEstructura, this.arrsesion[0].nivelEstructura).subscribe(resp => {
        this.MonedaL = resp[0];
        this.TipoSol = resp[1];
        this.CentroCosto = resp[2];
        this.Empresas = resp[3];
        this.Proyectos = resp[4];
        this.Tipogasto = resp[5];
        this.TipoComprobante = tipocomprobantes;
        this.reporte.idCentrosCostos=this.CentroCosto[0].idCentrosCostos;
        this.servicios.getUnParametro('catalogos', '?catalogo=workflows&filtro1=' + encodeURIComponent('idEmpresa=' + datSess[1]))
          .pipe().subscribe((res: any) => {
            this.workInicial = res;
            this.workInicial = this.workInicial.filter((dato: any) => dato.estatusActual == null && dato.nombreObjeto == "Reporte de Gastos");
          });
      });
    });

    console.log(this.reporte);
  }

  Inicio() {

  }

  ngOnInit(): void {
  }

  step = 0;
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
    switch (origen) {
      case 1:
        this.reporte.fechaIni = new Date(event.value);
        break;
      case 2:
        this.reporte.fechaFin = new Date(event.value);
        break;
    } // */
    if(!this.reporte.fechaIni || !this.reporte.fechaFin){

      this.reporte.diasDura = 0;  
    } else{
      if (moment(this.reporte.fechaFin ).format("YYYY-MM-DD") >= moment(this.reporte.fechaIni ).format("YYYY-MM-DD")) { } 
      else { 
        this.reporte.diasDura = 0;
        this.mensajes.mensaje('La fecha final no debe ser mayor a la fecha inicial.', '', 'zazz'); 
        return false; 
      };
      resulta = (moment(this.reporte.fechaFin , 'YYYY-MM-DD').diff(moment(this.reporte.fechaIni , 'YYYY-MM-DD'), 'days')) + 1;
      this.reporte.diasDura = resulta ;

    }

    

    // if (moment(this.reporte.fechaFin).format("YYYY-MM-DD") > moment(this.reporte.fechaIni).format("YYYY-MM-DD")) { } else { this.mensajes.mensaje('La fecha Final no debe ser mayor a la fecha Inicial.', '', 'zazz'); return false; };
    // resulta = moment(this.reporte.fechaFin, 'YYYY-MM-DD').diff(moment(this.reporte.fechaIni, 'YYYY-MM-DD'), 'days');
    // this.reporte.diasDura = resulta < 0 ? 0 : resulta;
    // this.reporte.diasDura = isNaN(this.reporte.diasDura) ? 0 : this.reporte.diasDura;
    // //this.reporte.diasDura = this.reporte.diasDura>0 && this.reporte.idUsoFondos === 1? this.reporte.diasDura + 1:this.reporte.diasDura; 
    // this.reporte.diasDura = this.reporte.diasDura>0 ? this.reporte.diasDura + 1:this.reporte.diasDura;     
    this.valida(this.reporte);
  }
  /**
   * @function
   * @name guardarReporteGasto  
   * Metodo que guarda los inputs en el arreglo guardar, para subirlos a la base
   * @returns {Array.<string>} guardar Regresa un Array con valores
   */
  guardarReporteGasto(val:any) {
    if(val===1){
      let mensajeD = this.reporte.idAnticipoFondos === 0 ? '  ¿ Esta seguro de agregar un nuevo reporte de gastos sin asociar ninún Anticipo ?' : '  ¿ Esta seguro de agregar un nuevo reporte de gastos ?';
      this.dialogService.openConfirmDialog(mensajeD)
        .afterClosed().subscribe(res => {
          if (res) {
            let guardar = {
              idEmpresa: Number(this.reporte.idEmpresa),
              idProyecto: Number(this.reporte.idProyecto),
              idUser: Number(this.reporte.idUser),
              idAnticipoFondos: Number(this.reporte.idAnticipoFondos),
              idCentrosCostos: Number(this.reporte.idCentrosCostos),
              idUsoFondos: Number(this.reporte.idUsoFondos),
              fechaIni: this.datePipes.transform(new Date(this.reporte.fechaIni), 'yyyy-MM-dd'),
              fechaFin: this.datePipes.transform(new Date(this.reporte.fechaFin), 'yyyy-MM-dd'),
              notas: String(this.reporte.notas),
              montoAprobado: Number(this.reporte.montoAprobado),
              monto: Number(this.reporte.monto),
              estatus: 'Nuevo'
            }
            console.log(guardar);
            
            this.servicios.postDatos('reportes', guardar)//,`?idWorkflow=10`
              .pipe(
                catchError(err => { return throwError(err); })
              ).subscribe(
                (res: any) => {
                  this.router.navigate([`/reportesgastos/reportegasto/editReporteGasto/${res.id}/1`]);
                },
                (err: any) => { },
                () => { }
              );//*/
          }
        });
    } else {
      let guardar = {
        idEmpresa: Number(this.reporte.idEmpresa),
        idProyecto: Number(this.reporte.idProyecto),
        idUser: Number(this.reporte.idUser),
        idAnticipoFondos: Number(this.reporte.idAnticipoFondos),
        idCentrosCostos: Number(this.reporte.idCentrosCostos),
        idUsoFondos: Number(this.reporte.idUsoFondos),
        fechaIni: this.datePipes.transform(new Date(this.reporte.fechaIni), 'yyyy-MM-dd'),
        fechaFin: this.datePipes.transform(new Date(this.reporte.fechaFin), 'yyyy-MM-dd'),
        notas: String(this.reporte.notas),
        montoAprobado: Number(this.reporte.montoAprobado),
        monto: Number(this.reporte.monto),
        estatus: 'Nuevo'
      }
      console.log(guardar);      
      this.servicios.postDatos('reportes', guardar)//,`?idWorkflow=10`
        .pipe(
          catchError(err => { return throwError(err); })
        ).subscribe(
          (res: any) => {
            this.router.navigate([`/reportesgastos/reportegasto/editReporteGasto/${res.id}/1`]);
          },
          (err: any) => { },
          () => { }
        );//*/
    }
    
  }

  /**
   * @function
   * @name cerrarDialog  
   * Metodo que reedirecciona a paginas switcheadas dependiendo de su origen
   * @returns {boolean} Regresa un true o un false
   */
  cerrarReporteGasto() {
    this.dialogService.openConfirmDialog('  ¿Esta seguro desea salir sin guardar?')
      .afterClosed().subscribe(res => {
        if (res) {
          console.log(this.router);
          this.router.navigate(['/reportesgastos/reportegasto']);
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

  aprobarComprobante(arr: any) {
    console.log(arr);
  }
  cancelarComprobante(arr: any) {
    console.log(arr);
  }
  editarComprobante(arr: any) {
    console.log(arr);
  }
  eliminarComprobante(arr: any) {
    console.log(arr);
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
    const dialogRefs = this.dialog.open(ListaAnticipoDialog, {
      width: '90%',
      height: '90%',
      data: obj,
    });
    console.log(dialogRefs);
    dialogRefs.afterClosed().subscribe(result => {
      console.log(result.anticipo[0])
      if (result.anticipo.length > 0) {
        this.reporte.fechaIni = moment(new Date(result.anticipo[0].fechaIni)).add(2, 'days').format("YYYY-MM-DD");
        this.reporte.fechaFin = moment(new Date(result.anticipo[0].fechaFin)).add(2, 'days').format("YYYY-MM-DD");
        this.reporte.monto = result.anticipo[0].montoPagado;
        this.reporte.notas = result.anticipo[0].motivo;
        this.reporte.diasDura = result.anticipo[0].diasDura;
        this.reporte.idAnticipoFondos = result.anticipo[0].id;
        this.reporte.idUsoFondos= result.anticipo[0].idUsoFondos;
        this.reporte.idMoneda= result.anticipo[0].idMoneda;
        this.reporte.idProyecto= result.anticipo[0].idProyecto;        
        this.valida(this.reporte);
      }
    });
  }
  /**
   * @function
   * @name GastoDialog  
   * Metodo que configura el tamaño del dialogo que edita los gastos
   * @returns {Array.<string>} guardar Regresa un Array con valores
   */
  GastoDialog(action: string, obj: any) {
    console.log(obj)
    obj.action = action;
    const dialogRefG = this.dialog.open(ListaGastoDialog, {
      width: '90%',
      height: '90%',
      data: obj,
    });
    console.log(dialogRefG);
    dialogRefG.afterClosed().subscribe(result => {
      if (result.gastos) {
        this.tablaGastos(result.gastos);
      }
    });
  };
  /**
   * @function
   * @name cambiaCC
   * Metodo que habilita por cambio de centro de costos 
   * @returns  {Boolean} Regresa un true o false 
   */
  cambiaCC(evento: any, arr: any) {
    this.reporte.idCentrosCostos = evento.value;
    this.valida(this.reporte);
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

  tablaGastos(arr: Provider[][]) {
    console.log(arr);

    forkJoin(
      arr.map(a =>
        this.servicios.getUnParametro('gastos', `${a}`)
      )).subscribe((a: Provider[][]) => {
        console.log(a);
        let providers: Provider[] = [];
        let providersNo: Provider[] = [];
        let gsatosListData = a.map(
          (t1: any) => ({
            ...t1, ...this.arrsesion.find((t2: any) => t2.idUser === t1.idUser),
            ...t1, ...this.MonedaL.find((t2: any) => t2.idMoneda === t1.idMoneda),
            ...t1, ...this.TipoSol.find((t2: any) => t2.idUsoFondos === t1.idUsoFondos),
          })
        );

        gsatosListData.map((t1: any, i: any) => {
          t1.isExpanded = false;
          t1.detalle = [];
          t1.TipoComprobante = t1.idTipoComprobante == 0 ? 'Pendiente' : this.TipoComprobante.filter((tc: any) => tc.id == t1.idTipoComprobante)[0].tipo;
          if (t1.TipoComprobante == 'Pendiente') { t1.importetotal = 0; t1.subtotal = 0; t1.idMoneda = 1; t1.tipodegasto = 'Pendiente'; t1.moneda = this.MonedaL.filter((mon: any) => mon.idMoneda == 1)[0].tipo; }
          else { t1.tipodegasto = t1.idTipoGasto === 0 ? '' : this.Tipogasto.filter((tp: any) => tp.idTipo == t1.idTipoGasto)[0].tipoG; }
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
          } else {

          }
        });

        console.log(providers);
        console.log(providersNo);
        if (providers.length > 0) {
          forkJoin(
            providers.map(c =>
              this.servicios.getUnParametro('gastos', `${c}/comprobante`)
            )).subscribe((c: Provider[][]) => {
              console.log(c);
              gsatosListData.map((x: any) => { let valcomp = 0; c.map((e: any) => { if (e.idGastos === x.id) { valcomp = e.id }; }); x.idComprobante = valcomp; });
              forkJoin(
                providers.map(p =>
                  this.servicios.getUnParametro('gastos', `${p}/comprobantedetalle`)
                )).subscribe((p: Provider[][]) => {
                  console.log(p)

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
                        }
                        console.log(gsatosListData);
                        this.GastosList = new MatTableDataSource(gsatosListData);
                        this.GastosList.paginator = this.paginator!;
                        this.GastosList.sort = this.sort;
                        const sortState: Sort = { active: 'createdAt', direction: 'desc' };
                        this.sort.active = sortState.active;
                        this.sort.direction = sortState.direction;
                        this.sort.sortChange.emit(sortState);
                      }), (err: any) => { console.log(err); };
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
                    console.log(gsatosListData);
                    this.GastosList = new MatTableDataSource(gsatosListData);
                    this.GastosList.paginator = this.paginator!;
                    this.GastosList.sort = this.sort;
                    const sortState: Sort = { active: 'createdAt', direction: 'desc' };
                    this.sort.active = sortState.active;
                    this.sort.direction = sortState.direction;
                    this.sort.sortChange.emit(sortState);
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
      }), (err: any) => { console.log(err); };

  }

  toggleTableRows() {
    this.isTableExpanded = !this.isTableExpanded;
    this.GastosList.data.forEach((row: any) => {
      row.isExpanded = this.isTableExpanded;
    })
  }
  /**
   * @function
   * @name valida 
   * Metodo que habilita el estatus del boton guardar
   * @returns  {Boolean} Regresa un true o false 
   */
  valida(event: any) {
    if (this.reporte.fechaFin != '') { } else { return false; };
    if (this.reporte.fechaIni != '') { } else { return false; };
    if (moment(this.reporte.fechaFin).format("YYYY-MM-DD") >= moment(this.reporte.fechaIni).format("YYYY-MM-DD")) { } else { return false; };
    this.btnGda = '1';
  }

  public getDatos(idempresa: any, idCC: any, nivCC: any): Observable<any> {
    let monedas = this.http.get<any>(`${APIAdmin}catalogo/?catalogo=monedas`, { headers: headers });
    let tipoSolicitud = this.http.get<any>(`${APIAdmin}catalogo/?catalogo=tipoSolicitud`, { headers: headers });
    let centrosCostos = this.http.get<any>(API + 'catalogos/?catalogo=vwCentrosCostos&filtro1=' + encodeURIComponent('idEstructura=' + idCC + ' and idEmpresas=' + idempresa), { headers: headers });
    let empresas = this.http.get<any>(APIAdmin + 'catalogo/?catalogo=empresas&filtro1=' + encodeURIComponent('id=' + idempresa), { headers: headers });
    let proyectos = this.http.get<any>(API + 'catalogos/?catalogo=vwProyectos&filtro1=' + encodeURIComponent('nivelEstructura=' + nivCC + ' and idEmpresas=' + idempresa), { headers: headers });
    let tipoGastos = this.http.get<any>(`${APIAdmin}catalogo/?catalogo=tipoGastos&filtro1=idEmpresas=${idempresa}`, { headers: headers });
    return forkJoin([monedas, tipoSolicitud, centrosCostos, empresas, proyectos, tipoGastos]);
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
  selector: 'lista_anticipos',
  templateUrl: 'lista_anticipos.html',
})
/** El nombre del modulo ListaAnticipoDialog */

export class ListaAnticipoDialog {
  anticipoColumns: string[] = ['select', 'id', 'createdAt', 'descripcion', 'motivo', 'fechaIni', 'fechaFin', 'diasDura', 'estatus', 'monto', 'montoPagado', 'tipo'];
  searchText: any;
  local_data: any;
  action: string;
  arrsesion: any;
  TipoSol: any;
  MonedaL: any;
  CentroCosto: any;
  anticipoList: MatTableDataSource<any>;
  selection = new SelectionModel<any>(true, []);
  subscription!: Subscription;

  @ViewChild(MatSort) sort: MatSort = Object.create(null);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
  /**
   * Consulta catálogos y servicios.
   */
  constructor(public dialogRefs: MatDialogRef<ListaAnticipoDialog>,
    private servicios: serviciosService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    @Optional() @Inject(MAT_DIALOG_DATA) public LstAnt: any,
    private http: HttpClient,
    private token: TokenService) {
    let datSess: any = token.readToken('id', '')
    datSess = datSess.split(',');
    this.local_data = { ...data };
    this.action = this.local_data.action;
    console.log(this.local_data)
    this.anticipoList = new MatTableDataSource();
    this.getUsuario(datSess[0], datSess[1]).subscribe(rsUs => {
      this.arrsesion = rsUs[0];
      this.arrsesion.map((t1: any) => { t1.NombreCompleto = `${t1.nombre} ${t1.apellidoPaterno} ${t1.apellidoMaterno}`; t1.idUser = t1.idOcupantePuesto; t1.idEmpresa = datSess[1]; });
      this.getDatos(this.arrsesion[0].idEmpresa).subscribe(resp => {
        this.MonedaL = resp[0];
        this.TipoSol = resp[1];
        this.Inicio('catalogos', '?catalogo=vwAnticiposFondos&filtro1=' + encodeURIComponent(`idEmpresa=${datSess[1]} and idUser=${this.local_data.idUser} and estatus IN ('Pagado','Pagado Parcial') `))
      });
    });
}
  /**
   * @function
   * @name Inicio 
   * Metodo principal que inicia el consumo del servicio
   * @param {string} anticipos 
   * @returns {Array.<string>} Regresa el servicio anticipos consultado correspondiente al idUser
   */
  Inicio(tabla: any, param: any) {
    this.servicios.getUnParametro(tabla, param)
      .pipe(
        catchError(err => { this.anticipoList = new MatTableDataSource(); return throwError(err); })
      )
      .subscribe(
        (res: any) => {
          let anticipoListData = res.map((t1: any) => ({ ...t1, ...this.arrsesion.find((t2: { idUser: any; }) => t2.idUser === t1.idUser) }))
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

          this.anticipoList = new MatTableDataSource(anticipoListData);
          this.anticipoList.paginator = this.paginator!;
          this.anticipoList.sort = this.sort;
          const sortState: Sort = { active: 'createdAt', direction: 'desc' };
          this.sort.active = sortState.active;
          this.sort.direction = sortState.direction;
          this.sort.sortChange.emit(sortState);
        },
        (err: any) => { }, () => { }
      );
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
 * componente  para listar los gastos
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
/** El nombre del modulo ListaGastoDialog */

export class ListaGastoDialog {
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
  constructor(public dialogRefG: MatDialogRef<ListaGastoDialog>,
    private servicios: serviciosService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    @Optional() @Inject(MAT_DIALOG_DATA) public LstAnt: any
  ) {
    this.local_data = { ...data };
    this.action = this.local_data.action;
    this.arrsesion = JSON.parse(window.sessionStorage.getItem("persona")!);
    this.TipoSol = JSON.parse(window.sessionStorage.getItem("tipoSolicitud")!);
    this.MonedaL = JSON.parse(window.sessionStorage.getItem("moneda")!);
    this.CentroCosto = JSON.parse(window.sessionStorage.getItem("centrocostos")!);
    this.TipoComprobante = JSON.parse(window.sessionStorage.getItem("tipocomprobantes")!);
    this.Tipogasto = JSON.parse(window.sessionStorage.getItem("tipogasto")!);
    this.GastosList = new MatTableDataSource();
    this.Inicio();
  }
  /**
   * @function
   * @name Inicio 
   * Metodo que inicia el consumo del servicio para listar gastos
   * @param {string} gastos 
   * @returns {Array.<string>} Regresa el servicio gastos consultado correspondiente al idUser
   */
  Inicio() {
    this.servicios.getUnParametro('gastos', '?idUsuario=' + this.arrsesion[0].idUser)
      .pipe(
        catchError(err => { this.GastosList = new MatTableDataSource(); return throwError(err); })
      ).subscribe(
        (res: any) => {
          let providers: Provider[] = [];
          let providersDet: Provider[] = [];
          let providersNo: Provider[] = [];
          let gsatosListData = res.map(
            (t1: any) => ({
              ...t1, ...this.arrsesion.find((t2: any) => t2.idUser === t1.idUser),
              // ...t1, ...this.MonedaL.find((t2:any) => t2.idMoneda === t1.idMoneda),
              // ...t1, ...this.TipoSol.find((t2:any) => t2.idUsoFondos === t1.idUsoFondos),
            })
          );

          gsatosListData.map((t1: any, i: any) => {
            t1.isExpanded = false;
            t1.detalle = [];
            t1.idMoneda = 'MXN';
            t1.moneda = this.MonedaL.filter((mon: any) => mon.clave == t1.idMoneda)[0].clave;
            t1.TipoComprobante = t1.idTipoComprobante == 0 ? 'Pendiente' : this.TipoComprobante.filter((tc: any) => tc.id == t1.idTipoComprobante)[0].tipo;
            if (t1.TipoComprobante == 'Pendiente') { t1.importetotal = 0; t1.subtotal = 0; t1.idMoneda = 1; t1.tipodegasto = 'Pendiente'; t1.moneda = this.MonedaL.filter((mon: any) => mon.idMoneda == 1)[0].tipo; }
            else { t1.tipodegasto = t1.idTipoGasto === 0 ? '' : this.Tipogasto.filter((tp: any) => tp.idTipo == t1.idTipoGasto)[0].tipoG; }
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
            } else {

            }
          });

          console.log(providers);
          console.log(providersNo);
          if (providers.length > 0) {
            forkJoin(
              providers.map(c =>
                this.servicios.getUnParametro('gastos', `${c}/comprobante`)
              )).subscribe((c: Provider[][]) => {
                console.log(c);
                gsatosListData.map((x: any) => { let valcomp = 0; c.map((e: any) => { if (e.idGastos === x.id) { valcomp = e.id }; }); x.idComprobante = valcomp; });
                forkJoin(
                  providers.map(p =>
                    this.servicios.getUnParametro('gastos', `${p}/comprobantedetalle`)
                  )).subscribe((p: Provider[][]) => {
                    console.log(p)

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
                          }
                          console.log(gsatosListData);
                          this.GastosList = new MatTableDataSource(gsatosListData);
                          this.GastosList.paginator = this.paginator!;
                          this.GastosList.sort = this.sort;
                          const sortState: Sort = { active: 'createdAt', direction: 'desc' };
                          this.sort.active = sortState.active;
                          this.sort.direction = sortState.direction;
                          this.sort.sortChange.emit(sortState);
                        }), (err: any) => { console.log(err); };
                    } else {
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
                              }
                              gt.detalle = new MatTableDataSource(gt.detalle);
                              //gt.detalle.paginator = this.paginator2!;
                              //gt.detalle.sort = this.sort2;
                            });
                          }
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
        },
        (err: any) => { },
        () => { console.log('Termino'); }
      );

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
}