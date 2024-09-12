import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { DemoMaterialModule } from '../demo-material-module';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ConfirmaDialogComponent } from './acciones/confirma-dialog.component';
import { TesoreriaesRoutes } from './pagocolabora.routing';
import { ReactiveFormsModule } from '@angular/forms';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { FormsModule } from '@angular/forms';
import { LOCALE_ID } from '@angular/core';
import es from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { RequestInterceptor } from '../auth/request.interceptor';

import { ListaTesoreriaComponent } from './Tesoreria/lista-tesoreria/tesoreria-lista.component';
import { GeneraLayoutDialog } from './Tesoreria/lista-tesoreria/tesoreria-lista.component';
import { ConfiguraCuentaDialog } from './Tesoreria/lista-tesoreria/tesoreria-lista.component';

import { TransaccionComponent } from './Tesoreria/transaccion/transaccion.component';

import { LayoutPagoComponent } from './LayoutPago/layout-pago/layout-pago.component';
import { DetalleLayoutComponent } from './LayoutPago/detalle-layout/detalle-layout.component';

import { ListaPagoComponent } from './ListaPago/lista-pago/lista-pago.component';

import { ListaConciliarComponent } from './Conciliar/lista-conciliar/lista-conciliar.component';
import { ConciliarDialogContent } from './Conciliar/lista-conciliar/lista-conciliar.component';

import { ListaArchivoComponent } from './ArchivRespuesta/lista-archivo/archivo-lista.component';
import { RespuestaDialogContent } from './ArchivRespuesta/lista-archivo/archivo-lista.component';
import { DetalleArchivoComponent } from './ArchivRespuesta/detalle-archivo/detalle-archivo.component';

import { PdfViewerModule } from 'ng2-pdf-viewer';


registerLocaleData(es);
@NgModule({
  imports: [
    CommonModule,
    DemoMaterialModule,
    FlexLayoutModule,
    RouterModule.forChild(TesoreriaesRoutes),
    ReactiveFormsModule,
    PerfectScrollbarModule,
    FormsModule,
    PdfViewerModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    DatePipe,
    CurrencyPipe,
    { provide: LOCALE_ID, useValue: "es-Mx" },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestInterceptor,
      multi: true
    }
  ],
  declarations: [
    ListaTesoreriaComponent,
    GeneraLayoutDialog,
    ConfiguraCuentaDialog,
    ConfirmaDialogComponent,
    LayoutPagoComponent,
    ListaPagoComponent,
    ListaConciliarComponent, 
    ConciliarDialogContent,
    TransaccionComponent,
    DetalleLayoutComponent,
    ListaArchivoComponent,
    RespuestaDialogContent,
    DetalleArchivoComponent
  ],
  entryComponents: [
    ConfirmaDialogComponent,
    GeneraLayoutDialog,
    ConfiguraCuentaDialog,
    ConciliarDialogContent,
    RespuestaDialogContent,
  ]
})
export class TesoreriaesModule {}
