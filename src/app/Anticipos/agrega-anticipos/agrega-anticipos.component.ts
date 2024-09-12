import { filter } from 'rxjs/operators';
/** Modulo Angular que Edita los Anticipos creados por los colaboradores.
 * @module 1. Agrega Anticipos
 * agrega-anticipos.component.ts  
 */
 import { Component, Inject, Optional, ViewChild, Provider } from '@angular/core';
 import { Router } from '@angular/router';
 import { AnticiposList, GastosSolicA } from '../anticipos';
 import { FormGroup, FormControl, NgForm, FormGroupDirective } from '@angular/forms';
 import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
 import { serviciosService } from "../../Genericos/servicios/servicios.service";
 import { ErrorStateMatcher, MatOption, MAT_DATE_FORMATS, MAT_DATE_LOCALE, DateAdapter} from '@angular/material/core';
 import { DialogService } from '../acciones/dialog.service';
 import { MatTable, MatTableDataSource } from '@angular/material/table';
 import { SelectionModel } from '@angular/cdk/collections';
 import { MatSort } from '@angular/material/sort';
 import { MatPaginator } from '@angular/material/paginator';
 import { DatePipe } from '@angular/common';
 import * as _moment from 'moment';
 import { MatListOption } from '@angular/material/list';
 import { catchError } from 'rxjs/operators';
 import { forkJoin, Observable, throwError } from 'rxjs';
 import { environment } from '../../../environments/environment';
 import { MensajesService } from "../../Genericos/mensajes/mensajes.service";
 import { TokenService } from '../../auth/token/token.service';
 import { HttpClient, HttpHeaders} from '@angular/common/http';
 import {MomentDateAdapter} from '@angular/material-moment-adapter';
 import { MY_FORMATS } from '../../Genericos/utilidades/funciones';

 const API = environment.ApiUrl;
 const APIAdmin= environment.ApiUrlAdmin;
 const headers = new HttpHeaders    
 headers.append('Content-type', 'applicartion.json')
 declare const require: any;
 const { jsPDF } = require("jspdf");
 const { pesostexto } = require("../../Genericos/utilidades/pesosatexto.js");
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
  * componente Principal para listar y agregar los Anticipos creados por colaborador
  */
 @Component({
   //selector: 'app-add-anticipo',
   templateUrl: './agrega-anticipos.component.html',
   styleUrls: ['./agrega-anticipos.component.css'],
   providers: [{provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},{provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}]
 })
 /** El nombre del modulo. */
 export class AgregaAnticiposComponent {
   range = new FormGroup({
     start: new FormControl(),
     end: new FormControl()
   });
   arrsesion!: any;
   anticipo!: any;
   arrGastos!:any;
   workInicial: any;
   TipoSol:any;
   MonedaL:any;
   CentroCosto:any;
   GastosSol: MatTableDataSource<any>;
   workOrigen:string;
   FechaReg: any;  
   btnGda: string='0';
   bloqueo:boolean=true;
   arrGastosGrd:any;
   bloqTipo:boolean=true;
   idWorkflow:any;
   displayedColumns: string[] = ['nombreGasto', 'dias', 'monto', 'Borrar'];
   fechaHoy: Date=new Date(Date.now());
   @ViewChild(MatSort) sort: MatSort = Object.create(null);
   @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
   @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
   /**
      * Consulta catálogos y servicios.
      * 
      */
   constructor(private servicios: serviciosService,    
     private http: HttpClient,
       public datePipes:DatePipe,
       private router: Router,
       public dialogo: MatDialog, 
       private dialogService: DialogService,
       private mensajes: MensajesService,
       private token: TokenService) {  
        let datSess:any=token.readToken('id','');
        datSess=datSess.split(',');
        this.anticipo={
          idUser:datSess[0],
          nombre:'',
          id:Math.round(Math.random()* (1200)),
          diasDura:0,  
          idEmpresa:datSess[1],
          idProyecto:0,                 
          idCentrosCostos:0,
          idUsoFondos:0,
          motivo: '',
          fechaIni: null,
          fechaFin: null,
          monto: 0,
          idMoneda: 1,
          estatus: null,
          rutaArchivo: null,
          montoFormato: 0,
          createdAt: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')//new Date(Date.now()+' 00:00:00'),
        };

        //moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
       
        this.FechaReg= this.datePipes.transform(new Date(this.anticipo.createdAt), 'yyyy-MM-dd');       
        this.arrGastos = { idanticipo:this.anticipo.id, idgasto:0, descripcion: '', diasDura:0, monto: 0, comentarios:'' } 
        this.GastosSol = new MatTableDataSource();  
        this.workOrigen=this.anticipo.estatus;   
        this.getUsuario(datSess[0],datSess[1]).subscribe(rsUs => {
          this.arrsesion=rsUs[0];    
          this.arrsesion.map((t1:any) =>{t1.NombreCompleto= `${t1.nombre} ${t1.apellidoPaterno} ${t1.apellidoMaterno}`; t1.idUser=t1.idOcupantePuesto;});
          this.anticipo.nombre=this.arrsesion[0].NombreCompleto;
          this.getDatos(datSess[1],this.arrsesion[0].idEstructura).subscribe(resp => {
            this.MonedaL= resp[0];
            this.TipoSol=resp[1];
            this.CentroCosto=resp[2];
            this.anticipo.idCentrosCostos=resp[2][0].idCentrosCostos;
            this.servicios.getUnParametro('catalogos','?catalogo=workflows&filtro1='+encodeURIComponent('idEmpresa='+datSess[1]))
              .pipe().subscribe((res:any) => {
                this.workInicial=res;    
                this.workInicial.map((t1: any) =>{t1.evento=JSON.parse(t1.evento)});   
                this.idWorkflow=this.workInicial.filter((dato:any) => dato.nombreObjeto=="Anticipo" &&  dato.estatusActual==null);
                this.idWorkflow= this.idWorkflow[0].id;                
            }); 
          });
        });
   }

   
   transformAmount(el:any){
     console.log(el);
     /*
      this.formattedAmount = this.currencyPipe.transform(this.formattedAmount, '$');
      el.target.value = this.formattedAmount;*/
  }
 

   guardarAnticipos() {    
     this.dialogService.openConfirmDialog('  ¿ Esta seguro de agregar un nuevo anticipo ?')
       .afterClosed().subscribe(res =>{
         if(res){
           let guardar={
             idUser: Number(this.anticipo.idUser),
             idCentrosCostos:Number(this.anticipo.idCentrosCostos),
             idUsoFondos: Number(this.anticipo.idUsoFondos),
             idEmpresa:Number(this.anticipo.idEmpresa),
             idProyecto: Number(this.anticipo.idProyecto),
             motivo: this.anticipo.motivo,
             fechaIni:this.anticipo.fechaIni ,
             fechaFin:this.anticipo.fechaFin,
             monto: Number(this.anticipo.monto),
             idMoneda: this.anticipo.idMoneda,
             estatus: 'Nuevo'
           }
           console.log(guardar,'   -   ',this.idWorkflow);

           this.servicios.postDatos('anticipos/?idWorkflow='+this.idWorkflow, guardar)
             .pipe(
               catchError(err => { return throwError(err); })
             ).subscribe(
               (res:any) => {     
                 console.log('res',res);      
                 console.log('this.arrGastosGrd',this.arrGastosGrd);       
                 if(!this.arrGastosGrd){
                  this.mensajes.mensaje('Se guardo con exito la información.','','success');
                  this.router.navigate([`/anticipos/editAnticipos/${res.id}`]);
                 }else{
                  let providers: Provider[] = []; 
                  providers=this.arrGastosGrd;
                  forkJoin(
                   providers.map(p =>
                     this.servicios.postMultiple(`anticiposgastos/?idAnticipo=${res.id}`, p).pipe( catchError(err => {  return throwError(err); }) )
                   )).subscribe((p: Provider[][]) => {
                    console.log('p',p);
                    this.mensajes.mensaje('Se guardo con exito la información.','','success');
                      this.router.navigate([`/anticipos/editAnticipos/${res.id}`]);
                   });
                 }
                
               },
               (err:any) => { this.mensajes.mensaje('Hubo un error al guardar la información intente de nuevo.','','danger'); }
             );
         } 
     });
   }
      /**
 * @function
  * @name cerrarAnticipos
  * Metodo que cierra el dialogopara redireccionar a la pagina anterior
  * @returns {Boolean} Regresa un true o false
  */
   cerrarAnticipos() {    
     this.dialogService.openConfirmDialog('  ¿ Esta seguro desea salir de la creación del Anticipo ?')
       .afterClosed().subscribe(res =>{
         if(res){
           this.router.navigate(['/anticipos']);
         } else{
           
         }
     });
   }
 
   getTotal() {
     return [this.anticipo].map(t => t.monto).reduce((acc: any, value: any) => acc + value, 0);
   }
 
   selGstoDialog  (action: string, obj: any) {
       obj.action = action;
       obj.dias = this.anticipo.diasDura;
       obj.ArrGastos=this.arrGastosGrd;
       const dialogRefs = this.dialogo.open(AgregaGstoDialogContent, {
           panelClass: "dialog-exportar",   
           disableClose: true,
           data: obj,         
       });
       console.log(dialogRefs);
       dialogRefs.afterClosed().subscribe(result => {
         console.log(result.arreglo);
         if(result.arreglo){             
          this.refactorizaGasto(result.arreglo);  
          this.valida(this.anticipo);
         }    
         console.log(result);
       });
   }
 
   filter(filterValue: string) {
     this.GastosSol.filter = filterValue.trim().toLowerCase();
   }
    /**
 * @function
  * @name cambiaMoneda
  * Metodo que habilita por cambio de moneda 
  * @returns {Boolean} Regresa un true o false 
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
  * @returns {Boolean} Regresa un true o false 
  */
   cambiaCC(evento:any, arr:any){
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
     this.bloqTipo=false;  
     this.valida(this.anticipo); 
   }
 /**
 * @function
  * @name generaPagare
  * Metodo que genera un Pagare PDF  
  * @returns {Array.<string>} Regresa un Array 
  */
   generaPagare(){    
     let doc = new jsPDF('landscape', 'pt');
     doc.setLanguage("es-MX"); 
     
     doc.setFontSize(26);
     //doc.setFontStyle("bold");
     doc.text(15, 50, 'PAGARÉ');
     //doc.setFontType("normal");
     doc.setFontSize(12);
     doc.text(410, 40, 'No.     '+this.anticipo.id);
     doc.line(429, 42, 520, 42);
     doc.text(695, 40, '$ '+this.anticipo.monto + ' '+ this.anticipo.Moneda);
 
     doc.setFontSize(14);
     doc.rect(8, 15 , 820, 370);
     doc.text(595, 40, 'BUENO POR.');
     doc.rect(686, 22 , 135, 25);
 
     doc.setFontSize(12);
     doc.text(393, 80, 'Fecha.   '+moment().format('L'));
     doc.line(429, 82, 520, 82);
 
     doc.setFontSize(12);
     doc.text(10, 120, 'Debo y pagaré incondicionalmente por este pagaré a la orden de:                ZZAS');
     doc.line(380, 122, 740, 122);
 
     doc.setFontSize(12);
     doc.text(10, 140, 'El día.                       '+ moment(this.anticipo.fechaFin).format('L') );
     doc.line(70, 142, 280, 142);
 
     doc.text(335, 140, 'En.                                   México');
     doc.line(380, 142, 630, 142);
 
     doc.setFontSize(12);
     doc.text(10, 160, 'La Cantidad de :      '+ pesostexto.NumeroALetras(this.anticipo.monto));
     doc.line(100, 162, 740, 162);
 
     doc.setFontSize(12);
     doc.text('Valor recibido a nuestra entera satisfacción. Aceptamos que en caso de no liquidar íntegramente la cantidad que ampara el presente pagaré, en el día aquí indicado, se causaran INTERESES MORATORIOS A RAZÓN DE 10% (DIEZ POR CIENTO) que se calcularan de manera mensual y en su caso, su proporción diaria y cotidiana sobre ella hasta la fecha exacta de su pago. para efecto del pago, ya sea del capital y(o los intereses que aquí se pactan, renunciamos de manera expresa a los beneficio de orden y excusión. cualquier controversia que se genere vinculada al presente título de crédito será ventilada en los tribunales competentes que señale la acreedora, renunciando expresamente a cualquier otra jurisdicción y/o competencia que pudiera corresponderle a los suscriptores en razón de su domicilio, o cualquier otra causa.', 
                         15,192, {maxWidth: 800, align: "justify"});
 
     doc.setFontSize(12);
     doc.text(40, 280, 'Nombre Deudor:     '+ this.anticipo.nombre );
     doc.line(135, 282, 400, 282);
 
     doc.text(76, 300, 'Domicílio:     '+ this.anticipo.nombre );
     doc.line(135, 302, 400, 302);
 
     doc.text(76, 320, 'Municipio:     Bénito Júarez' );
     doc.line(135, 322, 400, 322);
 
     //doc.line(520, 342, 600, 342);
     doc.text(26, 340, 'Entidad Federativa:     Ciudad de México                                   CP: '  );
     doc.line(135, 342, 460, 342);
 
     doc.text(570, 320, 'Firma:');  
     doc.text(690, 334, 'Acepto');  
     doc.line(610, 322, 800, 322);
 
 
     doc.save('test.pdf');
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
    this.anticipo.diasDura=resulta<=0?1:resulta+1;
    this.anticipo.diasDura=isNaN(this.anticipo.diasDura)?0:this.anticipo.diasDura;   

    console.log('++',this.arrGastosGrd)  
    console.log('++',this.anticipo.diasDura)
    this.refactorizaGasto(this.arrGastosGrd);

    
    this.valida(this.anticipo); 
  }
 
   valida(event: any) {  
     this.btnGda='1';  
   }

   refactorizaGasto(gsto:any){
    //guardarAnticipos
    //let diasIncompleto=this.anticipo.diasDura==1?1:this.anticipo.diasDura==0?1:this.anticipo.diasDura-1;
    let diasIncompleto=this.anticipo.diasDura<=1?1:this.anticipo.diasDura -1;
    let suma=0;

    console.log(this.anticipo.diasDura, '  -  ', diasIncompleto)
    if(gsto){
      gsto.map((gt: any) =>{             
        let valor=0;
        if(gt.diaCompleto === 1 ){
          console.log('GT',gt);
          if(gt.montoDia!=null){
            valor=(this.anticipo.diasDura==0?1:this.anticipo.diasDura )*gt.montoDia;
          }
          if(gt.montoEvento!=null){
            valor=gt.montoEvento;
          }
          if(gt.montoMes!=null){
            valor=gt.montoMes/Number(moment(new Date(Date.now()), "YYYY-MM").daysInMonth());
            valor=(this.anticipo.diasDura==0?1:this.anticipo.diasDura)*valor;
          }
          if(gt.montoSemana!=null){              
            valor=gt.montoSemana/7;
            valor=(this.anticipo.diasDura==0?1:this.anticipo.diasDura )*valor;
          }
          gt.dias=this.anticipo.diasDura==0?1:this.anticipo.diasDura ;
        } else {
          if(gt.montoDia!=null){
            console.log('DIA',gt)
            //valor=diasIncompleto*gt.montoDia;
            valor=((this.anticipo.diasDura==0?0:this.anticipo.diasDura-1)*gt.montoDia);
            gt.dias=(this.anticipo.diasDura==0?0:this.anticipo.diasDura-1);
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
    } else {
      gsto=[];
    }
   
    //this.anticipo.diasDura=this.anticipo.diasDura==0?1:this.anticipo.diasDura; 
    this.anticipo.monto=Number(this.anticipo.diasDura>0?suma:0).toFixed(2);
    this.anticipo.montoFormato=numberFormat2.format(this.anticipo.monto);
    this.arrGastosGrd=gsto;
    this.GastosSol = new MatTableDataSource(gsto);
   }

   borrarGasto(ev:any,sel:any){
    console.log(this.anticipo.diasDura ,'  -  ',this.arrGastosGrd,'  --- ',sel);
    let resulta=moment(this.anticipo.fechaFin, 'YYYY-MM-DD').diff(moment(this.anticipo.fechaIni, 'YYYY-MM-DD'), 'days');
    this.anticipo.diasDura=resulta<0?0:resulta;
    this.anticipo.diasDura=isNaN(this.anticipo.diasDura)?0:this.anticipo.diasDura;   
    this.refactorizaGasto(this.arrGastosGrd.filter((g:any)=> g.idTipoGasto!=sel.idTipoGasto));
  }
 
   step = 2;
   setStep(index: number) { this.step = index; }
   nextStep() { this.step++; }
   prevStep() { this.step--; }

   public getDatos (idempresa:any, idCC:any) : Observable<any>  {
    let monedas=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=monedas`, { headers: headers });
    let tipoSolicitud=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=tipoSolicitud`, { headers: headers });
    let centrosCostos=this.http.get<any>(API+'catalogos/?catalogo=vwCentrosCostos&filtro1='+encodeURIComponent('idEstructura='+idCC+' and idEmpresas='+idempresa), { headers: headers });
    return forkJoin([monedas,tipoSolicitud,centrosCostos]);  
  } 

  public getUsuario (id:any,idempresa:any) : Observable<any>  {        
    let usuario=this.http.get<any>(API+'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1='+encodeURIComponent('idOcupantePuesto='+id+' and idEmpresas='+idempresa), { headers: headers });
    return forkJoin([usuario]);         
  }
}
 
 /**
  * componente para listar Gastos
  */
 @Component({
   selector: 'lista-gastos',
   templateUrl: 'lista-gastos.html',
 })
 /** El nombre del modulo AgregaGstoDialogContent. */
 export class AgregaGstoDialogContent { 
 
   @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
   displayedCol: string[] = ['select','id', 'descripcion'];
   local_data: any;
   action: string;
   arrsesion:any;
   arregloGastos:any[]=[];
   GastosL:any;
    /**
      * Consulta catálogos y servicios.
      * 
      * 
      */
   constructor(public dialogRefs: MatDialogRef<AgregaGstoDialogContent>,
     private servicios: serviciosService,    
     @Optional() @Inject(MAT_DIALOG_DATA) public data: AnticiposList,
     @Optional() @Inject(MAT_DIALOG_DATA) public Gsol: GastosSolicA,
     private http: HttpClient,
     private token: TokenService) {  
    let datSess:any=token.readToken('id','');
    datSess=datSess.split(',');  
     this.local_data = { ...data };
     this.action = this.local_data.action;   
    console.log(this.local_data);  
     this.getUsuario(datSess[0],datSess[1]).subscribe(rsUs => {
      this.arrsesion=rsUs[0];  
      this.arrsesion.map((t1:any) =>{t1.NombreCompleto= `${t1.nombre} ${t1.apellidoPaterno} ${t1.apellidoMaterno}`; t1.idUser=t1.idOcupantePuesto;});
      this.servicios.getUnParametro('catalogos','?catalogo=vwTipoGastosEmpresaCosto&filtro1='+encodeURIComponent('idEmpresas='+datSess[1]+' and nivelEstructura='+this.arrsesion[0].nivelEstructura) )
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
    //this.arrsesion= JSON.parse(window.sessionStorage.getItem("persona")!);
     //this.GastosL= JSON.parse(window.sessionStorage.getItem("gastos")!)

   }
 
   agregaGasto(options: MatListOption[], evento:any) {
    let arrOpts=options.map(o => o.value);
    let arrGasto:any[]=[]; 
    arrOpts.map((Opts) =>{
     console.log(Opts)
      this.GastosL.find((gasto:any) => {
        if(Opts===gasto.idTipoGastos){
          let montoTipo= gasto.montoDia!=null?1:gasto.montoEvento!=null?1:gasto.montoMes!=null?moment(new Date(Date.now()), "YYYY-MM").daysInMonth():gasto.montoSemana!=null?7:1; 
          let monto:any=gasto.montoDia!=null?gasto.montoDia:gasto.montoEvento!=null?gasto.montoEvento:gasto.montoMes!=null?gasto.montoMes:gasto.montoSemana!=null?gasto.montoSemana:0; 
          arrGasto.push({
            idTipoGasto:gasto.idTipoGastos, 
            dias:this.local_data.dias, 
            monto:Number(monto), 
            comentarios:'', 
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
        console.log(Orig);
        this.GastosL.find((gasto:any) => {          
          if(Orig.idTipoGasto===gasto.idTipoGastos){   
            let montoTipo= gasto.montoDia!=null?1:gasto.montoEvento!=null?1:gasto.montoMes!=null?moment(new Date(Date.now()), "YYYY-MM").daysInMonth():gasto.montoSemana!=null?7:1; 
            let monto:any=gasto.montoDia!=null?gasto.montoDia:gasto.montoEvento!=null?gasto.montoEvento:gasto.montoMes!=null?gasto.montoMes:gasto.montoSemana!=null?gasto.montoSemana:0; 
            arrGasto.push({
              idTipoGasto:gasto.idTipoGastos, 
              dias:this.local_data.dias, 
              monto:Number(monto), 
              comentarios:'', 
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
 