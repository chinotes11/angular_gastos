
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { forkJoin, from, Observable, of, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

const API = environment.ApiUrl;
const APIAdmin = environment.ApiUrlAdmin;
const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json'
    })
};

const httpOptions1 = {
    headers: new HttpHeaders({
        'Accept': 'text/plain, */*',
        'Content-Type': 'application/json' // We send JSON
    }),
    responseType: 'blob' as 'json'  // We accept plain text as response.
};

const httpOptions2 = {
    headers: new HttpHeaders({
        'Accept': 'application/pdf',
        'Content-Type': 'application/json' // We send JSON
    }),
    responseType: 'blob' as 'json'  // We accept plain text as response.
};

const httpOptions3 = {
    headers: new HttpHeaders({
        'Accept': 'application/pdf',
        'Content-Type': 'application/json' // We send JSON
    }),
    responseType: 'text' as 'json'  // We accept plain text as response.
};

const httpOptions4 = {
    headers: new HttpHeaders({
        'Accept': 'image/*',
        'Content-Type': 'application/json' // We send JSON
    }),
    responseType: 'blob' as 'json'  // We accept plain text as response.
};

@Injectable({
    providedIn: 'root'
})

export class serviciosService {

    constructor(private http: HttpClient) { }

    public get(url: string) {
        return this.http.get<any>(`${API}${url}`, httpOptions)
    }

    public getUnParametro(url: string, id: string) {
        return this.http.get<any>(`${API}${url}/${id}`, httpOptions)
    }

    public putDatos(url: string, arr: any) {
        return this.http.put<any>(`${API}${url}`, arr, httpOptions)
    }

    public putDatosV(url: string) {
        return this.http.put<any>(`${API}${url}`, httpOptions)
    }

    public putDatosP(url: string, id: any, arr: any) {
        return this.http.put<any>(`${API}${url}/${id}`, arr, httpOptions)
    }

    public post(url:string, arr:any) {
        return this.http.post<any>(`${API}${url}`, arr, httpOptions)
    }

    public postAdmin(url:string, arr:any) {
        return this.http.post<any>(`${APIAdmin}${url}`, arr, httpOptions)
    }    

    public postDatos(url: string, arr: any) {
        return this.http.post<any>(`${API}${url}/`, arr, httpOptions)
    }

    public postDatosQ(url: string, id: any, arr: any) {
        return this.http.post<any>(`${API}${url}/${id}`, arr, httpOptions)
    }

    public patchDatos(url: string, arr: any) {
        return this.http.patch<any>(`${API}${url}`, arr, httpOptions)
    }

    public patchDatosV(url: string) {
        return this.http.patch<any>(`${API}${url}`, httpOptions)
    }

    public postMultiple(url: string, arr: any) {
        return this.http.post<any>(`${API}${url}`, arr, httpOptions)
    }

    public putMultiple(url: string, arr: any) {
        return this.http.put<any>(`${API}${url}`, arr, httpOptions)
    }

    public deleteMultiple(url: string) {
        return this.http.delete<any>(`${API}${url}`, httpOptions)
    }

    public getFile2(url: string, id: string): Observable<Blob> {
        return this.http.get<Blob>(`${API}${url}/${id}`, httpOptions1)
    }

    public getFile(url: string, id: string): Observable<Blob> {
        return this.http.get<Blob>(`${API}${url}/${id}`, httpOptions2);
    }
    public getText(url: string, id: string): Observable<string> {
        return this.http.get<string>(`${API}${url}/${id}`, httpOptions3);
    }

    public getDosServicios(nombre: string, id: any, nombre2: string, id2: any): Observable<any> {
        let get1 = this.http.get<any>(`${API}${nombre}/${id}`, httpOptions);
        let get2 = this.http.get<any>(`${API}${nombre2}/${id2}`, httpOptions);
        return forkJoin([get1, get2]);
    }

    public getAdmin(url: string, id: string) {
        return this.http.get<any>(`${APIAdmin}${url}/${id}`, httpOptions)
    }

    public getImage(url: string, id: string): Observable<Blob> {
        return this.http.get<Blob>(`${APIAdmin}${url}/${id}`, httpOptions4);
    }

    public sendEmailNotification(para: string, nombre: string, asunto: string, tituloEmail: string, parrafo1: string, parrafo2: string, idEmpresa: number){
        var data = {
            "para": para,
            "nombre": nombre,
            "asunto": asunto,
            "tituloEmail": tituloEmail,
            "parrafo1": parrafo1,
            "parrafo2": parrafo2,
            "idEmpresa": idEmpresa
        };
        return this.postAdmin('email/notificacion', data);
    }

    
    /*
        public getMultipleRequest (data:any, metodo:any, url:any)  {        
                return new Promise<void>((resolve, reject) => {
                    var cont = 0;
                    data.forEach(d => {
                        const requestData = {
                            method: metodo,
                            headers: { "Content-Type": "application/json" },
                            url: url,
                            data: d
                        };
                        this.http.put<any>(`${API}${url}`,data , httpOptions).then((response:any) => {
                            if (response.data.error == "") {
                                cont++;
                                if (cont == data.length) {
                                    resolve();
                                }
                            } else {
                                reject();
                            }
                        }).catch((error:any) => {
                            reject(error);
                        });
                    });
                });      
        }
    */
}