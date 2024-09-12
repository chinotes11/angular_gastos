  export interface DevolucionesList {  
    Empresa: string;   
    NombreColaborador:string;   
    DevolucionRf_Id:number;   
    Monto:number;   
    Moneda:string ;  
    FechaRegistro:Date;   
    AnticipoApr_Id:number;   
    ReporteGastosExr_Id:number;   
    CentroCostos:string;   
    IdColaborador:number;   
    Observaciones:string; 
    Estatus:string ;   

  }

  export interface DevolucionesDetalle {  
    Empresa: string;   
    NombreColaborador:string;   
    DevolucionRf_Id:number;   
    Monto:number;   
    Moneda:string ;  
    FechaRegistro:Date;   
    AnticipoApr_Id:number;   
    ReporteGastosExr_Id:number;   
    CentroCostos:string;   
    IdColaborador:number;   
    Observaciones:string;  
    idEstatus:number;  
    Estatus:string ;   
  }

  export interface Causa {  
    llaveCausa:number,
    descripcionCausa:string,
  }
