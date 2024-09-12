/** Modulo Angular que muestra un listado con Gastos 
 * @module 1. EditaGastosZComponent
 * gastosz-edita.component.ts  
 */
 import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
 import { ActivatedRoute, Router } from '@angular/router';
 import { ProdServList } from '../gastosz';
 import { FormControl, NgForm, FormGroupDirective } from '@angular/forms';
 import { MatDialog} from '@angular/material/dialog';
 import { WorkFlowService} from '../../Genericos/servicios.service'
 import { ErrorStateMatcher, MatOption, MAT_DATE_FORMATS, MAT_DATE_LOCALE, DateAdapter } from '@angular/material/core';
 import {MomentDateAdapter} from '@angular/material-moment-adapter';
 import { DialogService } from '../acciones/dialog.service';
 import { DatePipe } from '@angular/common';
 import * as _moment from 'moment';
 import { MatTable, MatTableDataSource } from '@angular/material/table';
 import { MatSort } from '@angular/material/sort';
 import { MatPaginator } from '@angular/material/paginator';
 import { SelectionModel } from '@angular/cdk/collections';
 import { catchError, map } from 'rxjs/operators';
 import { forkJoin, Observable, throwError } from 'rxjs';
 import { serviciosService } from "../../Genericos/servicios/servicios.service";
 import { MensajesService } from "../../Genericos/mensajes/mensajes.service";
 import { MatCheckboxChange } from '@angular/material/checkbox';
 import { HttpClient, HttpHeaders } from '@angular/common/http';
 import { environment } from '../../../environments/environment';
 import { TokenService } from '../../auth/token/token.service';
 import { MY_FORMATS } from '../../Genericos/utilidades/funciones';
 const API = environment.ApiUrl;
 const APIAdmin= environment.ApiUrlAdmin;
 const headers = new HttpHeaders    
 headers.append('Content-type', 'applicartion.json') 
 declare var jQuery: any;
 import * as FileSaver from 'file-saver';
 import { PdfViewerComponent} from 'ng2-pdf-viewer';
 const moment = _moment;
 interface TipoComprobantes {
  id: number;
  tipo:string;
}
const tipocomprobantes: TipoComprobantes[] = [
  { 
      id:1,
      tipo:'Fiscal'
  },
  { 
      id:2,
      tipo:'No Fiscal'
  },
];
const options2 = { style: 'currency', currency: 'MXN' };
const numberFormat2 = new Intl.NumberFormat('es-MX', options2);
 
 
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
  * componente Principal para listar y editar los gastos 
  */
 @Component({
   //selector: 'app-edit-gastos',
   templateUrl: './gastosz-edita.component.html',
   styleUrls: ['./gastosz-edita.component.css'],
   providers: [{provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},{provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}]
 })
 /** El nombre del modulo EditaGastosZComponent */
 
 export class EditaGastosZComponent implements OnInit {
   id: any;
   ubica:any;
   step:any=0;
   gasto: any;
   gastos: any=[];
   dataAnticipo!:any;
   gastosFiscal: any;
   gastosNofiscal:any;
   gastoRel:any;
   noFiscalOrig:any;
   causaLista: any;
   workInicial: any;
   workOrigen!:string;
   workFGral: any;
   unionFecha:any=''
   subTotal = 0;
   vat = 0;
   grandTotal = 0;
   arrsesion: any;
   arrUslogin:any;
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
   siFiscal:boolean=true;
   siXml:boolean=false;
   siPDF:boolean=false;
   bloqTC:boolean=true;
   bloqTotTC:boolean=false;
   archivoXml!:any;
   archivoPdf!:any;
   archivoXmlName:string='';
   archivoPdfName:string='';
   nomOrigXml:string='';
   nomOrigPdf:string='';
   prodservTabla: MatTableDataSource<any>;
   cfdiRelTabla: MatTableDataSource<any>;
   importeTClbl:string='Importe Total';
   idRol:any;
   datSess:any;   
   tabNoFiscal:any=0;
   tipodeCambio:boolean=false;
   fechaHoy: Date=new Date(Date.now());
   selection = new SelectionModel<ProdServList>(true, []);
   histColumns: string[] = ['fechaRegistro', 'idUser', 'evento', 'estatus', 'comentarios'];
   displayedColumns: string[] = ['id','claveFiscal','cantidad','unidadMedida','descripcion','precioUnitario','cuentacontable','descuento','tasaIva','montoIva','tasaIeps','montoIeps','tasaRetencionIsr','montoRetencionIsr','tasaRetencionIva','montoRetencionIva','importeTotal'];
   columCFDIRel: string[] = ['uuid','idTipoCfdiRelacionado','uuidRelacionado'];
   @ViewChild('sort', { read: MatSort })   sort: MatSort = new MatSort;
   @ViewChild('sorth', { read: MatSort })   sorth: MatSort = new MatSort;
   @ViewChild('paginator', {read: MatPaginator}) paginator: MatPaginator | undefined;
   @ViewChild('paginatorh', {read: MatPaginator}) paginatorh: MatPaginator | undefined;
   @ViewChild(PdfViewerComponent) public pdfViewer: PdfViewerComponent []= [];
   @ViewChild('inputXml') inputXml!: ElementRef;
   @ViewChild('inputPdf') inputPdf!: ElementRef;
   /**
      * Consulta catálogos y servicios.
      */
   constructor(activatedRouter: ActivatedRoute, 
     public datePipes:DatePipe,
     private servicios: serviciosService,
     public workService:WorkFlowService,
     private router: Router, 
     public dialog:MatDialog,
     private mensajes: MensajesService,
     private dialogService: DialogService,
     private http: HttpClient,
     private token: TokenService) {
      this.datSess=token.readToken('id','');
      this.datSess=this.datSess.split(','); 
     this.id = activatedRouter.snapshot.paramMap.get('id');  
     this.ubica = activatedRouter.snapshot.paramMap.get('ubica'); 
     this.step = Number(this.ubica)==0?0:1; 
     this.idRol=token.readToken('rlsRol','GASTOS');
     this.gasto={estatus: null};  
     this.prodservTabla = new MatTableDataSource();
     this.cfdiRelTabla = new MatTableDataSource();
     this.gastosNofiscal= [];     

     this.getUsuario(this.datSess[0],this.datSess[1]).subscribe(rsUsLog => {
      this.arrUslogin=rsUsLog[0];    
      this.arrUslogin.map((t1:any) =>{t1.NombreCompleto= `${t1.nombre} ${t1.apellidoPaterno} ${t1.apellidoMaterno}`; t1.idUser=t1.idOcupantePuesto; t1.idEmpresa=Number(this.datSess[1]);  t1.idRoles=this.idRol; });
        this.servicios.getUnParametro('gastos',this.id )      
          .pipe( catchError(err => {return throwError(err);  })
          ) .subscribe((gasDato:any) => {   
            console.log(gasDato.idUser,' gasDato ', gasDato);     
            this.getUsuario(gasDato.idUser,this.datSess[1]).subscribe(rsUs => {
                this.arrsesion=rsUs[0];    
                this.arrsesion.map((t1:any) =>{t1.NombreCompleto= `${t1.nombre} ${t1.apellidoPaterno} ${t1.apellidoMaterno}`; t1.idUser=t1.idOcupantePuesto; t1.idEmpresa=Number(this.datSess[1]); t1.idRoles=this.idRol;});
                this.getDatos(this.datSess[1], this.arrsesion[0].idEstructura, this.arrsesion[0].nivelEstructura).subscribe(resp => {
                  this.MonedaL= resp[0];
                  this.TipoSol=resp[1];         
                  this.CentroCosto=resp[2];
                  this.Empresas=resp[3];
                  this.Proyectos=resp[4];
                  this.Tipogasto=resp[5];
                  this.formapago=resp[6];
                  this.TipoComprobante=tipocomprobantes;
                  this.servicios.getUnParametro('catalogos','?catalogo=workflows&filtro1='+encodeURIComponent('idEmpresa='+this.datSess[1]))
                    .pipe().subscribe((res:any) => {
                      this.workInicial=res;
                      this.workInicial.map((t1: any) =>{t1.evento=JSON.parse(t1.evento)});
                      this.workFGral=this.workInicial;
                      this.Inicio(gasDato);
                  }); 
                }); 
            }); 
          }); 
    });          
   }
 /**
 * @function
  * @name Inicio 
  * Metodo principal que inicia el consumo del servicio
  * @param {string} gastos 
  * @returns {Array.<string>} Regresa el servicio gastos consultado correspondiente al idUser
  */
   Inicio(res:any){        
      this.Historia();                                
      this.gasto = [res].map( (t1:any) => ({ ...t1, ...this.arrsesion.find((t2: { idUser: any; }) => t2.idUser === t1.idUser)  })  ); 
      this.gasto.map((t1: any) =>{ 
        t1.NombreCompleto=this.arrsesion[0].NombreCompleto;
        t1.fechaReg= moment(new Date(t1.createdAt)).format("MM/DD/YYYY");
        t1.idTipoComprobante=t1.idTipoComprobante==0?1:t1.idTipoComprobante;   
        if(t1.idTipoComprobante==1){t1.siFiscal=true; this.modFiscal=false; this.modNofiscal=true; this.tabNoFiscal=0; }  
        if(t1.idTipoComprobante==2){t1.siFiscal=false; this.modFiscal=true; this.modNofiscal=false; this.tabNoFiscal=1;}  
      });
      this.gasto=this.gasto[0]; 
      console.log('GGGGGG - ', this.gasto);
      this.workOrigen=this.gasto.estatus; 
      //this.gasto.siFiscal==true?this.modFiscal=false:this.modNofiscal=true;          
      this.idWorkflow=this.workInicial.filter((dato:any) => dato.nombreObjeto=="Gastos" &&  dato.evento.some((o2:any) => o2.siguienteEstatus === res.estatus));
      this.workInicial = this.workInicial.filter((dato:any) => dato.estatusActual == this.gasto.estatus && dato.nombreObjeto== "Gastos");
      if(this.idWorkflow.length >0){
        this.idWorkflow= this.idWorkflow[0].id;        
        this.workInicial = this.workInicial[0].evento; 
      } else{
        this.workInicial = []; 
        this.idWorkflow=99;
      }

      // this.gasto.idMoneda=="MXN"?true:this.gasto.idMoneda==null?true:this.gasto.tipoCambio==0 || this.gasto.tipoCambio==null?true:this.gasto.tipoCambio=this.gasto.tipoCambio;   
      // this.gasto.idMoneda=="MXN"?true:this.gasto.idMoneda==null?true:this.gasto.idMonedaTipoCambio=1;
      // this.gasto.idMoneda=="MXN"?true:this.gasto.idMoneda==null?true:this.gasto.tipoCambio=0;

      this.bloqTC=this.gasto.idMoneda=="MXN"?true:this.gasto.idMoneda==null?true:false;

      console.log(this.gasto); 

      if(this.gasto.rutaArchivo!=null){   
      let rupdf=this.gasto.rutaArchivo.split(`EX_${this.gasto.id}_`)
      this.nomOrigPdf = rupdf[1].split('.pdf')[0];
      this.archivoPdfName=this.gasto.rutaArchivo;
        this.siPDF=true;
        this.servicios.getFile('gastos/download', `${this.gasto.id}/ARCHIVO`)
          .pipe(catchError(err => { return throwError(err);})
          ).subscribe((pdf: Blob) => {
            this.FileUrlPDF = URL.createObjectURL(pdf);
            this.descargaPDF=pdf;                 
          },
            (err:any) => { }, () => { }
          ); 
      }

      if(this.gasto.idTipoGasto){
      let tipoElegido=this.Tipogasto.filter((d: any) => d.idTipoGastos == this.gasto.idTipoGasto)
      this.gastos.tipodegasto=tipoElegido[0]?tipoElegido[0].nombreGasto:''; 
      console.log('tipoElegid 1o',tipoElegido)  
      this.gastos.ctaContable=this.gastos.tipodegasto!=''?`${tipoElegido[0].cuentaContable} ${tipoElegido[0].descripcionCuenta}`:''; 
    }
      
      switch (this.gasto.idTipoComprobante) {
        case 1: //gastos/{gasto_id} 
        if(this.gasto.rutaXml!=null){
          let ruxml=this.gasto.rutaXml.split(`EX_${this.gasto.id}_XML_`)
          this.nomOrigXml = ruxml[1].split('.xml')[0];
          this.siXml=true;
          this.archivoXmlName=this.gasto.rutaXml;
          this.servicios.getFile2('gastos/download', `${this.gasto.id}/XML`)
              .pipe(catchError(err => { console.log(err);   return throwError(err);})
              ).subscribe((xml: Blob) => {
                this.FileUrlXML = URL.createObjectURL(xml);
                this.descargaXML=xml;                 
              }, (err:any) => { }, () => { }
          ); 
          console.log('gastos', `${this.gasto.id}/comprobante`)
            this.servicios.getUnParametro('gastos', `${this.gasto.id}/comprobante`)      
                .pipe( catchError(err => {return throwError(err);  })
                ) .subscribe((fiscal:any) => {  
                  console.log("Res fiscal",fiscal[0])
                   this.gastos=fiscal[0];
                  this.gastos.importeTotalOrig=this.gastos.importeTotal;
                  this.gastos.descuento=this.gastos.descuentoME ? numberFormat2.format(this.gastos.descuentoME * this.gastos.tipoCambio): this.gastos.descuento ? this.gastos.descuento ?  numberFormat2.format(this.gastos.descuento):0:0;  
                  this.gastos.descuentoMES=this.gastos.descuentoME? numberFormat2.format(this.gastos.descuentoME):0;
                  this.gastos.subtotal=this.gastos.subtotalME ? numberFormat2.format(this.gastos.subtotalME * this.gastos.tipoCambio): this.gastos.subtotal ? this.gastos.subtotal ?  numberFormat2.format(this.gastos.subtotal):0:0;  
                  this.gastos.subtotalMES=this.gastos.subtotalME? numberFormat2.format(this.gastos.subtotalME):0;

                  this.gastos.tasaIeps = this.gastos.tasaIeps ? String(this.gastos.tasaIeps * 100)+'%': '0%';
                  this.gastos.tasaRetencionIsr = this.gastos.tasaRetencionIsr ? String(this.gastos.tasaRetencionIsr * 100)+'%': '0%';
                  this.gastos.tasaRetencionIva = this.gastos.tasaRetencionIva ? String(this.gastos.tasaRetencionIva * 100)+'%': '0%';
                  this.gastos.tasaIva=this.gastos.tasaIva ? String(this.gastos.tasaIva * 100)+'%': '0%';

                  this.gastos.montoIeps=this.gastos.montoIeps?numberFormat2.format(this.gastos.montoIeps):0;
                  this.gastos.subtotalMES=this.gastos.subtotalME? numberFormat2.format(this.gastos.subtotalME):0;

                  this.gastos.montoIva= this.gastos.montoIvaME ? numberFormat2.format(this.gastos.montoIvaME * this.gastos.tipoCambio): this.gastos.montoIva ? this.gastos.montoIva?numberFormat2.format(this.gastos.montoIva):0:0;
                  this.gastos.montoIvaMES=this.gastos.montoIvaME? numberFormat2.format(this.gastos.montoIvaME):0;
                  
                  this.gastos.importe=this.gastos.importeME ? numberFormat2.format(this.gastos.importeME * this.gastos.tipoCambio): this.gastos.importe ? this.gastos.importe ?  numberFormat2.format(this.gastos.importe):0:0;  
                  this.gastos.importeMES=this.gastos.importeME? numberFormat2.format(this.gastos.importeME):0;
                  
                  this.gastos.montoIeps=this.gastos.montoIepsME ? numberFormat2.format(this.gastos.montoIepsME * this.gastos.tipoCambio): this.gastos.montoIeps ? this.gastos.montoIeps ?  numberFormat2.format(this.gastos.montoIeps):0:0;  
                  this.gastos.montoIepsMES=this.gastos.montoIepsME? numberFormat2.format(this.gastos.montoIepsME):0;

                  this.gastos.montoRetencionIsr=this.gastos.montoRetencionIsrME ? numberFormat2.format(this.gastos.montoRetencionIsrME * this.gastos.tipoCambio): this.gastos.montoRetencionIsr ? this.gastos.montoRetencionIsr ?  numberFormat2.format(this.gastos.montoRetencionIsr):0:0;
                  this.gastos.montoRetencionIsrMES=this.gastos.montoRetencionIsrME? numberFormat2.format(this.gastos.montoRetencionIsrME):0;
                  
                  this.gastos.montoRetencionIva=this.gastos.montoRetencionIvaME ? numberFormat2.format(this.gastos.montoRetencionIvaME * this.gastos.tipoCambio): this.gastos.montoRetencionIva ? this.gastos.montoRetencionIva ?  numberFormat2.format(this.gastos.montoRetencionIva):0:0;   
                  this.gastos.montoRetencionIvaMES=this.gastos.montoRetencionIvaME? numberFormat2.format(this.gastos.montoRetencionIvaME):0;

                  this.gastos.importeTotal=this.gastos.importeTotalME ? numberFormat2.format(this.gastos.importeTotalME * this.gastos.tipoCambio): this.gastos.importeTotal ? this.gastos.importeTotal?numberFormat2.format(this.gastos.importeTotal):0:0;
                  this.gastos.importeTotalMES=this.gastos.importeTotalME? numberFormat2.format(this.gastos.importeTotalME):0;                 
                  
                  if(this.gastos.uuidRelacionado){
                    this.gastoRel.push({uuid:this.gastos.uuid,uuidRelacionado:this.gastos.uuidRelacionado,idTipoCfdiRelacionado:fiscal.idTipoCfdiRelacionado});
                    this.cfdiRelTabla = new MatTableDataSource(this.gastoRel);
                    this.cfdiRelTabla.paginator = this.paginator!;
                  }else{
                    this.gastoRel=[];
                    this.cfdiRelTabla = new MatTableDataSource(this.gastoRel);
                  }     
                  if(this.gasto.idTipoGasto){
                    let tipoElegido=this.Tipogasto.filter((d: any) => d.idTipoGastos == this.gasto.idTipoGasto)
                    this.gastos.tipodegasto=tipoElegido[0]?tipoElegido[0].nombreGasto:''; 
                    console.log('tipoElegid 2o',tipoElegido)  
                    this.gastos.ctaContable=this.gastos.tipodegasto!=''?`${tipoElegido[0].cuentaContable} ${tipoElegido[0].descripcionCuenta}`:'';                     
                  }
                  this.gastos.fechaEmision= moment(new Date(this.gastos.fechaEmision)).format("DD/MM/YYYY");
                  this.gastos.fechaTimbrado= moment(new Date(this.gastos.fechaTimbrado)).format("DD/MM/YYYY");  
                  console.log(this.gastos.formaPago);
                  console.log("this.gastos",this.gastos)
                  this.gastos.formaPagos= this.gastos.formaPago+ '-' + this.formapago.filter((d: any) => d.clave == this.gastos.formaPago)[0].descripcion;
                  console.log(this.gastos.formaPago); 
                  this.servicios.getUnParametro('gastos', `${this.gasto.id}/comprobantedetalle`)      
                    .pipe( catchError(err => {return throwError(err);  })
                    ) .subscribe((detalle:any) => { 
                      console.log('detalleQQQQQ',detalle)                     
                      //this.prodservTabla=detalle.length>0?detalle:{};
                      detalle.map((d:any)=>{
                        //d.precioUnitario= d.precioUnitario ? d.precioUnitario * this.gastos.tipoCambio: d.precioUnitario ? d.precioUnitario?d.precioUnitario:0:0;
                        d.montoIva= d.montoIvaME ? d.montoIvaME * this.gastos.tipoCambio: d.montoIva ? d.montoIva?d.montoIva:0:0;                         
                        d.montoIeps=d.montoIepsME ? d.montoIepsME * this.gastos.tipoCambio: d.montoIeps ? d.montoIeps ?  d.montoIeps:0:0;  
                        d.montoRetencionIsr=d.montoRetencionIsrME ? d.montoRetencionIsrME * this.gastos.tipoCambio: d.montoRetencionIsr ? d.montoRetencionIsr ?  d.montoRetencionIsr:0:0;
                        d.montoIeps=d.montoRetencionIvaME ? d.montoRetencionIvaME * this.gastos.tipoCambio: d.montoRetencionIva ? d.montoRetencionIva ?  d.montoRetencionIva:0:0;   
                        d.tasaIva = d.tasaIva ? String(d.tasaIva * 100)+'%': '0%';
                        d.tasaIeps = d.tasaIeps ? String(d.tasaIeps * 100)+'%': '0%';
                        d.tasaRetencionIsr = d.tasaRetencionIsr ? String(d.tasaRetencionIsr * 100)+'%': '0%';
                        d.tasaRetencionIva = d.tasaRetencionIva ? String(d.tasaRetencionIva * 100)+'%': '0%';
                        d.importeTotal=d.importeME ? d.importeME * this.gastos.tipoCambio: d.importe ? d.importe ? d.importe:0:0; 
                        d.importeTotal=d.importeTotal + d.montoIva + d.montoIeps + d.montoRetencionIsr;
                        d.importeTotalME=d.importeME + d.montoIvaME + d.montoIepsME + d.montoRetencionIsrME; 
                      })
                      this.prodservTabla = new MatTableDataSource(detalle);
                      this.prodservTabla.paginator = this.paginator!;
                      this.prodservTabla.sort = this.sort;
                    }, (err:any) => { }, () => { }
                    ); 
                },() => { }        
            ); 
            this.valida(this.gasto)
          } else{
          this.valida(this.gasto)
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
                this.gastosNofiscal.Moneda=this.MonedaL.filter((mon:any) => mon.clave == this.gastosNofiscal.idMoneda)[0].clave;   
                this.bloqTC=this.gastosNofiscal.idMoneda=="MXN"?true:false;
                this.bloqTotTC=this.gastosNofiscal.idMoneda!="MXN"?true:false;
                let tipoCambioNF=this.gasto.tipoCambio>=0.0001?this.gasto.tipoCambio:0;
                this.gastosNofiscal.importeTotalME=this.gastosNofiscal.idMoneda!="MXN"?
                                                     this.gastosNofiscal.importeTotal>=0.0001?this.gastosNofiscal.importeTotalME:0:0;
                
              } else {
                this.noFiscalOrig=nofiscal.length                
                this.gastosNofiscal=[];  
                this.gastosNofiscal.idMoneda='MXN';
              }              
              this.valida(this.gasto)
              console.log('this.gastosNofiscal',this.gastosNofiscal);    
            },() => {}); 
          break;
        default:
        this.valida(this.gasto)

          break;
      }   
   }
 
   ngOnInit(): void { }
 /**
 * @function
  * @name Historia 
  * Metodo  que consulta el servicio, para obtener el hisorial
  * @param {string} gastos 
  * @returns Regresa el arreglo Historial para Anticipos consultando el servicio correspondiente
  */
   Historia() {
     this.servicios.getUnParametro('gastos',`${this.id}/historial` )      
     .pipe( catchError(err => {return throwError(err);  })
     ) .subscribe((hist:any) => {  
       hist.map((h:any)=>{ h.fechaRegistro=moment(h.fechaRegistro).format('YYYY-MM-DD HH:mm:ss') })
       hist.length>0?this.Historial = new MatTableDataSource(hist):this.Historial = new MatTableDataSource();
       this.Historial.paginator = this.paginatorh;
       this.Historial.sort = this.sorth;
     },() => {}        
     ); 
   }
 

   setStep(index: number) {
     this.step = index;
   }
  /**
 * @function
  * @name nextStep 
  * Función que desplaza el componente mat-accordion  
  * @returns {Array.<number>} Regresa una posicion más en el arreglo 
  */
   nextStep() {
     this.step++;
   }
    /**
 * @function
  * @name prevStep 
  * Función que regresa el componente mat-accordion  
  * @returns {Array.<number>} Regresa una posicion más en el arreglo 
  */
   prevStep() {
     this.step--;
   }
 /**
 * @function
  * @name cambiaCC 
  * Metodo que habilita por cambio de centro de costos 
  * @returns  {Boolean} Regresa un true o false 
  */
   cambiaCC(evento:any, arr:any){ 
     this.gasto.idCentrosCostos=evento.value;    
     this.valida(this.gasto);
   }
 /**
 * @function
  * @name cambiaProy 
  * Metodo que habilita por cambio de Proyecto 
  * @returns  {Boolean} Regresa un true o false 
  */
   cambiaProy(evento:any, arr:any){ 
     this.gasto.idProyecto=evento.value;    
     this.valida(this.gasto);
   }
 /**
 * @function
  * @name cambiaEmp 
  * Metodo que habilita por cambio de Empresa 
  * @returns  {Boolean} Regresa un true o false 
  */
   cambiaEmp(evento:any, arr:any){
     this.gasto.idEmpresa=evento.value;    
     this.valida(this.gasto);
   }
  /**
 * @function
  * @name cambiaMoneda 
  * Metodo que habilita por cambio de moneda 
  * @returns  {Boolean} Regresa un true o false 
  */
   cambiaMoneda(evento:any, arr:any){
     console.log((evento.source.selected as MatOption).viewValue);
     let tipoMoneda=(evento.source.selected as MatOption).viewValue;
     this.bloqTC=tipoMoneda!='MXN'?true:false;//this.gastosNofiscal.idMoneda
     this.gasto.tipoCambio=this.bloqTC==false?1:this.gasto.tipoCambio;
     this.bloqTotTC=tipoMoneda=="MXN"?false:true;
     this.gastosNofiscal.tipoCambio=this.bloqTC==true?0:this.gasto.tipoCambio;
     this.importeTClbl=this.bloqTotTC==true?"Importe Total":"Importe Total Convertido";     
     //this.valida(this.gastosNofiscal);   
   }
   /**
 * @function
  * @name cambiaMoneda 
  * Metodo que habilita por cambio de moneda 
  * @returns  {Boolean} Regresa un true o false 
  */
    cambiaMonedaTC(evento:any, arr:any){
      let valor: any;
      valor=evento.value?evento.value:evento.target.value;
      //console.log((evento.source.selected as MatOption).viewValue);  
      this.gasto.idMonedaTipoCambio=valor;
    }
  /**
 * @function
  * @name cambiaMoneda 
  * Metodo que habilita por cambio de moneda 
  * @returns  {Boolean} Regresa un true o false 
  */
   CambioTC(evento:any, arr:any){
    this.gastosNofiscal.tipoCambio=evento.value; 

    console.log(evento.value);  
  }

   /**
 * @function
  * @name cambiaMoneda 
  * Metodo que habilita por cambio de moneda 
  * @returns  {Boolean} Regresa un true o false 
  */
    CambioTCN(evento:any, campo:any, tipo:any){
      let valor: any;
      valor=evento.value?evento.value:evento.target.value;
      this.gasto.tipoCambio=valor;
      this.gastos.tipoCambio=valor;
      console.log(this.gastos)
      console.log(this.prodservTabla)
      console.log(valor," - ",Number(this.gastos.importeTotalME), "  -*-   ", campo, "   -*-    ", tipo);
      switch (campo) {
        case 'C':
          if(tipo=='N'){
            this.gastosNofiscal.importeTotalME=this.gastosNofiscal.importeTotalME?this.gastosNofiscal.importeTotalME:0;
            this.gastosNofiscal.importeTotal=this.gastosNofiscal.importeTotalME*valor;
          }else{
            
            //this.prodservTabla = new MatTableDataSource();
            this.prodservTabla.data.map((d:any)=>{
              d.montoIva= d.montoIvaME ? d.montoIvaME * this.gastos.tipoCambio: d.montoIva ? d.montoIva?d.montoIva:0:0;               
              d.montoIeps=d.montoIepsME ? d.montoIepsME * this.gastos.tipoCambio: d.montoIeps ? d.montoIeps ?  d.montoIeps:0:0;  
              d.montoRetencionIsr=d.montoRetencionIsrME ? d.montoRetencionIsrME * this.gastos.tipoCambio: d.montoRetencionIsr ? d.montoRetencionIsr ?  d.montoRetencionIsr:0:0;
              d.montoIeps=d.montoRetencionIvaME ? d.montoRetencionIvaME * this.gastos.tipoCambio: d.montoRetencionIva ? d.montoRetencionIva ?  d.montoRetencionIva:0:0;   
              d.tasaIva = d.tasaIva ? d.tasaIva * 100: 0;
              d.tasaIeps = d.tasaIeps ? d.tasaIeps * 100: 0;
              d.tasaRetencionIsr = d.tasaRetencionIsr ? d.tasaRetencionIsr * 100: 0;
              d.tasaRetencionIva = d.tasaRetencionIva ? d.tasaRetencionIva * 100: 0;
              d.importeTotal=d.importeME ? d.importeME * this.gastos.tipoCambio: d.importe ? d.importe ?  d.importe:0:0; 
              d.importeTotal=d.importeTotal + d.montoIva + d.montoIeps + d.montoRetencionIsr;
              d.importeTotalME=d.importeME + d.montoIvaME + d.montoIepsME + d.montoRetencionIsrME;
            })

            this.gastos.descuento=this.gastos.descuentoME ? numberFormat2.format(this.gastos.descuentoME * this.gastos.tipoCambio): this.gastos.descuento ? this.gastos.descuento ?  numberFormat2.format(this.gastos.descuento):0:0;  
            this.gastos.subtotal=this.gastos.subtotalME ? numberFormat2.format(this.gastos.subtotalME * this.gastos.tipoCambio): this.gastos.subtotal ? this.gastos.subtotal ?  numberFormat2.format(this.gastos.subtotal):0:0;  
                          
            this.gastos.tasaIeps = this.gastos.tasaIeps ? this.gastos.tasaIeps * 100: 0;
            this.gastos.tasaRetencionIsr = this.gastos.tasaRetencionIsr ? this.gastos.tasaRetencionIsr * 100: 0;
            this.gastos.tasaRetencionIva = this.gastos.tasaRetencionIva ? this.gastos.tasaRetencionIva * 100: 0;
            this.gastos.tasaIva=this.gastos.tasaIva ? this.gastos.tasaIva * 100:0;

            this.gastos.montoIeps=this.gastos.montoIeps?numberFormat2.format(this.gastos.montoIeps):0;
            this.gastos.montoIva= this.gastos.montoIvaME ? numberFormat2.format(this.gastos.montoIvaME * this.gastos.tipoCambio): this.gastos.montoIva ? this.gastos.montoIva?numberFormat2.format(this.gastos.montoIva):0:0;
            this.gastos.importe=this.gastos.importeME ? numberFormat2.format(this.gastos.importeME * this.gastos.tipoCambio): this.gastos.importe ? this.gastos.importe ?  numberFormat2.format(this.gastos.importe):0:0;  
            this.gastos.montoIeps=this.gastos.montoIepsME ? numberFormat2.format(this.gastos.montoIepsME * this.gastos.tipoCambio): this.gastos.montoIeps ? this.gastos.montoIeps ?  numberFormat2.format(this.gastos.montoIeps):0:0;  
            this.gastos.montoRetencionIsr=this.gastos.montoRetencionIsrME ? numberFormat2.format(this.gastos.montoRetencionIsrME * this.gastos.tipoCambio): this.gastos.montoRetencionIsr ? this.gastos.montoRetencionIsr ?  numberFormat2.format(this.gastos.montoRetencionIsr):0:0;
            this.gastos.montoRetencionIva=this.gastos.montoRetencionIvaME ? numberFormat2.format(this.gastos.montoRetencionIvaME * this.gastos.tipoCambio): this.gastos.montoRetencionIva ? this.gastos.montoRetencionIva ?  numberFormat2.format(this.gastos.montoRetencionIva):0:0;   
            this.gastos.importeTotal=this.gastos.importeTotalME ? numberFormat2.format(this.gastos.importeTotalME * this.gastos.tipoCambio): this.gastos.importeTotal ? this.gastos.importeTotal?numberFormat2.format(this.gastos.importeTotal):0:0;

          }          
          break;
        case 'I':
          if(tipo=='N'){
            this.gasto.tipoCambio=this.gasto.tipoCambio?this.gasto.tipoCambio:0;
            this.gastosNofiscal.importeTotal=this.gasto.tipoCambio*valor;
          }else{
            
          }          
          break;
      }

      
      console.log(valor);  
    }

    
 /**
 * @function
  * @name cambiaTipoG 
  * Metodo que habilita por cambio de Tipo de Gasto  
  * @returns  {Boolean} Regresa un true o false 
  */
   cambiaTipoG(evento:any, arr:any){
     this.gasto.idTipoGasto=evento.value;      
     let tipoElegido=this.Tipogasto.filter((d: any) => d.idTipoGastos == evento.value)
     this.gastos.tipodegasto=tipoElegido[0].nombreGasto; 
     this.gastos.ctaContable=`${tipoElegido[0].cuentaContable} ${tipoElegido[0].descripcionCuenta}`;      
     this.valida(this.gasto);
   }
 /**
  * @function
  * @name cambiaFormaP 
  * Metodo que habilita por cambio de Forma 
  * @returns  {Boolean} Regresa un true o false 
  */
   cambiaFormaP(evento:any, arr:any){    
     this.gastosNofiscal.metodoPago=evento.value; 
   }
   
   comprobante(evento:any){ 
      this.step = 0;   
      if(evento.checked==true){this.gasto.idTipoComprobante=1; this.modFiscal=false; this.modNofiscal=true; this.tabNoFiscal=0;}
      if(evento.checked==false){ 
        this.gasto.idTipoComprobante=2; 
        this.modFiscal=true; 
        this.modNofiscal=false; 
        this.tabNoFiscal=1;
        this.servicios.getUnParametro('gastosnofiscales',`?idGasto=${this.gasto.id}` ).pipe( catchError(err => {return throwError(err); })
        ).subscribe((nofiscal:any) => { 
          this.noFiscalOrig=nofiscal.length;
          nofiscal.length==0?this.gastosNofiscal.idMoneda='MXN':'';
          //console.log();
        });
      }
      //this.valida(this.gasto); 
      //this.mensajes.mensaje('No se puede cambiar el gasto cuando ya se ha subido un comprobante XML o PDF.','','danger');
   }
 
   valida(event: any) {
     this.btnGda='1';    
     this.bloqueoWf='0';   
     
     if(this.arrUslogin[0].idUser==this.gasto.idUser){
      this.bloqueoWf='1'; 
      //if(this.gasto.idEmpresa > 0){}else{ return false;};          
      // if(this.gasto.idTipoComprobante===1){
      //   if(this.gasto.rutaArchivo != null && this.gasto.rutaXml!= null){
      //     this.bloqueoWf='1';               
      //   }       
      // } else {
      //   if(this.gasto.rutaArchivo != null){
      //     this.bloqueoWf='1'; 
      //   }    
      // }
      } else {
        this.bloqueo=false;
        this.bloqTC=true;
        this.bloqueoWf='0';
        this.btnGda='0';   
        console.log(this.gasto.estatus, ' * ' , this.bloqueoWf);
      }


     if(this.gasto.estatus == "Aprobado" || this.gasto.automatico === 2){
      console.log(this.gasto.estatus);
      this.bloqueo=false;
      this.bloqTC=true;
      this.bloqTotTC=true;
      this.bloqueoWf='0';
      this.btnGda='0';         
     }
     if(this.gasto.estatus == "Nuevo" || this.gasto.automatico == null){
      console.log(this.gasto.estatus);
      this.bloqueo=true;
      this.bloqTC=false;
      this.bloqTotTC=false;
      this.bloqueoWf='1';
      this.btnGda='1';         
     }
     this.tipodeCambio = this.gasto.idMoneda=="USD"?true:false;
     this.gasto.estatus=this.gasto.automatico === 2?'Rechazado':this.gasto.estatus;
   }
 /**
  * @function
  * @name guardarGastosZ 
  * Metodo que guarda los valores de los inputs 
  * @returns {Array.<string>} Regresa un arreglo guardar
  */
   guardarGastosZ() {
     this.dialogService.openConfirmDialog('¿Esta seguro que desea guardar los cambios del gasto?')
       .afterClosed().subscribe(res =>{
         console.log(res);

         if(Number(this.gasto.idTipoComprobante)==2){
          let validar = this.gastosNofiscal.folioComprobante && this.gastosNofiscal.fechaEmision && this.gastosNofiscal.razonSocialEmisor && this.gastosNofiscal.concepto &&
          this.gastosNofiscal.importeTotal && this.gastosNofiscal.idMoneda && this.gastosNofiscal.metodoPago && this.gasto.rutaArchivo ? false : true;
          if(validar){
            this.mensajes.mensaje('Debe capturar todos los campos obligatorios y asociar el comprobante de su gasto.','','danger');
            return;
          }          
         }

         if(res){

           let guardar:any={
             idEmpresa: Number(this.gasto.idEmpresa),
             idProyecto: Number(this.gasto.idProyecto),
             idCentrosCostos: Number(this.gasto.idCentrosCostos),
             idUser: Number(this.gasto.idUser),
             idTipoComprobante: Number(this.gasto.idTipoComprobante),
             idTipoGasto: Number(this.gasto.idTipoGasto),
             notas: this.gasto.notas,
             montoAprobado:this.gasto.montoAprobado? Number(this.gasto.montoAprobado):0,
             estatus: this.gasto.estatus,
             automatico:this.gasto.automatico?this.gasto.automatico:1,
             idFormasPago:this.gasto.siFiscal==true?this.gastos.formaPago?this.formapago.filter((d: any) => d.clave == this.gastos.formaPago)[0].id:0:this.gastosNofiscal.metodoPago?this.formapago.filter((d: any) => d.descripcion == this.gastosNofiscal.metodoPago)[0].id:0,
             idCuenta:this.gasto.idCuenta==null?0:this.gasto.idCuenta,
           }

           if(this.gasto.idMoneda!="MXN" && this.gasto.idMoneda!=null){
              guardar.idMonedaTipoCambio=1;
              guardar.tipoCambio=Number(this.gasto.tipoCambio)
           }
           //console.log('GUARDA',this.gasto.siFiscal==true?this.gastos.formaPago?this.formapago.filter((d: any) => d.clave == this.gastos.formaPago)[0].id:0:this.gastosNofiscal.metodoPago?this.formapago.filter((d: any) => d.descripcion == this.gastosNofiscal.metodoPago)[0].id:0);
           //this.gastos.formaPagos= this.formapago.filter((d: any) => d.clave == this.gastos.formaPago)[0].id;
           console.log(this.gasto);
           console.log(guardar); 


           this.servicios.putDatos(`gastos/${this.gasto.id}?idWorkflow=${this.idWorkflow}`, guardar)
             .pipe(  catchError(err => { return throwError(err);  })
             ).subscribe( (gst:any) => { 
               console.log(gst);
 
               if(Number(this.gasto.idTipoComprobante)==2){
                 console.log("NO FISCAL");
                 let guardarNoF :any ={
                   folioComprobante: this.gastosNofiscal.folioComprobante!=null?this.gastosNofiscal.folioComprobante:'', 
                   fechaEmision: this.gastosNofiscal.fechaEmision!=null?this.datePipes.transform(new Date(this.gastosNofiscal.fechaEmision), 'yyyy-MM-dd'):this.datePipes.transform(new Date(Date.now()), 'yyyy-MM-dd'), 
                   razonSocialEmisor: this.gastosNofiscal.razonSocialEmisor!=null?this.gastosNofiscal.razonSocialEmisor:'', 
                   concepto: this.gastosNofiscal.concepto!=null?this.gastosNofiscal.concepto:'', 
                   importeTotal: this.gastosNofiscal.importeTotal!=null?Number(this.gastosNofiscal.importeTotal):0,
                   idMoneda: this.gastosNofiscal.idMoneda!=null?this.gastosNofiscal.idMoneda:'MXN',
                   metodoPago: this.gastosNofiscal.metodoPago!=null?this.gastosNofiscal.metodoPago:'',
                   importeAprobado: this.gastosNofiscal.importeAprobado!=null?Number(this.gastosNofiscal.importeAprobado):0
                  }    
                  console.log('guardarNoF - ',guardarNoF);       
                  guardarNoF.idMoneda!='MXN'?guardarNoF.importeTotalME=this.gastosNofiscal.importeTotalME:'';
                  console.log(guardarNoF);

                  console.log(this.noFiscalOrig);                 
                  if(this.noFiscalOrig==0){
                     this.servicios.postDatosQ('gastosnofiscales',`?idGasto=${this.gasto.id}`, guardarNoF)
                       .pipe(
                         catchError(err => { return throwError(err); })
                       ).subscribe(
                         (res:any) => {
                           console.log(res);
                           this.mensajes.mensaje('Se guardo con exito la información.','','success');
                           this.router.navigate([`/gastosz/editGastosZ/${this.gasto.id}/0`]);   
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
                           let mensaje=this.gasto.rutaArchivo?'Se guardo con exito la información.':'Se guardo con exito la información recuerde asociar el comprobante PDF de su gasto';
                           this.mensajes.mensaje(mensaje,'','success');
                           this.router.navigate([`/gastosz/editGastosZ/${this.gasto.id}/0`]);  
                         },
                         (err:any) => { 
                           this.mensajes.mensaje('Hubo un error al guardar la información intente de nuevo.','','danger');
                          }
                         //,() => {console.log('Termino'); }
                     );
                  }
               } else {                
                this.servicios.getUnParametro('gastos',this.id )      
                  .pipe( catchError(err => {return throwError(err);  })
                  ) .subscribe((gasDato:any) => {  
                    this.mensajes.mensaje('Se guardo con exito la información...','','success');
                    this.Inicio(gasDato);                    
                  });                
               }
               
             },
             (err:any) => { this.mensajes.mensaje('Hubo un error al guardar la información intente de nuevo.','','danger'); });
           //*/
         } 
     });
   }
  /**
  * @function
  * @name cerrarGastosZ 
  * Metodo que cierra el dialogo de confirmación para redireccionar a la pantalla anterior  
  * @returns {Boolean} Regresa un true o false 
  */
   cerrarGastosZ() {    
     this.dialogService.openConfirmDialog(' ¿ Esta seguro desea salir del gasto '+ this.id  +' ?')
       .afterClosed().subscribe(res =>{
         if(res){
           this.router.navigate(['/gastosz']);
         } 
     });
   }
  /**
 * @function
  * @name cargaArchivoXML 
  * Metodo para cargar un archivo xml 
  * @returns {Array.<string>} Regresa arreglo
  */
   cargaArchivoXML(event: any) {
     this.archivoXml =[];
     if (event.target.files.length > 0) {
       this.archivoXml = event.target.files[0];
       const formData = new FormData();
       formData.append('file',this.archivoXml); 
       //console.log(this.archivoXmlName, '   - ' , this.archivoXml.name);

       if(this.gasto.rutaArchivo!=null){   
        let rupdf=this.gasto.rutaArchivo.split(`EX_${this.gasto.id}_`)
        this.nomOrigPdf = rupdf[1].split('.pdf')[0];
        this.nomOrigXml = this.archivoXml.name.split('.xml')[0];
        console.log(this.nomOrigXml ,'==', this.nomOrigPdf);
        if(this.nomOrigXml !=this.nomOrigPdf){
          this.mensajes.mensaje('El nombre del archivo PDF y XML no coinciden.','','danger');
          return;
        }
       }

       this.http.post(`${API}gastos/uploadxml/?gasto_id=${this.gasto.id}`, formData)
         .subscribe((res: any) => {
           console.log('cargaArchivoXML',res); 
           this.gasto.rutaXml=res;
           this.archivoXmlName=this.gasto.rutaXml;
           this.siXml=true;
           this.servicios.getUnParametro('gastos', `${this.gasto.id}/comprobante`)      
           .pipe( catchError(err => {return throwError(err);  })
           ) .subscribe((fiscal:any) => { 
              console.log("cargafiscal",fiscal[0])
              this.gastos=fiscal[0];
              this.gastos.descuento=this.gastos.descuentoME ? numberFormat2.format(this.gastos.descuentoME * this.gastos.tipoCambio): this.gastos.descuento ? this.gastos.descuento ?  numberFormat2.format(this.gastos.descuento):0:0;  
              this.gastos.descuentoMES=this.gastos.descuentoME? numberFormat2.format(this.gastos.descuentoME):0;
              this.gastos.subtotal=this.gastos.subtotalME ? numberFormat2.format(this.gastos.subtotalME * this.gastos.tipoCambio): this.gastos.subtotal ? this.gastos.subtotal ?  numberFormat2.format(this.gastos.subtotal):0:0;  
              this.gastos.subtotalMES=this.gastos.subtotalME? numberFormat2.format(this.gastos.subtotalME):0;

              this.gastos.tasaIeps = this.gastos.tasaIeps ? String(this.gastos.tasaIeps * 100)+'%': '0%';
              this.gastos.tasaRetencionIsr = this.gastos.tasaRetencionIsr ? String(this.gastos.tasaRetencionIsr * 100)+'%': '0%';
              this.gastos.tasaRetencionIva = this.gastos.tasaRetencionIva ? String(this.gastos.tasaRetencionIva * 100)+'%': '0%';
              this.gastos.tasaIva=this.gastos.tasaIva ? String(this.gastos.tasaIva * 100)+'%': '0%';

              this.gastos.montoIeps=this.gastos.montoIeps?numberFormat2.format(this.gastos.montoIeps):0;
              this.gastos.subtotalMES=this.gastos.subtotalME? numberFormat2.format(this.gastos.subtotalME):0;

              this.gastos.montoIva= this.gastos.montoIvaME ? numberFormat2.format(this.gastos.montoIvaME * this.gastos.tipoCambio): this.gastos.montoIva ? this.gastos.montoIva?numberFormat2.format(this.gastos.montoIva):0:0;
              this.gastos.montoIvaMES=this.gastos.montoIvaME? numberFormat2.format(this.gastos.montoIvaME):0;
              
              this.gastos.importe=this.gastos.importeME ? numberFormat2.format(this.gastos.importeME * this.gastos.tipoCambio): this.gastos.importe ? this.gastos.importe ?  numberFormat2.format(this.gastos.importe):0:0;  
              this.gastos.importeMES=this.gastos.importeME? numberFormat2.format(this.gastos.importeME):0;
              
              this.gastos.montoIeps=this.gastos.montoIepsME ? numberFormat2.format(this.gastos.montoIepsME * this.gastos.tipoCambio): this.gastos.montoIeps ? this.gastos.montoIeps ?  numberFormat2.format(this.gastos.montoIeps):0:0;  
              this.gastos.montoIepsMES=this.gastos.montoIepsME? numberFormat2.format(this.gastos.montoIepsME):0;

              this.gastos.montoRetencionIsr=this.gastos.montoRetencionIsrME ? numberFormat2.format(this.gastos.montoRetencionIsrME * this.gastos.tipoCambio): this.gastos.montoRetencionIsr ? this.gastos.montoRetencionIsr ?  numberFormat2.format(this.gastos.montoRetencionIsr):0:0;
              this.gastos.montoRetencionIsrMES=this.gastos.montoRetencionIsrME? numberFormat2.format(this.gastos.montoRetencionIsrME):0;
              
              this.gastos.montoRetencionIva=this.gastos.montoRetencionIvaME ? numberFormat2.format(this.gastos.montoRetencionIvaME * this.gastos.tipoCambio): this.gastos.montoRetencionIva ? this.gastos.montoRetencionIva ?  numberFormat2.format(this.gastos.montoRetencionIva):0:0;   
              this.gastos.montoRetencionIvaMES=this.gastos.montoRetencionIvaME? numberFormat2.format(this.gastos.montoRetencionIvaME):0;

              this.gastos.importeTotal=this.gastos.importeTotalME ? numberFormat2.format(this.gastos.importeTotalME * this.gastos.tipoCambio): this.gastos.importeTotal ? this.gastos.importeTotal?numberFormat2.format(this.gastos.importeTotal):0:0;
              this.gastos.importeTotalMES=this.gastos.importeTotalME? numberFormat2.format(this.gastos.importeTotalME):0;  

              this.gastos.formaPagos= this.gastos.formaPago+ '-' + this.formapago.filter((d: any) => d.clave == this.gastos.formaPago)[0].descripcion;
              this.gasto.idFormasPago=this.formapago.filter((d: any) => d.clave == this.gastos.formaPago)[0].id;
              this.gasto.idMoneda=fiscal[0].idMoneda
              let guardar:any={
                idEmpresa: Number(this.gasto.idEmpresa),
                idProyecto: Number(this.gasto.idProyecto),
                idCentrosCostos: Number(this.gasto.idCentrosCostos),
                idUser: Number(this.gasto.idUser),
                idTipoComprobante: Number(this.gasto.idTipoComprobante),
                idTipoGasto: Number(this.gasto.idTipoGasto),
                notas: this.gasto.notas,
                montoAprobado:this.gasto.montoAprobado? Number(this.gasto.montoAprobado):0,
                estatus: this.gasto.estatus,
                automatico:this.gasto.automatico?this.gasto.automatico:1,
                idFormasPago:this.formapago.filter((d: any) => d.clave == this.gastos.formaPago)[0].id,
                idCuenta:this.gasto.idCuenta==null?0:this.gasto.idCuenta,
              }     

              if(this.gasto.idMoneda!="MXN" && this.gasto.idMoneda!=null){
                  guardar.idMonedaTipoCambio=1;
                  guardar.tipoCambio=Number(this.gasto.tipoCambio)
                  this.tipodeCambio = true
              }   
                                         
              console.log(guardar);              
              this.servicios.putDatos(`gastos/${this.gasto.id}?idWorkflow=${this.idWorkflow}`, guardar)
              .pipe(  catchError(err => { return throwError(err);  })).subscribe( (gst:any) => {  console.log(gst); });
              //this.bloqTC=this.gastos.idMoneda=="MXN"?false:true;
              this.bloqTC=this.gastos.idMoneda!="MXN"?false:true;
             if(fiscal.uuidRelacionado){
               this.gastoRel.push({uuid:fiscal.uuid,uuidRelacionado:fiscal.uuidRelacionado,idTipoCfdiRelacionado:fiscal.idTipoCfdiRelacionado});
               this.cfdiRelTabla = new MatTableDataSource(this.gastoRel);
               this.cfdiRelTabla.paginator = this.paginator!;
             }else{
               this.gastoRel=[];
               this.cfdiRelTabla = new MatTableDataSource(this.gastoRel);
             }             
             this.gastos.fechaEmision= moment(new Date(this.gastos.fechaEmision)).format("DD/MM/YYYY");
             this.gastos.fechaTimbrado= moment(new Date(this.gastos.fechaTimbrado)).format("DD/MM/YYYY");
             if(this.gasto.idMoneda=="USD"){
                this.tipodeCambio = true
                this.gasto.idMonedaTipoCambio=1;
              };
              //this.guardarGastosZ();
              this.router.navigate([`/gastosz/editGastosZ/${this.gasto.id}/0`]);   
            this.servicios.getUnParametro('gastos', `${this.gasto.id}/comprobantedetalle`)      
                   .pipe( catchError(err => { return throwError(err);  })
                   ).subscribe((detalle:any) => {
                    console.log('detalle XML -',detalle)
                    detalle.map((d:any)=>{                      
                      d.montoIva= d.montoIvaME ? d.montoIvaME * this.gastos.tipoCambio: d.montoIva ? d.montoIva?d.montoIva:0:0;                       
                      d.montoIeps=d.montoIepsME ? d.montoIepsME * this.gastos.tipoCambio: d.montoIeps ? d.montoIeps ?  d.montoIeps:0:0;  
                      d.montoRetencionIsr=d.montoRetencionIsrME ? d.montoRetencionIsrME * this.gastos.tipoCambio: d.montoRetencionIsr ? d.montoRetencionIsr ?  d.montoRetencionIsr:0:0;
                      d.montoIeps=d.montoRetencionIvaME ? d.montoRetencionIvaME * this.gastos.tipoCambio: d.montoRetencionIva ? d.montoRetencionIva ?  d.montoRetencionIva:0:0;   
                      d.tasaIva = d.tasaIva ? String(d.tasaIva * 100)+'%': '0%';
                      d.tasaIeps = d.tasaIeps ? String(d.tasaIeps * 100)+'%': '0%';
                      d.tasaRetencionIsr = d.tasaRetencionIsr ? String(d.tasaRetencionIsr * 100)+'%': '0%';
                      d.tasaRetencionIva = d.tasaRetencionIva ? String(d.tasaRetencionIva * 100)+'%': '0%';
                      d.importeTotal=d.importeME ? d.importeME * this.gastos.tipoCambio: d.importe ? d.importe ?  d.importe:0:0; 
                      d.importeTotal=d.importeTotal + d.montoIva + d.montoIeps + d.montoRetencionIsr;
                      d.importeTotalME=d.importeME + d.montoIvaME + d.montoIepsME + d.montoRetencionIsrME;
                    })
                     this.prodservTabla = new MatTableDataSource(detalle);
                     this.prodservTabla.paginator = this.paginator!;
                     this.prodservTabla.sort = this.sort;
                     this.valida(detalle);   
                   },(err:any) => { console.log(err); this.mensajes.mensaje('Hubo un error al cargar el XML.','','danger');}, () => { }        
                 );   
             },(err:any) => { console.log(err); this.mensajes.mensaje('Hubo un error al cargar el XML.','','danger');}, () => { }        
           ); 
         },
         (err:any) => { console.log(err);this.mensajes.mensaje(err.error.message,'','danger');}, () => { }
       ); 
     }
   }
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
       
       if(this.gasto.rutaXml!=null){
        let rupdf=this.gasto.rutaXml.split(`EX_${this.gasto.id}_XML_`)
        this.nomOrigXml = rupdf[1].split('.xml')[0];
        this.nomOrigPdf = this.archivoPdf.name.split('.pdf')[0];
        if(this.nomOrigXml !=this.nomOrigPdf){
          this.mensajes.mensaje('El nombre del archivo PDF y XML no coinciden.','','danger');
          return;
        }
       }
       this.http.post(`${API}gastos/upload/?gasto_id=${this.gasto.id}`, formData)
         .subscribe(res => {
           this.gasto.rutaArchivo=res;  
           this.archivoPdfName=this.gasto.rutaArchivo;
           this.siPDF=true;              
           this.FileUrlPDF = URL.createObjectURL(this.archivoPdf);
           this.valida(this.gasto);       
         })
     }
   }
    
   enviar(){}
 /**
  * @function
  * @name pdf  
  * Metodo que descarga un archivo PDF  
  * @returns Regresa ---
  */
   pdf(){
     FileSaver.saveAs(this.descargaPDF, this.gasto.rutaArchivo + '_' + new  Date().getTime() + '.pdf');    
   }
 /**
  * @function
  * @name delPdf  
  * Metodo que elimina el archivo PDF  
  * @returns {Array.<string>} Regresa un Array con valores null
  */
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
               this.archivoPdfName=''; 
               this.mensajes.mensaje('Se ha borrado con exito el comprobante PDF.','','success');          
             },() => {}        
             );
         } else {
         
         }
     });
   }
 /**
  * @function
  * @name xml 
  * Metodo que descarga un archivo xml  
  * @returns Regresa ---
  */
   xml(){    
     FileSaver.saveAs(this.descargaXML, this.gasto.rutaXml + '_' + new  Date().getTime() + '.xml');    
   }
 /**
  * @function
  * @name delXml 
  * Metodo que elimina el archivo xml  
  * @returns {Array.<string>} Regresa un Array con valores null
  */
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
               this.archivoXmlName=''; 
               this.mensajes.mensaje('Se ha borrado con exito el comprobante XML .','','success');
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
        let Workflow=this.workFGral;
         console.log(res);
         if(res){
          let envEstatus={estatus:arr.estatus}
          this.idWorkflow=Workflow.filter((dato:any) => dato.nombreObjeto== "Gastos" && dato.evento.some((o2:any) => o2.siguienteEstatus === evento.source.value));           
           this.servicios.deleteMultiple(`gastos/${this.id}?idWorkflow=${this.idWorkflow.id}` )      
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

   numerico(valor: any) {
      return numberFormat2.format(valor)
   }

   public getDatos (idempresa:any, idCC:any, nivCC: any) : Observable<any>  {
      let monedas=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=monedas`, { headers: headers });
      let tipoSolicitud=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=tipoSolicitud`, { headers: headers });        
      let centrosCostos=this.http.get<any>(API+'catalogos/?catalogo=vwCentrosCostos&filtro1='+encodeURIComponent('idEstructura='+idCC+' and idEmpresas='+idempresa), { headers: headers });
      let empresas=this.http.get<any>(APIAdmin+'catalogo/?catalogo=empresas&filtro1='+encodeURIComponent('id='+idempresa), { headers: headers });
      let proyectos=this.http.get<any>(API+'catalogos/?catalogo=vwProyectos&filtro1='+encodeURIComponent('nivelEstructura='+nivCC+' and idEmpresas='+idempresa), { headers: headers });
      let tipoGastos=this.http.get<any>(API+'catalogos/?catalogo=vwTipoGastosEmpresaCosto&filtro1='+encodeURIComponent('nivelEstructura='+nivCC+' and idEmpresas='+idempresa), { headers: headers });
      //let tipoGastos=this.http.get<any>(`${API}catalogos/?catalogo=vwTipoGastos&filtro1=idEmpresas=${idempresa}`, { headers: headers });
      let formasPagos=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=formasPago`, { headers: headers }); 
      return forkJoin([monedas,tipoSolicitud,centrosCostos,empresas,proyectos,tipoGastos,formasPagos]);  
  }  

  public getUsuario (id:any,idempresa:any) : Observable<any>  {        
    let usuario=this.http.get<any>(API+'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1='+encodeURIComponent('idOcupantePuesto='+id+' and idEmpresas='+idempresa ), { headers: headers });
    return forkJoin([usuario]);         
  }
 }
 