import { ConfirmaDialogComponent } from './confirma-dialog.component';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';


@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private dialog: MatDialog) { }

  openConfirmDialog(msg:any){
      console.log(msg);
      
   return this.dialog.open(ConfirmaDialogComponent,{
        panelClass: "dialog-confirmar",     
        disableClose: true,
        data :{
            message : msg
        }
    });
  }
}
