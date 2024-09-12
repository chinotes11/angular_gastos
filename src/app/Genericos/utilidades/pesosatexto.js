export const pesostexto = {
    prueba(num){
        console.log("PRUEBA -" + num);
    },

    Unidades(num){
        switch(num)
        {
            case 1: return "UN";
            case 2: return "DOS";
            case 3: return "TRES";
            case 4: return "CUATRO";
            case 5: return "CINCO";
            case 6: return "SEIS";
            case 7: return "SIETE";
            case 8: return "OCHO";
            case 9: return "NUEVE";
        }
        return "";
    },
    Decenas(num){

        let decena = Math.floor(num/10);
        let unidad = num-(decena * 10);
    
        switch(decena)
        {
            case 1:
                switch(unidad)
                {
                    case 0: return "DIEZ";
                    case 1: return "ONCE";
                    case 2: return "DOCE";
                    case 3: return "TRECE";
                    case 4: return "CATORCE";
                    case 5: return "QUINCE";
                    default: return "DIECI" + pesostexto.Unidades(unidad);
                }
            case 2:
                switch(unidad)
                {
                    case 0: return "VEINTE";
                    default: return "VEINTI" + pesostexto.Unidades(unidad);
                }
            case 3: return pesostexto.DecenasY("TREINTA", unidad);
            case 4: return pesostexto.DecenasY("CUARENTA", unidad);
            case 5: return pesostexto.DecenasY("CINCUENTA", unidad);
            case 6: return pesostexto.DecenasY("SESENTA", unidad);
            case 7: return pesostexto.DecenasY("SETENTA", unidad);
            case 8: return pesostexto.DecenasY("OCHENTA", unidad);
            case 9: return pesostexto.DecenasY("NOVENTA", unidad);
            case 0: return pesostexto.Unidades(unidad);
        }
    },//Unidades()

    DecenasY(strSin, numUnidades) {
        if (numUnidades > 0)
        return strSin + " Y " + pesostexto.Unidades(numUnidades)
    
        return strSin;
    },//DecenasY()

    Centenas(num) {
        let centenas = Math.floor(num / 100);
        let decenas = num-(centenas * 100);
    
        switch(centenas)
        {
            case 1:
                if (decenas > 0)
                    return "CIENTO " + pesostexto.Decenas(decenas);
                return "CIEN";
            case 2: return "DOSCIENTOS " + pesostexto.Decenas(decenas);
            case 3: return "TRESCIENTOS " + pesostexto.Decenas(decenas);
            case 4: return "CUATROCIENTOS " + pesostexto.Decenas(decenas);
            case 5: return "QUINIENTOS " + pesostexto.Decenas(decenas);
            case 6: return "SEISCIENTOS " + pesostexto.Decenas(decenas);
            case 7: return "SETECIENTOS " + pesostexto.Decenas(decenas);
            case 8: return "OCHOCIENTOS " + pesostexto.Decenas(decenas);
            case 9: return "NOVECIENTOS " + pesostexto.Decenas(decenas);
        }
    
        return pesostexto.Decenas(decenas);
    },//Centenas()
    Seccion(num, divisor, strSingular, strPlural) {
          let  cientos = Math.floor(num / divisor)
          let   resto = num - (cientos * divisor)
        
          let  letras = "";
        
            if (cientos > 0)
                if (cientos > 1)
                    letras = pesostexto.Centenas(cientos) + " " + strPlural;
                else
                    letras = strSingular;
        
            if (resto > 0)
                letras += "";
        
            return letras;
    },//Seccion()

    Miles(num) {
       let  divisor = 1000;
       let  cientos = Math.floor(num / divisor)
       let  resto = num - (cientos * divisor)
    
       let strMiles = pesostexto.Seccion(num, divisor, "UN MIL", "MIL");
       let strCentenas = pesostexto.Centenas(resto);
    
        if(strMiles == "")
            return strCentenas;
    
        return strMiles + " " + strCentenas;
    },//Miles()
    Millones(num) {
        let divisor = 1000000;
        let cientos = Math.floor(num / divisor)
        let resto = num - (cientos * divisor)

        let strMillones = pesostexto.Seccion(num, divisor, "UN MILLON DE", "MILLONES DE");
        let strMiles = pesostexto.Miles(resto);

        if(strMillones == "")
            return strMiles;

        return strMillones + " " + strMiles;
    },//Millones()

    NumeroALetras(num) {
        var data = {
            numero: num,
            enteros: Math.floor(num),
            centavos: (((Math.round(num * 100)) - (Math.floor(num) * 100))),
            letrasCentavos: "",
            letrasMonedaPlural: 'PESOS',//"PESOS", 'Dólares', 'Bolívares', 'etcs'
            letrasMonedaSingular: 'PESOS', //"PESO", 'Dólar', 'Bolivar', 'etc'
    
            letrasMonedaCentavoPlural: "CENTAVOS",
            letrasMonedaCentavoSingular: "CENTAVO"
        };
    
        if (data.centavos > 0) {
            data.letrasCentavos = "CON " + (function (){
                if (data.centavos == 1)
                    return pesostexto.Millones(data.centavos) + " " + data.letrasMonedaCentavoSingular;
                else
                    return pesostexto.Millones(data.centavos) + " " + data.letrasMonedaCentavoPlural;
                })();
        };
    
        if(data.enteros == 0)
            return "CERO " + data.letrasMonedaPlural + " " + data.letrasCentavos;
        if (data.enteros == 1)
            return pesostexto.Millones(data.enteros) + " " + data.letrasMonedaSingular + " " + data.letrasCentavos;
        else
            return pesostexto.Millones(data.enteros) + " " + data.letrasMonedaPlural + " " + data.letrasCentavos;
    }//NumeroALetras()
}

