import { TokenService } from './../../auth/token/token.service';
const token = new TokenService();
const url = 'https://www.zzas.com.mx/';
let tiempo:any=10000;
let origen:any=0;
let inicio: any;

export const funciones = {
    buscarJsonEnJson(arrOrigen:any,arrBuscar:any){
        //console.log(arrOrigen, '  -  ' , arrBuscar); 
       // return arrOrigen.filter((i:any) => Object.entries(arrBuscar).every(([k, v]) =>{let valor:any=String(v); return String(i[k]).includes(valor); }));      
       return arrOrigen.filter((i:any) => Object.entries(arrBuscar).every(([k, v]) =>{let valor:any=String(v); return String(i[k]).toUpperCase().includes(valor.toUpperCase()); }));
    },
     arrUnique(arr:any) {
        return arr.filter((v:any,i:any,a:any)=>a.findIndex((t:any)=>(t.place === v.place && t.name===v.name))===i);
     },

     uniqueBy(a:any, key:any) {
        let seen:any = {};
        return a.filter((item:any) => {
            let k = item[key];
            if (seen.hasOwnProperty(k)) {
                return false;
            } else {
                return (seen[k] = true);
            }
        })
    },
     inactividad () {
        console.log('entra',origen,); 
       // setTimeout(()=>{ console.log(url); token.removeToken();}, tiempo);
        //  if(origen==0){            
        //     origen++;
        //     console.log(inicio);
        //  } else{            
        //     clearTimeout( inicio ); 
        //  }      
                  
    }
}
export const EVENT_WATCH: string[] = ['mousemove', 'mouseup', 'mousedown', 'scroll', 'keydown'];
export const MY_FORMATS = {
    parse: {
        dateInput: 'LL'
    },
    display: {
        dateInput: 'DD/MM/YYYY',
        monthYearLabel: 'YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'YYYY'
    }
};

