
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { DemoMaterialModule } from '../demo-material-module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatListModule } from '@angular/material/list';
import { WorkflowsComponent } from './workflows/workflows.component';
import { WorkFlowRoutes } from './Workflow.routing';
import { ReactiveFormsModule } from '@angular/forms';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { FormsModule } from '@angular/forms';
import { LOCALE_ID } from '@angular/core';
import es from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
registerLocaleData(es);

@NgModule({
  imports: [
    CommonModule,
    DemoMaterialModule,
    FlexLayoutModule,
    MatListModule,
    RouterModule.forChild(WorkFlowRoutes),
    ReactiveFormsModule,
    PerfectScrollbarModule,
    FormsModule,
  ],
  providers: [
    DatePipe,
    { provide: LOCALE_ID, useValue: "es-Mx" }
  ],
  declarations: [WorkflowsComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  entryComponents: []
})
export class WorkFlowModule {}
