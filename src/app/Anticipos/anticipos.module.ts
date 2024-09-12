import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { DemoMaterialModule } from '../demo-material-module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AgregaAnticiposComponent } from './agrega-anticipos/agrega-anticipos.component';
import { AgregaGstoDialogContent } from './agrega-anticipos/agrega-anticipos.component';
import { ListaAnticiposComponent } from './lista-anticipos/anticipos-lista.component';
import { EditaAnticiposComponent } from './edita-anticipos/anticipos-edita.component';
import { ListaGstoDialogContent } from './edita-anticipos/anticipos-edita.component';
import { ConfirmaDialogComponent } from './acciones/confirma-dialog.component';

import { AnticiposesRoutes } from './anticipos.routing';
import { ReactiveFormsModule } from '@angular/forms';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { FormsModule } from '@angular/forms';
import { LOCALE_ID } from '@angular/core';
import es from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { RequestInterceptor } from '../auth/request.interceptor';
import { PdfViewerModule } from 'ng2-pdf-viewer';

registerLocaleData(es);

@NgModule({
  imports: [
    CommonModule,
    DemoMaterialModule,
    FlexLayoutModule,
    RouterModule.forChild(AnticiposesRoutes),
    ReactiveFormsModule,
    PerfectScrollbarModule,
    FormsModule,
    PdfViewerModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [{
      provide: HTTP_INTERCEPTORS,
      useClass: RequestInterceptor,
      multi: true
    },
    DatePipe,
    { provide: LOCALE_ID, useValue: "es-Mx" },
    
  ],
  declarations: [
    AgregaAnticiposComponent,
    ListaAnticiposComponent,
    EditaAnticiposComponent,
    ConfirmaDialogComponent,
    ListaGstoDialogContent,
    AgregaGstoDialogContent,
  ],
  entryComponents: [
    ConfirmaDialogComponent,
    ListaGstoDialogContent,
    AgregaGstoDialogContent,
  ]
})
export class AnticiposesModule {}
