import { DevolucionesList, DevolucionesDetalle} from './devolucion';


export const devolucionLists: DevolucionesList[] = [
    {
        Empresa:'Wecode',  
        NombreColaborador:'Guillermo Alberto Fischer Rojas',  
        DevolucionRf_Id:1,   
        Monto:1562,   
        Moneda:'MXN',   
        FechaRegistro:new Date('01/02/2020'),
        AnticipoApr_Id:1,   
        ReporteGastosExr_Id:5,   
        CentroCostos:'Montr',   
        IdColaborador:1,   
        Observaciones:'Ninguna',  
        Estatus:'Nuevo' , 
    },
   
];

export const devolucionDetalles: DevolucionesDetalle[] = [
    {     
        Empresa:'Wecode',  
        NombreColaborador:'Guillermo Alberto Fischer Rojas',  
        DevolucionRf_Id:1,   
        Monto:1562,   
        Moneda:'MXN',   
        FechaRegistro:new Date('01/02/2020'),   
        AnticipoApr_Id:1,   
        ReporteGastosExr_Id:5,   
        CentroCostos:'Montr',   
        IdColaborador:1,   
        Observaciones:'Ninguna',   
        idEstatus:4,
        Estatus:'Nuevo' ,
    }
];
