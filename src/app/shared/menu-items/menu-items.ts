import { Injectable } from '@angular/core';
import { TokenService } from '../../auth/token/token.service'; 

export interface BadgeItem {
  type: string;
  value: string;
}
export interface Saperator {
  name: string;
  type?: string;
}
export interface SubChildren {
  state: string;
  name: string;
  type?: string;
}
export interface ChildrenItems {
  state: string;
  name: string;
  type?: string;
  child?: SubChildren[];
}

export interface Menu {
  state: string;
  name: string;
  type: string;
  icon: string;
  badge?: BadgeItem[];
  saperator?: Saperator[];
  children?: ChildrenItems[];
}

const MENUITEMS = [
  ////////////////////////////// PAGOS
  /*
  {
    state: 'inicio',
    name: 'Inicio',
    type: 'link',
    icon: 'content_copy',
    imagen:'assets/images/iconos/Complementodepago-blanco.png'
  },*/
   {
    state: 'anticipos',
    name: 'Anticipos',
    type: 'link',
    icon: 'content_copy',
    imagen:'assets/images/iconos/Pagos_a_proveedor_BLANCO.png',
		perm: 'var'
  },
  {
    state: 'gastosz',
    name: 'Gastos',
    type: 'link',
    icon: 'content_copy',
    imagen:'assets/images/iconos/Listado_de_pagos_BLANCO.png',
		perm: 'vev'
  },
  {
    state: 'reportesgastos',
    name: 'Reportes Gastos',
    type: 'sub',
    icon: 'bubble_chart',
    imagen:'assets/images/iconos/Factura_de_proveedor_blanco.png',
    perm: 'ver',
    children: [
      { state: 'reportegasto', name: 'Reporte de Gasto', type: 'link', icon: 'content_copy',perm: 'ver' },
      { state: 'reembolso', name: 'Lista Reembolsos', type: 'link', icon: 'content_copy',perm: 'ver'  },
      { state: 'devolucion', name: 'Lista Devoluciones', type: 'link', icon: 'content_copy',perm: 'ver'  },
    ]
  }, 
  {
    state: 'estadocuenta',
    name: 'Estado de Cuenta',
    type: 'link',
    icon: 'content_copy',
    imagen:'assets/images/iconos/Reportes_BLANCO.png',
		perm: 'vas'
  },
  
  
  {
    state: 'pagoscolaborador',
    name: 'Pago Colaborador',
    type: 'sub',
    icon: 'bubble_chart',
    imagen:'assets/images/iconos/prop-blanco.png',
    perm: 'vtc',
    children: [
      { state: 'tesoreria', name: 'Tesorería', type: 'link', icon: 'content_copy',perm: 'vtc'  },
      { state: 'ListaPagos', name: 'Lista Pagos', type: 'link', icon: 'content_copy',perm: 'vtc'  },
      { state: 'layoutpago', name: 'Layout Envío', type: 'link', icon: 'content_copy',perm: 'vtc'  },
      { state: 'ListaArchivo', name: 'Archivos Respuesta', type: 'link', icon: 'content_copy',perm: 'vtc'  },
      { state: 'ListaConciliacion', name: 'Conciliación Manual', type: 'link', icon: 'content_copy',perm: 'vtc' },
    ]
  },
  {
    state: 'reporteoperacion',
    name: 'Reporte Operacion',
    type: 'link',
    icon: 'content_copy',
    imagen:'assets/images/iconos/Complementodepago-blanco.png',
		perm: 'vor'
  },
  {
    state: 'workflow',
    name: 'Workflow',
    type: 'link',
    icon: 'content_copy',
    imagen:'assets/images/iconos/Cargar Datos. blancopng.png',
		perm: 'vwf'
  },
  
];

@Injectable()
export class MenuItems {

  constructor(
		private tokenService: TokenService
	){}

  getMenuitem(): Menu[] {
    var rls: any = this.tokenService.getTokenVar('rls');
		var permisos = rls.split(',').filter((r: any)=>{
			return r.split(':')[1] == 'GASTOS';
		});
		if(permisos.length > 0){
			var acc: any[] = [];
			permisos.map((r: any)=>{
				acc = acc.concat(r.split(':')[3].split('|'));
			});
			//console.log(acc);
      return MENUITEMS.filter((m: any)=> acc.includes(m.perm));
			//return MENUITEMS.filter((m: any)=> acc.includes(m.perm) || m.children.some((o2:any) => acc.includes(o2.perm)));
		}else{
			return [];
		}
    //return MENUITEMS;
  }
}
