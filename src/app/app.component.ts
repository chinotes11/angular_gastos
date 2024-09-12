import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import IdleTimer from "./Genericos/idle.timer";
import { TokenService } from './auth/token/token.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent { 
  timer: any;
  constructor(private http: HttpClient,
    private tokenService: TokenService, ) {}
    ngOnInit() {
        this.timer = new IdleTimer(
            1300, //expired after 300 secs
            () => {
                console.log('timeout');
                this.closeSession();
                this.timer.cleanUp();
            }
        );
    }
    ngOnDestroy() {
        this.timer.cleanUp();
    }

	closeSession(){
		this.tokenService.removeToken();
		window.location.href = 'https://www.zzas.com.mx/';
	}

}
