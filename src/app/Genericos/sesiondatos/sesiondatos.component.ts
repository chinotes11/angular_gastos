import { Component, Injectable, OnInit } from '@angular/core';
import { catalogoService } from '../catalogosession/catalogos.service';
import { personaLista, colaboraLista, empresa, centroCosto,banco, bancores ,cuentas,tipoPersona,tipoProveedor,terminoPago,nacionalidad,regimenFiscal,actividadEconomica,usocfdi,pais,cuentasRec, tipoSol, moneda, gastos, conteo, proyecto, tipocomprobantes, tipogasto, cuenta, formapago } from '../catalogos/generales-data'


@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'app-sesiondatos',
  templateUrl: './sesiondatos.component.html',
  styleUrls: ['./sesiondatos.component.scss']
})
export class SesiondatosComponent implements OnInit {
  public work1: any;
  public causa1: any;

  constructor(public catalogos: catalogoService) {  }

  public iniciaDatos() {
    window.sessionStorage.setItem("persona", JSON.stringify(personaLista));
    //window.sessionStorage.setItem("colaboradores", JSON.stringify(colaboraLista));
    window.sessionStorage.setItem("empresa", JSON.stringify(empresa));
    window.sessionStorage.setItem("centrocostos", JSON.stringify(centroCosto));  
    window.sessionStorage.setItem("banco", JSON.stringify(banco));      
    window.sessionStorage.setItem("bancores", JSON.stringify(bancores));  
    window.sessionStorage.setItem("cuentas", JSON.stringify(cuentas));  
    window.sessionStorage.setItem("tipoPersona", JSON.stringify(tipoPersona));  
    window.sessionStorage.setItem("tipoProveedor", JSON.stringify(tipoProveedor));  
    window.sessionStorage.setItem("terminoPago", JSON.stringify(terminoPago));  
    window.sessionStorage.setItem("nacionalidad", JSON.stringify(nacionalidad));  
    window.sessionStorage.setItem("regimenFiscal", JSON.stringify(regimenFiscal));  
    window.sessionStorage.setItem("actividadEconomica", JSON.stringify(actividadEconomica));  
    window.sessionStorage.setItem("usocfdi", JSON.stringify(usocfdi));  
    window.sessionStorage.setItem("pais", JSON.stringify(pais));  

    window.sessionStorage.setItem("cuentasRec", JSON.stringify(cuentasRec));  
    window.sessionStorage.setItem("tipoSolicitud", JSON.stringify(tipoSol)); 
    window.sessionStorage.setItem("moneda", JSON.stringify(moneda)); 
    window.sessionStorage.setItem("gastos", JSON.stringify(gastos)); 
    window.sessionStorage.setItem("conteo", JSON.stringify(conteo));   
    window.sessionStorage.setItem("proyecto", JSON.stringify(proyecto)); 
    window.sessionStorage.setItem("tipocomprobantes", JSON.stringify(tipocomprobantes));
    window.sessionStorage.setItem("tipogasto", JSON.stringify(tipogasto)); 
    window.sessionStorage.setItem("cuenta", JSON.stringify(cuenta)); 
    window.sessionStorage.setItem("formapago", JSON.stringify(formapago)); 
    window.sessionStorage.setItem("_origen",'');
    return 'Carga'; 
  }



  public cargaCatalogos(idempresa:any) {
    this.catalogos.getWorkFlows(idempresa).subscribe(responseList => {
      window.sessionStorage.setItem("workflow", JSON.stringify(responseList[0]));
      window.sessionStorage.setItem("bancos", JSON.stringify(responseList[1]));
      window.sessionStorage.setItem("centrosCostos", JSON.stringify(responseList[2]));
      window.sessionStorage.setItem("conceptosCatalogoSAT", JSON.stringify(responseList[3]));
      window.sessionStorage.setItem("areas", JSON.stringify(responseList[4]));
      window.sessionStorage.setItem("monedas", JSON.stringify(responseList[5]));
      window.sessionStorage.setItem("proyectos", JSON.stringify(responseList[6]));
      window.sessionStorage.setItem("tipoGastos", JSON.stringify(responseList[7]));
      window.sessionStorage.setItem("regimenFiscal", JSON.stringify(responseList[8]));
      window.sessionStorage.setItem("tiposSolicitud", JSON.stringify(responseList[9]));
      window.sessionStorage.setItem("empresas", JSON.stringify(responseList[10]));
      window.sessionStorage.setItem("metodosPago", JSON.stringify(responseList[11]));
      window.sessionStorage.setItem("formasPagos", JSON.stringify(responseList[12]));      
        return 'Carga';
    });

  }

  ngOnInit() {
    

  }

}
