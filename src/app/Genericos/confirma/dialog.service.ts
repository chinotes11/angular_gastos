import { ConfirmaComponent } from './confirma.component';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';


@Injectable({
  providedIn: 'root'
})
export class ConfirmaService {

  constructor(private dialog: MatDialog) { }

  openConfirmDialog(msg:any){
      console.log(msg);
      
   return this.dialog.open(ConfirmaComponent,{
        panelClass: "dialog-confirmar",     
        disableClose: true,
        data :{
            message : msg
        }
    });
  }
}
