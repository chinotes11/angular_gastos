/** Modulo Angular que muestra un listado con Anticipos creados por los colaboradores.
 * @module 1. Listado de Anticipos
 * anticipos-lista.component.ts  
 */
import { Component, AfterViewInit, ViewChild, OnInit, OnDestroy, Provider } from '@angular/core';
import { DialogService } from '../acciones/dialog.service';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Data, NavigationEnd, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { forkJoin, Subscription, throwError, Observable } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { catchError, filter, map, mergeMap } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { DataService } from "../../Genericos/data.service";
import { SesiondatosComponent } from "../../Genericos/sesiondatos/sesiondatos.component";
import { serviciosService } from "../../Genericos/servicios/servicios.service";
import * as _moment from 'moment';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ExcelServiceService } from '../../Genericos/excelService/ExcelService.service';
import { TokenService } from '../../auth/token/token.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { funciones, EVENT_WATCH } from '../../Genericos/utilidades/funciones';
import { MensajesService } from "../../Genericos/mensajes/mensajes.service";
const API = environment.ApiUrl;
const APIAdmin = environment.ApiUrlAdmin;
const headers = new HttpHeaders
headers.append('Content-type', 'applicartion.json')
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
 * componente Principal para listar, mediante el consumo de servicios
 */
@Component({
  //selector: 'app-anticipo-list',
  templateUrl: './anticipos-lista.component.html',
  styleUrls: ['./anticipos-lista.component.scss']
})
/** El nombre del modulo ListaAnticiposComponent. */
export class ListaAnticiposComponent implements OnInit, OnDestroy, AfterViewInit {
  anticipoList!: MatTableDataSource<any>;
  anticipoListOrig: any = [];
  subscription!: Subscription;
  selection = new SelectionModel<any>(true, []);
  pageInfo: Data = Object.create(null);
  message: any;
  arrsesion: any;  
  TipoSol: any;
  MonedaL: any;
  arrSelecto: any;
  copia: string = '0';
  tolerancia: any;
  FechaTolerancia: boolean = false;
  toleraDias:any;
  displayedColumns: string[] = ['select', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'id', 'createdAt', 'descripcion', 'motivo', 'fechaIni', 'fechaFin', 'diasDura', 'estatus', 'monto'];
  @ViewChild(MatSort) sort: MatSort = Object.create(null);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
  /**
      * Consulta catálogos y servicios, asi cómo inicializa el método principal que carga la información
      * 
      */
  constructor(
    private servicios: serviciosService,
    public dialog: MatDialog,
    public datePipe: DatePipe,
    private router: Router,
    private titleService: Title,
    private activatedRoute: ActivatedRoute,
    private excelExporta: ExcelServiceService,
    private dialogService: DialogService,
    private datosPaso: DataService,
    private http: HttpClient,
    private mensajes: MensajesService,
    private token: TokenService) {
    //this.sesionData.iniciaDatos();
    let datSess: any = token.readToken('id', '')
    datSess = datSess.split(',');
    //this.sesionData.cargaCatalogos(datSess[1]);
    console.log(`VERSÓN 0.9.6`);
    this.getUsuario(datSess[0], datSess[1]).subscribe(rsUs => {
      this.arrsesion = rsUs[0];
      this.tolerancia = rsUs[1];
      this.validaTolerancias(this.tolerancia[0])
      this.arrsesion.map((t1: any) => { t1.NombreCompleto = `${t1.nombre} ${t1.apellidoPaterno} ${t1.apellidoMaterno}`; t1.idUser = t1.idOcupantePuesto; });
      this.getDatos(datSess[1]).subscribe(responseList => {
        this.MonedaL = responseList[0];
        this.TipoSol = responseList[1];
        this.Inicio('anticipos', '?idEmpresa=' + datSess[1]);
      });
    });

    this.anticipoList = new MatTableDataSource();
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

  }
  /**
  * @function
   * @name Inicio
   * Metodo principal que inicia el consumo del servicio
   * @param {string} anticipos 
   * @returns {Array.<string>} Regresa el servicio Anticipos consultado correspondiente al idUser
   */
  Inicio(tabla: any, param: any) {
    this.servicios.getUnParametro(tabla, param)
      .pipe(
        catchError(err => { this.anticipoList = new MatTableDataSource(); return throwError(err); })
      )
      .subscribe(
        (res: any) => {
          console.log(`VERSÓN 0.9.6`);
          
          let anticipoListData = res;//.map((t1:any) => ({...t1, ...this.arrsesion.find((t2:any) => t2.idUser === t1.idUser) })) 
          anticipoListData.map((t1: any) => {
            t1.NombreCompleto = `${t1.nombre} ${t1.apellidoPaterno} ${t1.apellidoMaterno}`;
            t1.moneda = !t1.idMoneda ? '' : t1.moneda = this.MonedaL.filter((mon: any) => mon.id == t1.idMoneda)[0].clave;
            t1.descripcion = !t1.idUsoFondos ? '' : this.TipoSol.filter((tipo: any) => tipo.id == t1.idUsoFondos)[0].descripcion;
            t1.fechaFin = t1.fechaFin == '1969-12-31' ? '' : t1.fechaFin;
            t1.fechaIni = t1.fechaIni == '1969-12-31' ? '' : t1.fechaIni;
            t1.diasDura = !t1.fechaFin ? '' : Number(moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days')) < 0 ? 0 : 
                                              t1.idUsoFondos==1?moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days') + 1:moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days');
            t1.monto=numberFormat2.format(t1.monto)
          });
          //console.log(anticipoListData);
          this.anticipoList = new MatTableDataSource(anticipoListData);
          this.anticipoList.paginator = this.paginator!;
          this.anticipoList.sort = this.sort;
          this.anticipoListOrig = this.anticipoList.data;
          const sortState: Sort = { active: 'createdAt', direction: 'desc' };
          this.sort.active = sortState.active;
          this.sort.direction = sortState.direction;
          this.sort.sortChange.emit(sortState);

          //249493
        },
        (err: any) => { }
      );
  }

  ngAfterViewInit() {
  }

  ngOnInit() {
    this.subscription = this.datosPaso.currentMessage.subscribe((message) => { this.message = message; this.BuscarFiltro(message); }); // {{message[0].filtro.name}}
    // EVENT_WATCH.forEach((eventName)=>{ 
    //   window.addEventListener(eventName, funciones.inactividad);
    // })
  }
  /**
  * @function
   * @name BuscarFiltro
   * Metodo que Busca en el tabulado 
   * @returns {Array.<string>} Regresa un Array 
   */
  BuscarFiltro(json: any) {
    let filtros = json[0]
    let filtrado = filtros.filtro
    delete filtrado.titulo;
    //console.log("filtrado - ",filtrado);
    //this.anticipoList.data.forEach(i => Object.entries(filtrado).every(([k, v]) =>{ let nombre:any=v; console.log('i- ',i[k].toUpperCase(),' - |-',nombre.toUpperCase() , '   -+-  ',k);}));
    //let valor1 = this.anticipoList.data.filter(i => Object.entries(filtrado).every(([k, v]) =>{ let valor:any=v;  return i[k].toUpperCase() === valor.toUpperCase();}));
    //let valor1 = this.anticipoList.data.filter(i => Object.entries(filtrado).every(([k, v]) =>{let valor:any=v;return i[k].toUpperCase().includes(valor.toUpperCase());}));
    //let valor = this.anticipoList.data.filter(item =>  Object.entries(filtrado).includes(item.name.toUpperCase()))
    if (this.anticipoList.data.length != this.anticipoListOrig.length) {
      this.anticipoList.data = this.anticipoListOrig;
      if (filtrado.fechaIni && filtrado.fechaFin) {
        let filtroFecha = this.anticipoList.data.filter(function (item: any) {
          return new Date(item.createdAt+' 00:00:00') >= new Date(filtrado.fechaIni+' 00:00:00') && new Date(item.createdAt+' 00:00:00') <= new Date(filtrado.fechaFin+' 00:00:00');
        });
        delete filtrado.fechaIni;
        delete filtrado.fechaFin;
        const filteredData = funciones.buscarJsonEnJson(filtroFecha,filtrado);
        this.anticipoList.data = filteredData;
      } else {
        delete filtrado.fechaIni;
        delete filtrado.fechaFin;
        const filteredData = funciones.buscarJsonEnJson(this.anticipoList.data,filtrado);
        this.anticipoList.data = filteredData;
      }
    } else {
      if (filtrado.fechaIni && filtrado.fechaFin) {
        let filtroFecha = this.anticipoList.data.filter(function (item: any) {
          return new Date(item.createdAt+' 00:00:00') >= new Date(filtrado.fechaIni+' 00:00:00') && new Date(item.createdAt+' 00:00:00') <= new Date(filtrado.fechaFin+' 00:00:00');
        });
        delete filtrado.fechaIni;
        delete filtrado.fechaFin;
        const filteredData = funciones.buscarJsonEnJson(filtroFecha,filtrado);
        this.anticipoList.data = filteredData;
      } else {
        delete filtrado.fechaIni;
        delete filtrado.fechaFin;
        const filteredData = funciones.buscarJsonEnJson(this.anticipoList.data,filtrado);
        this.anticipoList.data = filteredData;
      }
    }
  }

  limpiarfiltros() {
    this.anticipoList.data = this.anticipoListOrig;
  }

  validaTolerancias(tolera:any){
    console.log('//TOLERANCIA ',tolera, '  - ' , tolera.id)
    if(tolera.id){
      if(!tolera.diasInicio && !tolera.diasFin){
        this.FechaTolerancia = true ;
      } else{
        if(tolera.diasInicio){        
          this.FechaTolerancia = moment(Date.now()).isBetween(moment().startOf('month'), moment().startOf('month').add(tolera.diasInicio,'d'));
        } else{
          this.FechaTolerancia = moment(Date.now()).isBetween(moment().endOf('month').subtract(tolera.diasFin,'d'), moment().endOf('month'));
        }
  
      }

    } else{
      this.FechaTolerancia = true ;
    }
    
    
  }

  toleranciaVal(){
    let msj = this.tolerancia[0].diasInicio? `los primeros ${this.tolerancia[0].diasInicio} dias del siguiente mes para crear un nuevo anticipo.`:`los ultimos ${this.tolerancia[0].diasFin} dias del siguiente mes para crear un nuevo anticipo.`
    this.mensajes.mensaje(`Debe esperar hasta ${msj}`,'','zazz');    
  }

  filtro(json: any) {
    var filtros = json[0]
    var filtrado = filtros.filtro;
    var Query = '';

    if (!filtrado.CID) { } else {
      Query += '?catalogo=anticiposFondos&filtro1=id=' + filtrado.CID
    }

    if (!filtrado.motivo) { } else {
      if (Query.length > 0) {
        Query += ' AND motivo="' + filtrado.motivo + '"'
      } else {
        Query += '?catalogo=anticiposFondos&filtro1=motivo LIKE "%' + filtrado.motivo + '%"  '
      }
    }

    if (!filtrado.estatus) { } else {
      if (Query.length > 0) {
        Query += ' AND estatus="' + filtrado.estatus + '"'
      } else {
        Query += '?catalogo=anticiposFondos&filtro1=estatus="' + filtrado.estatus + '"'
      }
    }

    if (!filtrado.fechaIni) { } else {
      if (Query.length > 0) {
        Query += ' AND fechaIni="' + filtrado.fechaIni + '"'
      } else {
        Query += '?catalogo=anticiposFondos&filtro1=fechaIni="' + filtrado.fechaIni + '"'
      }
    }

    if (!filtrado.fechaFin) { } else {
      if (Query.length > 0) {
        Query += ' AND fechaFin="' + filtrado.fechaFin + '"'
      } else {
        Query += '?catalogo=anticiposFondos&filtro1=fechaFin="' + filtrado.fechaFin + '"'
      }
    }

    if (!filtrado.tipoS) { } else {
      if (Query.length > 0) {
        Query += ' AND idUsoFondos="' + filtrado.tipoS + '"'
      } else {
        Query += '?catalogo=anticiposFondos&filtro1=idUsoFondos="' + filtrado.tipoS + '"'
      }
    }

    if (!filtrado.moneda) { } else {
      if (Query.length > 0) {
        Query += ' AND idMoneda="' + filtrado.moneda + '"'
      } else {
        Query += '?catalogo=anticiposFondos&filtro1=idMoneda="' + filtrado.moneda + '"'
      }
    }

    if (filtros.filtro == 'AAA') { } else { this.Inicio('catalogos', Query); }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  pasoFiltros() {
    this.datosPaso.changeMessage([{ filtro: '', tipo: '' }])
  }

  filter(filterValue: string) {
    this.anticipoList.filter = filterValue.trim().toLowerCase();
  }

  deleteAnticipos(row: number) {
    if (confirm('Borrar ?')) {
      //this.anticipoService.deleteAnticipos(row);
      this.anticipoList.data = this.anticipoList.data.filter(anticipo => anticipo.id !== row);
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.anticipoList.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.anticipoList.data.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  showOptions(event: MatCheckboxChange, arr: any): void {
    this.copia = this.selection.selected.length === 1 ? '1' : '0';
  }
  /**
  * @function
   * @name copiar
   * Metodo que copia el anticipo 
   * @param {string} guardar
   * @returns {Array.<string>} Regresa un Array 
   */
  copiar() {
    this.dialogService.openConfirmDialog(`¿Esta seguro que desea copiar el Anticipo ${this.selection.selected[0].id} ?`)
      .afterClosed().subscribe(res => {
        if (res) {
          let guardar = {
            idUser: this.selection.selected[0].idUser,
            idCentrosCostos: this.selection.selected[0].idCentrosCostos,
            idUsoFondos: this.selection.selected[0].idUsoFondos,
            idEmpresa: this.selection.selected[0].idEmpresa,
            idProyecto: this.selection.selected[0].idProyecto,
            motivo: this.selection.selected[0].motivo,
            fechaIni: this.selection.selected[0].fechaIni,
            fechaFin: this.selection.selected[0].fechaFin,
            monto: this.selection.selected[0].monto,
            idMoneda: this.selection.selected[0].idMoneda,
            estatus: 'Nuevo'
          }
          //console.log(guardar);
          this.servicios.postDatos('anticipos/?idWorkflow=1', guardar)
            .pipe(
              catchError(err => { return throwError(err); })
            ).subscribe(
              (res: any) => {
                //console.log(res.id);
                this.servicios.getUnParametro('anticiposgastos', `?idAnticipo=${this.selection.selected[0].id}`)
                  .pipe(catchError(err => { return throwError(err); })
                  ).subscribe((gsto: any) => {
                    if (gsto.length > 0) {
                      gsto.map((Orig: any) => { delete Orig.createdAt; delete Orig.updatedAt; delete Orig.id; });
                      //console.log(gsto);
                      let providers: Provider[] = [];
                      providers = gsto;
                      forkJoin(
                        providers.map(p =>
                          this.servicios.postMultiple(`anticiposgastos/?idAnticipo=${res.id}`, p).pipe(catchError(err => { return throwError(err); }))
                        )).subscribe((p: Provider[][]) => {
                          this.Inicio('anticipos', '?idUsuario=' + this.arrsesion[0].idUser);
                        });
                    } else {
                      //console.log("NO HAY");
                      this.Inicio('anticipos', '?idUsuario=' + this.arrsesion[0].idUser);
                    }
                  },
                    (err: any) => { }, () => { }
                  );
              },
              (err: any) => { }
            );
          //console.log(this.selection.selected);
        }
      });
  }
  /**
  * @function
   * @name exportar
   * Metodo que exporta a excel los tabulados seleccionados
   * @returns {Array.<string>} Regresa un Array 
   */
  exportar() {
    this.selection.selected.length === 0 ? this.generaExcel(this.anticipoList.data) : this.generaExcel(this.selection.selected);
  }
  /**
  * @function
   * @name generaExcel
   * Metodo que exporta a excel los tabulados 
   * @param {string} exportar 
   * @returns {Array.<string>} Regresa un Array 
   */
  generaExcel(arr: any) {
    //console.log(arr);
    let exportar: any = [];
    arr.map((ex: any) => {
      exportar.push({
        IdAnticipo: ex.id,
        Nombre: ex.nombre,
        Paterno: ex.apellidoPaterno,
        Materno: ex.apellidoMaterno,
        FechaRegistro: moment(new Date(ex.createdAt)).format("DD/MM/YYYY"),
        TipoSolicitud: ex.descripcion,
        Motivo: ex.motivo,
        FechaInicio: ex.fechaIni,
        FechaFin: ex.fechaFin,
        DiasDuracion: ex.diasDura,
        Estatus: ex.estatus,
        Monto: ex.monto,
        Moneda: ex.moneda
      })

    });
    this.excelExporta.exportAsExcelFile(exportar, 'anticipos_' + this.arrsesion[0].idUser);
  }

  public getDatos(idempresa: any): Observable<any> {
    let monedas = this.http.get<any>(`${APIAdmin}catalogo/?catalogo=monedas`, { headers: headers });
    let tipoSolicitud = this.http.get<any>(`${APIAdmin}catalogo/?catalogo=tipoSolicitud`, { headers: headers });
    return forkJoin([monedas, tipoSolicitud]);
  }

  public getUsuario(id: any, idempresa: any): Observable<any> {
    let usuario = this.http.get<any>(API + 'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1=' + encodeURIComponent('idOcupantePuesto=' + id + ' and idEmpresas=' + idempresa), { headers: headers });
    let tolerancia = this.http.get<any>(API + 'catalogos/?catalogo=vwEmpresasToleranciasGastos&filtro1=' + encodeURIComponent('idEmpresas=' + idempresa), { headers: headers });
    return forkJoin([usuario, tolerancia]);
  }

}

