  export interface ReporteGastoList {  
    exr_id: number;
    Motivo:string,
    FechaInicio:Date,
    FechaFin:Date,
    Total:number,
    Aprobado:number,
    Moneda:number,
    Estatus:string;
    idEstatus:number;
    FR_ID:number,
    FR_Monto:number,
    RR_ID:number,
    RR_Monto:number,
    RF_ID:number,
    RF_Monto:number  
  }

  export interface ReporteGastoDetalle {  
    exr_id:number;   
    Motivo:string;   
    Fechainicio:Date;   
    Fechafin:Date;   
    Moneda:string;   
    Estatus:string;   
    Anticipoapr_Id:number;   
    Monto:number;   
    Empresa:string   
    idEstatus:number;
    Proyecto:string;  
    Centrocostos:string;   
    C_ID:number;   
    Nombre:string;   
    Fecharegistro:Date;   
  }

  export interface Causa {  
    llaveCausa:number,
    descripcionCausa:string,
  }

  export interface CompGastoList {  
    idgasto:number; 
    Idcomp:number;  
    TipoGasto:string;   
    FechaGasto:Date;   
    TipoComprobante:string;   
    Concepto:string;   
    FormaPago:string   
    CuentaPago:string   
    Subtotal:number;   
    ImporteTotal:number;   
    Moneda:number;    
    MontoAutorizado:number;   
    Estatus:string;    
     
  }

  export interface TotalesList {  
    idgasto:number;
    Tipogastos:string;    
    Montototal :number; 
  }

  export interface ConceptosDetalle { 
    idgasto:number;

    antid:number;   
    antMontocomprobado:number;   
    antMontoAutorizado :number;  
    
    totGaid:number;   
    totGaMontocomprobado:number;   
    totGaMontoAutorizado :number;  

    reemid:number;   
    reemMontocomprobado:number;   
    reemMontoAutorizado :number;  

    rridid:number;   
    rridMontocomprobado:number;   
    rridMontoAutorizado :number;  

    devoid:number;   
    devoMontocomprobado:number;   
    devoMontoAutorizado :number;  

    rfidid:number;   
    rfidMontocomprobado:number;   
    rfidMontoAutorizado :number;  
  }


  export interface EditaMontoDetalle {   
    idgasto:number ;
    Idcomp:number;    
    IdProdServ:number;   
    Detalles:string;   
    ClaveFiscal:string;   
    Cantidad:number;   
    UnidadMedida:string;   
    Descripcion:string;   
    PrecioUnitario:number;    
    Importe:number;   
    MontoAutorizado:number;   
    Descuento:number;   
    TasaIva:number;   
    MontoIva:number;   
    TasaIeps:number;   
    MontoIeps:number;   
    TasaRetencionIsr:number;   
    MontoRetencionIsr:number;   
    TasaRetencionIva:number;   
    MontoRetencionIva:number;   
    ImporteTotal:number; 
    TipoGasto:string   
    FormaPago:string   
    CuentaPago:string   
    CuentaContable:number;   
    Observaciones:string;  
    Estatus:string; 
 
  }