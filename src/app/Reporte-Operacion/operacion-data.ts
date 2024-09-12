import { ConfigFiltro, FiltroTransaccion, FiltroEstatus, Transacciones} from './operacion';

export const configfiltro: ConfigFiltro[] = [
    {
        idEmpresa:0,  
        idCentrosCostos :0, 
        lstaTrans :[], 
        lstaEstatus:[],    
        FechaInicio :'', 
        FechaFin :''
    },    
];

export const transacciones: Transacciones[] = [
    {
        nombre:'TODO',  
        filtroTrans :[ {
            idTrans:99,  
            nomTrans :'Todos',
            nomtabla:'Todos'
        }],
    }, 
    {
        nombre:'ANTICIPO',  
        filtroTrans :[ {
            idTrans:1,  
            nomTrans :'Aprobado',
            nomtabla:'Anticipo'
        },{
            idTrans:2,  
            nomTrans :'Pagada',
            nomtabla:'Anticipo'
        },{
            idTrans:3,  
            nomTrans :'Pagada parcial',
            nomtabla:'Anticipo'
        }],
    },   
    {
        nombre:'PAGO DE ANTICIPO',  
        filtroTrans :[ {
            idTrans:4,  
            nomTrans :'Pagado',
            nomtabla:'Pago Anticipo'
        }],
    },
    {
        nombre:'COMPROBACIÓN DE GASTOS',  
        filtroTrans :[ {
            idTrans:5,  
            nomTrans :'Aprobado',
            nomtabla:'ComprobacionGastos'
        },{
            idTrans:6,  
            nomTrans :'Pagada',
            nomtabla:'ComprobacionGastos'
        },{
            idTrans:7,  
            nomTrans :'Pagada parcial',
            nomtabla:'ComprobacionGastos'
        }],
    },
    {
        nombre:'REEMBOLSOS',  
        filtroTrans :[ {
            idTrans:8,  
            nomTrans :'Aprobado',
            nomtabla:'Reembolso'
        },{
            idTrans:9,  
            nomTrans :'Pagado',
            nomtabla:'Reembolso'
        },{
            idTrans:10,  
            nomTrans :'Pagado parcial',
            nomtabla:'Reembolso'
        }],
    },   
    {
        nombre:'PAGO DE REEMBOLSOS',  
        filtroTrans :[ {
            idTrans:11,  
            nomTrans :'Pagado',
            nomtabla:'Pago Reembolso'
        }],
    }, 
    {
        nombre:'DEVOLUCIONES',  
        filtroTrans :[ {
            idTrans:12,  
            nomTrans :'Aprobado',
            nomtabla:'Devolucion'
        },{
            idTrans:13,  
            nomTrans :'Pagado',
            nomtabla:'Devolucion'
        }],
    }, 
];

export const filtrotrans: FiltroTransaccion[] = [
    {
        idTrans:1,  
        nomTrans :'Anticipos',
        nomtabla:'Anticipo'
    },       
    {
        idTrans:2,  
        nomTrans :'Pagos de Anticipo',
        nomtabla:'Anticipo'
    },  
    {
        idTrans:3,  
        nomTrans :'Comprobación de Gastos',
        nomtabla:'Gastos'
    },  
    {
        idTrans:4,  
        nomTrans :'Reembolsos',
        nomtabla:'Pagos de Anticipos y reembolsos'
    },  
    {
        idTrans:5,  
        nomTrans :'Pagos de Reembolsos',
        nomtabla:'Pagos de Anticipos y reembolsos'
    },  
    {
        idTrans:6,  
        nomTrans :'Devoluciones',
        nomtabla:'Devoluciones'
    }, //*/  
];



export const filtroestatus: FiltroEstatus[] = [
    {
        idEstatus :1,
        descripcion:'Aprobada',
        nomEstatus:'Aprobado',
        idTPadre:1, 
    },  
    {
        idEstatus :2,
        descripcion:'Pagada',
        nomEstatus:'Pagada',
        idTPadre:1, 
    }, 
    {
        idEstatus :3,
        descripcion:'Pagada parcial',
        nomEstatus:'Pagada parcial',
        idTPadre:1, 
    },    
    {
        idEstatus :4,
        descripcion:'Pagado',
        nomEstatus:'Pagado',
        idTPadre:2, 
    },  
    {
        idEstatus :5,
        descripcion:'Aprobada',
        nomEstatus:'Aprobado',
        idTPadre:3, 
    },  
    {
        idEstatus :6,
        descripcion:'Pagada',
        nomEstatus:'Pagado',
        idTPadre:3, 
    }, 
    {
        idEstatus :7,
        descripcion:'Pagada parcial',
        nomEstatus:'Pagada parcial',
        idTPadre:3, 
    },   
    {
        idEstatus :8,
        descripcion:'Aprobada',
        nomEstatus:'Aprobado',
        idTPadre:4, 
    },  
    {
        idEstatus :9,
        descripcion:'Pagada',
        nomEstatus:'Pagado',
        idTPadre:4, 
    }, 
    {
        idEstatus :10,
        descripcion:'Pagada parcial',
        nomEstatus:'Pagada parcial',
        idTPadre:4, 
    }, 
    {
        idEstatus :11,
        descripcion:'Pagado',
        nomEstatus:'Pagado',
        idTPadre:5, 
    },
    {
        idEstatus :12,
        descripcion:'Aprobada',
        nomEstatus:'Aprobado',
        idTPadre:6, 
    },  
    {
        idEstatus :13,
        descripcion:'Conciliada',
        nomEstatus:'Conciliada',
        idTPadre:6, 
    }, 
];





