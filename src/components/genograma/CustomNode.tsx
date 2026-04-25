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
    width: 64,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
    position: 'relative',
    userSelect: 'none',
    border: esPaciente ? '3px solid #1B396A' : '2px solid #64748b',
    backgroundColor: esPaciente ? '#EFF6FF' : '#F8FAFC',
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
      <Handle type="target" position={Position.Top} style={{ background: '#94a3b8' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#94a3b8' }} />
      <Handle type="source" position={Position.Left} style={{ background: '#94a3b8' }} />
      <Handle type="source" position={Position.Right} style={{ background: '#94a3b8' }} />

      {/* Cruz de fallecido */}
      {nodeData.fallecido && (
        <span style={{
          position: 'absolute', fontSize: 26, color: '#ef4444', top: -6, right: -2, lineHeight: 1,
        }}>✕</span>
      )}

      <div style={{ textAlign: 'center', padding: 2 }}>
        <div style={{ fontSize: 9, color: '#64748b', marginBottom: 1 }}>
          {TIPO_LABELS[nodeData.tipo] ?? nodeData.tipo}
        </div>
        <div style={{ fontSize: 11, wordBreak: 'break-word', maxWidth: 56 }}>
          {nodeData.nombre || '—'}
        </div>
        {nodeData.edad != null && (
          <div style={{ fontSize: 9, color: '#94a3b8' }}>{nodeData.edad} años</div>
        )}
      </div>
    </div>
  );
});
