import { Injectable } from '@angular/core';
import jwt_decode from "jwt-decode";
const KEY = 'authToken';
const EMP = 'z';

@Injectable({ providedIn: 'root' })
export class TokenService {

    hasToken() {
        return !!this.getToken();
    }

    setToken(token: string, emp: any) {
        window.localStorage.setItem(KEY, token);
        window.localStorage.setItem(EMP, emp);
        //var decoded: any = jwt_decode(token);
        //console.log('tokenDecoded', decoded);
        //console.log('rls', this.getTokenVar('rls'));
        //console.log('isTokenExpired', this.isTokenExpired());
    }

    setTokens(token: string) {
        window.localStorage.setItem(KEY, token);
    }

    getToken() {
         let token =  window.localStorage.getItem(KEY) || '';
        return token;
        //return window.localStorage.getItem(KEY);
    }
   
    getTokenVar(varName: string) {
        var token: any = window.localStorage.getItem(KEY);
        var decoded: any = jwt_decode(token);
        return decoded[varName];
    }

    isTokenExpired() {
        var exp = this.getTokenVar('exp');
        return Date.now() >= exp * 1000;
    }

    removeToken() {
        console.log('REMOVER');
         window.localStorage.removeItem(KEY);
         window.localStorage.removeItem(EMP);
    }

    readToken(tipo: any, params: any) {
        if (window.localStorage.getItem(KEY)) {
            let tok: any = window.localStorage.getItem(KEY);
            let respuesta;
            let arr: any = jwt_decode(tok);
            switch (tipo) {
                case 'id':
                    let cadArrI: any = tipo;
                    cadArrI = arr.rls.split(',');
                    let buscarEmp = cadArrI.filter(function (e: any) { return e.toUpperCase().indexOf('GASTOS') !== -1; });
                    let idEmpresa = buscarEmp[0].split(':');
                    respuesta = idEmpresa[0];
                    console.log(arr.id + ',' + respuesta);
                    respuesta = arr.id + ',' + respuesta;
                    break;
                case 'rlsRol':
                    let cadArr: any = tipo;
                    cadArr = arr.rls.split(',');
                    let buscarRol = cadArr.filter(function (e: any) { return e.toUpperCase().indexOf(params) !== -1; });
                    let idRol = buscarRol[0].split(':');
                    respuesta = idRol[2];
                    break;
                case 'rlsVer':
                    let cadArrV: any = tipo;
                    cadArrV = arr.rls.split(',');
                    let buscarRolV = cadArrV.filter(function (e: any) { return e.toUpperCase().indexOf(params) !== -1; });
                    let idRolV = buscarRolV[0].split(':');
                    respuesta = idRolV[2];
                    break;
                case 'iat':
                    respuesta = arr.iat;
                    break;
                case 'exp':
                    respuesta = arr.exp;
                    break;
                case 'rf_exp':
                    respuesta = arr.rf_exp;
                    break;
            }
            return respuesta;
        }

    }
}