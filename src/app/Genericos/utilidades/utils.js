export const utilidades = {
    makeRequest(data, metodo, url) {
        return new Promise((resolve, reject) => {
            var cont = 0;
            data.forEach(async d => {
                const requestData = {
                    method: metodo,
                    headers: { "Content-Type": "application/json" },
                    url: url,
                    data: d
                };
                try {
                    const response = await axios(requestData);
                    if (response.data.error == "") {
                        cont++;
                        if (cont == data.length) {
                            resolve();
                        }
                    } else {
                        reject();
                    }
                } catch (error) {
                    reject(error);
                }
            });
    
        });
    }
}

