import { TesoreriaList, DatosFiscales,DatosFinancieros,DatosUsuario,TransaccionPago, CompGastoList, TotalesList, ConceptosDetalle, EditaMontoDetalle} from './tesoreria';


export const tesoreriaLists: TesoreriaList[] = [
    {
        IdColaborador:1, 
        NombreComercial:'IZZI', 
        RazonSocial:'Empresas Cablevisión, S.A.B. de C.V.',   
        RFCTAXID:'HMI950125KG8',   
        TipoProveedor:'Servicios',  
        Estatus:'Activo', 
        FechaRegistro:new Date('01/02/2020'),
        razonSocial:'',
        idProveedor:0,
        idTerminoPago:0,
        sitioWeb:'',
        idNacionalidad:0,
        Observaciones:'',
        fecharegistro:''
    },
];
export const datosFiscales: DatosFiscales[] = [
    {
        IdColaboradord:1, 
        idPersona:0, 
        RFC:'',   
        idRegFiscal:0,        
        idActividadEconomica:0,  
        idUsoCFDI:0, 
        idPais:0,
        cp:'',
        calle:'',
        noExterior:'',
        noInterior:'',
        colonia:'',
        alcaldia:'',
        estado:''
    },
];
export const datosFinancieros: DatosFinancieros[] = [
    {
        IdColaboradorf:1,
        idBanco:0, 
        sucursal:'',   
        idMoneda:0,        
        cuenta:'',  
        cveinter:'', 
        convenio:'',
        codigo:'',
        codigoA:'',
        id_erp:0,
    },
];
export const datosUsuario: DatosUsuario[] = [
    {
    IdColaboradoru:1, 
    nombre:'', 
    email:'',   
    telefono:'',        
    opciones:'',  
    },
];
export const tesoreriaDetalles: TransaccionPago[] = [
    {     
    Empresa:'Wecode',  
    NombreColaborador:'Guillermo Fischer',  
    TipoTransaccion:'Reembolso',  
    IdTipoTransaccion:1,  
    MontoTransaccion:15623,  
    FechaAprobacion: new Date('01/02/2020'),
    SaldoPendientePago:5000,  
    TipoCambio:1,  
    IdPago :1,  
    Estatus:'Nuevo',  
    MontoPago:6000,  
    FechaAplicacionPago:new Date('01/02/2020'),
    FormaPago:'TC',
     
    Proyecto:'Migración',  
    CentroCostos:'Principal',  
    IdColaborador:1,  
    Moneda:'MXN',  
    BancoReceptor:1,  
    CuentaReceptor:'1614651465',  
    BancoEmisor:2,  
    CuentaEmisora:'64655646864',  
    FechaRegistroPago:new Date('01/02/2020'),
    ReferenciaPago:'324',  
    Folio:'589',  
    ClaveRastreo:'ADRT748',  
    FechaConciliacion:new Date('01/02/2020'),  
    Observaciones:'NINGUNA', 

    },
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
        Montototal :2345,
        MontoComprobado :1563
    },
    {   
        idgasto:1,   
        Tipogastos:'Taxi',    
        Montototal :322,
        MontoComprobado :153
    },
    {   
        idgasto:1,   
        Tipogastos:'Gasolina',    
        Montototal :853,
        MontoComprobado :563
    },
    {   
        idgasto:1,   
        Tipogastos:'Otro Sin Factura',    
        Montototal :312,
        MontoComprobado :63
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