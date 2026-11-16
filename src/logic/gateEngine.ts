export type GateType = 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR' | 'XNOR';

export interface GateDef {
  type: GateType;
  label: string;
  symbol: string;
  inputs: 1 | 2;
  description: string;
}

export const GATE_DEFS: Record<GateType, GateDef> = {
  AND: { type: 'AND', label: 'AND', symbol: '∧', inputs: 2, description: 'Output is 1 only when both inputs are 1' },
  OR: { type: 'OR', label: 'OR', symbol: '∨', inputs: 2, description: 'Output is 1 when at least one input is 1' },
  NOT: { type: 'NOT', label: 'NOT', symbol: '¬', inputs: 1, description: 'Output is the inverse of the input' },
  NAND: { type: 'NAND', label: 'NAND', symbol: '⊼', inputs: 2, description: 'Output is 0 only when both inputs are 1 (universal gate)' },
  NOR: { type: 'NOR', label: 'NOR', symbol: '⊽', inputs: 2, description: 'Output is 1 only when both inputs are 0 (universal gate)' },
  XOR: { type: 'XOR', label: 'XOR', symbol: '⊕', inputs: 2, description: 'Output is 1 when inputs differ (exclusive OR)' },
  XNOR: { type: 'XNOR', label: 'XNOR', symbol: '≡', inputs: 2, description: 'Output is 1 when inputs are equal' },
};

export const GATE_ORDER: GateType[] = ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'];

export function computeGate(type: GateType, inputs: number[]): number {
  const a = inputs[0] ?? 0;
  const b = inputs[1] ?? 0;
  switch (type) {
    case 'AND': return a & b;
    case 'OR': return a | b;
    case 'NOT': return a ? 0 : 1;
    case 'NAND': return (a & b) ? 0 : 1;
    case 'NOR': return (a | b) ? 0 : 1;
    case 'XOR': return a ^ b;
    case 'XNOR': return a === b ? 1 : 0;
  }
}

// --- Circuit model ---

export interface CircuitNode {
  id: string;
  type: 'input' | 'gate';
  gateType?: GateType;
  label?: string;
  x: number;
  y: number;
  value: number;
}

export interface CircuitWire {
  id: string;
  from: string;
  to: string;
  toPort: number;
}

export interface Circuit {
  nodes: CircuitNode[];
  wires: CircuitWire[];
}

// Evaluate a circuit: returns updated nodes with computed values
export function evaluateCircuit(circuit: Circuit): CircuitNode[] {
  const nodeMap = new Map(circuit.nodes.map((n) => [n.id, { ...n }]));

  // Topological sort using Kahn's algorithm
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  circuit.nodes.forEach((n) => {
    inDegree.set(n.id, 0);
    adj.set(n.id, []);
  });

  circuit.wires.forEach((w) => {
    inDegree.set(w.to, (inDegree.get(w.to) ?? 0) + 1);
    adj.get(w.from)?.push(w.to);
  });

  const queue: string[] = [];
  inDegree.forEach((deg, id) => {
    if (deg === 0) queue.push(id);
  });

  const processed: string[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    processed.push(id);
    adj.get(id)?.forEach((next) => {
      inDegree.set(next, (inDegree.get(next) ?? 1) - 1);
      if (inDegree.get(next) === 0) queue.push(next);
    });
  }

  // Process in topological order
  processed.forEach((id) => {
    const node = nodeMap.get(id)!;
    if (node.type === 'input') return;

    const incomingWires = circuit.wires.filter((w) => w.to === id);
    incomingWires.sort((a, b) => a.toPort - b.toPort);
    const inputValues = incomingWires.map((w) => nodeMap.get(w.from)?.value ?? 0);

    if (node.gateType) {
      node.value = computeGate(node.gateType, inputValues);
    }
  });

  return Array.from(nodeMap.values());
}

// --- Truth table generation ---

export function generateTruthTable(
  circuit: Circuit,
  inputIds: string[],
  outputIds: string[]
): { inputs: number[]; outputs: number[] }[] {
  const n = inputIds.length;
  const rows: { inputs: number[]; outputs: number[] }[] = [];

  for (let i = 0; i < 1 << n; i++) {
    const inputValues: number[] = [];
    for (let j = n - 1; j >= 0; j--) {
      inputValues.push((i >> j) & 1);
    }

    const testCircuit: Circuit = {
      nodes: circuit.nodes.map((node) => {
        if (node.type === 'input') {
          const idx = inputIds.indexOf(node.id);
          if (idx >= 0) return { ...node, value: inputValues[idx] };
        }
        return { ...node, value: 0 };
      }),
      wires: circuit.wires,
    };

    const evaluated = evaluateCircuit(testCircuit);
    const outputValues = outputIds.map((oid) => evaluated.find((n) => n.id === oid)?.value ?? 0);

    rows.push({ inputs: inputValues, outputs: outputValues });
  }

  return rows;
}

// Generate truth table from a boolean expression (for target comparison)
export function targetTruthTable(
  inputCount: number,
  fn: (inputs: number[]) => number
): { inputs: number[]; outputs: number[] }[] {
  const rows: { inputs: number[]; outputs: number[] }[] = [];
  for (let i = 0; i < 1 << inputCount; i++) {
    const inputValues: number[] = [];
    for (let j = inputCount - 1; j >= 0; j--) {
      inputValues.push((i >> j) & 1);
    }
    rows.push({ inputs: inputValues, outputs: [fn(inputValues)] });
  }
  return rows;
}

// --- Challenges ---

export interface Challenge {
  id: string;
  title: string;
  description: string;
  inputLabels: string[];
  outputLabel: string;
  targetFn: (inputs: number[]) => number;
  hint: string;
  maxGates: number;
  allowedGates: GateType[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  conceptual?: {
    question: string;
    answer: string;
    explanation: string;
  };
}

export const challenges: Challenge[] = [
  {
    id: 'ch-and',
    title: 'Build an AND Gate',
    description: 'Construct a circuit that outputs 1 only when both inputs A and B are 1. Use NAND gates only!',
    inputLabels: ['A', 'B'],
    outputLabel: 'Y',
    targetFn: ([a, b]) => a & b,
    hint: 'Remember: a NAND gate with both inputs tied together acts as a NOT gate. How can you combine NOT with NAND to get AND?',
    maxGates: 3,
    allowedGates: ['NAND'],
    difficulty: 'Easy',
  },
  {
    id: 'ch-or',
    title: 'Build an OR Gate',
    description: 'Construct a circuit that outputs 1 when at least one input is 1. Use only NAND gates!',
    inputLabels: ['A', 'B'],
    outputLabel: 'Y',
    targetFn: ([a, b]) => a | b,
    hint: 'Think about De Morgan\'s laws. How can you use NOT and NAND together to produce OR?',
    maxGates: 3,
    allowedGates: ['NAND'],
    difficulty: 'Easy',
  },
  {
    id: 'ch-xor',
    title: 'Build an XOR Gate',
    description: 'Exclusive OR — output 1 only when inputs differ. Use NAND gates only!',
    inputLabels: ['A', 'B'],
    outputLabel: 'Y',
    targetFn: ([a, b]) => a ^ b,
    hint: 'XOR can be built with 4 NAND gates. Think about what intermediate signals you need — one gate combines A and B, then use that result with each input separately.',
    maxGates: 4,
    allowedGates: ['NAND'],
    difficulty: 'Medium',
  },
  {
    id: 'ch-mux',
    title: '2:1 Multiplexer',
    description: 'Build a 2:1 MUX: if S=0, output A; if S=1, output B. Use any gates.',
    inputLabels: ['A', 'B', 'S'],
    outputLabel: 'Y',
    targetFn: ([a, b, s]) => s ? b : a,
    hint: 'Think about what happens when S=0 vs S=1. One signal needs to be "selected" while the other is blocked. Which gate blocks a signal (forces it to 0)?',
    maxGates: 5,
    allowedGates: ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'],
    difficulty: 'Medium',
  },
  {
    id: 'ch-half-adder',
    title: 'Half Adder',
    description: 'Build a half adder with two outputs: one for the Sum, one for the Carry. The Sum should be 1 when exactly one input is 1, and Carry should be 1 when both inputs are 1.',
    inputLabels: ['A', 'B'],
    outputLabel: 'S,C',
    targetFn: ([a, b]) => (a ^ b) * 2 + (a & b),
    hint: 'Which gate gives 1 when inputs differ? Which gives 1 when both are 1? You need two separate output gates.',
    maxGates: 2,
    allowedGates: ['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR', 'XNOR'],
    difficulty: 'Hard',
  },
  {
    id: 'ch-nor-or',
    title: 'OR from NOR Gates',
    description: 'Build an OR gate using only NOR gates. De Morgan would be proud!',
    inputLabels: ['A', 'B'],
    outputLabel: 'Y',
    targetFn: ([a, b]) => a | b,
    hint: 'What does NOR(A, B) give you? How can you invert that result using another NOR gate?',
    maxGates: 2,
    allowedGates: ['NOR'],
    difficulty: 'Easy',
  },
  {
    id: 'ch-xnor',
    title: 'XNOR from NAND',
    description: 'Build XNOR — output 1 when both inputs are equal. NAND gates only!',
    inputLabels: ['A', 'B'],
    outputLabel: 'Y',
    targetFn: ([a, b]) => a === b ? 1 : 0,
    hint: 'XNOR is the opposite of XOR. First build XOR (4 NANDs), then invert the output with one more NAND.',
    maxGates: 5,
    allowedGates: ['NAND'],
    difficulty: 'Hard',
  },
  {
    id: 'ch-7bit-adder',
    title: 'Count 1s in 7 Bits',
    description: 'A Full Adder adds three 1-bit inputs and produces a Sum and Carry-out. Given 7 input bits, use the minimum number of Full Adders to count how many of them are 1.',
    inputLabels: [],
    outputLabel: '',
    targetFn: () => 0,
    hint: 'Think of a tree: pair up the 7 bits into groups of three, feed each group through a Full Adder, then combine the partial results. How many bits does each FA consume, and how many partial results remain?',
    maxGates: 0,
    allowedGates: [],
    difficulty: 'Hard',
    conceptual: {
      question: 'A Full Adder takes three 1-bit inputs (A, B, Carry-in) and produces two outputs (Sum, Carry-out). Given 7 input bits, what is the minimum number of Full Adders needed to count how many of them are 1?',
      answer: '4 Full Adders',
      explanation: 'Arrange the Full Adders in a tree. Layer 1: FA0 adds bits 0,1,2 and FA1 adds bits 3,4,5. Layer 2: FA2 adds FA0\'s Sum, FA1\'s Sum, and bit 6. Layer 3: FA3 adds FA0\'s Carry-out, FA1\'s Carry-out, and FA2\'s Carry-out. The three free outputs (FA2 Sum, FA3 Sum, FA3 Carry-out) form the 3-bit count (0–7).',
    },
  },
];

export function compareTruthTables(
  a: { inputs: number[]; outputs: number[] }[],
  b: { inputs: number[]; outputs: number[] }[]
): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].outputs.join('') !== b[i].outputs.join('')) return false;
  }
  return true;
}
