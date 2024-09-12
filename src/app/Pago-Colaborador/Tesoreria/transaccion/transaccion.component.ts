/** Modulo Angular que muestra un listado de Tesoreria 
 * @module 1. transaccion Tesoreria
 * transaccion.component.ts  
 */
 import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
 import { ActivatedRoute, Router } from '@angular/router';
 import { ServiceinvoiceService } from '../tesoreria.service';
 import { FormControl, NgForm, FormGroupDirective } from '@angular/forms';
 import {MatDialog} from '@angular/material/dialog';
 import { WorkFlowService} from '../../../Genericos/servicios.service'
 import { DateAdapter, ErrorStateMatcher, MatOption, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
 import { DialogService } from '../../acciones/dialog.service';
 import { DatePipe } from '@angular/common';
 import * as _moment from 'moment';
 import { MatTable, MatTableDataSource } from '@angular/material/table';
 import { MatSort } from '@angular/material/sort';
 import { MatPaginator } from '@angular/material/paginator';
 import { catchError } from 'rxjs/operators';
 import { forkJoin, Observable, throwError } from 'rxjs';
 import { serviciosService } from "../../../Genericos/servicios/servicios.service";
 import { environment } from '../../../../environments/environment';
 import { MensajesService } from "../../../Genericos/mensajes/mensajes.service";
 import { PdfViewerComponent} from 'ng2-pdf-viewer';
 import { HttpClient, HttpHeaders } from '@angular/common/http';
 import { TokenService } from '../../../auth/token/token.service';
 import { MY_FORMATS } from '../../../Genericos/utilidades/funciones';
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
   * componente Principal para listar, mediante el consumo de servicios
   */
 @Component({
   //selector: 'app-transaccion',
   templateUrl: './transaccion.component.html',
   styleUrls: ['./transaccion.component.scss'],
   providers: [{provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},{provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}]
 })
  /** El nombre del modulo TransaccionComponent. */
 
 export class TransaccionComponent implements OnInit {
   id: any;
   cerrado:boolean=false;
   Transaccion: any=[];
   workInicial: any;
   workOrigen!:string;
   arrsesion: any;
   arrUsuario:any;
   usuarioColab:any;
   MonedaL:any;
   CentroCosto:any;
   NomBancos:any;
   Bancos:any;
   Cuenta:any;
   NomBancosOrig: any;
   BancosRecp:any;
   Cuentas: any;
   CuentasOrig: any;
   Empresas:any;
   Proyectos:any;
   formaPagos:any;
   btnGda: string='1';
   bloqueo:boolean=true;
   bloqueoCuenta:boolean=true;
   bloqueoBanco:boolean=true;
   bloqueoWf:string='0';
   bloqueoMoneda:boolean=true;
   bloqueoMonto:boolean=true;
   bloqueofPago:boolean=false;
   Historial:any;
   idWorkflow:any;
   workFGral:any;
   siLayout:boolean=false;  
   fechaHoy: Date=new Date(Date.now());
   comprobanteGlob:any;
 
   siPDF:boolean=true;
   archivoPdf!:any;
   FileUrlPDF:any;
   descargaPDF:any;
   zoom_to:any=0.8;
   _origen!:string;
   idRol:any;
   datSess:any; 
  
   histColumns: string[] = ['fechaRegistro', 'idUser', 'evento', 'estatus', 'comentarios'];
   @ViewChild(MatSort) sort: MatSort = Object.create(null);
   @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
   @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
   @ViewChild('inputXml') inputXml!: ElementRef;
   @ViewChild('inputPdf') inputPdf!: ElementRef;
   
    /**
       * Consulta catálogos y servicios, asi cómo inicializa el método principal que carga la información
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
       if(this.id==0){   
          this.siPDF=false      
         this.Transaccion=window.sessionStorage.getItem("tesoreria")?JSON.parse(window.sessionStorage.getItem("tesoreria")!):this.router.navigate(['/pagoscolaborador/tesoreria']);
         //window.sessionStorage.setItem("tesoreria",'');
         console.log(this.Transaccion);         
         this.getUsuario(this.datSess[0],this.datSess[1]).subscribe(rsUs => {
          this.arrsesion=rsUs[0];  
          console.log('this.arrsesion - ' , this.arrsesion, this.Transaccion.idEmpresa);  
          this.arrsesion.map((t1:any) =>{t1.idEmpresa=Number(this.datSess[1]);  t1.idRoles=this.idRol; });
          this.getDatos(this.datSess[1],this.arrsesion[0].idEstructura,this.Transaccion[0].idUser,this.Transaccion[0].idEmpresa).subscribe(resp => {//this.datSess[0]
            this.MonedaL= resp[0];        
            this.CentroCosto=resp[1];
            this.Empresas=resp[2];
            this.Proyectos=resp[3];
            this.NomBancos=resp[4];
            this.Cuentas=resp[5];
            this.formaPagos=resp[6];
            this.usuarioColab=resp[7];
            this.NomBancos=this.NomBancos.filter((dato:any) => this.Cuentas.some((o2:any) => o2.idBanco === dato.id));
            this.NomBancosOrig=this.NomBancos;
            this.CuentasOrig=this.Cuentas;
            this.BancosRecp=resp[4];
            this.servicios.getUnParametro('catalogos','?catalogo=workflows&filtro1='+encodeURIComponent('idEmpresa='+this.datSess[1]))
              .pipe().subscribe((res:any) => {
                this.workInicial=res;
                this.workInicial.map((t1: any) =>{t1.evento=JSON.parse(t1.evento)});
                this.workFGral=this.workInicial;
                this.InicioD(this.id,[]);                 
            });
          }); 
        });
       } else {
         this.servicios.getUnParametro('catalogos','?catalogo=vwListaPagos&filtro1='+encodeURIComponent('idTrans='+this.id))
         .pipe(  catchError(err => {  return throwError(err); }) )
         .subscribe(
           (pago:any) => {
             console.log('pag',pago);
             this.Transaccion=pago[0];
             this.getUsuario(this.datSess[0],this.datSess[1]).subscribe(rsUs => {
              this.arrsesion=rsUs[0];    
              this.arrsesion.map((t1:any) =>{t1.idEmpresa=Number(this.datSess[1]);  t1.idRoles=this.idRol; t1.idUser=this.datSess[0];});
              console.log('this.arrsesion',this.arrsesion);
              this.getDatos(this.datSess[1],this.arrsesion[0].idEstructura,this.Transaccion.idUser,this.Transaccion.idEmpresa).subscribe(resp => {
                this.MonedaL= resp[0];        
                this.CentroCosto=resp[1];
                this.Empresas=resp[2];
                this.Proyectos=resp[3];
                this.NomBancos=resp[4];
                this.Cuentas=resp[5];
                this.formaPagos=resp[6];
                this.usuarioColab=resp[7];
                this.BancosRecp=resp[4];
                this.NomBancos=this.NomBancos.filter((dato:any) => this.Cuentas.some((o2:any) => o2.idBanco === dato.id));
                this.NomBancosOrig=this.NomBancos;
                this.CuentasOrig=this.Cuentas;
                //console.log('this.usuarioColab',this.usuarioColab)
                this.servicios.getUnParametro('catalogos','?catalogo=workflows&filtro1='+encodeURIComponent('idEmpresa='+this.datSess[1]))
                  .pipe().subscribe((res:any) => {
                    this.workInicial=res;
                    this.workInicial.map((t1: any) =>{t1.evento=JSON.parse(t1.evento)});
                    this.workFGral=this.workInicial;
                    this.InicioD(this.id,pago);                 
                });
                console.log('this.Cuentas',this.Cuentas);
              }); 
            });
          },
          (err:any) => {  });  
       }
       //window.sessionStorage.setItem("tesoreria",'');
     }
     ngOnInit() { }
  /**
   * @function
   * @name InicioD
   * Metodo principal que inicia el consumo del servicio
   * @returns {Array.<string>} Regresa el servicio catalogos consultado correspondiente al idUser
   */
   InicioD(id:any,pag:any){
     if(id==0){
       this.Historia();
       this.bloqueoMoneda=this.Transaccion[0].moneda=='MXN'?true:false;
       this.Transaccion[0].idBancoReceptor= this.arrsesion[0].idBancoReceptor;
       this.Transaccion[0].idMoneda=0;
       this.Transaccion[0].idLayoutBancarioEnvio=0;      
       this.Transaccion[0].estatus='Nuevo';
       this.Transaccion[0].idPago=this.Transaccion[0].id;
       this.Transaccion[0].CuentaReceptor= this.arrsesion[0].CuentaReceptor;
       this.Transaccion[0].FechaAprobacion=this.Transaccion[0].actualizada;// moment(new Date(this.Transaccion[0].actualizada)).format("DD/MM/YYYY");
       this.Transaccion[0].creada = moment(Date.now()).format('DD/MM/YYYY');     
       this.Transaccion[0].idCentroCostos=this.Transaccion[0].idCentrosCostos;
       this.Transaccion[0].NombreCompleto=this.Transaccion[0].nombre; 
       this.Transaccion[0].montoPendientes=this.numerico(this.Transaccion[0].montoPendiente,this.Transaccion[0].claveMoneda); 
       this.Transaccion[0].montos=0;    
       this.Transaccion[0].idBancoReceptor=this.Transaccion[0].idBanco;      
       //this.Transaccion[0].BancoEmisor=this.Cuentas[0].idBanco;  
       //this.Transaccion[0].cuentaEmisor=this.Cuentas[0].cuenta;  
       //this.Transaccion[0].idCuentaEmisor=this.Cuentas[0].cuenta;  
       this.Transaccion[0].idMoneda=1;
       this.Transaccion= this.Transaccion[0];
       this.Cuenta=this.Cuentas.filter((cuen:any)=>{ cuen.idBanco==this.Transaccion.BancoEmisor; });
       this.Bancos=this.NomBancos;
       this.Transaccion.rutaComprobante=null;
       this.bloqueoCuenta=false;
       this.bloqueoMonto=false;
       this.bloqueoBanco=false;
       console.log(this.Cuentas[0].cuenta,'  ** ',this.Cuentas,'  - CTA   -',this.NomBancos,' - TSO - ',this.Transaccion); 
       //.filter((ban:any)=>{  ban.idMoneda==this.Transaccion.idMoneda; });       
       //this.Transaccion.cuenta=this.Transaccion[0].clabe; 
       this.siPDF=false  
       this.bloqueos();
     } else {
        let tipoUnaoLay=pag[0].idLayoutBancarioEnvio==null?'Generar Layout':'';
        console.log(tipoUnaoLay);
        this.Bancos=this.NomBancos;
        this.Cuenta=this.Cuentas;
        this.Historia();
        console.log('REP',pag);
        this.siLayout=pag[0].idLayoutBancarioEnvio==null?false:true;
        console.log(this.siLayout);
        this.Transaccion.idLayoutBancarioEnvio=pag[0].idLayoutBancarioEnvio;
        this.Transaccion.fechaAplicacion=pag[0].fechaAplicacionTrans;
        this.Transaccion.fechaAplicacion=moment(new Date(pag[0].fechaAplicacionTrans)).format("YYYY-MM-DD"); 
        this.Transaccion.creada=moment(new Date(pag[0].creada)).format("DD/MM/YYYY");
        this.Transaccion.FechaConciliacion=moment(new Date(pag[0].fechaRegistroTrans)).format("DD/MM/YYYY");
        this.Transaccion.ReferenciaPago=pag[0].referencia;
        this.Transaccion.Folio=pag[0].idFormasPago;
        this.Transaccion.ClaveRastreo=pag[0].claveRastreo;
        this.Transaccion.rutaComprobante=pag[0].rutaComprobante;
        this.Transaccion.TipoCambio=pag[0].tipoCambioTrans;
        this.Transaccion.idFormaPago=pag[0].idFormasPago;
        this.Transaccion.MontoPago=pag[0].montoTransaccion;
        this.Transaccion.estatus=!pag[0].estatusTrans || pag[0].estatusTrans==" "?'Nuevo':pag[0].estatusTrans;
        this.Transaccion.estatusTrans=this.Transaccion.estatus;
        this.Transaccion.idCuenta=pag[0].cuentaEmisor;
        this.Transaccion.BancoEmisor=pag[0].idBancoEmisor;
        this.Transaccion.idMoneda=Number(this.Transaccion.idMonedaTrans);
        this.Transaccion.idCentroCostos=pag[0].idCentrosCostos;
        this.Transaccion.NombreCompleto=pag[0].nombre;
        this.Transaccion.idBanco=pag[0].idBancoReceptor;
        this.Transaccion.clabe=pag[0].cuentaReceptor;
        this.Transaccion.cuenta=pag[0].idCuenta;        
        this.Transaccion.montoPendientes=this.numerico(pag[0].montoPendiente,pag[0].moneda); 
        this.Transaccion.montos=this.numerico(pag[0].monto,pag[0].moneda);
        //this.Transaccion.FechaAprobacion=moment(new Date(pag[0].createdAt)).add(2, 'days').format("YYYY-MM-DD"); 
        this.Transaccion.FechaAprobacion=new Date(pag[0].creada);
        this.Transaccion.FechaAprobacionN=moment(new Date(pag[0].creada)).format("DD/MM/YYYY");
        console.log(this.Transaccion); 
        this.bloqueoCuenta=false;
        this.bloqueoMonto=false;
        this.bloqueoBanco=false;
        this.workOrigen=this.Transaccion.estatus;  
        if(this.Transaccion.estatusTrans!=="Pagado"){
          this.bloqueoWf='1';
          console.log(this.workInicial);
          this.idWorkflow=this.workInicial.filter((dato:any) => dato.nombreObjeto=="Pagos de Anticipos y reembolsos"  &&  dato.evento.some((o2:any) => o2.siguienteEstatus === this.Transaccion.estatus));//&& this.arrsesion[0].nombreRol==dato.nombreRol
          console.log(this.idWorkflow)
          this.idWorkflow= this.idWorkflow[0].id;        //   
          this.workInicial = this.workInicial.filter((dato:any) => dato.estatusActual == this.Transaccion.estatusTrans && dato.nombreObjeto== "Pagos de Anticipos y reembolsos");
          this.workInicial = this.workInicial[0]?this.workInicial[0].evento.filter((dato:any) => dato.opcion != tipoUnaoLay ):this.workInicial;  
        } else {
          this.workInicial=[];
          this.bloqueoWf='0';
        }    
        if(this.Transaccion.rutaComprobante!=null){
          //this.siPDF=true;   
          this.servicios.getFile2('pagos/download', this.Transaccion.idTrans)
            .pipe(catchError(err => {  console.log(err);  return throwError(err);})
            ).subscribe((pdf: Blob) => {
              this.FileUrlPDF = URL.createObjectURL(pdf);
              this.descargaPDF=pdf;  
              this.bloqueos();    
            },
              (err:any) => { }, () => { }
            ); 
        }
        this.bloqueos();
        console.log(' - Trans - ',this.Transaccion);   
                
     }    
   }
  /**
   * @function
   * @name Historia 
   * Metodo  que consulta el servicio, para obtener el hisorial
   * @param {string} devoluciones 
   * @returns Regresa el arreglo Historial para devoluciones consultando el servicio correspondiente
   */
   Historia() {
     if(this.id!=0){
      this.servicios.getUnParametro('pagos',`${this.id}/historial` )      
        .pipe( catchError(err => {return throwError(err);  })
        ) .subscribe((hist:any) => {  
          hist.map((h:any)=>{ h.fechaRegistro=moment(h.fechaRegistro).format('YYYY-MM-DD HH:mm:ss') })
          hist.length>0?this.Historial = new MatTableDataSource(hist):this.Historial = new MatTableDataSource();
          console.log('historial', this.Historial)
          this.Historial.paginator = this.paginator;
          this.Historial.sort = this.sort;
        },() => {}        
      ); 
     }
   }
  /**
   * @function
   * @name cambiaEmp 
   * Metodo que habilita por cambio de Empresa 
   */
   cambiaEmp(evento:any, arr:any){
     let bancoSel=(evento.source.selected as MatOption).viewValue; 
     this.Cuenta=[];
     this.Cuenta=this.CuentasOrig.filter((o2:any) => o2.siglasBanco === bancoSel) ;
     this.bloqueoCuenta=false; 
   }
  /**
   * @function
   * @name cambiaFormaPago 
   * Metodo que habilita por cambio de Forma de Pago 
   */
   cambiaFormaPago(evento:any, arr:any){
    console.log(evento.value)
    //bloqueofPago
     this.bloqueofPago=evento.value == 1 ? true : false;
     this.Transaccion.idFormaPago=evento.value; 
   }
  /**
   * @function
   * @name cambiaFchaAplicaPago 
   * Metodo que habilita por cambio de Fecha de Aplicación de Pago 
   */
   cambiaFchaAplicaPago(evento:any, arr:any){
    let valor: any;
    valor=evento.value?evento.value:evento.target.value;    
    this.Transaccion.fechaAplicacion=valor; 
   }
  /**
   * @function
   * @name cambiaMoneda 
   * Metodo que habilita por cambio de Moneda 
   */
   cambiaMoneda(evento:any, arr:any){    
     //console.log((evento.source.selected as MatOption).viewValue); 
     //this.gastosNofiscal.idMoneda=evento.value;    
     let tipoMoneda= (evento.source.selected as MatOption).viewValue; 
     this.bloqueoMoneda=(evento.source.selected as MatOption).viewValue=='MXN'?true:false;
     this.Bancos=[];
     this.Bancos=this.NomBancosOrig.filter((dato:any) => this.Cuentas.some((o2:any) => o2.claveMoneda === tipoMoneda));
     this.Cuenta=this.CuentasOrig.filter((o2:any) => o2.claveMoneda === tipoMoneda)     
    this.bloqueoMonto=false;
    this.bloqueoBanco=false;   
   }
 /**
   * @function
   * @name bloqueos 
   * Metodo switchea banderas de habilitación de botones 
   */
   bloqueos(){
    
     if(this.Transaccion.estatus=='Pagado' || this.Transaccion.estatus=='Rechazado' || this.Transaccion.estatus=='Cancelado'){
       this.bloqueoMonto=true;
       this.bloqueoBanco=true;
       this.bloqueoCuenta=true; 
       this.bloqueoWf='0';
       this.cerrado=true; 
       this.siPDF=true;  
       this.btnGda='0';
       this.Transaccion.FechaConciliacion = this.Transaccion.fechaRegistroTrans;
       console.log('PAGADO')
     }
     if(this.Transaccion.estatus=='Nuevo' || this.Transaccion.estatus=='Enviado' ){   
       console.log(this.Transaccion.estatus,'  -+-  ',this.arrsesion[0].idOcupantePuesto +'  -  '+this.Transaccion.idUser+ '  -  '+this.bloqueoWf);    
       if(this.Transaccion.estatus=='Enviado'){
         // if(this.arrsesion[0].idOcupantePuesto==this.Transaccion.idUser){
            // this.bloqueoMonto=true;
            // this.bloqueoBanco=true;
            // this.bloqueoCuenta=true; 
            // this.bloqueoWf='0';
            // this.cerrado=true; 
            // this.siPDF=true;  
            // this.bloqueo=true;
            // this.btnGda='0';
         // } else{ }  
       }       
       //this.bloqueoWf=this.Transaccion.rutaComprobante=='' || this.Transaccion.rutaComprobante==null?'0':'1';        
     }
     if(this.id==0){this.siPDF=false;} 
     
     if(this.Transaccion.idLayoutBancarioEnvio){
      if(this.Transaccion.idLayoutBancarioEnvio>0){
        // this.bloqueoMonto=true;
        // this.bloqueoBanco=true;
        // this.bloqueoCuenta=true; 
        // this.bloqueoWf='0';
        // this.cerrado=true; 
        // this.siPDF=true;  
        // this.btnGda='0';
      }      
     }
   }

   numerico(valor: any, moneda:any) {  
     let tipo:any = moneda=='EUR'?'de-DE':moneda=='MXN'?'es-MX':moneda=='USD'?'en-US':moneda=='JPY'?'jp-JP':'es-MX'
     return new Intl.NumberFormat(tipo, {  style: 'currency',currency: moneda,}).format(valor); 
    }
   
  /**
   * @function
   * @name guardaTrans  
   * Metodo que guarda los inputs en el arreglo guardar, para subirlos a la base
   * @returns {Array.<string>} guardar Regresa un Array con valores
   */
   guardaTrans() {  
     let conTipoCambio=0;
     //if(this.Transaccion.idMoneda>0){}else{ this.mensajes.mensaje('Debe de ingresar un tipo de moneda.','','danger'); return false;};    
     if(this.Transaccion.BancoEmisor){}else{ this.mensajes.mensaje('Debe de ingresar un nombre de Banco emisor.','','danger'); return false;};
     if(this.Transaccion.idCuenta){}else{ this.mensajes.mensaje('Debe de ingresar una cuenta emisora.','','danger'); return false;};
     if(this.Transaccion.MontoPago>=0.10){}else{ this.mensajes.mensaje('Debe de ingresar un monto mayor a cero y menor al saldo pendiente.','','danger'); return false;};
     if(this.Transaccion.idFormaPago){}else{ this.mensajes.mensaje('Debe de seleccionar una forma de pago.','','danger'); return false;};
     if(this.Transaccion.fechaAplicacion){}else{ this.mensajes.mensaje('Debe de ingresar una fecha de aplicación de la transacción.','','danger'); return false;};
     //if(this.Transaccion.ReferenciaPago){}else{ this.mensajes.mensaje('Debe de ingresar una referencia de pago.','','danger'); return false;};
     if(this.Transaccion.idMoneda!=1){this.Transaccion.MontoPago=Number(this.Transaccion.MontoPago)*Number(this.Transaccion.TipoCambio);}else{ this.Transaccion.tipoCambio=1;};
     //if(this.Transaccion.Folio){}else{ this.mensajes.mensaje('Debe de ingresar un folio para la transacción.','','danger'); return false;};
     const options2 = { style: 'currency', currency: 'MXN' };
     const numberFormat2 = new Intl.NumberFormat('es-MX', options2);

     console.log(this.Transaccion,"   --     ",this.datePipes.transform( new Date(this.Transaccion.fechaAplicacion), 'yyyy-MM-dd')+' 00:00:00.000, " --', this.datePipes.transform( new Date(this.Transaccion.FechaAprobacion), 'yyyy-MM-dd')+' 00:00:00.000'," ---  ", this.Transaccion.FechaAprobacion );
 
     this.dialogService.openConfirmDialog(` ¿Esta seguro que desea guardar los cambios de la transacción de pago con monto total de ${numberFormat2.format(this.Transaccion.MontoPago)}?`)
       .afterClosed().subscribe(res =>{
         console.log(res);
         console.log(this.Transaccion,'   --     ',this.datePipes.transform( new Date(this.Transaccion.fechaAplicacion), 'yyyy-MM-dd'));
         let Workflow=this.workFGral;
         if(res){           
          let guardar={
            idLayoutBancarioEnvio: this.Transaccion.idLayoutBancarioEnvio,
            idBancoReceptor: this.Transaccion.idBanco,
            cuentaReceptor: this.Transaccion.clabe,
            idBancoEmisor: this.Transaccion.BancoEmisor,
            cuentaEmisor: String(this.Transaccion.cuentaEmisor),
            idPago: this.Transaccion.id,
            idMoneda: String(this.Transaccion.idMoneda),
            idTipoTransaccion: this.Transaccion.tipoTransaccion=='Anticipo'?2:1,
            idFormasPago: this.Transaccion.idFormaPago,
            folio: this.Transaccion.Folio?String(this.Transaccion.Folio):'',
            claveRastreo: this.Transaccion.ClaveRastreo?String(this.Transaccion.ClaveRastreo):'',
            referencia: this.Transaccion.ReferenciaPago?String(this.Transaccion.ReferenciaPago):'',
            montoTransaccion: Number(this.Transaccion.MontoPago),
            tipoCambio: this.Transaccion.tipoCambio,
            estatus: this.Transaccion.estatus==" "?'Nuevo':this.Transaccion.estatus,
            //fechaRegistro: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
            fechaAprobacion: this.datePipes.transform( new Date(this.Transaccion.FechaAprobacion), 'yyyy-MM-dd')+' 00:00:00', 
            fechaAplicacion: this.datePipes.transform( new Date(this.Transaccion.fechaAplicacion), 'yyyy-MM-dd')+' 00:00:00' 
            //Observaciones: this.Transaccion.Observaciones,       
          }       
           this.siLayout==false?delete guardar.idLayoutBancarioEnvio:false;       
           console.log(this.Transaccion.FechaAprobacion ,'lo que se guarda',guardar);        
           console.log(this.id); 
            
           this.idWorkflow=Workflow.filter((dato:any) => dato.nombreObjeto== "Pagos de Anticipos y reembolsos" && dato.evento.some((o2:any) => o2.siguienteEstatus === 'Nuevo'));
           console.log(this.idWorkflow[0].id);  
           
           if(Number(this.id)==0){            
             this.servicios.postDatos('pagos/?idWorkflow='+this.idWorkflow[0].id, guardar)
             .pipe(
               catchError(err => { return throwError(err); })
             ).subscribe(
               (res:any) => {
                 console.log(res);
                 this.mensajes.mensaje('Se guardo con exito la transacción de pago.','','success');
                 switch (window.sessionStorage.getItem("_origen")) {            
                   case 'LstPgo': break;
                   case 'conc': break;
                   case 'lyout': break;
                   default:
                     window.sessionStorage.setItem("_origen",'');
                     window.sessionStorage.setItem("tesoreria",'');
                     //this.router.navigate(['/pagoscolaborador/tesoreria']);
                     this.id=res.id;
                     this.Transaccion.idTrans=res.id;
                     this.siPDF=false;                     
                     this.Transaccion.estatus=='Nuevo'
                     this.idWorkflow=this.workInicial.filter((dato:any) => dato.nombreObjeto=="Pagos de Anticipos y reembolsos"  &&  dato.evento.some((o2:any) => o2.siguienteEstatus === this.Transaccion.estatus));//&& this.arrsesion[0].nombreRol==dato.nombreRol
                     this.idWorkflow= this.idWorkflow[0].id;        //   
                     this.workInicial = this.workInicial.filter((dato:any) => dato.estatusActual == this.Transaccion.estatus && dato.nombreObjeto== "Pagos de Anticipos y reembolsos");
                     this.workInicial = this.workInicial[0].evento.filter((dato:any) => dato.opcion != 'Generar Layout' );  
                     this.router.navigate(['/pagoscolaborador/tesoreria/transaccionTesoreria/'+res.id]);     
                     this.ngOnInit();                
                   break;
                 }
               },
               (err:any) => {  } );  
           }else{                     
             this.servicios.putDatosP('pagos',this.Transaccion.idTrans, guardar)
             .pipe(
               catchError(err => { return throwError(err); })
             ).subscribe(
               (res:any) => {
                 console.log(res);
                 this.mensajes.mensaje('Se guardo con exito la transacción de pago.','','success');
                 switch (window.sessionStorage.getItem("_origen")) {            
                    case 'LstPgo': break;
                    case 'conc': break;
                    case 'lyout': break;
                    default:
                      window.sessionStorage.setItem("_origen",'');
                      window.sessionStorage.setItem("tesoreria",'');
                      //this.router.navigate(['/pagoscolaborador/tesoreria']);
                      this.router.navigate(['/pagoscolaborador/tesoreria/transaccionTesoreria/'+Number(this.id)]);  
                    break;
                 }
               },
               (err:any) => {  } );  
           }
           //*/    
         } 
     });
   }
 
   Cambio(evento:any, arr:any){ 
     let valor:any, conTipoCambio=0;
     if(evento.value){
        valor=evento.value;
     } else{
       valor=evento.target.value;
     }    
     console.log(valor);
     console.log(this.Transaccion.idMoneda);    
     console.log(Number(this.Transaccion.montoPendiente), Number(this.Transaccion.MontoPago));    
     if(this.Transaccion.idMoneda!=1){
       if(this.Transaccion.TipoCambio==0){
         this.mensajes.mensaje('Debe de ingresar un tipo de cambio.','','danger');
       } else{
         conTipoCambio=Number(this.Transaccion.MontoPago)*Number(this.Transaccion.TipoCambio);
         if(conTipoCambio > Number(this.Transaccion.montoPendiente)){
           this.mensajes.mensaje('El monto a pagar NO puede ser mayor al Saldo Pendiente de Pago.','','danger');
           this.Transaccion.MontoPago=0;
         }         
       }   
     } else{
       if(Number(this.Transaccion.MontoPago) > Number(this.Transaccion.montoPendiente)){
         this.mensajes.mensaje('El monto a pagar NO puede ser mayor al Saldo Pendiente de Pago.','','danger');
         this.Transaccion.MontoPago=0;
       }  else{
        this.Transaccion.montos=this.Transaccion.MontoPago;  
       }
     }         
   }
  /**
   * @function
   * @name cerrarTransaccion  
   * Metodo que reedirecciona a paginas switcheadas dependiendo de su origen
   * @returns {boolean} Regresa un true o un false
   */
   cerrarTransaccion() {    
     this.dialogService.openConfirmDialog(' ¿Esta seguro desea salir de la trasancción '+ this.id+' ?')
       .afterClosed().subscribe(res =>{
         if(res){
           switch (window.sessionStorage.getItem("_origen")) {            
             case 'LstPgo':
               window.sessionStorage.setItem("_origen",'');
               window.sessionStorage.setItem("tesoreria",'');
               this.router.navigate(['/pagoscolaborador/ListaPagos']);              
               break;
               case 'conc':
                 window.sessionStorage.setItem("_origen",'');
                 window.sessionStorage.setItem("tesoreria",'');
                 this.router.navigate(['/pagoscolaborador/ListaConciliacion']);              
                 break;
              case 'lyout':
                  window.sessionStorage.setItem("_origen",'');
                  window.sessionStorage.setItem("tesoreria",'');
                  this.router.navigate(['pagoscolaborador/layoutpago/DetalleLayout/'+this.Transaccion.idLayoutBancarioEnvio]);              
                break;
             default:
               window.sessionStorage.setItem("_origen",'');
               window.sessionStorage.setItem("tesoreria",'');
               this.router.navigate(['/pagoscolaborador/tesoreria']);
             break;
           }
           
         } 
     });
   }

   regresaWorkflow(){
      this.Transaccion.estatus='Nuevo'
      this.idWorkflow=this.workFGral.filter((dato:any) => dato.nombreObjeto=="Pagos de Anticipos y reembolsos"  &&  dato.evento.some((o2:any) => o2.siguienteEstatus === this.Transaccion.estatus));//&& this.arrsesion[0].nombreRol==dato.nombreRol
      this.workInicial = this.workFGral.filter((dato:any) => dato.estatusActual == this.Transaccion.estatus && dato.nombreObjeto== "Pagos de Anticipos y reembolsos");
      this.workInicial = this.workInicial[0].evento.filter((dato:any) => dato.opcion != 'Generar Layout' ); 
      this.Transaccion.estatus=' '
   }
 
   cambiaWork(evento:any, arr:any){
     console.log(arr.montoTransaccion ,'>', arr.montoPendiente);
     console.log(this.Transaccion.estatus)
     if(this.Transaccion.idMoneda>0){}else{ this.Transaccion.estatus=' '; this.regresaWorkflow(); this.mensajes.mensaje('Debe de ingresar un tipo de moneda.','','danger'); return false;};    
     if(this.Transaccion.BancoEmisor){}else{ this.Transaccion.estatus=' '; this.regresaWorkflow(); this.mensajes.mensaje('Debe de ingresar un nombre de Banco emisor.','','danger'); return false;};
     if(this.Transaccion.idCuenta){}else{ this.Transaccion.estatus=' '; this.regresaWorkflow(); this.mensajes.mensaje('Debe de ingresar una cuenta emisora.','','danger'); return false;};
     if(this.Transaccion.MontoPago>=0.10){}else{ this.Transaccion.estatus=' '; this.regresaWorkflow(); this.mensajes.mensaje('Debe de ingresar un monto mayor a cero y menor al saldo pendiente.','','danger'); return false;};
     if(this.Transaccion.idFormaPago){}else{ this.Transaccion.estatus=' '; this.regresaWorkflow(); this.mensajes.mensaje('Debe de seleccionar una forma de pago.','','danger'); return false;};
     if(this.Transaccion.fechaAplicacion){}else{this.Transaccion.estatus=' '; this.regresaWorkflow();  this.mensajes.mensaje('Debe de ingresar una fecha de aplicación de la transacción.','','danger');  return false;};
     if(this.Transaccion.idFormaPago > 1 ){
      if(this.Transaccion.ReferenciaPago){}else{this.Transaccion.estatus=' '; this.regresaWorkflow(); this.mensajes.mensaje('Debe de ingresar una referencia de pago.','','danger'); return false;};      
     }
     if(this.Transaccion.idMoneda!=1){this.Transaccion.estatus=' '; this.regresaWorkflow(); this.Transaccion.MontoPago=Number(this.Transaccion.MontoPago)*Number(this.Transaccion.TipoCambio);}else{ this.Transaccion.tipoCambio=1;};
     if(this.Transaccion.rutaComprobante!=null){}else{this.Transaccion.estatus=' '; this.regresaWorkflow(); this.mensajes.mensaje('Debe de adjuntar un comprobante de pago.','','danger'); return false;};
     if(arr.montoTransaccion > arr.montoPendiente){this.Transaccion.estatus=' '; this.regresaWorkflow();   this.mensajes.mensaje('El monto de la transacción no puede ser mayor al pendiente.','','danger'); return false; }
     const options2 = { style: 'currency', currency: 'MXN' };
     const numberFormat2 = new Intl.NumberFormat('es-MX', options2);
     this.dialogService.openConfirmDialog(`¿Esta seguro que desea cambiar la transacción al estatus de ${(evento.source.selected as MatOption).viewValue} por un moto de ${numberFormat2.format(this.Transaccion.MontoPago)}?`)
       .afterClosed().subscribe(res =>{
        let Workflow=this.workFGral;
        let WorkflowAnt=this.workFGral;
        let guardar={
          idLayoutBancarioEnvio: this.Transaccion.idLayoutBancarioEnvio,
          idBancoReceptor: this.Transaccion.idBanco,
          cuentaReceptor: this.Transaccion.cuenta,
          idBancoEmisor: this.Transaccion.BancoEmisor,
          cuentaEmisor: String(this.Transaccion.idCuenta),
          idPago: this.Transaccion.id,
          idMoneda: String(this.Transaccion.idMoneda),
          idTipoTransaccion: this.Transaccion.tipoTransaccion=='Anticipo'?2:1,
          idFormasPago: this.Transaccion.idFormaPago,
          folio: this.Transaccion.Folio?String(this.Transaccion.Folio):'',
          claveRastreo: this.Transaccion.ClaveRastreo?String(this.Transaccion.ClaveRastreo):'',
          referencia: this.Transaccion.ReferenciaPago?String(this.Transaccion.ReferenciaPago):'',
          montoTransaccion: Number(this.Transaccion.MontoPago),
          tipoCambio: this.Transaccion.tipoCambio,
          estatus: this.Transaccion.estatus==" "?'Nuevo':this.Transaccion.estatus,
          fechaRegistro: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
          fechaAprobacion: this.datePipes.transform( new Date(this.Transaccion.FechaAprobacion), 'yyyy-MM-dd')+' 00:00:00', 
          fechaAplicacion: this.datePipes.transform( new Date(this.Transaccion.fechaAplicacion), 'yyyy-MM-dd')+' 00:00:00' 
          //Observaciones: this.Transaccion.Observaciones,       
        }   
         this.siLayout==false?delete guardar.idLayoutBancarioEnvio:false;       
         console.log(this.Transaccion.FechaAprobacion ,'lo que se guarda',guardar);        
         console.log(this.id); 
          
         this.idWorkflow=Workflow.filter((dato:any) => dato.nombreObjeto== "Pagos de Anticipos y reembolsos" && dato.evento.some((o2:any) => o2.siguienteEstatus === 'Nuevo'));
         console.log(this.idWorkflow[0].id);
         console.log(arr);
         console.log(evento.source.value, '  -  ', Workflow);          
         if(res){
          if(Number(this.id)==0){  
           //this.servicios.putDatosP('pagos',this.Transaccion.idTrans, guardar)
            this.servicios.postDatos('pagos/?idWorkflow='+this.idWorkflow[0].id, guardar)
              .pipe( catchError(err => { return throwError(err); })
              ).subscribe(
                (resp:any) => {  
                  console.log(resp.id,"  ****---RESP   -  ",resp)                  
                  this.id=resp.id;
                  this.Transaccion.idTrans=resp.id; 
                  this.http.post(`${API}pagos/upload/?pago_id=${this.Transaccion.idTrans}`, this.comprobanteGlob)
                    .subscribe((resUp:any) => {
                      console.log(resUp);            
                      this.Transaccion.rutaComprobante=resUp.rutaComprobante; 

                      switch (window.sessionStorage.getItem("_origen")) {            
                        case 'LstPgo': break;
                        case 'conc': break;
                        case 'lyout': break;
                        default:
                          window.sessionStorage.setItem("_origen",'');
                          window.sessionStorage.setItem("tesoreria",'');                                         
                                        
                        break;
                      }
    
                      let estatPagAnt:any;
                      if (evento.source.value=='Pagado'){             
                        if (guardar.montoTransaccion < arr.montoPendiente){
                          estatPagAnt='Pagado Parcial';
                        }
                        if (guardar.montoTransaccion >= arr.montoPendiente){
                          estatPagAnt='Pagado';
                        }
                      }
    
                      let envEstatus={estatus:evento.source.value}
                      this.idWorkflow=Workflow.filter((dato:any) => dato.nombreObjeto== "Pagos de Anticipos y reembolsos" && dato.evento.some((o2:any) => o2.siguienteEstatus === evento.source.value));
                      this.idWorkflow=this.siLayout==false?this.idWorkflow[0]:this.idWorkflow=this.idWorkflow[1];          
                      console.log(this.idWorkflow[0]);           
                      console.log(envEstatus);       
          
                      this.servicios.patchDatos(`pagos/${this.Transaccion.idTrans}?idWorkflow=${this.idWorkflow.id}`, envEstatus)
                        .pipe(catchError(err => {
                          console.log("ERROR"); 
                          this.router.navigate(['/pagoscolaborador/tesoreria/transaccionTesoreria/'+resp.id]);     
                          this.ngOnInit();  
                          return throwError(err);
                        })) .subscribe((res:any) => {
                            if(arr.tipoTransaccion == "Anticipo"){
                              envEstatus={estatus:estatPagAnt}
                              this.idWorkflow=WorkflowAnt.filter((dato:any) => dato.nombreObjeto== "Anticipo" && dato.evento.some((o2:any) => o2.siguienteEstatus === "Aprobado")); 
                              this.servicios.patchDatos(`anticipos/${arr.id}?idWorkflow=${this.idWorkflow[0].id}`, envEstatus)
                              .pipe(catchError(err => {console.log("ERROR"); return throwError(err);}))
                              .subscribe((res:any) => {      
                                console.log(res);
                                this.Transaccion.estatus=evento.source.value;
                                this.Transaccion.estatusTrans=evento.source.value;
                                console.log(this.arrsesion,' - ',this.usuarioColab );
                                // console.log(this.usuarioColab[0].email,
                                //  this.usuarioColab[0].nombre + ' ' + this.usuarioColab[0].apellidoPaterno + ' ' + this.usuarioColab[0].apellidoMaterno,
                                // 'Solicitud de corrección de ',
                                // 'Solicitud de Correcciones',
                                // 'Se le informa que <b>'+this.arrsesion[0].nombre + ' ' + this.arrsesion[0].apellidoPaterno + ' ' + this.arrsesion[0].apellidoMaterno+' </b>, requiere de su atención para la aprobación del <b>REEMBOLSO</b> con monto de ',
                                // '',
                                // this.Empresas[0].id);
                                this.enviaEmail(evento.source.value,
                                  this.arrsesion[0].nombre + ' ' + this.arrsesion[0].apellidoPaterno + ' ' + this.arrsesion[0].apellidoMaterno,
                                  this.usuarioColab[0].email, 
                                  this.usuarioColab[0].nombre + ' ' + this.usuarioColab[0].apellidoPaterno + ' ' + this.usuarioColab[0].apellidoMaterno,
                                  numberFormat2.format(Number(this.Transaccion.MontoPago)),
                                  this.Transaccion.tipoTransaccion,
                                  this.Transaccion.id,
                                  this.usuarioColab[0].idEmpresas);
                                this.router.navigate(['/pagoscolaborador/tesoreria/transaccionTesoreria/'+resp.id]);     
                                this.ngOnInit();                                
                              },(err:any) => {  });
                            } else {
                                console.log(res);
                                this.Transaccion.estatus=evento.source.value;
                                this.Transaccion.estatusTrans=evento.source.value;
                                this.enviaEmail(evento.source.value,
                                  this.arrsesion[0].nombre + ' ' + this.arrsesion[0].apellidoPaterno + ' ' + this.arrsesion[0].apellidoMaterno,
                                  this.usuarioColab[0].email, 
                                  this.usuarioColab[0].nombre + ' ' + this.usuarioColab[0].apellidoPaterno + ' ' + this.usuarioColab[0].apellidoMaterno,
                                  numberFormat2.format(Number(this.Transaccion.MontoPago)),
                                  this.Transaccion.tipoTransaccion,
                                  this.Transaccion.id,
                                  this.usuarioColab[0].idEmpresas);

                                this.router.navigate(['/pagoscolaborador/tesoreria/transaccionTesoreria/'+resp.id]);     
                                this.ngOnInit(); 
                            }
                          },(err:any) => {  });
                       
                    })   //*/       
              },(err:any) => {  } ); 

          }else{
            this.servicios.putDatosP('pagos',this.Transaccion.idTrans, guardar)
              .pipe( catchError(err => { return throwError(err); })
              ).subscribe(
                (resp:any) => {  
                  let estatPagAnt:any;
                  if (evento.source.value=='Pagado'){             
                    if (guardar.montoTransaccion < arr.montoPendiente){
                      estatPagAnt='Pagado Parcial';
                    }
                    if (guardar.montoTransaccion >= arr.montoPendiente){
                      estatPagAnt='Pagado';
                    }
                  }

                  let envEstatus={estatus:evento.source.value}
                  this.idWorkflow=Workflow.filter((dato:any) => dato.nombreObjeto== "Pagos de Anticipos y reembolsos" && dato.evento.some((o2:any) => o2.siguienteEstatus === evento.source.value));
                  this.idWorkflow=this.siLayout==false?this.idWorkflow[0]:this.idWorkflow=this.idWorkflow[1];          
                  console.log(this.idWorkflow[0]);           
                  console.log(envEstatus);       
      
                  this.servicios.patchDatos(`pagos/${this.Transaccion.idTrans}?idWorkflow=${this.idWorkflow.id}`, envEstatus)
                    .pipe(catchError(err => {console.log("ERROR"); return throwError(err);}))
                    .subscribe((res:any) => {
                        if(arr.tipoTransaccion == "Anticipo"){
                          envEstatus={estatus:estatPagAnt}
                          this.idWorkflow=WorkflowAnt.filter((dato:any) => dato.nombreObjeto== "Anticipo" && dato.evento.some((o2:any) => o2.siguienteEstatus === "Aprobado")); 
                          this.servicios.patchDatos(`anticipos/${arr.id}?idWorkflow=${this.idWorkflow[0].id}`, envEstatus)
                          .pipe(catchError(err => {console.log("ERROR"); return throwError(err);}))
                          .subscribe((res:any) => {      
                            console.log(res);
                            this.Transaccion.estatus=evento.source.value;
                            this.Transaccion.estatusTrans=evento.source.value;
                            console.log(this.arrsesion,' - ',this.usuarioColab );
                          
                            this.enviaEmail(evento.source.value,
                                    this.arrsesion[0].nombre + ' ' + this.arrsesion[0].apellidoPaterno + ' ' + this.arrsesion[0].apellidoMaterno,
                                    this.usuarioColab[0].email, 
                                    this.usuarioColab[0].nombre + ' ' + this.usuarioColab[0].apellidoPaterno + ' ' + this.usuarioColab[0].apellidoMaterno,
                                    numberFormat2.format(Number(this.Transaccion.MontoPago)),
                                    this.Transaccion.tipoTransaccion,
                                    this.Transaccion.id,
                                    this.usuarioColab[0].idEmpresas);

                            // this.servicios.sendEmailNotification(
                            //   this.usuarioColab[0].email,//'gerardo.mauriesr@gmail.com',
                            //   this.usuarioColab[0].nombre + ' ' + this.usuarioColab[0].apellidoPaterno + ' ' + this.usuarioColab[0].apellidoMaterno,
                            //   'Aviso de ' + evento.source.value,
                            //   'Aviso de ' + evento.source.value+' '+this.Transaccion.tipoTransaccion+' '+this.Transaccion.id,
                            //   'Se le informa que <b>'+this.arrsesion[0].nombre + ' ' + this.arrsesion[0].apellidoPaterno + ' ' + this.arrsesion[0].apellidoMaterno+' </b> cambio a estatus de '+evento.source.value+' la transacción <b>,'+this.Transaccion.tipoTransaccion+' con ID '+this.Transaccion.id+'</b> por un monto de '+numberFormat2.format(Number(this.Transaccion.MontoPago)),
                            //   '',
                            //   this.Empresas[0].id
                            // ).subscribe(results => { 
                            //   this.mensajes.mensaje('Se ha enviado su transacción se cambio a estatus de '+evento.source.value+' al correo '+this.usuarioColab[0].email, '', 'success');
                            //   this.bloqueos(); 
                            // });   
                            //this.mensajes.mensaje('Su transacción se cambio a estatus de '+evento.source.value+'.','','success');                                   
                          },(err:any) => {  });
                        } else{
                            console.log(res);
                            this.Transaccion.estatus=evento.source.value;
                            this.Transaccion.estatusTrans=evento.source.value;
                            this.enviaEmail(evento.source.value,
                              this.arrsesion[0].nombre + ' ' + this.arrsesion[0].apellidoPaterno + ' ' + this.arrsesion[0].apellidoMaterno,
                              this.usuarioColab[0].email, 
                              this.usuarioColab[0].nombre + ' ' + this.usuarioColab[0].apellidoPaterno + ' ' + this.usuarioColab[0].apellidoMaterno,
                              numberFormat2.format(Number(this.Transaccion.MontoPago)),
                              this.Transaccion.tipoTransaccion,
                              this.Transaccion.id,
                              this.usuarioColab[0].idEmpresas);

                            // this.servicios.sendEmailNotification(
                            //   this.usuarioColab[0].email,//'gerardo.mauriesr@gmail.com',
                            //   this.usuarioColab[0].nombre + ' ' + this.usuarioColab[0].apellidoPaterno + ' ' + this.usuarioColab[0].apellidoMaterno,
                            //   'Aviso de ' + evento.source.value,
                            //   'Aviso de ' + evento.source.value+' '+this.Transaccion.tipoTransaccion+' '+this.Transaccion.id,
                            //   'Se le informa que <b>'+this.arrsesion[0].nombre + ' ' + this.arrsesion[0].apellidoPaterno + ' ' + this.arrsesion[0].apellidoMaterno+' </b> cambio a estatus de '+evento.source.value+' la transacción <b>,'+this.Transaccion.tipoTransaccion+' con ID '+this.Transaccion.id+'</b> por un monto de '+numberFormat2.format(Number(this.Transaccion.MontoPago)),
                            //   '',
                            //   this.Empresas[0].id
                            // ).subscribe(results => { 
                            //   this.mensajes.mensaje('Se ha enviado su transacción se cambio a estatus de '+evento.source.value+' al correo '+this.usuarioColab[0].email, '', 'success');
                            //   this.bloqueos(); 
                            // }); 
                        }
                      },(err:any) => {  });
                      //*/             
              },(err:any) => {  } ); 

          }

           
                     
         } else{   
           this.Transaccion.estatus=this.workOrigen;     
           this.regresaWorkflow()    
         }
         
     });
   }

   worKOrig(){
     this.Transaccion.estatus=this.workOrigen;  
   }
 
   enviaEmail(tipo:any, nombreSolicita:any, correo:any, nombreDirigidoa:any, monto:any, transaccion:any, id:any, empresa:any){
    this.servicios.sendEmailNotification(
      correo,
      nombreDirigidoa,
      'Aviso de '+transaccion,
      'Aviso de '+transaccion,
      'Se le informa que <b>'+ nombreSolicita +' </b> cambio a estatus de '+tipo+' la transacción <b>,'+transaccion+' con ID '+id+'</b> por un monto de ' + monto,
      '',
      empresa
    ).subscribe(results => { 
      this.mensajes.mensaje('Se ha enviado su transacción se cambio a estatus de '+tipo+' al correo '+correo, '', 'success');
      this.bloqueos(); 
    });
   }

   enviar(){}

   /**
   * @function
   * @name cargaArchivoPDF  
   * Metodo para cargar un archivo PDF 
   * @returns {Array.<string>} Regresa un arreglo que es posteado a un servicio
   */
    cargaArchivoPDF1(event: any) {
      console.log(this.Transaccion)
      if (event.target.files.length > 0) {      
        this.archivoPdf = event.target.files[0];
        this.Transaccion.estatus='Nuevo'
        this.idWorkflow=this.workFGral.filter((dato:any) => dato.nombreObjeto=="Pagos de Anticipos y reembolsos"  &&  dato.evento.some((o2:any) => o2.siguienteEstatus === this.Transaccion.estatus));//&& this.arrsesion[0].nombreRol==dato.nombreRol
        this.idWorkflow= this.idWorkflow[0].id;        //   
        this.workInicial = this.workFGral.filter((dato:any) => dato.estatusActual == this.Transaccion.estatus && dato.nombreObjeto== "Pagos de Anticipos y reembolsos");
        this.workInicial = this.workInicial[0].evento.filter((dato:any) => dato.opcion != 'Generar Layout' );  
        const formData = new FormData();
        this.comprobanteGlob=formData.append('file',this.archivoPdf); 
        this.comprobanteGlob=formData;
        this.Transaccion.rutaComprobante=`${this.Transaccion.id}.pdf`;  
        this.FileUrlPDF = URL.createObjectURL(this.archivoPdf); 
        this.descargaPDF=this.archivoPdf; 
        this.bloqueoWf='1';
      }  
        // this.http.post(`${API}pagos/upload/?pago_id=${this.Transaccion.idTrans}`, formData)
        //   .subscribe((res:any) => {
        //     console.log(res);            
        //     this.Transaccion.rutaComprobante=res.rutaComprobante;  
        //     //this.siPDF=true;   
        //     this.bloqueoWf='1';
        //     this.FileUrlPDF = URL.createObjectURL(this.archivoPdf); 
        //     this.descargaPDF=this.archivoPdf;  
        //     this.bloqueos();  
        //   })
        // }   
    }
  /**
   * @function
   * @name cargaArchivoPDF  
   * Metodo para cargar un archivo PDF 
   * @returns {Array.<string>} Regresa un arreglo que es posteado a un servicio
   */
   cargaArchivoPDF(event: any) {

    if(this.id==0){
      this.mensajes.mensaje('Se debe guardar la transacción para poder adjuntar un comprobante.','','danger'); 
    } else { 
      this.archivoPdf = [];
      if (event.target.files.length > 0) {      
        this.archivoPdf = event.target.files[0];
        const formData = new FormData();
        formData.append('file',this.archivoPdf); 
        this.http.post(`${API}pagos/upload/?pago_id=${this.Transaccion.idTrans}`, formData)
          .subscribe((res:any) => {
            console.log(res);            
            this.Transaccion.rutaComprobante=res.rutaComprobante;  
            //this.siPDF=true;   
            this.bloqueoWf='1';
            this.FileUrlPDF = URL.createObjectURL(this.archivoPdf); 
            this.descargaPDF=this.archivoPdf;  
            this.bloqueos();  
          })
          //*/
      }
    }     
   }
  /**
   * @function
   * @name pdf  
   * Metodo que descarga un archivo PDF  
   * @returns Regresa un archivo PDF
   */
   pdf(){
    console.log(this.Transaccion)
     FileSaver.saveAs(this.descargaPDF, this.Transaccion.rutaComprobante + '_' + new  Date().getTime() + '.pdf');    
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
 
           this.servicios.deleteMultiple(`pagos/eliminadocumento/${this.devolucionArr.id}/ARCHIVO` )        
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

   public getDatos (idempresa:any, idCC:any, usuario:any, idEmpColab:any) : Observable<any>  {
    let monedas=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=monedas`, { headers: headers });
    let centrosCostos=this.http.get<any>(API+'catalogos/?catalogo=vwCentrosCostos&filtro1='+encodeURIComponent('idEstructura='+idCC+' and idEmpresas='+idempresa), { headers: headers });
    let empresas=this.http.get<any>(APIAdmin+'catalogo/?catalogo=empresas&filtro1='+encodeURIComponent('id='+idempresa), { headers: headers });
    let proyectos=this.http.get<any>(API+'catalogos/?catalogo=vwProyectos&filtro1='+encodeURIComponent('nivelEstructura='+idCC+' and idEmpresas='+idempresa), { headers: headers });
    let bancos=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=bancos`, { headers: headers });
    let cuentas=this.http.get<any>(API+'catalogos/?catalogo=vwDatosBancariosEmpresas&filtro1='+encodeURIComponent('idEmpresas='+idempresa+' and descripcionTipoCuenta="Pago"'), { headers: headers });
    let formasPagos=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=formasPago`, { headers: headers }); 
    let colaborador=this.http.get<any>(API+'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1='+encodeURIComponent('idOcupantePuesto='+usuario+' and idEmpresas='+idEmpColab ), { headers: headers });
     return forkJoin([monedas,centrosCostos,empresas,proyectos,bancos,cuentas,formasPagos,colaborador]);  
  }  

  public getUsuario (id:any,idempresa:any) : Observable<any>  {        
    let usuario=this.http.get<any>(API+'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1='+encodeURIComponent('idOcupantePuesto='+id+' and idEmpresas='+idempresa ), { headers: headers });
    return forkJoin([usuario]);         
  }
 
 }