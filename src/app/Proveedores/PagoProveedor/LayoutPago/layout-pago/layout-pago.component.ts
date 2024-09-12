import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { ServiceinvoiceService } from '../layout.service';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Data, NavigationEnd, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { Subscription, throwError } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { catchError, filter, map, mergeMap } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { FormControl, FormGroupDirective, NgForm} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { DataService } from "../../../../Genericos/data.service";
import { serviciosService } from "../../../../Genericos/servicios/servicios.service";
import * as _moment from 'moment';
import { ExcelServiceService } from '../../../../Genericos/excelService/ExcelService.service';
import { MatCheckboxChange } from '@angular/material/checkbox';


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
  //selector: 'app-layout-pago',
  templateUrl: './layout-pago.component.html',
  styleUrls: ['./layout-pago.component.scss']
})
export class LayoutPagoComponent implements OnInit {
  pagoList:MatTableDataSource<any>;
  subscription!: Subscription;
  selection = new SelectionModel<any>(true, []);
  pageInfo: Data = Object.create(null);
  message: any;
  arrsesion: any;
  colaborador: any;
  transaccion: any;
  arrSelecto:any;
  displayedColumns: string[] = ['select','Empresa','BKL_ID','BancoEmisor','CuentaEmisora','createdAt','monto','Moneda','NoRegistros'];  @ViewChild(MatSort) sort: MatSort = Object.create(null);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

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
      //this.sesionData.iniciaDatos();
      //this.sesionData.cargaCatalogos();
      this.colaborador = this.invoiceService.getTesoreriaList();
     
      this.arrsesion= JSON.parse(window.sessionStorage.getItem("persona")!);
      this.pagoList = new MatTableDataSource();
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

  Inicio(){
    this.servicios.getUnParametro('reportes', '?idUsuario='+this.arrsesion[0].idUser)
    .pipe(
        catchError(err => { this.pagoList = new MatTableDataSource(); return throwError(err); })
    )
    .subscribe(
      (res:any) => {
        let pagoListData= res.map(
          (t1: { idUser: any; idMoneda: any; idUsoFondos: any;  diasDura: any; fechaIni: any; fechaFin: any;}) => ({
              ...t1, ...this.colaborador.find((t2: { IdColaborador: any; }) => t2.IdColaborador === t1.idUser),
            })
          ) 
          pagoListData.map((t1: { diasDura: number; fechaFin: _moment.MomentInput; fechaIni: _moment.MomentInput; }) =>{ t1.diasDura=moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days')<0?0:moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days')}) ;
        console.log('colaboradores',this.colaborador);
        console.log('Reportes',pagoListData);
        this.pagoList = new MatTableDataSource(pagoListData);
        this.pagoList.paginator = this.paginator!;
        this.pagoList.sort = this.sort;
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
    this.subscription = this.datosPaso.currentMessage.subscribe((message) => {this.message = message; console.log(message);}); // {{message[0].filtro.name}}
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  pasoFiltros() {
    this.datosPaso.changeMessage([{filtro:'',tipo:''}])
  }
  
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.pagoList.data.length;
    return numSelected === numRows;
  }

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

  exportar(){    
    this.selection.selected.length===0?this.generaExcel(this.pagoList.data):this.generaExcel(this.selection.selected); 
  }

  generaExcel(arr:any){
    console.log(arr);
    let exportar:any=[];
      arr.map((ex:any) =>{
        exportar.push({
          Empresa:ex.Empresa,
          BKL_ID:ex.BKL_ID,
          BancoEmisor:ex.BancoEmisor,
          CuentaEmisora:ex.CuentaEmisora,
         FechaCreacion:moment(new Date(ex.createdAt)).format("MM/DD/YYYY"),
         monto:ex.monto,
         Moneda:ex.Moneda,
         NoRegistros:ex.NoRegistros,
        })        
      }); 
    this.excelExporta.exportAsExcelFile(exportar, 'layout_'+this.arrsesion[0].idUser); 
  }

  filter(filterValue: string) {
    this.pagoList.filter = filterValue.trim().toLowerCase();
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////// 

}



