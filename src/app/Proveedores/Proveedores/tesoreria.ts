  export interface TesoreriaList {  
    IdColaborador:number, 
    NombreComercial:string, 
    RazonSocial:string,   
    RFCTAXID:string,   
    TipoProveedor:string,  
    Estatus:string, 
    FechaRegistro:Date,
    razonSocial:string,
    idProveedor:number,
    idTerminoPago:number,
    sitioWeb:string,
    idNacionalidad:number,
    Observaciones:string,
    fecharegistro:string
  }
  export interface DatosFiscales {  
    IdColaboradord:number, 
    idPersona:number, 
        RFC:string,   
        idRegFiscal:number,        
        idActividadEconomica:number,  
        idUsoCFDI:number, 
        idPais:number,
        cp:string,
        calle:string,
        noExterior:string,
        noInterior:string,
        colonia:string,
        alcaldia:string,
        estado:string
  }
  export interface DatosFinancieros {  
    IdColaboradorf:number, 
    idBanco:number, 
    sucursal:string,   
    idMoneda:number,        
    cuenta:string,  
    cveinter:string, 
    convenio:string,
    codigo:string,
    codigoA:string,
    id_erp:number,
  }
  export interface DatosUsuario {  
    IdColaboradoru:number, 
    nombre:string, 
    email:string,   
    telefono:string,        
    opciones:string,  
  }
  export interface TransaccionPago {  
    Empresa:string;   
    NombreColaborador:string;   
    TipoTransaccion:string;   
    IdTipoTransaccion:number;   
    MontoTransaccion:number;   
    FechaAprobacion: Date;  
    SaldoPendientePago:number;   
    TipoCambio:number;   
    IdPago :number;   
    Estatus:string;   
    MontoPago:number;   
    FechaAplicacionPago:Date;   
    FormaPago:string; 
     
    Proyecto:string;   
    CentroCostos:string;   
    IdColaborador:number;   
    Moneda:string;   
    BancoReceptor:number;   
    CuentaReceptor:string;
      
    BancoEmisor:number;   
    CuentaEmisora:string;   
    FechaRegistroPago:Date;   
    ReferenciaPago:string;   
    Folio:string;   
    ClaveRastreo:string;   
    FechaConciliacion:Date;   
    Observaciones:string;          
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
    MontoComprobado :number; 
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