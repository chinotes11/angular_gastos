import { AnticiposList, EstatusA, NacionA, TipoPagoA, GastosSolicA, ListaGstoA, Periodo, TipoSolicitud } from './anticipos';


export const Estatuss: EstatusA[] = [
    { value: 1, viewValue: 'Por aprobar' },
    { value: 2, viewValue: 'Aprobada' },
    { value: 3, viewValue: 'Por Desembolsar' }
  ];
  
export const Nacionalidad: NacionA[] = [
    { value: 1, viewValue: 'MXN.' },
    { value: 2, viewValue: 'USD.' },
    { value: 3, viewValue: 'EUR.' }
  ];
  
  export const Pagos: TipoPagoA[] = [
    { value: 1, viewValue: 'Pago Fondos' },
    { value: 2, viewValue: 'Pago Reembolso' }
  ];
  
  export const LstGst: ListaGstoA[] = [
    { id: 1, descripcion: 'Alimentos - Alimentación', monto:130, selected:false, valor:0 },
    { id: 2, descripcion: 'Alimentos extranjero - Alimentación en el extranjero', monto:500, selected:false, valor:0  },
    { id: 3, descripcion: 'Alimentos sin factura - No deducible', monto:100, selected:false, valor:0  },
    { id: 4, descripcion: 'Autobus - Transporte', monto:2000, selected:false, valor:0  },
    { id: 5, descripcion: 'Avión - Transporte', monto:5000, selected:false, valor:0  },
  ];
  
  export const anticiposLista :AnticiposList[] = [
    {
        id: 1,
        nombre:'Guillermo Fischer',
        idanticipo:1,
        FechaRegistro: new Date('06/01/2021'),
        idTipoSolicitid:'2.1',
        TipoSolicitud:'Pago Fondos',
        Motivo:'Viaticos',
        FechaInicio: new Date('06/10/2021'),
        FechaFin: new Date('06/16/2021'),
        diasDura:5,
        Estatus:'Nuevo', //preguntar a Jezz
        idestatus:2,
        Monto: 6785,
        Moneda: 'MXN',
        idMoneda:1
    },{
        id: 1,
        nombre:'Guillermo Fischer',
        idanticipo:2,
        FechaRegistro: new Date('06/01/2021'),
        idTipoSolicitid:'2.2',
        TipoSolicitud:'Pago gastos',
        Motivo:'Gasolina',
        FechaInicio: new Date('06/05/2021'),
        FechaFin: new Date('06/07/2021'),
        diasDura:5,
        Estatus:'Nuevo', //preguntar a Jezz
        idestatus:2,
        Monto: 9863,
        Moneda: 'MXN',
        idMoneda:1
    }
  ];

  export const GastoSol: GastosSolicA[] = [
    { id: 1, idanticipo:3, idgasto:1, descripcion: 'Alimentos - Alimentación', diasDura:5,  monto: 130, comentarios:'' }
  ];

  export const periodoss: Periodo[] = [
    { cid: 1, fechainicio: new Date('05/06/2021'), fechafin:new Date('06/06/2021'), }
  ];

  export const tipoSol: TipoSolicitud[] = [
    { id: '2.1', descripcion: 'Caja chica' },
    { id: '2.2', descripcion: 'Viaticos' }
  ];

/*

  TIPO DE SOLICITUD: 
   2.1 Caja chica
   2.2. viáticos
*/