import { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react';

type EdgeTipo = 'matrimonio' | 'union_libre' | 'separacion' | 'divorcio' | 'hijo' | 'conflicto' | 'cercano' | 'distante';

const COLORS: Record<string, string> = {
  matrimonio: '#1B396A',
  union_libre: '#6366f1',
  separacion: '#f59e0b',
  divorcio: '#ef4444',
  hijo: '#10b981',
  conflicto: '#f97316',
  cercano: '#06b6d4',
  distante: '#94a3b8',
};

export default memo(function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const tipo = (data?.tipo ?? 'hijo') as EdgeTipo;
  const color = COLORS[tipo] ?? '#94a3b8';

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const labelStyle: React.CSSProperties = {
    position: 'absolute',
    transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
    pointerEvents: 'all',
  };

  return (
    <>
      {tipo === 'matrimonio' ? (
        <MatrimonioEdge
          sourceX={sourceX} sourceY={sourceY}
          targetX={targetX} targetY={targetY}
          sourcePosition={sourcePosition}
          targetPosition={targetPosition}
          color={color}
        />
      ) : tipo === 'conflicto' ? (
        <ConflictoEdge
          sourceX={sourceX} sourceY={sourceY}
          targetX={targetX} targetY={targetY}
          sourcePosition={sourcePosition}
          targetPosition={targetPosition}
          color={color}
        />
      ) : (
        <BaseEdge
          id={id}
          path={edgePath}
          style={getEdgeStyle(tipo, color)}
        />
      )}
      <EdgeLabelRenderer>
        <div style={labelStyle} className="nodrag nopan">
          <span style={{ fontSize: 9, color, fontWeight: 600, background: 'white', padding: '0 3px', borderRadius: 3 }}>
            {tipo.replace('_', ' ')}
          </span>
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

function getEdgeStyle(tipo: EdgeTipo, color: string): React.CSSProperties {
  switch (tipo) {
    case 'matrimonio':
      return { stroke: color, strokeWidth: 3, strokeDasharray: '0' };
    case 'union_libre':
      return { stroke: color, strokeWidth: 2.5, strokeDasharray: '0' };
    case 'separacion':
      return { stroke: color, strokeWidth: 2.5, strokeDasharray: '12,4' };
    case 'divorcio':
      return { stroke: color, strokeWidth: 2.5, strokeDasharray: '12,4 12,4' };
    case 'hijo':
      return { stroke: color, strokeWidth: 2.5, strokeDasharray: '0' };
    case 'conflicto':
      return { stroke: color, strokeWidth: 2.5, strokeDasharray: '0' };
    case 'cercano':
      return { stroke: color, strokeWidth: 2, strokeDasharray: '0' };
    case 'distante':
      return { stroke: color, strokeWidth: 1.5, strokeDasharray: '3,3' };
  }
}

function MatrimonioEdge({
  sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  color,
}: {
  sourceX: number; sourceY: number; targetX: number; targetY: number;
  sourcePosition: any; targetPosition: any; color: string;
}) {
  const [path] = getBezierPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
  });

  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return <BaseEdge path={path} style={{ stroke: color, strokeWidth: 3 }} />;

  const nx = dx / len;
  const ny = dy / len;
  const tickLen = 8;
  const t1 = 0.3;
  const t2 = 0.7;

  const p1x = sourceX + nx * t1 * len;
  const p1y = sourceY + ny * t1 * len;
  const p2x = sourceX + nx * t2 * len;
  const p2y = sourceY + ny * t2 * len;

  const px = -ny;
  const py = nx;

  return (
    <>
      <BaseEdge path={path} style={{ stroke: color, strokeWidth: 3 }} />
      <line x1={p1x + px * tickLen} y1={p1y + py * tickLen} x2={p1x - px * tickLen} y2={p1y - py * tickLen} stroke={color} strokeWidth={2.5} />
      <line x1={p2x + px * tickLen} y1={p2y + py * tickLen} x2={p2x - px * tickLen} y2={p2y - py * tickLen} stroke={color} strokeWidth={2.5} />
    </>
  );
}

function ConflictoEdge({
  sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  color,
}: {
  sourceX: number; sourceY: number; targetX: number; targetY: number;
  sourcePosition: any; targetPosition: any; color: string;
}) {
  const [path] = getBezierPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
  });

  return (
    <path
      d={path}
      fill="none"
      stroke={color}
      strokeWidth={2.5}
      markerEnd="url(#conflicto-arrow)"
    />
  );
}
