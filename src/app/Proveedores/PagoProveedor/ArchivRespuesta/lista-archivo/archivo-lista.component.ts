
import { Component, ViewChild, OnInit, OnDestroy, Optional, Inject } from '@angular/core';
import { ServiceinvoiceService } from '../archivo.service';
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
import { DataService } from "../../../../Genericos/data.service";
import { serviciosService } from "../../../../Genericos/servicios/servicios.service";
import * as _moment from 'moment';
import { ExcelServiceService } from '../../../../Genericos/excelService/ExcelService.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { DialogService } from '../../../acciones/dialog.service';


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
  //selector: 'app-invoice-list',
  templateUrl: './archivo-lista.component.html',
  styleUrls: ['./archivo-lista.component.scss']
})
export class ListaArchivoComponent implements OnInit, OnDestroy {
  ArchivoList:MatTableDataSource<any>;
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
  displayedColumns:string[]=['select','Empresa','BKL_ID','BancoEmisor','CuentaEmisora','createdAt','monto','Moneda','NoRegistros'];
  //displayedColumns:string[]=['select','Empresa','BancoEmisor','CuentaEmisora','Proyecto','CentrodeCostos','TipoCambio','FechaGenLay','TipoTransaccion','Moneda', 'PagoManual'];
  @ViewChild(MatSort) sort: MatSort = Object.create(null);
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
      this.colaborador = this.invoiceService.getTesoreriaList();
     
      this.arrsesion= JSON.parse(window.sessionStorage.getItem("persona")!);
      this.TipoComprobante= JSON.parse(window.sessionStorage.getItem("tipocomprobantes")!);      
      this.ArchivoList = new MatTableDataSource();
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
        catchError(err => { this.ArchivoList = new MatTableDataSource(); return throwError(err); })
    )
    .subscribe(
      (res:any) => {
        let ArchivoListData= res.map(
          (t1: { idUser: any; idMoneda: any; idUsoFondos: any;  diasDura: any; fechaIni: any; fechaFin: any;}) => ({
              ...t1, ...this.colaborador.find((t2: { IdColaborador: any; }) => t2.IdColaborador === t1.idUser),
            })
          ) 
          ArchivoListData.map((t1: { diasDura: number; fechaFin: _moment.MomentInput; fechaIni: _moment.MomentInput; }) =>{ t1.diasDura=moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days')<0?0:moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days')}) ;
        console.log('colaboradores',this.colaborador);
        console.log('Reportes',ArchivoListData);
        this.ArchivoList = new MatTableDataSource(ArchivoListData);
        this.ArchivoList.paginator = this.paginator!;
        this.ArchivoList.sort = this.sort;
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
    const numRows = this.ArchivoList.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
      this.isAllSelected() ?
          this.selection.clear() :
          this.ArchivoList.data.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: any): string {          
      if (!row) {          
          return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
      }
      return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  showOptions(event:MatCheckboxChange, arr:any): void {
    this.layout=this.selection.selected.length>1?'1':'0';
   }

  applyFilter(filterValue: string) {
    this.ArchivoList.filter = filterValue.trim().toLowerCase();
  }

  exportar(){    
    this.selection.selected.length===0?this.generaExcel(this.ArchivoList.data):this.generaExcel(this.selection.selected); 
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
         fechaEmision:moment(new Date(ex.fechaEmision)).format("MM/DD/YYYY"),
         Moneda:ex.Moneda,
         NoRegistros:ex.NoRegistros,
        })        
      }); 
    this.excelExporta.exportAsExcelFile(exportar, 'ArchivosRespuesta_'+this.arrsesion[0].idUser); 
  }

  filter(filterValue: string) {
    this.ArchivoList.filter = filterValue.trim().toLowerCase();
  }
  
  IrTrans(arr:any){
    console.log(arr);
    let ruta=arr.TipoTransaccion=='Reembolso'?'reportesgastos/reembolso/editReembolsos/1':'';
    this.router.navigate([ruta]);
  }

}


/*@Component({
  selector: 'generar-archivo',
  templateUrl: 'generar-archivo.html',
})*/
/*export class GeneraLayoutDialog {
  LstGst: any;
  cuenta:any;
  formapago:any;
  Tipogasto:any;
  EditaMonto: any;  
  searchText: any;
  AprobRech:any;
  rechazar:any;
  FechaI:any;
  //dataSource = new MatTableDataSource(this.LstGst);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);

  constructor(public dialogRefE: MatDialogRef<GeneraLayoutDialog>,
    //public editaService: any,
    private dialogService: DialogService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    @Optional() @Inject(MAT_DIALOG_DATA) public edita: any) {
      this.cuenta= JSON.parse(window.sessionStorage.getItem("cuenta")!); 
      this.formapago= JSON.parse(window.sessionStorage.getItem("formapago")!);  
      this.Tipogasto= JSON.parse(window.sessionStorage.getItem("tipogasto")!);
      this.EditaMonto  = { ...data };
      this.FechaI = moment(new Date(this.EditaMonto.createdAt)).add(2, 'days').format("YYYY-MM-DD"); 
      [this.EditaMonto].map((em:any) =>{ em.PrSrvVal=em.valido==0?'SI':'NO' });
      this.EditaMonto.montopreAprobado=this.EditaMonto.montoAprobado;
      console.log(this.EditaMonto);
  }

  cambiaFcha(event: any, arr: any){
    this.EditaMonto.fechaIni=new Date(event.value);  
  }

  cambiaTipoG(evento:any, arr:any){    
    this.EditaMonto.idTipoGasto=evento.value; 
  }

  cambiaCuenta(evento:any, arr:any){    
    this.EditaMonto.ctaPago=evento.value; 
  }
  
  cambiaFormaP(evento:any, arr:any){    
    this.EditaMonto.formaPago=evento.value; 
  }

  AprobRechz(val:number){    
    this.AprobRech=val;
  }

  aceptarDialog(val:number) {
    this.dialogService.openConfirmDialog('¿ Esta seguro que desea guardar los cambios ?')
      .afterClosed().subscribe(res =>{
        console.log(res);
        if(res){     
          this.AprobRech=val;    
          this.EditaMonto.montoAprobado=this.EditaMonto.montopreAprobado;
          this.dialogRefE.close({ detalle:this.EditaMonto,aprobRechz:this.AprobRech});
        } 
    });
  }

  cerrarDialog() {
    this.dialogService.openConfirmDialog('¿ Esta seguro que desea salir sin guardar los cambios ?')
      .afterClosed().subscribe(res =>{
        console.log(res);
        if(res){          
          this.dialogRefE.close({ event: 'Cancel' });
        } 
    });    
  }
}*/


