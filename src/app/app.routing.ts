import { Routes } from '@angular/router';
import { FullComponent } from './layouts/full/full.component';

export const AppRoutes: Routes = [
    {
        path: '',
        component: FullComponent,
        children: [
            //////Gastos
            {
                path: '',
                redirectTo: '/anticipos',
                pathMatch: 'full'
            },
            {
                path: 'inicio',
                loadChildren: () => import('./Inicio/Inicio.module').then(m => m.InicioModule)
            },
            {
                path: 'estadocuenta',
                loadChildren: () => import('./Estado-Cuenta/Estado-Cuenta.module').then(m => m.EstadoCuentaModule)
            },
            {
                path: 'reporteoperacion',
                loadChildren: () => import('./Reporte-Operacion/Poliza-Contable.module').then(m => m.PolizaContableModule)
            },
            // {
            //     path: 'colaborador',
            //     loadChildren: () => import('./Colaborador/colaborador.module').then(m => m.ColaboradoresModule)
            // },
            {
                path: 'anticipos',
                loadChildren: () => import('./Anticipos/anticipos.module').then(m => m.AnticiposesModule)
            },
            {
                path: 'gastosz',
                loadChildren: () => import('./GastosZ/gastosz.module').then(m => m.GastosZesModule)
            },
            {
                path: 'reportesgastos',
                loadChildren: () => import('./Reporte-Gastos/reportegasto.module').then(m => m.ReporteGastoesModule)
            },
            {
                path: 'pagoscolaborador',
                loadChildren: () => import('./Pago-Colaborador/pagocolabora.module').then(m => m.TesoreriaesModule)
            },
            
            {
                path: 'workflow',
                loadChildren: () => import('./Workflow/Workflow.module').then(m => m.WorkFlowModule)
            },
            
        ]
    }
];
