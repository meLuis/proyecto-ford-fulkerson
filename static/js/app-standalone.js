// Versión standalone del frontend que no requiere backend Flask
// Compatible con Netlify y hosting estático

// Estado de la aplicación
let grafoActual = null;
let aristasManual = [];
let resultadosAlgoritmo = null;
let pasoActual = 0;
let autoPlayInterval = null;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    inicializarEventos();
    actualizarVisibilidadPanelManual();
});

function inicializarEventos() {
    // Radio buttons para tipo de grafo
    document.querySelectorAll('input[name="tipo"]').forEach(radio => {
        radio.addEventListener('change', actualizarVisibilidadPanelManual);
    });

    // Botones principales
    document.getElementById('generar-grafo').addEventListener('click', generarGrafo);
    document.getElementById('agregar-arista').addEventListener('click', agregarArista);
    document.getElementById('calcular-flujo').addEventListener('click', calcularFlujo);

    // Controles de navegación
    document.getElementById('paso-anterior').addEventListener('click', () => cambiarPaso(-1));
    document.getElementById('paso-siguiente').addEventListener('click', () => cambiarPaso(1));
    document.getElementById('auto-play').addEventListener('click', toggleAutoPlay);

    // Validaciones en tiempo real
    document.getElementById('nodos').addEventListener('input', validarNumeroNodos);
}

function actualizarVisibilidadPanelManual() {
    const tipoManual = document.getElementById('manual').checked;
    const panelManual = document.getElementById('manual-panel');
    
    if (tipoManual) {
        panelManual.classList.remove('hidden');
    } else {
        panelManual.classList.add('hidden');
        aristasManual = [];
        actualizarListaAristas();
    }
}

function validarNumeroNodos() {
    const input = document.getElementById('nodos');
    const valor = parseInt(input.value);
    
    if (valor < 8) input.value = 8;
    if (valor > 16) input.value = 16;
    
    // Actualizar opciones de entrada manual
    actualizarLimitesAristaManual();
}

function actualizarLimitesAristaManual() {
    const n = parseInt(document.getElementById('nodos').value);
    
    ['origen', 'destino'].forEach(id => {
        const input = document.getElementById(id);
        input.max = n;
    });
    
    // Actualizar el texto de ayuda
    const maxNodo = document.getElementById('max-nodo');
    if (maxNodo) {
        maxNodo.textContent = n;
    }
}

function agregarArista() {
    const n = parseInt(document.getElementById('nodos').value);
    const origen = parseInt(document.getElementById('origen').value) - 1; // Convertir a 0-indexed
    const destino = parseInt(document.getElementById('destino').value) - 1;
    const capacidad = parseInt(document.getElementById('capacidad').value);

    // Validaciones
    if (isNaN(origen) || isNaN(destino) || isNaN(capacidad)) {
        mostrarAlerta('Por favor, completa todos los campos', 'warning');
        return;
    }

    if (origen < 0 || origen >= n || destino < 0 || destino >= n) {
        mostrarAlerta(`Los nodos deben estar entre 1 y ${n}`, 'error');
        return;
    }

    if (origen === destino) {
        mostrarAlerta('El origen y destino deben ser diferentes', 'error');
        return;
    }

    if (capacidad <= 0) {
        mostrarAlerta('La capacidad debe ser mayor a 0', 'error');
        return;
    }

    // Verificar si ya existe la arista
    const aristaExistente = aristasManual.find(a => a.origen === origen && a.destino === destino);
    if (aristaExistente) {
        mostrarAlerta('Ya existe una arista entre estos nodos', 'warning');
        return;
    }

    // Agregar arista
    aristasManual.push({ origen, destino, capacidad });
    actualizarListaAristas();

    // Limpiar campos
    ['origen', 'destino', 'capacidad'].forEach(id => {
        document.getElementById(id).value = '';
    });
    
    // Focus en el primer campo para facilitar entrada continua
    document.getElementById('origen').focus();
    
    mostrarAlerta(`Arista ${origen + 1} → ${destino + 1} agregada exitosamente`, 'success');
}

function actualizarListaAristas() {
    const lista = document.getElementById('lista-aristas');
    const emptyState = document.getElementById('aristas-empty');
    
    lista.innerHTML = '';

    if (aristasManual.length === 0) {
        emptyState.style.display = 'block';
        lista.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        lista.style.display = 'block';
        
        aristasManual.forEach((arista, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="arista-info">
                    <strong>${arista.origen + 1} → ${arista.destino + 1}</strong>
                    <small style="margin-left: 10px; color: #64748b;">capacidad: ${arista.capacidad}</small>
                </span>
                <button class="delete-btn" onclick="eliminarArista(${index})" title="Eliminar arista">
                    🗑️
                </button>
            `;
            lista.appendChild(li);
        });
    }
}

function eliminarArista(index) {
    aristasManual.splice(index, 1);
    actualizarListaAristas();
}

// Función simple para procesar aristas - una arista = un enlace
function procesarAristas(aristas) {
    return aristas.map(arista => ({
        source: arista.origen,
        target: arista.destino,
        capacidad: arista.capacidad,
        flujo: arista.flujo || 0,
        id: `${arista.origen}-${arista.destino}`
    }));
}

function generarGrafo() {
    const n = parseInt(document.getElementById('nodos').value);
    const tipo = document.querySelector('input[name="tipo"]:checked').value;

    // Validar modo manual
    if (tipo === 'manual' && aristasManual.length === 0) {
        mostrarAlerta('Debes agregar al menos una arista en modo manual', 'warning');
        return;
    }

    try {
        mostrarLoading('generar-grafo');
        
        let grafo;
        if (tipo === 'aleatorio') {
            grafo = construirGrafoAleatorioJS(n);
        } else {
            grafo = new GrafoJS(n);
            aristasManual.forEach(arista => {
                grafo.agregarArista(arista.origen, arista.destino, arista.capacidad);
            });
        }

        const resultado = {
            nodos: n,
            aristas: grafo.obtenerAristasParaWeb()
        };

        grafoActual = resultado;

        // Mostrar visualización
        mostrarGrafo(resultado);
        configurarSeleccionNodos(resultado.nodos);
        
        document.getElementById('graph-info').classList.remove('hidden');
        
        mostrarAlerta('Grafo generado exitosamente', 'success');
        
    } catch (error) {
        mostrarAlerta('Error al generar el grafo: ' + error.message, 'error');
    } finally {
        ocultarLoading('generar-grafo');
    }
}

function calcularFlujo() {
    if (!grafoActual) {
        mostrarAlerta('Primero genera un grafo', 'warning');
        return;
    }

    const fuente = parseInt(document.getElementById('fuente').value);
    const sumidero = parseInt(document.getElementById('sumidero').value);

    if (fuente === sumidero) {
        mostrarAlerta('La fuente y el sumidero deben ser diferentes', 'warning');
        return;
    }

    try {
        mostrarLoading('calcular-flujo');
        
        // Reconstruir el grafo
        const grafo = new GrafoJS(grafoActual.nodos);
        grafoActual.aristas.forEach(arista => {
            grafo.agregarArista(arista.origen, arista.destino, arista.capacidad);
        });
        
        // Ejecutar algoritmo
        const resultado = grafo.edmondsKarpDetallado(fuente, sumidero);
        
        // Calcular corte mínimo
        const corte = grafo.corteMinimo(fuente);
        
        resultadosAlgoritmo = {
            flujo_maximo: resultado.flujoMaximo,
            pasos: resultado.pasos,
            corte_minimo: {
                S: corte.S,
                T: corte.T,
                aristas_corte: corte.aristasCorte
            },
            aristas_finales: grafo.obtenerAristasParaWeb()
        };
        
        // Mostrar resultados
        mostrarResultados();
        mostrarAlerta('Flujo máximo calculado exitosamente', 'success');
        
    } catch (error) {
        mostrarAlerta('Error al calcular el flujo: ' + error.message, 'error');
    } finally {
        ocultarLoading('calcular-flujo');
    }
}

// El resto de las funciones son iguales a app.js...
// (mostrarGrafo, configurarSeleccionNodos, mostrarResultados, etc.)

// Incluir todas las funciones de visualización y utilidades del app.js original
// Por brevedad, las estoy omitiendo aquí, pero deberían copiarse exactamente

// Utilidades
function mostrarAlerta(mensaje, tipo = 'info') {
    // Crear elemento de alerta
    const alerta = document.createElement('div');
    alerta.className = `alerta alerta-${tipo}`;
    
    const iconos = {
        success: '✅',
        error: '❌', 
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    alerta.innerHTML = `
        <span class="alerta-icono">${iconos[tipo]}</span>
        <span class="alerta-mensaje">${mensaje}</span>
        <button class="alerta-cerrar" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Agregar al body
    document.body.appendChild(alerta);
    
    // Auto-remover después de 4 segundos
    setTimeout(() => {
        if (alerta.parentElement) {
            alerta.remove();
        }
    }, 4000);
}

function mostrarLoading(botonId) {
    const boton = document.getElementById(botonId);
    boton.disabled = true;
    boton.innerHTML = '<span class="loading"></span> Procesando...';
}

function ocultarLoading(botonId) {
    const boton = document.getElementById(botonId);
    boton.disabled = false;
    
    // Restaurar texto original
    const textos = {
        'generar-grafo': '🔄 Generar Grafo',
        'calcular-flujo': '🚀 Calcular Flujo Máximo'
    };
    
    boton.innerHTML = textos[botonId] || 'Procesar';
}

// Copiar el resto de funciones de app.js para completar la funcionalidad...

function mostrarGrafo(grafo) {
    const svg = d3.select('#graph-svg');
    svg.selectAll('*').remove(); // Limpiar SVG anterior

    const width = 800;
    const height = 400;
    
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Crear datos para D3
    const nodos = Array.from({length: grafo.nodos}, (_, i) => ({
        id: i,
        x: null,
        y: null
    }));

    // Procesar aristas (unidireccional): cada arista original se representa como un enlace
    const enlaces = procesarAristas(grafo.aristas);

    // Simulación de fuerza
    const simulation = d3.forceSimulation(nodos)
        .force('link', d3.forceLink(enlaces).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(35));

    // Crear marcadores para flechas (no se usan para curvas)
    const defs = svg.append('defs');
    
    defs.append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 25)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#64748b');

    // Crear enlaces simples
    const link = svg.append('g')
        .selectAll('g')
        .data(enlaces)
        .enter().append('g')
        .attr('class', 'edge');

    link.append('line')
        .attr('marker-end', 'url(#arrowhead)')
        .attr('stroke', '#64748b')
        .attr('stroke-width', 2);

    // Etiquetas simples de capacidad/flujo
    link.append('text')
        .text(d => `${d.flujo}/${d.capacidad}`)
        .attr('class', 'edge-label')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .attr('fill', '#1e293b')
        .attr('text-anchor', 'middle');

    // Crear nodos
    const node = svg.append('g')
        .selectAll('g')
        .data(nodos)
        .enter().append('g')
        .attr('class', 'node')
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));

    node.append('circle')
        .attr('r', 20);

    node.append('text')
        .text(d => d.id + 1);

    // Actualizar posiciones en cada tick (simplificado)
    simulation.on('tick', () => {
        // Líneas simples para todos los enlaces
        link.select('line')
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

        // Etiquetas centradas en las líneas
        link.select('text')
            .attr('x', d => (d.source.x + d.target.x) / 2)
            .attr('y', d => (d.source.y + d.target.y) / 2 - 5);

        node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Funciones de drag
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}

function configurarSeleccionNodos(numNodos) {
    const selectores = ['fuente', 'sumidero'];
    
    selectores.forEach(tipo => {
        const select = document.getElementById(tipo);
        select.innerHTML = '';
        
        for (let i = 1; i <= numNodos; i++) {
            const option = document.createElement('option');
            option.value = i - 1; // 0-indexed para el backend
            option.textContent = `Nodo ${i}`;
            select.appendChild(option);
        }
    });

    // Configurar valores por defecto
    document.getElementById('fuente').value = 0;
    document.getElementById('sumidero').value = numNodos - 1;
}

function mostrarResultados() {
    const panel = document.getElementById('results-panel');
    panel.classList.remove('hidden');

    // Actualizar resumen
    document.getElementById('flujo-maximo').textContent = resultadosAlgoritmo.flujo_maximo;
    document.getElementById('num-iteraciones').textContent = resultadosAlgoritmo.pasos.length - 1;

    // Reiniciar navegación
    pasoActual = 0;
    actualizarVisualizacionPaso();
    
    // Mostrar corte mínimo
    mostrarCorteMinimo();

    // Scroll hacia resultados
    panel.scrollIntoView({ behavior: 'smooth' });
}

function mostrarCorteMinimo() {
    const corte = resultadosAlgoritmo.corte_minimo;
    const descripcion = document.getElementById('corte-descripcion');
    
    let html = `
        <div class="corte-sets">
            <p><strong>Conjunto S (accesible desde fuente):</strong> ${corte.S.map(n => n + 1).join(', ')}</p>
            <p><strong>Conjunto T (no accesible):</strong> ${corte.T.map(n => n + 1).join(', ')}</p>
        </div>
        <div class="corte-aristas">
            <p><strong>Aristas del corte:</strong></p>
            <ul>
    `;
    
    corte.aristas_corte.forEach(arista => {
        html += `<li>${arista.origen + 1} → ${arista.destino + 1} (capacidad: ${arista.capacidad})</li>`;
    });
    
    html += `
            </ul>
            <p><strong>Capacidad total del corte:</strong> ${corte.aristas_corte.reduce((sum, a) => sum + a.capacidad, 0)}</p>
        </div>
    `;
    
    descripcion.innerHTML = html;
}

function cambiarPaso(delta) {
    const nuevoPaso = pasoActual + delta;
    
    if (nuevoPaso >= 0 && nuevoPaso < resultadosAlgoritmo.pasos.length) {
        pasoActual = nuevoPaso;
        actualizarVisualizacionPaso();
    }
}

function actualizarVisualizacionPaso() {
    const paso = resultadosAlgoritmo.pasos[pasoActual];
    
    // Actualizar contador
    document.getElementById('paso-actual').textContent = 
        `Paso ${pasoActual + 1} de ${resultadosAlgoritmo.pasos.length}`;
    
    // Actualizar descripción
    document.getElementById('paso-descripcion').innerHTML = `
        <h4>Iteración ${paso.iteracion}</h4>
        <p>${paso.mensaje}</p>
        ${paso.camino ? `<p><strong>Camino:</strong> ${paso.camino.map(n => n + 1).join(' → ')}</p>` : ''}
        ${paso.cuelloBotella ? `<p><strong>Flujo enviado:</strong> ${paso.cuelloBotella}</p>` : ''}
    `;
    
    // Actualizar visualización del grafo
    if (paso.tipo === 'final') {
        actualizarGrafoConResultados(paso.aristas);
    } else {
        actualizarGrafoConPaso(paso);
    }
    
    // Actualizar botones
    document.getElementById('paso-anterior').disabled = pasoActual === 0;
    document.getElementById('paso-siguiente').disabled = pasoActual === resultadosAlgoritmo.pasos.length - 1;
}

function actualizarGrafoConResultados(aristas) {
    const svg = d3.select('#graph-svg');
    
    // Actualizar etiquetas de aristas con flujos finales
    svg.selectAll('.edge text')
        .text((d, i) => {
            const arista = aristas[i];
            return arista ? `${arista.flujo}/${arista.capacidad}` : `${d.flujo}/${d.capacidad}`;
        });
    
    // Marcar fuente y sumidero
    const fuente = parseInt(document.getElementById('fuente').value);
    const sumidero = parseInt(document.getElementById('sumidero').value);
    
    svg.selectAll('.node')
        .classed('source', (d, i) => i === fuente)
        .classed('sink', (d, i) => i === sumidero);
    
    // Resaltar aristas del corte
    const cortAristas = resultadosAlgoritmo.corte_minimo.aristas_corte;
    svg.selectAll('.edge')
        .classed('cut', (d, i) => {
            return cortAristas.some(ca => ca.origen === d.source.id && ca.destino === d.target.id);
        });
}

function actualizarGrafoConPaso(paso) {
    const svg = d3.select('#graph-svg');
    
    // Limpiar resaltados anteriores
    svg.selectAll('.edge').classed('highlighted', false);
    svg.selectAll('.node').classed('active', false);
    
    // Resaltar camino encontrado
    if (paso.aristasCamino) {
        svg.selectAll('.edge')
            .classed('highlighted', (d, i) => {
                return paso.aristasCamino.some(([u, v]) => 
                    d.source.id === u && d.target.id === v
                );
            });
        
        // Resaltar nodos del camino
        if (paso.camino) {
            svg.selectAll('.node')
                .classed('active', (d, i) => paso.camino.includes(i));
        }
    }
    
    // Actualizar flujos si están disponibles
    if (paso.aristasDespues) {
        svg.selectAll('.edge text')
            .text((d, i) => {
                const arista = paso.aristasDespues.find(a => 
                    a.origen === d.source.id && a.destino === d.target.id
                );
                return arista ? `${arista.flujo}/${arista.capacidad}` : `${d.flujo}/${d.capacidad}`;
            });
    }
}

function toggleAutoPlay() {
    const boton = document.getElementById('auto-play');
    
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
        boton.innerHTML = '▶️ Auto';
    } else {
        autoPlayInterval = setInterval(() => {
            if (pasoActual < resultadosAlgoritmo.pasos.length - 1) {
                cambiarPaso(1);
            } else {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
                boton.innerHTML = '▶️ Auto';
            }
        }, 2000);
        boton.innerHTML = '⏸️ Parar';
    }
}