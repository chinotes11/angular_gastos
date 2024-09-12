import { Routes } from '@angular/router';
import { ListaReporteGastoComponent } from './ReporteGasto/lista-reportegasto/reportegasto-lista.component';
import { EditaReporteGastoComponent } from './ReporteGasto/edita-reportegasto/reportegasto-edita.component';
import { AgregaReporteGastoComponent } from './ReporteGasto/agrega-reportegasto/agrega-reportegasto.component';

import { ListaReembolsosComponent } from './ListaReembolso/lista-reembolso/reembolso-lista.component';
import { EditaReembolsosComponent } from './ListaReembolso/edita-reembolso/reembolso-edita.component';

import { ListaDevolucionesComponent } from './ListaDevolucion/lista-devolucion/devolucion-lista.component';
import { EditaDevolucionesComponent } from './ListaDevolucion/edita-devolucion/devolucion-edita.component';

export const ReporteGastoesRoutes: Routes = [
    {
        path: '',
        children: [
            ////////////////////Lista Reportes de Gasto
            {
                path: 'reportegasto',
                component: ListaReporteGastoComponent,
                data: {
                    title: 'Reporte de Gastos',
                    urls: [
                        { title: 'Inicio', url: '/Inicio' },
                        { title: 'Reporte de Gastos' },
                        { icono: 'assets/images/iconos/Factura_de_proveedor.png'}
                    ]
                }
            },{
                path: 'reportegasto/addReporteGasto',
                component: AgregaReporteGastoComponent,
                data: {
                    title: 'Agrega Reporte Gasto',
                    urls: [
                        { title: 'Dashboard', url: '/dashboard' },
                        { title: 'Agrega Reporte Gasto' }
                    ]
                }
            },{
                path: 'reportegasto/editReporteGasto/:id/:ubica',
                component: EditaReporteGastoComponent,
                data: {
                    title: 'Edita Reporte Gasto',
                    urls: [
                        { title: 'Inicio', url: '/Inicio' },
                        { title: 'Edita Reporte Gasto' },
                        { icono: 'assets/images/iconos/staff_Negro.png'}
                    ]
                }
            },{
                path: 'reembolso',
                component: ListaReembolsosComponent,
                data: {
                    title: 'Reembolsos',
                    urls: [
                        { title: 'Inicio', url: '/Inicio' },
                        { title: 'Reembolsos' },
                        { icono: 'assets/images/iconos/Factura_de_proveedor.png'}
                    ]
                }
            },{
                path: 'reembolso/editReembolsos/:id',
                component: EditaReembolsosComponent,
                data: {
                    title: 'Edita Reembolsos',
                    urls: [
                        { title: 'Inicio', url: '/Inicio' },
                        { title: 'Edición de Reembolsos' },
                        { icono: 'assets/images/iconos/staff_Negro.png'}
                    ]
                }
            },{
                path: 'devolucion',
                component: ListaDevolucionesComponent,
                data: {
                    title: 'Devoluciones',
                    urls: [
                        { title: 'Inicio', url: '/Inicio' },
                        { title: 'Devoluciones' },
                        { icono: 'assets/images/iconos/Factura_de_proveedor.png'}
                    ]
                }
            },{
                path: 'devolucion/editDevoluciones/:id',
                component: EditaDevolucionesComponent,
                data: {
                    title: 'Edita Devoluciones',
                    urls: [
                        { title: 'Inicio', url: '/Inicio' },
                        { title: 'Edición de Devoluciones' },
                        { icono: 'assets/images/iconos/staff_Negro.png'}
                    ]
                }
            },
        ]
    }
  
];
