
import { Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';

export const InicioRoutes: Routes = [
    {
        path: '',
        component: InicioComponent,
        data: {
            title: 'Inicio',
            urls: [
                { title: 'Inicio', url: '/Inicio' },
                { title: 'Inicio' },
                { icono: 'assets/images/iconos/Complementodepago.png'}
            ]
        }
    }
];
