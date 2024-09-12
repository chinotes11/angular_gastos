import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { DemoMaterialModule } from '../demo-material-module';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ConfirmaDialogComponent } from './acciones/confirma-dialog.component';
import { TesoreriaesRoutes } from './proveedores.routing';
import { ReactiveFormsModule } from '@angular/forms';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { FormsModule } from '@angular/forms';
import { LOCALE_ID } from '@angular/core';
import es from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { RequestInterceptor } from '../auth/request.interceptor';

import { ListaProveedoresPComponent } from './Proveedores/lista-Proveedores/proveedores-lista.component';
import { AgregarComponent,  } from './Proveedores/agregar-proveedores/agregar.component';
import { TicketDialogContent } from './Proveedores/agregar-proveedores/agregar.component';
import { ListaOrdenComponent } from './Ordenes-Compra/lista-Orden/Orden-lista.component';
import { AgregarOrdenComponent } from './Ordenes-Compra/agregar-ordenes/agregar-orden.component';
import { AgregarDialogContent } from './Ordenes-Compra/agregar-ordenes/agregar-orden.component';
import { detalleRecepcionComponent } from './Ordenes-Compra/detalle-recepcion/detalle-recepcion.component';
import { EditaFacturasComponent } from './Ordenes-Compra/FacturasOrden/Facturas-edita.component';
import { FacturaListaComponent } from './FacturasProveedor/lista-factura/factura-lista.component';
import { ListaTesoreriaProveedorComponent } from './PagoProveedor/Tesoreria/lista-tesoreria/tesoreria-lista.component';
import { TransaccionComponent } from './PagoProveedor/Tesoreria/transaccion/transaccion.component';
import { GeneraLayoutDialog } from './PagoProveedor/Tesoreria/lista-tesoreria/tesoreria-lista.component';

import { LayoutPagoComponent } from './PagoProveedor/LayoutPago/layout-pago/layout-pago.component';
import { DetalleLayoutComponent } from './PagoProveedor/LayoutPago/detalle-layout/detalle-layout.component';

import { ListaPagoComponent } from './PagoProveedor/ListaPago/lista-pago/lista-pago.component';
import { ListaConciliarComponent } from './PagoProveedor/Conciliar/lista-conciliar/lista-conciliar.component';
import { ListaArchivoComponent } from './PagoProveedor/ArchivRespuesta/lista-archivo/archivo-lista.component';
import { DetalleArchivoComponent } from './PagoProveedor/ArchivRespuesta/detalle-archivo/detalle-archivo.component';

import { PdfViewerModule } from 'ng2-pdf-viewer';

/** @module ProveedoresModule */
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
    { provide: LOCALE_ID, useValue: "es-Mx" },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestInterceptor,
      multi: true
    }
  ],
  declarations: [
    ListaProveedoresPComponent,
    ConfirmaDialogComponent,
    AgregarComponent,
    TicketDialogContent,
    ListaOrdenComponent,
    AgregarOrdenComponent,
    AgregarDialogContent,
    detalleRecepcionComponent,
    EditaFacturasComponent,
    FacturaListaComponent,
    ListaTesoreriaProveedorComponent,
    TransaccionComponent,
    GeneraLayoutDialog,
    LayoutPagoComponent,
    DetalleLayoutComponent,
    ListaPagoComponent,
    ListaConciliarComponent,
    ListaArchivoComponent,
    DetalleArchivoComponent
  ],
  entryComponents: [
    ConfirmaDialogComponent,
    TicketDialogContent,
    AgregarDialogContent,
    GeneraLayoutDialog
  ]
})
/** The name of the module. */
export class ProveedoresModule {}
