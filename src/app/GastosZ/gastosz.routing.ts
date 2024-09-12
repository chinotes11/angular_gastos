import { Routes } from '@angular/router';
import { ListaGastosZComponent } from './lista-gastosz/gastosz-lista.component';
import { EditaGastosZComponent } from './edita-gastosz/gastosz-edita.component';
import { AgregaGastosZComponent } from './agrega-gastosz/agrega-gastosz.component';

export const GastosZesRoutes: Routes = [
    {

        path: '',
        component: ListaGastosZComponent,
        data: {
                    title: 'Gastos',
                    urls: [
                        { title: 'Inicio', url: '/Inicio' },
                        { title: 'GastosZ' },
                        { icono: 'assets/images/iconos/Listado_de_pagos_NEGRO.png'}
                    ]
                },

       
    },{
        path: 'addGastosZ',
        component: AgregaGastosZComponent,
        data: {
            title: 'Agrega Gasto',
            urls: [
                { title: 'Dashboard', url: '/dashboard' },
                { title: 'View Invoice' }
            ]
        }
    },
    {
        path: 'editGastosZ/:id/:ubica',
        component: EditaGastosZComponent,
        data: {
            title: 'Edita Gastos',
            urls: [
                { title: 'Inicio', url: '/Inicio' },
                { title: 'GastosZ' },
                { icono: 'assets/images/iconos/staff_Negro.png'}
            ]
        }
    },
];
