/** Modulo Angular que muestra un listado de Tesoreria 
 * @module 1. lista Tesoreria
 * tesoreria-lista.component.ts  
 */
 import { Component, ViewChild, OnInit, OnDestroy, Optional, Inject, Provider } from '@angular/core';
 import { ServiceinvoiceService } from '../tesoreria.service';
 import { MatTable, MatTableDataSource } from '@angular/material/table';
 import { MatSort, Sort } from '@angular/material/sort';
 import { MatPaginator } from '@angular/material/paginator';
 import { ActivatedRoute, Data, NavigationEnd, Router } from '@angular/router';
 import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
 import { DatePipe, CurrencyPipe } from '@angular/common';
 import { forkJoin, Observable, Subscription, throwError } from 'rxjs';
 import { SelectionModel } from '@angular/cdk/collections';
 import { catchError, filter, map, mergeMap } from 'rxjs/operators';
 import { Title } from '@angular/platform-browser';
 import { FormControl, FormGroupDirective, NgForm} from '@angular/forms';
 import { DateAdapter, ErrorStateMatcher, MatOption, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
 import { DataService } from "../../../Genericos/data.service";
 import { serviciosService } from "../../../Genericos/servicios/servicios.service";
 import * as _moment from 'moment';
 import { ExcelServiceService } from '../../../Genericos/excelService/ExcelService.service';
 import { MatCheckboxChange } from '@angular/material/checkbox';
 import { DialogService } from '../../acciones/dialog.service';
 import { MensajesService } from "../../../Genericos/mensajes/mensajes.service";
 import { HttpClient, HttpHeaders } from '@angular/common/http';
 import { environment } from '../../../../environments/environment';
 import { TokenService } from '../../../auth/token/token.service';
 import { MY_FORMATS, funciones } from '../../../Genericos/utilidades/funciones';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

 const API = environment.ApiUrl;
 const APIAdmin= environment.ApiUrlAdmin;
 const headers = new HttpHeaders    
 headers.append('Content-type', 'applicartion.json')   
 const moment = _moment;
 const options2 = { style: 'currency', currency: 'MXN' };
 const numberFormat2 = new Intl.NumberFormat('es-MX', options2);
 
 interface TipoComprobantes {
  id: number;
  tipo:string;
}
const tipocomprobantes: TipoComprobantes[] = [
  { 
      id:1,
      tipo:'Fiscal'
  },
  { 
      id:2,
      tipo:'No Fiscal'
  },
];

interface ConfigPago {  
  idEmpresa:number;
  idTipoTransaccion:number,
  idProyecto:number;    
  idCentrosCostos :number; 
  idUser :number; 
  idMoneda:number;
  TipoCambio:number;    
  idBancoEmisor :number; 
  idCuenta :number; 
  fechaGenLayout :string; 
}
const configpago: ConfigPago[] = [
  {
      idEmpresa:0,
      idTipoTransaccion:0,
      idProyecto:0,    
      idCentrosCostos :0, 
      idUser :0, 
      idMoneda:0,
      TipoCambio:0,    
      idBancoEmisor :0, 
      idCuenta :0, 
      fechaGenLayout :''
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
 
  /**
   * componente Principal para listar, mediante el consumo de servicios
   */
 @Component({
   //selector: 'app-invoice-list',
   templateUrl: './tesoreria-lista.component.html',
   styleUrls: ['./tesoreria-lista.component.scss'],
   providers: [{provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},{provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}]
 })
  /** El nombre del modulo ListaTesoreriaComponent. */
 
 export class ListaTesoreriaComponent implements OnInit, OnDestroy {
   tesoreriaList:MatTableDataSource<any>;
   tesoreriaListOrig: any = [];
   subscription!: Subscription;
   selection = new SelectionModel<any>(true, []);
   pageInfo: Data = Object.create(null);
   message: any;
   arrsesion: any;
   transaccion: any;
   TipoComprobante:any;
   idEmpresa:any;
  //arrConfiguracion:any=[];
   arrSelecto:any;
   layout: string= '0';
   btnPago:string= '0';
   cantidad: string= '0';
   btnPagos:boolean=false;
   NomBancos:any;
   Bancos:any;
   Cuenta:any;
   Cuentas: any;
   MonedaL:any;
   Proyectos:any;
   CentroCosto:any;
   Empresas:any;
   ConfigurarPago:any;
   InicialConfig:any;
   bloqueoCuenta:boolean=true;
   bloqueoBanco:boolean=false;
   bloqTC:boolean=true;
   idRol:any;
   datSess:any; 
   workInicial:any;
   workFGral:any;
   idWorkflow:any;
   catransaccion:any=[]; 
   displayedColumns:string[]=['select','PagoManual','idUser','nombre','siglasBanco','cuenta','FechaAprobacion','id','tipoTransaccion','monto','montoPendiente','MontoPago','montoPagado','estatusPago'];
   //displayedColumns:string[]=['select','Empresa','BancoEmisor','CuentaEmisora','Proyecto','CentrodeCostos','TipoCambio','FechaGenLay','tipoTransaccion','Moneda', 'PagoManual'];,'estatus'
   @ViewChild(MatSort) sort: MatSort = Object.create(null);
   @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
   @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
      /**
       * Consulta catálogos y servicios, asi cómo inicializa el método principal que carga la información
       */
   constructor(
     private invoiceService: ServiceinvoiceService, 
     private servicios: serviciosService,
     private excelExporta:ExcelServiceService,
     public dialog: MatDialog, 
     public datePipe: DatePipe,
     private cp: CurrencyPipe,
     private router: Router,
     private titleService: Title,
     private activatedRoute: ActivatedRoute,
     private mensajes: MensajesService,   
     private dialogService: DialogService, 
     private datosPaso: DataService,
     private http: HttpClient,
     private token: TokenService) {
      this.datSess=token.readToken('id','');
      this.datSess=this.datSess.split(','); 
      this.idRol=token.readToken('rlsRol','GASTOS');
      this.tesoreriaList = new MatTableDataSource();
      this.ConfigurarPago =configpago;
      console.log(`VERSÓN 0.9.6`);

      this.getUsuario(this.datSess[0],this.datSess[1]).subscribe(rsUs => {
        this.arrsesion=rsUs[0];    
        this.arrsesion.map((t1:any) =>{ t1.idEmpresa=Number(this.datSess[1]);  t1.idRoles=this.idRol; });
        this.getDatos(this.datSess[1],this.arrsesion[0].idEstructura,this.datSess[0]).subscribe(resp => {
          this.MonedaL= resp[0];        
          this.CentroCosto=resp[1];
          this.Empresas=resp[2];
          this.Proyectos=resp[3];
          this.NomBancos=resp[4];
          this.Cuentas=resp[5];
          this.NomBancos=this.NomBancos.filter((dato:any) => this.Cuentas.some((o2:any) => o2.idBanco === dato.id))
          //console.log('BAN - ',this.NomBancos.filter((ban:any)=>{ ban.id==this.Cuentas.filter((i:any) => ban.id === i.idBanco).idBanco; }));
         
          this.TipoComprobante=tipocomprobantes;
          this.catransaccion = this.invoiceService.getTipoTransaccionCat();  
          this.idEmpresa=this.datSess[1];
          this.servicios.getUnParametro('catalogos','?catalogo=workflows&filtro1='+encodeURIComponent('idEmpresa='+this.datSess[1]))
            .pipe().subscribe((res:any) => {
              this.workInicial=res;
              this.workInicial.map((t1: any) =>{t1.evento=JSON.parse(t1.evento)});
              this.workFGral=this.workInicial;
              this.IniciaFiltro();
            });
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
  /**
   * @function
   * @name Inicio
   * Metodo principal que inicia el consumo del servicio
   * @param {string} catalogos 
   * @returns {Array.<string>} Regresa el servicio catalogos consultado correspondiente al idUser
   */
   Inicio(params:any){
     this.servicios.getUnParametro('catalogos',`?catalogo=vwListaTransacciones&filtro1=${params}`)//
     .pipe(catchError(err => { this.tesoreriaList = new MatTableDataSource(); return throwError(err); }))
     .subscribe(
       (res:any) => {
         console.log(res);
         let tesoreriaListData=res;
         //let tesoreriaListData= res.map((t1:any) => ({  ...t1, ...this.arrsesion.find((t2:any) => t2.idUser === t1.idUser) }) ) 
           console.log('tesoreriaListData',tesoreriaListData);
           tesoreriaListData.map((t1: any) =>{ 
             //t1.BancoReceptor=this.NomBancos.filter((ban:any) => ban.id == t1.idBancoReceptor)[0].siglasBanco;
             t1.montoPendiente=t1.montoPendiente.toFixed(2);
             //t1.idUser=t1.IdColaborador;    
             //t1.montoPendiente=t1.Moneda=='MXN'?t1.monto:t1.monto*this.ConfigurarPago.TipoCambio;
             //t1.MontoPago=t1.Moneda=='MXN'?t1.monto:t1.monto*this.ConfigurarPago.TipoCambio;
             t1.FechaAprobacion= moment(new Date(t1.actualizada)).format("MM/DD/YYYY");
             t1.idPaso=0;
             t1.MontoPago=0;  
             t1.MonedaPago='MXN'; 
             t1.estatus='Sin Definir';           
           }) ;
         console.log('Tesoreria',tesoreriaListData);
         this.tesoreriaList = new MatTableDataSource(tesoreriaListData);
         this.tesoreriaList.paginator = this.paginator!;
         this.tesoreriaList.sort = this.sort;
         this.tesoreriaListOrig = this.tesoreriaList.data;
         const sortState: Sort = {active: 'createdAt', direction: 'desc'};
         this.sort.active = sortState.active;
         this.sort.direction = sortState.direction;
         this.sort.sortChange.emit(sortState);

         this.Bancos=[];
         console.log('this.NomBancos',this.NomBancos);
          this.NomBancos.map((ban:any)=>{
            //if(ban.idMoneda=='MXN'){
              this.Bancos.push(ban);
           // }
          }); 
        },(err:any) => {  }); 
   }
 /**
   * @function
   * @name IniciaFiltro
   * Metodo que crea un nuevo arreglo con otros arreglos para la Configuracion del pago
   * @param {string} IniciaFiltro 
   * @returns {Array.<string>} Regresa un nuevo arreglo
   */
   IniciaFiltro() {
     this.ConfigurarPago =[];
     this.ConfigurarPago = this.invoiceService.getConfigPagoD();   
     this.ConfigurarPago= this.ConfigurarPago.map(
     (t1:any) => ({
       ...t1, ...this.arrsesion.find((t2:any) => t2.idUser === t1.idUser),
       ...t1, ...this.MonedaL.find((t2:any) => t2.id === t1.idMoneda),
       ...t1, ...this.NomBancos.find((t2:any) => t2.id === t1.idBancoEmisor),
       ...t1, ...this.Cuentas.find((t2:any) => t2.idCuenta === t1.idCuenta)
       })
     )   
     console.log(this.ConfigurarPago);           
     this.ConfigurarPago=this.ConfigurarPago[0];
     this.ConfigurarPago.idEmpresa=this.arrsesion[0].idEmpresas;
     this.ConfigurarPago.idUser=this.arrsesion[0].idOcupantePuesto;
     this.ConfigurarPago.idMoneda=1;
     this.ConfigurarPago.fechaGenLayout=moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
     this.InicialConfig=this.ConfigurarPago;
     //this.Inicio('&filtro1=montoPendiente%20%3E%200&filtro2=estatus%3D%22Aprobado%22');

     
     this.Inicio( encodeURIComponent('montoPendiente > 0 and idEmpresa='+this.idEmpresa))
     
   }
   
   ngOnInit() {
     this.subscription = this.datosPaso.currentMessage.subscribe((message) => {this.message = message; this.BuscarFiltro(message); }); // {{message[0].filtro.name}}
   }
     /**
  * @function
   * @name BuscarFiltro
   * Metodo que Busca en el tabulado 
   * @returns {Array.<string>} Regresa un Array 
   */
  BuscarFiltro(json: any) {
    let filtros = json[0]
    let filtrado = filtros.filtro
    delete filtrado.titulo;
    console.log("filtrado - ",filtrado);
    //this.tesoreriaList.data.forEach(i => Object.entries(filtrado).every(([k, v]) =>{ let nombre:any=v; console.log('i- ',i[k].toUpperCase(),' - |-',nombre.toUpperCase() , '   -+-  ',k);}));
    //let valor1 = this.tesoreriaList.data.filter(i => Object.entries(filtrado).every(([k, v]) =>{ let valor:any=v;  return i[k].toUpperCase() === valor.toUpperCase();}));
    //let valor1 = this.tesoreriaList.data.filter(i => Object.entries(filtrado).every(([k, v]) =>{let valor:any=v;return i[k].toUpperCase().includes(valor.toUpperCase());}));
    //let valor = this.tesoreriaList.data.filter(item =>  Object.entries(filtrado).includes(item.name.toUpperCase()))
    if (this.tesoreriaList.data.length != this.tesoreriaListOrig.length) {
      this.tesoreriaList.data = this.tesoreriaListOrig;
      if (filtrado.fechaIni && filtrado.fechaFin) {
        let filtroFecha = this.tesoreriaList.data.filter(function (item: any) {
          return new Date(item.FechaAprobacion+' 00:00:00') >= new Date(filtrado.fechaIni+' 00:00:00') && new Date(item.FechaAprobacion+' 00:00:00') <= new Date(filtrado.fechaFin+' 00:00:00');
        });
        delete filtrado.fechaIni;
        delete filtrado.fechaFin;
        const filteredData = funciones.buscarJsonEnJson(filtroFecha,filtrado);
        this.tesoreriaList.data = filteredData;
      } else {
        delete filtrado.fechaIni;
        delete filtrado.fechaFin;
        const filteredData = funciones.buscarJsonEnJson(this.tesoreriaList.data,filtrado);
        this.tesoreriaList.data = filteredData;
      }
    } else {
      if (filtrado.fechaIni && filtrado.fechaFin) {
        let filtroFecha = this.tesoreriaList.data.filter(function (item: any) {
          return new Date(item.FechaAprobacion+' 00:00:00') >= new Date(filtrado.fechaIni+' 00:00:00') && new Date(item.FechaAprobacion+' 00:00:00') <= new Date(filtrado.fechaFin+' 00:00:00');
        });
        delete filtrado.fechaIni;
        delete filtrado.fechaFin;
        const filteredData = funciones.buscarJsonEnJson(filtroFecha,filtrado);
        this.tesoreriaList.data = filteredData;
      } else {
        delete filtrado.fechaIni;
        delete filtrado.fechaFin;
        const filteredData = funciones.buscarJsonEnJson(this.tesoreriaList.data,filtrado);
        this.tesoreriaList.data = filteredData;
      }
    }
  }

  limpiarfiltros() {
    this.tesoreriaList.data = this.tesoreriaListOrig;
  }
 
   ngOnDestroy() {
     this.subscription.unsubscribe();
   }
 
 
   pasoFiltros() {
     this.datosPaso.changeMessage([{filtro:'',tipo:''}])
   }
  /**
   * @function
   * @name isAllSelected
   * Si el número de elementos seleccionados coincide con el número total de filas  
   * @returns  {Boolean} true false
   */
   isAllSelected() {
     const numSelected = this.selection.selected.length;
     const numRows = this.tesoreriaList.data.length;
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
           this.tesoreriaList.data.forEach(row => this.selection.select(row));
   }
 
   checkboxLabel(row?: any): string {          
       if (!row) {          
           return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
       }
       return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
   }
 
   showOptions(event:MatCheckboxChange, arr:any): void {
     this.layout=this.selection.selected.length>1?'1':'0';
     this.btnPagos=this.selection.selected.length>0?true:false;
     this.cantidad=this.layout;

    //  if(arr.moneda!='MXN'){
    //   if(this.ConfigurarPago.TipoCambio==0){
    //     this.mensajes.mensaje('Debe de ingresar un tipo de cambio.','','danger');
    //   }     
    // }  
    let moneda:any='';
    let cuenta:any=0;
     this.selection.selected.forEach((i:any)=>{ 
       if(i.moneda!==moneda){ if(cuenta==0){moneda=i.moneda;cuenta++;} 
       } else {moneda=i.moneda;cuenta++;}
      });
      if(this.selection.selected.length != cuenta){
        this.mensajes.mensaje('No puede seleccionar 2 tipos de moneda diferentes para generar un Layout. ','','danger');
        this.cantidad='0';
        this.layout='0';
      }
      console.log(this.selection.selected.length,"  -  ",cuenta );
      console.log(arr.moneda);
   }
 
   applyFilter(filterValue: string) {
     this.tesoreriaList.filter = filterValue.trim().toLowerCase();
   }
 /**
   * @function
   * @name exportar
   * Metodo que exporta a excel los tabulados seleccionados
   * @returns {Array.<string>} Regresa un Array 
   */
   exportar(){    
     this.selection.selected.length===0?this.generaExcel(this.tesoreriaList.data):this.generaExcel(this.selection.selected); 
   }
  /**
   * @function
   * @name generaExcel
   * Metodo que exporta a excel los tabulados 
   * @param {string} exportar 
   * @returns {Array.<string>} Regresa un Array 
   */
   generaExcel(arr:any){
     console.log(arr);
     let exportar:any=[];
       arr.map((ex:any) =>{
         exportar.push({
          CID:ex.idUser,
          Nombre:ex.nombre,
          BancoReceptor:ex.siglasBanco,
          CuentaReceptor:ex.cuenta,
          FechaAprobacion:moment(new Date(ex.FechaAprobacion)).format("MM/DD/YYYY"),
          IDTransaccion:ex.id, 
          TipoTransaccion:ex.tipoTransaccion,
          //fechaEmision:moment(new Date(ex.fechaEmision)).format("MM/DD/YYYY"),
          MontoTransaccion:ex.monto,
          XPagar:ex.montoPendiente,
          MontoPago:ex.MontoPago,
          Pagado:ex.montoPagado,           
          Estatus:ex.estatusPago          
         })        
       }); 
     this.excelExporta.exportAsExcelFile(exportar, 'tesoreria_'+this.arrsesion[0].idOcupantePuesto); 
   }
 
   filter(filterValue: string) {
     this.tesoreriaList.filter = filterValue.trim().toLowerCase();
   }
   
   IrTrans(arr:any){
     console.log(arr);
     let ruta=arr.tipoTransaccion=='Reembolso'?'reportesgastos/reembolso/editReembolsos/1':'';
     this.router.navigate([ruta]);
   }
 
   Cambio(evento:any, arr:any, campo:string){ 
     let valor:any, suma:number=0;
     if(evento.value){
        valor=evento.value;
     } else{
       valor=evento.target.value;
     }      
     if(arr.Moneda!='MXN'){
       if(this.ConfigurarPago.TipoCambio==0){
         this.mensajes.mensaje('Debe de ingresar un tipo de cambio.','','danger');
       }     
     }      
     this.tesoreriaList.data.map((t1) => {
       if (t1.id === arr.id) { 
         t1.MontoPago=Number(valor);
         if(t1.MontoPago > t1.montoPendiente){
           this.mensajes.mensaje('El monto a pagar no puede ser mayor al Saldo Pendiente de Pago.','','danger');
           t1.MontoPago=0;
         }  
       }
       suma=suma+t1.MontoPago;  
     });        
   }
 
  /**
   * @function
   * @name GeneraLayout
   * Metodo para Generar un Layout
   * @param {string} ConfigurarPago 
   * @returns {Array.<string>} Regresa un Array 
   */
   GeneraLayout(){
     let cero:number=0, suma:number=0, incompleto:number=0, ListaSeleccion:any=[];
     console.log(this.selection.selected);
     this.selection.selected.map((t1)=>{      
       if(Number(t1.MontoPago)===0){cero++;};
       if(t1.moneda!='MXN' && Number(t1.MontoPago)===0){incompleto++;};
       if(t1.moneda!='MXN'){ suma=Number(suma) + Number(t1.Convertido); t1.MontoPagLay=Number(t1.Convertido);} else{ suma=Number(suma) + Number(t1.MontoPago); t1.MontoPagLay=Number(t1.MontoPago); };   
     }); 
     console.log(this.selection.selected);
     let Workflow=this.workFGral;
     //ListaSeleccion=this.selection.selected;
     console.log(this.ConfigurarPago);
     if(cero>0){this.mensajes.mensaje('Para generar un Layout no puede haber en la selección un monto de pago en 0.','','danger'); return false;}  
     if(incompleto>0){this.mensajes.mensaje('No puede Generar un Layout en una moneda extranjera con tipo de cambio en 0 (cero).','','danger'); return false;}   
     if(this.ConfigurarPago.idMoneda==0){this.mensajes.mensaje('No puede Generar un Layout sin seleccionar un tipo de moneda.','','danger'); return false;}
     if(this.ConfigurarPago.idBancoEmisor==0){this.mensajes.mensaje('No puede Generar un Layout sin seleccionar un banco emisor.','','danger'); return false;}
     if(this.ConfigurarPago.idCuenta==0){this.mensajes.mensaje('No puede Generar un Layout sin seleccionar una cuenta emisora.','','danger'); return false;}
     this.ConfigurarPago.MontoPagar=suma;
     this.ConfigurarPago.NumRegistros=this.selection.selected.length;
     
     if(cero>0){
       this.mensajes.mensaje('Para generar un Layout no puede haber en la selección un monto de pago en 0.','','danger'); return false;
     } else{
       //
     this.dialogService.openConfirmDialog(`¿Esta seguro que desea generar un Layout con ${this.selection.selected.length} registros y un monto total de ${numberFormat2.format(suma)}?`).afterClosed().subscribe(dial =>{
       if(dial){ 
         let guardar={
           idUsuario: Number(this.datSess[0]),
           monedaEmisor: 'MXN',//this.ConfigurarPago.Moneda,
           bancoEmisor: this.ConfigurarPago.Banco,
           cuentaEmisor: this.ConfigurarPago.Cuenta,
           idEmpresas:Number(this.datSess[1])
         }
         console.log(guardar);      
         let envEstatus={estatus:'Enviado'}
         this.idWorkflow=Workflow.filter((dato:any) => dato.nombreObjeto== "Pagos de Anticipos y reembolsos" && dato.evento.some((o2:any) => o2.siguienteEstatus === 'Enviado'));
           console.log(this.idWorkflow[0].id);
           
         this.servicios.postDatos('layoutbancario', guardar)
             .pipe( catchError(err => { return throwError(err); })
             ).subscribe(
               (res:any) => {
                 console.log('res',res);                
                 this.selection.selected.map((sel:any) =>{
                   ListaSeleccion.push({
                       idLayoutBancarioEnvio:res.id,
                       idBancoReceptor: sel.idBanco,
                       cuentaReceptor: String(sel.clabe) ,
                       idBancoEmisor: this.ConfigurarPago.idBancoEmisor,
                       cuentaEmisor: this.ConfigurarPago.Cuenta,
                       idPago: sel.id,
                       idMoneda: String(sel.idMoneda),
                       idTipoTransaccion: sel.tipoTransaccion=='Anticipo'?2:1,
                       idFormasPago: 3,
                       folio: '',
                       claveRastreo: '',
                       referencia: '',
                       montoTransaccion: Number(sel.MontoPagLay),
                       tipoCambio: !sel.tipoCambio?1:sel.tipoCambio,
                       estatus: 'Enviado',
                       fechaAprobacion: moment(new Date(sel.FechaAprobacion)).format("yyyy-MM-DD")+' 00:00:00.000' ,
                       fechaAplicacion: moment(new Date(this.ConfigurarPago.fechaGenLayout)).format("yyyy-MM-DD")+' 00:00:00.000' 
                   });
                 });
                   console.log(ListaSeleccion);
                   let providers: Provider[] = []; 
                   providers=ListaSeleccion;  
                   forkJoin(
                     providers.map(p =>
                       this.servicios.postMultiple('pagos/?idWorkflow='+this.idWorkflow[0].id, p).pipe( catchError(err => { return throwError(err); }) )
                     )).subscribe((p: Provider[][]) => {
                       console.log(p); 
                       this.servicios.get(`layoutbancario/${res.id}/generar`)
                              .pipe( catchError(err => { return throwError(err); }) )
                              .subscribe(
                                (gen:any) => {
                                  console.log(res.id,' gen ',gen);
                                  this.mensajes.mensaje('Layout generado con éxito puede ir a la sección Layout Envio para descargarlo.','','success'); 
                                  setTimeout(()=> { 
                                    this.servicios.getFile2('layoutbancario/download',res.id)
                                      .pipe(catchError(err => {  this.Inicio( encodeURIComponent('montoPendiente > 0 and idEmpresa='+this.idEmpresa));   return throwError(err);})
                                      ).subscribe((txt: any) => {
                                        console.log('txt',txt);
                                        let FileUrl = URL.createObjectURL(txt);
                                        //saveAs(txt, );
                                        console.log(FileUrl);
                                        console.log(res.rutaLayout);                                    
                                        this.Inicio( encodeURIComponent('montoPendiente > 0 and idEmpresa='+this.idEmpresa))                                                                
                                        // let a         = document.createElement('a');
                                        // a.href        = FileUrl; 
                                        // a.target      = '_blank';
                                        // a.download    = res.rutaLayout;
                                        // document.body.appendChild(a);
                                        // a.click();    
                                    },(err:any) => { this.Inicio( encodeURIComponent('montoPendiente > 0 and idEmpresa='+this.idEmpresa))  }); 
                                  }, 800)
                                },
                            (err:any) => {  }); 
                     });
               },
             (err:any) => {  } );
         } 

       });
     }
   }
 
   ConfiguraCta(){    
     let arr:any=[];
     arr=this.arrsesion;    
     const dialogRefCon = this.dialog.open(ConfiguraCuentaDialog, {
       width:'80%',
       height:'80%',
       data: arr,          
     });
     dialogRefCon.afterClosed().subscribe(result => {
       console.log(result.arrConfig)  
       if(result){
         //this.arrConfiguracion=result.arrConfig;
         //console.log(this.arrConfiguracion);
       } else {
 
       }
     });
   }

   getMonto(monto:any) {
    return numberFormat2.format(Number(monto));
  }
 
   step = 0;
   setStep(index: number) {
     this.step = index;
   }
   
  /**
   * @function
   * @name cambiaTransaccion 
   * Metodo que switchea el tipo de transacción en Anticipos y Reembolsos 
   */
   cambiaTransaccion(evento:any, arr:any){
     let valor, query;
     this.ConfigurarPago.tipoTransaccion=(evento.source.selected as MatOption).viewValue; 
     if(evento.value){ valor=evento.value; } else{valor=evento.target.value; } 
     console.log(valor);
     switch (valor) {      
       case 1:
         query="tipoTransaccion%3D'Anticipo'&filtro2=montoPendiente%20%3E%200"
         break;
       case 2:
         query="tipoTransaccion%3D'Reembolso'&filtro2=montoPendiente%20%3E%200"
         break;
       case 3:
         query=encodeURIComponent('montoPendiente > 0 and idEmpresa='+this.idEmpresa)
         
         break;  
     } 
    
     this.Inicio(query);
     //this.tesoreriaList.filter = this.ConfigurarPago.tipoTransaccion.trim().toLowerCase();
     //this.ConfigurarPago.idtipoTransaccion=evento.value; 
     //
   }
  /**
   * @function
   * @name cambiaCta 
   * Metodo que habilita por cambio de cuenta 
   */
   cambiaCta(evento:any, arr:any){     
     //this.ConfigurarPago.Cuenta=(evento.source.selected as MatOption).viewValue; 
     this.ConfigurarPago.Cuenta=evento.value; 
     this.ConfigurarPago.idCuenta=evento.value; 
   }
 /**
   * @function
   * @name cambiaTipoCambio 
   * Metodo que habilita por cambio de tipo de cambio 
   */
   cambiaTipoCambio(evento:any, arr:any){
     //this.ConfigurarPago.TipoCambio=evento.value; 
     let valor:any, suma:number=0;
     if(evento.value){valor=evento.value;} else{ valor=evento.target.value;}  
     console.log(valor);    
     this.tesoreriaList.data.map((t1) => {
       console.log(t1);
       if (t1.moneda !='MXN') { 
           //t1.MontoPago = (t1.monto*Number(valor)).toFixed(2);
           t1.Convertido = Number(t1.MontoPago)*Number(valor);   
           if(Number(t1.Convertido) > t1.montoPendiente){
             this.mensajes.mensaje('El monto a pagar NO puede ser mayor al Saldo Pendiente de Pago','','danger');
             t1.MontoPago=0;
           }    
       }
       suma=Number(suma)+Number(t1.MontoPago);  
     });      
   }
 /**
   * @function
   * @name LimpiarFiltro 
   * Metodo que regresa a vacio tesoreriaList 
   */
   LimpiarFiltro(){
     this.tesoreriaList.filter = '';
     this.IniciaFiltro();
   }
 /**
   * @function
   * @name cambiaEmp 
   * Metodo que cambia por Empresa 
   */
   cambiaEmp(evento:any, arr:any){
     this.ConfigurarPago.Banco=(evento.source.selected as MatOption).viewValue; 
     this.ConfigurarPago.idBancoEmisor=evento.value;
     this.Cuenta=[];
     this.Cuentas.map((cuen:any)=>{
       if(cuen.siglasBanco==this.ConfigurarPago.Banco){
         this.Cuenta.push(cuen);
       }
    });
     this.bloqueoCuenta=false;
   }
 /**
   * @function
   * @name cambiaMoneda 
   * Metodo que habilita por cambio de tipo de moneda 
   */
   cambiaMoneda(evento:any, arr:any){
     this.ConfigurarPago.Moneda=(evento.source.selected as MatOption).viewValue; 
     this.ConfigurarPago.idMoneda=evento.value;
     this.Bancos=[];
     this.NomBancos.map((ban:any)=>{
       //if(ban.idMoneda==evento.value){
         this.Bancos.push(ban);
      // }
    });    
    this.bloqTC = this.ConfigurarPago.Moneda=='MXN'?true:false;
    this.bloqueoBanco=false;
   }
 /**
   * @function
   * @name guardaEstatus 
   * Metodo que habilita un switcheo por moneda
   */
   guardaEstatus(evento:any, arr:any){
     let valor:any, suma:number=0;
     if(evento.value){
        valor=evento.value;
     } else{
       valor=evento.target.value;
     }      
     if(arr.moneda!='MXN'){
       if(this.ConfigurarPago.TipoCambio==0){
         this.mensajes.mensaje('Debe de ingresar un tipo de cambio si ha seleccionado un tipo de moneda diferente a pesos mexicanos.','','danger');
       }     
     }      
     console.log(Number(valor));
     this.tesoreriaList.data.map((t1) => {
       if (t1.id === arr.id) { 
         t1.MontoPago=Number(valor);
         t1.estatus='Nuevo';
         //t1.Estatus='Nuevo';
         if(t1.MontoPago > t1.montoPendiente){
           this.mensajes.mensaje('El monto a pagar no puede ser mayor al Saldo Pendiente de Pago.','','danger');
           t1.MontoPago=0;
         } 
         if (t1.moneda !='MXN') { 
           t1.Convertido = Number(t1.MontoPago)*Number(valor);   
           if(Number(t1.Convertido) > t1.montoPendiente){
             this.mensajes.mensaje('El monto a pagar no puede ser mayor al Saldo Pendiente de Pago.','','danger');
             t1.MontoPago=0;
           }   
         } 
       }
       suma=suma+t1.MontoPago;  
     }); 
     
     /*
     let guardar={
       idLayoutBancarioEnvio: arr.,
       idBancoReceptor: arr.,
       cuentaReceptor: arr.,
       idBancoEmisor: arr.,
       cuentaEmisor: arr.,
       idPago: arr.,
       idMoneda: arr.,
       idTipoTransaccion: arr.,
       referencia: arr.,
       montoTransaccion: arr.,
       estatus: 'Nuevo',
       fechaAprobacion: 1996-10-15T00:05:32.000,
       fechaAplicacion: 1996-10-15T00:05:32.000
     }*/
     console.log(this.tesoreriaList.data);    
   }
 /**
   * @function
   * @name abrePago 
   * Metodo que abre el componente de pagos, manda su origen
   */
   abrePago(evento:any, arr:any){
     window.sessionStorage.setItem("_origen",'');    
     window.sessionStorage.setItem("tesoreria",JSON.stringify([arr]));
   }

   numericoEU(valor: any) {   return new Intl.NumberFormat('de-DE', {  style: 'currency',currency: 'EUR',}).format(valor); }
   numericoMX(valor: any) {   return new Intl.NumberFormat('es-MX', {  style: 'currency',currency: 'MXN',}).format(valor); }
   numericoUS(valor: any) {   return new Intl.NumberFormat('en-US', {  style: 'currency',currency: 'USD',}).format(valor); }
   numericoYN(valor: any) {   return new Intl.NumberFormat('jp-JP', {  style: 'currency',currency: 'JPY',}).format(valor); }
 
   public getDatos (idempresa:any, idCC:any, usuario:any) : Observable<any>  {
      let monedas=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=monedas`, { headers: headers });
      let centrosCostos=this.http.get<any>(API+'catalogos/?catalogo=vwCentrosCostos&filtro1='+encodeURIComponent('idEstructura='+idCC+' and idEmpresas='+idempresa), { headers: headers });
      let empresas=this.http.get<any>(APIAdmin+'catalogo/?catalogo=empresas&filtro1='+encodeURIComponent('id='+idempresa), { headers: headers });
      let proyectos=this.http.get<any>(API+'catalogos/?catalogo=vwProyectos&filtro1='+encodeURIComponent('nivelEstructura='+idCC+' and idEmpresas='+idempresa), { headers: headers });
      let bancos=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=bancos`, { headers: headers });
      let cuentas=this.http.get<any>(API+'catalogos/?catalogo=vwDatosBancariosEmpresas&filtro1='+encodeURIComponent('idEmpresas='+idempresa+' and descripcionTipoCuenta="Pago"'), { headers: headers });
      return forkJoin([monedas,centrosCostos,empresas,proyectos,bancos,cuentas]);  
  }  

  public getUsuario (id:any,idempresa:any) : Observable<any>  {        
    let usuario=this.http.get<any>(API+'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1='+encodeURIComponent('idOcupantePuesto='+id+' and idEmpresas='+idempresa ), { headers: headers });
    return forkJoin([usuario]);         
  }
   
 }
 
 /**
   * componente Principal para listar y editar los layout 
   */
 @Component({
   selector: 'generar-layout',
   templateUrl: 'generar-layout.html',
 })
  /** El nombre del modulo GeneraLayoutDialog */
 
 export class GeneraLayoutDialog {
   LayoutArr: any;
   LayoutListado:MatTableDataSource<any>;
   InfoLayout: any;
   TotalPagar:number=0;
   cuenta:any;
   formapago:any;
   Tipogasto:any; 
   searchText: any;
   FechaI:any;
   btnGda: string='1';
   bloqueo:boolean=true;
   bloqueoCuenta:boolean=true;
   bloqueoBanco:boolean=true;
   NomBancos:any;
   Bancos:any;
   Cuenta:any;
   NomBancosRes: any;
   Cuentas: any;
   workInicial: any;
   workOrigen!:string;
   arrsesion: any;
   MonedaL:any;
   CentroCosto:any;
   Empresas:any;
   idRol:any;
   datSess:any; 
   @ViewChild(MatSort) sort: MatSort = Object.create(null);
   @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
   @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
   displayedColumns:string[]=['NombreColaborador','TipoTransaccion','estatus','montoAprobado','MontoaPagar','MonedaPago'];  
 /**
  * Consulta catálogos y servicios.
  * 
  * 
  */
   constructor(public dialogRefE: MatDialogRef<GeneraLayoutDialog>,
     private mensajes: MensajesService,
     private dialogService: DialogService,
     @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
     private http: HttpClient,
     private token: TokenService) {
      this.datSess=token.readToken('id','');
      this.datSess=this.datSess.split(','); 
      this.idRol=token.readToken('rlsRol','GASTOS');
       this.arrsesion= JSON.parse(window.sessionStorage.getItem("persona")!);
       this.workInicial= JSON.parse(window.sessionStorage.getItem("workflow")!);
       this.MonedaL= JSON.parse(window.sessionStorage.getItem("moneda")!);
       this.CentroCosto= JSON.parse(window.sessionStorage.getItem("centrocostos")!);
       this.NomBancos=JSON.parse(window.sessionStorage.getItem("banco")!);
       this.NomBancosRes= JSON.parse(window.sessionStorage.getItem("bancores")!);
       this.Cuentas= JSON.parse(window.sessionStorage.getItem("cuentas")!);
       this.Empresas= JSON.parse(window.sessionStorage.getItem("empresa")!);
       console.log(data.layout);      
       this.InfoLayout=data.config;
       console.log(this.InfoLayout);      
       this.LayoutArr=data.layout;
       this.LayoutArr.map((t1:any) =>{ 
         this.TotalPagar=this.TotalPagar+t1.montoAprobado;
         t1.MontoaPagar=t1.montoAprobado;
       });
       this.InfoLayout.MontoPagar=this.TotalPagar;
       this.LayoutListado = new MatTableDataSource(this.LayoutArr);
       this.LayoutListado.paginator = this.paginator!;
       this.LayoutListado.sort = this.sort;
       this.Bancos=this.NomBancos.filter((ban:any)=>{ ban.idMoneda==this.LayoutArr.idMoneda;});
       this.Cuenta=this.Cuentas.filter((cuen:any)=>{ cuen.BancoEmisor==this.LayoutArr.BancoEmisor;});
   }
 /**
   * @function
   * @name cambiaEmp 
   * Metodo que cambia por Empresa 
   */
   cambiaEmp(evento:any, arr:any){
     this.Cuenta=[];
     this.Cuentas.map((cuen:any)=>{
       if(cuen.BancoEmisor==evento.value){
         this.Cuenta.push(cuen);
       }
    });
     this.bloqueoCuenta=false;
   }
 /**
   * @function
   * @name cambiaMoneda 
   * Metodo que habilita por cambio de tipo de moneda 
   */
   cambiaMoneda(evento:any, arr:any){
     this.Bancos=[];
     this.NomBancos.map((ban:any)=>{
       if(ban.idMoneda==evento.value){
         this.Bancos.push(ban);
       }
    });    
     this.bloqueoBanco=false;
   }
 
   Cambio(evento:any, arr:any, campo:string){ 
     let valor:any, suma:number=0;
     if(evento.value){
        valor=evento.value;
     } else{
       valor=evento.target.value;
     }  
     this.LayoutListado.data.map((t1) => {
       if (t1.id === arr.id) { 
         t1.MontoaPagar=Number(valor);
         if(t1.MontoaPagar > t1.montoAprobado){
           this.mensajes.mensaje('El monto a pagar no puede ser mayor al Saldo Pendiente de Pago.','','danger');
           t1.MontoaPagar=0;
         }  
       }
       suma=suma+t1.MontoaPagar;  
     });
     this.InfoLayout.MontoPagar=Number(suma);            
   }
 
  /**
   * @function
   * @name aceptarDialog 
   * Metodo que controla el dialogo para generar un Layout
   */
   aceptarDialog() {
     this.dialogService.openConfirmDialog(`¿Esta seguro que desea Generar un Layout con ${this.InfoLayout.NumRegistros} registros y un monto total de ${this.InfoLayout.MontoPagar} ${this.InfoLayout.Moneda}?`)
       .afterClosed().subscribe(res =>{
         console.log(res);
         if(res){     
           this.dialogRefE.close({ arrLayout:this.InfoLayout});
         } 
     });
   }
 /**
   * @function
   * @name cerrarDialog 
   * Metodo que controla el dialogo para generar un Layout
   */
   cerrarDialog() {
     this.dialogService.openConfirmDialog('¿ Esta seguro que desea salir sin guardar los cambios ?')
       .afterClosed().subscribe(res =>{
         console.log(res);
         if(res){          
           this.dialogRefE.close({});
         } 
     });    
   }
   public getDatos (idempresa:any, idCC:any) : Observable<any>  {
      let monedas=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=monedas`, { headers: headers });
      let tipoSolicitud=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=tipoSolicitud`, { headers: headers });        
      let centrosCostos=this.http.get<any>(API+'catalogos/?catalogo=vwCentrosCostos&filtro1='+encodeURIComponent('idEstructura='+idCC+' and idEmpresas='+idempresa), { headers: headers });
      let empresas=this.http.get<any>(APIAdmin+'catalogo/?catalogo=empresas&filtro1='+encodeURIComponent('id='+idempresa), { headers: headers });
      let proyectos=this.http.get<any>(API+'catalogos/?catalogo=vwProyectos&filtro1='+encodeURIComponent('nivelEstructura='+idCC+' and idEmpresas='+idempresa), { headers: headers });
      let tipoGastos=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=tipoGastos&filtro1=idEmpresas=${idempresa}`, { headers: headers });
      let formasPagos=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=formasPago`, { headers: headers }); 
      return forkJoin([monedas,tipoSolicitud,centrosCostos,empresas,proyectos,tipoGastos,formasPagos]);  
  }  

  public getUsuario (id:any,idempresa:any) : Observable<any>  {        
    let usuario=this.http.get<any>(API+'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1='+encodeURIComponent('idOcupantePuesto='+id+' and idEmpresas='+idempresa ), { headers: headers });
    return forkJoin([usuario]);         
  }
 }
 
 /**
   * componente Principal para listar y editar los reportes 
   */
 @Component({
   selector: 'configurar-cuenta',
   templateUrl: 'configurar-cuenta.html',
 })
  /** El nombre del modulo ConfiguraCuentaDialog */
 
 export class ConfiguraCuentaDialog {
   ConfigurarPago: any;
   InfoLayout: any;
   TotalPagar:number=0;
   cuenta:any;
   formapago:any;
   Tipogasto:any; 
   searchText: any;
   FechaI:any;
   btnGda: string='1';
   bloqueo:boolean=true;
   bloqueoCuenta:boolean=true;
   bloqueoBanco:boolean=true;
   bloqTC: boolean=true;
   NomBancos:any;
   Bancos:any;
   Cuenta:any;
   NomBancosRes: any;
   Cuentas: any;
   arrsesion: any;
   MonedaL:any;
   Proyectos:any;
   CentroCosto:any;
   Empresas:any;
   idRol:any;
   datSess:any;
   catransaccion:any=[]; 
   @ViewChild(MatSort) sort: MatSort = Object.create(null);
   @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
   @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
   displayedColumns:string[]=['NombreColaborador','TipoTransaccion','estatus','montoAprobado','MontoaPagar',];
   
  /**
  * Consulta catálogos y servicios.
  * 
  * 
  */ 
   constructor(public dialogRefCon: MatDialogRef<ConfiguraCuentaDialog>,
     private mensajes: MensajesService,
     private dialogService: DialogService,
     private invoiceService: ServiceinvoiceService, 
     @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
     private http: HttpClient,
     private token: TokenService) {
      this.datSess=token.readToken('id','');
      this.datSess=this.datSess.split(','); 
      this.idRol=token.readToken('rlsRol','GASTOS');
       this.arrsesion= JSON.parse(window.sessionStorage.getItem("persona")!);
       this.MonedaL= JSON.parse(window.sessionStorage.getItem("moneda")!);
       this.CentroCosto= JSON.parse(window.sessionStorage.getItem("centrocostos")!);
       this.Proyectos= JSON.parse(window.sessionStorage.getItem("proyecto")!);
       this.NomBancos=JSON.parse(window.sessionStorage.getItem("banco")!);
       this.NomBancosRes= JSON.parse(window.sessionStorage.getItem("bancores")!);
       this.Cuentas= JSON.parse(window.sessionStorage.getItem("cuentas")!);
       this.Empresas = JSON.parse(window.sessionStorage.getItem("empresa")!);
       this.ConfigurarPago = this.invoiceService.getConfigPagoD();
       this.catransaccion = this.invoiceService.getTipoTransaccionCat();  
       console.log(data);
       
       this.ConfigurarPago= this.ConfigurarPago.map(
           (t1:any) => ({
             ...t1, ...this.arrsesion.find((t2:any) => t2.idUser === t1.idUser),
             ...t1, ...this.MonedaL.find((t2:any) => t2.idMoneda === t1.idMoneda),
             ...t1, ...this.NomBancos.find((t2:any) => t2.BancoEmisor === t1.idBancoEmisor),
             ...t1, ...this.Cuentas.find((t2:any) => t2.idCuenta === t1.idCuenta)
             })
           ) 
           this.ConfigurarPago=this.ConfigurarPago[0];
           this.ConfigurarPago.fechaGenLayout=moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
         console.log(this.ConfigurarPago);
 /*
       this.Bancos=this.NomBancos.filter((ban:any)=>{
           ban.idMoneda==this.LayoutArr.idMoneda;
       });
       this.Cuenta=this.Cuentas.filter((cuen:any)=>{
         cuen.BancoEmisor==this.LayoutArr.BancoEmisor;
       });*/
   }
 /**
   * @function
   * @name cambiaTransaccion 
   * Metodo que switchea el tipo de transacción en Anticipos y Reembolsos 
   */
   cambiaTransaccion(evento:any, arr:any){
     this.ConfigurarPago.tipoTransaccion=(evento.source.selected as MatOption).viewValue; 
     this.ConfigurarPago.idTipoTransaccion=evento.value; 
   }
    /**
   * @function
   * @name cambiaCta 
   * Metodo que habilita por cambio de cuenta 
   */
   cambiaCta(evento:any, arr:any){
     //this.ConfigurarPago.Cuenta=(evento.source.selected as MatOption).viewValue; 
     this.ConfigurarPago.Cuenta=evento.value;
     this.ConfigurarPago.idCuenta=evento.value; 
   }
 
   cambiaTipoCambio(evento:any, arr:any){
     //this.ConfigurarPago.TipoCambio=evento.value; 
   }
  /**
   * @function
   * @name cambiaEmp 
   * Metodo que habilita por cambio de Empresa 
   */
   cambiaEmp(evento:any, arr:any){
     this.ConfigurarPago.Banco=(evento.source.selected as MatOption).viewValue; 
     this.ConfigurarPago.idBancoEmisor=evento.value;
     this.Cuenta=[];
     this.Cuentas.map((cuen:any)=>{
       if(cuen.BancoEmisor==evento.value){
         this.Cuenta.push(cuen);
       }
    });
     this.bloqueoCuenta=false;
   }
  /**
   * @function
   * @name cambiaMoneda 
   * Metodo que habilita por cambio de Moneda 
   */
   cambiaMoneda(evento:any, arr:any){
     this.ConfigurarPago.Moneda=(evento.source.selected as MatOption).viewValue; 
     this.ConfigurarPago.idMoneda=evento.value;
     this.Bancos=[];
     this.NomBancos.map((ban:any)=>{
       if(ban.idMoneda==evento.value){
         this.Bancos.push(ban);
       }
    }); 
    this.bloqTC = this.ConfigurarPago.Moneda=='MXN'?true:false;
     this.bloqueoBanco=false;
   }
 
   Cambio(evento:any, arr:any, campo:string){ 
     let valor:any, suma:number=0;
     if(evento.value){
        
     } else{
       
     } 
               
   }
   /**
   * @function
   * @name aceptarDialog 
   * Metodo que controla el dialogo 
   */
   aceptarDialog() {
     this.dialogService.openConfirmDialog('¿ Esta seguro que desea guardar los cambios ?')
       .afterClosed().subscribe(res =>{
         console.log(res);
         if(res){     
           this.dialogRefCon.close({ arrConfig:this.ConfigurarPago});
           
         } 
     });
   }
   /**
   * @function
   * @name cerrarDialog 
   * Metodo que controla el dialogo 
   */
   cerrarDialog() {
     this.dialogService.openConfirmDialog('¿ Esta seguro que desea salir sin guardar los cambios ?')
       .afterClosed().subscribe(res =>{
         console.log(res);
         if(res){          
           this.dialogRefCon.close({ event: 'Cancel' });
         } 
     });    
   }

   public getDatos (idempresa:any, idCC:any) : Observable<any>  {
      let monedas=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=monedas`, { headers: headers });
      let tipoSolicitud=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=tipoSolicitud`, { headers: headers });        
      let centrosCostos=this.http.get<any>(API+'catalogos/?catalogo=vwCentrosCostos&filtro1='+encodeURIComponent('idEstructura='+idCC+' and idEmpresas='+idempresa), { headers: headers });
      let empresas=this.http.get<any>(APIAdmin+'catalogo/?catalogo=empresas&filtro1='+encodeURIComponent('id='+idempresa), { headers: headers });
      let proyectos=this.http.get<any>(API+'catalogos/?catalogo=vwProyectos&filtro1='+encodeURIComponent('nivelEstructura='+idCC+' and idEmpresas='+idempresa), { headers: headers });
      let tipoGastos=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=tipoGastos&filtro1=idEmpresas=${idempresa}`, { headers: headers });
      let formasPagos=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=formasPago`, { headers: headers }); 
      return forkJoin([monedas,tipoSolicitud,centrosCostos,empresas,proyectos,tipoGastos,formasPagos]);  
  }  

  public getUsuario (id:any,idempresa:any) : Observable<any>  {        
    let usuario=this.http.get<any>(API+'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1='+encodeURIComponent('idOcupantePuesto='+id+' and idEmpresas='+idempresa ), { headers: headers });
    return forkJoin([usuario]);         
  }
 }
 
 
 