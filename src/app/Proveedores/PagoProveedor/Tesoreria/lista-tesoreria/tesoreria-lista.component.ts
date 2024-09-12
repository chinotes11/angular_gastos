
import { Component, ViewChild, OnInit, OnDestroy, Optional, Inject } from '@angular/core';
import { ServiceinvoiceService } from '../tesoreria.service';
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
import { MensajesService } from "../../../../Genericos/mensajes/mensajes.service";


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
  templateUrl: './tesoreria-lista.component.html',
  styleUrls: ['./tesoreria-lista.component.scss']
})
export class ListaTesoreriaProveedorComponent implements OnInit, OnDestroy {
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
  displayedColumns:string[]=['select','idUser', 'PagoManual','NombreCompleto','BancoReceptor','CuentaReceptor','FechaAprobacion','TipoTransaccion','MontoTransaccion','Moneda','IdPago','Estatus', 'MontoPago'];
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
      //this.sesionData.iniciaDatos();
      //this.sesionData.cargaCatalogos();
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

  Inicio(){
    this.servicios.getUnParametro('reportes', '?idUsuario='+this.arrsesion[0].idUser)
    .pipe(
        catchError(err => { this.tesoreriaList = new MatTableDataSource(); return throwError(err); })
    )
    .subscribe(
      (res:any) => {
        let tesoreriaListData= res.map(
          (t1:any) => ({
              ...t1, ...this.colaborador.find((t2:any) => t2.id === t1.id),
            })
          ) 
          tesoreriaListData.map((t1: any) =>{ 
            t1.NombreCompleto=t1.NombreColaborador;
            t1.idUser=t1.IdColaborador;            
          }) ;
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
    const numRows = this.tesoreriaList.data.length;
    return numSelected === numRows;
  }

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
   }

  applyFilter(filterValue: string) {
    this.tesoreriaList.filter = filterValue.trim().toLowerCase();
  }

  exportar(){    
    this.selection.selected.length===0?this.generaExcel(this.tesoreriaList.data):this.generaExcel(this.selection.selected); 
  }

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

  filter(filterValue: string) {
    this.tesoreriaList.filter = filterValue.trim().toLowerCase();
  }
  
  IrTrans(arr:any){
    console.log(arr);
    let ruta=arr.TipoTransaccion=='Reembolso'?'reportesgastos/reembolso/editReembolsos/1':'';
    this.router.navigate([ruta]);
  }
  GeneraLayout(){
    let arr:any=[];
    arr=this.selection.selected;
    const dialogRefE = this.dialog.open(GeneraLayoutDialog, {
      width:'90%',
      height:'90%',
      data: arr,          
  });
  dialogRefE.afterClosed().subscribe(result => {
    console.log(result.detalle)  
    if(result){
      

    } else {

    }
  });

  }

}


@Component({
  selector: 'generar-layout',
  templateUrl: 'generar-layout.html',
})
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
  CuentasRec: any;
  workInicial: any;
  workOrigen!:string;
  arrsesion: any;
  MonedaL:any;
  CentroCosto:any;
  Empresas:any;
  @ViewChild(MatSort) sort: MatSort = Object.create(null);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
  displayedColumns:string[]=['NombreColaborador','TipoTransaccion','estatus','montoAprobado','MontoaPagar',];
  
  constructor(public dialogRefE: MatDialogRef<GeneraLayoutDialog>,
    private mensajes: MensajesService,
    private dialogService: DialogService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
      this.arrsesion= JSON.parse(window.sessionStorage.getItem("persona")!);
      this.workInicial= JSON.parse(window.sessionStorage.getItem("workflow")!);
      this.MonedaL= JSON.parse(window.sessionStorage.getItem("moneda")!);
      this.CentroCosto= JSON.parse(window.sessionStorage.getItem("centrocostos")!);
      this.NomBancos=JSON.parse(window.sessionStorage.getItem("banco")!);
      this.NomBancosRes= JSON.parse(window.sessionStorage.getItem("bancores")!);
      this.Cuentas= JSON.parse(window.sessionStorage.getItem("cuentas")!);
      this.CuentasRec= JSON.parse(window.sessionStorage.getItem("cuentasRec")!);
      this.Empresas= JSON.parse(window.sessionStorage.getItem("empresa")!);
      console.log(data);
      this.InfoLayout=data[0];
      this.LayoutArr=data;
      this.LayoutArr.map((t1:any) =>{ 
        this.TotalPagar=this.TotalPagar+t1.montoAprobado;
        t1.MontoaPagar=t1.montoAprobado;
      });
      this.InfoLayout.MontoPagar=this.TotalPagar;
      this.LayoutListado = new MatTableDataSource(this.LayoutArr);
      this.LayoutListado.paginator = this.paginator!;
      this.LayoutListado.sort = this.sort;
      
        this.Bancos=this.NomBancos.filter((ban:any)=>{
           ban.idMoneda==this.LayoutArr.idMoneda;
        });
        this.Cuenta=this.Cuentas.filter((cuen:any)=>{
          cuen.BancoEmisor==this.LayoutArr.BancoEmisor;
       });

  }

  cambiaEmp(evento:any, arr:any){
    this.Cuenta=[];
    this.Cuentas.map((cuen:any)=>{
      if(cuen.BancoEmisor==evento.value){
        this.Cuenta.push(cuen);
      }
   });
    this.bloqueoCuenta=false;
  }

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
          this.mensajes.mensaje('El monto a pagar no puede ser mas grande que el aprobado.','','danger');
          t1.MontoaPagar=0;
        }  
      }
      suma=suma+t1.MontoaPagar;  
    });
    this.InfoLayout.MontoPagar=Number(suma);            
  }

 
  aceptarDialog() {
    this.dialogService.openConfirmDialog('¿ Esta seguro que desea guardar los cambios ?')
      .afterClosed().subscribe(res =>{
        console.log(res);
        if(res){     
          
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
}


