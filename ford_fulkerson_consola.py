import random
from collections import deque


class Arista:
    def __init__(self, destino, indice_reversa, capacidad, capacidad_original):
        self.destino = destino                    
        self.indice_reversa = indice_reversa       
        self.capacidad = capacidad                
        self.capacidad_original = capacidad_original  

class Grafo: 
    def __init__(self, n):
        self.n = n
        self.adyacencia = [[] for _ in range(n)]   # lista de adyacencia
        self._aristas_originales = []              # lista de aristas originales (u, v, capacidad)

    def agregar_arista(self, u, v, capacidad):
        arista_adelante = Arista(v, len(self.adyacencia[v]), capacidad, capacidad)
        arista_reversa = Arista(u, len(self.adyacencia[u]), 0, 0)
        self.adyacencia[u].append(arista_adelante)
        self.adyacencia[v].append(arista_reversa)
        self._aristas_originales.append((u, v, capacidad))

    def lista_flujos(self):
        resultado = []
        for u in range(self.n):
            for arista in self.adyacencia[u]:
                if arista.capacidad_original > 0:  # solo aristas originales (no las inversas)
                    flujo = arista.capacidad_original - arista.capacidad
                    resultado.append((u, arista.destino, flujo, arista.capacidad_original))
        return resultado

    def imprimir_adyacencia(self):
        """Imprime lista de adyacencia con capacidades y flujos actuales."""
        print("Lista de aristas (flujo actual / capacidad):")
        for u in range(self.n):
            for arista in self.adyacencia[u]:
                if arista.capacidad_original > 0:
                    flujo = arista.capacidad_original - arista.capacidad
                    print(f"  {u+1}->{arista.destino+1}: {flujo}/{arista.capacidad_original}")

    # ----------------------------
    # Algoritmo Edmonds-Karp (Ford-Fulkerson con BFS)
    # ----------------------------
    def edmonds_karp(self, fuente, sumidero, verbose=True):
        flujo_maximo = 0
        iteracion = 0

        while True:
            iteracion += 1
            padre = [(-1, -1)] * self.n  # guarda (nodo anterior, índice de arista usada)
            cola = deque([fuente])
            padre[fuente] = (-2, -1)  # fuente marcada como visitada

            # BFS para encontrar un camino aumentante
            while cola:
                u = cola.popleft()
                for i, arista in enumerate(self.adyacencia[u]):
                    if arista.capacidad > 0 and padre[arista.destino][0] == -1:
                        padre[arista.destino] = (u, i)
                        cola.append(arista.destino)
                        if arista.destino == sumidero:  # llegamos al sumidero
                            cola.clear()
                            break

            # Si no se encontró camino aumentante, terminamos
            if padre[sumidero][0] == -1:
                if verbose:
                    print(f"\nNo hay más caminos aumentantes. Iteraciones: {iteracion-1}")
                break

            # Reconstruimos el camino encontrado
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

            # Mostrar información del camino
            if verbose:
                nodos = [fuente+1] + [v+1 for (_, v, _) in camino]
                print(f"\nIteración {iteracion}: Camino encontrado {nodos}")
                print(f"Cuello de botella = {cuello_botella}")

            # Actualizar capacidades en la red residual
            v = sumidero
            while v != fuente:
                u, indice_arista = padre[v]
                arista = self.adyacencia[u][indice_arista]
                arista.capacidad -= cuello_botella
                self.adyacencia[arista.destino][arista.indice_reversa].capacidad += cuello_botella
                v = u

            flujo_maximo += cuello_botella

            if verbose:
                print("Estado actual de flujos:")
                self.imprimir_adyacencia()

        return flujo_maximo

    # ----------------------------
    # Corte mínimo después del flujo máximo
    # ----------------------------
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
        aristas_corte = [(u, arista.destino, arista.capacidad_original)
                         for u in S for arista in self.adyacencia[u]
                         if arista.capacidad_original > 0 and arista.destino in T]
        return S, T, aristas_corte

def pedir_entero(mensaje, minimo=None, maximo=None):
    while True:
        try:
            valor = int(input(mensaje).strip())
            if minimo is not None and valor < minimo:
                print(f"Debe ser >= {minimo}")
                continue
            if maximo is not None and valor > maximo:
                print(f"Debe ser <= {maximo}")
                continue
            return valor
        except:
            print("Entrada inválida.")


def construir_grafo_aleatorio(n):
    g = Grafo(n)
    for u in range(n):
        for v in range(n):
            if u != v and random.random() < 0.3:  
                capacidad = random.randint(1, 20)
                g.agregar_arista(u, v, capacidad)
    return g


# Programa principal
def main():
    print("=== Flujo máximo con Ford-Fulkerson ===")
    n = pedir_entero("Número de nodos (8..16): ", 8, 16)

    # Modo de construcción del grafo
    modo = input("¿Quieres un grafo aleatorio (a) o manual (m)? ").strip().lower()
    if modo == "a":
        g = construir_grafo_aleatorio(n)
        print("Grafo generado aleatoriamente.")
    else:
        g = Grafo(n)
        m = pedir_entero("¿Cuántas aristas vas a ingresar?: ", 1)
        for i in range(m):
            u = pedir_entero("Nodo origen (1..n): ", 1, n) - 1
            v = pedir_entero("Nodo destino (1..n): ", 1, n) - 1
            capacidad = pedir_entero("Capacidad (>0): ", 1)
            g.agregar_arista(u, v, capacidad)

    # Mostrar grafo inicial
    print("\nGrafo inicial:")
    g.imprimir_adyacencia()

    fuente = pedir_entero("Nodo fuente (1..n): ", 1, n) - 1
    sumidero = pedir_entero("Nodo sumidero (1..n, distinto a fuente): ", 1, n) - 1
    while fuente == sumidero:
        print("Fuente y sumidero deben ser distintos.")
        sumidero = pedir_entero("Nodo sumidero (1..n): ", 1, n) - 1

    # Ejecutar algoritmo
    print("\n=== Ejecutando Edmonds-Karp paso a paso ===")
    flujo_maximo = g.edmonds_karp(fuente, sumidero, verbose=True)

    # Resultados
    print("\n=== RESULTADOS ===")
    print("Flujo máximo encontrado:", flujo_maximo)
    g.imprimir_adyacencia()

    # Corte mínimo
    S, T, aristas_corte = g.corte_minimo(fuente)
    print("\nCorte mínimo encontrado:")
    print("Conjunto S =", [x+1 for x in S])
    print("Conjunto T =", [x+1 for x in T])
    print("Aristas de S->T que forman el corte:")
    for (u, v, c) in aristas_corte:
        print(f"  {u+1}->{v+1} con capacidad {c}")

if __name__ == "__main__":
    main()