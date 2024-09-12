import { Component, OnInit, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-confirma',
  templateUrl: './confirma.component.html',
})
export class ConfirmaComponent implements OnInit {

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data:any,
    public dialogRef: MatDialogRef<ConfirmaComponent>) { }

  ngOnInit() {
  }

  closeDialog() {
    this.dialogRef.close(false);
  }

}
