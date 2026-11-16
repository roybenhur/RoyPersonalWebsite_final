import { useState, useRef, useEffect } from 'react';
import { Trash2, Zap, Plus, X, CircuitBoard } from 'lucide-react';
import {
  GATE_DEFS,
  GATE_ORDER,
  type GateType,
  type Circuit,
  type CircuitNode,
  type CircuitWire,
  evaluateCircuit,
} from '@/logic/gateEngine';
import {
  GateShape,
  GATE_WIDTH,
  GATE_HEIGHT,
  getGateInputPorts,
  getGateOutputPort,
} from '@/components/GateShape';

let idCounter = 0;
const genId = () => `n${Date.now()}_${idCounter++}`;

interface CircuitBuilderProps {
  inputLabels: string[];
  allowedGates?: GateType[];
  maxGates?: number;
  onCircuitChange?: (circuit: Circuit, inputIds: string[], outputIds: string[]) => void;
  showTruthTable?: boolean;
  compact?: boolean;
}

export function CircuitBuilder({
  inputLabels,
  allowedGates,
  maxGates,
  onCircuitChange,
  showTruthTable = true,
  compact = false,
}: CircuitBuilderProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<CircuitNode[]>([]);
  const [wires, setWires] = useState<CircuitWire[]>([]);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [wiring, setWiring] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showGatePallete, setShowGatePallete] = useState(false);

  const gatesToShow = allowedGates ?? GATE_ORDER;

  useEffect(() => {
    const inputNodes: CircuitNode[] = inputLabels.map((label, i) => ({
      id: `input_${i}`,
      type: 'input' as const,
      label,
      x: 40,
      y: 60 + i * 70,
      value: 0,
    }));
    setNodes(inputNodes);
    setWires([]);
  }, [inputLabels.length]);

  const evaluatedNodes = evaluateCircuit({ nodes, wires });
  const nodeMap = new Map(evaluatedNodes.map((n) => [n.id, n]));

  useEffect(() => {
    const inputIds = nodes.filter((n) => n.type === 'input').map((n) => n.id);
    const outputIds = nodes.filter((n) => n.type === 'gate' && !wires.some((w) => w.from === n.id)).map((n) => n.id);
    onCircuitChange?.({ nodes, wires }, inputIds, outputIds);
  }, [nodes, wires]);

  const addGate = (gateType: GateType) => {
    if (maxGates && nodes.filter((n) => n.type === 'gate').length >= maxGates) return;
    const gateCount = nodes.filter((n) => n.type === 'gate').length;
    const newNode: CircuitNode = {
      id: genId(),
      type: 'gate',
      gateType,
      x: 240 + (gateCount % 4) * 110,
      y: 40 + Math.floor(gateCount / 4) * 90,
      value: 0,
    };
    setNodes((prev) => [...prev, newNode]);
    setShowGatePallete(false);
  };

  const removeNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setWires((prev) => prev.filter((w) => w.from !== id && w.to !== id));
  };

  const toggleInput = (id: string) => {
    setNodes((prev) => prev.map((n) => n.id === id ? { ...n, value: n.value ? 0 : 1 } : n));
  };

  const removeWire = (id: string) => {
    setWires((prev) => prev.filter((w) => w.id !== id));
  };

  // Dragging
  useEffect(() => {
    if (!draggingNode) return;
    const handleGlobalMove = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setNodes((prev) => prev.map((n) => n.id === draggingNode ? { ...n, x: Math.max(0, Math.min(rect.width - GATE_WIDTH, x - dragOffset.x)), y: Math.max(0, Math.min(rect.height - GATE_HEIGHT, y - dragOffset.y)) } : n));
    };
    const handleGlobalUp = () => setDraggingNode(null);
    window.addEventListener('mousemove', handleGlobalMove);
    window.addEventListener('mouseup', handleGlobalUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalUp);
    };
  }, [draggingNode, dragOffset]);

  // Wiring
  useEffect(() => {
    if (!wiring) return;
    const handleGlobalMove = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    const handleGlobalUp = () => setWiring(null);
    window.addEventListener('mousemove', handleGlobalMove);
    window.addEventListener('mouseup', handleGlobalUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalUp);
    };
  }, [wiring]);

  const onNodeMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === id);
    if (!node) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDragOffset({ x: e.clientX - rect.left - node.x, y: e.clientY - rect.top - node.y });
    setDraggingNode(id);
  };

  const startWire = (e: React.MouseEvent, fromId: string) => {
    e.stopPropagation();
    setWiring(fromId);
  };

  const completeWire = (e: React.MouseEvent, toId: string, toPort: number) => {
    e.stopPropagation();
    if (!wiring || wiring === toId) {
      setWiring(null);
      return;
    }
    const toNode = nodes.find((n) => n.id === toId);
    if (!toNode || toNode.type !== 'gate') {
      setWiring(null);
      return;
    }
    const def = toNode.gateType ? GATE_DEFS[toNode.gateType] : null;
    if (!def) { setWiring(null); return; }
    if (toPort >= def.inputs) { setWiring(null); return; }

    setWires((prev) => {
      const filtered = prev.filter((w) => !(w.to === toId && w.toPort === toPort));
      return [...filtered, { id: genId(), from: wiring, to: toId, toPort }];
    });
    setWiring(null);
  };

  const clearAll = () => {
    const inputNodes = inputLabels.map((label, i) => ({
      id: `input_${i}`,
      type: 'input' as const,
      label,
      x: 40,
      y: 60 + i * 70,
      value: 0,
    }));
    setNodes(inputNodes);
    setWires([]);
  };

  // Port positions in canvas coordinates
  const getOutputPos = (node: CircuitNode): { x: number; y: number } => {
    if (node.type === 'input') {
      return { x: node.x + 60, y: node.y + 20 };
    }
    const port = getGateOutputPort(node.gateType!);
    return { x: node.x + port.x, y: node.y + port.y };
  };

  const getInputPos = (node: CircuitNode, port: number): { x: number; y: number } => {
    if (node.type === 'input') return { x: node.x, y: node.y + 20 };
    const ports = getGateInputPorts(node.gateType!);
    return { x: node.x + ports[port].x, y: node.y + ports[port].y };
  };

  // Smart wire routing: route around gates when going backwards
  const buildWirePath = (from: { x: number; y: number }, to: { x: number; y: number }): string => {
    const goingRight = to.x >= from.x;
    const dx = Math.abs(to.x - from.x);
    const dy = to.y - from.y;

    if (goingRight) {
      // Normal forward connection: smooth S-curve
      const midX = from.x + dx / 2;
      return `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;
    } else {
      // Backward connection: route around — go up/down, then left, then approach
      const offset = 30;
      const dir = dy >= 0 ? 1 : -1;
      const routingY = (from.y + to.y) / 2 + dir * offset;
      return `M ${from.x} ${from.y} L ${from.x + 20} ${from.y} Q ${from.x + 30} ${from.y}, ${from.x + 30} ${from.y + 15 * dir} L ${from.x + 30} ${routingY} Q ${from.x + 30} ${routingY + 15 * -dir}, ${from.x + 15} ${routingY + 15 * -dir} L ${to.x + 15} ${routingY + 15 * -dir} Q ${to.x} ${routingY + 15 * -dir}, ${to.x} ${routingY + 15 * dir} L ${to.x} ${to.y}`;
    }
  };

  const outputNodes = nodes.filter((n) => n.type === 'gate' && !wires.some((w) => w.from === n.id));
  const gateCount = nodes.filter((n) => n.type === 'gate').length;

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setShowGatePallete(!showGatePallete)}
          disabled={maxGates ? gateCount >= maxGates : false}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600/20 border border-teal-500/30 text-teal-300 hover:bg-teal-600/30 transition-all text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
          Add Gate
        </button>
        <button
          onClick={clearAll}
          className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card text-neutral-300 hover:text-red-400 transition-all text-sm font-medium"
        >
          <Trash2 size={16} />
          Clear
        </button>
        {maxGates && (
          <span className="text-xs text-neutral-500 ml-auto">
            Gates: {gateCount}/{maxGates}
          </span>
        )}
      </div>

      {/* Gate palette */}
      {showGatePallete && (
        <div className="glass-card rounded-xl p-3 flex flex-wrap gap-2 animate-fade-in">
          {gatesToShow.map((gt) => {
            const def = GATE_DEFS[gt];
            return (
              <button
                key={gt}
                onClick={() => addGate(gt)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800/60 hover:bg-teal-600/20 border border-white/5 hover:border-teal-500/30 transition-all"
              >
                <div className="scale-75 origin-center">
                  <GateShape type={gt} value={0} />
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-white">{def.label}</div>
                  <div className="text-[10px] text-neutral-500">{def.inputs} inp</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative bg-neutral-900/60 rounded-xl border border-white/5 overflow-hidden"
        style={{ height: compact ? 300 : 420 }}
      >
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.15) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Wires */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          {wires.map((wire) => {
            const from = nodeMap.get(wire.from);
            const to = nodeMap.get(wire.to);
            if (!from || !to) return null;
            const fromPos = getOutputPos(from);
            const toPos = getInputPos(to, wire.toPort);
            return (
              <g key={wire.id} className="pointer-events-auto cursor-pointer" onClick={(e) => { e.stopPropagation(); removeWire(wire.id); }}>
                <path
                  d={buildWirePath(fromPos, toPos)}
                  fill="none"
                  stroke={from.value ? '#2dd4bf' : '#64748b'}
                  strokeWidth="2.5"
                  className="hover:stroke-red-500 transition-colors"
                />
                <circle cx={toPos.x} cy={toPos.y} r="4" fill={from.value ? '#2dd4bf' : '#64748b'} />
                <circle cx={fromPos.x} cy={fromPos.y} r="3" fill={from.value ? '#2dd4bf' : '#64748b'} />
              </g>
            );
          })}
          {/* Temp wire while connecting */}
          {wiring && (() => {
            const from = nodeMap.get(wiring);
            if (!from) return null;
            const fromPos = getOutputPos(from);
            return (
              <path
                d={buildWirePath(fromPos, mousePos)}
                fill="none"
                stroke="#2dd4bf"
                strokeWidth="2"
                strokeDasharray="5,3"
                opacity="0.6"
              />
            );
          })()}
        </svg>

        {/* Nodes */}
        {evaluatedNodes.map((node) => {
          const isInput = node.type === 'input';
          const isOutput = node.type === 'gate' && !wires.some((w) => w.from === node.id);
          const gateDef = node.gateType ? GATE_DEFS[node.gateType] : null;
          const inputPorts = node.gateType ? getGateInputPorts(node.gateType) : [];
          const outputPort = node.gateType ? getGateOutputPort(node.gateType) : null;

          return (
            <div
              key={node.id}
              className="absolute select-none"
              style={{ left: node.x, top: node.y, zIndex: 2, cursor: 'grab' }}
              onMouseDown={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest('.port-dot') || target.closest('button')) return;
                onNodeMouseDown(e, node.id);
              }}
            >
              {isInput ? (
                /* Input node */
                <div className="relative w-[60px]">
                  <button
                    onClick={() => toggleInput(node.id)}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full glass-card rounded-lg p-2 text-center hover:border-blue-500/50 transition-all"
                  >
                    <div className="text-xs text-blue-400 font-medium">{node.label}</div>
                    <div className={`text-lg font-bold ${node.value ? 'text-teal-400' : 'text-neutral-500'}`}>
                      {node.value}
                    </div>
                  </button>
                  {/* Output dot for input nodes */}
                  <div
                    className="port-dot absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-neutral-500 bg-neutral-900 hover:border-teal-400 cursor-crosshair transition-colors"
                    onMouseDown={(e) => startWire(e, node.id)}
                    title="Output — drag to connect"
                  />
                </div>
              ) : (
                /* Gate node */
                <div className="relative" style={{ width: GATE_WIDTH, height: GATE_HEIGHT }}>
                  {/* Gate shape */}
                  <GateShape type={node.gateType!} value={node.value} />

                  {/* Input port dots */}
                  {inputPorts.map((port, portIdx) => (
                    <div
                      key={portIdx}
                      className="port-dot absolute w-3.5 h-3.5 rounded-full border-2 border-neutral-500 bg-neutral-900 hover:border-teal-400 cursor-crosshair transition-colors"
                      style={{ left: port.x - 7, top: port.y - 7 }}
                      onMouseUp={(e) => completeWire(e, node.id, portIdx)}
                      title={`Input ${portIdx + 1}`}
                    />
                  ))}

                  {/* Output port dot */}
                  {outputPort && (
                    <div
                      className="port-dot absolute w-3.5 h-3.5 rounded-full border-2 border-neutral-500 bg-neutral-900 hover:border-teal-400 cursor-crosshair transition-colors"
                      style={{ left: outputPort.x - 7, top: outputPort.y - 7 }}
                      onMouseDown={(e) => startWire(e, node.id)}
                      title="Output — drag to connect"
                    />
                  )}

                  {/* Value badge */}
                  <div className={`absolute -top-2 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    node.value ? 'bg-teal-500 text-neutral-950' : 'bg-neutral-700 text-neutral-400'
                  }`}>
                    {node.value}
                  </div>

                  {/* Gate label below */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-neutral-500 font-medium whitespace-nowrap">
                    {gateDef?.label}
                  </div>

                  {/* Output label */}
                  {isOutput && (
                    <div className="absolute -bottom-4 right-0 text-[10px] text-amber-400 font-medium whitespace-nowrap">
                      = {node.value}
                    </div>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeNode(node.id); }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-red-600/80 hover:bg-red-500 flex items-center justify-center transition-colors z-10"
                  >
                    <X size={12} className="text-white" />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Empty state hint */}
        {nodes.filter((n) => n.type === 'gate').length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-neutral-600">
              <CircuitBoard size={48} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Click "Add Gate" to start building</p>
              <p className="text-xs mt-1">Drag from output dots to input dots to wire gates</p>
            </div>
          </div>
        )}
      </div>

      {/* Output summary */}
      {outputNodes.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-neutral-400 font-medium">Output:</span>
          {outputNodes.map((n) => (
            <span key={n.id} className="flex items-center gap-1.5 px-3 py-1 rounded-lg glass-card">
              <Zap size={14} className={n.value ? 'text-teal-400' : 'text-neutral-600'} />
              <span className={n.value ? 'text-teal-400 font-bold' : 'text-neutral-500'}>
                {n.value}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Truth table */}
      {showTruthTable && outputNodes.length > 0 && (
        <TruthTable
          nodes={evaluatedNodes}
          wires={wires}
          inputIds={nodes.filter((n) => n.type === 'input').map((n) => n.id)}
          outputIds={outputNodes.map((n) => n.id)}
          inputLabels={inputLabels}
        />
      )}
    </div>
  );
}

function TruthTable({
  nodes,
  wires,
  inputIds,
  outputIds,
  inputLabels,
}: {
  nodes: CircuitNode[];
  wires: CircuitWire[];
  inputIds: string[];
  outputIds: string[];
  inputLabels: string[];
}) {
  const [rows, setRows] = useState<{ inputs: number[]; outputs: number[] }[]>([]);

  useEffect(() => {
    const n = inputIds.length;
    const newRows: { inputs: number[]; outputs: number[] }[] = [];
    for (let i = 0; i < 1 << n; i++) {
      const inputValues: number[] = [];
      for (let j = n - 1; j >= 0; j--) {
        inputValues.push((i >> j) & 1);
      }
      const testNodes = nodes.map((node) => {
        if (node.type === 'input') {
          const idx = inputIds.indexOf(node.id);
          if (idx >= 0) return { ...node, value: inputValues[idx] };
        }
        return { ...node, value: 0 };
      });
      const evaluated = evaluateCircuit({ nodes: testNodes, wires });
      const outputValues = outputIds.map((oid) => evaluated.find((nn) => nn.id === oid)?.value ?? 0);
      newRows.push({ inputs: inputValues, outputs: outputValues });
    }
    setRows(newRows);
  }, [nodes, wires, inputIds, outputIds]);

  return (
    <div className="glass-card rounded-xl p-4 overflow-x-auto">
      <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Truth Table</div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            {inputLabels.map((label) => (
              <th key={label} className="px-3 py-1.5 text-blue-400 font-semibold text-center">{label}</th>
            ))}
            <th className="px-2 text-neutral-600">|</th>
            {outputIds.map((_, i) => (
              <th key={i} className="px-3 py-1.5 text-amber-400 font-semibold text-center">Y{i + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              {row.inputs.map((v, j) => (
                <td key={j} className={`px-3 py-1.5 text-center font-mono ${v ? 'text-teal-400' : 'text-neutral-500'}`}>{v}</td>
              ))}
              <td className="px-2 text-neutral-700">|</td>
              {row.outputs.map((v, j) => (
                <td key={j} className={`px-3 py-1.5 text-center font-mono font-bold ${v ? 'text-amber-400' : 'text-neutral-600'}`}>{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
