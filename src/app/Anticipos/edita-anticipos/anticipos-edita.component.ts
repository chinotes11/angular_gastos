/** Modulo Angular que Edita los Anticipos creados por los colaboradores.
 * @module 1. Edita Anticipos
 * anticipos-edita.component.ts  
 */
 import { Component, Inject, Injectable, Input, Optional, Provider, ViewChild, ViewContainerRef, AfterViewInit } from '@angular/core';
 import { ActivatedRoute, Router } from '@angular/router';
 import { GastosSolicA } from '../anticipos';
 import { FormGroup, FormControl, NgForm, FormGroupDirective } from '@angular/forms';
 import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
 import { WorkFlowService} from '../../Genericos/servicios.service'
 import { ErrorStateMatcher, MatOption, MAT_DATE_FORMATS, MAT_DATE_LOCALE, DateAdapter } from '@angular/material/core';
 import {MomentDateAdapter} from '@angular/material-moment-adapter';
 import { DialogService } from '../acciones/dialog.service';
 import { MatTable, MatTableDataSource } from '@angular/material/table';
 import { MatSort } from '@angular/material/sort';
 import { MatPaginator } from '@angular/material/paginator';
 import { DatePipe } from '@angular/common';
 import * as _moment from 'moment';
 import { MatListOption } from '@angular/material/list';
 import { catchError } from 'rxjs/operators';
 import { forkJoin, Observable, throwError } from 'rxjs';
 import { environment } from '../../../environments/environment';
 import { serviciosService } from 'src/app/Genericos/servicios/servicios.service';
 import { MensajesService } from "../../Genericos/mensajes/mensajes.service";
 import { ServiceAnticipo } from "../anticipos.service";
 import { TokenService } from '../../auth/token/token.service';
 import { HttpClient, HttpHeaders} from '@angular/common/http';
 import { MY_FORMATS, funciones } from '../../Genericos/utilidades/funciones';

 const API = environment.ApiUrl;
 const APIAdmin= environment.ApiUrlAdmin;
 const headers = new HttpHeaders    
 headers.append('Content-type', 'applicartion.json')
 declare var jQuery: any;
 import * as FileSaver from 'file-saver';
 const moment = _moment;
 declare const require: any;
 const { jsPDF } = require("jspdf");
 const { pesostexto } = require("../../Genericos/utilidades/pesosatexto.js");
 const options2 = { style: 'currency', currency: 'MXN' };
 const numberFormat2 = new Intl.NumberFormat('es-MX', options2);

 import { PdfViewerComponent} from 'ng2-pdf-viewer';
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
 
 @Injectable({
   providedIn: 'root'
 })
 /**
  * componente Principal para listar y editar los Anticipos creados por colaborador
  */
 @Component({
   //selector: 'app-edit-anticipo',
   templateUrl: './anticipos-edita.component.html',
   styleUrls: ['./anticipos-edita.component.css'],
   providers: [{provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},{provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}]
 })
 /** El nombre del modulo EditaAnticiposComponent */
 export class EditaAnticiposComponent implements AfterViewInit {
   id: any;
   range = new FormGroup({
     start: new FormControl(),
     end: new FormControl()
   });
 
   @Input()
   archivoPagare!:any;
   archivoPdfName: string='';
   arrUslogin:any;  
   arrsesion!: any;
   anticipo!: any;
   dataAnticipo!:any;
   arrGastos!:GastosSolicA
   workInicial: any;
   TipoSol:any;
   MonedaL:any;
   CentroCosto:any;
   GastosSol:any;
   Empresas:any;
   DatoPersonal:any;
   workOrigen!:string;
   FechaI: any;
   FechaF: any;
   GastosL:any;
   Empresa:any;
   DatFiscEmp:any;
   btnGda: string='0';
   bloqueo:boolean=true;
   bloqueoWf:string='0';
   zoom_to:any=0.8;
   arrGastosGrd:any;
   arrGastosOrig:any;
   Historial:any;
   idWorkflow:any;
   workFGral: any;
   FileUrl:any;
   descarga:any;
   _origen!:string;
   siPDF:boolean=false;
   idRol:any;
   datSess:any;
   UsSuperior:any;
   tolerancia: any;
   FechaTolerancia: boolean = true;
   toleraDias:any;
   displayedColumns: string[] = ['nombreGasto', 'dias', 'monto', 'Borrar'];
   histColumns: string[] = ['fechaRegistro', 'idUser', 'evento', 'estatus', 'comentarios'];
   fechaHoy: Date=new Date(Date.now());
   //@ViewChild(MatSort) sort: MatSort = Object.create(null);   
   //@ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
   //@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
   @ViewChild('containers', { read: ViewContainerRef }) ViewContainerRef!: ViewContainerRef;
   @ViewChild(PdfViewerComponent) private pdfComponent: PdfViewerComponent []= [];

   @ViewChild('sort', { read: MatSort })   sort: MatSort = new MatSort;
   @ViewChild('sorth', { read: MatSort })   sorth: MatSort = new MatSort;
   @ViewChild('paginator', {read: MatPaginator}) paginator: MatPaginator | undefined;
   @ViewChild('paginatorh', {read: MatPaginator}) paginatorh: MatPaginator | undefined;
  
  /**
      * Consulta catálogos y servicios.
      * 
      */
   constructor(activatedRouter: ActivatedRoute, 
     private servicios: serviciosService,
     private http: HttpClient,
     public workService:WorkFlowService,
     private router: Router, 
     public datePipes:DatePipe,
     private dialogService: DialogService,
     public dialogo: MatDialog, 
     private mensajes: MensajesService,
     private token: TokenService) {
      this.datSess=token.readToken('id','');
      this.datSess=this.datSess.split(',');
      this.id = activatedRouter.snapshot.paramMap.get('id');
      this.idRol=token.readToken('rlsRol','GASTOS');
      console.log(`VERSÓN 0.9.4`);
       if(this.id.indexOf('EDO')!== -1){this.id=this.id.replace('EDO','');};
       this.GastosSol = new MatTableDataSource();
       this.anticipo={estatus: null};
       this.getUsuario(this.datSess[0],this.datSess[1]).subscribe(rsUsLog => {
        this.arrUslogin=rsUsLog[0];    
        this.tolerancia = rsUsLog[2];
        console.log('rsUsLog[0]',rsUsLog[0]);
        //this.validaTolerancias(rsUsLog[2])
        this.arrUslogin.map((t1:any) =>{t1.NombreCompleto= `${t1.nombre} ${t1.apellidoPaterno} ${t1.apellidoMaterno}`; t1.idUser=t1.idOcupantePuesto; t1.idEmpresa=Number(this.datSess[1]);  t1.idRoles=this.idRol; });
          this.servicios.getUnParametro('anticipos',this.id)      
            .pipe( catchError(err => {return throwError(err);  })
            ) .subscribe((antDato:any) => {
              console.log('anticipos',antDato);
              this.dataAnticipo=antDato;
                this.getUsuario(antDato.idUser,this.datSess[1]).subscribe(rsUs => {
                  console.log('rsUs[0]',rsUs[0]);
                  this.arrsesion=rsUs[0]; 
                  this.UsSuperior=rsUs[1][0];   
                  this.arrsesion.map((t1:any) =>{t1.NombreCompleto= `${t1.nombre} ${t1.apellidoPaterno} ${t1.apellidoMaterno}`; t1.idUser=t1.idOcupantePuesto; t1.idEmpresa=Number(this.datSess[1]); t1.idRoles=this.idRol;});
                  this.anticipo.nombre=this.arrsesion[0].NombreCompleto;          
                  console.log(this.UsSuperior)        
                  this.getDatos(this.datSess[1],this.arrsesion[0].idEstructura, antDato.idUser).subscribe(resp => {
                    this.MonedaL= resp[0];
                    this.TipoSol=resp[1];
                    this.CentroCosto=resp[2];
                    this.DatoPersonal=resp[3][0];
                    this.Empresas=resp[4];
                    this.DatFiscEmp=resp[5];
                    this.servicios.getUnParametro('catalogos','?catalogo=workflows&filtro1='+encodeURIComponent('idEmpresa='+this.datSess[1]))
                      .pipe().subscribe((res:any) => {
                        this.workInicial=res;
                        this.workInicial.map((t1: any) =>{t1.evento=JSON.parse(t1.evento)});
                        this.workFGral=this.workInicial;                        
                        this.Inicio(antDato);
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
  * @param {string} anticipos 
  * @returns Regresa el servicio Anticipos consultado correspondiente al idUser
  */Inicio(res:any){       
         this.Historia();  
           this.workOrigen=res.estatus;  
           this.anticipo = [res].map((t1:any) => ({  ...t1, ...this.arrsesion.find((t2: { idUser: any; }) => t2.idUser === t1.idUser) }) );
           this.anticipo.map((t1: any) =>{ 
             t1.diasDura=moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days')<0?0:
                         t1.idUsoFondos==1?moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days') + 1:moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days');
             t1.NombreCompleto=t1.NombreCompleto= `${t1.nombre} ${t1.apellidoPaterno} ${t1.apellidoMaterno}`;
             t1.fechaReg= moment(new Date(t1.createdAt)).format("MM/DD/YYYY");
           });          
           this.anticipo=this.anticipo[0]; 
           this.valida(this.anticipo);  
           this.FechaI = moment(new Date(this.anticipo.fechaIni)).add(1, 'days').format("YYYY-MM-DD"); 
           this.FechaF = moment(new Date(this.anticipo.fechaFin)).add(1, 'days').format("YYYY-MM-DD"); 
           // && dato.nombreRol==this.arrsesion[0].nombreRol
           if(this.anticipo.estatus!=="Aprobado"){   
             if(res.estatus =='Nuevo'){
              this.idWorkflow = this.workInicial.filter((dato: any) => dato.nombreObjeto == "Anticipo" && dato.estatusActual === res.estatus);
             } else{
              this.idWorkflow=this.workInicial.filter((dato:any) => dato.nombreObjeto=="Anticipo" &&  dato.evento.some((o2:any) => o2.siguienteEstatus === res.estatus));
             }          
             this.idWorkflow= this.idWorkflow.length > 0?this.idWorkflow[0].id:'';             
             this.workInicial = this.workInicial.filter((dato:any) => dato.estatusActual == this.anticipo.estatus && dato.nombreObjeto== "Anticipo")
             this.workInicial = this.workInicial.length>0?this.workInicial[0].evento:''; 
           } else {
             this.workInicial=[];
             this.bloqueoWf='0';
           }         
           this.anticipo.Moneda=!this.anticipo.Moneda?0:this.MonedaL.filter((mon:any) => mon.id == this.anticipo.idMoneda)[0].clave;
           this.anticipo.montoFormato=numberFormat2.format(this.anticipo.monto); 
           console.log('this.anticipo',this.anticipo);

           this.servicios.getUnParametro('anticiposgastos', `?idAnticipo=${this.anticipo.id}`)
             .pipe(catchError(err => {this.arrGastosGrd=[]; this.arrGastosOrig=[]; return throwError(err);})
             ).subscribe((gsto:any) => {
                this.servicios.getUnParametro('catalogos','?catalogo=vwTipoGastosEmpresaCosto&filtro1='+encodeURIComponent('idEmpresas='+this.arrsesion[0].idEmpresa+' and nivelEstructura='+this.arrsesion[0].nivelEstructura) )
                  .pipe(catchError(err => { return throwError(err);})
                  ).subscribe((tg:any) => {
                    gsto.map((t1:any)=> {
                      t1.idEmpresas=tg.filter((t:any) => t.idTipoGastos == t1.idTipoGasto)[0].idEmpresas;
                      t1.idTipoGastos=tg.filter((t:any) => t.idTipoGastos == t1.idTipoGasto)[0].idTipoGastos;
                      t1.montoDia=tg.filter((t:any) => t.idTipoGastos == t1.idTipoGasto)[0].montoDia;
                      t1.montoEvento=tg.filter((t:any) => t.idTipoGastos == t1.idTipoGasto)[0].montoEvento;
                      t1.montoMes=tg.filter((t:any) => t.idTipoGastos == t1.idTipoGasto)[0].montoMes;
                      t1.montoSemana=tg.filter((t:any) => t.idTipoGastos == t1.idTipoGasto)[0].montoSemana;
                      t1.nivelEstructura=tg.filter((t:any) => t.idTipoGastos == t1.idTipoGasto)[0].nivelEstructura;
                      t1.nombreGasto=tg.filter((t:any) => t.idTipoGastos == t1.idTipoGasto)[0].nombreGasto;
                      t1.diaCompleto=tg.filter((t:any) => t.idTipoGastos == t1.idTipoGasto)[0].diaCompleto;
                      t1.tipo=tg.filter((t:any) => t.idTipoGastos == t1.idTipoGasto)[0].tipo;
                      let valorMonto=t1.montoDia!=null?t1.montoDia:t1.montoEvento!=null?t1.montoEvento:t1.montoMes!=null?t1.montoMes:t1.montoSemana!=null?t1.montoSemana:0;
                      let montoTipo= t1.montoDia!=null?1:t1.montoEvento!=null?1:t1.montoMes!=null?moment(new Date(Date.now()), "YYYY-MM").daysInMonth():t1.montoSemana!=null?7:1;
                      t1.totalDia=valorMonto/montoTipo;
                     })
                     this.arrGastosGrd=gsto;
                     this.arrGastosOrig=gsto;
                     this.GastosL=gsto;
                    
                    this.GastosSol = new MatTableDataSource(funciones.uniqueBy(gsto,'idTipoGasto'));
                    this.GastosSol.paginator = this.paginator;
                    this.GastosSol.sort = this.sort;     
                  },
                  (err:any) => { });            
               },
               (err:any) => { }); 
             if(this.anticipo.rutaArchivo!=null){
              this.archivoPdfName=this.anticipo.rutaArchivo;
               this.servicios.getFile2('anticipos/download', this.anticipo.id)
                 .pipe(catchError(err => { 
                   console.log(err); 
                   return throwError(err);})
                 ).subscribe((pdf: Blob) => {
                   //this.FileUrl.readAsArrayBuffer(pdf);
                   this.FileUrl = URL.createObjectURL(pdf);
                   this.descarga=pdf;
                   console.log('PDF- ',this.FileUrl);
                   /*
                   
                   let a         = document.createElement('a');
                     a.href        = this.FileUrl; 
                     a.target      = '_blank';
                     a.download    = this.anticipo.rutaArchivo;
                     document.body.appendChild(a);
                     a.click();//*/            
                 },
                   (err:any) => { }, () => { }
                 ); 
             }
         
   }
 /**
 * @function
  * @name Historia 
  * Metodo  que consulta el servicio, para obtener el hisorial
  * @param {string} gastos 
  * @returns Regresa el arreglo Historial para Anticipos consultando el servicio correspondiente
  */
   Historia() {
     this.servicios.getUnParametro('anticipos',`${this.id}/historial` )      
     .pipe( catchError(err => {return throwError(err);  })
     ) .subscribe((hist:any) => {  
       hist.map((h:any)=>{ h.fechaRegistro=moment(h.fechaRegistro).format('YYYY-MM-DD HH:mm:ss') })
       hist.length>0?this.Historial = new MatTableDataSource(hist):this.Historial = new MatTableDataSource();
       this.Historial.paginator = this.paginatorh;
       this.Historial.sort = this.sorth;
     },() => {}        
     ); 
   }

   validaTolerancias(tolera:any){
    if(!tolera.diasInicio && !tolera.diasFin){
      this.FechaTolerancia = true ;
    } else{
      if(tolera.diasInicio){        
        this.FechaTolerancia = moment(Date.now()).isBetween(moment().startOf('month'), moment().startOf('month').add(tolera.diasInicio,'d'));
      } else{
        this.FechaTolerancia = moment(Date.now()).isBetween(moment().endOf('month').subtract(tolera.diasFin,'d'), moment().endOf('month'));
      }

    }
  }

  toleranciaVal(){
    let msj = this.tolerancia[0].diasInicio? `los primeros ${this.tolerancia[0].diasInicio} dias del siguiente mes.`:`los ultimos ${this.tolerancia[0].diasFin} dias del siguiente mes.`
    this.mensajes.mensaje(`Debe esperar hasta ${msj}`,'','zazz');    
  }
   
   ngAfterViewInit(): void {
     /*
     let factory = this.componentFactoryResolver.resolveComponentFactory(VisorPdfComponent);
     let ref = this.ViewContainerRef.createComponent(factory);
     ref.changeDetectorRef.detectChanges();
     //*/
   }
 
   visor(){
   }
 /**
 * @function
  * @name guardarAnticipos 
  * Metodo  que guarda la modificación de los inputs
  * @param {string} guardar 
  * @returns Regresa el arreglo guardar
  */
   guardarAnticipos() {
    if(moment(this.anticipo.fechaFin).format("YYYY-MM-DD") >= moment(this.anticipo.fechaIni).format("YYYY-MM-DD")){}else{ this.mensajes.mensaje('La fecha final no debe ser menor a la fecha inicial.','','zazz'); return false; };
     this.dialogService.openConfirmDialog('¿Esta seguro que desea guardar los cambios del anticipo?')
     .afterClosed().subscribe(res =>{
         if(res){
           let guardar={
             idUser: Number(this.anticipo.idUser),
             idCentrosCostos:Number(this.anticipo.idCentrosCostos),
             idUsoFondos: Number(this.anticipo.idUsoFondos),
             idEmpresa:Number(this.anticipo.idEmpresa),
             idProyecto:Number(this.anticipo.idProyecto),
             motivo: this.anticipo.motivo,
             fechaIni:this.anticipo.fechaIni,
             fechaFin:this.anticipo.fechaFin,
             //fechaIni:moment(new Date(this.FechaI)).format("yyyy-MM-DD") ,
             //fechaFin:moment(new Date(this.FechaF)).format("yyyy-MM-DD"),
             monto: Number(this.anticipo.monto),
             idMoneda: this.anticipo.idMoneda,
             estatus: this.anticipo.estatus
           }
           console.log(guardar);  
           let providers: Provider[] = []; 
           let arrListGst=this.arrGastosGrd;
           let arrListOrig=this.arrGastosOrig;
           console.log(arrListGst,'   -  ',arrListOrig);
            arrListGst.map((t1: any) =>{ 
             arrListOrig.map((t2:any) => {
              if(t2.id){
                if(t2.idTipoGasto===t1.idTipoGasto){
                  console.log(t2.id);
                  t1.id=t2.id;
                }
                //t1.id=t2.idTipoGasto===t1.idTipoGasto?t2.id:'';
              } 
              }) 
            });

            let arrAct:any[]=[], arrNuevo:any[]=[], arrBorrar:any[]=[];

          if(this.arrGastosOrig.length>0){
            arrAct=arrListGst;
            arrNuevo =  this.arrGastosGrd.filter((o1: { idTipoGasto: any; }) => !this.arrGastosOrig.some((o2: { idTipoGasto: any; }) => o1.idTipoGasto === o2.idTipoGasto));
            arrBorrar= this.arrGastosOrig.filter((o1: { idTipoGasto: any; }) => !this.arrGastosGrd.some((o2: { idTipoGasto: any; }) => o1.idTipoGasto === o2.idTipoGasto)); 
          }else{
            arrNuevo=this.arrGastosGrd;
          }
          //funciones.uniqueBy(gsto,'idTipoGasto')
          arrAct=funciones.uniqueBy(arrAct,'idTipoGasto');
          arrNuevo=funciones.uniqueBy(arrNuevo,'idTipoGasto');
          arrBorrar=funciones.uniqueBy(arrBorrar,'idTipoGasto');
           console.log(' - arrAct',arrAct);  
           console.log(' - arrNuevo',arrNuevo);  
           console.log(' - arrBorrar',arrBorrar); 
            
           if(arrNuevo.length > 0){
             this.servicios.putDatos(`anticipos/${this.anticipo.id}?idWorkflow=${this.idWorkflow}`, guardar)
             .pipe(  catchError(err => { return throwError(err);  })
             ) .subscribe( (ant:any) => {
               providers=arrNuevo;
               forkJoin(
                 providers.map(p =>
                   this.servicios.postMultiple(`anticiposgastos/?idAnticipo=${this.anticipo.id}`, p).pipe( catchError(err => {  return throwError(err); }) )
                 )).subscribe((p: Provider[][]) => {                  
                   if(arrBorrar.length > 0){
                      providers=[]; 
                      arrBorrar.map((Orig:any) =>{providers.push(Orig.id);});
                      console.log(providers);
                      forkJoin(
                          providers.map(p =>
                            this.servicios.deleteMultiple(`anticiposgastos/${p}?idAnticipo=${this.anticipo.id}`).pipe( catchError(err => { return throwError(err);  })  )
                          ) ).subscribe((p: Provider[][]) => {
                            if(arrAct.length > 0){
                              providers=[]; 
                              providers=arrAct.filter((t1:any) => Boolean(t1.id));                    
                              console.log('PUT 1 ',providers);
                              forkJoin(
                                providers.map((p: any) =>
                                  this.servicios.putMultiple(`anticiposgastos/${p.id}?idAnticipo=${this.anticipo.id}`, p).pipe( catchError(err => {  return throwError(err); }) )
                                )).subscribe((p) => {  
                                  this.mensajes.mensaje('Se guardo con exito la información.','','success');
                                  //this.router.navigate(['/anticipos']);
                                }); 
                            } else {
                              this.mensajes.mensaje('Se guardo con exito la información.','','success');
                              //this.router.navigate(['/anticipos']);
                            }
                        }); 
                   } else {
                      if(arrAct.length > 0){
                        providers=[]; 
                        providers=arrAct.filter((t1:any) => Boolean(t1.id));                     
                        console.log('PUT 2 ',providers);
                        forkJoin(
                          providers.map((p: any) =>
                            this.servicios.putMultiple(`anticiposgastos/${p.id}?idAnticipo=${this.anticipo.id}`, p).pipe( catchError(err => {  return throwError(err); }) )
                          )).subscribe((p) => {  
                            this.mensajes.mensaje('Se guardo con exito la información.','','success');
                            //this.router.navigate(['/anticipos']);
                          }); 
                      } else {
                        this.mensajes.mensaje('Se guardo con exito la información.','','success');
                        //this.router.navigate(['/anticipos']);
                      }
                   }
                 });     
               },
               (err:any) => {  },
               () => {}
             );
           } else {
            this.servicios.putDatos(`anticipos/${this.anticipo.id}?idWorkflow=${this.idWorkflow}`, guardar)
            .pipe(  catchError(err => { return throwError(err);  })
            ) .subscribe( (ant:any) => {   
              if(arrBorrar.length > 0){
                  providers=[]; 
                  arrBorrar.map((Orig:any) =>{providers.push(Orig.id);});
                  console.log(providers);
                  forkJoin(
                      providers.map(p =>
                        this.servicios.deleteMultiple(`anticiposgastos/${p}?idAnticipo=${this.anticipo.id}`).pipe( catchError(err => { return throwError(err);  })  )
                      ) ).subscribe((p: Provider[][]) => {
                        if(arrAct.length > 0){
                          providers=[]; 
                          providers=arrAct.filter((t1:any) => Boolean(t1.id));                    
                          console.log('PUT 3 ',providers);
                          forkJoin(
                            providers.map((p: any) =>
                              this.servicios.putMultiple(`anticiposgastos/${p.id}?idAnticipo=${this.anticipo.id}`, p).pipe( catchError(err => {  return throwError(err); }) )
                            )).subscribe((p) => {  
                              //this.router.navigate(['/anticipos']);
                              this.mensajes.mensaje('Se guardo con exito la información.','','success');
                            }); 
                        } else {
                          //this.router.navigate(['/anticipos']);
                          this.mensajes.mensaje('Se guardo con exito la información.','','success');
                        }
                    }); 
              } else {
                  if(arrAct.length > 0){
                    providers=[]; 
                    providers=arrAct.filter((t1:any) => Boolean(t1.id));                    
                    console.log('PUT 4 ',providers);
                    forkJoin(
                      providers.map((p: any) =>
                        this.servicios.putMultiple(`anticiposgastos/${p.id}?idAnticipo=${this.anticipo.id}`, p).pipe( catchError(err => {  return throwError(err); }) )
                      )).subscribe((p) => {  
                        //this.router.navigate(['/anticipos']);
                        this.mensajes.mensaje('Se guardo con exito la información.','','success');
                      }); 
                  } else {
                    //this.router.navigate(['/anticipos']);
                    this.mensajes.mensaje('Se guardo con exito la información.','','success');
                  }
              }
            }, (err:any) => { this.mensajes.mensaje('Hubo un error al guardar la información intente de nuevo.','','danger'); });
             
           } //*/
         } 
     });
   }
   /**
 * @function
  * @name cerrarAnticipos
  * Metodo que cierra el dialogo de confirmación para redireccionar a la pantalla anterior 
  * @returns {Boolean} Regresa un true o false 
  */
   cerrarAnticipos() {    
     this.dialogService.openConfirmDialog('  ¿Esta seguro desea regresar al listado de anticipos?')
       .afterClosed().subscribe(res =>{
         if(res){
           switch (window.sessionStorage.getItem("_origen")) {
             case 'edoCta':
               window.sessionStorage.setItem("_origen",'');
               this.router.navigate(['/estadocuenta']);              
               break;
             default:
               window.sessionStorage.setItem("_origen",'');
               this.router.navigate(['/anticipos']);
             break;
           }
         } else{ }
     });
   }
 
   getTotal() {
     return numberFormat2.format([this.anticipo].map(t => t.monto).reduce((acc: any, value: any) => acc + value, 0));
   }

   getMonto(monto:any) {
    return numberFormat2.format(Number(monto));
  }
 
   selGstoDialog  (action: string, obj: any) {
     obj.action = action;
     obj.dias = this.anticipo.diasDura;
     obj.ArrGastos=this.arrGastosGrd;
     const dialogRefs = this.dialogo.open(ListaGstoDialogContent, {
         panelClass: "dialog-exportar",   
         disableClose: true,
         data: obj,         
     });
     console.log(dialogRefs);
     dialogRefs.afterClosed().subscribe(result => {
       let suma=0;
       if(result.arreglo){   
        let resulta=moment(this.anticipo.fechaFin, 'YYYY-MM-DD').diff(moment(this.anticipo.fechaIni, 'YYYY-MM-DD'), 'days');
        this.anticipo.diasDura=resulta<0?0:resulta;
        this.anticipo.diasDura=isNaN(this.anticipo.diasDura)?0:this.anticipo.diasDura;       
        this.refactorizaGasto(result.arreglo);  
        this.valida(this.anticipo);
       } 
       console.log(result);
     });
   }
 
   filter(filterValue: string) {
     this.GastosSol.filter = filterValue.trim().toLowerCase();
   }
 
   cambiaWork(evento:any, arr:any){
    if(this.FechaTolerancia){
      if(moment(this.anticipo.fechaFin).format("YYYY-MM-DD") >= moment(this.anticipo.fechaIni).format("YYYY-MM-DD")){}else{ this.mensajes.mensaje('La fecha final no debe ser menor a la fecha inicial.','','zazz'); return false; };
        this.dialogService.openConfirmDialog('  ¿Esta seguro que desea cambiar al estatus '+(evento.source.selected as MatOption).viewValue+'?')
        .afterClosed().subscribe(res =>{
          let Workflow=this.workFGral;         
          if(res){
            let envEstatus={estatus:arr.estatus}
            this.idWorkflow=Workflow.filter((dato:any) => dato.nombreObjeto== "Anticipo" && dato.evento.some((o2:any) => o2.siguienteEstatus === evento.source.value)); 
            console.log((evento.source.selected as MatOption).viewValue, '  ----   ',evento.source.value);         
            this.servicios.patchDatos(`anticipos/${this.anticipo.id}?idWorkflow=${this.idWorkflow[0].id}`, envEstatus)
              .pipe(catchError(err => {console.log("ERROR"); return throwError(err);}))
              .subscribe((res:any) => {
                    console.log(res); 
                    console.log((evento.source.selected as MatOption).viewValue, '  -  ' , evento.source.value)
                    if(evento.source.value=='Por Aprobar'){
                      let nombreDirigidoa=this.arrsesion[0].NombreCompleto
                      let nombreSolicita=this.UsSuperior.nombre + ' ' + this.UsSuperior.apellidoPaterno + ' ' + this.UsSuperior.apellidoMaterno;
                      let correo=this.UsSuperior.email; // this.arrUslogin[0].email;//this.arrsesion[0].email // 'gerardo.mauriesr@gmail.com';                   
                      //this.enviaEmail((evento.source.selected as MatOption).viewValue, nombreDirigidoa, correo, nombreSolicita)  
                      this.enviaEmail('por Aprobar', nombreDirigidoa, correo, nombreSolicita)  
                    } else {
                      let nombreSolicita=this.arrUslogin[0].NombreCompleto
                      let nombreDirigidoa=this.arrsesion[0].NombreCompleto;
                      let correo=this.arrsesion[0].email; // 'gerardo.mauriesr@gmail.com';//this.arrsesion[0].email 
                      
                      let estatusW=(evento.source.selected as MatOption).viewValue=='Enviar A Correcciones'?'Corregir':
                                    (evento.source.selected as MatOption).viewValue=='Por Aprobar'?'por Aprobar':
                                    (evento.source.selected as MatOption).viewValue=='Aprobar'?'Aprobado':
                                    (evento.source.selected as MatOption).viewValue=='Rechazar'?'Rechazado':'';

                      //estatusW=(evento.source.selected as MatOption).viewValue=='Aprobar'?'Aprobado':(evento.source.selected as MatOption).viewValue              
                      this.enviaEmail(estatusW, nombreSolicita, correo, nombreDirigidoa) 
                    }
                    this.anticipo.estatus=arr.estatus;
                    this.bloqueo=this.anticipo.estatus=='Por Aprobar' || this.anticipo.estatus=='Aprobado'?false:true;
                    this.valida(this.anticipo);
                },
                (err:any) => {  });             
          } else{
            this.anticipo.estatus=this.workOrigen;
          }
      });
    } else{
      this.anticipo.estatus=this.workOrigen;
      this.toleranciaVal()
      return;
    }

    
   }

   /**
 * @function
  * @name cambiaMoneda
  * Metodo que habilita por cambio de moneda 
  * @returns  {Boolean} Regresa un true o false 
  */
    enviaEmail(tipo:any, nombreSolicita:any, correo:any, nombreDirigidoa:any){
      let total=this.getTotal()
      this.servicios.sendEmailNotification(
        correo,
        nombreDirigidoa,
        'Solicitud de aprobación de Anticipo',
        'Solicitud de aprobación',
        'Se le informa que <b>' + nombreSolicita +' </b>, requiere de su atención de un <b>Anticipo</b> con monto de '+total+' que se encuentra en estatus de ' + tipo,
        '',
        this.arrsesion[0].idEmpresa
      ).subscribe(results => { 
        this.mensajes.mensaje('Se ha enviado un correo a su superior jerarquico, al anticipo se encuentra ha cambiado a '+tipo+' con exito.', '', 'success');
      });
      console.log('Se le informa que <b>' + nombreSolicita +' </b>, requiere de su atención de un <b>Anticipo</b> con monto de '+total+' que se encuentra en estatus de ' + tipo)
     }


  /**
 * @function
  * @name cambiaMoneda
  * Metodo que habilita por cambio de moneda 
  * @returns  {Boolean} Regresa un true o false 
  */
   cambiaMoneda(evento:any, arr:any){
     this.anticipo.Moneda=(evento.source.selected as MatOption).viewValue; 
     this.anticipo.idMoneda=evento.value; 
     this.valida(this.anticipo);   
   }
     


  /**
 * @function
  * @name cambiaCC
  * Metodo que habilita por cambio de centro de costos 
  * @returns  {Boolean} Regresa un true o false 
  */
   cambiaCC(evento:any, arr:any){
     //this.anticipo.Moneda=(evento.source.selected as MatOption).viewValue; 
     this.anticipo.idCentrosCostos=evento.value;    
     this.valida(this.anticipo);
   }
  /**
 * @function
  * @name cambiaTipoSol
  * Metodo que habilita por cambio de Tipo de Solicitud 
  * @returns {Boolean} Regresa un true o false 
  */
   cambiaTipoSol(evento:any, arr:any){
     //this.anticipo.TipoSolicitud=(evento.source.selected as MatOption).viewValue; 
     this.anticipo.idUsoFondos=evento.value;    
     this.valida(this.anticipo);
   }
  /**
 * @function
  * @name generaPagare
  * Metodo que genera un Pagare PDF   
  * @returns  {Array.<string>} Regresa un Array 
  */
   generaPagare(){    
     let monedas;
     monedas=this.MonedaL.filter((m: any)=> this.anticipo.idMoneda==m.id); 
     let doc = new jsPDF('landscape', 'pt');
     doc.setLanguage("es-MX"); 
     
     doc.setFontSize(26);
     //doc.setFontStyle("bold");
     doc.text(15, 50, 'PAGARÉ');
     //doc.setFontType("normal");
     doc.setFontSize(12);
     doc.text(410, 40, 'No.     '+this.anticipo.id);
     doc.line(429, 42, 520, 42);
     doc.text(675, 40, ' '+numberFormat2.format(this.anticipo.monto) + ' '+ monedas[0].clave);
 
     doc.setFontSize(14);
     doc.rect(8, 15 , 820, 370);
     doc.text(580, 40, 'BUENO POR.');
     doc.rect(670, 22 , 145, 25);
 
     doc.setFontSize(12);
     doc.text(393, 80, 'Fecha.   '+moment(new Date(Date.now())).format("DD/MM/YYYY"));
     doc.line(429, 82, 520, 82);
 
     doc.setFontSize(12);
     doc.text(10, 120, `Debo y pagaré incondicionalmente por este pagaré a la orden de:         ${this.DatFiscEmp[0].razonSocial }` );
     doc.line(380, 122, 740, 122);
 
     doc.setFontSize(12);
     doc.text(10, 140, 'El día.                       '+ moment(new Date(Date.now())).add(20, 'd').format("DD/MM/YYYY"));
     doc.line(70, 142, 280, 142);
 
     doc.text(335, 140, 'En.                                   México');
     doc.line(380, 142, 630, 142);
     let cantidad=pesostexto.NumeroALetras(this.anticipo.monto);
     cantidad = monedas[0].clave=='MXN'?
                cantidad: monedas[0].clave=='USD'? 
                cantidad.split('PESOS').join('DOLARES'):monedas[0].clave=='EUR'? 
                cantidad.split('PESOS').join('EUROS'):monedas[0].clave=='YN'? 
                cantidad.split('PESOS').join('YENES'):'';
 
     doc.setFontSize(12);
     doc.text(10, 160, 'La Cantidad de :      '+ cantidad);
     doc.line(100, 162, 740, 162);
 
     doc.setFontSize(12);
     doc.text('Valor recibido a nuestra entera satisfacción. Aceptamos que en caso de no liquidar íntegramente la cantidad que ampara el presente pagaré, en el día aquí indicado, se causaran INTERESES MORATORIOS A RAZÓN DE 10% (DIEZ POR CIENTO) que se calcularan de manera mensual y en su caso, su proporción diaria y cotidiana sobre ella hasta la fecha exacta de su pago. para efecto del pago, ya sea del capital y(o los intereses que aquí se pactan, renunciamos de manera expresa a los beneficio de orden y excusión. cualquier controversia que se genere vinculada al presente título de crédito será ventilada en los tribunales competentes que señale la acreedora, renunciando expresamente a cualquier otra jurisdicción y/o competencia que pudiera corresponderle a los suscriptores en razón de su domicilio, o cualquier otra causa.', 
                         15,192, {maxWidth: 800, align: "justify"});
 
     doc.setFontSize(12);
     doc.text(40, 280, 'Nombre Deudor:     '+ this.anticipo.NombreCompleto );
     doc.line(135, 282, 400, 282);
 
     doc.text(76, 300, `Domicílio:     ${this.DatoPersonal.calle} #${this.DatoPersonal.numero} ${this.DatoPersonal.numero_int}`  );
     doc.line(135, 302, 400, 302);
 
     doc.text(76, 320, `Municipio:     ${this.DatoPersonal.municipio} ` );
     doc.line(135, 322, 400, 322);
 
     //doc.line(520, 342, 600, 342);
     doc.text(26, 340, `Entidad Federativa:     ${this.DatoPersonal.entidad}                                   CP: ${this.DatoPersonal.codigoPostal} `  );
     doc.line(135, 342, 460, 342);
 
     doc.text(570, 320, 'Firma:');  
     doc.text(690, 334, 'Acepto');  
     doc.line(610, 322, 800, 322);
 
     doc.save(`Pagare_Anticipo_${this.anticipo.id}.pdf`);
   }
 
   CalcDias(event: any, arr: any, origen:number){
     let resulta, suma=0; 
     switch (origen) {
       case 1:
         this.anticipo.fechaIni= moment(new Date(event.value)).format("yyyy-MM-DD")
         
         break;
       case 2:
         this.anticipo.fechaFin=moment(new Date(event.value)).format("yyyy-MM-DD");
         break;
     } // */
     if(moment(this.anticipo.fechaFin).format("YYYY-MM-DD") >= moment(this.anticipo.fechaIni).format("YYYY-MM-DD")){}else{this.anticipo.diasDura=0; this.mensajes.mensaje('La fecha final no debe ser menor a la fecha inicial.','','zazz');  };
     resulta=moment(this.anticipo.fechaFin, 'YYYY-MM-DD').diff(moment(this.anticipo.fechaIni, 'YYYY-MM-DD'), 'days'); 
     console.log('resulta',resulta);
     this.anticipo.diasDura=resulta<0?0:resulta;
     this.anticipo.diasDura=isNaN(this.anticipo.diasDura)?0:this.anticipo.diasDura;     
    
     if(this.arrGastosGrd){
        if(this.anticipo.diasDura>=0){
          //this.anticipo.diasDura=this.anticipo.diasDura==1?1: this.anticipo.diasDura + 1;
          console.log('++',this.arrGastosGrd)  
          console.log('++',this.anticipo.diasDura)
          this.refactorizaGasto(this.arrGastosGrd);
       }      
     }         
     
     this.valida(this.anticipo); 
   }

   borrarGasto(ev:any,sel:any){
      console.log(this.anticipo.diasDura ,'  -  ',this.arrGastosGrd,'  --- ',sel);
      let resulta=moment(this.anticipo.fechaFin, 'YYYY-MM-DD').diff(moment(this.anticipo.fechaIni, 'YYYY-MM-DD'), 'days');
      this.anticipo.diasDura=resulta<0?0:resulta;
      this.anticipo.diasDura=isNaN(this.anticipo.diasDura)?0:this.anticipo.diasDura;   
      this.refactorizaGasto(this.arrGastosGrd.filter((g:any)=> g.idTipoGasto!=sel.idTipoGasto));
    }

  refactorizaGasto(gsto:any){
    let diasIncompleto=this.anticipo.diasDura<=1?1:this.anticipo.diasDura -1;
    let suma=0;
    gsto.map((gt: any) =>{             
      let valor=0;
      if(gt.diaCompleto === 1 ){
        console.log('GT',gt);
        if(gt.montoDia!=null){
          valor=(this.anticipo.diasDura==0?1:this.anticipo.diasDura + 1)*gt.montoDia;
        }
        if(gt.montoEvento!=null){
          valor=gt.montoEvento;
        }
        if(gt.montoMes!=null){
          valor=gt.montoMes/Number(moment(new Date(Date.now()), "YYYY-MM").daysInMonth());
          valor=(this.anticipo.diasDura==0?1:this.anticipo.diasDura + 1)*valor;
        }
        if(gt.montoSemana!=null){              
          valor=gt.montoSemana/7;
          valor=(this.anticipo.diasDura==0?1:this.anticipo.diasDura + 1)*valor;
        }
        gt.dias=this.anticipo.diasDura==0?1:this.anticipo.diasDura + 1;
      } else {
        if(gt.montoDia!=null){
          //valor=diasIncompleto*gt.montoDia;
          valor=((this.anticipo.diasDura==0?0:this.anticipo.diasDura)*gt.montoDia);
          gt.dias=(this.anticipo.diasDura==0?0:this.anticipo.diasDura);
        }
        if(gt.montoEvento!=null){
          valor=gt.montoEvento;
          diasIncompleto=1;
          gt.dias=diasIncompleto;
        }
        if(gt.montoMes!=null){
          valor=gt.montoMes/Number(moment(new Date(Date.now()), "YYYY-MM").daysInMonth());     
          gt.dias=(this.anticipo.diasDura==0?0:this.anticipo.diasDura);     
        }
        if(gt.montoSemana!=null){              
          valor=gt.montoSemana/7;
          valor=(this.anticipo.diasDura==0?0:this.anticipo.diasDura)*valor;
          gt.dias=(this.anticipo.diasDura==0?0:this.anticipo.diasDura);
        }        
      }
      gt.monto=Number(valor);
      suma=suma+valor;
    });    
    this.anticipo.diasDura=this.anticipo.diasDura==0?1:this.anticipo.diasDura+1; 
    this.anticipo.monto=Number(this.anticipo.diasDura>0?suma:0).toFixed(2);
    this.anticipo.montoFormato=numberFormat2.format(this.anticipo.monto);
    this.arrGastosGrd=gsto;
    this.GastosSol = new MatTableDataSource(gsto);
   }
   
 /**
 * @function
  * @name cargaArchivo
  * Metodo que carga un archivo  
  * @returns -----
  */
   cargaArchivo(event: any) {
     if (event.target.files.length > 0) {
       this.archivoPagare = event.target.files[0];
       const formData = new FormData();
       this.archivoPdfName=this.archivoPagare.name;
       console.log(this.archivoPagare.name);
       formData.append('file',this.archivoPagare);     
       this.http.post(`${API}anticipos/upload/?anticipo_id=${this.anticipo.id}`, formData)
         .subscribe(res => {
           this.anticipo.rutaArchivo=res; 
           this.siPDF=true;  
           this.FileUrl = URL.createObjectURL(this.archivoPagare);
           this.anticipo.estatusPagare="Por aprobar";
           this.valida(this.anticipo);       
         })
     }
   }
 
   incrementZoom(amount: number) {
     this.zoom_to += amount;   
   }
 /**
 * @function
  * @name pdf
  * Metodo que descarga un archivo PDF   
  * @returns Regresa ---
  */
   pdf(){
     FileSaver.saveAs(this.descarga, this.anticipo.rutaArchivo + '_' + new  Date().getTime() + '.pdf');    
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
 
   enviar(){ };
 
   valida(event: any) {   
     this.btnGda='1'; 
     this.bloqueoWf='0';
     

     switch (this.anticipo.estatus) {
      case 'Por Aprobar':
      case 'Aprobado':
      case 'Pagado':
      case 'Rechazado':
      case 'Pagado Parcial':
        if(this.anticipo.estatus==='Por Aprobar' ){
          if(this.arrUslogin[0].idUser==this.anticipo.idUser){
           console.log('Por Aprobar - 1'); 
            this.bloqueo=false;
            this.bloqueoWf='0'; 
            this.btnGda='0'; 
          } else{
             this.bloqueo=false;
             this.bloqueoWf='1'; 
             this.btnGda='0'; 
          }  
        } else{ 
          this.bloqueo=false;
          this.bloqueoWf='1'; 
          this.btnGda='0'; 
          this.anticipo.estatusPagare="Aprobado";   
                 
        }          
        break;

      default:
        if(this.arrUslogin[0].idUser==this.anticipo.idUser){
          if(this.anticipo.rutaArchivo!=null){this.bloqueoWf='1';}else{ this.bloqueoWf='0';}; 
          if(this.anticipo.idMoneda > 0){}else{ return false;};
          if(this.anticipo.diasDura > 0){}else{ return false;};    
          if(this.anticipo.fechaIni!=null){}else{ return false;};
          if(this.anticipo.fechaFin!=null){}else{ return false;};      
          if(moment(this.anticipo.fechaFin).format("YYYY-MM-DD") > moment(this.anticipo.fechaIni).format("YYYY-MM-DD")){}else{ return false;};
          if(this.anticipo.idUsoFondos>0){}else{ return false;};
          if(this.anticipo.idCentrosCostos>0){}else{ return false;};
          if(this.anticipo.monto>0){}else{ return false;};   
          if(this.anticipo.motivo != ""){}else{ return false;};   
        } else{
          this.bloqueo=false;
          this.bloqueoWf='0'; 
          this.btnGda='0'
        }
      break;
    } 

    //  if(this.anticipo.estatus==='Por Aprobar' || this.anticipo.estatus==='Aprobado' || this.anticipo.estatus==='Pagado' || this.anticipo.estatus==='Rechazado'){
    //    if(this.anticipo.estatus==='Aprobado'  || this.anticipo.estatus==='Pagado' || this.anticipo.estatus==='Rechazado' || this.anticipo.estatus==='Pagado Parcial'){
    //     this.bloqueo=false;
    //     this.bloqueoWf='1'; 
    //     this.btnGda='0'; 
    //     this.anticipo.estatusPagare="Aprobado";
    //   } else{    
    //     if(this.arrUslogin[0].idUser==this.anticipo.idUser){
    //      console.log('Por Aprobar - 1'); 
    //       this.bloqueo=false;
    //       this.bloqueoWf='0'; 
    //       this.btnGda='0'; 
    //     } else{
    //        this.bloqueo=false;
    //        this.bloqueoWf='1'; 
    //        this.btnGda='0'; 
    //     }         
    //   }       

    //  } else{
    //   if(this.arrUslogin[0].idUser==this.anticipo.idUser){
    //     if(this.anticipo.rutaArchivo!=null){this.bloqueoWf='1';}else{ this.bloqueoWf='0';}; 
    //     if(this.anticipo.idMoneda > 0){}else{ return false;};
    //     if(this.anticipo.diasDura > 0){}else{ return false;};    
    //     if(this.anticipo.fechaIni!=null){}else{ return false;};
    //     if(this.anticipo.fechaFin!=null){}else{ return false;};      
    //     if(moment(this.anticipo.fechaFin).format("YYYY-MM-DD") > moment(this.anticipo.fechaIni).format("YYYY-MM-DD")){}else{ return false;};
    //     if(this.anticipo.idUsoFondos>0){}else{ return false;};
    //     if(this.anticipo.idCentrosCostos>0){}else{ return false;};
    //     if(this.anticipo.monto>0){}else{ return false;};   
    //     if(this.anticipo.motivo != ""){}else{ return false;};   
    //   } else{
    //     this.bloqueo=false;
    //     this.bloqueoWf='0'; 
    //     this.btnGda='0'
    //   }
    //  }
    
     /*
     if(this.anticipo.motivo != ""){}else{this.btnGda='0'; return false;};    
     if(this.anticipo.idMoneda > 0){}else{this.btnGda='0'; return false;};
     if(this.anticipo.diasDura > 0){}else{this.btnGda='0'; return false;};    
     if(this.anticipo.fechaIni!=null){}else{this.btnGda='0'; return false;};
     if(this.anticipo.fechaFin!=null){}else{this.btnGda='0'; return false;};      
     if(moment(this.anticipo.fechaFin).format("YYYY-MM-DD") > moment(this.anticipo.fechaIni).format("YYYY-MM-DD")){}else{this.btnGda='0'; return false;};
     if(this.anticipo.idUsoFondos>0){}else{this.btnGda='0'; return false;};
     if(this.anticipo.idCentrosCostos>0){}else{this.btnGda='0'; return false;};
     if(this.anticipo.monto>0){}else{this.btnGda='0'; return false;};    
     if(this.anticipo.rutaArchivo!=''){this.bloqueoWf='1';}else{this.btnGda='0'; return false;};
     //*/
     console.log(event);
   }
 
   step = 2;
   setStep(index: number) { this.step = index; }
   nextStep() { this.step++; }
   prevStep() { this.step--; }

   public getDatos (idempresa:any, idCC:any, usuario:any): Observable<any>  {
        let monedas=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=monedas`, { headers: headers });
        let tipoSolicitud=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=tipoSolicitud`, { headers: headers });
        let centrosCostos=this.http.get<any>(API+'catalogos/?catalogo=vwCentrosCostos&filtro1='+encodeURIComponent('idEstructura='+idCC+' and idEmpresas='+idempresa), { headers: headers });
        let datosUsr=this.http.get<any>(API+'catalogos/?catalogo=vwUsuariosDatos&filtro1='+encodeURIComponent('id='+usuario), { headers: headers });
        let empresas=this.http.get<any>(APIAdmin+'catalogo/?catalogo=empresas&filtro1='+encodeURIComponent('id='+idempresa), { headers: headers });
        let datfiscemp=this.http.get<any>(APIAdmin+'catalogo/?catalogo=empresasDatosFiscales&filtro1='+encodeURIComponent('idEmpresas='+idempresa), { headers: headers });
        return forkJoin([monedas,tipoSolicitud,centrosCostos,datosUsr,empresas,datfiscemp]);  
    } 

    public getUsuario (id:any,idempresa:any) : Observable<any>  {        
      let usuario=this.http.get<any>(API+'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1='+encodeURIComponent('idOcupantePuesto='+id+' and idEmpresas='+idempresa), { headers: headers });
      let superior = this.http.get<any>(API + 'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1=' + encodeURIComponent('idEstructura in (select idEstructuraPadre from gastos.vwEstructuraOrganizacionalEmpresa where idOcupantePuesto = ' + id + ')'), { headers: headers });
      let tolerancia = this.http.get<any>(API + 'catalogos/?catalogo=vwEmpresasToleranciasGastos&filtro1=' + encodeURIComponent('idEmpresas=' + idempresa), { headers: headers });
      return forkJoin([usuario,superior,tolerancia]);         
    }    
 }
 
 /**
  * componente para listar Gastos
  */
 @Component({
   selector: 'lista-gastos',
   templateUrl: 'lista-gastos.html',
 })
 /** El nombre del modulo ListaGstoDialogContent. */
 export class ListaGstoDialogContent { 
 
   @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
   displayedCol: string[] = ['select','id', 'descripcion'];
   local_data: any;
   arrsesion:any;
   action: string;
   arregloGastos:any[]=[]; 
   GastosL:any;
   /**
      * Consulta catálogos y servicios. 
      */
   constructor(public dialogRefs: MatDialogRef<ListaGstoDialogContent>,
     private servicios: serviciosService,    
     private servAnticipos: ServiceAnticipo, 
     @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
     @Optional() @Inject(MAT_DIALOG_DATA) public Lstg: any,
     @Optional() @Inject(MAT_DIALOG_DATA) public Gsol: any,
     private http: HttpClient,
     private token: TokenService
    ) {   
     let datSess:any=token.readToken('id','');
     datSess=datSess.split(',');
     this.local_data = { ...data };
     this.action = this.local_data.action;     
     this.getUsuario(datSess[0],datSess[1]).subscribe(rsUs => {
      this.arrsesion=rsUs[0];  
      this.arrsesion.map((t1:any) =>{t1.NombreCompleto= `${t1.nombre} ${t1.apellidoPaterno} ${t1.apellidoMaterno}`; t1.idUser=t1.idOcupantePuesto;});
     console.log(this.local_data);     
     this.servicios.getUnParametro('catalogos','?catalogo=vwTipoGastosEmpresaCosto&filtro1='+encodeURIComponent('idEmpresas='+datSess[1]+' and nivelEstructura='+this.arrsesion[0].nivelEstructura))
        .pipe(catchError(err => { return throwError(err);})
        ).subscribe((gsto:any) => {
          console.log('Gasto ',gsto);
          console.log(this.local_data.idUsoFondos);  
          switch (this.local_data.idUsoFondos) {
            case 1:
              this.GastosL=gsto.filter((t1:any)=>t1.tipo==="V" || t1.tipo==="A");           
              break;
            case 2:
              this.GastosL=gsto.filter((t1:any)=>t1.tipo==="C" || t1.tipo==="A")           
              break;
            default:
              this.GastosL=gsto;
            break;
          } 
          //gsto=this.local_data.idUsoFondos==1?gsto.filter((t1:any)=>t1.tipo=='V' && t1.tipo=='A'):this.local_data.idUsoFondos==2?gsto.filter((t1:any)=>t1.tipo=='C' && t1.tipo=='A'):gsto;
          console.log(this.GastosL);
          if(this.local_data.ArrGastos){
            this.GastosL.map((lst:any)=>{
              lst.selected=false; 
              for (let i = 0; i < this.local_data.ArrGastos.length; i++) {         
                if(this.local_data.ArrGastos[i].idTipoGasto===lst.idTipoGastos){   lst.selected=true;    } 
              }
            });
          } else{
            this.GastosL.map((lst:any)=>{ lst.selected=false; });
          }

          },
        (err:any) => { });
      }); 
   }
 
   agregaGasto(options: MatListOption[], evento:any) {
     let arrOpts=options.map(o => o.value);
     let arrGasto:any[]=[]; 
     arrOpts.map((Opts) =>{
       this.GastosL.find((gasto:any) => {
         if(Opts===gasto.idTipoGastos){
           let montoTipo= gasto.montoDia!=null?1:gasto.montoEvento!=null?1:gasto.montoMes!=null?moment(new Date(Date.now()), "YYYY-MM").daysInMonth():gasto.montoSemana!=null?7:1; 
           let monto=gasto.montoDia!=null?gasto.montoDia:gasto.montoEvento!=null?gasto.montoEvento:gasto.montoMes!=null?gasto.montoMes:gasto.montoSemana!=null?gasto.montoSemana:0; 
           arrGasto.push({
              idTipoGasto:gasto.idTipoGastos, 
              dias:this.local_data.dias, 
              monto:monto, comentarios:'', 
              nombreGasto:gasto.nombreGasto, 
              tipo:gasto.tipo,
              idUsoFondos:this.local_data.idUsoFondos,
              montoTipo:montoTipo,
              montoDia: gasto.montoDia,
              montoEvento: gasto.montoEvento,
              montoMes: gasto.montoMes,
              montoSemana: gasto.montoSemana,
              diaCompleto: gasto.diaCompleto
            });
         }
       })
     });
     console.log(arrGasto);
     this.arregloGastos=arrGasto;   
   }
 
   doAction() {
     let arrGasto:any[]=[];  
     if(this.arregloGastos.length==0){
       this.local_data.ArrGastos.map((Orig:any) =>{
         this.GastosL.find((gasto:any) => {          
           if(Orig.idTipoGasto===gasto.idTipoGastos){   
             let montoTipo= gasto.montoDia!=null?1:gasto.montoEvento!=null?1:gasto.montoMes!=null?moment(new Date(Date.now()), "YYYY-MM").daysInMonth():gasto.montoSemana!=null?7:1; 
             let monto=gasto.montoDia!=null?gasto.montoDia:gasto.montoEvento!=null?gasto.montoEvento:gasto.montoMes!=null?gasto.montoMes:gasto.montoSemana!=null?gasto.montoSemana:0; 
             arrGasto.push({
                idTipoGasto:gasto.idTipoGastos, 
                dias:this.local_data.dias, 
                monto:monto, comentarios:'', 
                nombreGasto:gasto.nombreGasto, 
                tipo:gasto.tipo,
                idUsoFondos:this.local_data.idUsoFondos,
                montoTipo:montoTipo,
                montoDia: gasto.montoDia,
                montoEvento: gasto.montoEvento,
                montoMes: gasto.montoMes,
                montoSemana: gasto.montoSemana,
                diaCompleto: gasto.diaCompleto
             });
            }
         })
       });
       console.log(arrGasto);
       this.arregloGastos=arrGasto; 
       this.dialogRefs.close({ event: this.action, data: this.local_data, arreglo:this.arregloGastos });
     }else{
       this.dialogRefs.close({ event: this.action, data: this.local_data, arreglo:this.arregloGastos });
     }
     
   }
 
   closeDialog() {
     this.dialogRefs.close({ event: 'Cancel' });
   }

   public getUsuario (id:any,idempresa:any) : Observable<any>  {        
    let usuario=this.http.get<any>(API+'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1='+encodeURIComponent('idOcupantePuesto='+id+' and idEmpresas='+idempresa), { headers: headers });
    return forkJoin([usuario]);         
  }
   
 }