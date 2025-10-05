# 🌊 Algoritmo Ford-Fulkerson - Visualización Interactiva del Flujo Máximo

> **Implementación web interactiva del algoritmo Ford-Fulkerson para encontrar el flujo máximo en redes de flujo con visualización paso a paso**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-2.3+-orange.svg)](https://flask.palletsprojects.com/)
[![D3.js](https://img.shields.io/badge/D3.js-v7-ff6b1a.svg)](https://d3js.org/)

## 👥 Equipo de Desarrollo

| Integrante | Código | GitHub |
|------------|--------|--------|
| **Espinoza Navarrete, Luis Manuel** | U201821684 |
| **Cabezas Diaz, Denis Alexis** | U202410673 |
| **Gonzales Cieza, Maritza Noemi** | U202416664 | 
| **Parado Cconislla, Annie Milagros** | U20241A178 |
| **Tirado Carrera, Gabriela Luciana** | U202419592 |

---

## 📖 Descripción del Proyecto

Este proyecto implementa una **aplicación web interactiva** que resuelve el **problema de flujo máximo** en grafos dirigidos utilizando el algoritmo de **Ford-Fulkerson (variante Edmonds-Karp)**. 

### 🎯 Objetivo Académico

Desarrollar una herramienta educativa que permita:
- Comprender visualmente el funcionamiento del algoritmo Ford-Fulkerson
- Experimentar con diferentes configuraciones de grafos
- Analizar paso a paso el proceso de búsqueda de caminos aumentantes
- Verificar la optimalidad mediante el teorema del corte mínimo

### 📋 Enunciado del Problema

El programa debe:
1. Solicitar un número entero **n ∈ [8, 16]** (cantidad de nodos)
2. Permitir generación **aleatoria** o **manual** del grafo
3. Mostrar el grafo dirigido etiquetado
4. Solicitar **vértice fuente** y **vértice sumidero**
5. Determinar el **flujo máximo** usando Ford-Fulkerson
6. Detallar **paso a paso** todo el proceso
7. Presentar:
   - Valor del flujo máximo
   - Asignación de flujo en cada arista
   - Alternativas en caso de múltiples soluciones
   - **Corte mínimo** que certifica la maximalidad

---

## 🚀 Características Principales

### ✨ Interfaz Web Moderna
- **Diseño responsive** que funciona en cualquier dispositivo
- **Visualización interactiva** con D3.js
- **Navegación paso a paso** por el algoritmo
- **Modo automático** con animaciones

### 🔧 Funcionalidades Avanzadas
- **Generación automática** de grafos aleatorios
- **Entrada manual** con validaciones en tiempo real
- El generador evita crear aristas duplicadas en sentido inverso (no se crean A→B y B→A automáticamente)
- Visualización con líneas rectas y etiquetas en el punto medio para mantener claridad
- **Cálculo automático** del corte mínimo

### 🎮 Experiencia de Usuario
- **Alertas elegantes** con feedback inmediato
- **Instrucciones contextuales** para cada modo
- **Validaciones intuitivas** de entrada de datos
- **Exportación visual** de resultados

---

## 🛠️ Tecnologías Utilizadas

### Backend
- ![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white) **Python 3.8+**
  - Implementación del algoritmo Ford-Fulkerson
  - Manejo de estructuras de datos (grafos, colas)
  - API RESTful con Flask

- ![Flask](https://img.shields.io/badge/Flask-000000?style=flat&logo=flask&logoColor=white) **Flask 2.3+**
  - Servidor web ligero y eficiente
  - Endpoints para generación y procesamiento de datos
  - Manejo de sesiones y estados

### Frontend
- ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white) **HTML5**
  - Estructura semántica moderna
  - Formularios interactivos
  - Accesibilidad web

- ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white) **CSS3**
  - CSS Grid y Flexbox para layout responsive
  - Variables CSS para temas consistentes
  - Animaciones fluidas y transiciones

- ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black) **JavaScript ES6+**
  - Programación asíncrona con async/await
  - Manipulación del DOM moderna
  - Gestión de eventos y estados

- ![D3.js](https://img.shields.io/badge/D3.js-FF6B1A?style=flat&logo=d3dotjs&logoColor=white) **D3.js v7**
  - Visualización de grafos con simulación de fuerzas
  - Renderizado SVG interactivo
  - Animaciones de transición suaves

### Herramientas de Desarrollo
- ![Git](https://img.shields.io/badge/Git-F05032?style=flat&logo=git&logoColor=white) **Git** - Control de versiones
- ![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white) **GitHub** - Repositorio y colaboración
- ![VS Code](https://img.shields.io/badge/VS_Code-007ACC?style=flat&logo=visual-studio-code&logoColor=white) **VS Code** - Editor de código

---

## 📂 Estructura del Proyecto

```
ford-fulkerson-visualizer/
├── 📁 static/
│   ├── 📁 css/
│   │   └── style.css              # Estilos principales
│   └── 📁 js/
│       └── app.js                 # Lógica frontend + D3.js
├── 📁 templates/
│   └── index.html                 # Página principal
├── app.py                         # Servidor Flask + API
├── ford_fulkerson_consola.py      # Versión original en consola
├── requirements.txt               # Dependencias Python
└── README.md                      # Este archivo
```

---

## ⚡ Instalación y Uso

### 1. Clonar el repositorio
```bash
git clone https://github.com/meLuis/ford-fulkerson-visualizer.git
cd ford-fulkerson-visualizer
```

### 2. Crear entorno virtual
```bash
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac
```

### 3. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 4. Ejecutar la aplicación
```bash
python app.py
```

### 5. Abrir en el navegador
```
http://localhost:5000
```

---

## 🎓 Conceptos Aprendidos

### 📊 Teoría de Grafos
- **Grafos dirigidos** y representación en memoria
- **Redes de flujo** y capacidades de aristas
- **Caminos aumentantes** y redes residuales
- **Teorema max-flow min-cut**

### 💻 Algoritmos
- **Ford-Fulkerson** con búsqueda BFS (Edmonds-Karp)
- **Complejidad temporal** O(VE²)
- **Búsqueda en anchura** para encontrar caminos
- **Optimización** mediante heurísticas

### 🌐 Desarrollo Web Full-Stack
- **Arquitectura cliente-servidor**
- **APIs RESTful** con Flask
- **Programación asíncrona** en JavaScript
- **Responsive design** con CSS moderno

### 🎨 Visualización de Datos
- **D3.js** para gráficos interactivos
- **Simulación de fuerzas** para layout de grafos
- **SVG** para gráficos vectoriales
- **Animaciones** para feedback visual

---

## 🔬 Algoritmo Ford-Fulkerson

### Pseudocódigo Implementado

```python
def edmonds_karp(grafo, fuente, sumidero):
    flujo_maximo = 0
    
    while True:
        # BFS para encontrar camino aumentante
        padre = bfs_camino_aumentante(grafo, fuente, sumidero)
        
        if not padre[sumidero]:  # No hay más caminos
            break
            
        # Encontrar cuello de botella
        cuello_botella = encontrar_cuello_botella(camino, padre)
        
        # Actualizar red residual
        actualizar_capacidades(camino, cuello_botella)
        
        flujo_maximo += cuello_botella
    
    return flujo_maximo
```

### Características de la Implementación

- **✅ Correctitud**: Garantiza encontrar el flujo máximo óptimo
- **✅ Terminación**: BFS asegura que el algoritmo termine
- **✅ Eficiencia**: Complejidad O(VE²) del método Edmonds-Karp
- **✅ Robustez**: Manejo de casos edge y validaciones

---


## 🙏 Agradecimientos

- **Profesores** del curso por la guía en algoritmos de grafos
- **Comunidad D3.js** por la excelente documentación
- **Flask team** por el framework web minimalista
- **Compañeros de clase** por el feedback y testing

---

## 📞 Contacto

**Equipo de Desarrollo** - [Repositorio del Proyecto](https://github.com/meLuis/proyecto-ford-fulkerson)

**Universidad**: Universidad Peruana de Ciencias Aplicadas (UPC)
**Curso**: Matemática Computacional
**Ciclo**: 2025-2

---

<div align="center">

**⭐ Si este proyecto te ayudó, considera darle una estrella ⭐**

</div>