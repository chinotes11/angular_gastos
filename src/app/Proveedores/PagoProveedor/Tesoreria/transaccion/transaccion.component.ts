import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceinvoiceService } from '../tesoreria.service';
import {  TesoreriaList} from '../tesoreria';
import { FormGroup, FormBuilder, Validators, FormControl, NgForm, FormGroupDirective } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field'; 
import {MatDialog} from '@angular/material/dialog';
import { WorkFlowService} from '../../../../Genericos/servicios.service'
import { ErrorStateMatcher, MatOption } from '@angular/material/core';
import { DialogService } from '../../../acciones/dialog.service';
import { DatePipe } from '@angular/common';
import * as _moment from 'moment';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { serviciosService } from "../../../../Genericos/servicios/servicios.service";
import { environment } from '../../../../../environments/environment';
import { MensajesService } from "../../../../Genericos/mensajes/mensajes.service";
import { PdfViewerComponent} from 'ng2-pdf-viewer';
import { MatCheckboxChange } from '@angular/material/checkbox';

declare var jQuery: any;
import * as FileSaver from 'file-saver';
const API = environment.ApiUrl;
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
  //selector: 'app-transaccion',
  templateUrl: './transaccion.component.html',
  styleUrls: ['./transaccion.component.scss']
})
export class TransaccionComponent implements OnInit {
  id: any;
  colaborador: any=[];
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
  
  
  constructor(activatedRouter: ActivatedRoute, 
    public datePipes:DatePipe,
    private servicios: serviciosService,
    public invoiceService: ServiceinvoiceService,
    public workService:WorkFlowService,
    private router: Router, 
    public dialog:MatDialog,
    private mensajes: MensajesService,
    private dialogService: DialogService,
    private http: HttpClient) {
      this.colaborador = this.invoiceService.getTesoreriaList();
      this.id = activatedRouter.snapshot.paramMap.get('id');  
      this.arrsesion= JSON.parse(window.sessionStorage.getItem("persona")!);
      this.workInicial= JSON.parse(window.sessionStorage.getItem("workflow")!);
      this.MonedaL= JSON.parse(window.sessionStorage.getItem("moneda")!);
      this.CentroCosto= JSON.parse(window.sessionStorage.getItem("centrocostos")!);
      this.NomBancos=JSON.parse(window.sessionStorage.getItem("banco")!);
      this.NomBancosRes= JSON.parse(window.sessionStorage.getItem("bancores")!);
      this.Cuentas= JSON.parse(window.sessionStorage.getItem("cuentas")!);
      this.CuentasRec= JSON.parse(window.sessionStorage.getItem("cuentasRec")!);
      this.Empresas= JSON.parse(window.sessionStorage.getItem("empresa")!);
      this.InicioD();    
    }
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

       },
      (err:any) => {  },
      () => {console.log('Termino'); }
    );  
    
  }

  ngOnInit(): void {
  }

  Historia() {
    this.servicios.getUnParametro('gastos',`${this.id}/historial` )      
    .pipe( catchError(err => {return throwError(err);  })
    ) .subscribe((hist:any) => {  
      hist.map((h:any)=>{ h.fechaRegistro=moment(h.fechaRegistro).format('YYYY-MM-DD HH:mm:ss') })
      hist.length>0?this.Historial = new MatTableDataSource(hist):this.Historial = new MatTableDataSource();
      this.Historial.paginator = this.paginator;
      this.Historial.sort = this.sort;
    },() => {}        
    ); 
  }
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
  
  guardarGastosZ() {
    this.dialogService.openConfirmDialog('Esta seguro que desea guardar los cambios de la transacción?')
      .afterClosed().subscribe(res =>{
        console.log(res);
        if(res){
          let guardar={
            idEmpresa: this.tesoreriaListData.idEmpresa,
            Proyecto: this.tesoreriaListData.Proyecto,
            idCentrosCostos: this.tesoreriaListData.idCentrosCostos,
            IdColaborador: this.tesoreriaListData.IdColaborador,
            NombreColaborador: this.tesoreriaListData.NombreColaborador,
            Moneda: this.tesoreriaListData.Moneda,
            TipoTransaccion: this.tesoreriaListData.TipoTransaccion,
            IdTipoTransaccion: this.tesoreriaListData.IdTipoTransaccion,
            MontoTransaccion: this.tesoreriaListData.MontoTransaccion,
            SaldoPendientePago: this.tesoreriaListData.SaldoPendientePago,
            BancoReceptor: this.tesoreriaListData.BancoReceptor,
            idCuentaReceptor: this.tesoreriaListData.idCuentaReceptor,
            idMoneda: this.tesoreriaListData.idMoneda,
            TipoCambio: this.tesoreriaListData.TipoCambio,
            BancoEmisor: this.tesoreriaListData.BancoEmisor,
            idCuenta: this.tesoreriaListData.idCuenta,
            IdPago: this.tesoreriaListData.IdPago,
            FormaPago: this.tesoreriaListData.FormaPago,
            fechaIni: this.tesoreriaListData.fechaIni,
            FechaAplicacionPago: this.tesoreriaListData.FechaAplicacionPago,
            ReferenciaPago: this. tesoreriaListData.ReferenciaPago,
            Folio: this.tesoreriaListData.Folio,
            ClaveRastreo: this.tesoreriaListData.ClaveRastreo,
            FechaConciliacion: this.tesoreriaListData.FechaConciliacion,
            Observaciones: this.tesoreriaListData.Observaciones,
          }          
          console.log('lo que se guarda',guardar);
          
        } 
    });
  }
  
  cerrarGastosZ() {    
    this.dialogService.openConfirmDialog('¿Esta seguro desea salir sin guardar?')
      .afterClosed().subscribe(res =>{
        if(res){
          this.router.navigate(['proveedores/pagoproveedor/tesoreriaproveedor']);
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

}