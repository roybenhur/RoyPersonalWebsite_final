import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, X, CheckCircle2, XCircle, ClipboardCheck } from 'lucide-react';

interface FullAdderNode {
  id: number;
  x: number;
  y: number;
}

type InputPort = 'a' | 'b' | 'cin';
type OutputPort = 'sum' | 'cout';

type WireSource =
  | { type: 'fa'; nodeId: number; port: OutputPort }
  | { type: 'bit'; bitIndex: number };

interface FullAdderWire {
  id: number;
  from: WireSource;
  toId: number;
  toPort: InputPort;
}

const NUM_BITS = 7;
const MIN_FAS = 4;
const NODE_WIDTH = 112;
const NODE_HEIGHT = 76;
const CANVAS_WIDTH = 860;
const CANVAS_HEIGHT = 400;
const BIT_AREA_WIDTH = 70;
const BIT_SPACING = 42;
const BIT_START_Y = 36;

const inputPortY: Record<InputPort, number> = { a: 18, b: 38, cin: 58 };
const outputPortY: Record<OutputPort, number> = { sum: 25, cout: 51 };

function topoSortFAs(
  nodeIds: number[],
  faInputs: Map<number, { a: WireSource | null; b: WireSource | null; cin: WireSource | null }>,
): number[] | null {
  const visited = new Set<number>();
  const inProgress = new Set<number>();
  const result: number[] = [];

  const visit = (id: number): boolean => {
    if (visited.has(id)) return true;
    if (inProgress.has(id)) return false;
    inProgress.add(id);
    const inputs = faInputs.get(id);
    if (inputs) {
      for (const src of [inputs.a, inputs.b, inputs.cin]) {
        if (src && src.type === 'fa' && !visit(src.nodeId)) return false;
      }
    }
    inProgress.delete(id);
    visited.add(id);
    result.push(id);
    return true;
  };

  for (const id of nodeIds) {
    if (!visit(id)) return null;
  }
  return result;
}

function permuteIndices(n: number): number[][] {
  if (n <= 1) return [[0]];
  const arr = Array.from({ length: n }, (_, i) => i);
  const result: number[][] = [];
  const generate = (k: number) => {
    if (k === 1) {
      result.push([...arr]);
      return;
    }
    for (let i = 0; i < k; i++) {
      generate(k - 1);
      const tmp = arr[i];
      arr[i] = arr[k - 1];
      arr[k - 1] = tmp;
    }
  };
  generate(n);
  return result;
}

export function FullAdderBuilder() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const nextNodeId = useRef(1);
  const nextWireId = useRef(1);
  const [nodes, setNodes] = useState<FullAdderNode[]>([]);
  const [wires, setWires] = useState<FullAdderWire[]>([]);
  const [draggingNode, setDraggingNode] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [wiring, setWiring] = useState<WireSource | null>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [checkResult, setCheckResult] = useState<{ correct: boolean; message: string } | null>(null);

  useEffect(() => {
    if (draggingNode === null && wiring === null) return;

    const move = (event: PointerEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      setPointer({ x, y });
      if (draggingNode !== null) {
        setNodes((current) => current.map((node) => node.id === draggingNode
          ? {
              ...node,
              x: Math.max(BIT_AREA_WIDTH + 14, Math.min(CANVAS_WIDTH - NODE_WIDTH - 8, x - dragOffset.x)),
              y: Math.max(28, Math.min(CANVAS_HEIGHT - NODE_HEIGHT - 8, y - dragOffset.y)),
            }
          : node));
      }
    };
    const end = () => {
      setDraggingNode(null);
      setWiring(null);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
    };
  }, [draggingNode, wiring, dragOffset]);

  const addFullAdder = () => {
    if (nodes.length >= NUM_BITS) return;
    const index = nodes.length;
    const id = nextNodeId.current++;
    setNodes((current) => [...current, {
      id,
      x: BIT_AREA_WIDTH + 22 + (index % 4) * 138,
      y: 40 + Math.floor(index / 4) * 120,
    }]);
  };

  const deleteNode = (nodeId: number) => {
    setNodes((current) => current.filter((n) => n.id !== nodeId));
    setWires((current) => current.filter((w) =>
      !(w.from.type === 'fa' && w.from.nodeId === nodeId) && w.toId !== nodeId
    ));
    setCheckResult(null);
  };

  const clear = () => {
    setNodes([]);
    setWires([]);
    setCheckResult(null);
  };

  const startDragging = (event: React.PointerEvent, node: FullAdderNode) => {
    const target = event.target as HTMLElement;
    if (target.closest('.fa-port') || target.closest('.fa-delete')) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDragOffset({ x: event.clientX - rect.left - node.x, y: event.clientY - rect.top - node.y });
    setDraggingNode(node.id);
    event.preventDefault();
  };

  const startWire = (event: React.PointerEvent, source: WireSource) => {
    event.stopPropagation();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) setPointer({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    setWiring(source);
    event.preventDefault();
  };

  const completeWire = (event: React.PointerEvent, toId: number, toPort: InputPort) => {
    event.stopPropagation();
    if (!wiring) return;
    if (wiring.type === 'fa' && wiring.nodeId === toId) return;
    setWires((current) => [
      ...current.filter((wire) => !(wire.toId === toId && wire.toPort === toPort)),
      { id: nextWireId.current++, from: wiring, toId, toPort },
    ]);
    setWiring(null);
  };

  const removeWire = (wireId: number) => setWires((current) => current.filter((wire) => wire.id !== wireId));

  const nodeById = (id: number) => nodes.find((node) => node.id === id);
  const outputPosition = (node: FullAdderNode, port: OutputPort) => ({ x: node.x + NODE_WIDTH, y: node.y + outputPortY[port] });
  const inputPosition = (node: FullAdderNode, port: InputPort) => ({ x: node.x, y: node.y + inputPortY[port] });
  const bitPortPosition = (bitIndex: number) => ({
    x: BIT_AREA_WIDTH,
    y: BIT_START_Y + bitIndex * BIT_SPACING,
  });

  const sourcePosition = (source: WireSource): { x: number; y: number } => {
    if (source.type === 'fa') {
      const node = nodeById(source.nodeId);
      if (!node) return { x: 0, y: 0 };
      return outputPosition(node, source.port);
    }
    return bitPortPosition(source.bitIndex);
  };

  const wirePath = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const midX = Math.max(from.x + 24, (from.x + to.x) / 2);
    return `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;
  };

  const checkSolution = () => {
    if (nodes.length < MIN_FAS) {
      setCheckResult({ correct: false, message: `You need at least ${MIN_FAS} Full Adders for a 7-bit population counter. You currently have ${nodes.length}.` });
      return;
    }

    const connectedBits = new Set<number>();
    for (const wire of wires) {
      if (wire.from.type === 'bit') connectedBits.add(wire.from.bitIndex);
    }
    for (let i = 0; i < NUM_BITS; i++) {
      if (!connectedBits.has(i)) {
        setCheckResult({ correct: false, message: `Bit ${i} is not connected. All 7 bits (0–6) must be used.` });
        return;
      }
    }

    const faInputs = new Map<number, { a: WireSource | null; b: WireSource | null; cin: WireSource | null }>();
    for (const node of nodes) {
      const aWire = wires.find((w) => w.toId === node.id && w.toPort === 'a');
      const bWire = wires.find((w) => w.toId === node.id && w.toPort === 'b');
      const cinWire = wires.find((w) => w.toId === node.id && w.toPort === 'cin');
      faInputs.set(node.id, {
        a: aWire ? aWire.from : null,
        b: bWire ? bWire.from : null,
        cin: cinWire ? cinWire.from : null,
      });
    }

    const sorted = topoSortFAs(nodes.map((n) => n.id), faInputs);
    if (!sorted) {
      setCheckResult({ correct: false, message: 'There is a cycle in your wiring. Full Adders cannot feed into each other circularly.' });
      return;
    }

    const freeOutputs: { nodeId: number; port: OutputPort }[] = [];
    for (const node of nodes) {
      for (const port of ['sum', 'cout'] as OutputPort[]) {
        const isUsed = wires.some((w) => w.from.type === 'fa' && w.from.nodeId === node.id && w.from.port === port);
        if (!isUsed) freeOutputs.push({ nodeId: node.id, port });
      }
    }

    if (freeOutputs.length < 3) {
      setCheckResult({ correct: false, message: `Your circuit has only ${freeOutputs.length} unconnected output(s). A 7-bit counter needs at least 3 output bits (to represent 0–7).` });
      return;
    }
    if (freeOutputs.length > 6) {
      setCheckResult({ correct: false, message: 'Too many unconnected outputs. Connect more Full Adders together to form a tree.' });
      return;
    }

    const perms = permuteIndices(freeOutputs.length);
    let foundCorrect = false;

    for (const perm of perms) {
      let allMatch = true;
      for (let combo = 0; combo < 128 && allMatch; combo++) {
        const bitValues = Array.from({ length: NUM_BITS }, (_, i) => (combo >> i) & 1);
        const expected = bitValues.reduce((s, v) => s + v, 0);

        const faValues = new Map<string, number>();
        const getVal = (src: WireSource | null): number => {
          if (!src) return 0;
          if (src.type === 'bit') return bitValues[src.bitIndex];
          return faValues.get(`${src.nodeId}:${src.port}`) ?? 0;
        };

        for (const nodeId of sorted) {
          const inputs = faInputs.get(nodeId)!;
          const a = getVal(inputs.a);
          const b = getVal(inputs.b);
          const cin = getVal(inputs.cin);
          faValues.set(`${nodeId}:sum`, a ^ b ^ cin);
          faValues.set(`${nodeId}:cout`, (a & b) | (a & cin) | (b & cin));
        }

        let outputVal = 0;
        for (let i = 0; i < perm.length; i++) {
          const { nodeId, port } = freeOutputs[perm[i]];
          outputVal += (faValues.get(`${nodeId}:${port}`) ?? 0) << i;
        }

        if (outputVal !== expected) allMatch = false;
      }
      if (allMatch) { foundCorrect = true; break; }
    }

    if (foundCorrect) {
      const isMinimal = nodes.length === MIN_FAS;
      setCheckResult({
        correct: true,
        message: isMinimal
          ? `Correct! ${MIN_FAS} Full Adders is the minimum for a 7-bit population counter. Tree structure: two FAs each take three bits, one FA combines their sums with the 7th bit, and the last FA combines all carries.`
          : `Correct! Your circuit counts the 1s in 7 bits using ${nodes.length} Full Adders. The minimum is ${MIN_FAS} — can you do it with fewer?`,
      });
    } else {
      setCheckResult({ correct: false, message: 'Your circuit does not correctly count the 1s in all 128 input combinations. Check that all 7 bits are connected and the FAs form a valid tree.' });
    }
  };

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <button onClick={addFullAdder} disabled={nodes.length >= NUM_BITS} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600/20 border border-teal-500/30 text-teal-300 hover:bg-teal-600/30 transition-all text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed">
          <Plus size={16} />Add Full Adder
        </button>
        <button onClick={clear} className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card text-neutral-300 hover:text-red-400 transition-all text-sm font-medium">
          <Trash2 size={16} />Clear All
        </button>
        <button onClick={checkSolution} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold hover:scale-105 transition-all text-sm">
          <ClipboardCheck size={16} />Check Solution
        </button>
        <span className="text-xs text-neutral-500 sm:ml-auto">Full Adders: {nodes.length}/{NUM_BITS} · Minimum: {MIN_FAS}</span>
      </div>

      <div className="rounded-xl border border-white/5 bg-neutral-900/60 overflow-x-auto">
        <div ref={canvasRef} className="relative" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.15) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          <div className="absolute top-2 left-3 text-[10px] uppercase tracking-wider text-neutral-600">Drag blocks to arrange · Drag from any output dot to an input dot</div>
          <div className="absolute text-[10px] uppercase tracking-wider text-cyan-500/70 font-semibold select-none" style={{ left: 10, top: BIT_START_Y - 16 }}>Input Bits</div>
          <div className="absolute bg-white/5" style={{ left: BIT_AREA_WIDTH + 8, top: 0, bottom: 0, width: 1 }} />

          {Array.from({ length: NUM_BITS }).map((_, i) => (
            <div key={`bit-${i}`} className="flex items-center gap-2 absolute" style={{ left: 8, top: BIT_START_Y + i * BIT_SPACING - 10 }}>
              <span className="text-sm font-mono font-bold text-cyan-300 select-none w-6 text-right">{i}</span>
              <div className="fa-port cursor-crosshair" onPointerDown={(e) => startWire(e, { type: 'bit', bitIndex: i })}>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-cyan-300 bg-neutral-950 block" />
              </div>
            </div>
          ))}

          <svg className="absolute inset-0 pointer-events-none" width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
            {wires.map((wire) => {
              const from = sourcePosition(wire.from);
              const toNode = nodeById(wire.toId);
              if (!toNode) return null;
              const to = inputPosition(toNode, wire.toPort);
              const color = wire.from.type === 'bit' ? '#22d3ee' : '#2dd4bf';
              return (
                <g key={wire.id} className="pointer-events-auto cursor-pointer" onClick={() => removeWire(wire.id)}>
                  <path d={wirePath(from, to)} fill="none" stroke={color} strokeWidth="2.5" />
                  <circle cx={to.x} cy={to.y} r="3" fill={color} />
                </g>
              );
            })}
            {wiring && (() => {
              const from = sourcePosition(wiring);
              return <path d={wirePath(from, pointer)} fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="5 4" />;
            })()}
          </svg>

          {nodes.length === 0 && (
            <div className="absolute flex items-center justify-center text-center text-neutral-600 text-sm pointer-events-none" style={{ left: BIT_AREA_WIDTH + 20, right: 8, top: 0, bottom: 0 }}>
              Add Full Adder blocks to begin your design.
            </div>
          )}

          {nodes.map((node) => (
            <div key={node.id} className="absolute select-none" style={{ left: node.x, top: node.y, width: NODE_WIDTH, height: NODE_HEIGHT }} onPointerDown={(event) => startDragging(event, node)}>
              <div className="relative w-full h-full rounded-lg border border-teal-400/60 bg-teal-950/80 shadow-lg shadow-teal-900/20 cursor-grab active:cursor-grabbing">
                <button
                  className="fa-delete absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center text-white z-20 transition-colors"
                  onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <X size={12} />
                </button>
                <div className="absolute inset-0 flex items-center justify-center text-lg font-bold tracking-widest text-teal-300">FA</div>
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-neutral-500">FA {node.id}</span>
                {(Object.keys(inputPortY) as InputPort[]).map((port) => (
                  <div key={port} className="fa-port absolute -left-2 flex items-center gap-1" style={{ top: inputPortY[port] - 6 }} onPointerUp={(event) => completeWire(event, node.id, port)}>
                    <span className="w-3 h-3 rounded-full border-2 border-blue-300 bg-neutral-950" />
                    <span className="absolute left-4 text-[9px] text-blue-300">{port === 'cin' ? 'Cin' : port.toUpperCase()}</span>
                  </div>
                ))}
                {(Object.keys(outputPortY) as OutputPort[]).map((port) => (
                  <div key={port} className="fa-port absolute -right-2 flex items-center gap-1" style={{ top: outputPortY[port] - 6 }} onPointerDown={(event) => startWire(event, { type: 'fa', nodeId: node.id, port })}>
                    <span className="absolute right-4 text-[9px] text-amber-300 whitespace-nowrap">{port === 'cout' ? 'Cout' : 'Sum'}</span>
                    <span className="w-3 h-3 rounded-full border-2 border-amber-300 bg-neutral-950" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-neutral-500 mt-3">
        Wire the 7 input bits (0–6) into Full Adders to count how many are 1. Tree structure: two FAs each take three bits, one FA combines their sums with the 7th bit, and the last FA combines all carries. Minimum is 4 FAs. Click any wire to remove it. Use the × button on a block to delete it.
      </p>

      {checkResult && (
        <div className={`mt-4 rounded-xl p-4 border-l-4 animate-fade-in ${checkResult.correct ? 'border-teal-500 bg-teal-500/10' : 'border-red-500 bg-red-500/10'}`}>
          <div className="flex items-start gap-3">
            {checkResult.correct
              ? <CheckCircle2 size={20} className="text-teal-400 flex-shrink-0 mt-0.5" />
              : <XCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />}
            <p className={`text-sm leading-relaxed ${checkResult.correct ? 'text-teal-300' : 'text-red-300'}`}>{checkResult.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
