import { Component } from '@angular/core';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { TranslateService } from '@ngx-translate/core';
import { MensajesService } from "../../../Genericos/mensajes/mensajes.service";
import { environment } from '../../../../environments/environment';
import { TokenService } from '../../../auth/token/token.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { AuthService } from "../../../auth/auth.service";
const API = environment.ApiUrl;
const APIAdmin = environment.ApiUrlAdmin;
const headers = new HttpHeaders
headers.append('Content-type', 'applicartion.json');

@Component({
  selector: 'app-vertical-header',
  templateUrl: './vertical-header.component.html',
  styleUrls: []
})

export class VerticalAppHeaderComponent {
  arrsesion: any;
  usuario: any;
  idRol: any;
  datSess: any;
  public config: PerfectScrollbarConfigInterface = {};

  // This is for Notifications
  notifications: Object[] = [
    {
      round: 'round-danger',
      icon: 'ti-link',
      title: 'Launch Admin',
      subject: 'Just see the my new admin!',
      time: '9:30 AM'
    },
  ];

  // This is for Mymessages
  mymessages: Object[] = [
    {
      useravatar: 'assets/images/users/1.jpg',
      status: 'online',
      from: 'Pavan kumar',
      subject: 'Just see the my admin!',
      time: '9:30 AM'
    },
  ];

  public selectedLanguage: any = {
    language: 'Español',
    code: 'es',
    type: 'Es',
    icon: 'mx'
  }

  public languages: any[] = [{
    language: 'English',
    code: 'en',
    type: 'US',
    icon: 'us'
  },
  {
    language: 'Español',
    code: 'es',
    icon: 'mx'
  },]

  constructor(private translate: TranslateService,
    private mensajes: MensajesService,
    private http: HttpClient,
    private authService: AuthService,
    private token: TokenService) {
    if (token.readToken('id', '')) {
      this.datSess = token.readToken('id', '');
      this.datSess = this.datSess.split(',');
      this.idRol = token.readToken('rlsRol', 'GASTOS');
      translate.setDefaultLang('es');
      this.getUsuario(this.datSess[0], this.datSess[1]).subscribe(rsUs => {
        this.arrsesion = rsUs[0];
        this.arrsesion.map((t1: any) => { t1.idEmpresa = Number(this.datSess[1]); t1.idRoles = this.idRol; });
        this.usuario = this.arrsesion[0].nombre + ' ' + this.arrsesion[0].apellidoPaterno;
      });
    } else {
      this.usuario = '';
    }
  }

  changeLanguage(lang: any) {
    this.translate.use(lang.code)
    this.selectedLanguage = lang;
  }

  salir() {
    this.authService.logout();
  }

  public getUsuario(id: any, idempresa: any): Observable<any> {
    let usuario = this.http.get<any>(API + 'catalogos/?catalogo=vwEstructuraOrganizacionalEmpresa&filtro1=' + encodeURIComponent('idOcupantePuesto=' + id + ' and idEmpresas=' + idempresa), { headers: headers });
    return forkJoin([usuario]);
  }
}
