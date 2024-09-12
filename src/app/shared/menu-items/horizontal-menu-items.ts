import { Injectable } from '@angular/core';

export interface BadgeItem {
    type: string;
    value: string;
}
export interface Saperator {
    name: string;
    type?: string;
}
export interface ChildrenItems {
    state: string;
    name: string;
    type?: string;
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
    {
      state: 'colaboradores',
      name: 'Colaboradores',
      type: 'link',
      icon: 'content_copy',
      imagen:'assets/images/iconos/icono-proveedor-BLANCO.png'
    },
    {
      state: 'solicitudfondos',
      name: 'Solicitud-Fondos',
      type: 'link',
      icon: 'content_copy',
      imagen:'assets/images/iconos/Pagos_a_proveedor_BLANCO.png'
    },
    {
      state: 'gastos',
      name: 'Gastos',
      type: 'link',
      icon: 'content_copy',
      imagen:'assets/images/iconos/Listado_de_pagos_BLANCO.png'
    },/*
    {
      state: 'reportegastos',
      name: 'Reporte de Gastos',
      type: 'link',
      icon: 'content_copy',
      imagen:'assets/images/iconos/Factura_de_proveedor_blanco.png'
    },*/
    {
      state: 'reportesgsto',
      name: 'Reportes Gastos',
      type: 'sub',
      icon: 'bubble_chart',
      imagen:'assets/images/iconos/Factura_de_proveedor_blanco.png',
      children: [
        { state: 'reportegastos', name: 'Reporte de Gasto', type: 'link',icon: 'content_copy' },
        { state: 'lstadevolucion', name: 'Lista Devolución', type: 'link' },
        { state: 'lstareembolso', name: 'Lista Reembolsos', type: 'link' },
        { state: 'lstarepgasto', name: 'Lista Rep Gsto', type: 'link' },
      ]
    },
  ];

@Injectable()
export class HorizontalMenuItems {
    getMenuitem(): Menu[] {
        return MENUITEMS;
    }
}
