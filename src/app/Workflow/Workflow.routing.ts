
import { Routes } from '@angular/router';
import { WorkflowsComponent } from './workflows/workflows.component';

export const WorkFlowRoutes: Routes = [
    {
        path: '',
        component: WorkflowsComponent,
        data: {
            title: 'Workflow',
            urls: [
                { title: 'Workflow', url: '/Workflow' },
                { title: 'Workflow' },
                { icono: 'assets/images/iconos/Cargar Datos. blancopng.png'}
            ]
        }
    }
];
