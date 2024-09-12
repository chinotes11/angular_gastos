
import {Persona, LstColaborador, CentroCostos, Banco ,BancoRes , Cuenta,TipoPersona,TipoProveedor, TerminosPago,Nacionalidad,RegimenFiscal,ActividadEconomica,UsoCFDI,Pais,CuentasRec, Empresas, TipoSolicitud, Monedas, ListaGstoA, Conteo, Proyectos, TipoComprobantes, TipoGastos, Cuentas, FormaPagos} from './generales'


export const personaLista: Persona[] = [
    {
        idUser:1,
        Nombre:'Guillermo',
        Paterno:'Fischer',
        Materno:'Rojas',
        IdNomina:'222',
        RFC:'MARA786792',
        Nacionalidad:1, 
        EstatusUsr:'Activo',
        idEmpresa:1,
        idProyecto:1,
        nombreRol:'Colaborador',
        idBancoReceptor:1,
        BancoReceptor:'Bancomer',   
        CuentaReceptor:'5124101895',
        //idCentrosCostos:2,
        //idUsoFondos:1,
    }];

//*/
/*
export interface Persona {  
    cid:1,
    Nombre:'Guillermo',
    Paterno:'Fischer',
    Materno:'Rojas',
    IdNomina:'222',
    RFC:'ROFG786792',
    Nacionalidad:1, 
    EstatusUsr:'',
    Empresa:1,
    nombreRol:'Jefe',
}//*/

export const colaboraLista: LstColaborador[] = [
    {  
        idUser:1,
        Nombre:'Guillermo',
        Paterno:'Fischer',
        Materno:'Rojas',
        IdNomina:'222',
        RFC:'AEDG876523G56',
        Nacionalidad:1, 
        EstatusUsr:'Activo',
        idEmpresa:1,
        idProyecto:1,
        nombreRol:'Colaborador',
        //idCentrosCostos:1,
        //idUsoFondos:1,
    },
    {
        idUser:2,
        Nombre:'Guillermo',
        Paterno:'Fischer',
        Materno:'Rojas',
        IdNomina:'222',
        RFC:'ROFG786792',
        Nacionalidad:1, 
        EstatusUsr:'Activo',
        idEmpresa:1,
        idProyecto:1,
        nombreRol:'Jefe',
        //idCentrosCostos:1,
        //idUsoFondos:1,
    }    
    ]

export const empresa: Empresas[] = [
    {
        idEmpresa:1,
        Empresa:'Wecode',
        Descripcion:'Empresa Wecode',
    }
]



export const centroCosto: CentroCostos[] = [
    {
        idCentrosCostos:1,
        CentroCostos:'Costos Central',
        idEmpresa:1,
    },
    {
        idCentrosCostos:2,
        CentroCostos:'Costos Norte',
        idEmpresa:1,
    },
    {
        idCentrosCostos:3,
        CentroCostos:'Sur',
        idEmpresa:1,
    }
]

export const banco: Banco[] = [
    {
        BancoEmisor:1,
        Banco:'Santander',
        idMoneda:1
    },
    {
        BancoEmisor:2,
        Banco:'Bancomer',
        idMoneda:2
    },
    {
        BancoEmisor:3,
        Banco:'Banamex',
        idMoneda:1
    },
    {
        BancoEmisor:4,
        Banco:'Banamex',
        idMoneda:2
    }
]
export const bancores: BancoRes[] = [
    {
        BancoReceptor:1,
        Banco:'Santander',
        idMoneda:1
    },
    {
        BancoReceptor:2,
        Banco:'Bancomer',
        idMoneda:2
    },
    {
        BancoReceptor:3,
        Banco:'Banamex',
        idMoneda:1
    }
]
export const cuentas: Cuenta[] = [
    {
        BancoEmisor:1,
        idCuenta:1,
        BancoCuenta:'Santander',
        nuCuenta:64655646864,
        alias:'alias',
        idMoneda:1

    },
    {
        BancoEmisor:2,
        idCuenta:2,
        BancoCuenta:'Bancomer',
        nuCuenta:1614651465,
        alias:'alias',
        idMoneda:2

    },
    {
        BancoEmisor:3,
        idCuenta:3,
        BancoCuenta:'Banamex',
        nuCuenta:74985646864,
        alias:'alias',
        idMoneda:2

    },
    {
        BancoEmisor:4,
        idCuenta:4,
        BancoCuenta:'Banamex',
        nuCuenta:74985649725,
        alias:'alias',
        idMoneda:1

    }


]
export const tipoPersona: TipoPersona[] = [
    {
        TipoPersona:'Persona Fisica',
        idPersona:1

    },
    {
        TipoPersona:'Persona Moral',
        idPersona:2

    },
]
export const tipoProveedor: TipoProveedor[] = [
    {
        TipoProveedor:'Servicios',
        idProveedor:1

    },
    {
        TipoProveedor:'Materiales',
        idProveedor:2

    },
    {
        TipoProveedor:'Contratista',
        idProveedor:3

    },
    {
        TipoProveedor:'Grupo',
        idProveedor:4

    },
]
export const terminoPago: TerminosPago[] = [
    {
        TerminoPago:'NETO A 15 DÍAS',
        idTerminoPago:1
    },
    {
        TerminoPago:'NETO A 30 DÍAS',
        idTerminoPago:2
    },
    {
        TerminoPago:'NETO A 45 DÍAS',
        idTerminoPago:3

    },
    {
        TerminoPago:'Vence a final de mes',
        idTerminoPago:4

    },
]
export const nacionalidad: Nacionalidad[] = [
    {
        Nacionalidad:'Nacional',
        idNacionalidad:1

    },
    {
        Nacionalidad:'Extranjero',
        idNacionalidad:2

    },
]
export const regimenFiscal: RegimenFiscal[] = [
    {
        RegFiscal:'Arrendamientos',
        idRegFiscal:1

    },
    {
        RegFiscal:'Demás Ingresos',
        idRegFiscal:2

    },
]
export const actividadEconomica: ActividadEconomica[] = [
    {
        ActividadEconomica:'Agricultura',
        idActividadEconomica:1

    },
    {
        ActividadEconomica:'Mineria',
        idActividadEconomica:2

    },
]
export const usocfdi: UsoCFDI[] = [
    {
        UsoCFDI:'Adquisición de Mercancias',
        idUsoCFDI:1

    },
    {
        UsoCFDI:'Devoluciones, descuentos o bonificaciones',
        idUsoCFDI:2

    },
]
export const pais: Pais[] = [
    {
        Pais:'México',
        idPais:1

    },
    {
        Pais:'EUA',
        idPais:2

    },
]
export const cuentasRec: CuentasRec[] = [
    {
        idCuentaReceptor:1,
        BancoCuentaReceptor:'Santander',
        nuCuenta:64655646864,
        alias:'alias',
        tipo:'tipo'

    },
    {
        idCuentaReceptor:2,
        BancoCuentaReceptor:'Santander',
        nuCuenta:1614651465,
        alias:'alias',
        tipo:'tipo'

    },
    {
        idCuentaReceptor:3,
        BancoCuentaReceptor:'Santander',
        nuCuenta:74985646864,
        alias:'alias',
        tipo:'tipo'

    }
]

export const tipoSol: TipoSolicitud[] = [
    { idUsoFondos: 1, descripcion: 'Caja chica' },
    { idUsoFondos: 2, descripcion: 'Viaticos' },
    { idUsoFondos: 3, descripcion: 'Transporte' },
    { idUsoFondos: 4, descripcion: 'Mercancias' },
  ];


  export const moneda:  Monedas[] = [
    {
        idMoneda:1,
        tipo:'MXN'
    },
    {
        idMoneda:2,
        tipo:'USD'
    },
    {
        idMoneda:3,
        tipo:'EUR'
    },
    {
        idMoneda:4,
        tipo:'GBP'
    },    
]

export const gastos: ListaGstoA[] = [
    { id: 1, descripcion: 'Alimentos - Alimentación', monto:130, selected:false, valor:0 },
    { id: 2, descripcion: 'Alimentos extranjero - Alimentación en el extranjero', monto:500, selected:false, valor:0  },
    { id: 3, descripcion: 'Alimentos sin factura - No deducible', monto:100, selected:false, valor:0  },
    { id: 4, descripcion: 'Autobus - Transporte', monto:2000, selected:false, valor:0  },
    { id: 5, descripcion: 'Avión - Transporte', monto:5000, selected:false, valor:0  },
  ];

  export const conteo: Conteo[] = [
    { id: 5},
    { id: 6},
    { id: 7},
    { id: 8},
    { id: 9},
    { id: 10},
  ];

  export const proyecto: Proyectos[] = [
    { 
        idProyecto:1,
        Proyecto:'Wecode Gastos',
        Descripcion:'Proyecto desarrollo de modulo Gastos.',
    },
  ];

  export const tipocomprobantes: TipoComprobantes[] = [
    { 
        id:1,
        tipo:'Fiscal'
    },
    { 
        id:2,
        tipo:'No Fiscal'
    },
  ];

  export const tipogasto: TipoGastos[] = [
    { 
        idTipo:1,
        tipoG:'Hospedaje'
    },
    { 
        idTipo:2,
        tipoG:'Alimentos'
    },
    { 
        idTipo:3,
        tipoG:'Gasolina'
    },
  ];

  export const cuenta: Cuentas[] = [
    { 
        id:1,
        alaisCta:' PERSONAL SANTANDER'
    },
    { 
        id:2,
        alaisCta:' EMPRESARIAL - BANAMEX'
    },
    { 
        id:3,
        alaisCta:' VIÁTICOS - SI VALE'
    },
  ];

  export const formapago: FormaPagos[] = [
    { 
        id:'01',
        descripcion:'Efectivo'
    },
    { 
        id:'03',
        descripcion:'Transferencia electrónica de fondos'
    },
    { 
        id:'04',
        descripcion:'Tarjeta de crédito'
    },
    { 
        id:'28',
        descripcion:'Tarjeta de débito'
    },
  ];

  


  
  
  
