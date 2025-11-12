'use client';

import { useGameConfig } from '@/hooks/use-game-config';
import Image from 'next/image';
import type { FrontendGameConfig, FrontendSymbolConfig } from '@/lib/game-config-types';

interface MiddleSectionProps {
  betAmount: number;
}

// Helper component for a single paytable cell
function PayCell({
  symbolId,
  betKey,
  config,
  hidePayouts = [],
}: {
  symbolId: string;
  betKey: string;
  config: FrontendGameConfig;
  hidePayouts?: number[];
}) {
  const symbol = config?.symbols?.[symbolId];
  if (!symbol) return null;

  const payouts = symbol.payout?.[betKey] || {};
  const actionGames = symbol.actionGames?.[betKey] || {};

  const formatPayout = (count: number) => {
    if (hidePayouts.includes(count)) return null;
    const countKey = count.toString();
    const pay = payouts[countKey] || 0;
    const ag = actionGames[countKey] || 0;
    return (
      <p key={count} className="text-white text-xl leading-tight">
        {count}x{' '}
        <span className="text-yellow-400 font-bold">
          {pay.toFixed(2)}
        </span>
        {ag > 0 && (
          <span className="text-red-500 font-bold">
            {' '}+ {ag}AG
          </span>
        )}
      </p>
    );
  };

  return (
    <div className="bg-black/40 rounded-lg p-6 border-4 border-yellow-400/50">
      <div className="flex items-center gap-8">
        <Image
          src={symbol.image}
          alt={symbol.name}
          width={160}
          height={160}
          className="object-contain w-40 h-40"
        />
        <div className="text-2xl font-bold leading-tight text-white">
          {formatPayout(5)}
          {formatPayout(4)}
          {formatPayout(3)}
          {formatPayout(2)}
        </div>
      </div>
    </div>
  );
}

// Helper for the low-pay symbols (grouped)
function LowPayCell({
  symbolIds,
  betKey,
  config,
  hidePayouts = [],
}: {
  symbolIds: string[];
  betKey: string;
  config: FrontendGameConfig;
  hidePayouts?: number[];
}) {
  const symbols = symbolIds.map((id) => config?.symbols?.[id]).filter(Boolean) as FrontendSymbolConfig[];
  if (symbols.length === 0) return null;

  // Use payouts and action games from the first symbol (they are shared)
  const payouts = symbols[0].payout?.[betKey] || {};
  const actionGames = symbols[0].actionGames?.[betKey] || {};

  const formatPayout = (count: number) => {
    if (hidePayouts.includes(count)) return null;
    const countKey = count.toString();
    const pay = payouts[countKey] || 0;
    const ag = actionGames[countKey] || 0;
    return (
      <p key={count} className="text-white text-xl leading-tight">
        {count}x{' '}
        <span className="text-yellow-400 font-bold">
          {pay.toFixed(2)}
        </span>
        {ag > 0 && (
          <span className="text-red-500 font-bold">
            {' '}+ {ag}AG
          </span>
        )}
      </p>
    );
  };

  return (
    <div className="bg-black/40 rounded-lg p-6 border-4 border-yellow-400/50">
      <div className="flex items-center gap-4">
        <div className="flex">
          {symbols.map((symbol, index) => (
            <Image
              key={symbol.name}
              src={symbol.image}
              alt={symbol.name}
              width={120}
              height={120}
              className="object-contain w-28 h-28"
              style={{ marginLeft: index > 0 ? '-16px' : '0' }}
            />
          ))}
        </div>
        <div className="text-2xl font-bold leading-tight text-white">
          {formatPayout(5)}
          {formatPayout(4)}
          {formatPayout(3)}
        </div>
      </div>
    </div>
  );
}

export function MiddleSection({ betAmount }: MiddleSectionProps) {
  const { config } = useGameConfig();

  if (!config) {
    return (
      <div
        className="flex-[1.5] flex items-center justify-center bg-black/20 border-b-2 border-primary/30"
        style={{
          background:
            'radial-gradient(circle, rgba(0,20,50,0.8) 0%, rgba(0,10,30,0.8) 100%)',
        }}
      ></div>
    );
  }

  // Format the bet amount as a string key (e.g., "1.00")
  const betKey = betAmount.toFixed(2);
  const scatterSymbol = config.bookSymbol || 'Scatter';

  // Find the high-pay symbols (excluding scatter and low-pays)
  const highPaySymbols = Object.keys(config.symbols).filter(
    (id) =>
      id !== scatterSymbol &&
      !['A', 'K', 'Q', 'J', '10'].includes(id)
  );

  // Get specific symbols
  const queenSymbol = highPaySymbols.find(id => id === 'Queen') || highPaySymbols[0] || 'Queen';
  const stoneSymbol = highPaySymbols.find(id => id === 'Stone') || highPaySymbols[1] || 'Stone';
  const leopardSymbol = highPaySymbols.find(id => id === 'Leopard') || highPaySymbols[2] || 'Leopard';
  const wolfSymbol = highPaySymbols.find(id => id === 'Wolf') || highPaySymbols[3] || 'Wolf';

  // Get substitute symbols (high-pay symbols that can substitute)
  const substituteSymbols = [queenSymbol, stoneSymbol, leopardSymbol, wolfSymbol].filter(Boolean);

  return (
    <div
      className="flex-[1.5] flex items-center justify-center bg-black/20 border-b-2 border-primary/30 p-4 relative"
      style={{
        background:
          'radial-gradient(circle, rgba(0,20,50,0.5) 0%, rgba(0,10,30,0.5) 100%)',
      }}
    >
      <div className="grid grid-cols-2 gap-x-12 gap-y-6 max-w-6xl w-full relative">
        {/* Row 1 (Top): Scatter on left, SUBSTITUTES FOR on right */}
        <PayCell
          symbolId={scatterSymbol}
          betKey={betKey}
          config={config}
          hidePayouts={[2]}
        />
        <div className="flex items-center justify-end">
          <div className="bg-black/40 rounded-lg p-6 border-4 border-yellow-400/50">
            <div className="flex flex-col gap-4 items-end">
              <p className="text-white font-bold text-2xl">SUBSTITUTES FOR</p>
              <div className="flex gap-2">
                {substituteSymbols.slice(0, 4).map((symbolId) => {
                  const symbol = config.symbols[symbolId];
                  if (!symbol) return null;
                  return (
                    <Image
                      key={symbolId}
                      src={symbol.image}
                      alt={symbol.name}
                      width={80}
                      height={80}
                      className="object-contain w-20 h-20"
                    />
                  );
                })}
              </div>
              <div className="flex gap-2">
                {['A', 'K', 'Q', 'J', '10'].map((cardId) => {
                  const cardSymbol = config.symbols[cardId];
                  if (!cardSymbol) return null;
                  return (
                    <Image
                      key={cardId}
                      src={cardSymbol.image}
                      alt={cardSymbol.name}
                      width={60}
                      height={60}
                      className="object-contain w-14 h-14"
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Queen on left, Stone on right */}
        <PayCell symbolId={queenSymbol} betKey={betKey} config={config} />
        <div className="flex justify-end">
          <PayCell symbolId={stoneSymbol} betKey={betKey} config={config} />
        </div>

        {/* Row 3: Wolf on left, Leopard on right */}
        <PayCell symbolId={wolfSymbol} betKey={betKey} config={config} />
        <div className="flex justify-end">
          <PayCell symbolId={leopardSymbol} betKey={betKey} config={config} />
        </div>

        {/* Row 4 (Bottom): A, K on left, Q, J, 10 on right */}
        <LowPayCell
          symbolIds={['A', 'K']}
          betKey={betKey}
          config={config}
        />
        <div className="flex justify-end">
          <LowPayCell
            symbolIds={['Q', 'J', '10']}
            betKey={betKey}
            config={config}
          />
        </div>

        {/* Center Feature: 10 PENNY GAMES + SPECIAL EXPANDING SYMBOL */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center bg-black/40 rounded-lg p-8 border-4 border-yellow-400/50">
          <p className="text-yellow-400 font-bold text-2xl">10 PENNY GAMES</p>
          <p className="text-yellow-400 font-bold text-2xl">+</p>
          <p className="text-yellow-400 font-bold text-xl">SPECIAL EXPANDING SYMBOL</p>
        </div>
      </div>
    </div>
  );
}
