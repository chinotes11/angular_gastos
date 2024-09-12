import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceinvoiceService } from '../tesoreria.service';
import { GastosDetalle, ProdServList, CfdiRelacion, CompNoFiscal } from '../gastosz';
import { FormGroup, FormBuilder, Validators, FormControl, NgForm, FormGroupDirective } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field'; 
import {MatDialog} from '@angular/material/dialog';
import { WorkFlowService} from '../../../Genericos/servicios.service'
import { ErrorStateMatcher, MatOption } from '@angular/material/core';
import { DialogService } from '../../acciones/dialog.service';
import { DatePipe } from '@angular/common';
import * as _moment from 'moment';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { serviciosService } from "../../../Genericos/servicios/servicios.service";
import { environment } from '../../../../environments/environment';
import { MensajesService } from "../../../Genericos/mensajes/mensajes.service";
import { MatCheckboxChange } from '@angular/material/checkbox';
declare var jQuery: any;
import * as FileSaver from 'file-saver';
import { PdfViewerComponent} from 'ng2-pdf-viewer';
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
  //selector: 'app-edit-gastos',
  templateUrl: './Facturas-edita.component.html',
  styleUrls: ['./Facturas-edita.component.css']
})
export class EditaFacturasComponent implements OnInit {
  id: any;
  gasto: any;
  gastos: any=[];
  gastosFiscal: any;
  colaborador:any;
  gastosNofiscal:any;
  gastoRel:any;
  noFiscalOrig:any;
  causaLista: any;
  workInicial: any;
  workOrigen!:string;
  unionFecha:any=''
  subTotal = 0;
  vat = 0;
  grandTotal = 0;
  arrsesion: any;
  TipoSol:any;
  MonedaL:any;
  CentroCosto:any;
  TipoComprobante:any;
  Proyectos:any;
  Empresas:any;
  Tipogasto:any;
  btnGda: string='1';
  bloqueo:boolean=true;
  bloqueoWf:string='1';
  modFiscal:boolean=false;
  modNofiscal:boolean=false;
  formapago:any;
  Historial:any;
  idWorkflow:any;
  FileUrlPDF:any;
  descargaPDF:any;
  FileUrlXML:any;
  descargaXML:any;
  zoom_to:any=0.8;
  siFiscal:boolean=false;
  siXml:boolean=false;
  siPDF:boolean=false;
  archivoXml!:any;
  archivoPdf!:any;
  prodservTabla: MatTableDataSource<any>;
  cfdiRelTabla: MatTableDataSource<any>;
  selection = new SelectionModel<ProdServList>(true, []);
  histColumns: string[] = ['fechaRegistro', 'idUser', 'evento', 'estatus', 'comentarios'];
  displayedColumns: string[] = ['idProductoServicio','detalleProductoServicio','cuentacontable','claveFiscal','cantidad','unidadMedida','descripcion','precioUnitario','importe','descuento','tasaIva','montoIva','tasaIeps','montoIeps','tasaRetencionIsr','montoRetencionIsr','tasaRetencionIva','montoRetencionIva'];
  columCFDIRel: string[] = ['uuid','idTipoCfdiRelacionado','uuidRelacionado'];
  @ViewChild(MatSort) sort: MatSort = Object.create(null);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
  @ViewChild(PdfViewerComponent) public pdfViewer: PdfViewerComponent []= [];
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
    this.id = activatedRouter.snapshot.paramMap.get('id');  
    this.gasto={estatus: null};  
    this.colaborador = this.invoiceService.getTesoreriaList();

    this.arrsesion= JSON.parse(window.sessionStorage.getItem("persona")!);
    this.workInicial= JSON.parse(window.sessionStorage.getItem("workflow")!);
    this.TipoSol= JSON.parse(window.sessionStorage.getItem("tipoSolicitud")!);
    this.MonedaL= JSON.parse(window.sessionStorage.getItem("moneda")!);
    this.CentroCosto= JSON.parse(window.sessionStorage.getItem("centrocostos")!);
    this.Proyectos= JSON.parse(window.sessionStorage.getItem("proyecto")!);
    this.Empresas= JSON.parse(window.sessionStorage.getItem("empresa")!);
    this.TipoComprobante= JSON.parse(window.sessionStorage.getItem("tipocomprobantes")!); 
    this.Tipogasto= JSON.parse(window.sessionStorage.getItem("tipogasto")!); 
    this.formapago= JSON.parse(window.sessionStorage.getItem("formapago")!);  
    this.prodservTabla = new MatTableDataSource();
    this.cfdiRelTabla = new MatTableDataSource();
    this.gastosNofiscal= [];
    this.Inicio();
        
  }

  Inicio(){
    this.servicios.getUnParametro('gastos',this.id )      
      .pipe( catchError(err => {return throwError(err);  })
      ) .subscribe((res:any) => {    
          this.Historia();                                
          this.gasto = [res].map(
            (t1: { idUser: any; idMoneda: any; idUsoFondos: any;  diasDura: any; fechaIni: any; fechaFin: any;}) => ({
                ...t1, ...this.arrsesion.find((t2: { idUser: any; }) => t2.idUser === t1.idUser),
                ...t1, ...this.colaborador.find((t2: { IdColaborador: any; }) => t2.IdColaborador === t1.idUser)
              })
            ); 
          this.gasto.map((t1: any) =>{ 
            t1.NombreCompleto=`${t1.Nombre} ${t1.Paterno} ${t1.Materno}`;
            t1.fechaReg= moment(new Date(t1.createdAt)).format("MM/DD/YYYY");
            t1.idTipoComprobante=t1.idTipoComprobante==0?2:t1.idTipoComprobante;   
            if(t1.idTipoComprobante==1){t1.siFiscal=true; this.modFiscal=false; this.modNofiscal=true; }  
            if(t1.idTipoComprobante==2){t1.siFiscal=false; this.modFiscal=true; this.modNofiscal=false;}  
          });
          this.gasto=this.gasto[0]; 
          this.workOrigen=this.gasto.estatus; 
          //this.gasto.siFiscal==true?this.modFiscal=false:this.modNofiscal=true;          
          this.idWorkflow=this.workInicial.filter((dato:any) => dato.nombreObjeto=="Gastos" && this.arrsesion[0].nombreRol==dato.nombreRol &&  dato.evento.some((o2:any) => o2.siguienteEstatus === res.estatus));
          this.idWorkflow= this.idWorkflow[0].id;
          this.workInicial = this.workInicial.filter((dato:any) => dato.estatusActual == this.gasto.estatus && dato.nombreObjeto== "Gastos")
          this.workInicial = this.workInicial[0].evento;  
          console.log('Gasto',this.gasto); 
          if(this.gasto.rutaArchivo!=null){
            this.siPDF=true;
            this.servicios.getFile('gastos/download', `${this.gasto.id}/ARCHIVO`)
              .pipe(catchError(err => { 
                console.log(err); 
                return throwError(err);})
              ).subscribe((pdf: Blob) => {
                this.FileUrlPDF = URL.createObjectURL(pdf);
                this.descargaPDF=pdf;                 
              },
                (err:any) => { }, () => { }
              ); 
          }
          
          
          switch (this.gasto.idTipoComprobante) {
            case 1: //gastos/{gasto_id} 
            if(this.gasto.rutaXml!=null){
              this.siXml=true;
              this.servicios.getFile2('gastos/download', `${this.gasto.id}/XML`)
                  .pipe(catchError(err => { console.log(err);   return throwError(err);})
                  ).subscribe((xml: Blob) => {
                    this.FileUrlXML = URL.createObjectURL(xml);
                    this.descargaXML=xml;                 
                  }, (err:any) => { }, () => { }
              ); 
                this.servicios.getUnParametro('gastos', `${this.gasto.id}/comprobante`)      
                    .pipe( catchError(err => {return throwError(err);  })
                    ) .subscribe((fiscal:any) => {  
                      this.gastos=fiscal;
                      if(fiscal.uuidRelacionado){
                        this.gastoRel.push({uuid:fiscal.uuid,uuidRelacionado:fiscal.uuidRelacionado,idTipoCfdiRelacionado:fiscal.idTipoCfdiRelacionado});
                        this.cfdiRelTabla = new MatTableDataSource(this.gastoRel);
                        this.cfdiRelTabla.paginator = this.paginator!;
                      }else{
                        this.gastoRel=[];
                        this.cfdiRelTabla = new MatTableDataSource(this.gastoRel);
                      }                      
                      this.servicios.getUnParametro('gastos', `${this.gasto.id}/comprobantedetalle`)      
                        .pipe( catchError(err => {return throwError(err);  })
                        ) .subscribe((detalle:any) => {
                          //this.prodservTabla=detalle.length>0?detalle:{};
                          this.prodservTabla = new MatTableDataSource(detalle);
                          this.prodservTabla.paginator = this.paginator!;
                          this.prodservTabla.sort = this.sort;
                        }, (err:any) => { }, () => { }
                        ); 
                    },() => { }        
                ); 
              }
             
              break;
            case 2:
              this.servicios.getUnParametro('gastosnofiscales',`?idGasto=${this.gasto.id}` )      
                .pipe( catchError(err => {return throwError(err);  })
                ) .subscribe((nofiscal:any) => {
                  if(nofiscal.length>0){
                    this.siXml=true;
                    this.noFiscalOrig=nofiscal.length
                    this.gastosNofiscal=nofiscal[0]; 
                    this.gastosNofiscal.Moneda=this.MonedaL.filter((mon:any) => mon.tipo == this.gastosNofiscal.idMoneda)[0].tipo;   
                  } else {
                    this.noFiscalOrig=nofiscal.length
                    this.gastosNofiscal=[];  
                  }
                  console.log(this.gastosNofiscal);    
                },() => {}        
                ); 
              break;
            default:

              break;
          } 
          
        },() => {console.log('Termino'); }        
      ); 
  }

  ngOnInit(): void {
  }

  Historia() {
    this.servicios.getUnParametro('gastos',`${this.id}/historial` )      
    .pipe( catchError(err => {return throwError(err);  })
    ) .subscribe((hist:any) => {  
      hist.length>0?this.Historial = new MatTableDataSource(hist):this.Historial = new MatTableDataSource();
      this.Historial.paginator = this.paginator;
      this.Historial.sort = this.sort;
    },() => {}        
    ); 
  }

  step = 3;
  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  cambiaCC(evento:any, arr:any){ 
    this.gasto.idCentrosCostos=evento.value;    
    this.valida(this.gasto);
  }

  cambiaProy(evento:any, arr:any){ 
    this.gasto.idProyecto=evento.value;    
    this.valida(this.gasto);
  }

  cambiaEmp(evento:any, arr:any){
    this.gasto.idEmpresa=evento.value;    
    this.valida(this.gasto);
  }

  cambiaMoneda(evento:any, arr:any){
    this.gastosNofiscal.Moneda=(evento.source.selected as MatOption).viewValue; 
    this.gastosNofiscal.idMoneda=evento.value; 
    this.valida(this.gastosNofiscal);   
  }

  cambiaTipoG(evento:any, arr:any){
    
    this.gasto.idTipoGasto=evento.value; 
    console.log(this.gasto.idTipoGasto);   
    this.valida(this.gasto);
  }

  cambiaFormaP(evento:any, arr:any){    
    this.gastosNofiscal.metodoPago=evento.value; 
  }
  
  comprobante(evento:any){ 
      this.step = 0;   
      if(evento.checked==true){this.gasto.idTipoComprobante=1; this.modFiscal=false; this.modNofiscal=true;}
      if(evento.checked==false){console.log("ENTRA"); this.gasto.idTipoComprobante=2; this.modFiscal=true; this.modNofiscal=false;}
      //this.valida(this.gasto); 
      //this.mensajes.mensaje('No se puede cambiar el gasto cuando ya se ha subido un comprobante XML o PDF.','','danger');
  }

  valida(event: any) {
    this.btnGda='1';
    /*
    if(this.gasto.notas!=null && this.gasto.notas!=''){}else{return false;}; 
    if(this.gasto.idEmpresa > 0){}else{ return false;};
    if(this.gasto.idProyecto > 0){}else{ return false;};
    if(this.gasto.idCentrosCostos>0){}else{ return false;}; */
    if(this.gasto.idTipoComprobante=1){
      
    } else {

    }
     
  }

  guardarGastosZ() {
    this.dialogService.openConfirmDialog('Esta seguro que desea guardar los cambios del gasto?')
      .afterClosed().subscribe(res =>{
        console.log(res);
        if(res){
          let guardar={
            idEmpresa: this.gasto.idEmpresa,
            idProyecto: this.gasto.idProyecto,
            idCentrosCostos: this.gasto.idCentrosCostos,
            idUser: this.gasto.idUser,
            idTipoComprobante: this.gasto.idTipoComprobante,
            idTipoGasto: this.gasto.idTipoGasto,
            notas: this.gasto.notas,
            monto: this.gasto.monto,
            montoAprobado: this.gasto.montoAprobado,
            estatus: this.gasto.estatus
          }          
          console.log(guardar);
          this.servicios.putDatos(`gastos/${this.gasto.id}?idWorkflow=${this.idWorkflow}`, guardar)
            .pipe(  catchError(err => { return throwError(err);  })
            ).subscribe( (gst:any) => { 
              console.log(gst);

              if(this.gasto.idTipoComprobante==2){
                console.log("NO FISCAL");
                let guardarNoF={
                  folioComprobante: this.gastosNofiscal.folioComprobante!=null?this.gastosNofiscal.folioComprobante:'', 
                  fechaEmision: this.gastosNofiscal.fechaEmision!=null?this.datePipes.transform(new Date(this.gastosNofiscal.fechaEmision), 'yyyy-MM-dd'):this.datePipes.transform(new Date(Date.now()), 'yyyy-MM-dd'), 
                  razonSocialEmisor: this.gastosNofiscal.razonSocialEmisor!=null?this.gastosNofiscal.razonSocialEmisor:'', 
                  concepto: this.gastosNofiscal.concepto!=null?this.gastosNofiscal.concepto:'', 
                  importeTotal: this.gastosNofiscal.importeTotal!=null?Number(this.gastosNofiscal.importeTotal):0,
                  idMoneda: this.gastosNofiscal.idMoneda!=null?this.gastosNofiscal.Moneda:'MXN',
                  metodoPago: this.gastosNofiscal.metodoPago!=null?this.gastosNofiscal.metodoPago:'',
                  importeAprobado: this.gastosNofiscal.importeAprobado!=null?Number(this.gastosNofiscal.importeAprobado):0
                 }
                 
                 console.log(guardarNoF);
                 console.log(this.noFiscalOrig);                 
                 if(this.noFiscalOrig==0){
                    this.servicios.postDatosQ('gastosnofiscales',`?idGasto=${this.gasto.id}`, guardarNoF)
                      .pipe(
                        catchError(err => { return throwError(err); })
                      ).subscribe(
                        (res:any) => {
                          console.log(res);
                          this.router.navigate(['/gastosz']);   
                        },
                        (err:any) => {  },
                        () => {console.log('Termino'); }
                    );
                 } else {
                  this.servicios.putDatos(`gastosnofiscales/${this.gasto.id}?idWorkflow=${this.idWorkflow}`, guardarNoF)
                      .pipe(
                        catchError(err => { return throwError(err); })
                      ).subscribe(
                        (res:any) => {
                          console.log(res);
                          this.router.navigate(['/gastosz']);   
                        },
                        (err:any) => {  },
                        () => {console.log('Termino'); }
                    );
                 }
              } else {
                this.router.navigate(['/gastosz']);   
              }
              
            },
            (err:any) => {  },
            () => {}
            );
          
        } 
    });
  }
  
  cerrarGastosZ() {    
    {    
      this.dialogService.openConfirmDialog('¿Esta seguro desea salir sin guardar?')
        .afterClosed().subscribe(res =>{
          if(res){
            switch (window.sessionStorage.getItem("_origen")) {
              case 'listaFacturas':
                window.sessionStorage.setItem("_origen",'');
                console.log('deberia hacer algo aqui')
                this.router.navigate(['/proveedores/facturas']);    
  
                break;
              default:
                window.sessionStorage.setItem("_origen",'');
                this.router.navigate(['/proveedores/ordenes']);
              break;
            }  
  
          } else{
            
          }
      });
    }
  }

  cargaArchivoXML(event: any) {
    this.archivoXml =[];
    if (event.target.files.length > 0) {
      this.archivoXml = event.target.files[0];
      const formData = new FormData();
      formData.append('file',this.archivoXml); 
      this.http.post(`${API}gastos/uploadxml/?gasto_id=${this.gasto.id}`, formData)
        .subscribe((res: any) => {
          console.log(res); 
          this.gasto.rutaXml=res;
          this.siXml=true;
          this.servicios.getUnParametro('gastos', `${this.gasto.id}/comprobante`)      
          .pipe( catchError(err => {return throwError(err);  })
          ) .subscribe((fiscal:any) => {  
            this.gastos=fiscal;
            if(fiscal.uuidRelacionado){
              this.gastoRel.push({uuid:fiscal.uuid,uuidRelacionado:fiscal.uuidRelacionado,idTipoCfdiRelacionado:fiscal.idTipoCfdiRelacionado});
              this.cfdiRelTabla = new MatTableDataSource(this.gastoRel);
              this.cfdiRelTabla.paginator = this.paginator!;
            }else{
              this.gastoRel=[];
              this.cfdiRelTabla = new MatTableDataSource(this.gastoRel);
            }
              this.servicios.getUnParametro('gastos', `${this.gasto.id}/comprobantedetalle`)      
                  .pipe( catchError(err => { return throwError(err);  })
                  ).subscribe((detalle:any) => {
                    this.prodservTabla = new MatTableDataSource(detalle);
                    this.prodservTabla.paginator = this.paginator!;
                    this.prodservTabla.sort = this.sort;
                    this.valida(detalle);   
                  },(err:any) => { console.log(err);this.mensajes.mensaje('Hubo un error al cargar el XML.','','danger');}, () => { }        
                );   
            },(err:any) => { console.log(err);this.mensajes.mensaje('Hubo un error al cargar el XML.','','danger');}, () => { }        
          ); 
        },
        (err:any) => { console.log(err);this.mensajes.mensaje('Hubo un error al cargar el XML.','','danger');}, () => { }
      ); 
    }
  }

  cargaArchivoPDF(event: any) {
    this.archivoPdf = [];
    if (event.target.files.length > 0) {      
      this.archivoPdf = event.target.files[0];
      const formData = new FormData();
      formData.append('file',this.archivoPdf);     
      this.http.post(`${API}gastos/upload/?gasto_id=${this.gasto.id}`, formData)
        .subscribe(res => {
          this.gasto.rutaArchivo=res;  
          this.siPDF=true;              
          this.FileUrlPDF = URL.createObjectURL(this.archivoPdf);
          this.valida(this.gasto);       
        })
    }
  }

  enviar(){}

  pdf(){
    FileSaver.saveAs(this.descargaPDF, this.gasto.rutaArchivo + '_' + new  Date().getTime() + '.pdf');    
  }

  delPdf(){
    this.dialogService.openConfirmDialog('  ¿Esta seguro que desea eliminar el comprobante PDF?')
      .afterClosed().subscribe(res =>{
        if(res){
          this.servicios.deleteMultiple(`gastos/eliminadocumento/${this.gasto.id}/ARCHIVO` )        
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
            );
        } else {
        
        }
    });
  }

  xml(){    
    FileSaver.saveAs(this.descargaXML, this.gasto.rutaXml + '_' + new  Date().getTime() + '.xml');    
  }

  delXml(){
    this.dialogService.openConfirmDialog('  ¿Esta seguro que desea eliminar el comprobante XML?')
      .afterClosed().subscribe(res =>{
        if(res){
          this.servicios.deleteMultiple(`gastos/eliminadocumento/${this.gasto.id}/XML` )      
            .pipe( catchError(err => {return throwError(err);  })
            ) .subscribe((del:any) => { 
              console.log(del);
              this.siXml=false;
              this.gasto.rutaXml=null; 
              this.gastos=[];
              this.archivoXml =[]; 
              this.inputXml.nativeElement.value = null;
              this.prodservTabla = new MatTableDataSource();
              this.cfdiRelTabla = new MatTableDataSource();
              this.mensajes.mensaje('Se ha borrado con exito el comprobante XML .','','danger');
            },() => {}        
            );          
        } else{
          
        }
    });
    
  }

  incrementZoom(amount: number) {
    this.zoom_to += amount;   
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.prodservTabla.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
      this.isAllSelected() ?
          this.selection.clear() :
          this.prodservTabla.data.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: any): string {          
      if (!row) {          
          return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
      }
      return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  showOptions(event:MatCheckboxChange, arr:any): void {
    //this.copia=this.selection.selected.length===1?'1':'0';
  }

  cambiaWork(evento:any, arr:any){
    this.dialogService.openConfirmDialog('  ¿Esta seguro que desea cambiar al estatus '+(evento.source.selected as MatOption).viewValue+'?')
      .afterClosed().subscribe(res =>{
        console.log(res);
        if(res){
          
          this.servicios.deleteMultiple(`gastos/${this.id}` )      
            .pipe( catchError(err => {return throwError(err);  })
            ) .subscribe((del:any) => { 
              this.router.navigate(['/gastosz']); 
            },() => {}        
            );
        } else{
          this.gasto.estatus=this.workOrigen;
        }
    });
  }

}
