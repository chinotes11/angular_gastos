import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { DemoMaterialModule } from '../demo-material-module';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ConfirmaDialogComponent } from './acciones/confirma-dialog.component';
import { ReporteGastoesRoutes } from './reportegasto.routing';
import { ReactiveFormsModule } from '@angular/forms';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { FormsModule } from '@angular/forms';
import { LOCALE_ID } from '@angular/core';
import es from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { RequestInterceptor } from '../auth/request.interceptor';

import { AgregaReporteGastoComponent } from './ReporteGasto/agrega-reportegasto/agrega-reportegasto.component';
import { ListaAnticipoDialog } from './ReporteGasto/agrega-reportegasto/agrega-reportegasto.component';
import { ListaGastoDialog } from './ReporteGasto/agrega-reportegasto/agrega-reportegasto.component';

import { ListaReporteGastoComponent } from './ReporteGasto/lista-reportegasto/reportegasto-lista.component';

import { EditaReporteGastoComponent } from './ReporteGasto/edita-reportegasto/reportegasto-edita.component';
import { ListaAnticipoEditDialog } from './ReporteGasto/edita-reportegasto/reportegasto-edita.component';
import { ListaGastoEditDialog } from './ReporteGasto/edita-reportegasto/reportegasto-edita.component';
import { EditaMontoDialogContent } from './ReporteGasto/edita-reportegasto/reportegasto-edita.component';
import { EditaGastoDialog } from './ReporteGasto/edita-reportegasto/reportegasto-edita.component';
import { DevolRepoDialog } from './ReporteGasto/edita-reportegasto/reportegasto-edita.component';
import { ReembRepoDialog } from './ReporteGasto/edita-reportegasto/reportegasto-edita.component';


import { ListaReembolsosComponent } from './ListaReembolso/lista-reembolso/reembolso-lista.component';
import { EditaReembolsosComponent } from './ListaReembolso/edita-reembolso/reembolso-edita.component';

import { ListaDevolucionesComponent } from './ListaDevolucion/lista-devolucion/devolucion-lista.component';
import { EditaDevolucionesComponent } from './ListaDevolucion/edita-devolucion/devolucion-edita.component';

import { PdfViewerModule } from 'ng2-pdf-viewer';


registerLocaleData(es);

@NgModule({
  imports: [
    CommonModule,
    DemoMaterialModule,
    FlexLayoutModule,
    RouterModule.forChild(ReporteGastoesRoutes),
    ReactiveFormsModule,
    PerfectScrollbarModule,
    FormsModule,
    PdfViewerModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    DatePipe,
    { provide: LOCALE_ID, useValue: "es-Mx" },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestInterceptor,
      multi: true
    }
  ],
  declarations: [
    AgregaReporteGastoComponent,
    ListaReporteGastoComponent,
    EditaReporteGastoComponent,
    ConfirmaDialogComponent,
    ListaAnticipoDialog,
    ListaGastoDialog,

    ListaAnticipoEditDialog,
    ListaGastoEditDialog,
    EditaMontoDialogContent,
    EditaGastoDialog,
    DevolRepoDialog,
    ReembRepoDialog,

    ListaReembolsosComponent,
    EditaReembolsosComponent,

    ListaDevolucionesComponent,
    EditaDevolucionesComponent,
  ],
  entryComponents: [
    ConfirmaDialogComponent,
    ListaAnticipoDialog,
    ListaGastoDialog,

    ListaAnticipoEditDialog,
    ListaGastoEditDialog,
    EditaMontoDialogContent,
    EditaGastoDialog,
    DevolRepoDialog,
    ReembRepoDialog,
  ]
})
export class ReporteGastoesModule {}
