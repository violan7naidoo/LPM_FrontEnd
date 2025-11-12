import type { WinningLine } from "@/lib/slot-config";
import { usePaylines, useNumReels, useNumRows } from "@/lib/slot-config";

export const PAYLINE_COLORS = [
  '#FF3366', '#33FF66', '#3366FF', '#FFCC33', '#33CCFF',
  '#FF33CC', '#CCFF33', '#6633FF', '#FF6633', '#33FFCC',
  '#FFFF00' // Special color for scatter highlight
];

interface WinningLinesDisplayProps {
  winningLines: WinningLine[];
}

// Fixed sizes for 1080px vertical cabinet layout
const SYMBOL_WIDTH_MD = 196; // Fixed size for 1080px layout
const SYMBOL_HEIGHT_MD = 196; // Fixed size for 1080px layout
const GAP_MD = 4; // gap-1 (reduced from gap-4 to make borders visible)
const PADDING_MD = 16; // p-4

const SYMBOL_WIDTH_SM = 196; // Same for all breakpoints in fixed layout
const SYMBOL_HEIGHT_SM = 196;
const GAP_SM = 4; // gap-1 (reduced from gap-4 to make borders visible)
const PADDING_SM = 16;

const SYMBOL_WIDTH_XS = 196; // Same for all breakpoints in fixed layout
const SYMBOL_HEIGHT_XS = 196;
const GAP_XS = 4; // gap-1 (reduced from gap-4 to make borders visible)
const PADDING_XS = 16;


const getPointForCell = (reel: number, row: number, screen: 'xs' | 'sm' | 'md') => {
  let symbolWidth, symbolHeight, gap, padding;

  switch(screen) {
    case 'xs':
        symbolWidth = SYMBOL_WIDTH_XS;
        symbolHeight = SYMBOL_HEIGHT_XS;
        gap = GAP_XS;
        padding = PADDING_XS;
        break;
    case 'sm':
        symbolWidth = SYMBOL_WIDTH_SM;
        symbolHeight = SYMBOL_HEIGHT_SM;
        gap = GAP_SM;
        padding = PADDING_SM;
        break;
    case 'md':
    default:
        symbolWidth = SYMBOL_WIDTH_MD;
        symbolHeight = SYMBOL_HEIGHT_MD;
        gap = GAP_MD;
        padding = PADDING_MD;
        break;
  }

  const x = padding + (reel * (symbolWidth + gap)) + (symbolWidth / 2);
  const y = padding + (row * (symbolHeight + gap)) + (symbolHeight / 2);
  return { x, y };
};

const getPathForLine = (line: number[], screen: 'xs' | 'sm' | 'md') => {
  // Draw lines across the entire grid (all reels)
  const points = line
    .map((row, reel) => getPointForCell(reel, row, screen));
  
  if (points.length === 0) return '';
  
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
};

const getViewBox = (screen: 'xs' | 'sm' | 'md', numReels: number, numRows: number) => {
    let symbolWidth, symbolHeight, gap, padding;

    switch(screen) {
        case 'xs':
            symbolWidth = SYMBOL_WIDTH_XS;
            symbolHeight = SYMBOL_HEIGHT_XS;
            gap = GAP_XS;
            padding = PADDING_XS;
            break;
        case 'sm':
            symbolWidth = SYMBOL_WIDTH_SM;
            symbolHeight = SYMBOL_HEIGHT_SM;
            gap = GAP_SM;
            padding = PADDING_SM;
            break;
        case 'md':
        default:
            symbolWidth = SYMBOL_WIDTH_MD;
            symbolHeight = SYMBOL_HEIGHT_MD;
            gap = GAP_MD;
            padding = PADDING_MD;
            break;
    }
    const width = symbolWidth * numReels + gap * (numReels - 1) + padding * 2;
    const height = symbolHeight * numRows + gap * (numRows - 1) + padding * 2;
    return `0 0 ${width} ${height}`;
}


export function WinningLinesDisplay({ winningLines }: WinningLinesDisplayProps) {
  const paylines = usePaylines();
  const numReels = useNumReels();
  const numRows = useNumRows();

  return (
    <>
      {/* Desktop SVG */}
      <svg
        className="absolute inset-0 pointer-events-none hidden md:block"
        viewBox={getViewBox('md', numReels, numRows)}
        preserveAspectRatio="xMidYMid meet"
      >
        {winningLines.map((line) => {
          if (line.paylineIndex < 0 || line.paylineIndex >= paylines.length) return null;
          const path = getPathForLine(paylines[line.paylineIndex], 'md');
          if (!path) return null; // Skip if no path (all points filtered out)
          return (
            <path
              key={line.paylineIndex}
              d={path}
              stroke={PAYLINE_COLORS[line.paylineIndex % PAYLINE_COLORS.length]}
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                  filter: `drop-shadow(0 0 5px ${PAYLINE_COLORS[line.paylineIndex % PAYLINE_COLORS.length]})`,
              }}
            />
          );
        })}
      </svg>
      {/* Tablet SVG */}
       <svg
        className="absolute inset-0 pointer-events-none hidden sm:block md:hidden"
        viewBox={getViewBox('sm', numReels, numRows)}
        preserveAspectRatio="xMidYMid meet"
      >
        {winningLines.map((line) => {
          if (line.paylineIndex < 0 || line.paylineIndex >= paylines.length) return null;
          const path = getPathForLine(paylines[line.paylineIndex], 'sm');
          if (!path) return null; // Skip if no path (all points filtered out)
          return (
            <path
              key={line.paylineIndex}
              d={path}
              stroke={PAYLINE_COLORS[line.paylineIndex % PAYLINE_COLORS.length]}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                  filter: `drop-shadow(0 0 3px ${PAYLINE_COLORS[line.paylineIndex % PAYLINE_COLORS.length]})`,
              }}
            />
          );
        })}
      </svg>
      {/* Mobile SVG */}
       <svg
        className="absolute inset-0 pointer-events-none sm:hidden"
        viewBox={getViewBox('xs', numReels, numRows)}
        preserveAspectRatio="xMidYMid meet"
      >
        {winningLines.map((line) => {
          if (line.paylineIndex < 0 || line.paylineIndex >= paylines.length) return null;
          const path = getPathForLine(paylines[line.paylineIndex], 'xs');
          if (!path) return null; // Skip if no path (all points filtered out)
          return (
            <path
              key={line.paylineIndex}
              d={path}
              stroke={PAYLINE_COLORS[line.paylineIndex % PAYLINE_COLORS.length]}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                  filter: `drop-shadow(0 0 2px ${PAYLINE_COLORS[line.paylineIndex % PAYLINE_COLORS.length]})`,
              }}
            />
          );
        })}
      </svg>
    </>
  );
}

