import { Component, ElementRef,Optional,Inject, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSort, Sort } from '@angular/material/sort';
import { ServiceinvoiceService, } from '../tesoreria.service';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {  TesoreriaList} from '../tesoreria';
import { GastosDetalle, ProdServList, CfdiRelacion, CompNoFiscal } from '../gastosz';
import { FormGroup, FormBuilder, Validators, FormControl, NgForm, FormGroupDirective } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WorkFlowService} from '../../../Genericos/servicios.service'
import { ErrorStateMatcher, MatOption } from '@angular/material/core';
import { DialogService } from '../../acciones/dialog.service';
import { DatePipe } from '@angular/common';
import * as _moment from 'moment';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { serviciosService } from "../../../Genericos/servicios/servicios.service";
import { environment } from '../../../../environments/environment';
import { MensajesService } from "../../../Genericos/mensajes/mensajes.service";
import { PdfViewerComponent} from 'ng2-pdf-viewer';
import { MatCheckboxChange } from '@angular/material/checkbox';

declare var jQuery: any;
import * as FileSaver from 'file-saver';
import { datosUsuario } from '../tesoreria-data';
const API = environment.ApiUrl;
const moment = _moment;
/** proporciona la capacidad de usar un método personalizado para determinar la validez de un control de formulario. */
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
export interface User {
  name: string;
}
export interface TicketElement {
  id: number;
  Cantidad: string;
  Unidad: string;
  IDProducto: string;
  CuentaC: string;
  Tarifa: string;
  Monto: string;
  Descuento: string;
  ImpuestoAplicable: string;
  MontoDescuento: string;
  Importe: string;

}

const tickets: TicketElement[] = [
  {
  id: 1,
  Cantidad: '45',
  Unidad: '55',
  IDProducto: '1',
  CuentaC: '5446464',
  Tarifa: '2%',
  Monto: '55666',
  Descuento: '15%',
  ImpuestoAplicable: '10%',
  MontoDescuento: '5%',
  Importe: '2000',
}
];
@Component({
  selector: 'app-agregaror',
  templateUrl: './agregar-orden.component.html',
  styleUrls: ['./agregar-orden.component.scss']
})
/** Clase para Listar y Agregar al componente */
export class AgregarOrdenComponent implements OnInit {
  myControl = new FormControl();
  options: string[] = ['One', 'Two', 'Three'];
  dataSource = new MatTableDataSource(tickets);
  selection = new SelectionModel<ProdServList>(true, []);
  displayedColumns: string[] = ['Cantidad', 'Unidad', 'IDProducto', 'CuentaC','Tarifa','Monto','Descuento','ImpuestoAplicable','MontoDescuento','Importe','Accion'];
  recepcionesColumns: string[]=['PO-ID', 'RecepcionID', 'FechaRecepcion', 'IDERP']
  facturasColumns: string[]=['select','facturaID','folioF','fechaRegistro','NombrePro','razonSocialP','estatus','moneda','importeT','ordenCompraID','montoOrden','pagada']
  pagoColumns: string[]=['select','empresaSol','facturaID','estatus','areaSol','centroc','nombreProv','razonSocial','compraRec','moneda','importe','saldoP','p2s','montototal','monedap']
  complementoColumns: string[]=['select','nombreProv','razonSocial','fechaAplicacion','transaccionPID','montop','diasTransaccion','fechaEmisionC','complementoPagoID','montoComple','moneda']

  tablaList:MatTableDataSource<any>;
  facturaList:MatTableDataSource<any>;
  pagoList:MatTableDataSource<any>;
  complementoList:MatTableDataSource<any>;
  
  id: any;
  colaborador: any=[];
  datosFiscales: any=[];
  datosFinancieros: any=[];
  datosUsuario:any=[];
  FacturaOrden: any=[];
  tesoreriaListData: any=[];
  workInicial: any;
  workOrigen!:string;
  arrsesion: any;
  MonedaL:any;
  CentroCosto:any;
  NomBancos:any;
  Bancos:any;
  Cuenta:any;
  NomBancosRes: any;
  Tipo:any;
  TipoP:any;
  TerminoP:any;
  Nacionalidad:any;
  RegimenFiscal:any;
  ActividadEconomica:any;
  UsoCFDI:any;
  Pais:any;
  Cuentas: any;
  CuentasRec: any;
  Empresas:any;
  btnGda: string='1';
  bloqueo:boolean=true;
  bloqueoCuenta:boolean=true;
  bloqueoBanco:boolean=true;
  bloqueoWf:string='1';
  Historial:any;
  idWorkflow:any;

  siPDF:boolean=false;
  archivoPdf!:any;
  FileUrlPDF:any;
  descargaPDF:any;
  zoom_to:any=0.8;
 
  tesoreriaList:any=[];
  histColumns: string[] = ['fechaRegistro', 'idUser', 'evento', 'estatus', 'comentarios'];
  @ViewChild(MatSort) sort: MatSort = Object.create(null);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
  @ViewChild('inputXml') inputXml!: ElementRef;
  @ViewChild('inputPdf') inputPdf!: ElementRef;
  
   /**
     * Consume servicios y catalogos, para poder Listar.
     * @param {array} datosFiscales - Obtiene el arreglo de GastosF.
     * @param {array} colaborador - Es el arreglo que contiene los datos, junto con Reportes.
     *  @param {array} datosFinancieros -  Obtiene el arreglo de GastosF.
     *  @param {array} datosUsuario -  Obtiene el arreglo de GastosU.
     */
  constructor(activatedRouter: ActivatedRoute, 
    public datePipes:DatePipe,
    private servicios: serviciosService,
    public invoiceService: ServiceinvoiceService,
    public datoseService: ServiceinvoiceService,
    public datosefService: ServiceinvoiceService,
    public datoseuService: ServiceinvoiceService,
    public workService:WorkFlowService,
    private router: Router, 
    public dialog:MatDialog,
    private mensajes: MensajesService,
    private dialogService: DialogService,
    private http: HttpClient) {
      this.colaborador = this.invoiceService.getTesoreriaList();
      this.datosFiscales = this.datoseService.getDatosFiscales();
      this.datosFinancieros = this.datosefService.getDatosFinancieros();
      this.datosUsuario = this.datoseuService.getDatosUsuario();
      this.FacturaOrden = this.datoseuService.getFactuasOrden();

      this.id = activatedRouter.snapshot.paramMap.get('id');  
      this.arrsesion= JSON.parse(window.sessionStorage.getItem("persona")!);
      this.workInicial= JSON.parse(window.sessionStorage.getItem("workflow")!);
      this.MonedaL= JSON.parse(window.sessionStorage.getItem("moneda")!);
      this.CentroCosto= JSON.parse(window.sessionStorage.getItem("centrocostos")!);
      this.NomBancos=JSON.parse(window.sessionStorage.getItem("banco")!);
      this.Tipo=JSON.parse(window.sessionStorage.getItem("tipoPersona")!);
      this.TipoP=JSON.parse(window.sessionStorage.getItem("tipoProveedor")!);
      this.TerminoP=JSON.parse(window.sessionStorage.getItem("terminoPago")!);
      this.Nacionalidad=JSON.parse(window.sessionStorage.getItem("nacionalidad")!);
      this.RegimenFiscal=JSON.parse(window.sessionStorage.getItem("regimenFiscal")!);
      this.ActividadEconomica=JSON.parse(window.sessionStorage.getItem("actividadEconomica")!);
      this.UsoCFDI=JSON.parse(window.sessionStorage.getItem("usocfdi")!);
      this.Pais=JSON.parse(window.sessionStorage.getItem("pais")!);

      this.NomBancosRes= JSON.parse(window.sessionStorage.getItem("bancores")!);
      this.Cuentas= JSON.parse(window.sessionStorage.getItem("cuentas")!);
      this.CuentasRec= JSON.parse(window.sessionStorage.getItem("cuentasRec")!);
      this.Empresas= JSON.parse(window.sessionStorage.getItem("empresa")!);
      console.log('tipo',this.Tipo)
      console.log('fiscales',this.datosFiscales)
      console.log('financieros',this.datosFinancieros)
      console.log('usuario',this.datosUsuario)
      this.InicioD();  
      this.tabla(); 
      this.tablaFacturas();
      this.tablaPagos();
      this.tablaComplemento();
      this.tablaList = new MatTableDataSource(); 
      this.facturaList = new MatTableDataSource();
      this.pagoList = new MatTableDataSource();
      this.complementoList = new MatTableDataSource();
    }
    
    /**
     * Obtiene el consumo del servicio, y los catálogos al cargar la página.
     * @return {Array} Te regresa tesoreriaListData, despues de obtenerla del arreglo y cargarle el arreglo tesorerialist.
     */
  InicioD(){
    this.servicios.getUnParametro('reportes', '?idUsuario='+this.arrsesion[0].idUser)
    .pipe(
        catchError(err => { this.tesoreriaList = new MatTableDataSource(); return throwError(err); })
    )
    .subscribe(
      (res:any) => {
        this.Historia();
        console.log('REP',res)
        this.tesoreriaListData= res.map(
          (t1:any) => ({
              ...t1, ...this.colaborador.find((t2: { IdColaborador: any; }) => t2.IdColaborador === t1.idUser),
              ...t1, ...this.datosFiscales.find((t2: { IdColaboradord: any; }) => t2.IdColaboradord === t1.idUser),
              ...t1, ...this.datosFinancieros.find((t2: { IdColaboradorf: any; }) => t2.IdColaboradorf === t1.idUser),
              ...t1, ...this.datosUsuario.find((t2: { IdColaboradoru: any; }) => t2.IdColaboradoru === t1.idUser),

            })
          ) 
         this.tesoreriaListData.map((t1:any) =>{ t1.diasDura=moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days')<0?0:moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days')}) ;
        console.log('colaboradores',this.colaborador);
        console.log('Reportes',this.tesoreriaListData);

        this.tesoreriaListData= this.tesoreriaListData[0];
        this.Bancos=this.NomBancos.filter((ban:any)=>{
           ban.idMoneda==this.tesoreriaListData.idMoneda;
        });
        this.Cuenta=this.Cuentas.filter((cuen:any)=>{
          cuen.BancoEmisor==this.tesoreriaListData.BancoEmisor;
       });
       this.tesoreriaListData.comprobante=null;
        console.log(this.Bancos);
        console.log(this.Cuenta);
        this.dataSource = new MatTableDataSource(tickets);
       },
      (err:any) => {  },
      () => {console.log('Termino'); }
    );  
    
  }
  tabla(){
    this.servicios.getUnParametro('reportes', '?idUsuario='+this.arrsesion[0].idUser)
    .pipe(
        catchError(err => { this.tablaList = new MatTableDataSource(); return throwError(err); })
    )
    .subscribe(
      (res:any) => {
        let tablaListData= res.map(
          (t1: { idUser: any; idMoneda: any; idUsoFondos: any;  diasDura: any; fechaIni: any; fechaFin: any;}) => ({
              ...t1, ...this.colaborador.find((t2: { IdColaborador: any; }) => t2.IdColaborador === t1.idUser),
            })
          ) 
          tablaListData.map((t1: { diasDura: number; fechaFin: _moment.MomentInput; fechaIni: _moment.MomentInput; }) =>{ t1.diasDura=moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days')<0?0:moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days')}) ;
        console.log('colaboradores',this.colaborador);
        console.log('tablaaaaaaaaaa',tablaListData);
        this.tablaList = new MatTableDataSource(tablaListData);
        this.tablaList.paginator = this.paginator!;
        this.tablaList.sort = this.sort;
        const sortState: Sort = {active: 'createdAt', direction: 'desc'};
        this.sort.active = sortState.active;
        this.sort.direction = sortState.direction;
        this.sort.sortChange.emit(sortState);
       },
      (err:any) => {  },
      () => {console.log('Termino'); }
    );  
  }
  tablaFacturas(){
    this.servicios.getUnParametro('reportes', '?idUsuario='+this.arrsesion[0].idUser)
    .pipe(
        catchError(err => { this.facturaList = new MatTableDataSource(); return throwError(err); })
    )
    .subscribe(
      (res:any) => {
        let facturaListData= res.map(
          (t1: { idUser: any; idMoneda: any; idUsoFondos: any;  diasDura: any; fechaIni: any; fechaFin: any;}) => ({
              ...t1, ...this.FacturaOrden.find((t2: { IdColaborador: any; }) => t2.IdColaborador === t1.idUser),
            })
          ) 
          facturaListData.map((t1: { diasDura: number; fechaFin: _moment.MomentInput; fechaIni: _moment.MomentInput; }) =>{ t1.diasDura=moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days')<0?0:moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days')}) ;
        console.log('factura',this.colaborador);
        console.log('facturas',facturaListData);
        this.facturaList = new MatTableDataSource(facturaListData);
        this.facturaList.paginator = this.paginator!;
        this.facturaList.sort = this.sort;
        const sortState: Sort = {active: 'createdAt', direction: 'desc'};
        this.sort.active = sortState.active;
        this.sort.direction = sortState.direction;
        this.sort.sortChange.emit(sortState);
       },
      (err:any) => {  },
      () => {console.log('Termino'); }
    );  
  }
  tablaPagos(){
    this.servicios.getUnParametro('reportes', '?idUsuario='+this.arrsesion[0].idUser)
    .pipe(
        catchError(err => { this.pagoList = new MatTableDataSource(); return throwError(err); })
    )
    .subscribe(
      (res:any) => {
        let pagoListData= res.map(
          (t1: { idUser: any; idMoneda: any; idUsoFondos: any;  diasDura: any; fechaIni: any; fechaFin: any;}) => ({
              ...t1, ...this.FacturaOrden.find((t2: { IdColaborador: any; }) => t2.IdColaborador === t1.idUser),
            })
          ) 
          pagoListData.map((t1: { diasDura: number; fechaFin: _moment.MomentInput; fechaIni: _moment.MomentInput; }) =>{ t1.diasDura=moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days')<0?0:moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days')}) ;
        console.log('pagos',pagoListData);
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
  tablaComplemento(){
    this.servicios.getUnParametro('reportes', '?idUsuario='+this.arrsesion[0].idUser)
    .pipe(
        catchError(err => { this.complementoList = new MatTableDataSource(); return throwError(err); })
    )
    .subscribe(
      (res:any) => {
        let complementoListData= res.map(
          (t1: { idUser: any; idMoneda: any; idUsoFondos: any;  diasDura: any; fechaIni: any; fechaFin: any;}) => ({
              ...t1, ...this.FacturaOrden.find((t2: { IdColaborador: any; }) => t2.IdColaborador === t1.idUser),
            })
          ) 
          complementoListData.map((t1: { diasDura: number; fechaFin: _moment.MomentInput; fechaIni: _moment.MomentInput; }) =>{ t1.diasDura=moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days')<0?0:moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days')}) ;
        console.log('factura',this.colaborador);
        console.log('Complementos',complementoListData);
        this.complementoList = new MatTableDataSource(complementoListData);
        this.complementoList.paginator = this.paginator!;
        this.complementoList.sort = this.sort;
        const sortState: Sort = {active: 'createdAt', direction: 'desc'};
        this.sort.active = sortState.active;
        this.sort.direction = sortState.direction;
        this.sort.sortChange.emit(sortState);
       },
      (err:any) => {  },
      () => {console.log('Termino'); }
    );  
  }
 openDialog(action: string, obj: any) {
   
    obj.action = action;
    const dialogRef = this.dialog.open(AgregarDialogContent, {
        data: obj,
        width:'100%',
        height:'56%'
        
    });

    dialogRef.afterClosed().subscribe(result => {
        if (result.event === 'Agregar') {
            this.addRowData(result.data);
        }else if (result.event === 'Modificar') {
          this.updateRowData(result.data);
      } else if (result.event === 'Borrar') {
          this.deleteRowData(result.data);
      }
    });
}
addRowData(row_obj: TicketElement) {
  const d = new Date();
  this.dataSource.data.push({
      id: d.getTime(),
      Cantidad: row_obj.Cantidad,
      Unidad: row_obj.Unidad,
      IDProducto: row_obj.IDProducto,
      CuentaC: row_obj.CuentaC,
      Tarifa: row_obj.Tarifa,
      Monto: row_obj.Monto,
      Descuento: row_obj.Descuento,
      ImpuestoAplicable: row_obj.ImpuestoAplicable,
      MontoDescuento: row_obj.MontoDescuento,
      Importe: row_obj.Importe,
  });
  this.table.renderRows();

}
updateRowData(row_obj: TicketElement) {
  this.dataSource.data = this.dataSource.data.filter((value, key) => {
      if (value.id === row_obj.id) {
          value.Cantidad = row_obj.Cantidad;
          value.Unidad = row_obj.Unidad;
          value.IDProducto = row_obj.IDProducto;
          value.CuentaC = row_obj.CuentaC;
          value.Tarifa = row_obj.Tarifa;
          value.Monto = row_obj.Monto;
          value.Descuento = row_obj.Descuento;
          value.ImpuestoAplicable = row_obj.ImpuestoAplicable;
          value.MontoDescuento = row_obj.MontoDescuento;
          value.Importe = row_obj.Importe;

      }
      return true;
  });
}
deleteRowData(row_obj: TicketElement) {
  this.dataSource.data = this.dataSource.data.filter((value, key) => {
      return value.id !== row_obj.id;
  });
}

  /**
     * Metodo que inicializa.
     * 
     */
  ngOnInit(): void {
  }
  /**
     * Obtiene el historial.
     * @return {Array} Te regresa Historial.
     */
  Historia() {
    this.servicios.getUnParametro('gastos',`${this.id}/historial` )      
    .pipe( catchError(err => {return throwError(err);  })
    ) .subscribe((hist:any) => {  
      hist.length>0?this.Historial = new MatTableDataSource(hist):this.Historial = new MatTableDataSource();
      console.log('historial', this.Historial)
      this.Historial.paginator = this.paginator;
      this.Historial.sort = this.sort;
    },() => {}        
    ); 
  }
   /**
     * Cambia la cuenta en relación al banco.
     * @return {Array} Te regresa Cuentas.
     */
  cambiaEmp(evento:any, arr:any){
    //this.gasto.idEmpresa=evento.value;    
    //this.valida(this.gasto);
    
    this.Cuenta=[];
    console.log('antes',this.Cuenta)
    console.log('evento',evento.value)
    this.Cuentas.map((cuen:any)=>{
      if(cuen.BancoEmisor==evento.value){
        this.Cuenta.push(cuen);
        console.log('despues',this.Cuenta)
      }
   });
    this.bloqueoCuenta=false;

  }
/**
     * Cambia la Moneda en relación al banco.
     * @return {Array} Te regresa NomBancos.
     */
  cambiaMoneda(evento:any, arr:any){
    //this.gastosNofiscal.Moneda=(evento.source.selected as MatOption).viewValue; 
    //this.gastosNofiscal.idMoneda=evento.value; 
    //this.valida(this.gastosNofiscal);   
    console.log(evento.value)
    this.Bancos=[];
    this.NomBancos.map((ban:any)=>{
      if(ban.idMoneda==evento.value){
        this.Bancos.push(ban);
      }
   });
    
    this.bloqueoBanco=false;

  }
  /**
     * Guarda la información contenida dentro de los inputs.
     * @return {Array} Te regresa guardar.
     */
  guardarProveedores() {
    this.dialogService.openConfirmDialog('Esta seguro que desea guardar los cambios de la transacción?')
      .afterClosed().subscribe(res =>{
        console.log(res);
        if(res){
          let guardar={
            razonSocial: this.tesoreriaListData.razonSocial,
            idProveedor: this.tesoreriaListData.idProveedor,
            idTerminoPago: this.tesoreriaListData.idTerminoPago,
            sitioWeb: this.tesoreriaListData.sitioWeb,
            idNacionalidad: this.tesoreriaListData.idNacionalidad,
            Observaciones: this.tesoreriaListData.Observaciones,
            fecharegistro: this.tesoreriaListData.fecharegistro,
            idPersona: this.tesoreriaListData.idPersona,
            RFC: this.tesoreriaListData.RFC,
            idRegFiscal: this.tesoreriaListData.idRegFiscal,
            idActividadEconomica: this.tesoreriaListData.idActividadEconomica,
            idUsoCFDI: this.tesoreriaListData.idUsoCFDI,
            idPais: this.tesoreriaListData.idPais,
            cp: this.tesoreriaListData.cp,
            calle: this.tesoreriaListData.calle,
            noExterior: this.tesoreriaListData.noExterior,
            noInterior: this.tesoreriaListData.noInterior,
            colonia: this.tesoreriaListData.colonia,
            alcaldia: this.tesoreriaListData.alcaldia,
            estado: this.tesoreriaListData.estado,
            idBanco: this. tesoreriaListData.idBanco,
            sucursal: this.tesoreriaListData.sucursal,
            idMoneda: this.tesoreriaListData.idMoneda,
            cuenta: this.tesoreriaListData.cuenta,
            cveinter: this.tesoreriaListData.cveinter,
            convenio: this.tesoreriaListData.convenio,
            codigo: this.tesoreriaListData.codigo,
            codigoA: this.tesoreriaListData.codigoA,
            id_erp: this.tesoreriaListData.id_erp,
            nombre: this.tesoreriaListData.nombre,
            email: this.tesoreriaListData.email,
            telefono: this.tesoreriaListData.telefono,
            opciones: this.tesoreriaListData.opciones,
  
          }          
          console.log('lo que se guarda',guardar);
          
        } 
    });
  }
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.facturaList.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
      this.isAllSelected() ?
          this.selection.clear() :
          this.facturaList.data.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: any): string {          
      if (!row) {          
          return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
      }
      return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }
    /**
     * Cierra el dialogo y reedirecciona a la lista de proveedores.
     * 
     */
  cerrarGastosZ() {    
    this.dialogService.openConfirmDialog('¿Esta seguro desea salir sin guardar?')
      .afterClosed().subscribe(res =>{
        if(res){
          this.router.navigate(['/proveedores/ordenes']);
        } 
    });
  }

  cambiaWork(evento:any, arr:any){
    this.dialogService.openConfirmDialog('  ¿Esta seguro que desea cambiar al estatus '+(evento.source.selected as MatOption).viewValue+'?')
      .afterClosed().subscribe(res =>{
        console.log(res);
        if(res){
        
        } else{
         
        }
    });
  }

  enviar(){}

  cargaArchivoPDF(event: any) {
    this.archivoPdf = [];
    if (event.target.files.length > 0) {      
      this.archivoPdf = event.target.files[0];
      const formData = new FormData();
      formData.append('file',this.archivoPdf); 
      this.FileUrlPDF = URL.createObjectURL(this.archivoPdf);
      this.tesoreriaListData.comprobante='archivo.pdf';    
      this.siPDF=true;  
      /* 
      this.http.post(`${API}gastos/upload/?gasto_id=${this.devolucionArr.id}`, formData)
        .subscribe(res => {
          this.devolucionArr.concepto=res;  
          this.siPDF=true;              
          this.FileUrlPDF = URL.createObjectURL(this.archivoPdf);
          //this.valida(this.gasto);       
        })*/
    }
  }

  pdf(){
    FileSaver.saveAs(this.descargaPDF, this.tesoreriaListData.comprobante + '_' + new  Date().getTime() + '.pdf');    
  }

  delPdf(){
    this.dialogService.openConfirmDialog('  ¿Esta seguro que desea eliminar el comprobante PDF?')
      .afterClosed().subscribe(res =>{
        if(res){/*

          this.servicios.deleteMultiple(`gastos/eliminadocumento/${this.devolucionArr.id}/ARCHIVO` )        
            .pipe( catchError(err => {return throwError(err);  })
            ) .subscribe((del:any) => { 
              console.log(del);
              this.siPDF=false; 
              this.inputPdf.nativeElement.value = null;
              this.archivoPdf = []; 
              this.gasto.rutaArchivo=null; 
              this.FileUrlPDF = '';  
              this.mensajes.mensaje('Se ha borrado con exito el comprobante PDF.','','danger');          
            },() => {}        
            );*/

        } else {
        
        }
    });
  }

  incrementZoom(amount: number) {
    this.zoom_to += amount;   
  }
  valida(event: any) {  
    this.btnGda='1';  
  }
  step = 2;
  setStep(index: number) { this.step = index; }
  nextStep() { this.step++; }
  prevStep() { this.step--; }


}

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'productos-content',
  templateUrl: 'productos-content.html',
})
// tslint:disable-next-line: component-class-suffix
export class AgregarDialogContent {
  action: string;
  local_data: any;

  constructor(
      public dialogRef: MatDialogRef<AgregarDialogContent>,
      // @Optional() is used to prevent error if no data is passed
      @Optional() @Inject(MAT_DIALOG_DATA) public data: TicketElement) {
        console.log('dta',data);
      this.local_data = { ...data };
      this.action = this.local_data.action;
  }
  

  doAction() {
      this.dialogRef.close({ event: this.action, data: this.local_data });
  }

  closeDialog() {
      this.dialogRef.close({ event: 'Cancel' });
  }

}
