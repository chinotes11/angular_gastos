import { Routes } from '@angular/router';
import { ListaTesoreriaComponent } from './Tesoreria/lista-tesoreria/tesoreria-lista.component';
import { TransaccionComponent } from './Tesoreria/transaccion/transaccion.component';

import { LayoutPagoComponent } from './LayoutPago/layout-pago/layout-pago.component';
import { DetalleLayoutComponent } from './LayoutPago/detalle-layout/detalle-layout.component';

import { ListaPagoComponent } from './ListaPago/lista-pago/lista-pago.component';
import { ListaConciliarComponent } from './Conciliar/lista-conciliar/lista-conciliar.component';
import { ListaArchivoComponent } from './ArchivRespuesta/lista-archivo/archivo-lista.component';
import { DetalleArchivoComponent } from './ArchivRespuesta/detalle-archivo/detalle-archivo.component';

export const TesoreriaesRoutes: Routes = [
    {
        path: '',
        children: [
            ////////////////////Lista Reportes de Gasto
            {
                path: 'tesoreria',
                component: ListaTesoreriaComponent,
                data: {
                    title: 'Tesorería',
                    urls: [
                        { title: 'Inicio', url: '/Inicio' },
                        { title: 'Tesoreria' },
                        { icono: 'assets/images/iconos/prop.png'}
                    ]
                }
            },{
                path: 'tesoreria/transaccionTesoreria/:id',
                component: TransaccionComponent,
                data: {
                    title: 'Transacción',
                    urls: [
                        { title: 'Inicio', url: '/Inicio' },
                        { title: 'Edita Reporte Gasto' },
                        { icono: 'assets/images/iconos/prop.png'}
                    ]
                }
            },{
                path: 'layoutpago',
                component: LayoutPagoComponent,
                data: {
                    title: 'Layout Envío',
                    urls: [
                        { title: 'Inicio', url: '/Inicio' },
                        { title: 'layoutpago' },
                        { icono: 'assets/images/iconos/prop.png'}
                    ]
                }
            },{
                path: 'layoutpago/DetalleLayout/:id',
                component: DetalleLayoutComponent,
                data: {
                    title: 'Edita Reporte Gasto',
                    urls: [
                        { title: 'Inicio', url: '/Inicio' },
                        { title: 'Edita Reporte Gasto' },
                        { icono: 'assets/images/iconos/prop.png'}
                    ]
                }
            }, {
                path: 'ListaPagos',
                component: ListaPagoComponent,
                data: {
                    title: 'Lista Pagos',
                    urls: [
                        { title: 'Inicio', url: '/Inicio' },
                        { title: 'ListaPagos' },
                        { icono: 'assets/images/iconos/prop.png'}
                    ]
                }
            }, 
            {
                path: 'ListaConciliacion',
                component: ListaConciliarComponent,
                data: {
                    title: 'Conciliación Manual',
                    urls: [
                        { title: 'Inicio', url: '/Inicio' },
                        { title: 'ListaConciliacion' },
                        { icono: 'assets/images/iconos/prop.png'}
                    ]
                }
            },            
            {
                path: 'ListaArchivo',
                component: ListaArchivoComponent,
                data: {
                    title: 'Archivos Respuesta ',
                    urls: [
                        { title: 'Inicio', url: '/Inicio' },
                        { title: 'ListaArchivo' },
                        { icono: 'assets/images/iconos/prop.png'}
                    ]
                }
            },
            {
                path: 'ListaArchivo/DetalleArchivo/:id',
                component: DetalleArchivoComponent,
                data: {
                    title: 'Detalle Archivos Respuesta',
                    urls: [
                        { title: 'Inicio', url: '/Inicio' },
                        { title: 'Detalle Archivo Respuesta' },
                        { icono: 'assets/images/iconos/prop.png'}
                    ]
                }
            }  
        ]
    }  
];
