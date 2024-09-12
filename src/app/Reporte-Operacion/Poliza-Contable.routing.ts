import { Routes } from '@angular/router';
import { PolizaContableComponent } from './lista-poliza/Poliza-Contable.component';

export const PolizaContableRoutes: Routes = [
    {
        path: '',
        component: PolizaContableComponent,
        data: {
            title: 'Reporte de Operación',
            urls: [
                { title: 'Inicio', url: '/Inicio' },
                { title: 'Reporte de Operación' },
                { icono: 'assets/images/iconos/Complementodepago.png'}
            ]
        }
    }
];
