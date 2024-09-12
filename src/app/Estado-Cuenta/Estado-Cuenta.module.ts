import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { DemoMaterialModule } from '../demo-material-module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { EstadoCuentaComponent } from './Estado-Cuenta.component';
import { ExportarDialogContent } from './Estado-Cuenta.component';
import { EstadoCuentaRoutes } from './Estado-Cuenta.routing';
import { ReactiveFormsModule } from '@angular/forms';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { FormsModule } from '@angular/forms';
import { LOCALE_ID } from '@angular/core';
import es from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';

registerLocaleData(es);

@NgModule({
  imports: [
    CommonModule,
    DemoMaterialModule,
    FlexLayoutModule,
    RouterModule.forChild(EstadoCuentaRoutes),
    ReactiveFormsModule,
    PerfectScrollbarModule,
    FormsModule,
  ],
  providers: [
    DatePipe,
    { provide: LOCALE_ID, useValue: "es-Mx" }
  ],
  declarations: [
    EstadoCuentaComponent,
    ExportarDialogContent
  ],
  entryComponents: [
  ]
})
export class EstadoCuentaModule {}
