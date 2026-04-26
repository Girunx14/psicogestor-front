import { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  ReactFlowProvider,
} from '@xyflow/react';
import type { Connection, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { GenogramaNode, GenogramaEdge } from '@/api/genogramaApi';
import { useGenograma, useSaveGenograma } from '@/hooks/useGenograma';
import CustomNode from './CustomNode';

const nodeTypes = { custom: CustomNode };

// ── Botón de impresión — debe estar dentro del árbol de ReactFlow ──────────
function PrintButton({ pacienteNombre }: { pacienteNombre: string }) {
  const [printing, setPrinting] = useState(false);

  const handlePrint = useCallback(async () => {
    setPrinting(true);
    try {
      // html-to-image captura el elemento DOM del lienzo
      const { toPng } = await import('html-to-image');
      const container = document.querySelector('.react-flow') as HTMLElement | null;
      if (!container) return;

      const options = {
        backgroundColor: '#F8FAFC',
        pixelRatio: 2,
        cacheBust: true,
        // Excluir controles y minimapa de la imagen
        filter: (node: HTMLElement) => {
          if (!node.classList) return true;
          return (
            !node.classList.contains('react-flow__minimap') &&
            !node.classList.contains('react-flow__controls')
          );
        },
      };

      // ⚠️ Primera llamada: "calienta" el cache de fuentes y estilos
      //    (bug conocido de html-to-image — sin esto los textos salen como bloques negros)
      await toPng(container, options);

      // Segunda llamada: imagen final con estilos correctamente cargados
      const dataUrl = await toPng(container, options);

      // Abrir ventana de impresión con encabezado institucional
      const win = window.open('', '_blank');
      if (!win) return;

      const fecha = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
      const hora = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

      win.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Genograma — ${pacienteNombre}</title>
  <style>
    /* Eliminar los encabezados automáticos del navegador */
    @page {
      size: A4 landscape;
      margin: 1.2cm 1.5cm;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Arial', sans-serif;
      background: #ffffff;
      color: #1a1a2e;
    }

    /* ── Encabezado institucional ──────────────────── */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 3px solid #1B396A;
      padding-bottom: 10px;
      margin-bottom: 14px;
    }
    .header-center { text-align: center; flex: 1; }
    .header-center h1 {
      font-size: 11px;
      font-weight: 800;
      color: #1B396A;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    .header-center h2 {
      font-size: 10px;
      font-weight: 600;
      color: #334155;
      margin-top: 3px;
    }
    .header-meta {
      font-size: 9px;
      color: #64748b;
      margin-top: 5px;
    }
    .header-meta strong { color: #1B396A; }

    .badge {
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 9px;
      color: #1B396A;
      font-weight: 600;
      white-space: nowrap;
    }

    /* ── Imagen del genograma ──────────────────────── */
    .genograma {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .genograma img {
      max-width: 100%;
      max-height: 470px;
      object-fit: contain;
      border: 1px solid #E2E8F0;
      border-radius: 6px;
    }

    /* ── Pie de página ─────────────────────────────── */
    .footer {
      margin-top: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #E2E8F0;
      padding-top: 6px;
    }
    .footer-left { font-size: 8px; color: #94a3b8; }
    .footer-right { font-size: 8px; color: #94a3b8; }

    /* Leyenda de vínculos */
    .leyenda {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
      margin-top: 10px;
      padding: 6px 10px;
      background: #F8FAFC;
      border-radius: 6px;
      border: 1px solid #E2E8F0;
    }
    .leyenda-item {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 8px;
      color: #475569;
    }
    .leyenda-dot {
      width: 10px;
      height: 3px;
      border-radius: 2px;
    }
  </style>
</head>
<body>

  <div class="header">
    <div class="badge">CONFIDENCIAL</div>
    <div class="header-center">
      <h1>Instituto Tecnológico de Villahermosa — Departamento de Psicología</h1>
      <h2>Genograma Familiar</h2>
      <p class="header-meta">
        Paciente: <strong>${pacienteNombre}</strong>
        &nbsp;&bull;&nbsp;
        Generado: <strong>${fecha} — ${hora}</strong>
      </p>
    </div>
    <div class="badge">1&nbsp;/&nbsp;1</div>
  </div>

  <div class="genograma">
    <img src="${dataUrl}" />
  </div>

  <div class="leyenda">
    <span class="leyenda-item"><span class="leyenda-dot" style="background:#10b981"></span>Descendencia</span>
    <span class="leyenda-item"><span class="leyenda-dot" style="background:#1B396A"></span>Matrimonio</span>
    <span class="leyenda-item"><span class="leyenda-dot" style="background:#6366f1"></span>Unión libre</span>
    <span class="leyenda-item"><span class="leyenda-dot" style="background:#f59e0b"></span>Separación</span>
    <span class="leyenda-item"><span class="leyenda-dot" style="background:#ef4444"></span>Divorcio</span>
    <span class="leyenda-item"><span class="leyenda-dot" style="background:#f97316"></span>Conflicto</span>
    <span class="leyenda-item"><span class="leyenda-dot" style="background:#06b6d4"></span>Cercano</span>
    <span class="leyenda-item">⬜ Hombre &nbsp; ⬤ Mujer &nbsp; ✕ Fallecido</span>
  </div>

  <div class="footer">
    <span class="footer-left">Sistema de Gestión Psicológica — ITVH &mdash; Documento Confidencial</span>
    <span class="footer-right">No reproducir sin autorización del responsable del servicio</span>
  </div>

  <script>
    window.onload = () => {
      // Esperar a que la imagen cargue antes de imprimir
      const img = document.querySelector('img');
      if (img && !img.complete) {
        img.onload = () => setTimeout(() => window.print(), 300);
      } else {
        setTimeout(() => window.print(), 400);
      }
    };
  <\/script>
</body>
</html>`);
      win.document.close();
    } catch (err) {
      console.error('Error generando imagen del genograma:', err);
    } finally {
      setPrinting(false);
    }
  }, [pacienteNombre]);

  /*return (
    <button
      onClick={handlePrint}
      disabled={printing}
      title="Imprimir / Exportar PDF"
      className="w-full py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
    >
      {printing ? 'Preparando…' : '🖨 Imprimir / PDF'}
    </button>
  ); */
}


const TIPOS_MIEMBRO = [
  { value: 'padre', label: 'Padre' },
  { value: 'madre', label: 'Madre' },
  { value: 'hermano', label: 'Hermano' },
  { value: 'hermana', label: 'Hermana' },
  { value: 'abuelo_paterno', label: 'Abuelo Paterno' },
  { value: 'abuela_paterna', label: 'Abuela Paterna' },
  { value: 'abuelo_materno', label: 'Abuelo Materno' },
  { value: 'abuela_materna', label: 'Abuela Materna' },
  { value: 'hijo', label: 'Hijo' },
  { value: 'hija', label: 'Hija' },
  { value: 'pareja', label: 'Pareja' },
  { value: 'otro', label: 'Otro familiar' },
] as const;

const TIPOS_RELACION = [
  { value: 'hijo', label: 'Descendencia' },
  { value: 'matrimonio', label: 'Matrimonio' },
  { value: 'union_libre', label: 'Unión libre' },
  { value: 'separacion', label: 'Separación' },
  { value: 'divorcio', label: 'Divorcio' },
  { value: 'conflicto', label: 'Conflicto / tensión' },
  { value: 'cercano', label: 'Vínculo cercano' },
  { value: 'distante', label: 'Distante' },
] as const;

// Colores de aristas por tipo de relación
const EDGE_COLORS: Record<string, string> = {
  matrimonio: '#1B396A',
  union_libre: '#6366f1',
  separacion: '#f59e0b',
  divorcio: '#ef4444',
  hijo: '#10b981',
  conflicto: '#f97316',
  cercano: '#06b6d4',
  distante: '#94a3b8',
};

interface EditForm {
  id: string;
  nombre: string;
  tipo: string;
  sexo: string;
  edad: string;
  fallecido: boolean;
  enfermedad: string;
  notas: string;
}

interface Props {
  pacienteId: string;
  pacienteNombre: string;
}

function GenogramaEditor({ pacienteId, pacienteNombre }: Props) {
  const { data: genogramaData, isLoading } = useGenograma(pacienteId);
  const saveMutation = useSaveGenograma(pacienteId);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [editingNode, setEditingNode] = useState<EditForm | null>(null);
  const [relTipo, setRelTipo] = useState<string>('hijo');
  const [saved, setSaved] = useState(false);

  // Cargar datos cuando lleguen de la API
  useEffect(() => {
    if (!genogramaData) return;
    const { nodes: ns, edges: es } = genogramaData.datos;

    const rfNodes: Node[] = ns.map((n) => ({
      id: n.id,
      type: 'custom',
      position: n.position,
      data: { ...n, onEdit: openEdit },
    }));

    const rfEdges: Edge[] = es.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      // Sin label: el color ya identifica el tipo (ver leyenda en el PDF)
      style: { stroke: EDGE_COLORS[e.tipo] ?? '#94a3b8', strokeWidth: 2.5 },
      data: { tipo: e.tipo },
    }));

    setNodes(rfNodes);
    setEdges(rfEdges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genogramaData]);

  const openEdit = useCallback((node: GenogramaNode) => {
    setEditingNode({
      id: node.id,
      nombre: node.nombre,
      tipo: node.tipo,
      sexo: node.sexo ?? 'NE',
      edad: node.edad != null ? String(node.edad) : '',
      fallecido: node.fallecido ?? false,
      enfermedad: node.enfermedad ?? '',
      notas: node.notas ?? '',
    });
  }, []);

  // Añadir nuevo nodo en el centro del lienzo
  const addNode = useCallback((tipo: string) => {
    const id = `n_${Date.now()}`;
    const label = TIPOS_MIEMBRO.find((t) => t.value === tipo)?.label ?? tipo;
    const newNode: Node = {
      id,
      type: 'custom',
      position: { x: 200 + Math.random() * 200, y: 200 + Math.random() * 100 },
      data: {
        id,
        tipo,
        nombre: label,
        sexo: 'NE',
        fallecido: false,
        onEdit: openEdit,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [openEdit, setNodes]);

  // Conectar nodos
  const onConnect = useCallback(
    (params: Connection) => {
      const edgeId = `e_${Date.now()}`;
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            id: edgeId,
            // Sin label: el color ya identifica el tipo (ver leyenda en el PDF)
            style: { stroke: EDGE_COLORS[relTipo] ?? '#94a3b8', strokeWidth: 2.5 },
            data: { tipo: relTipo },
          },
          eds
        )
      );
    },
    [relTipo, setEdges]
  );

  // Guardar cambios
  const handleSave = useCallback(() => {
    const genNodes: GenogramaNode[] = nodes.map((n) => ({
      id: n.id,
      tipo: n.data.tipo as GenogramaNode['tipo'],
      nombre: n.data.nombre as string,
      sexo: n.data.sexo as GenogramaNode['sexo'],
      edad: n.data.edad as number | undefined,
      fallecido: Boolean(n.data.fallecido),
      enfermedad: n.data.enfermedad as string | undefined,
      notas: n.data.notas as string | undefined,
      position: n.position,
    }));

    const genEdges: GenogramaEdge[] = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      tipo: (e.data?.tipo as GenogramaEdge['tipo']) ?? 'hijo',
    }));

    saveMutation.mutate({ nodes: genNodes, edges: genEdges }, {
      onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2500); },
    });
  }, [nodes, edges, saveMutation]);

  // Aplicar edición de nodo
  const applyEdit = () => {
    if (!editingNode) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === editingNode.id
          ? {
            ...n,
            data: {
              ...n.data,
              nombre: editingNode.nombre,
              tipo: editingNode.tipo,
              sexo: editingNode.sexo,
              edad: editingNode.edad ? parseInt(editingNode.edad) : undefined,
              fallecido: editingNode.fallecido,
              enfermedad: editingNode.enfermedad || undefined,
              notas: editingNode.notas || undefined,
              onEdit: openEdit,
            },
          }
          : n
      )
    );
    setEditingNode(null);
  };

  const deleteNode = () => {
    if (!editingNode) return;
    setNodes((nds) => nds.filter((n) => n.id !== editingNode.id));
    setEdges((eds) => eds.filter((e) => e.source !== editingNode.id && e.target !== editingNode.id));
    setEditingNode(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Cargando genograma…
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-[640px]">
      {/* Panel lateral */}
      <aside className="w-56 flex-shrink-0 bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-4 shadow-sm overflow-y-auto">
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Añadir miembro
          </h4>
          <div className="grid grid-cols-1 gap-1">
            {TIPOS_MIEMBRO.map((t) => (
              <button
                key={t.value}
                onClick={() => addNode(t.value)}
                className="text-left text-sm px-3 py-1.5 rounded-lg hover:bg-[#EFF6FF] hover:text-[#1B396A] text-gray-600 transition-colors"
              >
                + {t.label}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-gray-100" />

        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Tipo de relación
          </h4>
          <p className="text-xs text-gray-400 mb-2">
            Al conectar dos nodos se usará este tipo de vínculo.
          </p>
          <select
            value={relTipo}
            onChange={(e) => setRelTipo(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1B396A]/30"
          >
            {TIPOS_RELACION.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        <hr className="border-gray-100" />

        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="w-full py-2 bg-[#1B396A] text-white text-sm font-semibold rounded-xl hover:bg-[#162d55] transition-colors disabled:opacity-50"
        >
          {saveMutation.isPending ? 'Guardando…' : saved ? '✓ Guardado' : 'Guardar Genograma'}
        </button>

        {/*<PrintButton pacienteNombre={pacienteNombre} />*/}

        <div className="text-xs text-gray-400 space-y-1 mt-auto">
          <p>• Arrastra nodos para reorganizar</p>
          <p>• Conecta nodos arrastrando desde los puntos laterales</p>
          <p>• Clic en un nodo para editarlo</p>
          <p>• Tecla <kbd className="bg-gray-100 px-1 rounded">Del</kbd> para eliminar selección</p>
        </div>
      </aside>

      {/* Lienzo React Flow */}
      <div className="flex-1 rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          deleteKeyCode="Delete"
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e2e8f0" />
          <Controls />
          <MiniMap
            nodeColor={(n) => (n.data?.tipo === 'paciente' ? '#1B396A' : '#94a3b8')}
            style={{ background: '#f8fafc' }}
          />
        </ReactFlow>
      </div>

      {/* Modal de edición de nodo */}
      {editingNode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setEditingNode(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-80 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[#1B396A]">Editar miembro</h3>

            <div>
              <label className="text-xs font-semibold text-gray-500">Nombre</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-[#1B396A]/30"
                value={editingNode.nombre}
                onChange={(e) => setEditingNode({ ...editingNode, nombre: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-gray-500">Tipo</label>
                <select
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm mt-1 focus:outline-none"
                  value={editingNode.tipo}
                  onChange={(e) => setEditingNode({ ...editingNode, tipo: e.target.value })}
                >
                  {TIPOS_MIEMBRO.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">Sexo biológico</label>
                <select
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm mt-1 focus:outline-none"
                  value={editingNode.sexo}
                  onChange={(e) => setEditingNode({ ...editingNode, sexo: e.target.value })}
                >
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="NB">No binario</option>
                  <option value="NE">No especificado</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-gray-500">Edad</label>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm mt-1 focus:outline-none"
                  value={editingNode.edad}
                  onChange={(e) => setEditingNode({ ...editingNode, edad: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="fallecido"
                  checked={editingNode.fallecido}
                  onChange={(e) => setEditingNode({ ...editingNode, fallecido: e.target.checked })}
                />
                <label htmlFor="fallecido" className="text-sm text-gray-600">Fallecido</label>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500">Enfermedad / padecimiento</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm mt-1 focus:outline-none"
                value={editingNode.enfermedad}
                placeholder="Opcional"
                onChange={(e) => setEditingNode({ ...editingNode, enfermedad: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500">Notas clínicas</label>
              <textarea
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm mt-1 focus:outline-none resize-none"
                value={editingNode.notas}
                placeholder="Opcional"
                onChange={(e) => setEditingNode({ ...editingNode, notas: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={applyEdit}
                className="flex-1 py-2 bg-[#1B396A] text-white text-sm font-semibold rounded-xl hover:bg-[#162d55]"
              >
                Aplicar
              </button>
              <button
                onClick={deleteNode}
                className="px-4 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-100"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Envolver con ReactFlowProvider para que PrintButton tenga acceso a useReactFlow()
export default function GenogramaEditorWrapper(props: { pacienteId: string; pacienteNombre: string }) {
  return (
    <ReactFlowProvider>
      <GenogramaEditor {...props} />
    </ReactFlowProvider>
  );
}
