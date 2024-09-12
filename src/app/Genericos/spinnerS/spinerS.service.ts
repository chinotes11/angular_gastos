import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { defer, NEVER } from 'rxjs';
import { finalize, share } from 'rxjs/operators';
import { SpinnerSComponent } from './spinnerS.component';

@Injectable({
  providedIn: 'root',
})
export class SpinnerOverlayService {
    private overlayRef!: OverlayRef;
  
    constructor(private readonly overlay: Overlay) {}
  
    public readonly spinner$ = defer(() => {
      this.show();
      return NEVER.pipe(
        finalize(() => {
          this.hide();
        })
      );
    }).pipe(share());
  
    private show(): void {
      console.log('SpinnerOverlayService ~ show spinner');
      // Hack avoiding `ExpressionChangedAfterItHasBeenCheckedError` error
      Promise.resolve(null).then(() => {
        this.overlayRef = this.overlay.create({
          positionStrategy: this.overlay
            .position()
            .global()
            .centerHorizontally()
            .centerVertically(),
          hasBackdrop: true,
        });
        this.overlayRef.attach(new ComponentPortal(SpinnerSComponent));
      });
    }
  
    private hide(): void {
      console.log('SpinnerOverlayService ~ hide spinner');
      this.overlayRef.detach();
      this.overlayRef!;
    }
  }