/** Modulo Angular que muestra un listado con devoluciones 
 * @module 1. Edita Reembolsos
 * reembolso-edita.component.ts  
 */

 import { Component, OnInit, ViewChild } from '@angular/core';
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

 import { TokenService } from '../../../auth/token/token.service';
 import { HttpClient, HttpHeaders} from '@angular/common/http';
 import { environment } from '../../../../environments/environment';

 const API = environment.ApiUrl;
 const APIAdmin= environment.ApiUrlAdmin;
 const headers = new HttpHeaders    
 headers.append('Content-type', 'applicartion.json')
 const options2 = { style: 'currency', currency: 'MXN' };
 const numberFormat2 = new Intl.NumberFormat('es-MX', options2); 
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
   * componente Principal para listar y editar los reembolsos 
   */
 @Component({
   //selector: 'app-edit-gastos',
   templateUrl: './reembolso-edita.component.html',
   styleUrls: ['./reembolso-edita.component.css']
 })
  /** El nombre del modulo EditaReembolsosComponent */
 
 export class EditaReembolsosComponent implements OnInit {
   Reembolso:any;
   reporte:any;
   arrsesion: any;
   TipoSol:any;
   CentroCosto:any;
   TipoComprobante:any;
   Proyectos:any;
   Empresas:any;
   Tipogasto:any;
   workInicial: any;
   workOrigen!:string;
   idWorkflow:any;
   reembolsoArr:any;
   bloqueo:boolean=true;
   btnGda:string='1';
   Historial:any;
   origen:number=0;
   id:any;

   idRol:any;
   datSess:any;
   arrUslogin:any;  
   dataReemb!:any;
   DatoPersonal:any;
   workFGral:any;

   histColumns: string[] = ['fechaRegistro', 'idUser', 'evento', 'estatus', 'comentarios'];
    
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatSort) sort: MatSort = Object.create(null);
  searchText: any;
  displayedCol: string[] = ['select','id', 'descripcion'];
  dataSource = new MatTableDataSource();
  selection = new SelectionModel<any>(true, []);
  /**
   * Consulta catálogos y servicios.
   * 
   * 
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
     private token: TokenService
     ) { 

      this.Historial = new MatTableDataSource();
      this.datSess=token.readToken('id','');
      this.datSess=this.datSess.split(',');
      this.id = activatedRouter.snapshot.paramMap.get('id');
      this.idRol=token.readToken('rlsRol','GASTOS');
      this.reembolsoArr={estatus: null}; 
      this.reporte=[];

      this.getUsuario(this.datSess[0],this.datSess[1]).subscribe(rsUsLog => {
        this.arrUslogin=rsUsLog[0];    
        this.arrUslogin.map((t1:any) =>{t1.NombreCompleto= `${t1.nombre} ${t1.apellidoPaterno} ${t1.apellidoMaterno}`; t1.idUser=t1.idOcupantePuesto; t1.idEmpresa=Number(this.datSess[1]);  t1.idRoles=this.idRol; });
        this.servicios.getUnParametro('reembolsos',this.id )      
            .pipe( catchError(err => {return throwError(err);  })
            ) .subscribe((reemDato:any) => {
              console.log(reemDato);
                this.reembolsoArr=reemDato;
                this.getUsuario(reemDato.idUser,this.datSess[1]).subscribe(rsUs => {
                  console.log('rsUs[0]',rsUs[0]);
                  this.arrsesion=rsUs[0];    
                  this.arrsesion.map((t1:any) =>{t1.NombreCompleto= `${t1.nombre} ${t1.apellidoPaterno} ${t1.apellidoMaterno}`; t1.idUser=t1.idOcupantePuesto; t1.idEmpresa=Number(this.datSess[1]); t1.idRoles=this.idRol;});
                  this.reporte.nombre=this.arrsesion[0].NombreCompleto;                  
                  this.getDatos(this.datSess[1],this.arrsesion[0].idEstructura, reemDato.idUser).subscribe(resp => {                   
                    this.TipoSol=resp[0];
                    this.CentroCosto=resp[1];
                    this.DatoPersonal=resp[2][0];
                    this.Empresas=resp[3];
                    this.servicios.getUnParametro('catalogos','?catalogo=workflows&filtro1='+encodeURIComponent('idEmpresa='+this.datSess[1]))
                      .pipe().subscribe((res:any) => {
                        this.workInicial=res;
                        this.workInicial.map((t1: any) =>{t1.evento=JSON.parse(t1.evento)});
                        this.workFGral=this.workInicial;
                        this.Inicio(reemDato);
                    }); 
                  });
                });
            });  
      });
   }
   ngOnInit(): void { }
  /**
   * @function
   * @name Inicio 
   * Metodo principal que inicia el consumo del servicio
   * @param {string} reembolsos 
   * @returns {Array.<string>} Regresa el servicio reembolsos consultado correspondiente al idUser
   */
   Inicio(res:any){
    this.Historia();      
      this.workOrigen=res.estatus;  
      this.reporte = [res].map((t1:any) => ({  ...t1, ...this.arrsesion.find((t2: { idUser: any; }) => t2.idUser === t1.idUser) }) );
      this.reporte=this.reporte[0];
      this.reporte.montoFormato=numberFormat2.format(this.reporte.monto); 
      this.reporte.fechaReg= moment(new Date(this.reporte.createdAt)).format("MM/DD/YYYY");
      
      if(this.reporte.estatus!=="Aprobado"){            
        this.idWorkflow=this.workInicial.filter((dato:any) => dato.nombreObjeto=="Pagos de Anticipos y reembolsos" &&  dato.evento.some((o2:any) => o2.siguienteEstatus === res.estatus));
        this.idWorkflow= this.idWorkflow[0].id;
        this.workInicial = this.workInicial.filter((dato:any) => dato.estatusActual == this.reporte.estatus && dato.nombreObjeto== "Pagos de Anticipos y reembolsos")
        this.workInicial = this.workInicial[0].evento;  
      } else {
        this.workInicial=[];
      }         
      console.log('this.reporte',this.reporte);    
   }
  /**
   * @function
   * @name Historia 
   * Metodo  que consulta el servicio, para obtener el hisorial
   * @param {string} devoluciones 
   * @returns Regresa el arreglo Historial para devoluciones consultando el servicio correspondiente
   */
  
   Historia() {
     this.servicios.getUnParametro('reembolsos',`${this.id}/historial` )      
     .pipe( catchError(err => {return throwError(err);  })
     ) .subscribe((hist:any) => {  
      hist.map((h:any)=>{ h.fechaRegistro=moment(h.fechaRegistro).format('YYYY-MM-DD HH:mm:ss') })
       hist.length>0?this.Historial = new MatTableDataSource(hist):this.Historial = new MatTableDataSource();
       this.Historial.paginator = this.paginator;
       this.Historial.sort = this.sort;
     },() => {}        
     ); 
   }
   
    cambiaWork(evento:any, arr:any){
     this.dialogService.openConfirmDialog('  ¿Esta seguro que desea cambiar al estatus '+(evento.source.selected as MatOption).viewValue+'?')
       .afterClosed().subscribe(res =>{
         let Workflow=JSON.parse(window.sessionStorage.getItem("workflow")!);
         console.log(arr);
         console.log(evento.source.value);
         if(res){
           let envEstatus={estatus:arr.estatus}
           this.idWorkflow=Workflow.filter((dato:any) => dato.nombreObjeto== "Pagos de Anticipos y reembolsos" && dato.evento.some((o2:any) => o2.siguienteEstatus === evento.source.value));
           console.log(this.idWorkflow);
   
         } else{
           this.reembolsoArr.estatus=this.workOrigen;
         }
     });
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
             idEmpresa: this.reembolsoArr.idEmpresa,
             idCentrosCostos: this.reembolsoArr.idCentrosCostos,
             idUser: this.reembolsoArr.idUser,
             idAnticiposFondos: this.reembolsoArr.idAnticiposFondos,
             idReportesGastos: this.reembolsoArr.idReportesGastos,
             idProyecto: this.reembolsoArr.idProyecto,
             monto: this.reembolsoArr.monto,
             idMoneda: 'MXN',
             observaciones: this.reporte.observaciones,
             estatus: this.reembolsoArr.estatus
           } 
           console.log(guardar);
           
           this.servicios.putDatosP('reembolsos',this.reembolsoArr.id, guardar)//,`?idWorkflow=`
           .pipe(catchError(err => {console.log("ERROR"); return throwError(err);})
             ).subscribe( (reem:any) => {
             console.log(reem);           
             this.mensajes.mensaje('Reembolso actualizado con exito.','','success');
             //this.router.navigate(['/reportesgastos/reembolso']);
           },(err:any) => {  });   
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
     this.dialogService.openConfirmDialog(' ¿ Esta seguro desea salir del reembolso '+ this.id+' ? ')
       .afterClosed().subscribe(res =>{
         if(res){   
           switch (window.sessionStorage.getItem("_origen")) {
             case 'edoCta':
               window.sessionStorage.setItem("_origen",'');
               this.router.navigate(['/estadocuenta']);              
               break;
             default:
               window.sessionStorage.setItem("_origen",'');
               this.router.navigate(['/reportesgastos/reembolso']);
             break;
           }   
         } 
     });    
   }

  public getDatos (idempresa:any, idCC:any, usuario:any): Observable<any>  {
      let tipoSolicitud=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=tipoSolicitud`, { headers: headers });
      let centrosCostos=this.http.get<any>(API+'catalogos/?catalogo=vwCentrosCostos&filtro1='+encodeURIComponent('idEstructura='+idCC+' and idEmpresas='+idempresa), { headers: headers });
      let datosUsr=this.http.get<any>(API+'catalogos/?catalogo=vwUsuariosDatos&filtro1='+encodeURIComponent('id='+usuario), { headers: headers });
      let empresas=this.http.get<any>(APIAdmin+'catalogo/?catalogo=empresas&filtro1='+encodeURIComponent('id='+idempresa), { headers: headers });
      return forkJoin([tipoSolicitud,centrosCostos,datosUsr,empresas]);  
  } 

  public getUsuario (id:any,idempresa:any) : Observable<any>  {        
    let usuario=this.http.get<any>(API+'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1='+encodeURIComponent('idOcupantePuesto='+id+' and idEmpresas='+idempresa), { headers: headers });
    return forkJoin([usuario]);         
  } 

 
 }
 