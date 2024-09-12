import { Component, OnInit, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-confirma-dialog',
  templateUrl: './confirma-dialog.component.html',
})
export class ConfirmaDialogComponent implements OnInit {

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data:any,
    public dialogRef: MatDialogRef<ConfirmaDialogComponent>) { }

  ngOnInit() {
  }

  closeDialog() {
    this.dialogRef.close(false);
  }

}
