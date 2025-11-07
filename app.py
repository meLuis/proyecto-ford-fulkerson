from flask import Flask, render_template, request, jsonify
import random
from collections import deque

app = Flask(__name__)

class Arista:
    def __init__(self, destino, indice_reversa, capacidad, capacidad_original):
        self.destino = destino                    
        self.indice_reversa = indice_reversa       
        self.capacidad = capacidad                
        self.capacidad_original = capacidad_original  

class Grafo:
    def __init__(self, n):
        self.n = n
        self.adyacencia = [[] for _ in range(n)]

    def agregar_arista(self, u, v, capacidad):
        arista_adelante = Arista(v, len(self.adyacencia[v]), capacidad, capacidad)
        arista_reversa = Arista(u, len(self.adyacencia[u]), 0, 0)
        self.adyacencia[u].append(arista_adelante)
        self.adyacencia[v].append(arista_reversa)

    def obtener_aristas_para_web(self):
        aristas = []
        for u in range(self.n):
            for arista in self.adyacencia[u]:
                if arista.capacidad_original > 0:
                    flujo = arista.capacidad_original - arista.capacidad
                    aristas.append({
                        'origen': u,
                        'destino': arista.destino,
                        'flujo': flujo,
                        'capacidad': arista.capacidad_original
                    })
        return aristas

    def edmonds_karp_detallado(self, fuente, sumidero):
        flujo_maximo = 0
        iteracion = 0
        pasos = []

        while True:
            iteracion += 1
            padre = [(-1, -1)] * self.n
            cola = deque([fuente])
            padre[fuente] = (-2, -1)

            # BFS para encontrar un camino aumentante
            while cola:
                u = cola.popleft()
                for i, arista in enumerate(self.adyacencia[u]):
                    if arista.capacidad > 0 and padre[arista.destino][0] == -1:
                        padre[arista.destino] = (u, i)
                        cola.append(arista.destino)
                        if arista.destino == sumidero:
                            cola.clear()
                            break

            # Si no se encontró camino aumentante, terminamos
            if padre[sumidero][0] == -1:
                pasos.append({
                    'iteracion': iteracion,
                    'tipo': 'final',
                    'mensaje': f'No hay más caminos aumentantes. Algoritmo terminado.',
                    'flujo_maximo': flujo_maximo,
                    'aristas': self.obtener_aristas_para_web()
                })
                break

            # Reconstruir camino
            camino = []
            v = sumidero
            cuello_botella = float("inf")
            while v != fuente:
                u, indice_arista = padre[v]
                arista = self.adyacencia[u][indice_arista]
                camino.append((u, v, arista))
                cuello_botella = min(cuello_botella, arista.capacidad)
                v = u
            camino.reverse()

            nodos_camino = [fuente] + [v for (_, v, _) in camino]
            
            paso = {
                'iteracion': iteracion,
                'tipo': 'camino_encontrado',
                'camino': nodos_camino,
                'cuello_botella': cuello_botella,
                'aristas_camino': [(u, v) for (u, v, _) in camino],
                'mensaje': f'Iteración {iteracion}: Camino encontrado {[n+1 for n in nodos_camino]}, cuello de botella = {cuello_botella}'
            }

            # Actualizar capacidades en la red residual
            v = sumidero
            while v != fuente:
                u, indice_arista = padre[v]
                arista = self.adyacencia[u][indice_arista]
                arista.capacidad -= cuello_botella
                self.adyacencia[arista.destino][arista.indice_reversa].capacidad += cuello_botella
                v = u

            flujo_maximo += cuello_botella

            paso['aristas_despues'] = self.obtener_aristas_para_web()
            pasos.append(paso)

        return flujo_maximo, pasos

    def corte_minimo(self, fuente):
        visitados = [False] * self.n
        cola = deque([fuente])
        visitados[fuente] = True
        while cola:
            u = cola.popleft()
            for arista in self.adyacencia[u]:
                if arista.capacidad > 0 and not visitados[arista.destino]:
                    visitados[arista.destino] = True
                    cola.append(arista.destino)
        
        S = {i for i, v in enumerate(visitados) if v}
        T = set(range(self.n)) - S
        aristas_corte = []
        
        for u in S:
            for arista in self.adyacencia[u]:
                if arista.capacidad_original > 0 and arista.destino in T:
                    aristas_corte.append({
                        'origen': u,
                        'destino': arista.destino,
                        'capacidad': arista.capacidad_original
                    })
        
        return {
            'S': list(S),
            'T': list(T),
            'aristas_corte': aristas_corte
        }

def construir_grafo_aleatorio(n):
    g = Grafo(n)
    aristas_agregadas = set()
    
    for u in range(n):
        for v in range(n):
            if u != v and random.random() < 0.3:
                if (u, v) not in aristas_agregadas and (v, u) not in aristas_agregadas:
                    capacidad = random.randint(1, 20)
                    g.agregar_arista(u, v, capacidad)
                    aristas_agregadas.add((u, v))
    return g

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generar_grafo', methods=['POST'])
def generar_grafo():
    data = request.json
    n = data['n']
    tipo = data['tipo']
    
    if tipo == 'aleatorio':
        g = construir_grafo_aleatorio(n)
    else:
        g = Grafo(n)
        aristas = data['aristas']
        for arista in aristas:
            g.agregar_arista(arista['origen'], arista['destino'], arista['capacidad'])
    
    return jsonify({
        'nodos': n,
        'aristas': g.obtener_aristas_para_web()
    })

@app.route('/calcular_flujo', methods=['POST'])
def calcular_flujo():
    data = request.json
    n = data['n']
    aristas_data = data['aristas']
    fuente = data['fuente']
    sumidero = data['sumidero']
    
    g = Grafo(n)
    for arista in aristas_data:
        g.agregar_arista(arista['origen'], arista['destino'], arista['capacidad'])
    
    # Ejecutar algoritmo
    flujo_maximo, pasos = g.edmonds_karp_detallado(fuente, sumidero)
    
    # Calcular corte mínimo
    corte = g.corte_minimo(fuente)
    
    return jsonify({
        'flujo_maximo': flujo_maximo,
        'pasos': pasos,
        'corte_minimo': corte,
        'aristas_finales': g.obtener_aristas_para_web()
    })

if __name__ == '__main__':
    app.run(debug=True)