import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { GenogramaNode } from '@/api/genogramaApi';

type CustomNodeData = GenogramaNode & { onEdit: (node: GenogramaNode) => void };

const TIPO_LABELS: Record<string, string> = {
  paciente: 'Paciente',
  padre: 'Padre',
  madre: 'Madre',
  hermano: 'Hermano',
  hermana: 'Hermana',
  abuelo_paterno: 'Abuelo P.',
  abuela_paterna: 'Abuela P.',
  abuelo_materno: 'Abuelo M.',
  abuela_materna: 'Abuela M.',
  hijo: 'Hijo',
  hija: 'Hija',
  pareja: 'Pareja',
  otro: 'Otro',
};

function isFemenino(sexo?: string, tipo?: string) {
  if (sexo === 'F') return true;
  if (tipo?.includes('madre') || tipo?.includes('abuela') || tipo === 'hermana' || tipo === 'hija') return true;
  return false;
}

export default memo(function CustomNode({ data }: NodeProps) {
  const nodeData = data as unknown as CustomNodeData;
  const esFemenino = isFemenino(nodeData.sexo, nodeData.tipo);
  const esPaciente = nodeData.tipo === 'paciente';

  const baseStyle: React.CSSProperties = {
    width: 80,
    height: 80,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
    position: 'relative',
    userSelect: 'none',
    border: esPaciente ? '4px double #1B396A' : '2px solid #64748b',
    backgroundColor: esPaciente ? '#EFF6FF' : esFemenino ? '#FDF2F8' : '#F0F9FF',
    color: '#1e293b',
    borderRadius: esFemenino ? '50%' : '4px',
    // Fallecido: añadir línea diagonal simulada con box-shadow
    opacity: nodeData.fallecido ? 0.6 : 1,
  };

  return (
    <div
      style={baseStyle}
      onClick={() => nodeData.onEdit(nodeData)}
      title={`${nodeData.nombre} — Clic para editar`}
    >
      <Handle type="target" position={Position.Top} id="top-target" style={{ background: '#94a3b8', width: 8, height: 8, top: -4 }} />
      <Handle type="source" position={Position.Top} id="top-source" style={{ background: 'transparent', width: 8, height: 8, top: -4, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Bottom} id="bottom-target" style={{ background: '#94a3b8', width: 8, height: 8, bottom: -4 }} />
      <Handle type="source" position={Position.Bottom} id="bottom-source" style={{ background: 'transparent', width: 8, height: 8, bottom: -4, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Left} id="left-target" style={{ background: '#94a3b8', width: 8, height: 8, left: -4 }} />
      <Handle type="source" position={Position.Left} id="left-source" style={{ background: 'transparent', width: 8, height: 8, left: -4, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Right} id="right-target" style={{ background: '#94a3b8', width: 8, height: 8, right: -4 }} />
      <Handle type="source" position={Position.Right} id="right-source" style={{ background: 'transparent', width: 8, height: 8, right: -4, pointerEvents: 'none' }} />

      <div style={{ textAlign: 'center', padding: 2 }}>
        <div style={{ fontSize: 9, color: '#64748b', marginBottom: 1 }}>
          {TIPO_LABELS[nodeData.tipo] ?? nodeData.tipo}
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, wordBreak: 'break-word', maxWidth: 72 }}>
          {nodeData.nombre || '—'}
        </div>
        {nodeData.edad != null && (
          <div style={{ fontSize: 9, color: '#94a3b8' }}>{nodeData.edad} años</div>
        )}
      </div>

      {nodeData.fallecido && (
        <div style={{
          position: 'absolute',
          top: 4,
          right: 4,
          fontSize: 10,
          color: '#ef4444',
          fontWeight: 700,
        }}>✕</div>
      )}
    </div>
  );
});
