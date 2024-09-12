import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { ServiceinvoiceService } from '../tesoreria.service';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Data, NavigationEnd, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { Subscription, throwError } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { catchError, filter, map, mergeMap } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { DataService } from "../../../Genericos/data.service";
import { serviciosService } from "../../../Genericos/servicios/servicios.service";
import * as _moment from 'moment';
import { ExcelServiceService } from '../../../Genericos/excelService/ExcelService.service';
import { MatCheckboxChange } from '@angular/material/checkbox';


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
@Component({
  //selector: 'app-layout-pago',
  templateUrl: './factura-lista.component.html',
  styleUrls: ['./factura-lista.component.scss']
})
export class FacturaListaComponent implements OnInit {
  facturaList: MatTableDataSource<any>;
  subscription!: Subscription;
  selection = new SelectionModel<any>(true, []);
  pageInfo: Data = Object.create(null);
  message: any;
  arrsesion: any;
  colaborador: any;
  Factura: any;
  transaccion: any;
  arrSelecto: any;
  displayedColumns: string[] = ['select', 'facturaID', 'folioF', 'fechaRegistro', 'nombrePro', 'razonSocial', 'estatus', 'Moneda', 'importeTotal', 'ordenCompra', 'montoOrden', 'pagada']; @ViewChild(MatSort) sort: MatSort = Object.create(null);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  constructor(
    private invoiceService: ServiceinvoiceService,
    private servicios: serviciosService,
    public datoseuService: ServiceinvoiceService,

    private excelExporta: ExcelServiceService,
    public dialog: MatDialog,
    public datePipe: DatePipe,
    private router: Router,
    private titleService: Title,
    private activatedRoute: ActivatedRoute,

    private datosPaso: DataService,) {
    this.colaborador = this.invoiceService.getTesoreriaList();
    this.Factura = this.datoseuService.getFactuasOrden();
    this.arrsesion = JSON.parse(window.sessionStorage.getItem("persona")!);
    this.facturaList = new MatTableDataSource();
    this.Inicio();
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

  Inicio() {
    this.servicios.getUnParametro('reportes', '?idUsuario=' + this.arrsesion[0].idUser)
      .pipe(
        catchError(err => { this.facturaList = new MatTableDataSource(); return throwError(err); })
      )
      .subscribe(
        (res: any) => {
          let facturaListData = res.map(
            (t1: { idUser: any; idMoneda: any; idUsoFondos: any; diasDura: any; fechaIni: any; fechaFin: any; }) => ({
              ...t1, ...this.colaborador.find((t2: { IdColaborador: any; }) => t2.IdColaborador === t1.idUser),
              ...t1, ...this.Factura.find((t2: { IdColaborador: any; }) => t2.IdColaborador === t1.idUser),

            })
          )
          facturaListData.map((t1: { diasDura: number; fechaFin: _moment.MomentInput; fechaIni: _moment.MomentInput; }) => { t1.diasDura = moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days') < 0 ? 0 : moment(t1.fechaFin, 'YYYY-MM-DD').diff(moment(t1.fechaIni, 'YYYY-MM-DD'), 'days') });
          console.log('lista facturas', this.colaborador);
          console.log('Reportes', facturaListData);
          this.facturaList = new MatTableDataSource(facturaListData);
          this.facturaList.paginator = this.paginator!;
          this.facturaList.sort = this.sort;
          const sortState: Sort = { active: 'createdAt', direction: 'desc' };
          this.sort.active = sortState.active;
          this.sort.direction = sortState.direction;
          this.sort.sortChange.emit(sortState);

        },
        (err: any) => { },
        () => { console.log('Termino'); }
      );

  }

  irA() {
    console.log('listaFacturas')
    window.sessionStorage.setItem("_origen", 'listaFacturas');
  }

  ngOnInit() {
    this.subscription = this.datosPaso.currentMessage.subscribe((message) => { this.message = message; console.log(message); }); // {{message[0].filtro.name}}
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  pasoFiltros() {
    this.datosPaso.changeMessage([{ filtro: '', tipo: '' }])
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.facturaList.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.facturaList.data.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  showOptions(event: MatCheckboxChange, arr: any): void { }

  applyFilter(filterValue: string) {
    this.facturaList.filter = filterValue.trim().toLowerCase();
  }

  exportar() {
    this.selection.selected.length === 0 ? this.generaExcel(this.facturaList.data) : this.generaExcel(this.selection.selected);
  }

  generaExcel(arr: any) {
    console.log(arr);
    let exportar: any = [];
    arr.map((ex: any) => {
      exportar.push({
        Empresa: ex.Empresa,
        BKL_ID: ex.BKL_ID,
        BancoEmisor: ex.BancoEmisor,
        CuentaEmisora: ex.CuentaEmisora,
        FechaCreacion: moment(new Date(ex.createdAt)).format("MM/DD/YYYY"),
        monto: ex.monto,
        Moneda: ex.Moneda,
        NoRegistros: ex.NoRegistros,
      })
    });
    this.excelExporta.exportAsExcelFile(exportar, 'layout_' + this.arrsesion[0].idUser);
  }

  filter(filterValue: string) {
    this.facturaList.filter = filterValue.trim().toLowerCase();
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////// 

}



