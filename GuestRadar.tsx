import React, { useState, useEffect } from 'react';
import { RelativeContact } from '../types';
import { sounds } from '../utils/sound';
import { Radio, Users, ShieldAlert, Coffee, Volume2, X, Cookie, AlertCircle, Eye, DoorClosed, RotateCw } from 'lucide-react';

interface GuestRadarProps {
  onClose: () => void;
  onSitoutAction: (cmd: string) => void;
}

export const GuestRadar: React.FC<GuestRadarProps> = ({ onClose, onSitoutAction }) => {
  const [activeTab, setActiveTab] = useState<'RADAR' | 'LOGS' | 'INTEL'>('RADAR');
  const [selectedRelativeIndex, setSelectedRelativeIndex] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [radarSweepAngle, setRadarSweepAngle] = useState<number>(0);

  const relatives: (RelativeContact & { 
    id: string;
    vehicle: string; 
    threatBadge: string;
    status: string;
    actionTip: string;
    xPercent: number;
    yPercent: number;
  })[] = [
    {
      id: 'ammavan',
      name: 'Sukumaran Ammavan',
      relation: 'Maternal Uncle (Pensioned Govt Officer)',
      threatLevel: 'GOSSIP_HAZARD',
      threatBadge: 'CRITICAL (GOSSIP)',
      distanceMeters: 14,
      vehicle: 'Bajaj Chetak 150cc (2-Stroke Kickstart)',
      status: 'Ascending Sitout Porch Steps',
      actionTip: 'Must serve piping hot Sulaimani tea or endure 45 mins of salary audit.',
      favoriteQuestion: "'Infosys-il jolikk keri ennu kettallo, ethra aanu in-hand salary? PF povan undo?'",
      xPercent: 52,
      yPercent: 42
    },
    {
      id: 'remani',
      name: 'Remani Aunty',
      relation: 'Neighbor & Self-Appointed Marriage Broker',
      threatLevel: 'MARRIAGE_BROKER',
      threatBadge: 'DEFCON-2 (HOROSCOPE)',
      distanceMeters: 38,
      vehicle: 'TVS Scooty Pep (Silent Glider)',
      status: 'Crossing front garden flowerbed',
      actionTip: 'Hide horoscope book (jathakam) immediately before she asks Amma!',
      favoriteQuestion: "'Jathakam onnu tharuvo Sheele? Palakkad nalla oru Engineer aalojana undu! 28 vayassaayi!'",
      xPercent: 78,
      yPercent: 28
    },
    {
      id: 'kunjumon',
      name: 'Kunjumon Master',
      relation: 'Maths Tuition Teacher (10th Standard)',
      threatLevel: 'TEA_INSPECTOR',
      threatBadge: 'ACADEMIC INQUEST',
      distanceMeters: 75,
      vehicle: 'Atlas Goldline Bicycle (Bell Ringing)',
      status: 'Near outer boundary iron gate',
      actionTip: 'Open PSC study book and pretend to calculate logarithmic formulas.',
      favoriteQuestion: "'Integration theorem orma undo atho athum computer game kalichu poyo?'",
      xPercent: 24,
      yPercent: 75
    }
  ];

  // Radar sweep angle animation
  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setRadarSweepAngle(prev => (prev + 4) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, [isScanning]);

  const activeRelative = relatives[selectedRelativeIndex] || relatives[0];

  const handleAction = (cmd: string) => {
    sounds.playKeyClick();
    onSitoutAction(cmd);
  };

  const playAmmavanScooter = () => {
    sounds.playScooterKickstart();
  };

  const triggerRadarSonar = () => {
    sounds.playRadarPing();
  };

  return (
    <div className="w-full h-full flex flex-col font-mono text-xs select-none bg-[#c0c0c0] win95-box overflow-hidden shadow-2xl">
      {/* Authentic Windows 95 Title Bar */}
      <div className="win95-titlebar px-2 py-1 flex items-center justify-between text-xs font-bold select-none cursor-move flex-shrink-0">
        <div className="flex items-center gap-1.5 truncate">
          <Radio size={13} className="text-yellow-300 animate-pulse" />
          <span className="truncate">SITOUT GUEST RADAR - [THARAVADU PERIMETER DEFENSE 1.0]</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          <button
            onClick={() => {
              sounds.playKeyClick();
              triggerRadarSonar();
            }}
            title="Sonar Ping"
            className="win95-btn w-4 h-4 p-0 flex items-center justify-center font-bold text-[10px] text-gray-900 cursor-pointer"
          >
            <RotateCw size={9} />
          </button>
          <button
            onClick={() => {
              sounds.playKeyClick();
              onClose();
            }}
            title="Close"
            className="win95-btn w-4 h-4 p-0 flex items-center justify-center font-bold text-[10px] text-gray-900 cursor-pointer"
          >
            <X size={10} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Menu Bar */}
      <div className="flex items-center gap-3 px-2 py-0.5 border-b border-gray-400 bg-[#dfdfdf] text-[11px] text-gray-800 flex-shrink-0">
        <span className="hover:underline cursor-pointer">Sensors</span>
        <span className="hover:underline cursor-pointer">Perimeter</span>
        <span className="hover:underline cursor-pointer">Acoustics</span>
        <span className="hover:underline cursor-pointer">Sitout Mode</span>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 px-2 pt-1.5 border-b border-gray-400 bg-[#c0c0c0] text-[11px] flex-shrink-0">
        <button
          onClick={() => {
            sounds.playKeyClick();
            setActiveTab('RADAR');
          }}
          className={`px-3 py-1 font-bold border-t-2 border-l-2 border-r-2 cursor-pointer ${
            activeTab === 'RADAR'
              ? 'bg-[#c0c0c0] border-white border-b-0 -mb-[1px] z-10 text-black'
              : 'bg-gray-300 border-gray-400 text-gray-600'
          }`}
        >
          📡 Active Sonar
        </button>
        <button
          onClick={() => {
            sounds.playKeyClick();
            setActiveTab('INTEL');
          }}
          className={`px-3 py-1 font-bold border-t-2 border-l-2 border-r-2 cursor-pointer ${
            activeTab === 'INTEL'
              ? 'bg-[#c0c0c0] border-white border-b-0 -mb-[1px] z-10 text-black'
              : 'bg-gray-300 border-gray-400 text-gray-600'
          }`}
        >
          🗂️ Relative Dossiers
        </button>
        <button
          onClick={() => {
            sounds.playKeyClick();
            setActiveTab('LOGS');
          }}
          className={`px-3 py-1 font-bold border-t-2 border-l-2 border-r-2 cursor-pointer ${
            activeTab === 'LOGS'
              ? 'bg-[#c0c0c0] border-white border-b-0 -mb-[1px] z-10 text-black'
              : 'bg-gray-300 border-gray-400 text-gray-600'
          }`}
        >
          📋 Perimeter Telemetry
        </button>
      </div>

      {/* Main Window Content */}
      <div className="p-2.5 bg-[#c0c0c0] flex-1 flex flex-col gap-2 overflow-y-auto min-h-0">
        {activeTab === 'RADAR' && (
          <>
            {/* Radar Visual Display Screen */}
            <div className="win95-inset bg-[#02180c] p-2 flex flex-col items-center justify-center relative overflow-hidden h-44 rounded-[1px] border-2 border-gray-700 shadow-inner">
              {/* Concentric Sonar Distance Rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* 100m ring */}
                <div className="w-36 h-36 rounded-full border border-emerald-500/25"></div>
                {/* 50m ring */}
                <div className="w-24 h-24 rounded-full border border-emerald-500/35"></div>
                {/* 20m ring */}
                <div className="w-12 h-12 rounded-full border border-emerald-500/50"></div>
                {/* Crosshairs */}
                <div className="absolute w-full h-[1px] bg-emerald-500/20"></div>
                <div className="absolute h-full w-[1px] bg-emerald-500/20"></div>
                {/* Cardinal Labels */}
                <span className="absolute top-1 text-[9px] font-mono text-emerald-500/60 font-bold">N (GATE)</span>
                <span className="absolute bottom-1 text-[9px] font-mono text-emerald-500/60 font-bold">S (SITOUT)</span>
                <span className="absolute left-1.5 text-[9px] font-mono text-emerald-500/60 font-bold">W</span>
                <span className="absolute right-1.5 text-[9px] font-mono text-emerald-500/60 font-bold">E</span>
              </div>

              {/* Central Tharavadu Base Landmark */}
              <div className="absolute z-10 flex flex-col items-center pointer-events-none">
                <div className="w-3 h-3 bg-amber-400 border border-amber-800 rounded-xs shadow-sm flex items-center justify-center text-[7px] font-bold text-amber-950">
                  🏠
                </div>
              </div>

              {/* Sweeping Radar Beam */}
              <div
                style={{
                  transform: `rotate(${radarSweepAngle}deg)`,
                  transformOrigin: '50% 50%'
                }}
                className="absolute w-44 h-44 pointer-events-none flex items-center justify-center"
              >
                <div className="w-1/2 h-1/2 origin-bottom-right absolute top-0 left-0 bg-gradient-to-tr from-emerald-400/25 via-emerald-400/10 to-transparent"></div>
              </div>

              {/* Interactive Target Blips on Radar Screen */}
              {relatives.map((rel, idx) => {
                const isSelected = idx === selectedRelativeIndex;
                return (
                  <button
                    key={rel.id}
                    onClick={() => {
                      sounds.playKeyClick();
                      setSelectedRelativeIndex(idx);
                    }}
                    style={{
                      left: `${rel.xPercent}%`,
                      top: `${rel.yPercent}%`
                    }}
                    className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 p-1 group cursor-pointer focus:outline-none`}
                    title={`${rel.name} (${rel.distanceMeters}m)`}
                  >
                    <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        rel.threatLevel === 'GOSSIP_HAZARD' ? 'bg-red-500' : rel.threatLevel === 'MARRIAGE_BROKER' ? 'bg-amber-400' : 'bg-blue-400'
                      }`}></span>
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 border border-black ${
                        isSelected ? 'bg-yellow-300 ring-2 ring-yellow-400' : rel.threatLevel === 'GOSSIP_HAZARD' ? 'bg-red-500' : 'bg-emerald-400'
                      }`}></span>
                    </span>
                    <span className="absolute left-4 top-0 whitespace-nowrap text-[9px] font-mono font-bold bg-black/80 px-1 text-emerald-300 rounded border border-emerald-900 pointer-events-none opacity-80 group-hover:opacity-100">
                      {rel.name.split(' ')[0]} ({rel.distanceMeters}m)
                    </span>
                  </button>
                );
              })}

              {/* Radar Status Overlay Banner */}
              <div className="absolute bottom-1 left-2 right-2 flex items-center justify-between z-10 pointer-events-none">
                <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 bg-black/70 px-1.5 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                  <span className="font-bold">LOCK:</span> {activeRelative.name.toUpperCase()} ({activeRelative.distanceMeters}M)
                </div>
                <div className="text-[9px] font-mono text-emerald-500/80 bg-black/70 px-1.5 py-0.5 rounded">
                  FREQ: 150cc 2-STROKE
                </div>
              </div>
            </div>

            {/* Selected Target Dossier Strip */}
            <div className="win95-box p-2 bg-white flex flex-col gap-1 border border-gray-400">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-gray-900 text-xs">
                  <Users size={13} className="text-purple-700" />
                  <span>{activeRelative.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800 border border-red-300">
                    {activeRelative.threatBadge}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-300">
                    {activeRelative.distanceMeters}m away
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-gray-600 flex items-center justify-between">
                <span>{activeRelative.relation}</span>
                <span className="italic text-gray-500">{activeRelative.vehicle}</span>
              </div>

              {/* Acoustic Test Button */}
              {activeRelative.id === 'ammavan' && (
                <div className="flex items-center justify-between bg-amber-50 p-1 border border-amber-200 rounded text-[10px]">
                  <span className="text-amber-900 flex items-center gap-1 font-mono">
                    <Volume2 size={11} className="text-amber-700" />
                    <span>Acoustic Signature: Chetak Kickstart Sputter</span>
                  </span>
                  <button
                    onClick={playAmmavanScooter}
                    className="win95-btn px-1.5 py-0.5 text-[9px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-950 cursor-pointer"
                  >
                    Play Audio
                  </button>
                </div>
              )}

              <div className="win95-inset bg-amber-50/70 p-1.5 text-[10px] text-amber-950 font-serif border border-amber-200">
                <span className="font-bold font-mono text-[9px] text-amber-900 block uppercase tracking-wider">Uncomfortable Interrogation Question:</span>
                "{activeRelative.favoriteQuestion}"
              </div>
            </div>

            {/* Quick Relative Switcher Chips */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-gray-600 uppercase">Target:</span>
              <div className="flex-1 flex gap-1">
                {relatives.map((rel, idx) => (
                  <button
                    key={rel.id}
                    onClick={() => {
                      sounds.playKeyClick();
                      setSelectedRelativeIndex(idx);
                    }}
                    className={`flex-1 py-1 px-1 text-[10px] font-bold truncate cursor-pointer ${
                      idx === selectedRelativeIndex
                        ? 'win95-inset bg-blue-100 text-blue-900 font-bold border border-blue-400'
                        : 'win95-btn bg-[#dfdfdf] text-gray-800'
                    }`}
                  >
                    {rel.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Sit-Out Countermeasure Action Buttons */}
            <div className="win95-box p-2 bg-[#f4f4f4] flex flex-col gap-1.5 border border-gray-400">
              <div className="text-[10px] font-bold text-gray-800 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <ShieldAlert size={12} className="text-amber-600" />
                  SIT-OUT COUNTERMEASURES PROTOCOL:
                </span>
                <span className="text-[9px] text-gray-500 font-normal">Select Action to Dispatch</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => handleAction('sitout --greet --tea')}
                  className="win95-btn p-1.5 text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-950 flex flex-col items-center justify-center gap-0.5 cursor-pointer text-center"
                  title="Serve hot black tea to appease relatives (-20% Stress)"
                >
                  <Coffee size={13} className="text-emerald-700" />
                  <span>Serve Tea</span>
                  <span className="text-[8px] font-normal text-emerald-800">-20% Stress</span>
                </button>

                <button
                  onClick={() => handleAction('biscuit --goodday')}
                  className="win95-btn p-1.5 text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-950 flex flex-col items-center justify-center gap-0.5 cursor-pointer text-center"
                  title="Offer Britannia Good Day biscuits (-20% Stress)"
                >
                  <Cookie size={13} className="text-amber-700" />
                  <span>Good Day Biscuits</span>
                  <span className="text-[8px] font-normal text-amber-800">-20% Stress</span>
                </button>

                <button
                  onClick={() => handleAction('bedroom --lock --hide')}
                  className="win95-btn p-1.5 text-[10px] font-bold bg-red-50 hover:bg-red-100 text-red-950 flex flex-col items-center justify-center gap-0.5 cursor-pointer text-center"
                  title="Lock bedroom and hide (+20% Amma disapproval!)"
                >
                  <DoorClosed size={13} className="text-red-700" />
                  <span>Lock & Hide</span>
                  <span className="text-[8px] font-normal text-red-700">+20% Amma Rage</span>
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'INTEL' && (
          <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
            <div className="win95-inset bg-white p-2 text-gray-900 space-y-2.5">
              {relatives.map((rel, idx) => (
                <div key={rel.id} className="border-b border-gray-200 pb-2 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span className="text-blue-900">{idx + 1}. {rel.name}</span>
                    <span className="text-[9px] bg-purple-100 text-purple-900 px-1 py-0.5 rounded font-mono">
                      {rel.threatBadge}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-600 mt-0.5">
                    <strong>Relation:</strong> {rel.relation}
                  </div>
                  <div className="text-[10px] text-gray-600">
                    <strong>Conveyance:</strong> {rel.vehicle}
                  </div>
                  <div className="text-[10px] text-emerald-800 font-mono mt-0.5">
                    <strong>Current Status:</strong> {rel.status}
                  </div>
                  <div className="mt-1 bg-amber-50 p-1.5 rounded border border-amber-200 text-[10px] text-amber-950 italic">
                    "{rel.favoriteQuestion}"
                  </div>
                  <div className="mt-1 text-[10px] text-blue-900">
                    💡 <strong>Tactical Advice:</strong> {rel.actionTip}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'LOGS' && (
          <div className="flex-1 win95-inset bg-black p-2 font-mono text-[10px] text-emerald-400 overflow-y-auto space-y-1">
            <div className="text-emerald-500 font-bold border-b border-emerald-900 pb-1">
              [SITOUT_SURVEILLANCE_KERNEL_LOGS]
            </div>
            <div>[04:02:11] RADAR_SYS: 360-degree sonar sensor activated on sitout veranda.</div>
            <div>[04:03:45] ACOUSTIC_FILTER: Bajaj Chetak 2-stroke exhaust resonance matched (14m).</div>
            <div>[04:04:12] TARGET_IDENTIFIED: Sukumaran Ammavan (Threat: GOSSIP_HAZARD).</div>
            <div>[04:04:30] WARNING: Amma detected guest footsteps on sitout red oxide tiles!</div>
            <div>[04:05:01] DEFENSE_QUEUE: Sulaimani chaya or Good Day biscuit offering recommended.</div>
            <div>[04:05:22] SECONDARY_SENSOR: TVS Scooty Pep frequency spotted near boundary wall (38m).</div>
            <div>[04:05:40] STATUS: Perimeter defense operational. All gates secured.</div>
          </div>
        )}
      </div>

      {/* Footer Status Bar */}
      <div className="px-2 py-1 border-t border-gray-400 bg-[#c0c0c0] flex items-center justify-between text-[10px] text-gray-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-600"></span>
          <span>Perimeter Status: <strong className="text-emerald-800">ONLINE</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playKeyClick();
              setIsScanning(prev => !prev);
            }}
            className="win95-btn px-2 py-0.5 text-[9px] font-bold cursor-pointer"
          >
            {isScanning ? 'Pause Sweep' : 'Resume Sweep'}
          </button>
          <button
            onClick={() => {
              sounds.playKeyClick();
              onClose();
            }}
            className="win95-btn px-3 py-0.5 text-[10px] font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
