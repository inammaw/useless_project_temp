import React, { useState } from 'react';
import { 
  ShieldCheck, Coffee, Newspaper, Wrench, X, Sparkles, 
  AlertCircle, Flame, MessageSquare, Lightbulb, CheckCircle2, ChevronRight, ThumbsUp 
} from 'lucide-react';
import { sounds } from '../utils/sound';

interface SolutionOption {
  id: string;
  command: string;
  title: string;
  subtitle: string;
  stressDelta: number;
  explanation: string;
}

interface RagebaitScenario {
  id: string;
  achanTitle: string;
  achanQuoteMalayalam: string;
  achanQuoteEnglish: string;
  rageIncrease: number;
  ammaResponseMalayalam: string;
  ammaResponseEnglish: string;
  solutions: SolutionOption[];
}

interface AchanDaemonModalProps {
  currentStress: number;
  onApplyRagebait?: (
    addedStress: number, 
    achanQuote: string, 
    ammaReply: string,
    command: string
  ) => void;
  onExecuteSolution?: (cmd: string) => void;
  onClose: () => void;
}

export const AchanDaemonModal: React.FC<AchanDaemonModalProps> = ({
  currentStress,
  onApplyRagebait,
  onExecuteSolution,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'RAGEBAIT' | 'MEDIATE'>('RAGEBAIT');
  const [activeScenarioIndex, setActiveScenarioIndex] = useState<number>(0);
  const [rageFired, setRageFired] = useState<boolean>(false);
  const [selectedSolution, setSelectedSolution] = useState<SolutionOption | null>(null);

  const scenarios: RagebaitScenario[] = [
    {
      id: 'salt_sambar',
      achanTitle: '1. "Sambar-il uppu kuravaanallo Shylaja..."',
      achanQuoteMalayalam: "Shylaja... sambar-il innu uppu kuravaanu. Annan-te veettile sambar aanu ithilum nallathu.",
      achanQuoteEnglish: "Shylaja... the sambar lacks salt today. Frankly, my elder brother's wife makes much better sambar than this.",
      rageIncrease: 28,
      ammaResponseMalayalam: "Ente sambar-il uppu kuravo?! 32 kollamayittu njan ivide cooking cheyyunnu! Annante veettile sambar athra ishtamanengil angottu thanne poykko! Innu muthal njan ivide onnum undaakkilla!",
      ammaResponseEnglish: "My sambar lacks salt?! I have been slaving in this kitchen for 32 years! If brother's wife cooks so well, go eat at their house! From today I am NOT touching the stove!",
      solutions: [
        {
          id: 'sol_praise',
          command: 'praise --sambar --best-in-kerala',
          title: 'Defend Amma’s Sambar Instantly',
          subtitle: '"Ammaye poloru kai-punyam naattil aarkkumilla!"',
          stressDelta: -30,
          explanation: 'Aggressively contradict Achan and declare Amma’s cooking undisputed world-class.'
        },
        {
          id: 'sol_uppu',
          command: 'uppu --fetch --salt-cruet',
          title: 'Discreetly Hand Achan the Ceramic Salt Jar (ഭരണി)',
          subtitle: '"Acha, table-il uppu undallo, vendathra ittolu"',
          stressDelta: -20,
          explanation: 'Neutralizes Achan’s critique before Amma goes on an indefinite cooking strike.'
        },
        {
          id: 'sol_tea',
          command: 'tea --brew --cardamom',
          title: 'Distract Amma with Fresh Cardamom Tea',
          subtitle: 'Shift maternal focus to tea & evening pazham pori',
          stressDelta: -22,
          explanation: 'A classic diversion technique to cool down kitchen thermodynamics.'
        }
      ]
    },
    {
      id: 'saree_fold',
      achanTitle: '2. "Terrace-le saree mazhayil nananju thonnunnu..."',
      achanQuoteMalayalam: "Mazha kaaru kando? Shylaja terrace-il ittirunna silk saree nananjennu thonnunnu. Eduthu vechaayirunno?",
      achanQuoteEnglish: "Did you see those dark clouds? Looks like that silk saree you left drying on the terrace got completely soaked. Did you remember to bring it in?",
      rageIncrease: 32,
      ammaResponseMalayalam: "Saree nananjo?! Nee oru manikyoor aayi sit-out-il Manorama vayichu irikkuvalle? Oru vaakku paranjaal ninte naakku azhinju pokumo?! Odi poyeda chekka terrace-ilot!",
      ammaResponseEnglish: "The saree got wet?! You've been sitting in the sit-out reading newspaper for an hour! Would your tongue fall off if you alerted me?! Run to the terrace right now, child!",
      solutions: [
        {
          id: 'sol_terrace',
          command: 'thuni --fetch --fast',
          title: 'Sprint to Terrace & Grab Saree Before 1st Drop',
          subtitle: 'Execute zero-latency laundry rescue sprint',
          stressDelta: -35,
          explanation: 'Physical chore execution completely disarms maternal fury.'
        },
        {
          id: 'sol_stand',
          command: 'clothstand --indoor --deploy',
          title: 'Deploy Indoor Folding Cloth Stand in Hall',
          subtitle: 'Move all semi-dry sarees under the ceiling fan',
          stressDelta: -24,
          explanation: 'Demonstrates rare household responsibility.'
        }
      ]
    },
    {
      id: 'phone_charging',
      achanTitle: '3. "Computer off aakkeda, current bill koodum!"',
      achanQuoteMalayalam: "Ee chekkan raavile muthal computer on aakki vechirikkunnu. KSEB bill 4000 roopa varum. Poyi padikkan para Shylaja.",
      achanQuoteEnglish: "This boy has been running the computer since dawn. The KSEB electricity bill will hit 4000 rupees. Tell him to go study, Shylaja.",
      rageIncrease: 25,
      ammaResponseMalayalam: "Njan ethra thavana paranjathaanu! Computer-um phone-um maathram! Ee kollathe PSC pariksha ezhuthikkal kazhinjaal njan ee wire motham cut cheyyum!",
      ammaResponseEnglish: "How many times have I repeated this! Only computers and mobile phones! Once this year's PSC exam is over, I will snip all these cables with scissors!",
      solutions: [
        {
          id: 'sol_psc',
          command: 'study --psc --silent',
          title: 'Snap Open PSC Rank File on Study Desk',
          subtitle: 'Pretend to deeply memorize Kerala River Geography',
          stressDelta: -30,
          explanation: 'Instant maternal reassurance: PSC preparation is in progress.'
        },
        {
          id: 'sol_kseb_pay',
          command: 'kseb --bill --online-pay',
          title: 'Show KSEB Online Electricity Receipt',
          subtitle: 'Demonstrate bill is actually within bimonthly limit',
          stressDelta: -20,
          explanation: 'Bypasses Achan’s financial scare with cold hard telemetry.'
        }
      ]
    }
  ];

  const currentScenario = scenarios[activeScenarioIndex];

  const triggerRagebait = () => {
    sounds.playErrorChord();
    setRageFired(true);
    setSelectedSolution(null);
    onApplyRagebait?.(
      currentScenario.rageIncrease,
      currentScenario.achanQuoteMalayalam,
      currentScenario.ammaResponseMalayalam,
      `achan --ragebait --scenario:${currentScenario.id}`
    );
  };

  const handleApplySolution = (sol: SolutionOption) => {
    sounds.playSuccessChime();
    setSelectedSolution(sol);
    onExecuteSolution?.(sol.command);
  };

  return (
    <div className="fixed inset-3 md:inset-auto md:top-12 md:left-28 md:w-[540px] md:h-[560px] z-40 win95-box flex flex-col font-mono text-xs select-none shadow-2xl bg-[#c0c0c0] overflow-hidden">
      {/* Title Bar */}
      <div className="win95-titlebar px-2 py-1 flex items-center justify-between text-xs font-bold select-none cursor-move flex-shrink-0">
        <div className="flex items-center gap-1.5 truncate">
          <Newspaper size={13} className="text-amber-200" />
          <span className="truncate">ACHAN.EXE - [PATERNAL RAGEBAIT & MEDIATION GATEWAY 2.0]</span>
        </div>
        <button
          onClick={() => {
            sounds.playKeyClick();
            onClose();
          }}
          title="Close"
          className="win95-btn w-4 h-4 p-0 flex items-center justify-center font-bold text-[10px] text-gray-900 cursor-pointer flex-shrink-0"
        >
          <X size={10} strokeWidth={3} />
        </button>
      </div>

      {/* Retro Navigation Tabs */}
      <div className="flex items-center gap-1 px-2 pt-1.5 border-b border-gray-400 bg-[#c0c0c0] text-[11px] flex-shrink-0">
        <button
          onClick={() => {
            sounds.playKeyClick();
            setActiveTab('RAGEBAIT');
          }}
          className={`px-3 py-1 font-bold border-t-2 border-l-2 border-r-2 cursor-pointer flex items-center gap-1 ${
            activeTab === 'RAGEBAIT'
              ? 'bg-[#c0c0c0] border-white border-b-0 -mb-[1px] z-10 text-black'
              : 'bg-gray-300 border-gray-400 text-gray-600'
          }`}
        >
          <Flame size={12} className="text-red-600" />
          <span>Ragebait Amma</span>
        </button>

        <button
          onClick={() => {
            sounds.playKeyClick();
            setActiveTab('MEDIATE');
          }}
          className={`px-3 py-1 font-bold border-t-2 border-l-2 border-r-2 cursor-pointer flex items-center gap-1 ${
            activeTab === 'MEDIATE'
              ? 'bg-[#c0c0c0] border-white border-b-0 -mb-[1px] z-10 text-black'
              : 'bg-gray-300 border-gray-400 text-gray-600'
          }`}
        >
          <Coffee size={12} className="text-amber-700" />
          <span>Classic Mediation</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-3 bg-[#c0c0c0] flex-1 flex flex-col gap-2.5 overflow-y-auto min-h-0">
        {activeTab === 'RAGEBAIT' ? (
          <>
            {/* Banner */}
            <div className="win95-box p-2 bg-amber-50 border border-amber-300 flex items-start gap-2.5">
              <div className="w-11 h-11 bg-amber-200 border-2 border-amber-700 rounded-xs flex flex-col items-center justify-center flex-shrink-0 text-center shadow-inner">
                <span className="text-xl">👴📰</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[11px] text-amber-950 uppercase flex items-center justify-between">
                  <span>Paternal Casual Remark Engine:</span>
                  <span className="text-[9px] bg-red-100 text-red-800 px-1 py-0.5 rounded font-mono font-bold">
                    HIGH VOLTAGE
                  </span>
                </div>
                <div className="text-[10px] text-amber-900 font-sans leading-tight mt-0.5">
                  Achan sits in the sit-out teak chair reading Malayala Manorama. One innocent remark from him instantly triggers a 5-alarm maternal firestorm!
                </div>
              </div>
            </div>

            {/* Scenario Selector */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                Select Achan's Next Unfiltered Remark:
              </div>
              <div className="grid grid-cols-3 gap-1">
                {scenarios.map((sc, idx) => (
                  <button
                    key={sc.id}
                    onClick={() => {
                      sounds.playKeyClick();
                      setActiveScenarioIndex(idx);
                      setRageFired(false);
                      setSelectedSolution(null);
                    }}
                    className={`p-1.5 text-[10px] font-bold truncate cursor-pointer text-left ${
                      idx === activeScenarioIndex
                        ? 'win95-inset bg-amber-100 text-amber-950 font-bold border border-amber-400'
                        : 'win95-btn bg-[#dfdfdf] text-gray-800'
                    }`}
                  >
                    {idx + 1}. {sc.id.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Scenario Preview Box */}
            <div className="win95-box p-2.5 bg-white border border-gray-400 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-900 flex items-center gap-1">
                  <MessageSquare size={13} className="text-amber-700" />
                  {currentScenario.achanTitle}
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-900 border border-red-300">
                  +{currentScenario.rageIncrease}% BP Hazard
                </span>
              </div>

              {/* Achan's dialogue */}
              <div className="win95-inset bg-[#fffcf5] p-2 border border-amber-200">
                <div className="text-xs font-bold text-gray-900 font-serif leading-snug">
                  "{currentScenario.achanQuoteMalayalam}"
                </div>
                <div className="text-[10px] text-gray-600 font-sans italic mt-1">
                  English: "{currentScenario.achanQuoteEnglish}"
                </div>
              </div>

              {/* Trigger Button */}
              {!rageFired ? (
                <button
                  onClick={triggerRagebait}
                  className="w-full win95-btn py-2 px-3 bg-red-50 hover:bg-red-100 text-red-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer border border-red-400 shadow-sm"
                >
                  <Flame size={14} className="text-red-600 animate-pulse" />
                  <span>Let Achan Say This to Amma! (Provoke Ragebait)</span>
                </button>
              ) : (
                <div className="win95-inset bg-red-50 p-2 border border-red-300 space-y-1.5 animate-fadeIn">
                  <div className="flex items-center justify-between font-bold text-[10px] text-red-900 uppercase">
                    <span className="flex items-center gap-1">
                      <Flame size={12} className="text-red-600" />
                      AMMA EXPLODES IN COUNTER-ATTACK!
                    </span>
                    <span className="text-red-700">BP: +{currentScenario.rageIncrease}%</span>
                  </div>
                  <div className="text-xs text-red-950 font-serif italic font-bold">
                    "{currentScenario.ammaResponseMalayalam}"
                  </div>
                  <div className="text-[10px] text-red-800 font-sans">
                    English: "{currentScenario.ammaResponseEnglish}"
                  </div>
                </div>
              )}
            </div>

            {/* Suggested Solutions to Placate Amma */}
            <div className="win95-box p-2.5 bg-[#f5f5f5] border border-gray-400 flex flex-col gap-1.5 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1">
                  <Lightbulb size={12} className="text-amber-600" />
                  SUGGEST A SOLUTION TO DEFUSE AMMA:
                </span>
                <span className="text-[9px] text-gray-500">Pick an action to resolve tension</span>
              </div>

              <div className="space-y-1.5">
                {currentScenario.solutions.map((sol) => {
                  const isDone = selectedSolution?.id === sol.id;
                  return (
                    <button
                      key={sol.id}
                      onClick={() => handleApplySolution(sol)}
                      className={`w-full p-2 text-left flex items-start gap-2 cursor-pointer transition-colors ${
                        isDone 
                          ? 'win95-inset bg-emerald-100 border border-emerald-500' 
                          : 'win95-btn bg-white hover:bg-emerald-50'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 size={16} className="text-emerald-700 flex-shrink-0 mt-0.5" />
                      ) : (
                        <ChevronRight size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-gray-900 truncate">
                            {sol.title}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                            {sol.stressDelta}% Stress
                          </span>
                        </div>
                        <div className="text-[10px] text-emerald-900 font-serif italic">
                          {sol.subtitle}
                        </div>
                        <div className="text-[9px] text-gray-500 font-sans mt-0.5">
                          {sol.explanation}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* Classic Mediation Tab */
          <div className="flex-1 flex flex-col justify-between gap-3">
            <div className="win95-box p-3 bg-white space-y-2 border border-gray-400">
              <div className="flex items-center gap-2 font-bold text-xs text-gray-900">
                <Coffee size={16} className="text-amber-700" />
                <span>Standard Paternal Shield Protocols</span>
              </div>
              <p className="text-[11px] text-gray-600 font-sans">
                If Amma's blood pressure is already in the red zone without ragebait, send Achan to directly intercede with a classic tea request or KSEB inspection.
              </p>

              <div className="space-y-1.5 pt-2">
                <button
                  onClick={() => handleApplySolution({
                    id: 'med_tea',
                    command: 'achan --mediate --tea-request',
                    title: 'Achan orders tea for you',
                    subtitle: '"Shylaja... avan oru chaya koodi ittekkedo"',
                    stressDelta: -35,
                    explanation: 'Achan requests tea on your behalf'
                  })}
                  className="w-full win95-btn p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 text-left cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs">1. "Acha, tell Amma to make me one more tea"</div>
                    <div className="text-[10px] text-emerald-800">Amma obeys husband without scolding (-35% Stress)</div>
                  </div>
                  <Coffee size={16} className="text-emerald-700" />
                </button>

                <button
                  onClick={() => handleApplySolution({
                    id: 'med_fuse',
                    command: 'kseb --fuse-check',
                    title: 'Achan checks sitout fuse box',
                    subtitle: 'Inspect 230V AC lines with tester screwdriver',
                    stressDelta: -20,
                    explanation: 'Paternal tech maintenance'
                  })}
                  className="w-full win95-btn p-2 bg-stone-50 hover:bg-stone-100 text-stone-950 text-left cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs">2. "Acha, check if KSEB phase line dropped"</div>
                    <div className="text-[10px] text-stone-700">Achan gets busy with the fuse tester (-20% Stress)</div>
                  </div>
                  <Wrench size={16} className="text-stone-700" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-400 bg-[#c0c0c0] flex items-center justify-between flex-shrink-0">
        <div className="text-[10px] text-gray-700">
          Amma BP: <strong className={currentStress > 70 ? 'text-red-700' : 'text-emerald-700'}>{currentStress}%</strong>
        </div>
        <button
          onClick={() => {
            sounds.playKeyClick();
            onClose();
          }}
          className="win95-btn px-4 py-1 text-xs font-bold cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};
