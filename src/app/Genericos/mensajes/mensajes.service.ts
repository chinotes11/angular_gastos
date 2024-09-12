import { Injectable } from '@angular/core';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class MensajesService {

  durationInSeconds = 3;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  clase='msj-zazz';
  constructor(private _snackBar: MatSnackBar) {}
  public mensaje(message: string, action: string, tipo:string) {
    switch (tipo) {
      case 'success':
        this.clase='msj-success';
      break;
      case 'danger':
        this.clase='msj-danger';
      break;
      case 'warning':
        this.clase='msj-warning';
      break;
      case 'zazz':
        this.clase='msj-zazz';
      break;
    }; 

    this._snackBar.open(message, action, {
      duration: this.durationInSeconds * 1000,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: [this.clase]
    });
  }

}
