/** Modulo Angular que muestra un listado con Devoluciones 
 * @module 1. Listado de Reembolsos
 * reembolso-lista.component.ts  
 */
 import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
 import { ServiceinvoiceService } from '../reembolso.service';
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
 import { ErrorStateMatcher } from '@angular/material/core';
 import { DataService } from "../../../Genericos/data.service";
 import { serviciosService } from "../../../Genericos/servicios/servicios.service";
 import * as _moment from 'moment';
 import { ExcelServiceService } from '../../../Genericos/excelService/ExcelService.service';
 import { MatCheckboxChange } from '@angular/material/checkbox';
 import { HttpClient, HttpHeaders } from '@angular/common/http';
 import { environment } from '../../../../environments/environment';
 import { TokenService } from '../../../auth/token/token.service';
 import { funciones } from '../../../Genericos/utilidades/funciones';
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
   templateUrl: './reembolso-lista.component.html',
   styleUrls: ['./reembolso-lista.component.scss']
 })
  /** El nombre del modulo ListaReembolsosComponent. */
 
 export class ListaReembolsosComponent implements OnInit, OnDestroy {
 
   reembolsoList:MatTableDataSource<any>;
   reembolsoListOrig:any=[];
   subscription!: Subscription;
   selection = new SelectionModel<any>(true, []);
   pageInfo: Data = Object.create(null);
   message: any;
   arrsesion: any;
   TipoComprobante:any;
   arrSelecto:any;
   MonedaL:any;
   Empresa:any;
   idRol:any;
   datSess:any;
   displayedColumns: string[] = ['select','id','monto','estatus','createdAt','idUser','NombreCompleto','idReportesGastos','motivo','idAnticiposFondos']; 
   @ViewChild(MatSort) sort: MatSort = Object.create(null);
   @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
   @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
      /**
       * Consulta catálogos y servicios, asi cómo inicializa el método principal que carga la información
       */
   constructor(private invoiceService: ServiceinvoiceService,
     private servicios: serviciosService,
     private excelExporta:ExcelServiceService,
     public dialog: MatDialog, 
     public datePipe: DatePipe,
     private router: Router,
     private titleService: Title,
     private activatedRoute: ActivatedRoute,
     private datosPaso: DataService,
     private http: HttpClient,
     private token: TokenService) {
      this.datSess=token.readToken('id','');
      this.datSess=this.datSess.split(',');  
      this.idRol=token.readToken('rlsRol','GASTOS'); 
      this.reembolsoList = new MatTableDataSource();
      this.getUsuario(this.datSess[0],this.datSess[1]).subscribe(rsUs => {
        this.arrsesion=rsUs[0];    
        this.arrsesion.map((t1:any) =>{t1.NombreCompleto= `${t1.nombre} ${t1.apellidoPaterno} ${t1.apellidoMaterno}`; t1.idUser=t1.idOcupantePuesto; t1.idEmpresa=this.datSess[1]; });
        this.getDatos(this.datSess[1]).subscribe(resp => {
          this.MonedaL= resp[0];
          this.Empresa=resp[1];     
          this.TipoComprobante=tipocomprobantes;
          this.Inicio('reembolsos','?idEmpresa='+this.datSess[1]);
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
   * @param {string} reembolsos 
   * @returns {Array.<string>} Regresa el servicio reembolsos consultado correspondiente al idUser
   */
   Inicio(tabla:any, param:any){
    this.servicios.getUnParametro(tabla, param)
     .pipe(  catchError(err => { this.reembolsoList = new MatTableDataSource(); return throwError(err); })  )
     .subscribe(
       (res:any) => {
         let reembolsoListData= res;//.map(  (t1:any) => ({ ...t1, ...this.arrsesion.find((t2:any) => t2.idUser === t1.idUser) }) );
         console.log('reembolsos',reembolsoListData);
           reembolsoListData.map((t1:any) =>{   
            t1.NombreCompleto= `${t1.nombre} ${t1.apellidoPaterno} ${t1.apellidoMaterno}`; 
             t1.moneda=this.MonedaL.filter((mon:any) => mon.id == Number(t1.idMoneda))[0].clave;
             t1.empresa=this.Empresa.filter((emp:any) => emp.id == t1.idEmpresa)[0].descripcion ;
           }) 
         console.log('reembolsos',reembolsoListData);
         this.reembolsoList = new MatTableDataSource(reembolsoListData);
         this.reembolsoList.paginator = this.paginator!;
         this.reembolsoList.sort = this.sort;
         this.reembolsoListOrig=this.reembolsoList.data;
         const sortState: Sort = {active: 'createdAt', direction: 'desc'};
         this.sort.active = sortState.active;
         this.sort.direction = sortState.direction;
         this.sort.sortChange.emit(sortState); 
        },
       (err:any) => {  });  
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
     if(this.reembolsoList.data.length != this.reembolsoListOrig.length ){      
      this.reembolsoList.data=this.reembolsoListOrig;
      if(filtrado.fechaIni && filtrado.fechaFin){
        let filtroFecha=this.reembolsoList.data.filter(function(item:any){
          return new Date(item.createdAt+' 00:00:00') >= new Date(filtrado.fechaIni+' 00:00:00') && new Date(item.createdAt+' 00:00:00') <= new Date(filtrado.fechaFin+' 00:00:00');
         });
         delete filtrado.fechaIni;
        delete filtrado.fechaFin;
        const filteredData = funciones.buscarJsonEnJson(filtroFecha,filtrado);
         this.reembolsoList.data=filteredData;        
       } else {
        delete filtrado.fechaIni;
        delete filtrado.fechaFin;
        const filteredData = funciones.buscarJsonEnJson(this.reembolsoList.data,filtrado);
         this.reembolsoList.data=filteredData;
       }
    } else {
      if(filtrado.fechaIni && filtrado.fechaFin){
       let filtroFecha=this.reembolsoList.data.filter(function(item:any){
        return new Date(item.createdAt+' 00:00:00') >= new Date(filtrado.fechaIni+' 00:00:00') && new Date(item.createdAt+' 00:00:00') <= new Date(filtrado.fechaFin+' 00:00:00');
        });
        delete filtrado.fechaIni;
        delete filtrado.fechaFin;
        const filteredData = funciones.buscarJsonEnJson(filtroFecha,filtrado);
         this.reembolsoList.data=filteredData;        
       } else {
        delete filtrado.fechaIni;
        delete filtrado.fechaFin;
        const filteredData = funciones.buscarJsonEnJson(this.reembolsoList.data,filtrado);
         this.reembolsoList.data=filteredData;
      } 
    }  
   }
   
   limpiarfiltros(){
    this.reembolsoList.data=this.reembolsoListOrig;     
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
  /**
   * @function
   * @name isAllSelected
   * Si el número de elementos seleccionados coincide con el número total de filas  
   * @returns  {Boolean} true false
   */
   isAllSelected() {
     const numSelected = this.selection.selected.length;
     const numRows = this.reembolsoList.data.length;
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
           this.reembolsoList.data.forEach(row => this.selection.select(row));
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
 
   showOptions(event:MatCheckboxChange, arr:any): void { }
  /**
   * @function
   * @name exportar
   * Metodo que exporta a excel los tabulados seleccionados
   * @returns {Array.<string>} Regresa un Array 
   */
   exportar(){    
     this.selection.selected.length===0?this.generaExcel(this.reembolsoList.data):this.generaExcel(this.selection.selected); 
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
          IdReembolso:ex.id,
          Monto:ex.monto,
          Estatus:ex.estatus,
          FechaRegistro:moment(new Date(ex.createdAt)).format("MM/DD/YYYY"),
          CID:ex.idUser,
          Nombre:ex.NombreCompleto,
          idReporteGastos:ex.idReportesGastos,
          Motivo:ex.motivo,          
          idAnticipo:ex.idAnticiposFondos
         })        
       }); 
     this.excelExporta.exportAsExcelFile(exportar, 'reembolsos_'+this.arrsesion[0].idUser); 
   }
 
   filter(filterValue: string) {
     this.reembolsoList.filter = filterValue.trim().toLowerCase();
   }
 
   /////////////////////////////////////////////////////////////////////////////////////////////////////////// 
 
   deleteGastosZ(row: number) {/*
 
     if (confirm('Are you sure you want to delete this record ?')) {
       this.invoiceService.deleteGastosZ(row);
       this.GastosList.data = this.GastosList.data.filter(invoice => invoice.idgasto !== row);
     }*/
   }

   public getDatos (idempresa:any) : Observable<any>  {
      let monedas=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=monedas`, { headers: headers });
      let empresas=this.http.get<any>(APIAdmin+'catalogo/?catalogo=empresas&filtro1='+encodeURIComponent('id='+idempresa), { headers: headers });
      return forkJoin([monedas,empresas]);  
    }  

    public getUsuario (id:any,idempresa:any) : Observable<any>  {        
      let usuario=this.http.get<any>(API+'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1='+encodeURIComponent('idOcupantePuesto='+id+' and idEmpresas='+idempresa ), { headers: headers });
      return forkJoin([usuario]);         
    }
 
 }
 