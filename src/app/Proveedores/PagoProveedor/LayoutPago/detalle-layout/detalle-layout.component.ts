import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceinvoiceService } from '../layout.service';
import {  TesoreriaList} from '../layout';
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
  //selector: 'app-detalle-layout',
  templateUrl: './detalle-layout.component.html',
  styleUrls: ['./detalle-layout.component.scss']
})
export class DetalleLayoutComponent implements OnInit {
  id: any;
  colaborador: any=[];
  tesoreriaListData: any=[];
  workInicial: any;
  workOrigen!:string;
  arrsesion: any;
  MonedaL:any;
  Bancos: any;
  Cuentas:any;
  Empresas:any;
  btnGda: string='1';
  bloqueo:boolean=true;
  bloqueoWf:string='1';
  Historial:any;
  tesoreriaList:any=[];

  siPDF:boolean=false;
  archivoPdf!:any;
  FileUrlPDF:any;
  descargaPDF:any;
  zoom_to:any=0.8;

  histColumns: string[] = ['fechaRegistro', 'idUser', 'evento', 'estatus', 'comentarios'];
  @ViewChild(MatSort) sort: MatSort = Object.create(null);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

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
    this.Cuentas= JSON.parse(window.sessionStorage.getItem("cuentas")!);
    this.Bancos= JSON.parse(window.sessionStorage.getItem("banco")!);
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
        this.tesoreriaListData= res.map(
          (t1: { idUser: any; idMoneda: any; idUsoFondos: any;  diasDura: any; fechaIni: any; fechaFin: any;}) => ({
              ...t1, ...this.colaborador.find((t2: { IdColaborador: any; }) => t2.IdColaborador === t1.idUser),
            })
          ) 
         this.tesoreriaListData.map((t1: { diasDura: number; fechaFin: _moment.MomentInput; fechaIni: _moment.MomentInput; }) =>{ t1.diasDura=moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days')<0?0:moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days')}) ;
        console.log('colaboradores',this.colaborador);
        console.log('Reportes',this.tesoreriaListData);

        this.tesoreriaListData= this.tesoreriaListData[0]
        this.tesoreriaListData.comprobante=null;

       },
      (err:any) => {  },
      () => {console.log('Termino'); }
    );  
    
  }

  ngOnInit(): void {
  }

  Historia() {
    this.servicios.getUnParametro('layoutbancario',`${this.id}/historial` )      
    .pipe( catchError(err => {return throwError(err);  })
    ) .subscribe((hist:any) => {  
      hist.map((h:any)=>{ h.fechaRegistro=moment(h.fechaRegistro).format('YYYY-MM-DD HH:mm:ss') })
      hist.length>0?this.Historial = new MatTableDataSource(hist):this.Historial = new MatTableDataSource();
      console.log('historial',this.Historial )
      this.Historial.paginator = this.paginator;
      this.Historial.sort = this.sort;
    },() => {}        
    ); 
  }
  
  guardarGastosZ() {
    this.dialogService.openConfirmDialog('Esta seguro que desea guardar los cambios del gasto?')
      .afterClosed().subscribe(res =>{
        console.log(res);
        if(res){
          let guardar={
            TipoLayout: this.tesoreriaListData.TipoLayout,
            idEmpresa: this.tesoreriaListData.idEmpresa,
            BKL_ID: this.tesoreriaListData.BKL_ID,
            BancoEmisor: this.tesoreriaListData.BancoEmisor,
            idCuenta: this.tesoreriaListData.idCuenta,
            fechaIni: this.tesoreriaListData.fechaIni,
            monto: this.tesoreriaListData.monto,
            Moneda: this.tesoreriaListData.Moneda,
            NoRegistros: this.tesoreriaListData.NoRegistros,
          }          
          console.log(guardar);
        } 
    });
  }
  
  cerrarGastosZ() {    
    this.dialogService.openConfirmDialog('¿Esta seguro desea salir sin guardar?')
      .afterClosed().subscribe(res =>{
        if(res){
          this.router.navigate(['proveedores/pagoproveedor/layoutpagoproveedor/']);
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
