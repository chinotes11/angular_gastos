import { ReembolsosList, ReembolsosDetalle} from './reembolso';


export const reembolsoLists: ReembolsosList[] = [
    {
        Empresa:'Wecode',  
        NombreColaborador:'Guillermo Alberto Fischer Rojas',  
        ReembolsoRr_Id:1,   
        Monto:46,   
        Moneda:'MXN',   
        FechaRegistro:new Date('01/02/2020'),
        AnticipoApr_Id:4687,   
        ReporteGastosExr_Id:5,   
        CentroCostos:'Montr',   
        IdColaborador:1,   
        Observaciones:'Ninguna',  
        Estatus:'Nuevo' , 
    },
   
];

export const reembolsoDetalles: ReembolsosDetalle[] = [
    {     
        Empresa:'Wecode',  
        NombreColaborador:'Guillermo Alberto Fischer Rojas',  
        ReembolsoRr_Id:1,   
        Monto:46,   
        Moneda:'MXN',   
        FechaRegistro:new Date('01/02/2020'),   
        AnticipoApr_Id:4687,   
        ReporteGastosExr_Id:5,   
        CentroCostos:'Montr',   
        IdColaborador:1,   
        Observaciones:'Ninguna',   
        idEstatus:4,
        Estatus:'Nuevo' ,
    }
];
