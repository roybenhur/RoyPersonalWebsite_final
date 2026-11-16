import { useState, useCallback } from 'react';
import { Gamepad2, ClipboardCheck, CheckCircle2, XCircle, Lightbulb, RotateCcw, ChevronRight, Trophy } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';
import { CircuitBuilder } from '@/components/CircuitBuilder';
import { GateShape } from '@/components/GateShape';
import { FullAdderBuilder } from '@/components/FullAdderBuilder';
import {
  challenges,
  targetTruthTable,
  compareTruthTables,
  evaluateCircuit,
  type Challenge,
  type Circuit,
} from '@/logic/gateEngine';

type Tab = 'playground' | 'testzone';

export function LogicLab() {
  const ref = useReveal<HTMLElement>();
  const [tab, setTab] = useState<Tab>('playground');

  return (
    <section id="logiclab" ref={ref} className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-teal-600/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="reveal text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-600/10 border border-teal-600/30 mb-4">
            <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-teal-400">Interactive Logic Design</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            Logic Gate <span className="text-teal-400">Lab</span>
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Build circuits with logic gates, toggle inputs, and see outputs in real time. Then test your skills in the challenge zone — all running live in your browser.
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-teal-600 to-cyan-400 mx-auto rounded-full mt-4" />
        </div>

        {/* Tab switcher */}
        <div className="reveal flex justify-center mb-8">
          <div className="inline-flex rounded-xl glass-card p-1.5 gap-1">
            <TabButton active={tab === 'playground'} onClick={() => setTab('playground')} icon={<Gamepad2 size={18} />} label="Playground" />
            <TabButton active={tab === 'testzone'} onClick={() => setTab('testzone')} icon={<ClipboardCheck size={18} />} label="Test Zone" />
          </div>
        </div>

        {/* Content */}
        {tab === 'playground' ? <Playground /> : <TestZone />}
      </div>
    </section>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 sm:px-8 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
        active
          ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-600/20'
          : 'text-neutral-400 hover:text-white'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// --- Playground ---

function Playground() {
  const [inputCount, setInputCount] = useState(2);
  const labels = ['A', 'B', 'C', 'D'].slice(0, inputCount);

  return (
    <div className="reveal animate-fade-in">
      <div className="glass-card rounded-2xl p-5 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Gamepad2 size={20} className="text-teal-400" />
              Circuit Playground
            </h3>
            <p className="text-sm text-neutral-400 mt-1">Add gates, wire them together, toggle inputs — watch the outputs change live.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-500">Inputs:</span>
            <div className="flex gap-1">
              {[2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => setInputCount(n)}
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                    inputCount === n
                      ? 'bg-teal-600 text-white'
                      : 'glass-card text-neutral-400 hover:text-white'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CircuitBuilder
        inputLabels={labels}
        showTruthTable={true}
      />

      {/* Gate reference */}
      <div className="glass-card rounded-xl p-4 mt-6">
        <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Gate Reference</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {(['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'] as const).map((gt) => {
            const descMap: Record<string, string> = {
              AND: '1 when both are 1', OR: '1 when any is 1', NOT: 'Inverts input',
              NAND: 'NOT(AND)', NOR: 'NOT(OR)', XOR: '1 when differ', XNOR: '1 when equal',
            };
            return (
              <div key={gt} className="flex flex-col items-center p-2 rounded-lg bg-neutral-800/40">
                <div className="scale-75 origin-center">
                  <GateShape type={gt} value={0} />
                </div>
                <div className="text-xs font-semibold text-white mt-1">{gt}</div>
                <div className="text-[10px] text-neutral-500 mt-0.5">{descMap[gt]}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- Test Zone ---

function TestZone() {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [circuitData, setCircuitData] = useState<{ circuit: Circuit; inputIds: string[]; outputIds: string[] } | null>(null);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showConceptAnswer, setShowConceptAnswer] = useState(false);
  const [solved, setSolved] = useState<Set<string>>(new Set());

  const handleCircuitChange = useCallback((circuit: Circuit, inputIds: string[], outputIds: string[]) => {
    setCircuitData({ circuit, inputIds, outputIds });
  }, []);

  const checkSolution = () => {
    if (!selectedChallenge || !circuitData) return;
    if (circuitData.outputIds.length === 0) {
      setResult('wrong');
      return;
    }

    const userTable = generateUserTable(circuitData, selectedChallenge);
    const targetTable = targetTruthTable(selectedChallenge.inputLabels.length, selectedChallenge.targetFn);

    const isCorrect = compareTruthTables(userTable, targetTable);
    setResult(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      setSolved((prev) => new Set(prev).add(selectedChallenge.id));
    }
  };

  const selectChallenge = (ch: Challenge) => {
    setSelectedChallenge(ch);
    setResult(null);
    setShowHint(false);
    setShowConceptAnswer(false);
  };

  if (selectedChallenge?.conceptual) {
    const conceptual = selectedChallenge.conceptual;
    return (
      <div className="reveal animate-fade-in">
        <div className="glass-card rounded-2xl p-5 sm:p-8 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/15 text-red-400 mb-3">Hard · Design Question</div>
              <h3 className="text-2xl font-bold text-white">{selectedChallenge.title}</h3>
            </div>
            <button onClick={() => { setSelectedChallenge(null); setShowConceptAnswer(false); }} className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card text-neutral-300 hover:text-white text-sm font-medium transition-all flex-shrink-0">
              <RotateCcw size={16} />Back to challenges
            </button>
          </div>
          <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-5 sm:p-6">
            <p className="text-xs uppercase tracking-wider font-semibold text-teal-400 mb-3">Question</p>
            <p className="text-base sm:text-lg leading-relaxed text-white">{conceptual.question}</p>
          </div>
          <FullAdderBuilder />
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button onClick={() => setShowConceptAnswer(!showConceptAnswer)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold hover:scale-105 transition-all">
              {showConceptAnswer ? 'Hide Answer' : 'Reveal Answer'}
            </button>
            <span className="text-sm text-neutral-500">Minimum hardware design challenge</span>
          </div>
          {showConceptAnswer && (
            <div className="mt-5 rounded-xl border-l-4 border-teal-500 bg-teal-500/10 p-5 animate-fade-in">
              <p className="text-xl font-bold text-teal-300">{conceptual.answer}</p>
              <p className="text-sm leading-relaxed text-neutral-300 mt-2">{conceptual.explanation}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="reveal animate-fade-in">
      {/* Challenge list or active challenge */}
      {!selectedChallenge ? (
        <>
          <div className="text-center mb-6">
            <p className="text-neutral-400 text-sm">Pick a challenge — each one tests your ability to build a specific logic function from gates.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.map((ch, i) => {
              const isSolved = solved.has(ch.id);
              return (
                <button
                  key={ch.id}
                  onClick={() => selectChallenge(ch)}
                  className="reveal group text-left glass-card glass-card-hover rounded-2xl p-5 relative overflow-hidden"
                  style={{ transitionDelay: `${i * 0.08}s` }}
                >
                  {isSolved && (
                    <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
                      <CheckCircle2 size={16} className="text-teal-400" />
                    </div>
                  )}
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-3 ${
                    ch.difficulty === 'Easy' ? 'bg-green-500/15 text-green-400' :
                    ch.difficulty === 'Medium' ? 'bg-amber-500/15 text-amber-400' :
                    'bg-red-500/15 text-red-400'
                  }`}>
                    {ch.difficulty}
                  </div>
                  <h4 className="font-bold text-white text-base mb-2 group-hover:text-teal-400 transition-colors">{ch.title}</h4>
                  <p className="text-xs text-neutral-400 line-clamp-2">{ch.description}</p>
                  <div className="flex items-center gap-3 mt-4 text-xs text-neutral-500">
                    {ch.conceptual ? (
                      <span>Design question</span>
                    ) : (
                      <>
                        <span>{ch.inputLabels.length} inputs</span>
                        <span>·</span>
                        <span>Max {ch.maxGates} gates</span>
                        <span>·</span>
                        <span>{ch.allowedGates.length === 1 ? `${ch.allowedGates[0]} only` : 'Any gate'}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-3 text-teal-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Start challenge <ChevronRight size={14} />
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div>
          {/* Challenge header */}
          <div className="glass-card rounded-2xl p-5 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    selectedChallenge.difficulty === 'Easy' ? 'bg-green-500/15 text-green-400' :
                    selectedChallenge.difficulty === 'Medium' ? 'bg-amber-500/15 text-amber-400' :
                    'bg-red-500/15 text-red-400'
                  }`}>
                    {selectedChallenge.difficulty}
                  </div>
                  {solved.has(selectedChallenge.id) && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-500/15 text-teal-400">
                      <Trophy size={12} /> Solved
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{selectedChallenge.title}</h3>
                <p className="text-sm text-neutral-300">{selectedChallenge.description}</p>
              </div>
              <button
                onClick={() => { setSelectedChallenge(null); setResult(null); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card text-neutral-300 hover:text-white text-sm font-medium transition-all flex-shrink-0"
              >
                <RotateCcw size={16} />
                Back to challenges
              </button>
            </div>

            {/* Challenge info bar */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-white/5 text-xs text-neutral-500">
              <span>Inputs: <span className="text-blue-400 font-mono">{selectedChallenge.inputLabels.join(', ')}</span></span>
              <span>Output: <span className="text-amber-400 font-mono">{selectedChallenge.outputLabel}</span></span>
              <span>Max gates: <span className="text-white font-mono">{selectedChallenge.maxGates}</span></span>
              <span>Allowed: <span className="text-teal-400 font-mono">{selectedChallenge.allowedGates.length === 1 ? selectedChallenge.allowedGates[0] + ' only' : 'All gates'}</span></span>
            </div>
          </div>

          {/* Circuit builder */}
          <CircuitBuilder
            inputLabels={selectedChallenge.inputLabels}
            allowedGates={selectedChallenge.allowedGates}
            maxGates={selectedChallenge.maxGates}
            onCircuitChange={handleCircuitChange}
            showTruthTable={true}
            compact
          />

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={checkSolution}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold shadow-lg shadow-teal-600/20 hover:shadow-teal-600/40 hover:scale-105 transition-all"
            >
              <ClipboardCheck size={18} />
              Check Solution
            </button>
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl glass-card glass-card-hover text-neutral-300 hover:text-amber-400 text-sm font-medium transition-all"
            >
              <Lightbulb size={18} />
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
          </div>

          {/* Hint */}
          {showHint && (
            <div className="glass-card rounded-xl p-4 mt-4 border-l-4 border-amber-500/50 animate-fade-in">
              <div className="flex items-start gap-3">
                <Lightbulb size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-neutral-300">{selectedChallenge.hint}</p>
              </div>
            </div>
          )}

          {/* Result */}
          {result === 'correct' && (
            <div className="glass-card rounded-xl p-6 mt-4 border-l-4 border-teal-500 animate-fade-in">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={28} className="text-teal-400" />
                <div>
                  <h4 className="text-lg font-bold text-teal-400">Correct! Circuit verified.</h4>
                  <p className="text-sm text-neutral-400 mt-1">Your circuit matches the target truth table. Try another challenge!</p>
                </div>
              </div>
            </div>
          )}
          {result === 'wrong' && (
            <div className="glass-card rounded-xl p-6 mt-4 border-l-4 border-red-500 animate-fade-in">
              <div className="flex items-center gap-3">
                <XCircle size={28} className="text-red-400" />
                <div>
                  <h4 className="text-lg font-bold text-red-400">Not quite right.</h4>
                  <p className="text-sm text-neutral-400 mt-1">
                    {circuitData?.outputIds.length === 0
                      ? 'You need at least one output gate (a gate with no wires going out from it).'
                      : 'Compare your truth table with the expected output. Check the hint if you\'re stuck!'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Target truth table */}
          <div className="glass-card rounded-xl p-4 mt-6">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Target Output</div>
            <table className="text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {selectedChallenge.inputLabels.map((label) => (
                    <th key={label} className="px-3 py-1.5 text-blue-400 font-semibold text-center">{label}</th>
                  ))}
                  <th className="px-2 text-neutral-600">|</th>
                  <th className="px-3 py-1.5 text-amber-400 font-semibold text-center">{selectedChallenge.outputLabel}</th>
                </tr>
              </thead>
              <tbody>
                {targetTruthTable(selectedChallenge.inputLabels.length, selectedChallenge.targetFn).map((row, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {row.inputs.map((v, j) => (
                      <td key={j} className={`px-3 py-1.5 text-center font-mono ${v ? 'text-teal-400' : 'text-neutral-500'}`}>{v}</td>
                    ))}
                    <td className="px-2 text-neutral-700">|</td>
                    <td className={`px-3 py-1.5 text-center font-mono font-bold ${row.outputs[0] ? 'text-amber-400' : 'text-neutral-600'}`}>{row.outputs[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Generate user truth table from circuit
function generateUserTable(
  data: { circuit: Circuit; inputIds: string[]; outputIds: string[] },
  challenge: Challenge
): { inputs: number[]; outputs: number[] }[] {
  const n = data.inputIds.length;
  const rows: { inputs: number[]; outputs: number[] }[] = [];

  for (let i = 0; i < 1 << n; i++) {
    const inputValues: number[] = [];
    for (let j = n - 1; j >= 0; j--) {
      inputValues.push((i >> j) & 1);
    }

    const testNodes = data.circuit.nodes.map((node) => {
      if (node.type === 'input') {
        const idx = data.inputIds.indexOf(node.id);
        if (idx >= 0) return { ...node, value: inputValues[idx] };
      }
      return { ...node, value: 0 };
    });
    const evaluated = evaluateCircuit({ nodes: testNodes, wires: data.circuit.wires });
    const outputValues = data.outputIds.map((oid) => evaluated.find((nn) => nn.id === oid)?.value ?? 0);

    // For multi-output challenges (like half adder), combine outputs
    if (challenge.outputLabel.includes(',')) {
      const combined = outputValues.reduce((acc, v, idx) => acc + (v << (outputValues.length - 1 - idx)), 0);
      rows.push({ inputs: inputValues, outputs: [combined] });
    } else {
      rows.push({ inputs: inputValues, outputs: [outputValues[0] ?? 0] });
    }
  }

  return rows;
}
