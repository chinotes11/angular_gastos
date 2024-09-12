/** Modulo Angular que muestra un listado con Devoluciones 
 * @module 1. Listado conciliar
 * lista-conciliar.component.ts  
 */
 import { Component, ViewChild, OnInit, Optional, Inject } from '@angular/core';
 import { MatTable, MatTableDataSource } from '@angular/material/table';
 import { MatSort, Sort } from '@angular/material/sort';
 import { MatPaginator } from '@angular/material/paginator';
 import { ActivatedRoute, Data, NavigationEnd, Router } from '@angular/router';
 import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
 import { DatePipe } from '@angular/common';
 import { forkJoin, Observable, Subscription, throwError } from 'rxjs';
 import { SelectionModel } from '@angular/cdk/collections';
 import { catchError, filter, map, mergeMap } from 'rxjs/operators';
 import { Title } from '@angular/platform-browser';
 import { FormControl, FormGroupDirective, NgForm} from '@angular/forms';
 import { ErrorStateMatcher } from '@angular/material/core';
 import { DataService } from "../../../Genericos/data.service";
 import { DialogService } from '../../acciones/dialog.service';
 import { serviciosService } from "../../../Genericos/servicios/servicios.service";
 import * as _moment from 'moment';
 import { ExcelServiceService } from '../../../Genericos/excelService/ExcelService.service';
 import { MatCheckboxChange } from '@angular/material/checkbox';
 import { MensajesService } from "../../../Genericos/mensajes/mensajes.service";
 import { environment } from '../../../../environments/environment';
 import { TokenService } from '../../../auth/token/token.service';
 import { HttpClient, HttpHeaders} from '@angular/common/http';
 import { funciones } from '../../../Genericos/utilidades/funciones';
 const API = environment.ApiUrl;
 const APIAdmin= environment.ApiUrlAdmin;
 const headers = new HttpHeaders    
 headers.append('Content-type', 'applicartion.json');
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
   selector: 'app-lista-pago',
   templateUrl: './lista-conciliar.component.html',
   styleUrls: ['./lista-conciliar.component.scss']
 })
  /** El nombre del modulo ListaConciliarComponent */
 
 export class ListaConciliarComponent implements OnInit { 
   pagoList:MatTableDataSource<any>;
   pagoListOrig:any=[];
   subscription!: Subscription;
   selection = new SelectionModel<any>(true, []);
   pageInfo: Data = Object.create(null);
   message: any;
   arrsesion: any;
   formaPagos:any;
   transaccion: any;
   TipoComprobante:any;
   arrSelecto:any;
   idRol:any;
   datSess:any;
   displayedColumns: string[] = ['select','descEmpresa','nombre','estatusTrans','id','tipoTransaccion','montoTransaccion','fechaRegistroTrans','FormaPago','tipoCambioTrans'];  
   @ViewChild(MatSort) sort: MatSort = Object.create(null);
   @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
   @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
 /**
  * Consulta catálogos y servicios.
  */
   constructor(
     private servicios: serviciosService,
     private excelExporta:ExcelServiceService,
     public dialogo: MatDialog, 
     public datePipe: DatePipe,
     private router: Router,
     private titleService: Title,
     private activatedRoute: ActivatedRoute,     
     private datosPaso: DataService, 
     private dialogService: DialogService,
     private mensajes: MensajesService,
     private http: HttpClient,
     private token: TokenService) {
      this.datSess=token.readToken('id','');
      this.datSess=this.datSess.split(',');
      this.idRol=token.readToken('rlsRol','GASTOS');
      this.pagoList = new MatTableDataSource();
      this.getUsuario(this.datSess[0],this.datSess[1]).subscribe(rsUs => {
        this.arrsesion=rsUs[0];    
        this.arrsesion.map((t1:any) =>{ t1.idEmpresa=Number(this.datSess[1]);  t1.idRoles=this.idRol; });
        this.getDatos(this.datSess[1],this.arrsesion[0].idEstructura,this.datSess[0]).subscribe(resp => {
          this.formaPagos=resp[0];
          this.Inicio('');
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
     this.servicios.getUnParametro('catalogos','?catalogo=vwListaPagos&filtro1='+encodeURIComponent('idLayoutBancarioEnvio is not null and estatusTrans="Enviado"'))
     //this.servicios.getUnParametro('catalogos',`?catalogo=vwListaPagos&filtro1=idLayoutBancarioEnvio%20is%20not%20null${params}`)//
     .pipe( catchError(err => { this.pagoList = new MatTableDataSource(); return throwError(err); })
     ).subscribe(
       (res:any) => {
         console.log(res);
         let pagoListData= res;//.map( (t1:any) => ({ ...t1, ...this.arrsesion.find((t2:any) => t2.idUser === t1.idUser) })) 
         pagoListData.map((t1:any) =>{  t1.FormaPago= !t1.idFormasPago?'':this.formaPagos.filter((fpg:any) => fpg.id == t1.idFormasPago)[0].descripcion;  }) ;
         console.log('Conciliar',pagoListData);
         this.pagoList = new MatTableDataSource(pagoListData);
         this.pagoList.paginator = this.paginator!;
         this.pagoList.sort = this.sort;
         this.pagoListOrig=this.pagoList.data;  
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
     if(this.pagoList.data.length != this.pagoListOrig.length ){      
      this.pagoList.data=this.pagoListOrig;
      if(filtrado.fechaIni && filtrado.fechaFin){
        let filtroFecha=this.pagoList.data.filter(function(item:any){
           return new Date(item.fechaRegistroTrans+' 00:00:00') >= new Date(filtrado.fechaIni+' 00:00:00') && new Date(item.fechaRegistroTrans+' 00:00:00') <= new Date(filtrado.fechaFin+' 00:00:00');
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
        return new Date(item.fechaRegistroTrans+' 00:00:00') >= new Date(filtrado.fechaIni+' 00:00:00') && new Date(item.fechaRegistroTrans+' 00:00:00') <= new Date(filtrado.fechaFin+' 00:00:00');
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
          Empresa:ex.descEmpresa,
          Nombre:ex.nombre,
          Estatus:ex.estatusTrans,
          IdPago:ex.idPago,
          TipoTransaccion:ex.tipoTransaccion,
          MontoTransaccion:ex.montoTransaccion,
          FechaRegistro:!ex.fechaRegistroTrans?'':moment(new Date(ex.fechaRegistroTrans)).format("MM/DD/YYYY"),
          FormaPago:ex.FormaPago,
          TipoCambio:ex.tipoCambioTrans
         })        
       }); 
     this.excelExporta.exportAsExcelFile(exportar, 'Conciliación_'+this.arrsesion[0].idPuesto); 
   }
 /**
   * @function
   * @name abrePago 
   * Metodo que abre el componente de pagos, manda su origen
   */
   abrePago(evento:any, arr:any){
     window.sessionStorage.setItem("_origen",'conc');    
     window.sessionStorage.setItem("tesoreria",JSON.stringify([arr]));
   }
 
   filter(filterValue: string) {
     this.pagoList.filter = filterValue.trim().toLowerCase();
   }

    conciliar(action: any, obj: any) {
      obj.action = action;
      //obj.dias = this.anticipo.diasDura;
      //obj.ArrGastos=this.arrGastosGrd;
      const dialogRefs = this.dialogo.open(ConciliarDialogContent, {
          panelClass: "dialog-exportar",   
          disableClose: true,
          data: obj,         
      });
      console.log(dialogRefs);
      dialogRefs.afterClosed().subscribe(result => {
        console.log(result)
        if(result.conciliacion){
          this.Inicio(''); 

        } 
      });   
    
    }

    public getDatos (idempresa:any, idCC:any, usuario:any) : Observable<any>  {
      let formasPagos=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=formasPago`, { headers: headers }); 
      return forkJoin([formasPagos]);  
    }  

    public getUsuario (id:any,idempresa:any) : Observable<any>  {        
      let usuario=this.http.get<any>(API+'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1='+encodeURIComponent('idOcupantePuesto='+id+' and idEmpresas='+idempresa ), { headers: headers });
      return forkJoin([usuario]);         
    }
 }

  /**
  * componente para listar Gastos
  */
   @Component({
    selector: 'conciliar-gastos',
    templateUrl: 'conciliar-gastos.html',
  })
  /** El nombre del modulo ListaGstoDialogContent. */
  export class ConciliarDialogContent {   
    @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
    searchText: any;
    displayedCol: string[] = ['select','id', 'descripcion'];
    local_data: any;
    arrsesion:any;
    action: string;
    subiComp:any; 
    GastosL:any;
    archivoCSV:any;
    /**
       * Consulta catálogos y servicios. 
       */
    constructor(public dialogRefs: MatDialogRef<ConciliarDialogContent>,
      private servicios: serviciosService,    
      @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
      private http: HttpClient,
      private token: TokenService,
      private mensajes: MensajesService) {   
        let datSess:any=token.readToken('id','');
        datSess=datSess.split(',');
        this.local_data = { ...data };
        this.action = this.local_data.action;     
        this.getUsuario(datSess[0],datSess[1]).subscribe(rsUs => {
        this.arrsesion=rsUs[0];  
        this.arrsesion.map((t1:any) =>{t1.NombreCompleto= `${t1.nombre} ${t1.apellidoPaterno} ${t1.apellidoMaterno}`; t1.idUser=t1.idOcupantePuesto;});
      }); 
    }
    enviar(){}

    cargaArchivoCSV(event: any) {
      this.archivoCSV =[];
      if (event.target.files.length > 0) {
        this.archivoCSV = event.target.files[0];
        const formData = new FormData();
        formData.append('file',this.archivoCSV); 
        this.http.post(`${API}/conciliacion/upload/`, formData)
          .subscribe((res: any) => {
            console.log(res);   
            this.dialogRefs.close({ data: this.local_data, conciliacion:this.subiComp });        
          },(err:any) => { console.log(err);this.mensajes.mensaje('Hubo un error al cargar el CSV.','','danger');});
      }
    }

    doAction() {
      if(this.subiComp==true){
        this.dialogRefs.close({ data: this.local_data, conciliacion:this.subiComp });
      }else{
        this.dialogRefs.close({ data: this.local_data, conciliacion:this.subiComp });
      }
    }
  
    closeDialog() {
      this.dialogRefs.close({ event: 'Cancel' });
    }
 
    public getUsuario (id:any,idempresa:any) : Observable<any>  {        
     let usuario=this.http.get<any>(API+'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1='+encodeURIComponent('idOcupantePuesto='+id+' and idEmpresas='+idempresa), { headers: headers });
     return forkJoin([usuario]);         
   }
    
  }