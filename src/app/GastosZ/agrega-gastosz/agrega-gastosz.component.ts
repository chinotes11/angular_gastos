import { centroCosto } from './../../Genericos/catalogos/generales-data';
/** Modulo Angular para agregar un listado con Gastos 
 * @module 1. AgregaGastosZComponent
 * agrega-gastosz.component.ts  
 */
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, NgForm, FormGroupDirective } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { WorkFlowService } from '../../Genericos/servicios.service'
import { ErrorStateMatcher } from '@angular/material/core';
import { DialogService } from '../acciones/dialog.service';
import { DatePipe } from '@angular/common';
import * as _moment from 'moment';
import { MatTable } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { serviciosService } from "../../Genericos/servicios/servicios.service";
import { catchError } from 'rxjs/operators';
import { forkJoin, Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { TokenService } from '../../auth/token/token.service';
const API = environment.ApiUrl;
const APIAdmin = environment.ApiUrlAdmin;
const headers = new HttpHeaders
headers.append('Content-type', 'applicartion.json')
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
 * componente Principal para listar y agregar los gastos 
 */
@Component({
  //selector: 'app-add-invoice',
  templateUrl: './agrega-gastosz.component.html',
  styleUrls: ['./agrega-gastosz.component.css']
})
/** El nombre del modulo AgregaGastosZComponent */

export class AgregaGastosZComponent implements OnInit {
  id: any;
  gasto: any;
  gastos: any=[];
  causaLista: any;
  workInicial: any;
  unionFecha: any = ''
  subTotal = 0;
  vat = 0;
  btnGda = '0';
  grandTotal = 0;
  arrsesion: any;
  TipoSol: any;
  MonedaL: any;
  CentroCosto: any;
  Proyectos: any;
  Empresas: any;
  Tipogasto:any;
  formapago:any;
  workOrigen: string;
  idWorkflow: any;
  FechaReg: any;
  siFiscal:any;
  bloqueo: boolean = false;
  @ViewChild(MatSort) sort: MatSort = Object.create(null);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
  /**
       * Consulta catálogos y servicios. 
       */
  constructor(public datePipes: DatePipe,
    private servicios: serviciosService,
    public workService: WorkFlowService,
    private router: Router,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private http: HttpClient,
    private token: TokenService) {
    let datSess: any = token.readToken('id', '');
    datSess = datSess.split(',');
    //this.arrsesion= JSON.parse(window.sessionStorage.getItem("persona")!);
    this.gasto = {
      idEmpresa: Number(datSess[1]),
      idProyecto: 0,
      idCentrosCostos: 0,
      idUser: datSess[0],
      nombre: '',
      id: Math.round(Math.random() * (1200)),
      idTipoComprobante: 1,
      notas: '',
      estatus: null,
      monto: 0,
      montoAprobado: 0,
      idTipoGasto: 0,
      createdAt: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
      idFormasPago:0,
      idCuenta:0,
      tipoCambio: 0,
      idMonedaTipoCambio: 1,
    }
    this.siFiscal=true;
    this.FechaReg = this.datePipes.transform(new Date(this.gasto.createdAt), 'yyyy-MM-dd');
    this.workOrigen = this.gasto.estatus;

    this.getUsuario(datSess[0], datSess[1]).subscribe(rsUs => {
      this.arrsesion = rsUs[0];
      this.arrsesion.map((t1: any) => { t1.NombreCompleto = `${t1.nombre} ${t1.apellidoPaterno} ${t1.apellidoMaterno}`; t1.idUser = t1.idOcupantePuesto; t1.idEmpresa = Number(datSess[1]); });
      this.gasto.nombre = this.arrsesion[0].NombreCompleto;
      this.getDatos(datSess[1], this.arrsesion[0].idEstructura, this.arrsesion[0].nivelEstructura).subscribe(resp => {
        this.MonedaL = resp[0];
        this.TipoSol = resp[1];
        this.CentroCosto = resp[2];
        this.Empresas = resp[3];
        this.Proyectos = resp[4];
        this.Tipogasto = resp[5];
        this.formapago = resp[6];
        this.gasto.idCentrosCostos=this.CentroCosto[0].idCentrosCostos;
        this.gastos.ctaContable=='';
        this.servicios.getUnParametro('catalogos', '?catalogo=workflows&filtro1=' + encodeURIComponent('idEmpresa=' + datSess[1]))
          .pipe().subscribe((res: any) => {
            this.workInicial = res;
            this.workInicial.map((t1: any) => { t1.evento = JSON.parse(t1.evento) });
            this.idWorkflow = this.workInicial.filter((dato: any) => dato.nombreObjeto == "Gastos" && dato.estatusActual == null);
            this.idWorkflow = this.idWorkflow[0].id;
          });
      });
      console.log(this.gasto);
    });
  }
  /**
  * @function
   * @name cambiaCC 
   * Metodo que habilita por cambio de centro de costos 
   * @returns  {Boolean} Regresa un true o false 
   */
  cambiaCC(evento: any, arr: any) {
    //this.anticipo.Moneda=(evento.source.selected as MatOption).viewValue; 
    this.gasto.idCentrosCostos = evento.value;
    this.valida(this.gasto);
  }
  /**
  * @function
   * @name cambiaProy
   * Metodo que habilita por cambio de Proyecto 
   * @returns  {Boolean} Regresa un true o false 
   */
  cambiaProy(evento: any, arr: any) {
    //this.anticipo.Moneda=(evento.source.selected as MatOption).viewValue; 
    this.gasto.idProyecto = evento.value;
    this.valida(this.gasto);
  }
  /**
  * @function
   * @name cambiaEmp 
   * Metodo que habilita por cambio de Empresa 
   * @returns  {Boolean} Regresa un true o false 
   */
  cambiaEmp(evento: any, arr: any) {
    //this.anticipo.Moneda=(evento.source.selected as MatOption).viewValue; 
    this.gasto.idEmpresa = evento.value;
    this.valida(this.gasto);
  }
   /**
  * @function
   * @name cambiaEmp 
   * Metodo que habilita por cambio de Empresa 
   * @returns  {Boolean} Regresa un true o false 
   */
    cambiaNota(evento: any, arr: any) {  
      this.valida(this.gasto);
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
      console.log('tipoElegido',tipoElegido);
      this.gastos.tipodegasto=tipoElegido[0].nombreGasto; 
      //this.gastos.ctaContable=`${tipoElegido[0].cuentaContable} ${tipoElegido[0].descripcion}`;   
      this.gastos.ctaContable=this.gastos.tipodegasto!=''?`${tipoElegido[0].cuentaContable} ${tipoElegido[0].descripcionCuenta}`:''; 
      //this.gastos.tipodegasto=this.Tipogasto.filter((d: any) => d.id == evento.value)[0].nombreGasto; 
      //console.log(this.gasto.idTipoGasto, "  -  " ,this.gasto);   
      this.valida(this.gasto);
    }
  /**
  * @function
   * @name valida 
   * Metodo que habilita el botón Guardar al haber al menos un elemento modificado  
   * @returns  {Boolean} Regresa un true o false 
   */
  valida(event: any) {
    this.btnGda = '1';
  }

  ngOnInit(): void {
  }

  step = 0;
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
   * @name guardarGastosZ 
   * Metodo que guarda los valores de los inputs a traves de un post
   * @returns {Array.<string>} Regresa un arreglo llamado guardar
   */
  guardarGastosZ(val:any) {

    let guardar = {
      idEmpresa: Number(this.gasto.idEmpresa),
      idProyecto: Number(this.gasto.idProyecto),
      idUser: Number(this.gasto.idUser),
      idCentrosCostos: Number(this.gasto.idCentrosCostos),
      idTipoComprobante: Number(this.gasto.idTipoComprobante),
      idTipoGasto: Number(this.gasto.idTipoGasto),
      notas: this.gasto.notas,
      //monto: this.gasto.monto,
      montoAprobado: this.gasto.montoAprobado,
      automatico: 1,
      estatus: 'Nuevo',
      idFormasPago:this.gasto.idFormasPago,
      idCuenta:this.gasto.idCuenta,
      tipoCambio: 1,
      idMonedaTipoCambio: 1,
    }
    console.log(guardar)
    if(val===1){
      this.dialogService.openConfirmDialog('  ¿Esta seguro de agregar un nuevo gasto?')
      .afterClosed().subscribe(res => {        
        if (res) {          
          console.log(guardar);
          this.servicios.postDatos('gastos/?idWorkflow=' + this.idWorkflow, guardar)
            .pipe(
              catchError(err => { return throwError(err); })
            ).subscribe(
              (res: any) => {
                this.router.navigate([`/gastosz/editGastosZ/${res.id}/1`]);
              },(err: any) => { });//*/
        }
      });
    } else {
      console.log(guardar);
      this.servicios.postDatos('gastos/?idWorkflow=' + this.idWorkflow, guardar)
        .pipe(
          catchError(err => { return throwError(err); })
        ).subscribe(
          (res: any) => {
            this.router.navigate([`/gastosz/editGastosZ/${res.id}/1`]);
          },(err: any) => { });//*/
    }    
  }
  /**
  * @function
   * @name cerrarGastosZ 
   * Metodo que cierra el dialogo de confirmación para redireccionar a la pantalla anterior 
   * @returns {Boolean} Regresa un true o false 
   */
  cerrarGastosZ() {
    this.dialogService.openConfirmDialog('  ¿Esta seguro desea salir sin guardar?')
      .afterClosed().subscribe(res => {
        if (res) {
          this.router.navigate(['/gastosz']);
        } else {

        }
      });
  }

  comprobante(evento:any){  
    if(evento.checked==true){this.gasto.idTipoComprobante=1; this.siFiscal=true;}
    if(evento.checked==false){ this.gasto.idTipoComprobante=2; this.siFiscal=false;}
    console.log(this.gasto);
  }

  public getDatos(idempresa: any, idCC: any, nivCC: any): Observable<any> {
    let monedas = this.http.get<any>(`${APIAdmin}catalogo/?catalogo=monedas`, { headers: headers });
    let tipoSolicitud = this.http.get<any>(`${APIAdmin}catalogo/?catalogo=tipoSolicitud`, { headers: headers });
    let centrosCostos = this.http.get<any>(API + 'catalogos/?catalogo=vwCentrosCostos&filtro1=' + encodeURIComponent('idEstructura=' + idCC + ' and idEmpresas=' + idempresa), { headers: headers });
    let empresas = this.http.get<any>(APIAdmin + 'catalogo/?catalogo=empresas&filtro1=' + encodeURIComponent('id=' + idempresa), { headers: headers });
    let proyectos = this.http.get<any>(API + 'catalogos/?catalogo=vwProyectos&filtro1=' + encodeURIComponent('nivelEstructura=' + nivCC + ' and idEmpresas=' + idempresa), { headers: headers });
    let tipoGastos=this.http.get<any>(API+'catalogos/?catalogo=vwTipoGastosEmpresaCosto&filtro1='+encodeURIComponent('nivelEstructura='+nivCC+' and idEmpresas='+idempresa), { headers: headers });
    //let tipoGastos=this.http.get<any>(`${API}catalogos/?catalogo=vwTipoGastos&filtro1=idEmpresas=${idempresa}`, { headers: headers });
    let formasPagos=this.http.get<any>(`${APIAdmin}catalogo/?catalogo=formasPago`, { headers: headers }); 
    return forkJoin([monedas, tipoSolicitud, centrosCostos, empresas, proyectos, tipoGastos, formasPagos]);
  }

  public getUsuario(id: any, idempresa: any): Observable<any> {
    let usuario = this.http.get<any>(API + 'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1=' + encodeURIComponent('idOcupantePuesto=' + id + ' and idEmpresas=' + idempresa), { headers: headers });
    return forkJoin([usuario]);
  }
}
