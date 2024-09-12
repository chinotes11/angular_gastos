import { Routes } from '@angular/router';
import { ListaAnticiposComponent } from './lista-anticipos/anticipos-lista.component';
import { EditaAnticiposComponent } from './edita-anticipos/anticipos-edita.component';
import { AgregaAnticiposComponent } from './agrega-anticipos/agrega-anticipos.component';

export const AnticiposesRoutes: Routes = [
    {

        path: '',
        component: ListaAnticiposComponent,
        data: {
                    title: 'Listado de Anticipos',
                    urls: [
                        { title: 'Inicio', url: '/Inicio' },
                        { title: 'Anticipos' },
                        { icono: 'assets/images/iconos/Pagos_a_proveedor_NEGRO.png'}
                    ]
                },

       
    },{
        path: 'addAnticipos',
        component: AgregaAnticiposComponent,
        data: {
            title: 'View Invoice',
            urls: [
                { title: 'Dashboard', url: '/dashboard' },
                { title: 'View Invoice' }
            ]
        }
    },
    {
        path: 'editAnticipos/:id',
        component: EditaAnticiposComponent,
        data: {
            title: 'Listado de Anticipos',
            urls: [
                { title: 'Inicio', url: '/Inicio' },
                { title: 'Anticipos' },
                { icono: 'assets/images/iconos/staff_Negro.png'}
            ]
        }
    },
];
