/** Modulo Angular que Edita los Anticipos creados por los colaboradores.
 * @module 1. Estado de Cuenta
 * Estado-Cuenta.component.ts  
 */
 import { Component, OnInit, ViewChild, NgModule, Provider, ElementRef } from '@angular/core';
 import { MatTableDataSource, MatTable } from '@angular/material/table';
 import { MatPaginator } from '@angular/material/paginator';
 import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
 import { DatePipe } from '@angular/common';
 import { FormControl, FormGroupDirective, NgForm} from '@angular/forms';
 import { MatSort, Sort } from '@angular/material/sort';
 import { ErrorStateMatcher } from '@angular/material/core';
 import { Title } from '@angular/platform-browser';
 import { Router, NavigationEnd, ActivatedRoute, Data } from '@angular/router';
 import { catchError,filter, map, mergeMap } from 'rxjs/operators';
 import { forkJoin, Observable, Subscription, throwError } from 'rxjs';
 import { DataService } from "../Genericos/data.service";
 import { serviciosService } from 'src/app/Genericos/servicios/servicios.service';
 import { HttpClient, HttpHeaders } from '@angular/common/http';
 import { environment } from '../../environments/environment';
 import { TokenService } from '../auth/token/token.service';
 const APIAdmin= environment.ApiUrlAdmin;
 const API = environment.ApiUrl; 
 const headers = new HttpHeaders    
 headers.append('Content-type', 'applicartion.json') 
 import * as _moment from 'moment';
 declare var jQuery: any;
 import * as FileSaver from 'file-saver';
 declare const require: any;
 const { jsPDF } = require("jspdf");
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
  * componente Principal para listar Estado de Cuenta
  */
 @Component({
   selector: 'app-Estado-Cuenta',
   templateUrl: './Estado-Cuenta.component.html',
   styleUrls: ['./Estado-Cuenta.component.scss']
 })
 /** El nombre del modulo EstadoCuentaComponent */
 export class EstadoCuentaComponent implements OnInit {
   @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
   searchText: any;

   arrsesion: any;
   arrsuperior: any;
   ecuenta!: any;
   CentroCosto:any;
   Empresas:any;
   MonedaL:any;
   TipoSol:any;
   Proyectos:any;
   anticipoList!: MatTableDataSource<any>;
   edo:string='EDO';  
   idRol:any;
   datSess:any; 
   displayedColumns: string[] = ['id','createdAt', 'descripcion', 'motivo', 'fechaIni', 'fechaFin', 'estatus', 'monto', 'tipo'];//,'diasDura'
   displayedRepColumns: string[] = ['id','motivo','fechaIni','fechaFin','monto','montoAprobado','tipo','estatus'];
   displayedDevColumns: string[] = ['id','createdAt','monto','tipo','estatus'];//,'createdAt','monto','tipo','estatus'
   displayedRemColumns: string[] = ['id','createdAt','monto','tipo','estatus'];//,'createdAt','monto','tipo','estatus'
   reporteList!: MatTableDataSource<any>;
   devList!:MatTableDataSource<any>;
   remList!:MatTableDataSource<any>;
   @ViewChild(MatSort) sort: MatSort = Object.create(null);
   @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
   @ViewChild('EdoCtaG') EdoCtaG!: ElementRef;
   @ViewChild('EdoCta') EdoCta!: ElementRef;
   @ViewChild('EdoCta1') EdoCta1!: ElementRef;
   @ViewChild('EdoCta2') EdoCta2!: ElementRef;
   @ViewChild('EdoCta3') EdoCta3!: ElementRef;
   @ViewChild('EdoCta4') EdoCta4!: ElementRef;
   @ViewChild('EdoCtaT') EdoCtaT!: ElementRef;
   
 
   pageInfo: Data = Object.create(null);
   /**
      * Consulta catálogos y servicios.
      * 
      * 
      */
   constructor(public dialog: MatDialog, 
     private servicios: serviciosService,
     public datePipe: DatePipe,
     private router: Router,
     private activatedRoute: ActivatedRoute,
     private datosPaso: DataService,
     private titleService: Title,
     private http: HttpClient,
     private token: TokenService) { 
      this.datSess=token.readToken('id','');
      this.datSess=this.datSess.split(','); 
      this.idRol=token.readToken('rlsRol','GASTOS'); 
      this.ecuenta={
        iduser:0,
        nombre:'',
        paterno:'',
        materno:'',
        idnomina:'',
        idEmpresa:0,
        idProyecto:0,  
        idCentrosCostos:0, 
        totalAnticipos:0,  
        totalAnticiposPag:0,
        totalComprobado:0,
        totalDevolucion:0,  
        totalReembolso:0, 
        totalReporte:0,  
        totalPagado:0,
        totalporPagar:0, 
        totalSaldo:0,                                
      }      
       //Breadcrumb
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


       this.getUsuario(this.datSess[0],this.datSess[1]).subscribe(rsUs => {
          this.arrsesion=rsUs[0];    
          this.arrsuperior=rsUs[1];  
          this.arrsesion.map((t1:any) =>{t1.NombreCompleto= `${t1.nombre} ${t1.apellidoPaterno} ${t1.apellidoMaterno}`; t1.idUser=t1.idOcupantePuesto; t1.idEmpresa=Number(this.datSess[1]);  t1.idRoles=this.idRol; });
          console.log(this.arrsuperior)
          this.getDatos(this.datSess[1],this.arrsesion[0].nivelEstructura,this.arrsesion[0].idUser).subscribe(resp => {
            this.MonedaL= resp[0];
            this.TipoSol=resp[1];         
            this.CentroCosto=resp[2];
            this.Empresas=resp[3];
            this.Proyectos=resp[4];            
            this.ecuenta={
              iduser:this.arrsesion[0].idUser,
             // nombre:`${this.arrsesion[0].Nombre} ${this.arrsesion[0].Paterno} ${this.arrsesion[0].Materno}`,
              nombre:this.arrsesion[0].nombre,
              paterno:this.arrsesion[0].apellidoPaterno,
              materno:this.arrsesion[0].apellidoMaterno,
              idnomina:this.arrsesion[0].idUser,
              idEmpresa:this.arrsesion[0].idEmpresa,
              idProyecto:this.Proyectos.length>0?this.Proyectos[0].idProyecto:0,  
              idCentrosCostos:this.CentroCosto.length>0?this.CentroCosto[0].idCentrosCostos:0, 
              descripcionCentrosCostos:this.arrsesion[0].descripcionCentroCostos, 
              descripcionEstructura:this.arrsesion[0].descripcionEstructura,
              puesto:this.arrsesion[0].descripcionPuesto, 
              jefeDirecto:`${this.arrsuperior[0].nombre} ${this.arrsuperior[0].apellidoPaterno} ${this.arrsuperior[0].apellidoMaterno}`,
              totalAnticipos:0,  
              totalAnticiposPag:0,
              totalComprobado:0,
              totalDevolucion:0,  
              totalReembolso:0, 
              totalReporte:0,  
              totalPagado:0,
              totalporPagar:0, 
              totalSaldo:0,                                
            };

            this.ecuenta=[this.ecuenta].map( (t1:any) => ({ 
              ...t1, ...this.CentroCosto.find((t2: any) => t2.idCentrosCostos === this.ecuenta.idCentrosCostos),
              ...t1, ...this.Proyectos.find((t2: any) => t2.idProyecto === this.ecuenta.idProyecto) 
            }))
            this.ecuenta=this.ecuenta[0] ;

            console.log('this.ecuenta',this.ecuenta);
            this.Inicio();
          }); 
        });    
   }
         /**
 * @function
  * @name Inicio
  * Metodo principal que consulta los servicios, anticipos, reportes, devoluciones, reembolsos y gastos 
  * @returns {Array.<string>} Regresa varios array correspondientes a cada petición
  */
   Inicio(){
     //Anticipo
     this.servicios.getUnParametro('catalogos','?catalogo=anticiposFondos&filtro1='+encodeURIComponent(`idEmpresa=${this.datSess[1]} AND idUser=${this.datSess[0]}  AND estatus IN ('Pagado','Pagado Parcial','Aprobado')`))
     //this.servicios.getUnParametro('anticipos', '?idEmpresa='+this.datSess[1])
     .pipe( catchError(err => { this.anticipoList = new MatTableDataSource(); return throwError(err); }) )
     .subscribe(
       (ant:any) => {
         let anticipoListData = ant.map(
           (t1:any) => ({ ...t1, ...this.arrsesion.find((t2: { idUser: any; }) => t2.idUser === t1.idUser) }) ) 
         anticipoListData.map((t1:any) =>{
           this.ecuenta.totalAnticipos=t1.estatus == 'Aprobado'?this.ecuenta.totalAnticipos+t1.monto:this.ecuenta.totalAnticipos+0; 
           this.ecuenta.totalAnticiposPag=t1.estatus == 'Pagado' || t1.estatus == 'Pagado Parcial'?this.ecuenta.totalAnticiposPag+t1.monto:this.ecuenta.totalAnticiposPag+0;
           t1.moneda=this.MonedaL.filter((mon:any) => mon.id == t1.idMoneda)[0].clave;
           t1.descripcion=this.TipoSol.filter((tipo:any) => tipo.id == t1.idUsoFondos)[0].descripcion;
           t1.diasDura=moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days')<0?0:moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days');
         }) ;
         console.log('moneda',anticipoListData);
         this.anticipoList = new MatTableDataSource(anticipoListData);
         //this.anticipoList.paginator = this.paginator!;
         this.anticipoList.sort = this.sort;
         const sortState: Sort = {active: 'createdAt', direction: 'desc'};
         this.sort.active = sortState.active;
         this.sort.direction = sortState.direction;
         this.sort.sortChange.emit(sortState);
         //this.ecuenta.totalComprobado=this.anticipoList.data.map((t:any) => t.monto).reduce((acc: any, value: any) => acc + value, 0);
         //Reportes  
         this.servicios.getUnParametro('catalogos','?catalogo=reportesGastos&filtro1='+encodeURIComponent(`idEmpresa=${this.datSess[1]} AND idUser=${this.datSess[0]} AND estatus IN ('Aprobado')`))
         //this.servicios.getUnParametro('reportes', '?idEmpresa='+this.datSess[1])
         .pipe(
             catchError(err => { this.reporteList = new MatTableDataSource(); return throwError(err); })
         )
         .subscribe(
           (rep:any) => {
             let reporteListData= rep.map(
               (t1: { idUser: any; idMoneda: any; idUsoFondos: any;  diasDura: any; fechaIni: any; fechaFin: any;}) => ({
                   ...t1, ...this.arrsesion.find((t2: { idUser: any; }) => t2.idUser === t1.idUser),
                   //...t1, ...this.MonedaL.find((t2: { idMoneda: any; }) => t2.idMoneda === t1.idMoneda),
                   ...t1, ...this.TipoSol.find((t2: { idUsoFondos: any; }) => t2.idUsoFondos === t1.idUsoFondos)
                 })
               ) 
               console.log("&& - ", reporteListData)
               reporteListData.map((t1:any) =>{
                 this.ecuenta.totalReporte=t1.estatus=="Aprobado"?this.ecuenta.totalReporte+t1.monto:this.ecuenta.totalReporte+0; 
                 t1.idMoneda='MXN'; 
                 t1.moneda=this.MonedaL.filter((mon:any) => mon.clave == t1.idMoneda)[0].clave;
                 t1.diasDura=moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days')<0?0:moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days')}) ;
 
             console.log('Reportes',reporteListData);
 
             this.reporteList = new MatTableDataSource(reporteListData);
             //this.reporteList.paginator = this.paginator!;
             this.reporteList.sort = this.sort;
             const sortState: Sort = {active: 'createdAt', direction: 'desc'};
             this.sort.active = sortState.active;
             this.sort.direction = sortState.direction;
             this.sort.sortChange.emit(sortState);
 
             //Devoluciones
             this.servicios.getUnParametro('catalogos','?catalogo=devoluciones&filtro1='+encodeURIComponent(`idEmpresa=${this.datSess[1]} AND idUser=${this.datSess[0]} AND estatus IN ('Aprobado')`))            
             .pipe( catchError(err => { this.devList = new MatTableDataSource(); return throwError(err); })) .subscribe(
               (dev:any) => {
                 let devListData= dev;
                 dev.map((t1:any) =>{
                   this.ecuenta.totalDevolucion=this.ecuenta.totalDevolucion+t1.monto;
                   t1.moneda=this.MonedaL.filter((mon:any) => mon.clave == t1.idMoneda)[0].clave; 
                 });           
                 console.log('Devoluciones',devListData);
                 this.devList = new MatTableDataSource(devListData);
                 //this.devList.paginator = this.paginator!;
                 this.devList.sort = this.sort;
                 const sortState: Sort = {active: 'createdAt', direction: 'desc'};
                 this.sort.active = sortState.active;
                 this.sort.direction = sortState.direction;
                 this.sort.sortChange.emit(sortState);                   
                 //Reembolsos

                 this.servicios.getUnParametro('catalogos','?catalogo=reembolsos&filtro1='+encodeURIComponent(`idEmpresa=${this.datSess[1]} AND idUser=${this.datSess[0]}`))
                 .pipe(
                     catchError(err => { this.remList = new MatTableDataSource(); return throwError(err); })
                 )
                 .subscribe(
                   (reem:any) => {
                     console.log('Reembolso', reem);
                     let remListData= reem;
                     reem.map((t1:any) =>{
                       this.ecuenta.totalReembolso=this.ecuenta.totalReembolso+t1.monto;
                       this.ecuenta.totalPagado=t1.estatus == 'Pagado' || t1.estatus == 'Pagado Parcial'?this.ecuenta.totalPagado+t1.monto:this.ecuenta.totalPagado+0;
                       this.ecuenta.totalporPagar=t1.estatus != 'Pagado' && t1.estatus != 'Pagado Parcial'?this.ecuenta.totalporPagar+t1.monto:this.ecuenta.totalporPagar+0;
                       
                       t1.moneda=this.MonedaL.filter((mon:any) => mon.id == Number(t1.idMoneda))[0].clave;
                     }) ;
                     console.log('Reembolsos',remListData);
                     this.remList = new MatTableDataSource(remListData);
                     //this.remList.paginator = this.paginator!;
                     this.remList.sort = this.sort;
                     const sortState: Sort = {active: 'createdAt', direction: 'desc'};
                     this.sort.active = sortState.active;
                     this.sort.direction = sortState.direction;
                     this.sort.sortChange.emit(sortState);
                     let montocomp = 0;

                     this.servicios.getUnParametro('catalogos','?catalogo=gastos&filtro1='+encodeURIComponent(`idEmpresa=${this.datSess[1]} AND idUser=${this.datSess[0]} AND montoAprobado > 0`)) 
                     //this.servicios.getUnParametro('gastos', '?idEmpresa='+this.datSess[1])
                       .pipe(
                           catchError(err => {  return throwError(err); })
                       )
                       .subscribe(
                         (gst:any) => {
                           console.log('GASTOS',gst);
                           let providers: Provider[] = [];  
                           let providersNo: Provider[] = [];   
                           gst.map((obj:any) =>{                            
                             switch (obj.idTipoComprobante) {
                               case 1:
                                 if(obj.rutaXml!=null){
                                   providers.push(obj.id);
                                 }
                                 break;
                               case 2:                  
                                 if(obj.rutaArchivo!=null){
                                   providersNo.push(obj.id);
                                 }                  
                                 break;
                             }  
                             montocomp += obj.total; 
                             this.ecuenta.totalComprobado=this.ecuenta.totalComprobado+obj.montoAprobado;                           
                           });
                           this.ecuenta.totalComprobado=Number(this.ecuenta.totalComprobado).toFixed(2);
                           //this.ecuenta.totalComprobado=!montocomp?0:Number(montocomp).toFixed(2); 

                           this.ecuenta.totalSaldo = this.ecuenta.totalReembolso - this.ecuenta.totalDevolucion
                           
 
                           console.log(providers);
                           console.log(providersNo);
                           if(providers.length>0){          
                             forkJoin(
                               providers.map(c =>
                                 this.servicios.getUnParametro('gastos', `${c}/comprobante`)   
                               )).subscribe((c: Provider[][]) => {
                                 console.log('1***********-------------comprobante',c);
                                //  c.map((e:any)=>{if(e.importeTotal){ montocomp += e.importeTotal;}  });
                                //  this.ecuenta.totalComprobado=!montocomp?0:Number(montocomp).toFixed(2);  
                                 if(providersNo.length>0){
                                   forkJoin(
                                     providersNo.map(n =>
                                       this.servicios.getUnParametro('gastosnofiscales', `?idGasto=${n}`)   
                                     )).subscribe((n: Provider[][]) => {
                                       console.log('1************--------------gastosnofiscales',n);
                                       n.map((sinc:any) => { 
                                         sinc.forEach((nof:any) => {
                                          if(nof.importeTotal){ montocomp += nof.importeTotal;}                                          
                                         });
                                       });
                                      //  this.ecuenta.totalComprobado=!montocomp?0:Number(montocomp).toFixed(2);
                                       },
                                       (err:any) => {  }); 
                                 }
                               },
                               (err:any) => {  });     
                             } else {
                               forkJoin(
                                 providersNo.map(n =>
                                   this.servicios.getUnParametro('gastosnofiscales', `?idGasto=${n}`)   
                                 )).subscribe((n: Provider[][]) => {
                                   console.log('2**********-----------gastosnofiscales',n);
                                   n.map((sinc:any) => { 
                                     sinc.forEach((nof:any) => {
                                      if(nof.importeTotal){ montocomp += nof.importeTotal;}                                          
                                     });
                                   });
                                  //  this.ecuenta.totalComprobado=!montocomp?0:Number(montocomp).toFixed(2);                                  
                                   },
                                   (err:any) => {  }); 
                             }
                         },
                         (err:any) => {  });  
                   },
                   (err:any) => {  }); 
               },
               (err:any) => {  });
           },
           (err:any) => {  });
        },
       (err:any) => {  } );  
   }


         /**
 * @function
  * @name irA
  * Metodo para especificar el origen y redireccionar a otro componente 
  *
  */
   irA(){
     window.sessionStorage.setItem("_origen",'edoCta');
   }
 
   step = 0;
 
   setStep(index: number) {
     this.step = index;
   }
 
   nextStep() {
     this.step++;
   }
 
   prevStep() {
     this.step--;
   }

   ngOnInit() { 
   }

   getMonto(monto:any) {
    return numberFormat2.format(Number(monto));
  }
 
   exportar(){
    let data = this.EdoCta.nativeElement;
    let data1 = this.EdoCta1.nativeElement;
    let data2 = this.EdoCta2.nativeElement;
    let data3 = this.EdoCta3.nativeElement;
    //let data4 = this.EdoCta4.nativeElement;     
    let dataG = this.EdoCtaG.nativeElement; 
    let dataT = this.EdoCtaT.nativeElement;
    let todos=' <br> <b>ESTADO_DE_CUENTA</b>' +dataG.innerHTML +
              ' <br> <b>Anticipos</b>' +data.innerHTML +
              ' <br><b>Devoluciones</b>' +data1.innerHTML+
              ' <br><b>Reembolsos</b>' +data2.innerHTML+
              ' <br><b>Reporte_Gastos</b>' +data3.innerHTML+
              ' <br><b>Totales</b>' +dataT.innerHTML;

    let options : any = {
      orientation: 'p',
      unit: 'px',
      format: 'a0',
      };
    let doc = new jsPDF(options);
     doc.html(todos, {
      callback: function (doc:any) {
            doc.save('Estado_Cuenta_'+ new  Date().getTime() +'.pdf');
          },
      margin:30,
      x: 50,
      y: 30
    });

   }

   public getDatos (idempresa:any, idCC:any, usuario:any): Observable<any>  {
    let monedas=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=monedas`, { headers: headers });
    let tipoSolicitud=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=tipoSolicitud`, { headers: headers });
    let centrosCostos=this.http.get<any>(API+'catalogos/?catalogo=vwCentrosCostos&filtro1='+encodeURIComponent('idEstructura='+idCC+' and idEmpresas='+idempresa), { headers: headers });
    let empresas=this.http.get<any>(APIAdmin+'catalogo/?catalogo=empresas&filtro1='+encodeURIComponent('id='+idempresa), { headers: headers });
    let proyectos=this.http.get<any>(API+'catalogos/?catalogo=vwProyectos&filtro1='+encodeURIComponent('nivelEstructura='+idCC+' and idEmpresas='+idempresa), { headers: headers });
    let tipoGastos=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=tipoGastos&filtro1=idEmpresas=${idempresa}`, { headers: headers });
    let formasPagos=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=formasPago`, { headers: headers }); 
    return forkJoin([monedas,tipoSolicitud,centrosCostos,empresas,proyectos,tipoGastos,formasPagos]);  
  } 

  public getUsuario (id:any,idempresa:any) : Observable<any>  {        
    let usuario=this.http.get<any>(API+'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1='+encodeURIComponent('idOcupantePuesto='+id+' and idEmpresas='+idempresa ), { headers: headers });
    let superior = this.http.get<any>(API + 'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1=' + encodeURIComponent('idEstructura in (select idEstructuraPadre from gastos.vwEstructuraOrganizacionalEmpresa where idOcupantePuesto = ' + id + ')'), { headers: headers });
    return forkJoin([usuario,superior]);         
  }

}
 /**
  * componente para exportar a html
  */
 @Component({
   // tslint:disable-next-line: component-selector
   selector: 'exportar',
   templateUrl: 'exportar.html',
 })
 // tslint:disable-next-line: component-class-suffix
 /** El nombre del modulo ListaGstoDialogContent. */
 export class ExportarDialogContent {
 
   @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
   searchText: any;
   /**
      * MAT_DIALOG_DATA
      * 
      * 
      */
       constructor(public datePipes:DatePipe,
       public dialogo: MatDialog, 
       public dialogRef: MatDialogRef<any> ) {      
   }
 
   doAction() {
       this.dialogRef.close({});
   }
 
   closeDialog() {
       this.dialogRef.close({ event: 'Cancel' });
   }  
 
 }
 
 