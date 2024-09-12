  export interface GastosZList {  
  idgasto:number;
  tipodecomprobante:string;
  fecharegistro:Date;
  fechadeemision:Date;
  tipodegasto:number;
  Estatus:string;
  subtotal:number;
  importetotal:number;
  moneda:string;
  
  }

  export interface GastosDetalle {  
    idgasto:number;
    tipodecomprobante:string;
    fecharegistro:Date;
    fechadeemision:Date;
    tipodegasto:number;
    Estatus:string;
    idEstatus:number;
    subtotal:number;
    importetotal:number;
    moneda:string;
    siguientetarea:string;
    idcolaborador:number;
    nombre:string;
    notas:string;
    empresa:string;
    proyecto:string;
    centrodecostos:string;
    archivoxml:string;   //tipo de dato para archivo
    pdfcomprobantegasto: string; //tipo de dato para archivo
    foliofiscal_cfdi:string;
    fechadetimbrado:Date;
    serie:string;
    folio:string;
    rfctaxidreceptor:string;
    razonsocialreceptora:string;
    rfctaxidemisor:string;
    raznsocialemisora:string;
    regimenfiscal:string;
    metododepago:string;
    formadepago:string;
    usodecfdi:string;
    descuento:number;
    tasaiva:number;
    montoiva:number;
    tasaieps:number;
    montoieps:number;
    tasaretencionisr:number;
    montoretencionisr:number;
    tasaretencioniva:number;
    montoretencioniva:number;

  }

  export interface Causa {  
    llaveCausa:number,
    descripcionCausa:string,
  }

  export interface ProdServList {  
    idgasto:number; 
    ProdServ:number;    
    IdProdServ:number;    
    detalle:string;    
    clave:string;    
    cantidad:number;    
    unidad:string;    
    descripcion:string;    
    precio:number;    
    importe:number;    
    descuento:number;    
    tasaiva:number;    
    montoiva:number;    
    tasaieps:number;    
    montoieps:number;    
    tasaretencionisr:number;    
    montoretencionisr:number;    
    tasaretencioniva:number;    
    montoretencioniva:number;    
    cuentacontable:number;    
    Estatus: string;    
  }

  export interface CfdiRelacion {  
    idgasto:number; 
    idtipocdfirelacionado:number;   
    foliofiscal:number;   
  }

  export interface CompNoFiscal {  
    idgasto:number;   
    fechaemision:Date;   
    tipogasto:number;   
    monto:number;   
    moneda: string;    
    folio:number;   
    concepto:string;   
    metodopago:string;      
    cuentacontable:number;  
  }
