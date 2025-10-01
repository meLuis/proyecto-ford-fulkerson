// Implementación del algoritmo Ford-Fulkerson en JavaScript puro
// Para compatibilidad con Netlify (sin backend)

class Arista {
    constructor(destino, indiceReversa, capacidad, capacidadOriginal) {
        this.destino = destino;
        this.indiceReversa = indiceReversa;
        this.capacidad = capacidad;
        this.capacidadOriginal = capacidadOriginal;
    }
}

class GrafoJS {
    constructor(n) {
        this.n = n;
        this.adyacencia = Array.from({length: n}, () => []);
        this.aristasOriginales = [];
    }

    agregarArista(u, v, capacidad) {
        const aristaAdelante = new Arista(v, this.adyacencia[v].length, capacidad, capacidad);
        const aristaReversa = new Arista(u, this.adyacencia[u].length, 0, 0);
        
        this.adyacencia[u].push(aristaAdelante);
        this.adyacencia[v].push(aristaReversa);
        this.aristasOriginales.push({origen: u, destino: v, capacidad: capacidad});
    }

    obtenerAristasParaWeb() {
        const aristas = [];
        for (let u = 0; u < this.n; u++) {
            for (const arista of this.adyacencia[u]) {
                if (arista.capacidadOriginal > 0) {
                    const flujo = arista.capacidadOriginal - arista.capacidad;
                    aristas.push({
                        origen: u,
                        destino: arista.destino,
                        flujo: flujo,
                        capacidad: arista.capacidadOriginal,
                        capacidadResidual: arista.capacidad
                    });
                }
            }
        }
        return aristas;
    }

    edmondsKarpDetallado(fuente, sumidero) {
        let flujoMaximo = 0;
        let iteracion = 0;
        const pasos = [];

        while (true) {
            iteracion++;
            const padre = Array(this.n).fill(null).map(() => [-1, -1]);
            const cola = [fuente];
            padre[fuente] = [-2, -1];

            // BFS para encontrar camino aumentante
            while (cola.length > 0) {
                const u = cola.shift();
                for (let i = 0; i < this.adyacencia[u].length; i++) {
                    const arista = this.adyacencia[u][i];
                    if (arista.capacidad > 0 && padre[arista.destino][0] === -1) {
                        padre[arista.destino] = [u, i];
                        cola.push(arista.destino);
                        if (arista.destino === sumidero) {
                            cola.length = 0; // Limpiar cola
                            break;
                        }
                    }
                }
            }

            // Si no se encontró camino aumentante
            if (padre[sumidero][0] === -1) {
                pasos.push({
                    iteracion: iteracion,
                    tipo: 'final',
                    mensaje: `No hay más caminos aumentantes. Algoritmo terminado.`,
                    flujoMaximo: flujoMaximo,
                    aristas: this.obtenerAristasParaWeb()
                });
                break;
            }

            // Reconstruir camino
            const camino = [];
            let v = sumidero;
            let cuelloBotella = Infinity;

            while (v !== fuente) {
                const [u, indiceArista] = padre[v];
                const arista = this.adyacencia[u][indiceArista];
                camino.push([u, v, arista]);
                cuelloBotella = Math.min(cuelloBotella, arista.capacidad);
                v = u;
            }
            camino.reverse();

            const nodosCamino = [fuente, ...camino.map(([_, v, __]) => v)];
            
            const paso = {
                iteracion: iteracion,
                tipo: 'camino_encontrado',
                camino: nodosCamino,
                cuelloBotella: cuelloBotella,
                aristasCamino: camino.map(([u, v, _]) => [u, v]),
                mensaje: `Iteración ${iteracion}: Camino encontrado [${nodosCamino.map(n => n + 1).join(' → ')}], cuello de botella = ${cuelloBotella}`,
                aristasAntes: this.obtenerAristasParaWeb()
            };

            // Actualizar capacidades
            v = sumidero;
            while (v !== fuente) {
                const [u, indiceArista] = padre[v];
                const arista = this.adyacencia[u][indiceArista];
                arista.capacidad -= cuelloBotella;
                this.adyacencia[arista.destino][arista.indiceReversa].capacidad += cuelloBotella;
                v = u;
            }

            flujoMaximo += cuelloBotella;
            paso.aristasDespues = this.obtenerAristasParaWeb();
            pasos.push(paso);
        }

        return {flujoMaximo, pasos};
    }

    corteMinimo(fuente) {
        const visitados = Array(this.n).fill(false);
        const cola = [fuente];
        visitados[fuente] = true;

        while (cola.length > 0) {
            const u = cola.shift();
            for (const arista of this.adyacencia[u]) {
                if (arista.capacidad > 0 && !visitados[arista.destino]) {
                    visitados[arista.destino] = true;
                    cola.push(arista.destino);
                }
            }
        }

        const S = [];
        const T = [];
        for (let i = 0; i < this.n; i++) {
            if (visitados[i]) S.push(i);
            else T.push(i);
        }

        const aristasCorte = [];
        for (const u of S) {
            for (const arista of this.adyacencia[u]) {
                if (arista.capacidadOriginal > 0 && T.includes(arista.destino)) {
                    aristasCorte.push({
                        origen: u,
                        destino: arista.destino,
                        capacidad: arista.capacidadOriginal
                    });
                }
            }
        }

        return {S, T, aristasCorte};
    }
}

// Función para generar grafo aleatorio
function construirGrafoAleatorioJS(n) {
    const g = new GrafoJS(n);
    for (let u = 0; u < n; u++) {
        for (let v = 0; v < n; v++) {
            if (u !== v && Math.random() < 0.3) {
                const capacidad = Math.floor(Math.random() * 20) + 1;
                g.agregarArista(u, v, capacidad);
            }
        }
    }
    return g;
}

// Exportar para uso en el frontend
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {GrafoJS, construirGrafoAleatorioJS};
}