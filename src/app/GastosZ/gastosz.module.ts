import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { DemoMaterialModule } from '../demo-material-module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AgregaGastosZComponent } from './agrega-gastosz/agrega-gastosz.component';
import { ListaGastosZComponent } from './lista-gastosz/gastosz-lista.component';
import { EditaGastosZComponent } from './edita-gastosz/gastosz-edita.component';
import { ConfirmaDialogComponent } from './acciones/confirma-dialog.component';

import { GastosZesRoutes } from './gastosz.routing';
import { ReactiveFormsModule } from '@angular/forms';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { FormsModule } from '@angular/forms';
import { LOCALE_ID } from '@angular/core';
import es from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RequestInterceptor } from '../auth/request.interceptor';
import { PdfViewerModule } from 'ng2-pdf-viewer';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}


registerLocaleData(es);

@NgModule({
  imports: [
    CommonModule,
    DemoMaterialModule,
    FlexLayoutModule,
    RouterModule.forChild(GastosZesRoutes),
    ReactiveFormsModule,
    PerfectScrollbarModule,
    FormsModule,
    PdfViewerModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
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
    AgregaGastosZComponent,
    ListaGastosZComponent,
    EditaGastosZComponent,
    ConfirmaDialogComponent,
  ],
  entryComponents: [
    ConfirmaDialogComponent,
  ]
})
export class GastosZesModule {}
