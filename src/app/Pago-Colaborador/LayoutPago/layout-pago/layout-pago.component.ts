/** Modulo Angular que muestra un listado de Layout de Pagos 
 * @module 1. lista Layout Pago
 * layout-pago.component.ts  
 */
 import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
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
 import * as FileSaver from 'file-saver';
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
   * componente Principal para listar y editar los layout 
   */
 @Component({
   //selector: 'app-layout-pago',
   templateUrl: './layout-pago.component.html',
   styleUrls: ['./layout-pago.component.scss']
 })
  /** El nombre del modulo LayoutPagoComponent */
 
 export class LayoutPagoComponent implements OnInit {
   pagoList:MatTableDataSource<any>;
   pagoListOrig:any=[];
   subscription!: Subscription;
   selection = new SelectionModel<any>(true, []);
   pageInfo: Data = Object.create(null);
   message: any;
   arrsesion: any;
   colaborador: any;
   transaccion: any;
   arrSelecto:any;
   idRol:any;
   datSess:any; 
   displayedColumns: string[] = ['select','descarga','descripcionEmpresa','idbkl','bancoEmisor','cuentaEmisor','createdAt','monto','monedaEmisor','registros'];  
   @ViewChild(MatSort) sort: MatSort = Object.create(null);
   @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
   @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
 /**
  * Consulta catálogos y servicios.
  */
   constructor(
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
      this.pagoList = new MatTableDataSource();      
      this.getUsuario(this.datSess[0],this.datSess[1]).subscribe(rsUs => {
        this.arrsesion=rsUs[0];    
        this.arrsesion.map((t1:any) =>{ t1.idEmpresa=Number(this.datSess[1]);  t1.idRoles=this.idRol; });
        this.Inicio();
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
   * @param {string} layoutbancario 
   * @returns {Array.<string>} Regresa el servicio layoutbancario consultado correspondiente al idUser vwLayoutBancarioEnvio
   */
   Inicio(){
    this.servicios.getUnParametro('catalogos','?catalogo=vwLayoutBancarioEnvio&filtro1='+encodeURIComponent('idEmpresas='+this.datSess[1]))
     .pipe(catchError(err => { this.pagoList = new MatTableDataSource(); return throwError(err); }) )
     .subscribe(
       (res:any) => {
         console.log(res);
         res.map((t1:any) =>{
           console.log(t1); 
           t1.idbkl=`BKL-${t1.id}`;           
         });       
         console.log('Layout',res);
         this.pagoList = new MatTableDataSource(res);
         this.pagoList.paginator = this.paginator!;
         this.pagoList.sort = this.sort;
         this.pagoListOrig=this.pagoList.data;   
         const sortState: Sort = {active: 'createdAt', direction: 'desc'};
         this.sort.active = sortState.active;
         this.sort.direction = sortState.direction;
         this.sort.sortChange.emit(sortState);
        },
       (err:any) => {  },
       () => {console.log('Termino'); }
     );  
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
     if(this.pagoList.data.length != this.pagoListOrig.length ){      
      this.pagoList.data=this.pagoListOrig;
      if(filtrado.fechaIni && filtrado.fechaFin){
        let filtroFecha=this.pagoList.data.filter(function(item:any){
          return new Date(item.createdAt+' 00:00:00') >= new Date(filtrado.fechaIni+' 00:00:00') && new Date(item.createdAt+' 00:00:00') <= new Date(filtrado.fechaFin+' 00:00:00');
         });
         delete filtrado.fechaIni;
        delete filtrado.fechaFin;
        const filteredData = funciones.buscarJsonEnJson(filtroFecha,filtrado);
        this.pagoList.data = filteredData;
      } else {
        delete filtrado.fechaIni;
        delete filtrado.fechaFin;
        const filteredData = funciones.buscarJsonEnJson(this.pagoList.data,filtrado);
        this.pagoList.data = filteredData;
      }
    } else {
      if(filtrado.fechaIni && filtrado.fechaFin){
       let filtroFecha=this.pagoList.data.filter(function(item:any){
        return new Date(item.createdAt+' 00:00:00') >= new Date(filtrado.fechaIni+' 00:00:00') && new Date(item.createdAt+' 00:00:00') <= new Date(filtrado.fechaFin+' 00:00:00');
        });
        delete filtrado.fechaIni;
        delete filtrado.fechaFin;
        const filteredData = funciones.buscarJsonEnJson(filtroFecha,filtrado);
        this.pagoList.data = filteredData;
      } else {
        delete filtrado.fechaIni;
        delete filtrado.fechaFin;
        const filteredData = funciones.buscarJsonEnJson(this.pagoList.data,filtrado);
        this.pagoList.data = filteredData;
      }
    }  
   }
   
   limpiarfiltros(){
    this.pagoList.data=this.pagoListOrig;     
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
     const numRows = this.pagoList.data.length;
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
           this.pagoList.data.forEach(row => this.selection.select(row));
   }
 
   checkboxLabel(row?: any): string {          
       if (!row) {          
           return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
       }
       return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
   }
 
   showOptions(event:MatCheckboxChange, arr:any): void { }
 
   applyFilter(filterValue: string) {
     this.pagoList.filter = filterValue.trim().toLowerCase();
 }
 /**
   * @function
   * @name exportar
   * Metodo que exporta a excel los tabulados seleccionados
   * @returns {Array.<string>} Regresa un Array 
   */
   exportar(){    
     this.selection.selected.length===0?this.generaExcel(this.pagoList.data):this.generaExcel(this.selection.selected); 
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
          Empresa:ex.descripcionEmpresa,
          BKL_ID:ex.idbkl,
          BancoEmisor:ex.bancoEmisor,
          CuentaEmisora:ex.cuentaEmisor,
          FechaCreacion:moment(new Date(ex.createdAt)).format("MM/DD/YYYY"),
          monto:ex.monto,
          Moneda:ex.monedaEmisor,
          NoRegistros:ex.registros,
        })        
      }); 
    this.excelExporta.exportAsExcelFile(exportar, 'layout_'+this.arrsesion[0].idPuesto); 
  }
 
   filter(filterValue: string) {
     this.pagoList.filter = filterValue.trim().toLowerCase();
   }

   descargar(evento:any, arr:any){
    let valor:any, arch:any;
    console.log('arr',arr)
    if(evento.value){valor=evento.value;} else{valor=evento.target.value;}
    
    console.log(arr.rutaLayout);
    arch=arr.rutaLayout.split('gastos/layoutBancario/');
    console.log(arch[1]);
    
    this.servicios.getFile2('layoutbancario/download',arr.id)
    .pipe(catchError(err => {  console.log(err);   return throwError(err);})
    ).subscribe((txt: any) => {
        saveAs(txt, arch[1]);
    },
      (err:any) => { }); //*/
   }
 
   public getDatos (idempresa:any, idCC:any, usuario:any) : Observable<any>  {
    let monedas=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=monedas`, { headers: headers });
    return forkJoin([monedas]);  
  }  

  public getUsuario (id:any,idempresa:any) : Observable<any>  {        
    let usuario=this.http.get<any>(API+'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1='+encodeURIComponent('idOcupantePuesto='+id+' and idEmpresas='+idempresa ), { headers: headers });
    return forkJoin([usuario]);         
  }
 
 }
 
 
 
 