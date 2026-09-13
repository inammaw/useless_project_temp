import React, { useEffect, useState, useMemo } from 'react';
import { motion, animate } from 'motion/react';
import { AmmaOperatingState } from '../types';

interface StressGaugeProps {
  stress: number;
  state: AmmaOperatingState;
  onResetStress: () => void;
  onTriggerBsod?: () => void;
}

export const StressGauge: React.FC<StressGaugeProps> = ({ stress, state, onResetStress, onTriggerBsod }) => {
  const clampedStress = Math.min(100, Math.max(0, stress));
  const isHighStress = clampedStress >= 75;
  const isCritical = clampedStress >= 98;

  // Exact target angle: -90deg (0% stress, pointing left) to +90deg (100% stress, pointing right)
  const targetRotation = -90 + (clampedStress / 100) * 180;

  // Animated needle angle for smooth spring response
  const [needleAngle, setNeedleAngle] = useState<number>(targetRotation);
  const [jitterOffset, setJitterOffset] = useState<number>(0);

  // Smoothly interpolate needle angle on stress changes
  useEffect(() => {
    const controls = animate(needleAngle, targetRotation, {
      type: 'spring',
      stiffness: 85,
      damping: 13,
      onUpdate: (latest) => setNeedleAngle(latest),
    });
    return () => controls.stop();
  }, [targetRotation]);

  // High-stress needle vibration jitter
  useEffect(() => {
    if (!isHighStress) {
      setJitterOffset(0);
      return;
    }
    const interval = setInterval(() => {
      const mag = isCritical ? 2.5 : 1.2;
      setJitterOffset((Math.random() - 0.5) * 2 * mag);
    }, 45);
    return () => clearInterval(interval);
  }, [isHighStress, isCritical]);

  const displayAngle = needleAngle + jitterOffset;

  // Text color according to danger level
  const getGaugeColor = () => {
    if (clampedStress >= 98) return 'text-red-500';
    if (clampedStress >= 75) return 'text-orange-400';
    if (clampedStress >= 40) return 'text-amber-400';
    return 'text-emerald-400';
  };

  // Pre-calculate tick marks radiating along radius 38 from center (50, 50)
  const ticks = useMemo(() => {
    return [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((p) => {
      const isMajor = p % 25 === 0 || p === 0 || p === 100;
      const angleDeg = 180 - (p / 100) * 180;
      const rad = (angleDeg * Math.PI) / 180;
      const rOuter = 38;
      const rInner = isMajor ? 32 : 35;
      return {
        val: p,
        isMajor,
        x1: +(50 + rOuter * Math.cos(rad)).toFixed(2),
        y1: +(50 - rOuter * Math.sin(rad)).toFixed(2),
        x2: +(50 + rInner * Math.cos(rad)).toFixed(2),
        y2: +(50 - rInner * Math.sin(rad)).toFixed(2),
      };
    });
  }, []);

  return (
    <div id="amma-stress-gauge-card" className="win95-box p-2.5 flex flex-col gap-2">
      <div className="flex items-center justify-between border-b border-gray-400 pb-1">
        <span className="font-bold text-xs tracking-wider flex items-center gap-1">
          <motion.span
            animate={isHighStress ? { scale: [1, 1.35, 1], opacity: [1, 0.5, 1] } : {}}
            transition={{ duration: 0.4, repeat: Infinity }}
            className={`inline-block w-2.5 h-2.5 rounded-xs border border-black ${
              isCritical
                ? 'bg-red-600 shadow-[0_0_8px_#dc2626]'
                : isHighStress
                ? 'bg-orange-500 shadow-[0_0_6px_#f97316]'
                : clampedStress >= 40
                ? 'bg-amber-400'
                : 'bg-emerald-500'
            }`}
          />
          AMMA STRESS GAUGE v1.0
        </span>
        <button
          id="btn-vent-stress"
          onClick={onResetStress}
          title="Attempt emergency reboot with tea bribe"
          className="win95-btn px-2 py-0.5 text-[10px] font-bold active:translate-y-0.5 cursor-pointer hover:bg-gray-100"
        >
          VENT STRESS
        </button>
      </div>

      {/* Analog Retro Dial & Gauge Container */}
      <div className="win95-inset bg-slate-950 p-2.5 text-white flex flex-col items-center relative overflow-hidden">
        {/* Subtle retro gauge background radial vignette */}
        <div className="absolute inset-0 bg-radial from-slate-900 to-slate-950 opacity-70 pointer-events-none" />

        {/* Semi-circular dial SVG */}
        <div className="relative w-52 h-26 flex items-center justify-center">
          <svg viewBox="0 0 100 55" className="w-full h-full overflow-visible select-none">
            {/* Dark background track arc: radius 38, center (50, 50) */}
            <path
              d="M 12 50 A 38 38 0 0 1 88 50"
              fill="none"
              stroke="#1e293b"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* Exact Mathematically Segmented Calibrated Arcs */}
            {/* CALM Zone: 0% to 40% (angle 180° to 108°) */}
            <path
              d="M 12 50 A 38 38 0 0 1 38.26 13.86"
              fill="none"
              stroke="#10b981"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            {/* SCAN Zone: 40% to 75% (angle 108° to 45°) */}
            <path
              d="M 38.26 13.86 A 38 38 0 0 1 76.87 23.13"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="4.5"
            />
            {/* PANIC Zone: 75% to 98% (angle 45° to 3.6°) */}
            <path
              d="M 76.87 23.13 A 38 38 0 0 1 87.92 47.61"
              fill="none"
              stroke="#f97316"
              strokeWidth="4.5"
            />
            {/* MARTYR / BSOD Zone: 98% to 100% (angle 3.6° to 0°) */}
            <path
              d="M 87.92 47.61 A 38 38 0 0 1 88 50"
              fill="none"
              stroke="#ef4444"
              strokeWidth="4.5"
              strokeLinecap="round"
            />

            {/* Precision Tick Marks */}
            {ticks.map((t) => (
              <line
                key={t.val}
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke={t.isMajor ? '#ffffff' : '#64748b'}
                strokeWidth={t.isMajor ? '1' : '0.6'}
                strokeLinecap="round"
              />
            ))}

            {/* Calibrated Numeric Ticks */}
            <text x="7" y="52" fill="#94a3b8" fontSize="3.5" fontFamily="monospace" textAnchor="end">0</text>
            <text x="21" y="27" fill="#94a3b8" fontSize="3.2" fontFamily="monospace" textAnchor="middle">25</text>
            <text x="50" y="8" fill="#94a3b8" fontSize="3.5" fontFamily="monospace" textAnchor="middle">50</text>
            <text x="79" y="27" fill="#94a3b8" fontSize="3.2" fontFamily="monospace" textAnchor="middle">75</text>
            <text x="93" y="52" fill="#94a3b8" fontSize="3.5" fontFamily="monospace" textAnchor="start">100</text>

            {/* State Zone Labels */}
            <text x="18" y="44" fill="#34d399" fontSize="3.2" fontWeight="bold" fontFamily="monospace">CALM</text>
            <text x="44" y="20" fill="#fbbf24" fontSize="3.2" fontWeight="bold" fontFamily="monospace">SCAN</text>
            <text x="70" y="36" fill="#fb923c" fontSize="3.2" fontWeight="bold" fontFamily="monospace">PANIC</text>
            <text x="82" y="47" fill="#f87171" fontSize="3" fontWeight="bold" fontFamily="monospace">BSOD</text>

            {/* Dial Needle: Rotated with native SVG transform attribute around (50, 50) */}
            <g transform={`rotate(${displayAngle} 50 50)`}>
              {/* Needle Counterweight Tail */}
              <polygon points="48.5,50 50,56 51.5,50" fill="#475569" stroke="#0f172a" strokeWidth="0.5" />
              {/* Tapered Speedometer Needle Body */}
              <polygon
                points="48.2,50 49.6,15 50.4,15 51.8,50"
                fill={isCritical ? '#dc2626' : '#ef4444'}
                filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.8))"
              />
              {/* White Needle Highlight Stripe */}
              <polygon points="49.7,50 50,14.5 50.3,50" fill="#ffffff" opacity="0.9" />
            </g>

            {/* Precision Center Pivot Point (layered over the needle) */}
            <circle cx="50" cy="50" r="4.5" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
            <circle cx="50" cy="50" r="2" fill={isCritical ? '#ef4444' : '#f87171'} />
            <circle cx="50" cy="50" r="0.7" fill="#ffffff" />
          </svg>
        </div>

        {/* Digital Readout Bar */}
        <div className="w-full flex items-center justify-between px-2 pt-1.5 font-mono text-xs border-t border-slate-800 mt-1">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">AMMA_BP:</span>
            <motion.span
              key={clampedStress}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.15 }}
              className={`font-bold text-sm tracking-wider ${getGaugeColor()}`}
            >
              {Math.round(clampedStress)}%
            </motion.span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            {isHighStress && (
              <motion.span
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 0.4, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-red-500 inline-block shadow-[0_0_5px_#ef4444]"
              />
            )}
            <span className="uppercase text-slate-300 font-bold tracking-wide">{state}</span>
          </div>
        </div>

        {/* Segmented 10-Step LED Meter with Fixed Threshold Logic */}
        <div className="w-full grid grid-cols-10 gap-1 mt-2 h-3 bg-black p-0.5 border border-slate-700 rounded-xs">
          {Array.from({ length: 10 }).map((_, i) => {
            const threshold = (i + 1) * 10;
            const isLit = clampedStress >= threshold - 5;

            // Correct color mapping according to calibrated zones
            let ledBg = 'bg-emerald-500 shadow-[0_0_4px_#10b981]';
            if (threshold > 90) {
              ledBg = 'bg-red-600 shadow-[0_0_5px_#dc2626]';
            } else if (threshold > 70) {
              ledBg = 'bg-orange-500 shadow-[0_0_5px_#f97316]';
            } else if (threshold > 40) {
              ledBg = 'bg-amber-400 shadow-[0_0_4px_#f59e0b]';
            }

            return (
              <div
                key={i}
                className={`h-full rounded-[1px] transition-opacity duration-150 ${
                  isLit ? ledBg : 'bg-slate-900 border border-slate-800/60'
                }`}
                style={{ opacity: isLit ? (isHighStress && threshold > 70 ? 0.95 : 1) : 0.2 }}
              />
            );
          })}
        </div>
      </div>

      {/* State threshold quick guide */}
      <div className="text-[10px] text-gray-600 font-mono flex justify-between items-center px-1">
        <span>0-39%: Chaya</span>
        <span>40-74%: Scan</span>
        <span>75-97%: Panic</span>
        {onTriggerBsod ? (
          <button
            id="btn-trigger-bsod"
            onClick={onTriggerBsod}
            title="Click to simulate 100% BSOD Crash"
            className="text-red-700 font-bold hover:underline cursor-pointer bg-red-50 px-1 py-0.5 rounded border border-red-200 active:scale-95 transition-transform"
          >
            98-100%: BSOD
          </button>
        ) : (
          <span className="text-red-700 font-bold">98-100%: Lockout</span>
        )}
      </div>
    </div>
  );
};

