export interface ConfigFiltro {  
  idEmpresa:number;
  idCentrosCostos :number;
  lstaTrans:any;  
  lstaEstatus:any; 
  FechaInicio :any; 
  FechaFin :any; 
}

export interface FiltroTransaccion {  
  idTrans:number;
  nomTrans :any;
  nomtabla:any
}

export interface Transacciones {  
  disabled?: boolean;
  nombre: string;
  filtroTrans: FiltroTransaccion[];
}


export interface FiltroEstatus {    
  idEstatus :number;
  descripcion:any;
  nomEstatus:any;
  idTPadre:number;
}
