import { Component, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Data, NavigationEnd, Router } from '@angular/router';
import { MatDialog} from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { forkJoin, Observable, Subscription, throwError } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { catchError, filter, map, mergeMap } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { FormControl, FormGroupDirective, NgForm} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { serviciosService } from "../../Genericos/servicios/servicios.service";
import * as _moment from 'moment';
import { MensajesService } from "../../Genericos/mensajes/mensajes.service";
import { environment } from '../../../environments/environment';
import { TokenService } from '../../auth/token/token.service';
import { HttpClient, HttpHeaders} from '@angular/common/http';
const API = environment.ApiUrl;
const APIAdmin= environment.ApiUrlAdmin;
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

@Component({
  templateUrl: './workflows.component.html',
  styleUrls: ['./workflows.component.scss']
})
export class WorkflowsComponent {
  wfList:MatTableDataSource<any>;
  subscription!: Subscription;
  selection = new SelectionModel<any>(true, []);
  pageInfo: Data = Object.create(null);
  arrsesion: any;
  layout: any;
  spans: any;
  workflows:any;
  workInicial:any;
  catRoles:any;
  idRol:any;
  datSess:any;
  displayedColumns: string[] = ['nombreObjeto','estatusActual','nombreRol','opcion','siguienteEstatus'];  
  @ViewChild(MatSort) sort: MatSort = Object.create(null);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  constructor(
    private servicios: serviciosService,
    public dialog: MatDialog, 
    public datePipe: DatePipe,
    private router: Router,
    private titleService: Title,
    private activatedRoute: ActivatedRoute,
    private mensajes: MensajesService,
    private http: HttpClient,
    private token: TokenService) {
      this.datSess=token.readToken('id','');      
      this.datSess=this.datSess.split(',');
      console.log(this.datSess[0],this.datSess[1]);

      this.idRol=token.readToken('rlsRol','GASTOS');
      this.wfList = new MatTableDataSource();
      this.getUsuario(this.datSess[0],this.datSess[1]).subscribe(rsUs => {
        this.arrsesion=rsUs[0];    
        this.arrsesion.map((t1:any) =>{t1.NombreCompleto= `${t1.nombre} ${t1.apellidoPaterno} ${t1.apellidoMaterno}`; t1.idUser=t1.idOcupantePuesto; t1.idEmpresa=Number(this.datSess[1]); t1.idRoles=this.idRol;});
        //this.anticipo.nombre=this.arrsesion[0].NombreCompleto;
        this.getDatos(this.datSess[1],this.arrsesion[0].idEstructura).subscribe(resp => {
          this.catRoles= resp[0];
          this.Inicio(this.datSess[1]);
        });
      });
 
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

  Inicio(params:any){
    this.servicios.getUnParametro('catalogos','?catalogo=workflows&filtro1='+encodeURIComponent('idEmpresa='+params))
     .pipe( catchError(err => { this.wfList = new MatTableDataSource(); return throwError(err); })   )
     .subscribe(
       (res:any) => {
         console.log(res);
        this.workInicial=res;
        this.workInicial.map((t1: any) =>{t1.evento=JSON.parse(t1.evento)});       
        this.workflows = res.reduce((current:any, next:any) => {
          current.push({ id: next.id, nombreObjeto: next.nombreObjeto, estatusActual: next.estatusActual, nombreRol: Number(next.nombreRol), opcion:next.evento, siguienteEstatus:next.evento })
          return current;
        }, []);
        console.log(this.workflows);
         this.wfList = new MatTableDataSource(this.workflows);         
         this.wfList.paginator = this.paginator!;        
         this.wfList.sort = this.sort;
        },
       (err:any) => {  });  
    
  }
  CambioRol(evento:any, arr:any){
    let valor:any;
     if(evento.value){valor=evento.value;} else{valor=evento.target.value;}
     let envWf={nombreRol: String(valor)};    
     this.servicios.patchDatos(`workflows/${arr.id}`, envWf)
     .pipe(catchError(err => {console.log("ERROR"); return throwError(err);})
       ).subscribe( (gst:any) => {
       console.log(gst);            
       this.mensajes.mensaje('Workflow actualizado con exito.','','success');
     },
     (err:any) => {  },
     () => {console.log('Termino'); });       
  }

  public getDatos (idempresa:any, idCC:any)  : Observable<any>  {
    let roles=this.http.get<any>(API+'catalogos/?catalogo=vwRoles&filtro1='+encodeURIComponent('idModulos=2 and idEmpresas='+idempresa), { headers: headers });
    return forkJoin([roles]);  
  } 

  public getUsuario (id:any,idempresa:any) : Observable<any>  {        
    let usuario=this.http.get<any>(API+'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1='+encodeURIComponent('idOcupantePuesto='+id+' and idEmpresas='+idempresa), { headers: headers });
    return forkJoin([usuario]);         
  }  

}