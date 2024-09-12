
import { Component, ViewChild, OnInit, OnDestroy, Optional, Inject } from '@angular/core';
import { ServiceinvoiceService } from '../tesoreria.service';;
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Data, NavigationEnd, Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { Subscription, throwError } from 'rxjs';
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
import { DialogService } from '../../acciones/dialog.service';
import { MensajesService } from "../../../Genericos/mensajes/mensajes.service";

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


@Component({
  selector: 'app-ordenlis',
  templateUrl: './Orden-lista.component.html',
  styleUrls: ['./Orden-lista.component.scss']
})
/** Clase para Listar. */
export class ListaOrdenComponent implements OnInit, OnDestroy {
  tesoreriaList:MatTableDataSource<any>;
  subscription!: Subscription;
  selection = new SelectionModel<any>(true, []);
  pageInfo: Data = Object.create(null);
  message: any;
  arrsesion: any;
  colaborador: any;
  transaccion: any;
  TipoComprobante:any;
  arrSelecto:any;
  layout: string= '0';
  displayedColumns:string[]=['select','POID','FechaRegistro','NombreComercial','RazonSocial','FechaEntrega','Recibido','Facturado','Importe','Moneda'];
  @ViewChild(MatSort) sort: MatSort = Object.create(null);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
   /**
     * Consume servicios y catalogos, para poder Listar.
     * @param {array} arrsesion - Obtiene el parametro desde Persona para conusmir el servicio.
     * @param {array} colaborador - Es el arreglo que contiene los datos, junto con Reportes.
     */
  constructor(
    private invoiceService: ServiceinvoiceService, 
    private servicios: serviciosService,
    private excelExporta:ExcelServiceService,
    public dialog: MatDialog, 
    public datePipe: DatePipe,
    private router: Router,
    private titleService: Title,
    private activatedRoute: ActivatedRoute,
    
    private datosPaso: DataService,) {
      this.colaborador = this.invoiceService.getTesoreriaList();
     
      this.arrsesion= JSON.parse(window.sessionStorage.getItem("persona")!);
      this.TipoComprobante= JSON.parse(window.sessionStorage.getItem("tipocomprobantes")!);      
      this.tesoreriaList = new MatTableDataSource();
      this.Inicio();
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
     * Obtiene el consumo del servicio, al cargar la página.
     * @return {Array} Tregresa tesoreriaListData, despues de obtenerla del arreglo y cargarle el arreglo tesorerialist.
     */
  Inicio(){
    this.servicios.getUnParametro('reportes', '?idUsuario='+this.arrsesion[0].idUser)
    .pipe(
        catchError(err => { this.tesoreriaList = new MatTableDataSource(); return throwError(err); })
    )
    .subscribe(
      (res:any) => {
        let tesoreriaListData= res.map(
          (t1: { idUser: any; idMoneda: any; idUsoFondos: any;  diasDura: any; fechaIni: any; fechaFin: any;}) => ({
              ...t1, ...this.colaborador.find((t2: { IdColaborador: any; }) => t2.IdColaborador === t1.idUser),
            })
          ) 
          tesoreriaListData.map((t1: { diasDura: number; fechaFin: _moment.MomentInput; fechaIni: _moment.MomentInput; }) =>{ t1.diasDura=moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days')<0?0:moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days')}) ;
        console.log('colaboradores',this.colaborador);
        console.log('Reportes',tesoreriaListData);
        this.tesoreriaList = new MatTableDataSource(tesoreriaListData);
        this.tesoreriaList.paginator = this.paginator!;
        this.tesoreriaList.sort = this.sort;
        const sortState: Sort = {active: 'createdAt', direction: 'desc'};
        this.sort.active = sortState.active;
        this.sort.direction = sortState.direction;
        this.sort.sortChange.emit(sortState);
       },
      (err:any) => {  },
      () => {console.log('Termino'); }
    );  
    
  }
  /**
     * .Obtiene el paso de los filtros (carga)
     * @return {Array} datosPaso.
     */
  ngOnInit() {
    this.subscription = this.datosPaso.currentMessage.subscribe((message) => {this.message = message; console.log(message);}); // {{message[0].filtro.name}}
  }
/**
     * .Obtiene el paso de los filtros (cierra la sesión)
     * @return {Array} datosPaso.
     */
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

   /**
     * .Obtiene el paso de los filtros
     * @return {Array} datosPaso.
     */
  pasoFiltros() {
    this.datosPaso.changeMessage([{filtro:'',tipo:''}])
  }
   /**
     * .Obtiene el arreglo de registros seleccionados
     * @return {Array} tesoreriaList.
     */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.tesoreriaList.data.length;
    return numSelected === numRows;
  }

 /**
     * .
     * @return {Array} layout.
     */
  checkboxLabel(row?: any): string {          
      if (!row) {          
          return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
      }
      return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }
 /**
     * .
     * @return {Array} layout.
     */
  showOptions(event:MatCheckboxChange, arr:any): void {
    this.layout=this.selection.selected.length>1?'1':'0';
   }
 /**
     * Filtra la MatTable.
     * @return {Array} tesoreriaList.
     */
  applyFilter(filterValue: string) {
    this.tesoreriaList.filter = filterValue.trim().toLowerCase();
  }
/**
     * De acuerdo a lo seleccionado en la tabla, manda a llamar a generaExcel, para exportar.
     * @return {Array} tesoreriaList.
     */
  exportar(){    
    this.selection.selected.length===0?this.generaExcel(this.tesoreriaList.data):this.generaExcel(this.selection.selected); 
  }

    /**
     * Genera un excel.
     * @return {Array} exportar.
     */
  generaExcel(arr:any){
    console.log(arr);
    let exportar:any=[];
      arr.map((ex:any) =>{
        exportar.push({
         IdGastos:ex.id,
         Nombre:ex.Nombre,
         Paterno:ex.Paterno,
         Materno:ex.Materno,
         FechaRegistro:moment(new Date(ex.createdAt)).format("MM/DD/YYYY"),
         TipoComprobante:ex.TipoComprobante,
         fechaEmision:moment(new Date(ex.fechaEmision)).format("MM/DD/YYYY"),
         Tipodegasto:ex.tipodegasto,
         Estatus:ex.estatus,
         Subtotal:ex.subtotal,
         Total:ex.total,  
         Moneda:ex.idMoneda
        })        
      }); 
    this.excelExporta.exportAsExcelFile(exportar, 'tesoreria_'+this.arrsesion[0].idUser); 
  }
 /**
     * Filtra la MatTable.
     * @return {Array} tesoreriaList.
     */
  filter(filterValue: string) {
    this.tesoreriaList.filter = filterValue.trim().toLowerCase();
  }
  
}
