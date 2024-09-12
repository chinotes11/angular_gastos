/** Modulo Angular que muestra un listado de Layout de Pagos 
 * @module 1. detalle Layout Pago
 * detalle-layout.component.ts  
 */
 import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
 import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
 import { ActivatedRoute, Router } from '@angular/router';
 import { ServiceinvoiceService } from '../layout.service';
 import { FormGroup, FormBuilder, Validators, FormControl, NgForm, FormGroupDirective } from '@angular/forms';
 import { MatFormFieldModule } from '@angular/material/form-field'; 
 import {MatDialog} from '@angular/material/dialog';
 import { WorkFlowService} from '../../../Genericos/servicios.service'
 import { ErrorStateMatcher, MatOption } from '@angular/material/core';
 import { DialogService } from '../../acciones/dialog.service';
 import { DatePipe } from '@angular/common';
 import * as _moment from 'moment';
 import { MatTable, MatTableDataSource } from '@angular/material/table';
 import { MatSort, Sort } from '@angular/material/sort';
 import { MatPaginator } from '@angular/material/paginator';
 import { SelectionModel } from '@angular/cdk/collections';
 import { catchError } from 'rxjs/operators';
 import { forkJoin, Observable, throwError } from 'rxjs';
 import { serviciosService } from "../../../Genericos/servicios/servicios.service";
 import { environment } from '../../../../environments/environment';
 import { MensajesService } from "../../../Genericos/mensajes/mensajes.service";
 import { PdfViewerComponent} from 'ng2-pdf-viewer';
 import { TokenService } from '../../../auth/token/token.service';
 import { MY_FORMATS, funciones } from '../../../Genericos/utilidades/funciones';
 
 const APIAdmin= environment.ApiUrlAdmin;
 const headers = new HttpHeaders    
 headers.append('Content-type', 'applicartion.json')   
 declare var jQuery: any;
 import * as FileSaver from 'file-saver';
  import { MomentDateAdapter } from '@angular/material-moment-adapter';
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
 /**
   * componente Principal para listar y editar los layout 
   */
 @Component({
   //selector: 'app-detalle-layout',
   templateUrl: './detalle-layout.component.html',
   styleUrls: ['./detalle-layout.component.scss']
 })
  /** El nombre del modulo DetalleLayoutComponent */
 
 export class DetalleLayoutComponent implements OnInit {
   id: any;
   pagoList:MatTableDataSource<any>;
   colaborador: any=[];
   detalleLayout: any=[];
   workInicial: any;
   workOrigen!:string;
   arrsesion: any;
   MonedaL:any;
   CentroCosto:any;
   NomBancos:any;
   Bancos:any;
   Cuenta:any;
   NomBancosOrig: any;
   Cuentas: any;
   CuentasOrig: any;
   Empresas:any;
   Proyectos:any;
   formaPagos:any;
   btnGda: string='1';
   bloqueo:boolean=true;
   bloqueoWf:string='1';
   Historial:any;
   tesoreriaList:any=[];
   workFGral:any;
 
   siPDF:boolean=false;
   archivoPdf!:any;
   FileUrlPDF:any;
   descargaPDF:any;
   zoom_to:any=0.8;

   idRol:any;
   datSess:any; 
 
   histColumns: string[] = ['fechaRegistro', 'idUser', 'evento', 'estatus', 'comentarios'];
   displayedColumns: string[] = ['descEmpresa','nombre','estatusTrans','id','tipoTransaccion','montoTransaccion','NomMonedaTrans','fechaAplicacionTrans','FormaPago'];  
 
   @ViewChild(MatSort) sort: MatSort = Object.create(null);
   @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
   @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
 /**
  * Consulta catálogos y servicios.
  * 
  * 
  */
   constructor(activatedRouter: ActivatedRoute, 
     public datePipes:DatePipe,
     private servicios: serviciosService,
     public invoiceService: ServiceinvoiceService,
     public workService:WorkFlowService,
     private router: Router, 
     public dialog:MatDialog,
     private mensajes: MensajesService,
     private dialogService: DialogService,
     private http: HttpClient,
     private token: TokenService) {
      this.datSess=token.readToken('id','');
      this.datSess=this.datSess.split(','); 
      this.idRol=token.readToken('rlsRol','GASTOS');
      this.id=activatedRouter.snapshot.paramMap.get('id'); 
      this.pagoList = new MatTableDataSource();
      this.getUsuario(this.datSess[0],this.datSess[1]).subscribe((rsUs:any) => {
        this.arrsesion=rsUs[0];  
        console.log('this.arrsesion - ' , this.arrsesion);  
        this.arrsesion.map((t1:any) =>{t1.idEmpresa=Number(this.datSess[1]);  t1.idRoles=this.idRol; });
        this.getDatos(this.datSess[1],this.arrsesion[0].idEstructura,this.datSess[0]).subscribe((resp:any) => {
          this.MonedaL= resp[0];        
          this.CentroCosto=resp[1];
          this.Empresas=resp[2];
          this.Proyectos=resp[3];
          this.NomBancos=resp[4];
          this.Cuentas=resp[5];
          this.formaPagos=resp[6];
          this.NomBancos=this.NomBancos.filter((dato:any) => this.Cuentas.some((o2:any) => o2.idBanco === dato.id));
          this.NomBancosOrig=this.NomBancos;
          this.CuentasOrig=this.Cuentas;
          this.servicios.getUnParametro('catalogos','?catalogo=workflows&filtro1='+encodeURIComponent('idEmpresa='+this.datSess[1]))
            .pipe().subscribe((res:any) => {
              this.workInicial=res;
              this.workInicial.map((t1: any) =>{t1.evento=JSON.parse(t1.evento)});
              this.workFGral=this.workInicial;
              this.InicioD();                 
          });
        }); 
      });
 
   }
   /**
   * @function
   * @name InicioD
   * Metodo principal que inicia el consumo del servicio
   * @param {string} layoutbancario 
   * @returns {Array.<string>} Regresa el servicio catalogos consultado correspondiente al idUser
   */
   InicioD(){
     this.servicios.getUnParametro('layoutbancario',this.id)
     .pipe( catchError(err => { this.tesoreriaList = new MatTableDataSource(); return throwError(err); })
     ).subscribe(
       (res:any) => {

         this.servicios.getUnParametro('catalogos',`?catalogo=vwListaPagos&filtro1=idLayoutBancarioEnvio%3D${this.id}`)//
         .pipe( catchError(err => {this.pagoList = new MatTableDataSource(); return throwError(err); }) ).subscribe(
           (lst:any) => {
             let suma:number=0
             console.log(lst);
 
             this.Historia();
             this.detalleLayout= [res].map(
               (t1:any) => ({
                   ...t1, ...this.arrsesion.find((t2: { idUser: any; }) => t2.idUser === t1.idUser)
                 })
               );
             console.log('Layout',this.detalleLayout);
             this.detalleLayout= this.detalleLayout[0]
             this.detalleLayout.rutaLayout=null;
             this.detalleLayout.Empresa=lst[0].descEmpresa;
             this.detalleLayout.fechaRegistroTrans=moment(new Date(lst[0].fechaRegistroTrans)).format("MM/DD/YYYY"); 
             this.detalleLayout.NoRegistros=lst.length;            
             lst.map((t1:any) =>{ 
                 t1.FormaPago= !t1.idFormasPago?'':this.formaPagos.filter((fpg:any) => fpg.id == t1.idFormasPago)[0].descripcion;
                 t1.NomMonedaTrans=this.MonedaL.filter((mon:any) => mon.id == Number(t1.idMonedaTrans))[0].clave;
                 suma=Number(suma) + Number(t1.montoTransaccion);
             });
             this.detalleLayout.monto=suma;
 
             console.log('Lista Pago',lst);
             this.pagoList = new MatTableDataSource(lst);
             this.pagoList.paginator = this.paginator!;
             this.pagoList.sort = this.sort;
             const sortState: Sort = {active: 'createdAt', direction: 'desc'};
             this.sort.active = sortState.active;
             this.sort.direction = sortState.direction;
             this.sort.sortChange.emit(sortState);
 
         },
         (err:any) => {  });  
       },
     (err:any) => {  });  
     
   }

   /**
    * @function
    * @name abrePago 
    * Metodo que abre el componente de pagos, manda su origen
    */
  abrePago(evento: any, arr: any) {
    window.sessionStorage.setItem("_origen", 'lyout');
    window.sessionStorage.setItem("tesoreria", JSON.stringify([arr]));
  }
 
  ngOnInit(): void {  }
  /**
   * @function
   * @name Historia 
   * Metodo  que consulta el servicio, para obtener el hisorial
   * @param {string} gastos 
   * @returns Regresa el arreglo Historial para gastos consultando el servicio correspondiente
   */
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
   /**
   * @function
   * @name guardarGastosZ  
   * Metodo que guarda los inputs en el arreglo guardar, para subirlos a la base
   * @returns {Array.<string>} guardar Regresa un Array con valores
   */
   guardarGastosZ() {
     this.dialogService.openConfirmDialog('Esta seguro que desea guardar los cambios del gasto?')
       .afterClosed().subscribe(res =>{
         console.log(res);
         if(res){
           let guardar={
             TipoLayout: this.detalleLayout.TipoLayout,
             idEmpresa: this.detalleLayout.idEmpresa,
             BKL_ID: this.detalleLayout.BKL_ID,
             BancoEmisor: this.detalleLayout.BancoEmisor,
             idCuenta: this.detalleLayout.idCuenta,
             fechaIni: this.detalleLayout.fechaIni,
             monto: this.detalleLayout.monto,
             Moneda: this.detalleLayout.Moneda,
             NoRegistros: this.detalleLayout.NoRegistros,
           }          
           console.log(guardar);
         } 
     });
   }
   /**
   * @function
   * @name cerrarGastosZ  
   * Metodo que reedirecciona a la pagina anterior
   * @returns {boolean} Regresa un true o un false
   */
   cerrarGastosZ() {    
     this.dialogService.openConfirmDialog('¿Esta seguro desea salir del detalle del Layout?')
       .afterClosed().subscribe(res =>{
         if(res){
           this.router.navigate(['/pagoscolaborador/ListaArchivo']);
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
  /**
   * @function
   * @name cargaArchivoPDF  
   * Metodo para cargar un archivo PDF 
   * @returns {Array.<string>} Regresa un arreglo que es posteado a un servicio
   */
   cargaArchivoPDF(event: any) {
     this.archivoPdf = [];
     if (event.target.files.length > 0) {      
       this.archivoPdf = event.target.files[0];
       const formData = new FormData();
       formData.append('file',this.archivoPdf); 
       this.FileUrlPDF = URL.createObjectURL(this.archivoPdf);
       this.detalleLayout.comprobante='archivo.pdf';    
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
  /**
   * @function
   * @name pdf  
   * Metodo que descarga un archivo PDF  
   * @returns Regresa un archivo PDF
   */
   pdf(){
     FileSaver.saveAs(this.descargaPDF, this.detalleLayout.comprobante + '_' + new  Date().getTime() + '.pdf');    
   }
 /**
   * @function
   * @name delPdf  
   * Metodo que elimina el archivo PDF anteriormente guardado
   * @returns {Array.<string>} Regresa un Array con valores null
   */
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
 /**
   * @function
   * @name incrementZoom  
   * Metodo que incrementa el zoom al PDF anteriormente guardado
   * @returns {number} amount
   */
   incrementZoom(amount: number) {
     this.zoom_to += amount;   
   }

   public getDatos (idempresa:any, idCC:any, usuario:any) : Observable<any>  {
    let monedas=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=monedas`, { headers: headers });
    let centrosCostos=this.http.get<any>(API+'catalogos/?catalogo=vwCentrosCostos&filtro1='+encodeURIComponent('idEstructura='+idCC+' and idEmpresas='+idempresa), { headers: headers });
    let empresas=this.http.get<any>(APIAdmin+'catalogo/?catalogo=empresas&filtro1='+encodeURIComponent('id='+idempresa), { headers: headers });
    let proyectos=this.http.get<any>(API+'catalogos/?catalogo=vwProyectos&filtro1='+encodeURIComponent('nivelEstructura='+idCC+' and idEmpresas='+idempresa), { headers: headers });
    let bancos=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=bancos`, { headers: headers });
    let cuentas=this.http.get<any>(API+'catalogos/?catalogo=vwDatosBancariosEmpresas&filtro1='+encodeURIComponent('idEmpresas='+idempresa+' and descripcionTipoCuenta="Pago"'), { headers: headers });
    let formasPagos=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=formasPago`, { headers: headers }); 
    return forkJoin([monedas,centrosCostos,empresas,proyectos,bancos,cuentas,formasPagos]);  
  }  

  public getUsuario (id:any,idempresa:any) : Observable<any>  {        
    let usuario=this.http.get<any>(API+'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1='+encodeURIComponent('idOcupantePuesto='+id+' and idEmpresas='+idempresa ), { headers: headers });
    return forkJoin([usuario]);         
  }
 
 }
 