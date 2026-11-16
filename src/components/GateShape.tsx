import type { GateType } from '@/logic/gateEngine';

const GATE_W = 64;
const GATE_H = 50;

export function GateShape({ type, value }: { type: GateType; value: number }) {
  const stroke = value ? '#2dd4bf' : '#64748b';
  const fill = value ? 'rgba(13,148,136,0.12)' : 'rgba(30,41,59,0.6)';
  const sw = 2;

  switch (type) {
    case 'AND':
      return (
        <svg width={GATE_W} height={GATE_H} viewBox="0 0 64 50">
          <path
            d="M 8 5 L 30 5 A 20 20 0 0 1 30 45 L 8 45 Z"
            fill={fill} stroke={stroke} strokeWidth={sw}
          />
        </svg>
      );
    case 'OR':
      return (
        <svg width={GATE_W} height={GATE_H} viewBox="0 0 64 50">
          <path
            d="M 6 5 Q 20 25 6 45 Q 26 45 44 25 Q 26 5 6 5 Z"
            fill={fill} stroke={stroke} strokeWidth={sw}
          />
        </svg>
      );
    case 'NOT':
      return (
        <svg width={GATE_W} height={GATE_H} viewBox="0 0 64 50">
          <path
            d="M 8 6 L 8 44 L 42 25 Z"
            fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round"
          />
          <circle cx="46" cy="25" r="4" fill={fill} stroke={stroke} strokeWidth={sw} />
        </svg>
      );
    case 'NAND':
      return (
        <svg width={GATE_W} height={GATE_H} viewBox="0 0 64 50">
          <path
            d="M 8 5 L 26 5 A 20 20 0 0 1 26 45 L 8 45 Z"
            fill={fill} stroke={stroke} strokeWidth={sw}
          />
          <circle cx="48" cy="25" r="4" fill={fill} stroke={stroke} strokeWidth={sw} />
        </svg>
      );
    case 'NOR':
      return (
        <svg width={GATE_W} height={GATE_H} viewBox="0 0 64 50">
          <path
            d="M 6 5 Q 18 25 6 45 Q 24 45 40 25 Q 24 5 6 5 Z"
            fill={fill} stroke={stroke} strokeWidth={sw}
          />
          <circle cx="46" cy="25" r="4" fill={fill} stroke={stroke} strokeWidth={sw} />
        </svg>
      );
    case 'XOR':
      return (
        <svg width={GATE_W} height={GATE_H} viewBox="0 0 64 50">
          <path
            d="M 2 5 Q 14 25 2 45"
            fill="none" stroke={stroke} strokeWidth={sw}
          />
          <path
            d="M 8 5 Q 20 25 8 45 Q 26 45 44 25 Q 26 5 8 5 Z"
            fill={fill} stroke={stroke} strokeWidth={sw}
          />
        </svg>
      );
    case 'XNOR':
      return (
        <svg width={GATE_W} height={GATE_H} viewBox="0 0 64 50">
          <path
            d="M 2 5 Q 14 25 2 45"
            fill="none" stroke={stroke} strokeWidth={sw}
          />
          <path
            d="M 8 5 Q 20 25 8 45 Q 24 45 40 25 Q 24 5 8 5 Z"
            fill={fill} stroke={stroke} strokeWidth={sw}
          />
          <circle cx="46" cy="25" r="4" fill={fill} stroke={stroke} strokeWidth={sw} />
        </svg>
      );
  }
}

export const GATE_WIDTH = GATE_W;
export const GATE_HEIGHT = GATE_H;

// Input port positions relative to gate top-left (for 1 and 2 input gates)
export function getGateInputPorts(type: GateType): { x: number; y: number }[] {
  switch (type) {
    case 'NOT':
      return [{ x: 0, y: 25 }];
    case 'AND':
    case 'NAND':
      return [{ x: 0, y: 17 }, { x: 0, y: 33 }];
    case 'OR':
    case 'NOR':
      return [{ x: 2, y: 17 }, { x: 2, y: 33 }];
    case 'XOR':
    case 'XNOR':
      return [{ x: 4, y: 17 }, { x: 4, y: 33 }];
  }
}

// Output port position relative to gate top-left
export function getGateOutputPort(type: GateType): { x: number; y: number } {
  switch (type) {
    case 'NOT':
      return { x: 50, y: 25 };
    case 'NAND':
      return { x: 52, y: 25 };
    case 'NOR':
      return { x: 50, y: 25 };
    case 'XNOR':
      return { x: 50, y: 25 };
    case 'AND':
      return { x: 48, y: 25 };
    case 'OR':
      return { x: 44, y: 25 };
    case 'XOR':
      return { x: 44, y: 25 };
  }
}
