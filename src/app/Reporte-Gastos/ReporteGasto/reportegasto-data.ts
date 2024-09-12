import { ReporteGastoList, ReporteGastoDetalle, CompGastoList, TotalesList, ConceptosDetalle, EditaMontoDetalle} from './reportegasto';


export const reportegastoLists: ReporteGastoList[] = [
    {
        exr_id: 1,
        Motivo:'Pago ',
        FechaInicio: new Date('01/02/2020'),
        FechaFin: new Date('01/02/2020'),
        Total:10000,
        Aprobado:10000,
        Moneda:10000,
        Estatus:'Nuevo',
        idEstatus:4,
        FR_ID:545,
        FR_Monto: 10000,
        RR_ID:768,
        RR_Monto:10000,
        RF_ID:235,
        RF_Monto:10000,
    },
    {
      exr_id: 2,
      Motivo:'Pago Viaticos',
      FechaInicio: new Date('01/02/2020'),
      FechaFin: new Date('01/02/2020'),
      Total:10000,
      Aprobado:10000,
      Moneda:10000,
      Estatus:'Nuevo',
      idEstatus:4,
      FR_ID:332,
      FR_Monto: 10000,
      RR_ID:441,
      RR_Monto:10000,
      RF_ID:551,
      RF_Monto:10000,
  },
];

export const reportegastoDetalles: ReporteGastoDetalle[] = [
    {     
        exr_id:1,   
        Motivo:'Vije de negocios',   
        Fechainicio:new Date('01/02/2020'),   
        Fechafin:new Date('01/02/2020'),   
        Moneda:'MXP',   
        Estatus:'Nuevo',   
        Anticipoapr_Id:1,   
        Monto:4562.36,   
        Empresa:'WeCode',   
        idEstatus:1,
        Proyecto:'Desrrollo modulo gastos',  
        Centrocostos:'Molier',   
        C_ID:1,   
        Nombre:'Guillermo fischer',   
        Fecharegistro:new Date('01/02/2020'),

    },
    {     
        exr_id:2,   
        Motivo:'Vije de negocios',   
        Fechainicio:new Date('01/02/2020'),   
        Fechafin:new Date('01/02/2020'),   
        Moneda:'MXP',   
        Estatus:'Nuevo',   
        Anticipoapr_Id:2,   
        Monto:4562.36,   
        Empresa:'WeCode',   
        idEstatus:1,
        Proyecto:'Desrrollo modulo gastos',  
        Centrocostos:'Molier',   
        C_ID:1,   
        Nombre:'Guillermo fischer',   
        Fecharegistro:new Date('01/02/2020'),

    }
];

export const compgastoLists: CompGastoList[] = [
    {
        idgasto:1,
        Idcomp:1, 
        TipoGasto:'Vacaciones pasgadas',  
        FechaGasto:new Date('01-2-2020'),   
        TipoComprobante:'Factura',
        Concepto:'Pago de hotel',  
        FormaPago:'Efectivo',
        CuentaPago:'2394defa21',  
        Subtotal:23434,   
        ImporteTotal:324,   
        Moneda:2,
        MontoAutorizado:2342,  
        Estatus:'Por aprobar'  
    }
];

export const totalesLists: TotalesList[] = [
    {   
        idgasto:1,   
        Tipogastos:'Alimento',    
        Montototal :2345
    },
    {   
        idgasto:1,   
        Tipogastos:'Taxi',    
        Montototal :322
    },
    {   
        idgasto:1,   
        Tipogastos:'Gasolina',    
        Montototal :853
    },
    {   
        idgasto:1,   
        Tipogastos:'Otro Sin Factura',    
        Montototal :312
    },
];

export const conceptosDetalles: ConceptosDetalle[] = [

    {   
        idgasto:1,

        antid:1,  
        antMontocomprobado:2334,   
        antMontoAutorizado :4364,  
        
        totGaid:1,   
        totGaMontocomprobado:2344,   
        totGaMontoAutorizado :7545,  
    
        reemid:1,   
        reemMontocomprobado:1323,   
        reemMontoAutorizado :6534,  
    
        rridid:1,   
        rridMontocomprobado:1,   
        rridMontoAutorizado :6544,  
    
        devoid:1,   
        devoMontocomprobado:234,   
        devoMontoAutorizado :3234,  
    
        rfidid:1,   
        rfidMontocomprobado:2345,   
        rfidMontoAutorizado :856,       
    },    
];

export const editamontoDetalles: EditaMontoDetalle[] = [
    {   
        idgasto:1,
        Idcomp:1,
        IdProdServ:1,   
        Detalles:'detalle del producto o servicio',   
        ClaveFiscal:'43656',   
        Cantidad:3456,   
        UnidadMedida:'pieza servicios etc',   
        Descripcion:'lo que trae la factura',   
        PrecioUnitario:87453,     
        Importe:324,   
        MontoAutorizado:234,   
        Descuento:234,   
        TasaIva:16,   
        MontoIva:554,   
        TasaIeps:23,   
        MontoIeps:456,   
        TasaRetencionIsr:23,   
        MontoRetencionIsr:4536,   
        TasaRetencionIva:12,   
        MontoRetencionIva:23434,   
        ImporteTotal:214, 
        TipoGasto:'viaticos',   
        FormaPago:'efectivo',  
        CuentaPago:'sadad',   
        CuentaContable:346456,   
        Observaciones:'Campo de registro de Observaciones',  
        Estatus:'Nuevo',
    },    
];