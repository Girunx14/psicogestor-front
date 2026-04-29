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
import CustomEdge from './CustomEdge';

const nodeTypes = { custom: CustomNode };
const edgeTypes = { custom: CustomEdge };

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

function GenogramaEditor({ pacienteId }: Props) {
  const { data: genogramaData, isLoading } = useGenograma(pacienteId);
  const saveMutation = useSaveGenograma(pacienteId);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [editingNode, setEditingNode] = useState<EditForm | null>(null);
  const [relTipo, setRelTipo] = useState<string>('hijo');
  const [saved, setSaved] = useState(false);

  // Cargar datos cuando lleguen de la API
  useEffect(() => {
    if (!genogramaData?.datos) return;
    const { nodes: ns = [], edges: es = [] } = genogramaData.datos;

    const rfNodes: Node[] = ns.map((n: GenogramaNode, index: number) => ({
      id: n.id,
      type: 'custom',
      position: n.position || { x: 200 + index * 20, y: 200 + index * 20 },
      data: { ...n, onEdit: openEdit },
    }));

    const rfEdges: Edge[] = es.map((e: GenogramaEdge) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'custom',
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
            type: 'custom',
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
          edgeTypes={edgeTypes}
          defaultEdgeOptions={{ type: 'custom' }}
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
