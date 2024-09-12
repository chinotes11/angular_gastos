export interface Persona {  
  idUser:number;
  Nombre:string;
  Paterno:string;
  Materno:string;
  IdNomina:string;
  RFC:string;
  Nacionalidad:number; 
  EstatusUsr:string;
  idEmpresa:number;
  idProyecto:number;
  nombreRol:string;
  idBancoReceptor:number;
  BancoReceptor:string;
  CuentaReceptor:string;
  //idCentrosCostos:number;
  //idUsoFondos:number;
}

export interface LstColaborador {  
  idUser:number;
  Nombre:string;
  Paterno:string;
  Materno:string;
  IdNomina:string;
  RFC:string;
  Nacionalidad:number;    
  EstatusUsr:string;
  idEmpresa:number;
  idProyecto:number;
  nombreRol:string;
  //idCentrosCostos:number;
  //idUsoFondos:number;
}

export interface Empresas {  
  idEmpresa:number;
  Empresa:string;
  Descripcion:string;
}

export interface Proyectos {  
  idProyecto:number;
  Proyecto:string;
  Descripcion:string;
}

export interface CentroCostos {  
  idCentrosCostos:number;
  CentroCostos:string;
  idEmpresa:number;
}

export interface Banco {  
  BancoEmisor:number;
  Banco:string;
  idMoneda:number;
}
export interface BancoRes {  
  BancoReceptor:number;
  Banco:string;
  idMoneda:number;
}
export interface Cuenta {  
  BancoEmisor:number;
  idCuenta:number;
  BancoCuenta:string;
  nuCuenta:number;
  alias:string;
  idMoneda:number;
}
export interface TipoPersona {  
  TipoPersona:string;
  idPersona:number;
}
export interface TipoProveedor {  
  TipoProveedor:string;
  idProveedor:number;
}
export interface TerminosPago {  
  TerminoPago:string;
  idTerminoPago:number;
}
export interface Nacionalidad {  
  Nacionalidad:string;
  idNacionalidad:number;
}
export interface RegimenFiscal {  
  RegFiscal:string;
  idRegFiscal:number;
}
export interface ActividadEconomica {  
  ActividadEconomica:string;
  idActividadEconomica:number;
}
export interface UsoCFDI {  
  UsoCFDI:string;
  idUsoCFDI:number;
}
export interface Pais {  
  Pais:string;
  idPais:number;
}
export interface CuentasRec {  
  idCuentaReceptor:number;
  BancoCuentaReceptor:string;
  nuCuenta:number;
  alias:string;
  tipo:string;
}

export interface TipoSolicitud {
  idUsoFondos: number;
  descripcion: string;
}

export interface Monedas {  
  idMoneda: number;
  tipo: string;
}

export interface ListaGstoA {
  id: number;
  descripcion: string;
  monto:number;  
  selected:boolean;
  valor:number;
}

export interface Conteo {
  id: number;
}

export interface TipoComprobantes {
  id: number;
  tipo:string;
}

export interface TipoGastos {
  idTipo: number;
  tipoG:string;
}

export interface Cuentas {
  id: number;
  alaisCta:string;
}

export interface FormaPagos {
  id: string;
  descripcion:string;
}




