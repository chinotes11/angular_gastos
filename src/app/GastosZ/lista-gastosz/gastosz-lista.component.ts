/** Modulo Angular que muestra un listado con Gastos 
 * @module 1. ListaGastosZComponent
 * gastosz-lista.component.ts  
 */
 import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
 import { MatTable, MatTableDataSource } from '@angular/material/table';
 import { MatSort, Sort } from '@angular/material/sort';
 import { MatPaginator } from '@angular/material/paginator';
 import { ActivatedRoute, Data, NavigationEnd, Router } from '@angular/router';
 import { MatDialog } from '@angular/material/dialog';
 import { DialogService } from '../acciones/dialog.service';
 import { DatePipe } from '@angular/common';
 import { MensajesService } from "../../Genericos/mensajes/mensajes.service";
 import { forkJoin, Observable, Subscription, throwError } from 'rxjs';
 import { SelectionModel } from '@angular/cdk/collections';
 import { catchError, filter, map, mergeMap } from 'rxjs/operators';
 import { Title } from '@angular/platform-browser';
 import { FormControl, FormGroupDirective, NgForm} from '@angular/forms';
 import { ErrorStateMatcher } from '@angular/material/core';
 import { DataService } from "../../Genericos/data.service";
 import { serviciosService } from "../../Genericos/servicios/servicios.service";
 import * as _moment from 'moment';
 import { ExcelServiceService } from '../../Genericos/excelService/ExcelService.service';
 import { MatCheckboxChange } from '@angular/material/checkbox';
 import { TranslateService } from '@ngx-translate/core';
 import { HttpClient, HttpHeaders } from '@angular/common/http';
 import { environment } from '../../../environments/environment';
 import { TokenService } from '../../auth/token/token.service';
 import { funciones } from '../../Genericos/utilidades/funciones';
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
   templateUrl: './gastosz-lista.component.html',
   styleUrls: ['./gastosz-lista.component.scss']
 })
 /** El nombre del modulo ListaGastosZComponent. */
 export class ListaGastosZComponent implements OnInit, OnDestroy {
 
   GastosList: MatTableDataSource<any>;
   GastosListOrig:any=[];
   subscription!: Subscription;
   selection = new SelectionModel<any>(true, []);
   pageInfo: Data = Object.create(null);
   message: any;
   arrsesion: any;
   workInicial: any;
   workFGral:any;
   TipoSol:any;
   MonedaL:any;
   Tipogasto:any;
   TipoComprobante:any;
   arrSelecto:any;
   traduccion:any;
   displayedColumns: string[] = ['select','id','TipoComprobante','createdAt','fechaEmision','tipodegasto','estatus','subtotal','total','idMoneda','borrar'];
 
   @ViewChild(MatSort) sort: MatSort = Object.create(null);
   @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
   @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
 /**
      * Consulta catálogos y servicios, asi cómo inicializa el método principal que carga la información
      * 
      * 
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
     private translate: TranslateService,
     private http: HttpClient,
     private dialogService: DialogService,
     private mensajes: MensajesService,
     private token: TokenService) {
      let datSess:any=token.readToken('id','')
      datSess=datSess.split(',');
      this.GastosList = new MatTableDataSource();
       translate.setDefaultLang('es');
       //this.traduccion=this.translate.getDefaultLang();
       console.log(this.translate.getDefaultLang());
       this.getUsuario(datSess[0],datSess[1]).subscribe(rsUs => {
        this.arrsesion=rsUs[0];    
        this.arrsesion.map((t1:any) =>{t1.NombreCompleto= `${t1.nombre} ${t1.apellidoPaterno} ${t1.apellidoMaterno}`; t1.idUser=t1.idOcupantePuesto; t1.idEmpresa=datSess[1]; });
        this.getDatos(datSess[1]).subscribe(resp => {
          this.MonedaL= resp[0];
          this.TipoSol=resp[1];         
          this.Tipogasto=resp[2];
          this.TipoComprobante=tipocomprobantes;
          this.servicios.getUnParametro('catalogos','?catalogo=workflows&filtro1='+encodeURIComponent('idEmpresa='+datSess[1]))
            .pipe().subscribe((res:any) => {
              this.workInicial=res;
              this.workInicial.map((t1: any) =>{t1.evento=JSON.parse(t1.evento)});              
              this.Inicio('gastos','?idEmpresa='+datSess[1]);
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
  * @param {string} gastos 
  * @returns { {Array.<string>}} Regresa el servicio gastos consultado correspondiente al idUser
  */
  Inicio(tabla:any, param:any){
    this.servicios.getUnParametro(tabla, param)
     .pipe(catchError(err => { this.GastosList = new MatTableDataSource(); return throwError(err); }) )
     .subscribe( (res:any) => {
         console.log(res);
         this.workFGral=this.workInicial.filter((dato:any) => dato.nombreObjeto=="Gastos");  
         let gsatosListData = res.map( (t1:any) => ({ ...t1, ...this.arrsesion.find((t2:any) => t2.idUser === t1.idUser) }) );   
         gsatosListData.map((t1: any) =>{             
             t1.TipoComprobante=t1.idTipoComprobante==0?'Pendiente':this.TipoComprobante.filter((tc:any) => tc.id == t1.idTipoComprobante)[0].tipo;
             if(t1.TipoComprobante == 'Pendiente'){ t1.importetotal=0; t1.subtotal=0; t1.idMoneda='MXN'; t1.tipodegasto='Pendiente'; t1.moneda=this.MonedaL.filter((mon:any) => mon.clave == t1.idMoneda)[0].clave;} 
             else{t1.tipodegasto = t1.idTipoGasto===0?'':
                                  this.Tipogasto.filter((tp:any) => tp.id == t1.idTipoGasto)[0].nombreGasto; 
                                  t1.moneda=t1.moneda?this.MonedaL.filter((mon:any) => mon.clave == t1.idMoneda)[0].clave:'MXN';}  
             t1.tipoCambio=t1.tipoCambio?t1.tipoCambio:0;
             if(t1.idTipoComprobante==1){
              if(t1.idMoneda!='MXN'){
                t1.subtotal=t1.subtotal * t1.tipoCambio;
                t1.total=t1.total * t1.tipoCambio;
               }  
             }    
             t1.estatus=t1.automatico === 2?'Rechazado':t1.estatus;          
         }); 
         console.log(gsatosListData);
         this.GastosList = new MatTableDataSource(gsatosListData);
         this.GastosList.paginator = this.paginator!;
         this.GastosList.sort = this.sort;
         const sortState: Sort = {active: 'createdAt', direction: 'desc'};
         this.GastosListOrig=this.GastosList.data;
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
      console.log("***********",filtros.filtro);


      delete filtrado.titulo; 
       if(this.GastosList.data.length != this.GastosListOrig.length ){      
        this.GastosList.data=this.GastosListOrig;
        if(filtrado.fechaIni && filtrado.fechaFin){
          let filtroFecha=this.GastosList.data.filter(function(item:any){
            return new Date(item.createdAt+' 00:00:00') >= new Date(filtrado.fechaIni+' 00:00:00') && new Date(item.createdAt+' 00:00:00') <= new Date(filtrado.fechaFin+' 00:00:00');
           });
           delete filtrado.fechaIni; 
           delete filtrado.fechaFin; 
           const filteredData = funciones.buscarJsonEnJson(filtroFecha,filtrado);
           this.GastosList.data=filteredData;        
         } else{
          delete filtrado.fechaIni; 
          delete filtrado.fechaFin; 
           const filteredData = funciones.buscarJsonEnJson(this.GastosList.data,filtrado);
           this.GastosList.data=filteredData;
         }
      } else{
        if(filtrado.fechaIni && filtrado.fechaFin){
          let filtroFecha=this.GastosList.data.filter(function(item:any){
            return new Date(item.createdAt+' 00:00:00') >= new Date(filtrado.fechaIni+' 00:00:00') && new Date(item.createdAt+' 00:00:00') <= new Date(filtrado.fechaFin+' 00:00:00');
          });
          delete filtrado.fechaIni; 
          delete filtrado.fechaFin; 
          const filteredData = funciones.buscarJsonEnJson(filtroFecha,filtrado);
          this.GastosList.data=filteredData;        
        } else{
          delete filtrado.fechaIni; 
           delete filtrado.fechaFin; 
          const filteredData = funciones.buscarJsonEnJson(this.GastosList.data,filtrado);
          this.GastosList.data=filteredData;
        } 
      }  
    }

    limpiarfiltros(){
    this.GastosList.data=this.GastosListOrig;     
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
   
   isAllSelected() {
     const numSelected = this.selection.selected.length;
     const numRows = this.GastosList.data.length;
     return numSelected === numRows;
   }
 
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
 
   showOptions(event:MatCheckboxChange, arr:any): void { }
 /**
  * @function
  * @name exportar 
  * Metodo que exporta a excel de acuerdo a lo seleccionado los tabulados 
  * @returns {Array.<string>} Regresa un Array 
  */
   exportar(){    
     this.selection.selected.length===0?this.generaExcel(this.GastosList.data):this.generaExcel(this.selection.selected); 
   }
 /**
  * @function
  * @name generaExcel 
  * Metodo que genera un excel de los tabulados  
  * @returns { {Array.<string>}} Regresa un Array 
  */
   generaExcel(arr:any){
     console.log(arr);
     let exportar:any=[];
       arr.map((ex:any) =>{
         exportar.push({
          IdGastos:ex.id,
          Nombre:`${ex.nombre} ${ex.apellidoPaterno} ${ex.apellidoMaterno}`,
          FechaRegistro:moment(new Date(ex.createdAt)).format("DD/MM/YYYY"),
          TipoComprobante:ex.TipoComprobante,
          fechaEmision:moment(new Date(ex.fechaEmision)).format("DD/MM/YYYY"),
          Tipodegasto:ex.tipodegasto,
          Estatus:ex.estatus,
          Subtotal:ex.subtotal,
          Total:ex.total,  
          Moneda:ex.idMoneda
         })        
       }); 
     this.excelExporta.exportAsExcelFile(exportar, 'gastos_'+this.arrsesion[0].idUser); 
   }
 
   filter(filterValue: string) {
     this.GastosList.filter = filterValue.trim().toLowerCase();
   }

   deleteGastosZ(row:any, id: any) { 
    this.dialogService.openConfirmDialog('  ¿ Esta seguro de eliminar el gasto con id  '+ id+ ' ?')
      .afterClosed().subscribe(res =>{
        if(res){
          console.log(this.workFGral)
          let idWorkflow=this.workFGral.filter((dato:any) => dato.evento.some((o2:any) => o2.opcion === "Eliminar")); 
          console.log("idWorkflow",idWorkflow[0].id);          
          this.servicios.deleteMultiple(`gastos/${id}?idWorkflow=${idWorkflow[0].id}` )      
            .pipe( catchError(err => {return throwError(err);  })
            ) .subscribe((del:any) => { 
              this.mensajes.mensaje(`El gasto ${id} se ha eliminado con exito.`,'','success');
              this.GastosList.data = this.GastosList.data.filter(CId => CId.id !== id);
            },() => {}        
            );
        } else{
        }
    });
  }

    public getDatos (idempresa:any) : Observable<any>  {
        let monedas=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=monedas`, { headers: headers });
        let tipoSolicitud=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=tipoSolicitud`, { headers: headers });
        let tipoGastos=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=tipoGastos&filtro1=idEmpresas=${idempresa}`, { headers: headers });
        return forkJoin([monedas,tipoSolicitud,tipoGastos]);  
    } 

    public getUsuario (id:any,idempresa:any) : Observable<any>  {        
      let usuario=this.http.get<any>(API+'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1='+encodeURIComponent('idOcupantePuesto='+id+' and idEmpresas='+idempresa ), { headers: headers });
      return forkJoin([usuario]);         
    }
 
 }
 