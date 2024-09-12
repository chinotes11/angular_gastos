/** Modulo Angular que muestra un listado con devoluciones 
 * @module 1. Edita Devoluciones
 * devolucion-edita.component.ts  
 */
 import { Component, OnInit,ElementRef, ViewChild } from '@angular/core';
 import { ActivatedRoute, Router } from '@angular/router';
 import { FormControl, NgForm, FormGroupDirective } from '@angular/forms';
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
 import { serviciosService } from "../../../Genericos/servicios/servicios.service";
 import { catchError } from 'rxjs/operators';
 import { MensajesService } from "../../../Genericos/mensajes/mensajes.service";
 import { forkJoin, Observable, throwError } from 'rxjs';
 import { HttpClient, HttpHeaders } from '@angular/common/http';
 import { environment } from '../../../../environments/environment';
 import { TokenService } from '../../../auth/token/token.service';
 const APIAdmin= environment.ApiUrlAdmin;
 const headers = new HttpHeaders    
 headers.append('Content-type', 'applicartion.json')
 declare var jQuery: any;
 import * as FileSaver from 'file-saver';
 import { PdfViewerComponent} from 'ng2-pdf-viewer';
 const API = environment.ApiUrl; 
 const moment = _moment; 
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
   * componente Principal para listar y editar las devoluciones 
   */
 @Component({
   //selector: 'app-edit-gastos',
   templateUrl: './devolucion-edita.component.html',
   styleUrls: ['./devolucion-edita.component.css']
 })
  /** El nombre del modulo EditaDevolucionesComponent */
 
 export class EditaDevolucionesComponent implements OnInit {
   Devolucion:any;
   reporte:any;
   arrsesion: any;
   arrUslogin:any; 
   TipoSol:any;
   CentroCosto:any;
   TipoComprobante:any;
   Proyectos:any;
   Empresas:any;
   Tipogasto:any;
   DtsUsr:any;
   workInicial: any;
   workOrigen!:string;
   workFGral: any;
   idWorkflow:any;
   devolucionArr:any;
   bloqueo:boolean=true;
   bloqueoWf:string='1';
 
   btnGda:string='1';
   Historial:any;
   origen:number=0;
   id:any;
   histColumns: string[] = ['fechaRegistro', 'idUser', 'evento', 'estatus', 'comentarios'];
   
   siPDF:boolean=false;
   archivoPdf!:any;
   FileUrlPDF:any;
   descargaPDF:any;
   zoom_to:any=0.8;
   idRol:any;
   datSess:any; 
    
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatSort) sort: MatSort = Object.create(null);
  searchText: any;
  displayedCol: string[] = ['select','id', 'descripcion'];
  dataSource = new MatTableDataSource();
  selection = new SelectionModel<any>(true, []);
  @ViewChild('inputPdf') inputPdf!: ElementRef;
 
      /**
       * Consulta catálogos y servicios. 
       */
   constructor(activatedRouter: ActivatedRoute, 
     private router: Router,
     public datePipes:DatePipe,
     public workService:WorkFlowService,
     public dialog:MatDialog,
     private dialogService: DialogService,
     private servicios: serviciosService,
     private mensajes: MensajesService,
     private http: HttpClient,
     private token: TokenService) {
      this.datSess=token.readToken('id','');
      this.datSess=this.datSess.split(','); 
      this.idRol=token.readToken('rlsRol','GASTOS');
       this.Historial = new MatTableDataSource();
       this.id = activatedRouter.snapshot.paramMap.get('id');  
       this.reporte=[];
       this.devolucionArr={estatus: null}; 
       this.getUsuario(this.datSess[0],this.datSess[1]).subscribe(rsUsLog => {
        this.arrUslogin=rsUsLog[0];    
        this.arrUslogin.map((t1:any) =>{t1.NombreCompleto= `${t1.nombre} ${t1.apellidoPaterno} ${t1.apellidoMaterno}`; t1.idUser=t1.idOcupantePuesto; t1.idEmpresa=Number(this.datSess[1]);  t1.idRoles=this.idRol; });
          this.servicios.getUnParametro('devoluciones',this.id )      
          .pipe( catchError(err => {return throwError(err);  })
          ) .subscribe((reeDato:any) => { 
            this.getUsuario(reeDato.idUser,this.datSess[1]).subscribe(rsUs => {
              this.arrsesion=rsUs[0];    
              this.arrsesion.map((t1:any) =>{t1.NombreCompleto= `${t1.nombre} ${t1.apellidoPaterno} ${t1.apellidoMaterno}`; t1.idUser=t1.idOcupantePuesto; t1.idEmpresa=Number(this.datSess[1]); t1.idRoles=this.idRol;});
              this.getDatos(this.datSess[1],this.arrsesion[0].idEstructura,reeDato.idUser).subscribe(resp => {
                this.TipoSol=resp[0];         
                this.CentroCosto=resp[1];
                this.Empresas=resp[2]; 
                //this.DtsUsr=resp[3];                               
                this.servicios.getUnParametro('catalogos','?catalogo=workflows&filtro1='+encodeURIComponent('idEmpresa='+this.datSess[1]))
                  .pipe().subscribe((res:any) => {
                    this.workInicial=res;
                    this.workInicial.map((t1: any) =>{t1.evento=JSON.parse(t1.evento)});
                    this.workFGral=this.workInicial;
                    console.log(this.workFGral)
                    this.Inicio(reeDato);
                }); 
              }); 
            }); 
          });
      },
      (err:any) => {  }); 
   }
  /**
   * @function
   * @name Inicio 
   * Metodo principal que inicia el consumo del servicio
   * @param {string} devoluciones 
   * @returns {Array.<string>} Regresa el servicio devoluciones consultado correspondiente al idUser
   */
   Inicio(ree:any){
     
         this.devolucionArr=ree;  
         console.log(this.devolucionArr);      
         this.servicios.getUnParametro('reportes',this.devolucionArr.idReportesGastos )      
           .pipe( catchError(err => {return throwError(err);  })
           ) .subscribe((rep:any) => {             
             console.log(rep);
             this.reporte = [rep].map((t1:any) => ({ ...t1, ...this.arrsesion.find((t2: any) => t2.idUser === t1.idUser) }));       
             this.reporte.map((t1:any) => { t1.fechaReg=moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'); });      
             this.reporte=this.reporte[0];
             this.reporte.montoFormato=numberFormat2.format(this.reporte.monto); 
             this.reporte.fechaReg= moment(new Date(this.reporte.createdAt)).format("MM/DD/YYYY");
             console.log('reem',this.reporte)   
             this.workOrigen=this.devolucionArr.estatus;         
             // this.idWorkflow=this.workInicial.filter((dato:any) => dato.nombreObjeto=="Pagos de Anticipos y reembolsos" && this.arrsesion[0].nombreRol==dato.nombreRol &&  dato.evento.some((o2:any) => o2.siguienteEstatus === res.estatus));
             this.idWorkflow=this.workInicial.filter((dato:any) => dato.nombreObjeto=="Devoluciones" );//&& this.arrsesion[0].nombreRol==dato.nombreRol
             this.idWorkflow= this.idWorkflow[0].id;
             this.workInicial = this.workInicial.filter((dato:any) => dato.estatusActual == this.devolucionArr.estatus && dato.nombreObjeto== "Devoluciones")             
             if(this.workInicial.length > 0){this.workInicial = this.workInicial[0].evento; } else{this.workInicial = [];}


             this.Historia();   
             this.valida(this.devolucionArr);     
             if(this.devolucionArr.comprobante!=""){
               this.siPDF=true;
               this.servicios.getFile('devoluciones/download', `${this.devolucionArr.id}`)
                 .pipe(catchError(err => { 
                   console.log(err); 
                   return throwError(err);})
                 ).subscribe((pdf: Blob) => {
                   this.FileUrlPDF = URL.createObjectURL(pdf);
                   this.descargaPDF=pdf; 
                   this.valida(this.devolucionArr);                 
                 },
                   (err:any) => { }, () => { }
                 ); 
             }                   
           },
           (err:any) => {});           
   }
  /**
   * @function
   * @name Historia 
   * Metodo  que consulta el servicio, para obtener el hisorial
   * @param {string} devoluciones 
   * @returns Regresa el arreglo Historial para devoluciones consultando el servicio correspondiente
   */
   Historia() {
     this.servicios.getUnParametro('devoluciones',`${this.devolucionArr.id}/historial` )      
     .pipe( catchError(err => {return throwError(err);  })
     ) .subscribe((hist:any) => {  
       hist.map((h:any)=>{ h.fechaRegistro=moment(h.fechaRegistro).format('YYYY-MM-DD HH:mm:ss') })
       hist.length>0?this.Historial = new MatTableDataSource(hist):this.Historial = new MatTableDataSource();
       this.Historial.paginator = this.paginator;
       this.Historial.sort = this.sort;
     },() => {}        
     ); 
   }
 
   ngOnInit(): void {
   }
 
   cambiaWork(evento:any, arr:any){
     this.dialogService.openConfirmDialog('  ¿Esta seguro que desea cambiar al estatus '+(evento.source.selected as MatOption).viewValue+'?')
       .afterClosed().subscribe(res =>{
         //let Workflow=JSON.parse(window.sessionStorage.getItem("workflow")!);
         console.log(arr);
         console.log(evento.source.value);
         if(res){
          let envEstatus={estatus:arr.estatus}
          this.idWorkflow=this.workFGral.filter((dato:any) => dato.nombreObjeto== "Devoluciones" && dato.evento.some((o2:any) => o2.siguienteEstatus === evento.source.value));          
           console.log(this.idWorkflow);
           this.valida(this.devolucionArr);    
           this.servicios.patchDatos(`devoluciones/${this.devolucionArr.id}?idWorkflow=${this.idWorkflow[0].id}`, envEstatus)
             .pipe(catchError(err => {console.log("ERROR"); return throwError(err);}))
             .subscribe((res:any) => {              
              if(evento.source.value=="Recibida"){
                let idWorkflowrep = this.workFGral.filter((dato: any) => dato.nombreObjeto == "Reporte de Gastos" && dato.evento.some((o2: any) => o2.siguienteEstatus === 'Aprobado'));
                console.log(idWorkflowrep)
                envEstatus={estatus:'Pagado'}
                this.servicios.patchDatos(`reportes/${arr.idReportesGastos}?idWorkflow=${idWorkflowrep.id}`, envEstatus)
                .pipe(catchError(err => { console.log("ERROR"); return throwError(err); }))
                .subscribe((rep: any) => {
                  console.log(rep);
                  console.log(res);
                  this.devolucionArr.estatus=arr.estatus;
                  this.valida(this.devolucionArr);
                }, (err:any) => { 
                  this.valida(this.devolucionArr); 
                });
              } else{
                  console.log(res);
                  this.devolucionArr.estatus=arr.estatus;
                  this.valida(this.devolucionArr);
              }              
            }, (err:any) => { 
              if(evento.source.value=="Recibida"){
                let idWorkflowrep = this.workFGral.filter((dato: any) => dato.nombreObjeto == "Reporte de Gastos" && dato.evento.some((o2: any) => o2.siguienteEstatus === 'Aprobado'));
                console.log(idWorkflowrep)
                envEstatus={estatus:'Pagado'}
                this.servicios.patchDatos(`reportes/${arr.idReportesGastos}?idWorkflow=${idWorkflowrep.id}`, envEstatus)
                .pipe(catchError(err => { console.log("ERROR"); return throwError(err); }))
                .subscribe((rep: any) => {
                  console.log(rep);
                  console.log(res);
                  this.devolucionArr.estatus=arr.estatus;
                  this.valida(this.devolucionArr);
                }, (err:any) => { 
                  this.valida(this.devolucionArr); 
                });
              } else{
                  console.log(res);
                  this.devolucionArr.estatus=arr.estatus;
                  this.valida(this.devolucionArr);
              }   
            });
         } else{
           this.devolucionArr.estatus=this.workOrigen;
         }
     });
   }
    /**
   * @function
   * @name valida 
   * Metodo que habilita el estatus del boton guardar, si algo fue modificado, switcheando aprobaciones o rechaxos
   * @returns  {Boolean} Regresa un true o false 
   */
   valida(event: any) {     
     /*
     if(this.gasto.notas!=null && this.gasto.notas!=''){}else{return false;}; 
     if(this.gasto.idEmpresa > 0){}else{ return false;}; */
     if(this.devolucionArr.estatus==='Por Aprobar' ||  this.devolucionArr.estatus==='Recibida'){
      if(this.devolucionArr.estatus==='Recibida'){
        this.bloqueo=false;
        this.bloqueoWf='0'; 
        this.btnGda='0';    
        this.siPDF=true;      
      } else{ 
        if(this.arrUslogin[0].idUser==this.devolucionArr.idUser){
         this.bloqueo=false;
         this.bloqueoWf='0'; 
         this.btnGda='0'; 
        } else{
          this.bloqueo=false;
          this.bloqueoWf='1'; 
          this.btnGda='0'; 
        } 
        console.log(this.arrUslogin[0]  )
        console.log(this.devolucionArr ) 
        this.siPDF=true;        
      }       
    } else {
      
      if(this.arrUslogin[0].idUser==this.devolucionArr.idUser){
        this.bloqueoWf=this.devolucionArr.comprobante==""?'0':'1'; 
        this.siPDF=false
        //this.siPDF=this.devolucionArr.comprobante==""?false:true; 
        this.btnGda='1';  
      } else{
        this.bloqueo=false;
        this.bloqueoWf='0'; 
        this.btnGda='0'; 
        this.siPDF=true
      } 
      
    }     
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
       console.log('id para upload',this.devolucionArr.id)
       this.http.post(`${API}devoluciones/upload/?devolucion_id=${this.devolucionArr.id}`, formData)
         .subscribe(res => {
           this.devolucionArr.comprobante=res;  
           this.siPDF=true;              
           this.FileUrlPDF = URL.createObjectURL(this.archivoPdf);
           this.valida(this.devolucionArr);       
         })
     }
   }
  /**
   * @function
   * @name pdf  
   * Metodo que descarga un archivo PDF  
   * @returns Regresa un archivo PDF
   */
   pdf(){
     FileSaver.saveAs(this.descargaPDF, this.devolucionArr.comprobante + '_' + new  Date().getTime() + '.pdf');    
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
         if(res){
 
           this.servicios.deleteMultiple(`gastos/eliminadocumento/${this.devolucionArr.id}/ARCHIVO` )        
             .pipe( catchError(err => {return throwError(err);  })
             ) .subscribe((del:any) => { 
               console.log(del);
               this.siPDF=false; 
               this.inputPdf.nativeElement.value = null;
               this.archivoPdf = []; 
               this.devolucionArr.comprobante=null; 
               this.FileUrlPDF = '';  
               this.mensajes.mensaje('Se ha borrado con exito el comprobante PDF.','','danger');   
               this.valida(this.devolucionArr);       
             },() => {}        
             );
 
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
  /**
   * @function
   * @name aceptarDialog  
   * Metodo que guarda los inputs en el arreglo guardar, para subirlos a la base
   * @returns {Array.<string>} guardar Regresa un Array con valores
   */
   aceptarDialog() {
     this.dialogService.openConfirmDialog(`¿ Esta seguro que desea actualizar la solicitud de reembolso ?`)
       .afterClosed().subscribe(res =>{
         console.log(res);
         if(res){
           let guardar={
             idEmpresa: this.devolucionArr.idEmpresa,
             idCentrosCostos: this.devolucionArr.idCentrosCostos,
             idUser: this.devolucionArr.idUser,
             idAnticiposFondos: this.devolucionArr.idAnticiposFondos,
             idReportesGastos: this.devolucionArr.idReportesGastos,
             concepto: this.devolucionArr.concepto,
             monto: this.devolucionArr.monto,
             idMoneda: 'MXN',
             comprobante: this.devolucionArr.comprobante,
             observaciones: this.devolucionArr.observaciones,
             estatus: this.devolucionArr.estatus?this.devolucionArr.estatus:'Nuevo',
             validado: this.devolucionArr.validado
           } 
           console.log(guardar);
           
           this.servicios.putDatosP('devoluciones',this.devolucionArr.id, guardar)//,`?idWorkflow=`
           .pipe(catchError(err => {console.log("ERROR"); return throwError(err);})
             ).subscribe( (reem:any) => {
             console.log(reem);           
             this.mensajes.mensaje('Devolución actualizado con exito.','','success');
             //this.router.navigate(['/reportesgastos/devolucion']);
           },
           (err:any) => {  });   
         } 
     });
   }
  /**
   * @function
   * @name cerrarDialog  
   * Metodo que reedirecciona a paginas switcheadas dependiendo de su origen
   * @returns {boolean} Regresa un true o un false
   */
   cerrarDialog() {
     this.dialogService.openConfirmDialog(' ¿ Esta seguro desea salir de la devolución '+ this.id+' ? ')
       .afterClosed().subscribe(res =>{
         if(res){    
           switch (window.sessionStorage.getItem("_origen")) {
             case 'edoCta':
               window.sessionStorage.setItem("_origen",'');
               this.router.navigate(['/estadocuenta']);              
               break;
             default:
               window.sessionStorage.setItem("_origen",'');
               this.router.navigate(['/reportesgastos/devolucion']);
             break;
           } 
         } 
     });    
   }

   public getDatos (idempresa:any, idCC:any, usuario:any) : Observable<any>  {
      let tipoSolicitud=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=tipoSolicitud`, { headers: headers });
      let centrosCostos=this.http.get<any>(API+'catalogos/?catalogo=vwCentrosCostos&filtro1='+encodeURIComponent('idEstructura='+idCC+' and idEmpresas='+idempresa), { headers: headers });
      let empresas=this.http.get<any>(APIAdmin+'catalogo/?catalogo=empresas&filtro1='+encodeURIComponent('id='+idempresa), { headers: headers });
      //let datosUsr=this.http.get<any>(API+'catalogos/?catalogo=vwUsuariosDatos&filtro1='+encodeURIComponent('id='+usuario), { headers: headers });
      return forkJoin([tipoSolicitud,centrosCostos,empresas]);
  }  

  public getUsuario (id:any,idempresa:any) : Observable<any>  {        
    let usuario=this.http.get<any>(API+'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1='+encodeURIComponent('idOcupantePuesto='+id+' and idEmpresas='+idempresa ), { headers: headers });
    return forkJoin([usuario]);         
  }
  
 
 }
 