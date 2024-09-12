import { Routes } from '@angular/router';
import { ListaProveedoresPComponent } from './Proveedores/lista-Proveedores/proveedores-lista.component';
import { AgregarComponent } from './Proveedores/agregar-proveedores/agregar.component';
import { ListaOrdenComponent } from './Ordenes-Compra/lista-Orden/Orden-lista.component';
import { AgregarOrdenComponent } from './Ordenes-Compra/agregar-ordenes/agregar-orden.component';
import { detalleRecepcionComponent } from './Ordenes-Compra/detalle-recepcion/detalle-recepcion.component';
import { EditaFacturasComponent } from './Ordenes-Compra/FacturasOrden/Facturas-edita.component';
import { FacturaListaComponent } from './FacturasProveedor/lista-factura/factura-lista.component';
import { ListaTesoreriaProveedorComponent } from './PagoProveedor/Tesoreria/lista-tesoreria/tesoreria-lista.component';
import { TransaccionComponent } from './PagoProveedor/Tesoreria/transaccion/transaccion.component';

import { LayoutPagoComponent } from './PagoProveedor/LayoutPago/layout-pago/layout-pago.component';
import { DetalleLayoutComponent } from './PagoProveedor/LayoutPago/detalle-layout/detalle-layout.component';

import { ListaPagoComponent } from './PagoProveedor/ListaPago/lista-pago/lista-pago.component';
import { ListaConciliarComponent } from './PagoProveedor/Conciliar/lista-conciliar/lista-conciliar.component';
import { ListaArchivoComponent } from './PagoProveedor/ArchivRespuesta/lista-archivo/archivo-lista.component';
import { DetalleArchivoComponent } from './PagoProveedor/ArchivRespuesta/detalle-archivo/detalle-archivo.component';

export const TesoreriaesRoutes: Routes = [
    {
        path: '',
        children: [
            ////////////////////Lista Reportes de Gasto
            {
                path: 'proveedores',
                component: ListaProveedoresPComponent,
                data: {
                    title: 'Lista de Proveedores',
                    urls: [
                        { title: 'Inicio', url: '/Inicio' },
                        { title: 'Proveedores' },
                        { icono: 'assets/images/iconos/icono-proveedor-png-4.png'}
                    ]
                }
            },
            {
                path: 'proveedores/AgregarProveedores/:id',
                component: AgregarComponent,
                data: {
                    title: 'Agregar Proveedores',
                    urls: [
                        { title: 'Inicio', url: '/Inicio' },
                        { title: 'Agregar Proveedores' },
                        { icono: 'assets/images/iconos/prop.png'}
                    ]
                }
            },
            {
                path: 'ordenes',
                component: ListaOrdenComponent,
                data: {
                    title: 'Lista Ordenes Compra',
                    urls: [
                        { title: 'Inicio', url: '/Inicio' },
                        { title: 'Lista Ordenes Compra' },
                        { icono: 'assets/images/iconos/Orden de compra azul.png'}
                    ]
                }
            },
            {
                path: 'ordenes/AgregarOrdenes/:id',
                component: AgregarOrdenComponent,
                data: {
                    title: 'Agregar Ordenes',
                    urls: [
                        { title: 'Inicio', url: '/Inicio' },
                        { title: 'Agregar Ordenes' },
                        { icono: 'assets/images/iconos/prop.png'}
                    ]
                }
            },
            {
                path: 'ordenes/detalleRecepciones/:id',
                component: detalleRecepcionComponent,
                data: {
                    title: 'Detalle Recepciones',
                    urls: [
                        { title: 'Inicio', url: '/Inicio' },
                        { title: 'Detalle Recepciones' },
                        { icono: 'assets/images/iconos/prop.png'}
                    ]
                }
            },
            {
                path: 'ordenes/Facturas/:id',
                component: EditaFacturasComponent,
                data: {
                    title: 'Edita Facturas',
                    urls: [
                        { title: 'Inicio', url: '/Inicio' },
                        { title: 'Edita Facturas' },
                        { icono: 'assets/images/iconos/prop.png'}
                    ]
                }
            },
            {
                path: 'facturas',
                component: FacturaListaComponent,
                data: {
                    title: 'Lista de Facturas de Proveedor',
                    urls: [
                        { title: 'Inicio', url: '/Inicio' },
                        { title: 'Lista de Facturas de Proveedor' },
                        { icono: 'assets/images/iconos/Factura_de_proveedor.png'}
                    ]
                }
            },
            {
                path: 'pagoproveedor/tesoreriaproveedor',
                component: ListaTesoreriaProveedorComponent,
                data: {
                    title: 'Tesoreria',
                    urls: [
                        { title: 'Inicio', url: '/Inicio' },
                        { title: 'Tesoreria' },
                        { icono: 'assets/images/iconos/prop.png'}
                    ]
                }
            },
            {
                path: 'tesoreriaproveedor/transaccionTesoreria/:id',
                component: TransaccionComponent,
                data: {
                    title: 'Transacción',
                    urls: [
                        { title: 'Inicio', url: '/Inicio' },
                        { title: 'Edita Reporte Gasto' },
                        { icono: 'assets/images/iconos/prop.png'}
                    ]
                }
            },
            {
                path: 'pagoproveedor/layoutpagoproveedor',
                component: LayoutPagoComponent,
                data: {
                    title: 'Layout Historico',
                    urls: [
                        { title: 'Inicio', url: '/Inicio' },
                        { title: 'Layout Historico' },
                        { icono: 'assets/images/iconos/prop.png'}
                    ]
                }
            },
            {
                path: 'layoutpagoproveedor/DetalleLayout/:id',
                component: DetalleLayoutComponent,
                data: {
                    title: 'Detalle Layout',
                    urls: [
                        { title: 'Inicio', url: '/Inicio' },
                        { title: 'Detalle Layout' },
                        { icono: 'assets/images/iconos/prop.png'}
                    ]
                }
            },
            {
                path: 'pagoproveedor/ListaPagosProveedor',
                component: ListaPagoComponent,
                data: {
                    title: 'Listado Pagos',
                    urls: [
                        { title: 'Inicio', url: '/Inicio' },
                        { title: 'Layout Historico' },
                        { icono: 'assets/images/iconos/prop.png'}
                    ]
                }
            },
            {
                path: 'pagoproveedor/ListaConciliacion',
                component: ListaConciliarComponent,
                data: {
                    title: 'Conciliación Manual',
                    urls: [
                        { title: 'Inicio', url: '/Inicio' },
                        { title: 'Conciliación Manual' },
                        { icono: 'assets/images/iconos/prop.png'}
                    ]
                }
            },
            {
                path: 'pagoproveedor/propuestaPago',
                component: ListaArchivoComponent,
                data: {
                    title: 'Propuesta Pago',
                    urls: [
                        { title: 'Inicio', url: '/Inicio' },
                        { title: 'Propuesta Pago' },
                        { icono: 'assets/images/iconos/prop.png'}
                    ]
                }
            },
            {
                path: 'propuestaPago/DetallePropuesta/:id',
                component: DetalleArchivoComponent,
                data: {
                    title: 'Detalle Propuesta',
                    urls: [
                        { title: 'Inicio', url: '/Inicio' },
                        { title: 'Detalle Propuesta' },
                        { icono: 'assets/images/iconos/prop.png'}
                    ]
                }
            },
        ]
    }  
];
