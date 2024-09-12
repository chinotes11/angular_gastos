import { Routes } from '@angular/router';
import { EstadoCuentaComponent } from './Estado-Cuenta.component';

export const EstadoCuentaRoutes: Routes = [
    {
        path: '',
        component: EstadoCuentaComponent,
        data: {
            title: 'Estado de Cuenta por Colaborador',
            urls: [
                { title: 'Inicio', url: '/Inicio' },
                { title: 'Estado de Cuenta por Colaborador' },
                { icono: 'assets/images/iconos/Reportes_NEGRO.png'}
            ]
        }
    }
];
