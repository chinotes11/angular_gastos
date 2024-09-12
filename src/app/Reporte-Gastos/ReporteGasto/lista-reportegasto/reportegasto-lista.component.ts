/** Modulo Angular que muestra un listado con Devoluciones 
 * @module 1. Listado de Reporte Gastos
 * reembolso-lista.component.ts  
 */
 import { Component, AfterViewInit, ViewChild, OnInit, OnDestroy, Provider } from '@angular/core';
 import { DialogService } from '../../acciones/dialog.service';
 import { MatTable, MatTableDataSource } from '@angular/material/table';
 import { MatSort, Sort } from '@angular/material/sort';
 import { MatPaginator } from '@angular/material/paginator';
 import { ActivatedRoute, Data, NavigationEnd, Router } from '@angular/router';
 import { MatDialog } from '@angular/material/dialog';
 import { DatePipe } from '@angular/common';
 import { forkJoin, Observable, Subscription, throwError } from 'rxjs';
 import { SelectionModel } from '@angular/cdk/collections';
 import { catchError, filter, map, mergeMap } from 'rxjs/operators';
 import { Title } from '@angular/platform-browser';
 import { FormControl, FormGroupDirective, NgForm} from '@angular/forms';
 import { ErrorStateMatcher} from '@angular/material/core';
 import { DataService } from "../../../Genericos/data.service";
 import { serviciosService } from "../../../Genericos/servicios/servicios.service";
 import * as _moment from 'moment';
 import { MatCheckboxChange } from '@angular/material/checkbox';
 import { ExcelServiceService } from '../../../Genericos/excelService/ExcelService.service';
 import { HttpClient, HttpHeaders } from '@angular/common/http';
 import { environment } from '../../../../environments/environment';
 import { TokenService } from '../../../auth/token/token.service';
 import { funciones } from '../../../Genericos/utilidades/funciones';
 import { MensajesService } from "../../../Genericos/mensajes/mensajes.service";
 const API = environment.ApiUrl;
 const APIAdmin= environment.ApiUrlAdmin;
 const headers = new HttpHeaders   
 const options2 = { style: 'currency', currency: 'MXN' };
 const numberFormat2 = new Intl.NumberFormat('es-MX', options2);
 const moment = _moment;
 
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
   templateUrl: './reportegasto-lista.component.html',
   styleUrls: ['./reportegasto-lista.component.scss']
 })
  /** El nombre del modulo ListaReembolsosComponent. */
 
 export class ListaReporteGastoComponent implements OnInit, OnDestroy, AfterViewInit {
   reporteGasto: MatTableDataSource<any>;
   reporteGastoOrig:any=[];
   subscription!: Subscription;
   selection = new SelectionModel<any>(true, []);
   pageInfo: Data = Object.create(null);
   message: any;
   arrsesion: any;
   TipoSol:any;
   MonedaL:any;
   arrSelecto:any;
   copia: string= '0';
   tolerancia: any;
   FechaTolerancia: boolean = false;
   toleraDias:any;
   displayedColumns: string[] = ['select','id', 'notas', 'createdAt', 'fechaIni', 'fechaFin',  'montoAprobado', 'estatus', 'idAnticipoFondos','monto', 'rfId','rfMonto', 'rrId','rrMonto'];//, 'moneda''montoComprobado',
   @ViewChild(MatSort) sort: MatSort = Object.create(null);
   @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
   @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
      /**
       * Consulta catálogos y servicios, asi cómo inicializa el método principal que carga la información
       * 
       * 
       */
   constructor(private servicios: serviciosService,
     public dialog: MatDialog, 
     public datePipe: DatePipe,
     private router: Router,
     private titleService: Title,    
     private activatedRoute: ActivatedRoute,
     private excelExporta:ExcelServiceService,
     private dialogService: DialogService,
     private datosPaso: DataService,
     private http: HttpClient,
     private mensajes: MensajesService,
     private token: TokenService) {
      let datSess:any=token.readToken('id','')
      datSess=datSess.split(',');
      this.reporteGasto = new MatTableDataSource();  
      this.getUsuario(datSess[0],datSess[1]).subscribe(rsUs => {
        this.arrsesion=rsUs[0];    
        this.tolerancia = rsUs[1];
        this.validaTolerancias(this.tolerancia[0])
        this.arrsesion.map((t1:any) =>{t1.NombreCompleto= `${t1.nombre} ${t1.apellidoPaterno} ${t1.apellidoMaterno}`; t1.idUser=t1.idOcupantePuesto; t1.idEmpresa=datSess[1]; });
        this.getDatos(datSess[1]).subscribe(resp => {
            this.MonedaL= resp[0];
            this.TipoSol=resp[1];         
            this.Inicio('reportes','?idEmpresa='+datSess[1]);
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
   * @param {string} reportes 
   * @returns {Array.<string>} Regresa el servicio reportes consultado correspondiente al idUser
   */
   Inicio(tabla:any, param:any){    
     let providers: Provider[] = []; 
     this.servicios.getUnParametro(tabla, param)
     .pipe( catchError(err => { this.reporteGasto = new MatTableDataSource(); return throwError(err); })
     ).subscribe(
       (res:any) => {
         console.log(res);
         let reporteGastoData = res;//.map( (t1:any) => ({...t1, ...this.arrsesion.find((t2: { idUser: any; }) => t2.idUser === t1.idUser)}));
          /*
           forkJoin(
             providers.map(n =>  this.servicios.getUnParametro('gastosnofiscales', `?idGasto=${n}`)   
             )).subscribe((n: Provider[][]) => {                   
             }),(err:any) => { console.log(err); };
          */ 
         
         reporteGastoData.map((t1:any ) =>{ 
           t1.idMoneda='MXN'; 
           t1.moneda=t1.moneda?this.MonedaL.filter((mon:any) => mon.id == t1.idMoneda)[0].clave:'';
           t1.diasDura=moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days')<0?0:moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days');
         });
         console.log('reporteGastoData',reporteGastoData);
         this.reporteGasto = new MatTableDataSource(reporteGastoData);
         this.reporteGasto.paginator = this.paginator!;
         this.reporteGasto.sort = this.sort;
         this.reporteGastoOrig=this.reporteGasto.data;         
         const sortState: Sort = {active: 'createdAt', direction: 'desc'};
         this.sort.active = sortState.active;
         this.sort.direction = sortState.direction;
         this.sort.sortChange.emit(sortState); 
        },
       (err:any) => {  },
       () => {console.log('Termino'); }
     );    
   }

  validaTolerancias(tolera:any){
    console.log(tolera, '  - ' , tolera.id)
    if(tolera.id){
      if(!tolera.diasInicioComp && !tolera.diasFinComp){
        this.FechaTolerancia = true ;
      } else{
        if(tolera.diasInicioComp){        
          this.FechaTolerancia = moment(Date.now()).isBetween(moment().startOf('month'), moment().startOf('month').add(tolera.diasInicioComp,'d'));
        } else{
          this.FechaTolerancia = moment(Date.now()).isBetween(moment().endOf('month').subtract(tolera.diasFinComp,'d'), moment().endOf('month'));
        }  
      }
    } else{
      this.FechaTolerancia = true ;
    }
  }

  toleranciaVal(){
    let msj = this.tolerancia[0].diasInicio? `los primeros ${this.tolerancia[0].diasInicio} dias del siguiente mes para crear un reporte de gastos.`:`los ultimos ${this.tolerancia[0].diasFin} dias del siguiente mes para crear un reporte de gastos.`
    this.mensajes.mensaje(`Debe esperar hasta ${msj}`,'','zazz');    
  }
   
   ngAfterViewInit() {   
   }
 
   ngOnInit() {
    this.subscription = this.datosPaso.currentMessage.subscribe((message) => {this.message = message; this.BuscarFiltro(message);}); // {{message[0].filtro.name}}
  }
  /**
  * @function
  * @name BuscarFiltro
  * Metodo que Busca en el tabulado 
  * @returns {Array.<string>} Regresa un Array 
  */
  BuscarFiltro(json:any) {
   let filtros=json[0]
   let filtrado=filtros.filtro
   delete filtrado.titulo; 
    if(this.reporteGasto.data.length != this.reporteGastoOrig.length ){      
     this.reporteGasto.data=this.reporteGastoOrig;
     if(filtrado.fechaIni && filtrado.fechaFin){
       let filtroFecha=this.reporteGasto.data.filter(function(item:any){
        return new Date(item.createdAt+' 00:00:00') >= new Date(filtrado.fechaIni+' 00:00:00') && new Date(item.createdAt+' 00:00:00') <= new Date(filtrado.fechaFin+' 00:00:00');
        });
        delete filtrado.fechaIni; 
        delete filtrado.fechaFin; 
        const filteredData = funciones.buscarJsonEnJson(filtroFecha,filtrado);
        this.reporteGasto.data=filteredData;        
      } else {
         delete filtrado.fechaIni; 
         delete filtrado.fechaFin; 
         const filteredData = funciones.buscarJsonEnJson(this.reporteGasto.data,filtrado);
        this.reporteGasto.data=filteredData;
      }
   } else {
     if(filtrado.fechaIni && filtrado.fechaFin){
      let filtroFecha=this.reporteGasto.data.filter(function(item:any){
        return new Date(item.createdAt+' 00:00:00') >= new Date(filtrado.fechaIni+' 00:00:00') && new Date(item.createdAt+' 00:00:00') <= new Date(filtrado.fechaFin+' 00:00:00');
       });
       delete filtrado.fechaIni; 
       delete filtrado.fechaFin; 
       const filteredData = funciones.buscarJsonEnJson(filtroFecha,filtrado);
       this.reporteGasto.data=filteredData;        
     } else {
       delete filtrado.fechaIni; 
       delete filtrado.fechaFin; 
       const filteredData = funciones.buscarJsonEnJson(this.reporteGasto.data,filtrado);
       this.reporteGasto.data=filteredData;
     } 
   }  
  }
  
  limpiarfiltros(){
   this.reporteGasto.data=this.reporteGastoOrig;     
  }

  getMonto(monto:any) {
    return numberFormat2.format(Number(monto));
  }
 
   ngOnDestroy() {
     this.subscription.unsubscribe();
   }
 
   pasoFiltros() {
     this.datosPaso.changeMessage([{filtro:'',tipo:''}])
   }
 
   filter(filterValue: string) {
     this.reporteGasto.filter = filterValue.trim().toLowerCase();
   }
  /**
   * @function
   * @name deleteAnticipos
   * Borra del arreglo de la tabla un row seleccionado
   * @returns  {array} un nuevo array sin el row borrado
   */
   deleteAnticipos(row: number) {
     if (confirm('Borrar ?')) {
       //this.anticipoService.deleteAnticipos(row);
       this.reporteGasto.data = this.reporteGasto.data.filter(anticipo => anticipo.id !== row);
     }
   }
  /**
   * @function
   * @name isAllSelected
   * Si el número de elementos seleccionados coincide con el número total de filas  
   * @returns  {Boolean} true false
   */  
   isAllSelected() {
       const numSelected = this.selection.selected.length;
       const numRows = this.reporteGasto.data.length;
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
           this.reporteGasto.data.forEach(row => this.selection.select(row));
   }
  /**
   * @function
   * @name checkboxLabel
   * La etiqueta de la casilla de verificación en la fila pasada 
   */
   checkboxLabel(row?: any): string {          
       if (!row) {          
           return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
       }
       return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
   }
 
   showOptions(event:MatCheckboxChange, arr:any): void {
     this.copia=this.selection.selected.length===1?'1':'0';
   }
  /**
   * @function
   * @name exportar
   * Metodo que exporta a excel los tabulados seleccionados
   * @returns {Array.<string>} Regresa un Array 
   */
   exportar(){    
     this.selection.selected.length===0?this.generaExcel(this.reporteGasto.data):this.generaExcel(this.selection.selected); 
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
          IdReporte:ex.id,
          Motivo:ex.notas,
          FechaInicio:ex.fechaIni,
          FechaFin:ex.fechaFin,
          Comprobado:ex.monto,
          Aprobado:ex.montoAprobado,
          Moneda:ex.idMoneda,
          IdAnticipo:ex.idAnticipoFondos,
          Monto:ex.monto,
          ReembolsoRRID:ex.rrId?ex.rrId:0,
          DevoluciónRFID:ex.rrMonto?ex.rrMonto:0,         
         })
         
       }); 
     this.excelExporta.exportAsExcelFile(exportar, 'Reporte_Gasto_'+this.arrsesion[0].idUser); 
   }

   public getDatos (idempresa:any) : Observable<any>  {        
    let monedas=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=monedas`, { headers: headers });
    let tipoSolicitud=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=tipoSolicitud`, { headers: headers });
    return forkJoin([monedas,tipoSolicitud]);         
  }

  public getUsuario (id:any,idempresa:any) : Observable<any>  {        
    let usuario=this.http.get<any>(API+'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1='+encodeURIComponent('idOcupantePuesto='+id+' and idEmpresas='+idempresa ), { headers: headers });
    let tolerancia = this.http.get<any>(API + 'catalogos/?catalogo=vwEmpresasToleranciasGastos&filtro1=' + encodeURIComponent('idEmpresas=' + idempresa), { headers: headers });
    return forkJoin([usuario, tolerancia]);       
  }
 
 }
 