import { coerceNumberProperty } from '@angular/cdk/coercion';

export interface GastosSolicA {
  id: number;
  idanticipo:number;
  idgasto:number;
  descripcion: string;
  diasDura:number;
  monto: number;
  comentarios: string;
}


export interface AnticiposList {
  id: number;
  nombre:string;
  idanticipo:number;
  FechaRegistro: Date;
  idTipoSolicitid:string,
  TipoSolicitud: string;
  Motivo: string;
  FechaInicio: Date;
  FechaFin: Date;
  diasDura:number;
  Estatus: string; //preguntar a Jezz
  idestatus:number;
  Monto: number;
  idMoneda:number,
  Moneda: string;
}



