  export interface ReembolsosList {  
    Empresa: string;   
    NombreColaborador:string;   
    ReembolsoRr_Id:number;   
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

  export interface ReembolsosDetalle {  
    Empresa: string;   
    NombreColaborador:string;   
    ReembolsoRr_Id:number;   
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
