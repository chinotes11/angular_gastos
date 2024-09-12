import { GastosZList, GastosDetalle, ProdServList, CfdiRelacion, CompNoFiscal } from './gastosz';


export const gastoszLists: GastosZList[] = [
    {      
        idgasto:1,
        tipodecomprobante:'factura',
        fecharegistro:new Date('01/02/2020'),
        fechadeemision:new Date('01/02/2020'),
        tipodegasto:1,
        Estatus:'Nuevo',
        subtotal:5000,
        importetotal:5500,
        moneda:'MX'

    },
];

export const gastoszDetalles: GastosDetalle[] = [
    {      
        idgasto:1,
        tipodecomprobante:'factura',
        fecharegistro:new Date('01/02/2020'),
        fechadeemision:new Date('01/02/2020'),
        tipodegasto:1,
        Estatus:'Nuevo',
        idEstatus:4,
        subtotal:5000,
        importetotal:5500,
        moneda:'MX',
        siguientetarea:'este campo es del workflow',
        idcolaborador:1,
        nombre:'Guillermo Alberto Fischer Rojas',
        notas:'Ninguna',
        empresa:'WeCode Soluciones Informaticas S.C.',
        proyecto:'Desarrollo Gastos',
        centrodecostos:'Seccion Molier',
        archivoxml:'',   //tipo de dato para archivo
        pdfcomprobantegasto:'',  //tipo de dato para archivo
        foliofiscal_cfdi:'04F983',
        fechadetimbrado:new Date('01/02/2020'),
        serie:'2548ED',
        folio:'04F983',
        rfctaxidreceptor:'FIR721116I96',
        razonsocialreceptora:'WeCode Soluciones Informaticas S.C.',
        rfctaxidemisor:'TEFS231244JU6',
        raznsocialemisora:'ZZAZ',
        regimenfiscal:'CHORO DEL REGIMEN FISCAL',
        metododepago:'tRANSFERENCIA',
        formadepago:'anticipo',
        usodecfdi:'ID de Uso de CFDI que viene incluido en el XML',
        descuento:500,
        tasaiva:16,
        montoiva:500,
        tasaieps:28,
        montoieps:350,
        tasaretencionisr:26,
        montoretencionisr:150,
        tasaretencioniva:12,
        montoretencioniva:542,
    },
];

export const prodservLists: ProdServList[] = [
    {
        idgasto:1,
        ProdServ:1,    
        IdProdServ:3,
        detalle:'Servicio de desarrollod e software',    
        clave:'A23',
        cantidad:2,   
        unidad:'servicio',  
        descripcion:'Desarolloar modiulo de gasdtos',    
        precio:20.00,   
        importe:300.00,   
        descuento:50,    
        tasaiva:16,   
        montoiva:40,   
        tasaieps:14,    
        montoieps:66,    
        tasaretencionisr:4,    
        montoretencionisr:22,    
        tasaretencioniva:12,    
        montoretencioniva:18,    
        cuentacontable:356,    
        Estatus:'Nuevo',
    }
];


export const cfdirelLists: CfdiRelacion[] = [
    {      
        idgasto:1,
        idtipocdfirelacionado:1476,
        foliofiscal:500065,
    },
];

export const compnofiscalDetalles: CompNoFiscal[] = [
    {   
        idgasto:1, 
        fechaemision:new Date('01-2-2020'),   
        tipogasto:1,  
        monto:1,  
        moneda:'MXN', 
        folio:3456,   
        concepto:'pago en restaurante',   
        metodopago:'transferencia',   
        cuentacontable:3453,           
    },
];

export const plantillaGastos = [
    {   
        id: 0,
        idGastos: 0,
        folioFactura: '',
        fechaEmision: '',
        fechaTimbrado: '',
        serie: '',
        folio: '',
        rfcReceptor: '',
        razonSocialReceptor: '',
        rfcEmisor: '',
        razonSocialEmisor: '',
        regimenFiscal: '',
        metodoPago: '',
        formaPago: '',
        usoCfdi: '',
        subtotal: 0,
        descuento: 0,
        tasaIva: 0,
        montoIva: 0,
        tasaIeps: 0,
        montoIeps: 0,
        tasaRetencionIsr: 0,
        montoRetencionIsr: 0,
        tasaRetencionIva: 0,
        montoRetencionIva: 0,
        importeTotal: 0,
        idMoneda: '',
        importeAprobado: 0,
        createdAt: '',
        updatedAt: ''         
    },
];

