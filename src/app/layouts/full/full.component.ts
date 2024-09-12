
import { MediaMatcher } from '@angular/cdk/layout';
import { Router, ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MenuItems } from '../../shared/menu-items/menu-items';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Location } from "@angular/common";
import { DataService } from "../../Genericos/data.service";
import { forkJoin, Observable, Subscription, throwError } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { serviciosService } from 'src/app/Genericos/servicios/servicios.service';
import { TokenService } from '../../auth/token/token.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
const API = environment.ApiUrl;
const APIAdmin = environment.ApiUrlAdmin;
const headers = new HttpHeaders
headers.append('Content-type', 'applicartion.json')

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

interface TipoComprobantes {
  id: number;
  tipo: string;
}
const tipocomprobantes: TipoComprobantes[] = [
  {
    id: 1,
    tipo: 'Fiscal'
  },
  {
    id: 2,
    tipo: 'No Fiscal'
  },
];

interface TipoTransaccion {
  id: number;
  tipo: string;
}
const tipoTrans: TipoTransaccion[] = [
  {
    id: 1,
    tipo: 'Anticipo'
  },
  {
    id: 2,
    tipo: 'Reembolso'
  },
];



/** @title Responsive sidenav */
@Component({
  selector: 'app-full-layout',
  templateUrl: 'full.component.html',
  styleUrls: ['full.component.scss']
})
export class FullComponent implements OnInit, OnDestroy {
  message: any;
  subscription!: Subscription;
  mobileQuery: MediaQueryList;
  dir = 'ltr';
  green = false;
  blue = true;
  dark = false;
  minisidebar = false;
  boxed = false;
  danger = false;
  showHide = false;
  horizontal = false;
  url = '';
  sidebarOpened = false;
  status = false;
  ruta = '';
  workInicial: any;
  idRol: any;
  datSess: any;
  arrsesion!: any;
  idWorkflow: any;
  workFlowAnt: any[] = [];
  workFlowGas: any[] = [];
  workFlowRep: any[] = [];
  workFlowDev: any[] = [];
  workFlowPag: any[] = [];

  MonedaL: any;
  CentroCosto: any;
  Empresas: any;
  Proyectos: any;
  formaPagos: any;
  TipoComprobante: any;
  TipoSol: any;
  Tipogasto: any;
  NomBancos: any;
  Tipotrans: any;

  FileUrlLogo: any = 'assets/images/logo.png';

  public showSearch = false;
  public config: PerfectScrollbarConfigInterface = {};
  private _mobileQueryListener: () => void;
  clickEvent() {
    this.status = !this.status;
  }

  constructor(
    public router: Router,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    public menuItems: MenuItems,
    public dialog: MatDialog,
    location: Location,
    private datosPaso: DataService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private servicios: serviciosService,
    private token: TokenService,
    private domSanitizer: DomSanitizer,
    private http: HttpClient) {
    //this.token.setToken("eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2MzI4NTQ2OTIsImV4cCI6MTYzMjg1ODI5MiwianRpIjoiNTZhMjk2ODEtNDBiYS00OWM4LTlhYjUtYzdkOGZjOTRhODg3IiwiaWQiOjEsInJscyI6IkFETU9OOjI6dmVtfHZjb3x2cnB8dmN0fHZlb3x2Y2N8dnJnfHZ3ZixHQVNUT1M6NDp2YXJ8dmV2fHZlcnx2YXN8dnRjfHZvcnx2d2YiLCJyZl9leHAiOjE2MzI5NDEwOTJ9.f0hgZrgo7JTUSmuCZR2VZ4cODDRRRfjoV5ZFIltcxfI",0); 
    this.datSess = token.readToken('id', '');
    if (this.datSess) {
      this.datSess = this.datSess.split(',');
      this.idRol = token.readToken('rlsRol', 'GASTOS');
      this.getUsuario(this.datSess[0], this.datSess[1]).subscribe(rsUsLog => {
        this.arrsesion = rsUsLog[0];
        this.arrsesion.map((t1: any) => { t1.NombreCompleto = `${t1.nombre} ${t1.apellidoPaterno} ${t1.apellidoMaterno}`; t1.idUser = t1.idOcupantePuesto; t1.idEmpresa = Number(this.datSess[1]); t1.idRoles = this.idRol; });
        this.getDatos(this.datSess[1], this.arrsesion[0].nivelEstructura, this.datSess[0]).subscribe((resp: any) => {
          this.MonedaL = resp[0];
          this.CentroCosto = resp[1];
          this.Empresas = resp[2];
          this.Proyectos = resp[3];
          this.formaPagos = resp[4];
          this.TipoSol = resp[5];
          this.Tipogasto = resp[6];
          this.NomBancos = resp[7];
          this.TipoComprobante = tipocomprobantes;
          this.Tipotrans = tipoTrans;
          this.downloadLogo(this.datSess[1])
          this.servicios.getUnParametro('catalogos', '?catalogo=workflows&filtro1=' + encodeURIComponent('idEmpresa=' + this.datSess[1]))
            .pipe().subscribe((res: any) => {
              this.workInicial = res;
              this.workInicial.map((t1: any) => { t1.evento = JSON.parse(t1.evento) });
              this.workInicial.map((dato: any) => {
                dato.nombreObjeto == "Anticipo" ? dato.evento.map((o2: any) => { this.workFlowAnt.push({ estatus: o2.siguienteEstatus }); }) : [];
                dato.nombreObjeto == "Gastos" ? dato.evento.map((o2: any) => { this.workFlowGas.push({ estatus: o2.siguienteEstatus }); }) : [];
                dato.nombreObjeto == "Reporte de Gastos" ? dato.evento.map((o2: any) => { this.workFlowRep.push({ estatus: o2.siguienteEstatus }); }) : [];
                dato.nombreObjeto == "Devoluciones" ? dato.evento.map((o2: any) => { this.workFlowDev.push({ estatus: o2.siguienteEstatus }); }) : [];
                dato.nombreObjeto == "Pagos de Anticipos y reembolsos" ? dato.evento.map((o2: any) => { this.workFlowPag.push({ estatus: o2.siguienteEstatus }); }) : [];
              });
              //this.workFlowAnt=this.workFlowAnt.filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i)
              var uniq: any = {}
              this.workFlowAnt = this.workFlowAnt.filter(obj => !uniq[obj.estatus] && (uniq[obj.estatus] = true));
              this.workFlowAnt.push({estatus:'Pagado'},{estatus:'Pagado Parcial'})	 
              uniq = {};
              this.workFlowGas = this.workFlowGas.filter(obj => !uniq[obj.estatus] && (uniq[obj.estatus] = true));
              this.workFlowGas.push({estatus:'Aprobado'})	
              uniq = {};
              this.workFlowRep = this.workFlowRep.filter(obj => !uniq[obj.estatus] && (uniq[obj.estatus] = true));
              uniq = {};
              this.workFlowDev = this.workFlowDev.filter(obj => !uniq[obj.estatus] && (uniq[obj.estatus] = true));
              this.workFlowDev.push({estatus:'Aprobado'},{estatus:'Pagado'},{estatus:'Pagado Parcial'})	
              uniq = {};
              //this.workFlowPag = this.workFlowPag.filter(obj => !uniq[obj.estatus] && (uniq[obj.estatus] = true));
              this.workFlowPag = [{estatus:'Nuevo'},{estatus:'Enviado'},{estatus:'Pagado'},{estatus:'Rechazado'}];
              this.workFlowGas.push({estatus:'Aprobado'},{estatus:'Rechazado'})	              
              //console.log('*/*/*/****workFlowPag',this.workFlowPag);    
              
              console.log("this.Empresas",this.Empresas)
            });
        });
      }, () => { });
    }


    this.mobileQuery = media.matchMedia('(min-width: 1023px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    router.events.subscribe(val => {
      if (location.path() != "") {
        this.ruta = location.path();
      } else {
        //this.ruta = "Home";
      }
    });
  }

  ngOnInit() {
    this.subscription = this.datosPaso.currentMessage.subscribe(message => this.message = message)
  }
  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
    this.subscription.unsubscribe();
  }

  pasoFiltros() {
    this.datosPaso.changeMessage([{ filtro: 'FFFF|345R|', tipo: this.ruta }]);
  }

  abreBusdqueda(titulo: string, obj: any) {
    let cat: any = [];
    //console.log("this.workFlowGas",this.workFlowGas);
    cat.workflow = this.ruta == '/anticipos' ? this.workFlowAnt :
      this.ruta == '/gastosz' ? this.workFlowGas :
        this.ruta == '/reportesgastos/reportegasto' ? this.workFlowRep :
          this.ruta == '/reportesgastos/reembolso' ? this.workFlowDev :
            this.ruta == '/reportesgastos/devolucion' ? this.workFlowDev :
            this.ruta == '/pagoscolaborador/tesoreria' ? this.workFlowPag : 
              this.ruta == '/pagoscolaborador/ListaPagos' ? this.workFlowPag : [];
    cat.MonedaL = this.MonedaL;
    cat.CentroCosto = this.CentroCosto;
    cat.Empresas = this.Empresas;
    cat.Proyectos = this.Proyectos;
    cat.formaPagos = this.formaPagos;
    cat.TipoComprobante = this.TipoComprobante;
    cat.TipoSol = this.TipoSol;
    cat.Tipogasto = this.Tipogasto;
    cat.NomBancos = this.NomBancos;
    cat.Tipotrans = this.Tipotrans;
    cat.Empresas = this.Empresas;
    obj.titulo = this.ruta;
    obj.cat = cat;
    const dialogRef = this.dialog.open(BuscarDialogContent, {
      width: '70%',
      data: obj
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.event === 'Busca') {
        delete result.data.cat;
        this.datosPaso.changeMessage([{ filtro: result.data, tipo: this.ruta }]);
      } else if (result.event === 'Cancel') {
      }
    });
  }

  downloadLogo(emp:any){
   this.http.get<any>(APIAdmin+'catalogo/?catalogo=empresas&filtro1='+encodeURIComponent('id='+emp), { headers: headers })
        .subscribe((emp: any) => {
            this.FileUrlLogo = emp[0].logoUrlPublica;
        },
        (err:any) => {
            console.log(err);
            this.FileUrlLogo = 'assets/images/logo-light-text.png';
         },
        () => { });
}

  // downloadLogose(emp:any){
	// 	this.servicios.getImage('logos/download', ''+emp)
	// 		.subscribe((logo: any) => {
	// 			this.FileUrlLogo = this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(logo));
	// 		},
	// 		(err:any) => {
	// 			console.log(err);
	// 			this.FileUrlLogo = 'assets/images/logo-light-text.png';
	// 		 }, 
	// 		() => { }); 
	// }

  public getUsuario(id: any, idempresa: any): Observable<any> {
    let usuario = this.http.get<any>(API + 'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1=' + encodeURIComponent('idOcupantePuesto=' + id + ' and idEmpresas=' + idempresa), { headers: headers });
    return forkJoin([usuario]);
  }

  public getDatos(idempresa: any, idCC: any, usuario: any): Observable<any> {
    let monedas = this.http.get<any>(`${APIAdmin}catalogo/?catalogo=monedas`, { headers: headers });
    let centrosCostos = this.http.get<any>(API + 'catalogos/?catalogo=vwCentrosCostos&filtro1=' + encodeURIComponent('idEstructura=' + idCC + ' and idEmpresas=' + idempresa), { headers: headers });
    let empresas = this.http.get<any>(APIAdmin + 'catalogo/?catalogo=empresas&filtro1=' + encodeURIComponent('id=' + idempresa), { headers: headers });
    let proyectos = this.http.get<any>(API + 'catalogos/?catalogo=vwProyectos&filtro1=' + encodeURIComponent('nivelEstructura=' + idCC + ' and idEmpresas=' + idempresa), { headers: headers });
    let formasPagos = this.http.get<any>(`${APIAdmin}catalogo/?catalogo=formasPago`, { headers: headers });
    let tipoSolicitud = this.http.get<any>(`${APIAdmin}catalogo/?catalogo=tipoSolicitud`, { headers: headers });
    let tipoGastos = this.http.get<any>(`${APIAdmin}catalogo/?catalogo=tipoGastos&filtro1=idEmpresas=${idempresa}`, { headers: headers });
    let bancos = this.http.get<any>(`${APIAdmin}catalogo/?catalogo=bancos`, { headers: headers });
    return forkJoin([monedas, centrosCostos, empresas, proyectos, formasPagos, tipoSolicitud, tipoGastos, bancos]);
  }
}

@Component({
  selector: 'dialog-buscar',
  templateUrl: 'dialog-buscar.html',
})
export class BuscarDialogContent {

  titulo: string | undefined;
  local_data: any;
  workInicial: any;
  Tipogasto: any;
  TipoSol: any;
  Bancos: any;
  bancoEmisor: any;
  constructor(
    public dialogRef: MatDialogRef<BuscarDialogContent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    console.log(data);
    this.local_data = { ...data };
    this.titulo = this.local_data.titulo;
    this.Bancos = this.local_data.cat.NomBancos
    switch (this.local_data.titulo) {
      case '/estadocuenta':
      //case '/pagoscolaborador/tesoreria':
      case '/workflow':
      case '/reporteoperacion':
        this.dialogRef.close({ event: 'Cancel' });
        break;
    }
  }

  doFilter(ArrBusq: any) {
    this.local_data.cat.NomBancos = this.filter(ArrBusq)
  }
  filter(values: any) {
    return values.filter((j: any) => j.siglas.toLowerCase().includes(this.local_data.bancoEmisor))
  }

  doAction() {
    this.dialogRef.close({ event: 'Busca', data: this.local_data });
  }

  closeDialog() {
    this.dialogRef.close({ event: 'Cancel' });
  }
}