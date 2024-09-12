import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  //private messageSource = new BehaviorSubject('default message');
  private messageSource = new BehaviorSubject([{ filtro: 'AAA' }]);
  currentMessage = this.messageSource.asObservable();
  changeMessage(message: any) {
    this.messageSource.next(message)
  }
  constructor() { }

}