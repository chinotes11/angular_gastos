import { VisorPdfComponent } from './Visor-pdf.component';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class VisorPdfService {

  constructor(private dialog: MatDialog) { }

  openConfirmDialog(msg:any){
      console.log(msg);      
   return this.dialog.open(VisorPdfComponent,{
        panelClass: "dialog-confirmar",     
        disableClose: true,
        data :{
            message : 'VISOR'
        }
    });
  }

}
