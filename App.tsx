import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TerminalConsole } from './components/TerminalConsole';
import { AmmaAvatar } from './components/AmmaAvatar';
import { StressGauge } from './components/StressGauge';
import { Taskbar } from './components/Taskbar';
import { StartMenu } from './components/StartMenu';
import { InterruptModal } from './components/InterruptModal';
import { TaskManager } from './components/TaskManager';
import { TupperwareRegistry } from './components/TupperwareRegistry';
import { GuestRadar } from './components/GuestRadar';
import { BsodScreen } from './components/BsodScreen';
import { HelpGuide } from './components/HelpGuide';
import { DisplayProperties } from './components/DisplayProperties';
import { SareeRescueGame } from './components/SareeRescueGame';
import { KudumbamMessenger } from './components/KudumbamMessenger';
import { AchanDaemonModal } from './components/AchanDaemonModal';
import { HouseholdClock, TIME_SLOTS } from './components/HouseholdClock';
import { PCStartup } from './components/PCStartup';
import { DesktopToast } from './components/DesktopToast';
import { sounds } from './utils/sound';
import { DAEMON_INTERRUPTS, determineAmmaState, generateLocalResponse } from './utils/localEngine';
import {
  calculateNextChaosInterval,
  pickNextChaosEventType,
  generateDynamicDaemonInterrupt,
  generateSpontaneousAmmaBark,
  generateAcousticToast,
  generateAchanSitoutEvent,
  AcousticToastData
} from './utils/chaosEngine';
import { getDesktopBackground, getDesktopStyle, DitherPatternType } from './utils/desktopTheme';
import { AmmaOperatingState, DaemonInterrupt, DaemonType, TerminalEntry, HouseholdTimeSlot } from './types';
import { Terminal, Activity, Package, Radio, CloudRain, Zap, Coffee, HelpCircle, BookOpen, Monitor, MessageSquare, ShieldCheck, Power } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // PC Startup State
  const [isBooting, setIsBooting] = useState<boolean>(true);
  const [autoTriggerEnabled, setAutoTriggerEnabled] = useState<boolean>(true);

  // Amma OS State
  const [stress, setStress] = useState<number>(45);
  const [state, setState] = useState<AmmaOperatingState>('SUSPICIOUS_SCAN');
  const [clockTime, setClockTime] = useState<string>('16:05');
  const [householdSlot, setHouseholdSlot] = useState<HouseholdTimeSlot>('NAALU_MANI');
  const [activeInterrupt, setActiveInterrupt] = useState<DaemonInterrupt | null>(null);
  const [activeToast, setActiveToast] = useState<AcousticToastData | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [crtFilter, setCrtFilter] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [startOpen, setStartOpen] = useState<boolean>(false);

  // Window Management
  const [windows, setWindows] = useState<{
    taskmgr: boolean;
    tupperware: boolean;
    radar: boolean;
    help: boolean;
    display: boolean;
    saree: boolean;
    kudumbam: boolean;
    achan: boolean;
  }>({
    taskmgr: false,
    tupperware: false,
    radar: false,
    help: false,
    display: false,
    saree: false,
    kudumbam: false,
    achan: false,
  });

  const [patternOverride, setPatternOverride] = useState<DitherPatternType | undefined>(undefined);
  const [focusedWindow, setFocusedWindow] = useState<string>('terminal');

  // Calculate dynamic desktop theme and dither pattern based on ammaState & stress level
  const desktopTheme = getDesktopBackground(state, stress, patternOverride);
  const desktopStyle = getDesktopStyle(state, stress, patternOverride);

  // Initial terminal entries from user's boot sequence & previous turns
  const [entries, setEntries] = useState<TerminalEntry[]>([
    {
      id: 'boot_0',
      timestamp: '15:58',
      clock: '15:58',
      stress: 32,
      state: 'CALM_CHAYA',
      ammaDialogue:
        'Aha, thurannuallo! Entha ippo oru prathyekatha? Ammavanu kooduthal data balance thanno atho ninte aa WhatsApp-il valla "Good Morning" message-um vanna? Njan ivide oru chaya kudippikkan vendi ee adukkalayil kidannu kashtappadunnu, appozha ivan vanna vazhi ee "Dabba" thurannu irikkunne. Phone-il thanne nokki irunno, kanneriyumbol parayaruthu njan paranjilla ennu!',
      systemLogs: [
        'THARAVADU_OS v1.0 [BOOT SEQUENCE COMPLETE]',
        'KERNEL: AMMA_KERNEL.SYS (PID 0) INITIALIZED',
        'MEM_CHECK: 0% Brain Power (According to Amma)',
        'I/O_CHECK: Cheviyil earphone vechathond onnum kelkkilla.',
        'DAEMON: CHAYA_PIPELINE initiated.',
        'SENSOR: Smell of Parippuvada detected in background.'
      ],
      suggestedCommands: ['tea --brew', 'thuni --fetch', 'whatsapp --status --mute']
    },
    {
      id: 'turn_1',
      timestamp: '16:05',
      clock: '16:05',
      command: 'build it',
      stress: 45,
      state: 'SUSPICIOUS_SCAN',
      ammaDialogue:
        'Build it-o? Enthu build cheyyanenna ee parayunne? Naattukaarku motham joli undu, ivan ivide irunnu "build" cheyyunnu! Engineering padichittu ippo ninte ee room-inte ullil enthu "building" aanu nadakkunne? Atho aa "Coding" ennu parayunna valla thallu aano? Oru karyam paranjekkatti, aa puthiya Milton bottle evide poyi ennu ippo parayanam! Athu kandu pidichittu mathi ninte ee "Empire Building". Adhu ninte koottukaaran Shaji kondu poyo? Phone-il nokki irunnal bottle thirichu varillallo!',
      systemLogs: [
        'PROCESS: BUILD_COMMAND received.',
        'ERROR: MISSING_DEPENDENCY (Yellow_Tupperware_Bottle_02).',
        'SCANNING: Analyzing User\'s facial expression for lies.'
      ],
      suggestedCommands: [
        'find --bottle --location:SHAJI_HOUSE',
        'clean --room --fast',
        'excuse --invent --target:AMMA'
      ]
    }
  ]);

  // Clock progression
  useEffect(() => {
    const timer = setInterval(() => {
      setClockTime(prev => {
        const [hoursStr, minutesStr] = prev.split(':');
        let hours = parseInt(hoursStr, 10);
        let minutes = parseInt(minutesStr, 10) + 1;
        if (minutes >= 60) {
          minutes = 0;
          hours = (hours + 1) % 24;
        }
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      });
    }, 45000);

    return () => clearInterval(timer);
  }, []);

  // Organic Background Household Chaos Engine (Dynamic, Unpredictable & Non-Scripted)
  useEffect(() => {
    if (!autoTriggerEnabled || isBooting) return;

    // Dynamically calculate the next delay using Poisson-style stochastic intervals
    // (Interval scales with current Amma stress and includes micro-burst chances)
    const nextInterval = calculateNextChaosInterval(stress);

    const daemonTimer = setTimeout(() => {
      if (stress >= 98) return;

      const eventType = pickNextChaosEventType(Boolean(activeInterrupt));

      if (eventType === 'INTERRUPT_MODAL' && !activeInterrupt) {
        // 1. Procedural interactive Daemon Interrupt Modal (unique scenarios every time)
        triggerDaemonInterrupt();
      } else if (eventType === 'SPONTANEOUS_AMMA_BARK') {
        // 2. Spontaneous maternal observation directly in the terminal
        const bark = generateSpontaneousAmmaBark(stress);
        if (bark.soundType === 'tongue') sounds.playTongueClick();
        else if (bark.soundType === 'inverter') sounds.playInverterBeep();
        else sounds.playErrorChord();

        const updatedStress = Math.min(100, Math.max(10, stress + bark.stressDelta));
        setStress(updatedStress);
        setState(determineAmmaState(updatedStress));

        const entry: TerminalEntry = {
          id: `spontaneous_${Date.now()}`,
          timestamp: clockTime,
          clock: clockTime,
          stress: updatedStress,
          stressDelta: bark.stressDelta,
          state: determineAmmaState(updatedStress),
          ammaDialogue: bark.dialogue,
          englishTranslation: bark.englishTranslation,
          systemLogs: [
            '[SPONTANEOUS_MATERNAL_EVENT] Amma vocalized unprompted directive.',
            ...bark.systemLogs
          ],
          suggestedCommands: bark.suggestedCommands
        };
        setEntries(prev => [...prev, entry]);
      } else if (eventType === 'ACOUSTIC_TOAST') {
        // 3. Desktop acoustic alert with toast notification and sound
        const toast = generateAcousticToast();
        if (toast.soundType === 'cooker') sounds.playPressureCooker();
        else if (toast.soundType === 'gate') sounds.playGateCreak();
        else if (toast.soundType === 'thunder') sounds.playThunder();
        else if (toast.soundType === 'inverter') sounds.playInverterBeep();
        else sounds.playTongueClick();

        setActiveToast(toast);
        const updatedStress = Math.min(100, stress + toast.stressDelta);
        setStress(updatedStress);
        setState(determineAmmaState(updatedStress));

        const entry: TerminalEntry = {
          id: `toast_event_${Date.now()}`,
          timestamp: clockTime,
          clock: clockTime,
          stress: updatedStress,
          stressDelta: toast.stressDelta,
          state: determineAmmaState(updatedStress),
          ammaDialogue: `Ketto aa shabdham?! (${toast.title}) Ivide oru nimisham samadhanam tharilla aarum!`,
          englishTranslation: `Did you hear that sound?! (${toast.title}) Nobody allows a single minute of peace in this house!`,
          systemLogs: [
            toast.systemLog,
            `ACOUSTIC_TRIANGULATION: ${toast.subtitle}`
          ],
          suggestedCommands: ['clean --room --fast', 'tea --brew', 'phone --hide']
        };
        setEntries(prev => [...prev, entry]);
      } else if (eventType === 'ACHAN_SITOUT_COMMENT') {
        // 4. Paternal Sitout critique from Achan
        const achan = generateAchanSitoutEvent();
        sounds.playErrorChord();

        const updatedStress = Math.min(100, stress + achan.stressDelta);
        setStress(updatedStress);
        setState(determineAmmaState(updatedStress));

        const entry: TerminalEntry = {
          id: `achan_sitout_${Date.now()}`,
          timestamp: clockTime,
          clock: clockTime,
          stress: updatedStress,
          stressDelta: achan.stressDelta,
          state: determineAmmaState(updatedStress),
          ammaDialogue: achan.ammaResponse,
          englishTranslation: achan.ammaEnglish,
          systemLogs: [
            `[SITOUT_MICROPHONE] ${achan.achanQuote}`,
            ...achan.systemLogs
          ],
          suggestedCommands: achan.suggestedCommands
        };
        setEntries(prev => [...prev, entry]);
      }
    }, nextInterval);

    return () => clearTimeout(daemonTimer);
  }, [autoTriggerEnabled, isBooting, activeInterrupt, stress, clockTime]);

  // Sync sounds manager
  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    sounds.setSoundEnabled(nextState);
  };

  // Execute command via Server API (with Gemini AI) or fallback
  const handleExecuteCommand = async (cmd: string) => {
    setIsProcessing(true);
    sounds.playKeyClick();

    // Check for explicit BSOD / crash commands
    const normalized = cmd.trim().toLowerCase();
    if (normalized === 'bsod' || normalized === 'crash' || normalized === 'panic --100%') {
      setStress(100);
      setState('MARTYR_MODE');
      setIsProcessing(false);
      return;
    }

    // Close any active interrupt modal
    const currentInterrupt = activeInterrupt;
    if (activeInterrupt) {
      setActiveInterrupt(null);
    }

    // Handle manual "trigger" commands from terminal
    if (normalized.startsWith('trigger') || normalized.startsWith('trig')) {
      // 1. Help or List
      if (normalized === 'trigger' || normalized === 'trigger --help' || normalized === 'trigger help' || normalized === 'trigger list' || normalized === 'trig') {
        const entry: TerminalEntry = {
          id: `trigger_help_${Date.now()}`,
          timestamp: clockTime,
          clock: clockTime,
          command: cmd,
          stress,
          stressDelta: 0,
          state,
          ammaDialogue: "Trigger-o? Enthu trigger cheyyaneda ee nokkunne? Veettil oru aapathu varaan nee terminal-il ninnu trigger cheyyanamo? Ninte achan ariyathe ivide oru puzhukkum nadakkilla!",
          englishTranslation: "Triggering what? Do we need you to manually trigger household catastrophes from a terminal? Nothing moves in this house without your father finding out!",
          systemLogs: [
            "=== THARAVADU_OS DAEMON TRIGGER MANUAL ===",
            "  trigger mazha           -> Summon MAZHA.EXE (Rain & terrace laundry emergency, +25% stress)",
            "  trigger kseb            -> Summon KSEB_TRIP (Power cut & screaming inverter, +20% stress)",
            "  trigger guest           -> Summon GUEST_RADAR (Sukumaran Ammavan on Bajaj Chetak, +30% stress)",
            "  trigger tupperware      -> Summon TUPPERWARE_INTEGRITY (Missing 2004 Dubai bottle, +35% stress)",
            "  trigger chaya           -> Summon CHAYA_PIPELINE (4:00 PM Tea & snacks deadline, +10% stress)",
            "  trigger random          -> Summon a random household crisis daemon",
            "  trigger stress <val>    -> Calibrate Amma stress (e.g. 'trigger stress 85', 'trigger stress +25')",
            "  trigger bsod            -> Trigger instant 100% Martyr Mode crash screen",
            "  trigger calm            -> Reset stress to 20% with fresh cardamom tea",
            "  trigger achan           -> Summon Achan Paternal Diplomatic Firewall",
            "  trigger saree           -> Launch Saree Rescue rooftop minigame",
            "  trigger kudumbam        -> Open Kudumbam WhatsApp Messenger",
            "  trigger cooker          -> Kitchen acoustic: 3 whistles from Prestige pressure cooker",
            "  trigger mixie           -> Kitchen acoustic: Preethi 750W mixie high-speed grind",
            "  trigger gate            -> Peripheral acoustic: Squeaky iron front gate alert"
          ],
          suggestedCommands: ['trigger mazha', 'trigger kseb', 'trigger stress +30']
        };
        setEntries(prev => [...prev, entry]);
        setIsProcessing(false);
        return;
      }

      // 2. Daemon Interrupts
      if (normalized.includes('mazha') || normalized.includes('rain')) {
        triggerDaemonInterrupt('MAZHA.EXE');
        sounds.playThunder();
        const entry: TerminalEntry = {
          id: `trigger_mazha_${Date.now()}`,
          timestamp: clockTime,
          clock: clockTime,
          command: cmd,
          stress: Math.min(100, stress + 25),
          stressDelta: 25,
          state: determineAmmaState(Math.min(100, stress + 25)),
          ammaDialogue: "Mazha kaaruthu! Kooriruttu on eastern sky! Kalyana pattu-saree terrace-il aanu! Odi poyi thuni edukkeda!",
          englishTranslation: "Dark clouds overhead! Pitch blackness in the eastern sky! My wedding silk saree is drying on the terrace! Run up and bring the laundry in!",
          systemLogs: [
            "[TRIGGER_CLI] Intercepted manual daemon invocation: MAZHA.EXE",
            "RADAR: Monsoon rain clouds detected over Tharavadu roof.",
            "URGENCY: CRITICAL (25 second countdown active).",
            "RECOMMENDED_ACTION: thuni --fetch"
          ],
          suggestedCommands: ['thuni --fetch', 'rain --ignore', 'saree']
        };
        setEntries(prev => [...prev, entry]);
        setIsProcessing(false);
        return;
      }

      if (normalized.includes('kseb') || normalized.includes('power') || normalized.includes('fuse')) {
        triggerDaemonInterrupt('KSEB_TRIP');
        sounds.playInverterBeep();
        const entry: TerminalEntry = {
          id: `trigger_kseb_${Date.now()}`,
          timestamp: clockTime,
          clock: clockTime,
          command: cmd,
          stress: Math.min(100, stress + 20),
          stressDelta: 20,
          state: determineAmmaState(Math.min(100, stress + 20)),
          ammaDialogue: "Current poyi! Inverter scream cheyyunnu! Ninte aa chintha-shakthi illatha phone charger aanu kaaranam! Feeder trip aayi!",
          englishTranslation: "Power went out! Inverter is screaming! It's because you plugged in your mindless phone charger! The entire feeder tripped!",
          systemLogs: [
            "[TRIGGER_CLI] Intercepted manual daemon invocation: KSEB_TRIP",
            "HARDWARE_ALERT: 0V line drop on main board.",
            "INVERTER_LOAD: Screaming at 85dB.",
            "RECOMMENDED_ACTION: kseb --fuse-check"
          ],
          suggestedCommands: ['kseb --fuse-check', 'phone --unplug', 'study --psc']
        };
        setEntries(prev => [...prev, entry]);
        setIsProcessing(false);
        return;
      }

      if (normalized.includes('guest') || normalized.includes('radar') || normalized.includes('sukumaran')) {
        triggerDaemonInterrupt('GUEST_RADAR');
        sounds.playGateCreak();
        const entry: TerminalEntry = {
          id: `trigger_guest_${Date.now()}`,
          timestamp: clockTime,
          clock: clockTime,
          command: cmd,
          stress: Math.min(100, stress + 30),
          stressDelta: 30,
          state: determineAmmaState(Math.min(100, stress + 30)),
          ammaDialogue: "Ayyoo Sukumaran Ammavan vannallo! Chekkan ivide lungi uduthu phone-il nokki irikkunnu! Odi poyi nalla shirt ittu sit-out-il nillada!",
          englishTranslation: "Oh no Sukumaran Uncle has arrived! You're sitting around in a lungi staring at your screen! Run and put on a nice shirt and greet him at the veranda!",
          systemLogs: [
            "[TRIGGER_CLI] Intercepted manual daemon invocation: GUEST_RADAR",
            "PERIPHERAL_ALERT: Bajaj Chetak 150cc scooter acoustic signature confirmed.",
            "INTRUDER: Sukumaran Ammavan (Inquisitive relative).",
            "RECOMMENDED_ACTION: sitout --greet --tea"
          ],
          suggestedCommands: ['sitout --greet --tea', 'biscuit --goodday', 'bedroom --lock --hide']
        };
        setEntries(prev => [...prev, entry]);
        setIsProcessing(false);
        return;
      }

      if (normalized.includes('tupperware') || normalized.includes('milton') || normalized.includes('bottle')) {
        triggerDaemonInterrupt('TUPPERWARE_INTEGRITY');
        sounds.playErrorChord();
        const entry: TerminalEntry = {
          id: `trigger_tupp_${Date.now()}`,
          timestamp: clockTime,
          clock: clockTime,
          command: cmd,
          stress: Math.min(100, stress + 35),
          stressDelta: 35,
          state: determineAmmaState(Math.min(100, stress + 35)),
          ammaDialogue: "Ente manja Tupperware bottle evide?! Ninte achan 15 kollam munpe Gulf-il ninnu vangi thannathaanu! Athu Shaji-kk kondu kodutho?!",
          englishTranslation: "Where is my yellow Tupperware bottle?! Your father brought it from the Gulf 15 years ago! Did you lend it away to Shaji?!",
          systemLogs: [
            "[TRIGGER_CLI] Intercepted manual daemon invocation: TUPPERWARE_INTEGRITY",
            "FILESYSTEM_CRITICAL: Gulf-imported 2004 Milton airtight container missing.",
            "INTEGRITY_PENALTY: +35% maternal panic.",
            "RECOMMENDED_ACTION: find --bottle"
          ],
          suggestedCommands: ['find --bottle', 'apologize --promise:study', 'tea --brew']
        };
        setEntries(prev => [...prev, entry]);
        setIsProcessing(false);
        return;
      }

      if (normalized.includes('chaya') || normalized.includes('tea')) {
        triggerDaemonInterrupt('CHAYA_PIPELINE');
        sounds.playPressureCooker();
        const entry: TerminalEntry = {
          id: `trigger_chaya_${Date.now()}`,
          timestamp: clockTime,
          clock: clockTime,
          command: cmd,
          stress: Math.min(100, stress + 10),
          stressDelta: 10,
          state: determineAmmaState(Math.min(100, stress + 10)),
          ammaDialogue: "Chaya aayeda! Naalu mani aayille? Iniyum aa dabba computer-il thanne kuthi irikkumo? Choodode kudippikkan ivide servant aarum illa!",
          englishTranslation: "Tea is ready! Isn't it already 4:00 PM? Are you still glued to that metal-box computer? No servants here to serve tea when it gets cold!",
          systemLogs: [
            "[TRIGGER_CLI] Intercepted manual daemon invocation: CHAYA_PIPELINE",
            "CRON_TRIGGER: 4:00 PM evening refreshment schedule.",
            "KITCHEN: Fresh cardamom tea & hot banana fritters.",
            "RECOMMENDED_ACTION: chaya --accept"
          ],
          suggestedCommands: ['chaya --accept', 'snack --parippuvada', 'glass --wash']
        };
        setEntries(prev => [...prev, entry]);
        setIsProcessing(false);
        return;
      }

      if (normalized.includes('random') || normalized.includes('chaos')) {
        triggerRandomDaemon();
        const entry: TerminalEntry = {
          id: `trigger_random_${Date.now()}`,
          timestamp: clockTime,
          clock: clockTime,
          command: cmd,
          stress,
          stressDelta: 20,
          state,
          ammaDialogue: "Veettil ulla prashnam poranjittu random aayi vere prashnam koodi undaakkaan nokkunno? Eeshwara, ivane kondu thottu!",
          englishTranslation: "As if existing problems weren't enough, you're rolling a dice to spawn random chaos? Good god, I've had it with this child!",
          systemLogs: [
            "[TRIGGER_CLI] Rolling pseudorandom Tharavadu household chaos daemon...",
            "DISPATCH: Household interrupt fired with full audio/visual telemetry."
          ],
          suggestedCommands: ['tea --brew', 'thuni --fetch', 'kseb --fuse-check']
        };
        setEntries(prev => [...prev, entry]);
        setIsProcessing(false);
        return;
      }

      // 3. Stress Gauge manual calibration
      if (normalized.includes('stress')) {
        const match = normalized.match(/trigger\s+(--)?stress[:\s]*([+-]?\d+)/i);
        let targetStress = stress;
        if (match) {
          const valStr = match[2];
          if (valStr.startsWith('+') || valStr.startsWith('-')) {
            targetStress = Math.min(100, Math.max(0, stress + parseInt(valStr, 10)));
          } else {
            targetStress = Math.min(100, Math.max(0, parseInt(valStr, 10)));
          }
        } else {
          targetStress = Math.min(100, stress + 25);
        }
        const delta = targetStress - stress;
        setStress(targetStress);
        const updatedState = targetStress >= 98 ? 'MARTYR_MODE' : determineAmmaState(targetStress);
        setState(updatedState);

        if (targetStress >= 98) {
          sounds.playErrorChord();
        } else if (delta < 0) {
          sounds.playStartup();
        } else {
          sounds.playTongueClick();
        }

        const isFatal = targetStress >= 98;
        const entry: TerminalEntry = {
          id: `trigger_stress_${Date.now()}`,
          timestamp: clockTime,
          clock: clockTime,
          command: cmd,
          stress: targetStress,
          stressDelta: delta,
          state: updatedState,
          ammaDialogue: isFatal
            ? "Ente BP 100% aayi! Ningal aarum oru sahayam cheyyanda! Njan thulanj potte! Achan varumbol ellaam parayam!"
            : delta > 0
              ? `Stress koottaan ninakku nalla midukkaanu! Ippo ${targetStress}% aayi! Ee veettil aarkengilum oru manashanthi tharumo?`
              : `Aashwasam! Stress ${targetStress}%-il ethichu. Kanneer kandu Daivam nallath varuthatte. Chaya kudi!`,
          englishTranslation: isFatal
            ? "My blood pressure reached 100%! Nobody touch anything, suffering alone is my fate! Your father will hear about every single thing!"
            : delta > 0
              ? `You're exceptionally skilled at hiking my stress! It's now at ${targetStress}%! Can anyone in this house grant me a moment of peace?`
              : `Relief! Stress brought down to ${targetStress}%. May God bless your sudden burst of good sense. Drink some tea!`,
          systemLogs: [
            `[TRIGGER_CLI] Manual Stress Override: ${stress}% -> ${targetStress}% (Delta: ${delta > 0 ? '+' : ''}${delta}%).`,
            `ANALOG_GAUGE: Needle spring calibrated to ${targetStress}%.`,
            `KERNEL_STATE: ${updatedState}`
          ],
          isGuiltTrip: isFatal,
          guiltTripText: isFatal ? "Ningal aarum onnum cheyyanda! Njan thanne ee veettil ellam thalayil chumannolu!" : undefined,
          suggestedCommands: isFatal ? ['reboot --tea-bribe --calm', 'apologize --promise:study'] : ['tea --brew', 'thuni --fetch', 'study --psc']
        };
        setEntries(prev => [...prev, entry]);
        setIsProcessing(false);
        return;
      }

      // 4. Instant BSOD Panic
      if (normalized.includes('bsod') || normalized.includes('panic') || normalized.includes('crash')) {
        setStress(100);
        setState('MARTYR_MODE');
        sounds.playErrorChord();
        const entry: TerminalEntry = {
          id: `trigger_bsod_${Date.now()}`,
          timestamp: clockTime,
          clock: clockTime,
          command: cmd,
          stress: 100,
          stressDelta: 100 - stress,
          state: 'MARTYR_MODE',
          ammaDialogue: "FATAL SYSTEM FAILURE! Ente BP 100% kadannu! Ningal aarum oru sahayam cheyyanda! Njan thanne ee adukkalayil veenu maricholu!",
          englishTranslation: "FATAL SYSTEM FAILURE! My blood pressure surpassed 100%! Don't anyone dare help me! I shall perish alone on the kitchen floor!",
          systemLogs: [
            "[TRIGGER_CLI] MANUAL BSOD PANIC INDUCED VIA TERMINAL.",
            "FATAL: AMMA STRESS HIT 100% (MARTYR_MODE ENGAGED).",
            "BLUE_SCREEN_OF_DEATH: Kernel panic locked out."
          ],
          isGuiltTrip: true,
          guiltTripText: "Ningal aarum oru chaya polum tharanda! Njan thanne kashtappedam!",
          suggestedCommands: ['reboot --tea-bribe --calm', 'apologize --promise:study']
        };
        setEntries(prev => [...prev, entry]);
        setIsProcessing(false);
        return;
      }

      // 5. Calm reset
      if (normalized.includes('calm') || normalized.includes('chill')) {
        setStress(20);
        setState('CALM_CHAYA');
        sounds.playStartup();
        confetti({ particleCount: 30, spread: 60 });
        const entry: TerminalEntry = {
          id: `trigger_calm_${Date.now()}`,
          timestamp: clockTime,
          clock: clockTime,
          command: cmd,
          stress: 20,
          stressDelta: 20 - stress,
          state: 'CALM_CHAYA',
          ammaDialogue: "Aaha! Ente manass onnu kulirthu! Shanthamayi oru chaya kudi, pinne nalla kuttiyayi poyi pusthakam vaayikku!",
          englishTranslation: "Aah! My heart is at peace at last! Drink your warm tea peacefully, then be a good child and read your textbooks!",
          systemLogs: [
            "[TRIGGER_CLI] Manual Calm Override executed.",
            "STRESS_METER: Reset to 20% (CALM_CHAYA).",
            "ATMOSPHERE: Devotional Yesudas music humming in background."
          ],
          suggestedCommands: ['tea --brew', 'snack --parippuvada', 'study --psc']
        };
        setEntries(prev => [...prev, entry]);
        setIsProcessing(false);
        return;
      }

      // 6. Subsystem / Window Triggers
      if (normalized.includes('achan') || normalized.includes('father')) {
        setWindows(prev => ({ ...prev, achan: true }));
        setFocusedWindow('achan');
        sounds.playStartup();
        const entry: TerminalEntry = {
          id: `trigger_achan_${Date.now()}`,
          timestamp: clockTime,
          clock: clockTime,
          command: cmd,
          stress: Math.max(15, stress - 20),
          stressDelta: -20,
          state: determineAmmaState(Math.max(15, stress - 20)),
          ammaDialogue: "Achanod parayippicho? Achan Malayala Manorama vaayikkukayaanu! Athu kondu njan ippozhathekku onnum parayunnilla!",
          englishTranslation: "You got your father involved? He is reading the Malayala Manorama editorial! Only because of that am I letting this slide for now!",
          systemLogs: [
            "[TRIGGER_CLI] ACHAN.SYS Paternal Firewall summoned.",
            "WINDOW_DISPATCH: Achan modal opened in foreground.",
            "DIPLOMACY: Paternal intervention applied (-20% stress)."
          ],
          suggestedCommands: ['tea --brew', 'study --psc', 'clean --room --fast']
        };
        setEntries(prev => [...prev, entry]);
        setStress(Math.max(15, stress - 20));
        setIsProcessing(false);
        return;
      }

      if (normalized.includes('saree')) {
        setWindows(prev => ({ ...prev, saree: true }));
        setFocusedWindow('saree');
        sounds.playThunder();
        const entry: TerminalEntry = {
          id: `trigger_saree_${Date.now()}`,
          timestamp: clockTime,
          clock: clockTime,
          command: cmd,
          stress,
          stressDelta: 0,
          state,
          ammaDialogue: "Terrace-le mazha run thuranno? Kasavu saree nanayathe nokkikko! Oru drop mazhavellam veenal njan pinne parayam!",
          englishTranslation: "Opened the terrace rain run? Make sure not a single drop hits the gold kasavu saree or you'll hear it from me!",
          systemLogs: [
            "[TRIGGER_CLI] SAREE_RUN.EXE minigame window launched.",
            "VIEWPORT: Rooftop terrace laundry line active."
          ],
          suggestedCommands: ['thuni --fetch', 'tea --brew']
        };
        setEntries(prev => [...prev, entry]);
        setIsProcessing(false);
        return;
      }

      if (normalized.includes('kudumbam') || normalized.includes('whatsapp')) {
        setWindows(prev => ({ ...prev, kudumbam: true }));
        setFocusedWindow('kudumbam');
        sounds.playTongueClick();
        const entry: TerminalEntry = {
          id: `trigger_kudumbam_${Date.now()}`,
          timestamp: clockTime,
          clock: clockTime,
          command: cmd,
          stress,
          stressDelta: 0,
          state,
          ammaDialogue: "Kudumbam WhatsApp group thuranno? Sukumaran Ammavante Good Morning message-inu namaskaram kodutho?",
          englishTranslation: "Opened the Kudumbam WhatsApp group? Did you reply with respectful folded hands to Sukumaran Uncle's Good Morning message?",
          systemLogs: [
            "[TRIGGER_CLI] KUDUMBAM_95 Family Messenger launched.",
            "STATUS: 4 pending unread family forwards."
          ],
          suggestedCommands: ['study --psc', 'tea --brew', 'phone --hide']
        };
        setEntries(prev => [...prev, entry]);
        setIsProcessing(false);
        return;
      }

      if (normalized.includes('cooker') || normalized.includes('whistle')) {
        triggerDaemonInterrupt('COOKER_WHISTLE');
        sounds.playPressureCooker();
        const entry: TerminalEntry = {
          id: `trigger_cooker_${Date.now()}`,
          timestamp: clockTime,
          clock: clockTime,
          command: cmd,
          stress: Math.min(100, stress + 20),
          stressDelta: 20,
          state: determineAmmaState(Math.min(100, stress + 20)),
          ammaDialogue: "Prestige cooker 3 whistle adichu kando! Gas knob sim cheyyedo! Paranjaal kelkkilla!",
          englishTranslation: "The Prestige pressure cooker whistled 3 times! Turn the gas knob down to sim! You never listen when told!",
          systemLogs: [
            "[TRIGGER_CLI] Intercepted manual daemon invocation: COOKER_WHISTLE",
            "Prestige 5L Pressure Cooker whistle acoustics triggered.",
            "GAS_STATUS: Simmer required immediately."
          ],
          suggestedCommands: ['gas --sim --knob:low', 'tea --brew', 'clean --room --fast']
        };
        setEntries(prev => [...prev, entry]);
        setIsProcessing(false);
        return;
      }

      if (normalized.includes('mixie')) {
        triggerDaemonInterrupt('MIXIE_GRIND');
        sounds.playMixieGrind();
        const entry: TerminalEntry = {
          id: `trigger_mixie_${Date.now()}`,
          timestamp: clockTime,
          clock: clockTime,
          command: cmd,
          stress: Math.min(100, stress + 15),
          stressDelta: 15,
          state: determineAmmaState(Math.min(100, stress + 15)),
          ammaDialogue: "Preethi mixie-yil thenga arachukko! Current poyaal ammiyil araykendi varum!",
          englishTranslation: "Grind the coconut in the Preethi mixie right now! If power goes out, you'll be grinding on stone!",
          systemLogs: [
            "[TRIGGER_CLI] Intercepted manual daemon invocation: MIXIE_GRIND",
            "Preethi 750W Mixie acoustic blast triggered.",
            "RPM: 18,000 | Thenga chammanthi in progress."
          ],
          suggestedCommands: ['mixie --grind --fast', 'tea --brew', 'kseb --fuse-check']
        };
        setEntries(prev => [...prev, entry]);
        setIsProcessing(false);
        return;
      }

      if (normalized.includes('gate')) {
        triggerDaemonInterrupt('GATE_CREAK');
        sounds.playGateCreak();
        const entry: TerminalEntry = {
          id: `trigger_gate_${Date.now()}`,
          timestamp: clockTime,
          clock: clockTime,
          command: cmd,
          stress: Math.min(100, stress + 22),
          stressDelta: 22,
          state: determineAmmaState(Math.min(100, stress + 22)),
          ammaDialogue: "Iron gate squeak cheythu! Aaraannu nokkeda! Sukumaran Ammavan aano?",
          englishTranslation: "The iron gate squeaked! Look outside and see who it is! Is that Sukumaran Uncle?",
          systemLogs: [
            "[TRIGGER_CLI] Intercepted manual daemon invocation: GATE_CREAK",
            "Squeaky iron front gate acoustic triggered.",
            "ACOUSTIC_RADAR: Approach detected."
          ],
          suggestedCommands: ['sitout --greet --tea', 'phone --hide', 'tea --brew']
        };
        setEntries(prev => [...prev, entry]);
        setIsProcessing(false);
        return;
      }

      // Default fallback for unrecognized trigger
      const entry: TerminalEntry = {
        id: `trigger_unknown_${Date.now()}`,
        timestamp: clockTime,
        clock: clockTime,
        command: cmd,
        stress,
        stressDelta: 0,
        state,
        ammaDialogue: "Enthu trigger aaneda nee type cheytha? Onnum manassilayilla! 'trigger list' ennu type cheythu nokk!",
        englishTranslation: "What kind of trigger did you just type? Made no sense! Type 'trigger list' to see what actually exists!",
        systemLogs: [
          `[TRIGGER_CLI] Unrecognized trigger parameter: '${cmd}'.`,
          "HINT: Type 'trigger list' or 'trigger --help' for full catalog."
        ],
        suggestedCommands: ['trigger list', 'trigger mazha', 'trigger kseb']
      };
      setEntries(prev => [...prev, entry]);
      setIsProcessing(false);
      return;
    }

    if (cmd.toLowerCase().trim() === 'help' || cmd.toLowerCase().trim() === 'man') {
      setWindows(prev => ({ ...prev, help: true }));
      setFocusedWindow('help');
    } else if (normalized.includes('saree') || normalized.includes('mazha_run')) {
      setWindows(prev => ({ ...prev, saree: true }));
      setFocusedWindow('saree');
    } else if (normalized.includes('kudumbam') || normalized.includes('whatsapp') || normalized.includes('forward')) {
      setWindows(prev => ({ ...prev, kudumbam: true }));
      setFocusedWindow('kudumbam');
    } else if (normalized.includes('achan') || normalized.includes('father')) {
      setWindows(prev => ({ ...prev, achan: true }));
      setFocusedWindow('achan');
    } else if (normalized.includes('display') || normalized.includes('desk.cpl')) {
      setWindows(prev => ({ ...prev, display: true }));
      setFocusedWindow('display');
    } else if (normalized.includes('taskmgr') || normalized.includes('ps ')) {
      setWindows(prev => ({ ...prev, taskmgr: true }));
      setFocusedWindow('taskmgr');
    } else if (normalized.includes('tupperware') || normalized.includes('milton')) {
      setWindows(prev => ({ ...prev, tupperware: true }));
      setFocusedWindow('tupperware');
    } else if (normalized.includes('radar') || normalized.includes('guest')) {
      setWindows(prev => ({ ...prev, radar: true }));
      setFocusedWindow('radar');
    }

    if (normalized.includes('mixie') || normalized.includes('grind')) {
      sounds.playMixieGrind();
    } else if (normalized.includes('cooker') || normalized.includes('whistle')) {
      sounds.playPressureCooker();
    } else if (normalized.includes('gate') || normalized.includes('squeak')) {
      sounds.playGateCreak();
    } else if (normalized.includes('tsk') || normalized.includes('tongue')) {
      sounds.playTongueClick();
    }

    try {
      const res = await fetch('/api/kernel-exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: cmd,
          currentStress: stress,
          currentState: state,
          clock: clockTime,
          activeInterrupt: currentInterrupt
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const updatedStress = data.stress ?? stress;
      const updatedState = data.state ?? determineAmmaState(updatedStress);
      const delta = updatedStress - stress;

      setStress(updatedStress);
      setState(updatedState);

      // Sound and visual cues
      if (updatedStress >= 98) {
        sounds.playErrorChord();
      } else if (cmd.toLowerCase().includes('tea') || cmd.toLowerCase().includes('chaya')) {
        sounds.playPressureCooker();
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
      } else if (cmd.toLowerCase().includes('thuni')) {
        sounds.playStartup();
      }

      const newEntry: TerminalEntry = {
        id: `entry_${Date.now()}`,
        timestamp: clockTime,
        clock: clockTime,
        command: cmd,
        stress: updatedStress,
        stressDelta: delta,
        state: updatedState,
        ammaDialogue: data.ammaDialogue,
        englishTranslation: data.englishTranslation,
        systemLogs: data.systemLogs || [],
        isGuiltTrip: data.isGuiltTrip,
        guiltTripText: data.guiltTripText,
        suggestedCommands: data.suggestedCommands || ['tea --brew', 'thuni --fetch', 'phone --hide']
      };

      setEntries(prev => [...prev, newEntry]);
    } catch {
      // Direct client-side failover to local engine
      const localFallback = generateLocalResponse(cmd, stress, currentInterrupt);
      const updatedStress = localFallback.stress;
      const updatedState = localFallback.state;
      const delta = updatedStress - stress;

      setStress(updatedStress);
      setState(updatedState);

      const fallbackEntry: TerminalEntry = {
        id: `entry_fallback_${Date.now()}`,
        timestamp: clockTime,
        clock: clockTime,
        command: cmd,
        stress: updatedStress,
        stressDelta: delta,
        state: updatedState,
        ammaDialogue: localFallback.ammaDialogue,
        systemLogs: [
          ...localFallback.systemLogs,
          '[SYS_OFFLINE] Operating on client-side Tharavadu backup generator.'
        ],
        isGuiltTrip: localFallback.isGuiltTrip,
        guiltTripText: localFallback.guiltTripText,
        suggestedCommands: localFallback.suggestedCommands
      };
      setEntries(prev => [...prev, fallbackEntry]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Trigger specific or dynamic procedural household daemon interrupt
  const triggerDaemonInterrupt = (daemonType?: DaemonType) => {
    const interrupt = generateDynamicDaemonInterrupt(daemonType);
    setActiveInterrupt(interrupt);
    const newStress = Math.min(100, stress + interrupt.initialStressBump);
    setStress(newStress);
    setState(determineAmmaState(newStress));
  };

  // Trigger completely randomized panic daemon with procedural variety
  const triggerRandomDaemon = () => {
    triggerDaemonInterrupt();
  };

  // Handle interrupt timeout
  const handleInterruptTimeout = () => {
    if (!activeInterrupt) return;
    sounds.playErrorChord();
    handleExecuteCommand(`${activeInterrupt.type.toLowerCase()} --timeout --failed`);
  };

  // Reset / Vent stress with tea bribe
  const handleResetStress = () => {
    handleExecuteCommand('reboot --tea-bribe --calm');
  };

  // Handle BSOD recovery
  const handleBsodRecover = (bribeType: 'chaya' | 'apologize' | 'reboot') => {
    sounds.playStartup();
    if (bribeType === 'chaya') {
      confetti({ particleCount: 45, spread: 70, origin: { y: 0.6 } });
      setStress(25);
      setState('CALM_CHAYA');
      const recoverEntry: TerminalEntry = {
        id: `entry_bsod_${Date.now()}`,
        timestamp: clockTime,
        clock: clockTime,
        command: 'tea --brew --cardamom',
        stress: 25,
        state: 'CALM_CHAYA',
        ammaDialogue:
          'Aha! Choodu chaya kandappol thanne ninte thalayil ulla vishamellaam poyi! Ennalum oru karyam njan paranjekkam: adutha pravashyam 4 mani kazhinju chaya tharan madichaal ninte modem njan aattukattilil ketti thazhottu eriyum!',
        systemLogs: [
          'BSOD_RECOVERY: Lactose & cardamom packets injected into kernel memory.',
          'AMMA_TOLERANCE: Buffer restored to 75%.',
          'SYSTEM: MARTYR_MODE disengaged. Household stability returned.'
        ],
        suggestedCommands: ['clean --room --fast', 'study --psc', 'whatsapp --status --mute']
      };
      setEntries(prev => [...prev, recoverEntry]);
    } else if (bribeType === 'apologize') {
      setStress(35);
      setState('CALM_CHAYA');
      const recoverEntry: TerminalEntry = {
        id: `entry_bsod_${Date.now()}`,
        timestamp: clockTime,
        clock: clockTime,
        command: 'apologize --promise:study',
        stress: 35,
        state: 'CALM_CHAYA',
        ammaDialogue:
          'Uvva uvva! Ee kshama parayal njan ethra pravashyam kettittundu! Padikkum ennu parayum, pinne Achan varumbol parayum "computer course" aayirunnu ennu! Phone eduthu poykko, achanu kaanichu kodukkan ulla mark sheet njan ivide eduthu vechirikkunnu!',
        systemLogs: [
          'BSOD_RECOVERY: User issued humble apology.',
          'KERNEL: Warning issued. Phone custody transferred to Amma kitchen shelf.',
          'STRESS: Decreased from 100% to 35%.'
        ],
        suggestedCommands: ['thuni --fetch', 'tea --brew', 'find --bottle']
      };
      setEntries(prev => [...prev, recoverEntry]);
    } else {
      setStress(30);
      setState('CALM_CHAYA');
      const recoverEntry: TerminalEntry = {
        id: `entry_bsod_${Date.now()}`,
        timestamp: clockTime,
        clock: clockTime,
        command: 'reboot --hard',
        stress: 30,
        state: 'CALM_CHAYA',
        ammaDialogue:
          'Reboot cheythu vannuallo! Ee dabba computer reboot cheythal ninte swabhavam maarumo? Poyirunnu adukkalayil ninnu aa Milton flask eduthu vekkeda!',
        systemLogs: [
          'SYSTEM: COLD_BOOT complete.',
          'AMMA_KERNEL.SYS (PID 0) restarted.',
          'HEARTBEAT: Normal.'
        ],
        suggestedCommands: ['tea --brew', 'phone --hide', 'clean --room']
      };
      setEntries(prev => [...prev, recoverEntry]);
    }
  };

  return (
    <div 
      className="relative w-screen h-screen overflow-hidden flex flex-col select-none transition-colors duration-500"
      style={desktopStyle}
    >
      {/* High-Stress Angry Red Perimeter Alert Flash (>90% Stress) */}
      {desktopTheme.isAngryRed && (
        <div className="absolute inset-0 pointer-events-none border-4 border-red-600/50 z-0 animate-pulse" />
      )}

      {/* Top Banner / Retro OS Watermark with Household Clock */}
      <div className="flex-shrink-0 px-3 py-1.5 flex items-center justify-between z-10 select-none">
        <div 
          onClick={() => {
            sounds.playKeyClick();
            setWindows(prev => ({ ...prev, display: true }));
            setFocusedWindow('display');
          }}
          className="cursor-pointer text-white/80 hover:text-white font-mono text-[11px] transition-colors flex items-center gap-2"
          title="Click to open Display Properties [Desk.cpl]"
        >
          <div className="font-bold tracking-wider">THARAVADU 95 [BUILD 1995.08]</div>
          <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/40 ${desktopTheme.isAngryRed ? 'text-red-300 animate-pulse' : 'text-teal-200'}`}>
            {desktopTheme.isAngryRed ? '🔥 ANGRY RED (>90% STRESS)' : desktopTheme.patternName}
          </div>
        </div>

        <HouseholdClock
          currentSlot={householdSlot}
          onSelectSlot={(slot) => {
            setHouseholdSlot(slot);
            const slotConfig = TIME_SLOTS.find(t => t.id === slot);
            if (slotConfig) {
              const timeEntry: TerminalEntry = {
                id: `time_slot_${Date.now()}`,
                timestamp: slotConfig.timeString.split(' ')[0],
                clock: slotConfig.timeString.split(' ')[0],
                command: `schedule --slot:${slot.toLowerCase()}`,
                stress: slot === 'NAALU_MANI' ? Math.max(15, stress - 10) : slot === 'SERIAL_TIME' ? Math.min(95, stress + 15) : stress,
                state: determineAmmaState(slot === 'NAALU_MANI' ? Math.max(15, stress - 10) : stress),
                ammaDialogue: slot === 'PRABATHAM'
                  ? "Kannan Devan chaya ittu! Poyi pallu thechu kulichu vaa! Newspaper Achan eduthu!"
                  : slot === 'OONU'
                  ? "Oonu samayam aayi! Chora thinnan varunnundo atho computer-il irunnu valla chips thinnu vayaru niraikkano?"
                  : slot === 'NAALU_MANI'
                  ? "Naalu mani aayi! Choodu chaya ready! Pazhampori chuttathu kadayil ninnu eduthu vechittundu!"
                  : "Mega serial Asianet-il thudangi! Hall-il aarum orakye samsarikkalle! Phone silent cheytho!",
                systemLogs: [
                  `HOUSEHOLD_CLOCK: Switched to ${slotConfig.titleEnglish}.`,
                  `ACTIVITY: ${slotConfig.activity}`,
                  `STRESS_PROFILE: ${slotConfig.stressFactor}`
                ],
                suggestedCommands: ['tea --brew', 'study --psc', 'clean --room']
              };
              setEntries(prev => [...prev, timeEntry]);
            }
          }}
        />
      </div>

      {/* Desktop Workspace */}
      <div className="flex-1 min-h-0 p-2 md:p-3 pb-2 overflow-hidden flex flex-col lg:flex-row gap-3 relative z-10">
        {/* Left Side: Desktop Icons (Hidden or scrollable on small screens) */}
        <div className="hidden md:flex flex-col gap-2 w-20 flex-shrink-0 z-10 overflow-y-auto max-h-full pr-1">
          {/* AMMA Terminal Icon */}
          <button
            onClick={() => {
              sounds.playKeyClick();
              setFocusedWindow('terminal');
            }}
            className="flex flex-col items-center gap-1 p-1 text-white hover:bg-blue-600/40 rounded cursor-pointer group"
          >
            <div className="w-10 h-10 win95-box bg-slate-900 border border-white flex items-center justify-center shadow-md">
              <Terminal size={22} className="text-emerald-400" />
            </div>
            <span 
              className="text-[10px] text-center font-mono leading-tight px-0.5 group-hover:bg-blue-700 transition-colors duration-300"
              style={{ backgroundColor: desktopTheme.labelBgColor }}
            >
              AMMA_KERNEL
            </span>
          </button>

          {/* Saree Rescue Arcade Game Icon */}
          <button
            onClick={() => {
              sounds.playKeyClick();
              setWindows(prev => ({ ...prev, saree: true }));
              setFocusedWindow('saree');
            }}
            className="flex flex-col items-center gap-1 p-1 text-white hover:bg-blue-600/40 rounded cursor-pointer group"
          >
            <div className="w-10 h-10 win95-box bg-blue-100 border border-white flex items-center justify-center shadow-md">
              <CloudRain size={22} className="text-blue-700" />
            </div>
            <span 
              className="text-[10px] text-center font-mono leading-tight px-0.5 group-hover:bg-blue-700 transition-colors duration-300 font-bold text-yellow-200"
              style={{ backgroundColor: desktopTheme.labelBgColor }}
            >
              Saree Run
            </span>
          </button>

          {/* Kudumbam 95 Family WhatsApp Icon */}
          <button
            onClick={() => {
              sounds.playKeyClick();
              setWindows(prev => ({ ...prev, kudumbam: true }));
              setFocusedWindow('kudumbam');
            }}
            className="flex flex-col items-center gap-1 p-1 text-white hover:bg-blue-600/40 rounded cursor-pointer group"
          >
            <div className="w-10 h-10 win95-box bg-emerald-100 border border-white flex items-center justify-center shadow-md">
              <MessageSquare size={22} className="text-emerald-700" />
            </div>
            <span 
              className="text-[10px] text-center font-mono leading-tight px-0.5 group-hover:bg-blue-700 transition-colors duration-300"
              style={{ backgroundColor: desktopTheme.labelBgColor }}
            >
              Kudumbam 95
            </span>
          </button>

          {/* Achan Daemon Intermediary Icon */}
          <button
            onClick={() => {
              sounds.playKeyClick();
              setWindows(prev => ({ ...prev, achan: true }));
              setFocusedWindow('achan');
            }}
            className="flex flex-col items-center gap-1 p-1 text-white hover:bg-blue-600/40 rounded cursor-pointer group"
          >
            <div className="w-10 h-10 win95-box bg-amber-100 border border-white flex items-center justify-center shadow-md">
              <ShieldCheck size={22} className="text-amber-800" />
            </div>
            <span 
              className="text-[10px] text-center font-mono leading-tight px-0.5 group-hover:bg-blue-700 transition-colors duration-300"
              style={{ backgroundColor: desktopTheme.labelBgColor }}
            >
              Achan SYS
            </span>
          </button>

          {/* Task Manager Icon */}
          <button
            onClick={() => {
              sounds.playKeyClick();
              setWindows(prev => ({ ...prev, taskmgr: true }));
              setFocusedWindow('taskmgr');
            }}
            className="flex flex-col items-center gap-1 p-1 text-white hover:bg-blue-600/40 rounded cursor-pointer group"
          >
            <div className="w-10 h-10 win95-box bg-slate-200 border border-white flex items-center justify-center shadow-md">
              <Activity size={22} className="text-blue-700" />
            </div>
            <span 
              className="text-[10px] text-center font-mono leading-tight px-0.5 group-hover:bg-blue-700 transition-colors duration-300"
              style={{ backgroundColor: desktopTheme.labelBgColor }}
            >
              Task Mgr
            </span>
          </button>

          {/* Tupperware Log Icon */}
          <button
            onClick={() => {
              sounds.playKeyClick();
              setWindows(prev => ({ ...prev, tupperware: true }));
              setFocusedWindow('tupperware');
            }}
            className="flex flex-col items-center gap-1 p-1 text-white hover:bg-blue-600/40 rounded cursor-pointer group"
          >
            <div className="w-10 h-10 win95-box bg-amber-100 border border-white flex items-center justify-center shadow-md">
              <Package size={22} className="text-amber-800" />
            </div>
            <span 
              className="text-[10px] text-center font-mono leading-tight px-0.5 group-hover:bg-blue-700 transition-colors duration-300"
              style={{ backgroundColor: desktopTheme.labelBgColor }}
            >
              Milton Log
            </span>
          </button>

          {/* Guest Radar Icon */}
          <button
            onClick={() => {
              sounds.playKeyClick();
              setWindows(prev => ({ ...prev, radar: true }));
              setFocusedWindow('radar');
            }}
            className="flex flex-col items-center gap-1 p-1 text-white hover:bg-blue-600/40 rounded cursor-pointer group"
          >
            <div className="w-10 h-10 win95-box bg-purple-100 border border-white flex items-center justify-center shadow-md">
              <Radio size={22} className="text-purple-700" />
            </div>
            <span 
              className="text-[10px] text-center font-mono leading-tight px-0.5 group-hover:bg-blue-700 transition-colors duration-300"
              style={{ backgroundColor: desktopTheme.labelBgColor }}
            >
              Sitout Radar
            </span>
          </button>

          {/* Survival Guide & Help Manual Desktop Icon */}
          <button
            onClick={() => {
              sounds.playKeyClick();
              setWindows(prev => ({ ...prev, help: true }));
              setFocusedWindow('help');
            }}
            className="flex flex-col items-center gap-1 p-1 text-white hover:bg-blue-600/40 rounded cursor-pointer group"
          >
            <div className="w-10 h-10 win95-box bg-yellow-100 border border-white flex items-center justify-center shadow-md">
              <HelpCircle size={22} className="text-yellow-700" />
            </div>
            <span 
              className="text-[10px] text-center font-mono leading-tight px-0.5 group-hover:bg-blue-700 font-bold text-yellow-200 transition-colors duration-300"
              style={{ backgroundColor: desktopTheme.labelBgColor }}
            >
              User Guide
            </span>
          </button>

          {/* Display Properties Desktop Icon */}
          <button
            onClick={() => {
              sounds.playKeyClick();
              setWindows(prev => ({ ...prev, display: true }));
              setFocusedWindow('display');
            }}
            className="flex flex-col items-center gap-1 p-1 text-white hover:bg-blue-600/40 rounded cursor-pointer group"
          >
            <div className="w-10 h-10 win95-box bg-teal-100 border border-white flex items-center justify-center shadow-md">
              <Monitor size={22} className="text-teal-800" />
            </div>
            <span 
              className="text-[10px] text-center font-mono leading-tight px-0.5 group-hover:bg-blue-700 transition-colors duration-300"
              style={{ backgroundColor: desktopTheme.labelBgColor }}
            >
              Display
            </span>
          </button>

          {/* Reboot PC / Power Icon */}
          <button
            onClick={() => {
              sounds.playKeyClick();
              setIsBooting(true);
            }}
            className="flex flex-col items-center gap-1 p-1 text-white hover:bg-red-600/40 rounded cursor-pointer group"
          >
            <div className="w-10 h-10 win95-box bg-red-100 border border-white flex items-center justify-center shadow-md">
              <Power size={22} className="text-red-700" />
            </div>
            <span 
              className="text-[10px] text-center font-mono leading-tight px-0.5 group-hover:bg-red-800 transition-colors duration-300 font-bold text-red-200"
              style={{ backgroundColor: desktopTheme.labelBgColor }}
            >
              Restart PC
            </span>
          </button>
        </div>

        {/* Center: Main Primary AMMA_KERNEL Window */}
        <div className="flex-1 min-h-0 flex flex-col win95-box shadow-2xl overflow-hidden z-20">
          {/* Window Title Bar */}
          <div className="flex-shrink-0 win95-titlebar px-2 py-1 flex items-center justify-between font-bold text-xs select-none">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-emerald-300" />
              <span>THARAVADU 95 - AMMA_KERNEL.SYS (PID 0)</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCrtFilter(!crtFilter)}
                title="Toggle CRT Scanlines"
                className="win95-btn px-1.5 py-0 text-[10px] font-bold cursor-pointer"
              >
                CRT: {crtFilter ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => handleExecuteCommand('reboot')}
                title="Reboot Kernel"
                className="win95-btn px-1.5 py-0 text-[10px] font-bold cursor-pointer"
              >
                _
              </button>
              <button
                onClick={() => {
                  setWindows(prev => ({ ...prev, help: true }));
                  setFocusedWindow('help');
                }}
                title="Survival Guide & Cheatsheet"
                className="win95-btn px-1.5 py-0 text-[10px] font-bold cursor-pointer text-blue-900"
              >
                ?
              </button>
            </div>
          </div>

          {/* Window Body: Terminal Console */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <TerminalConsole
              entries={entries}
              onExecuteCommand={handleExecuteCommand}
              isProcessing={isProcessing}
              crtFilter={crtFilter}
              onOpenHelp={() => {
                setWindows(prev => ({ ...prev, help: true }));
                setFocusedWindow('help');
              }}
            />
          </div>
        </div>

        {/* Right Side / Sidebar: Amma Avatar & Real-time Stress Gauge */}
        <div className="w-full lg:w-80 flex flex-col sm:flex-row lg:flex-col gap-2 flex-shrink-0 z-20 overflow-y-auto max-h-full pr-0.5">
          {/* Amma Portrait Avatar Card */}
          <div className="flex-shrink-0 sm:w-1/2 lg:w-full">
            <AmmaAvatar state={state} stress={stress} />
          </div>

          {/* Stress Gauge Card */}
          <div className="flex-shrink-0 sm:w-1/2 lg:w-full">
            <StressGauge
              stress={stress}
              state={state}
              onResetStress={handleResetStress}
              onTriggerBsod={() => {
                setStress(100);
                setState('MARTYR_MODE');
              }}
            />
          </div>

          {/* Quick House Daemons Panel */}
          <div className="flex-shrink-0 win95-box p-2 hidden sm:flex flex-col gap-1 text-[11px] font-mono">
            <div className="text-[10px] font-bold text-gray-700 uppercase tracking-wider pb-1 border-b border-gray-300 flex items-center justify-between">
              <span>DAEMON SHORTCUTS:</span>
              <span className="text-[9px] text-gray-500">CLICK TO TRIGGER</span>
            </div>
            <div className="grid grid-cols-2 gap-1 mt-1">
              <button
                onClick={() => triggerDaemonInterrupt('MAZHA.EXE')}
                className="win95-btn p-1 text-[10px] font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 flex items-center gap-1 cursor-pointer"
              >
                <CloudRain size={11} className="text-blue-600" />
                <span>Mazha</span>
              </button>
              <button
                onClick={() => triggerDaemonInterrupt('KSEB_TRIP')}
                className="win95-btn p-1 text-[10px] font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 flex items-center gap-1 cursor-pointer"
              >
                <Zap size={11} className="text-amber-600" />
                <span>KSEB Trip</span>
              </button>
              <button
                onClick={() => triggerDaemonInterrupt('GUEST_RADAR')}
                className="win95-btn p-1 text-[10px] font-bold text-purple-900 bg-purple-50 hover:bg-purple-100 flex items-center gap-1 cursor-pointer"
              >
                <Radio size={11} className="text-purple-600" />
                <span>Guest</span>
              </button>
              <button
                onClick={() => triggerDaemonInterrupt('CHAYA_PIPELINE')}
                className="win95-btn p-1 text-[10px] font-bold text-amber-900 bg-yellow-50 hover:bg-yellow-100 flex items-center gap-1 cursor-pointer"
              >
                <Coffee size={11} className="text-amber-700" />
                <span>Chaya</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Auxiliary Windows: Task Manager */}
      <AnimatePresence>
        {windows.taskmgr && (
          <motion.div 
            initial={{ scale: 0.92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 10 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-4 md:inset-auto md:top-12 md:left-24 md:w-[480px] md:h-[380px] z-30 shadow-2xl"
          >
            <TaskManager
              stress={stress}
              onClose={() => setWindows(prev => ({ ...prev, taskmgr: false }))}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Auxiliary Windows: Tupperware Registry */}
      <AnimatePresence>
        {windows.tupperware && (
          <motion.div 
            initial={{ scale: 0.92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 10 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-4 md:inset-auto md:top-16 md:right-28 md:w-[500px] md:h-[420px] z-30 shadow-2xl"
          >
            <TupperwareRegistry
              onClose={() => setWindows(prev => ({ ...prev, tupperware: false }))}
              onAuditMissing={(itemName) => {
                handleExecuteCommand(`find --bottle --item:"${itemName}"`);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Auxiliary Windows: Guest Radar */}
      <AnimatePresence>
        {windows.radar && (
          <motion.div 
            initial={{ scale: 0.92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 10 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-3 md:inset-auto md:bottom-14 md:left-28 md:w-[490px] md:h-[500px] z-30 shadow-2xl flex flex-col"
          >
            <GuestRadar
              onClose={() => setWindows(prev => ({ ...prev, radar: false }))}
              onSitoutAction={(cmd) => {
                handleExecuteCommand(cmd);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Auxiliary Windows: Survival Guide & Cheatsheet */}
      <AnimatePresence>
        {windows.help && (
          <motion.div 
            initial={{ scale: 0.92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 10 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-4 md:inset-auto md:top-14 md:left-24 md:w-[560px] md:h-[460px] z-40 shadow-2xl"
          >
            <HelpGuide
              onClose={() => setWindows(prev => ({ ...prev, help: false }))}
              onExecuteCommand={(cmd) => {
                handleExecuteCommand(cmd);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Auxiliary Windows: Display Properties [Desk.cpl] */}
      <AnimatePresence>
        {windows.display && (
          <motion.div 
            initial={{ scale: 0.92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 10 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-4 md:inset-auto md:top-12 md:right-16 md:w-[490px] md:h-[530px] z-40 shadow-2xl"
          >
            <DisplayProperties
              stress={stress}
              state={state}
              patternOverride={patternOverride}
              onSetPatternOverride={setPatternOverride}
              onSetStress={(newStress) => {
                setStress(newStress);
                setState(determineAmmaState(newStress));
              }}
              onClose={() => setWindows(prev => ({ ...prev, display: false }))}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Auxiliary Windows: Saree Rescue Arcade Game */}
      <AnimatePresence>
        {windows.saree && (
          <motion.div 
            initial={{ scale: 0.92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 10 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-4 md:inset-auto md:top-10 md:left-28 md:w-[480px] md:h-[540px] z-40 shadow-2xl"
          >
            <SareeRescueGame
              onClose={() => setWindows(prev => ({ ...prev, saree: false }))}
              onSuccess={(savedCount) => {
                const newStress = Math.max(15, stress - (savedCount * 5));
                setStress(newStress);
                setState(determineAmmaState(newStress));
                const entry: TerminalEntry = {
                  id: `saree_win_${Date.now()}`,
                  timestamp: clockTime,
                  clock: clockTime,
                  command: 'mazha_run --completed',
                  stress: newStress,
                  stressDelta: -(savedCount * 5),
                  state: determineAmmaState(newStress),
                  ammaDialogue: `Mothathil ${savedCount} thuni nanayathe eduthu! Nalla kaaryam! Kasavu saree oru thulli vellam polum veenilla! Choodu chaya kudikku!`,
                  systemLogs: [
                    `TERRACE_RESIDUAL: ${savedCount} dry clothes safely stacked in plastic tub.`,
                    `AMMA_APPROVAL: +${savedCount * 10}XP, Maternal relief level boosted.`,
                    `STRESS_REDUCTION: -${savedCount * 5}%`
                  ],
                  suggestedCommands: ['tea --brew', 'clean --room', 'study --psc']
                };
                setEntries(prev => [...prev, entry]);
              }}
              onFailure={(wetCount) => {
                const newStress = Math.min(100, stress + (wetCount * 7));
                setStress(newStress);
                setState(determineAmmaState(newStress));
                const entry: TerminalEntry = {
                  id: `saree_fail_${Date.now()}`,
                  timestamp: clockTime,
                  clock: clockTime,
                  command: 'mazha_run --failed',
                  stress: newStress,
                  stressDelta: wetCount * 7,
                  state: determineAmmaState(newStress),
                  ammaDialogue: `Ayyo! ${wetCount} thuni nananju kulichu poyi! Ente Onam kasavu saree nanayichallo drohi! Ippo poyi bucket-il mukki pizhinyu vekku!`,
                  systemLogs: [
                    `TERRACE_ALERT: ${wetCount} garments soaked in torrential Kerala rain.`,
                    `MATERNAL_DAMAGE: Critical kasavu fabric degradation.`,
                    `STRESS_INCREASE: +${wetCount * 7}%`
                  ],
                  suggestedCommands: ['reboot --tea-bribe --calm', 'clean --room --fast']
                };
                setEntries(prev => [...prev, entry]);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Auxiliary Windows: Kudumbam 95 WhatsApp */}
      <AnimatePresence>
        {windows.kudumbam && (
          <motion.div 
            initial={{ scale: 0.92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 10 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-4 md:inset-auto md:top-14 md:right-20 md:w-[460px] md:h-[520px] z-40 shadow-2xl"
          >
            <KudumbamMessenger
              onClose={() => setWindows(prev => ({ ...prev, kudumbam: false }))}
              onSendReply={(text) => {
                const newStress = Math.max(15, stress - 8);
                setStress(newStress);
                setState(determineAmmaState(newStress));
                const entry: TerminalEntry = {
                  id: `kudumbam_rep_${Date.now()}`,
                  timestamp: clockTime,
                  clock: clockTime,
                  command: `whatsapp --reply:"${text.slice(0, 20)}..."`,
                  stress: newStress,
                  stressDelta: -8,
                  state: determineAmmaState(newStress),
                  ammaDialogue: "Kudumbam group-il maryadhakku reply koduthathukondu naanamkedu ozhivayi! Sukumaran Ammavanu thrupthi aayi!",
                  systemLogs: [
                    'WHATSAPP_95: Respectful reply broadcast to 42 family members.',
                    'AMMVAAN_SCORE: Maximum pranams delivered.',
                    'STRESS: -8%'
                  ],
                  suggestedCommands: ['tea --brew', 'study --psc', 'clean --room']
                };
                setEntries(prev => [...prev, entry]);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Auxiliary Windows: Achan Daemon Intermediary */}
      <AnimatePresence>
        {windows.achan && (
          <AchanDaemonModal
            currentStress={stress}
            onApplyRagebait={(addedStress, achanQuote, ammaReply, cmd) => {
              const newStress = Math.min(100, stress + addedStress);
              setStress(newStress);
              setState(determineAmmaState(newStress));
              const entry: TerminalEntry = {
                id: `achan_rage_${Date.now()}`,
                timestamp: clockTime,
                clock: clockTime,
                command: cmd,
                stress: newStress,
                stressDelta: addedStress,
                state: determineAmmaState(newStress),
                ammaDialogue: ammaReply,
                systemLogs: [
                  `ACHAN_RAGEBAIT: "${achanQuote}"`,
                  `MATERNAL_REACTION: 5-alarm kitchen firestorm triggered!`,
                  `STRESS: +${addedStress}% -> ${newStress}%`
                ],
                suggestedCommands: ['praise --sambar', 'tea --brew', 'study --psc', 'thuni --fetch']
              };
              setEntries(prev => [...prev, entry]);
            }}
            onExecuteSolution={(solutionCmd) => {
              handleExecuteCommand(solutionCmd);
            }}
            onClose={() => setWindows(prev => ({ ...prev, achan: false }))}
          />
        )}
      </AnimatePresence>

      {/* Critical Daemon Interrupt Modal */}
      <AnimatePresence>
        {activeInterrupt && (
          <InterruptModal
            interrupt={activeInterrupt}
            onResolve={(cmd) => handleExecuteCommand(cmd)}
            onTimeout={handleInterruptTimeout}
          />
        )}
      </AnimatePresence>

      {/* Start Menu Popup */}
      <StartMenu
        isOpen={startOpen}
        onClose={() => setStartOpen(false)}
        onOpenWindow={(id) => {
          if (id === 'terminal') setFocusedWindow('terminal');
          else if (id === 'taskmgr') setWindows(prev => ({ ...prev, taskmgr: true }));
          else if (id === 'tupperware') setWindows(prev => ({ ...prev, tupperware: true }));
          else if (id === 'radar') setWindows(prev => ({ ...prev, radar: true }));
          else if (id === 'help') setWindows(prev => ({ ...prev, help: true }));
          else if (id === 'display') setWindows(prev => ({ ...prev, display: true }));
          else if (id === 'saree') setWindows(prev => ({ ...prev, saree: true }));
          else if (id === 'kudumbam') setWindows(prev => ({ ...prev, kudumbam: true }));
          else if (id === 'achan') setWindows(prev => ({ ...prev, achan: true }));
        }}
        onReboot={() => handleExecuteCommand('reboot')}
        onTriggerDaemon={(daemonType) => triggerDaemonInterrupt(daemonType as DaemonType)}
        onTriggerBsod={() => {
          setStress(100);
          setState('MARTYR_MODE');
        }}
      />

      {/* Windows 95 Desktop Notification Toast */}
      <DesktopToast
        toast={activeToast}
        onDismiss={() => setActiveToast(null)}
      />

      {/* Windows 95 Taskbar */}
      <Taskbar
        startOpen={startOpen}
        onToggleStart={() => setStartOpen(!startOpen)}
        activeWindows={[
          { id: 'terminal', title: 'AMMA_KERNEL Console', isOpen: true, isMinimized: false },
          { id: 'taskmgr', title: 'Task Manager', isOpen: windows.taskmgr, isMinimized: false },
          { id: 'tupperware', title: 'Tupperware Log', isOpen: windows.tupperware, isMinimized: false },
          { id: 'radar', title: 'Sit-Out Radar', isOpen: windows.radar, isMinimized: false },
          { id: 'help', title: 'Survival Guide', isOpen: windows.help, isMinimized: false },
          { id: 'display', title: 'Display Properties', isOpen: windows.display, isMinimized: false },
          { id: 'saree', title: 'Saree Rescue (Mazha Run)', isOpen: windows.saree, isMinimized: false },
          { id: 'kudumbam', title: 'Kudumbam 95 Messenger', isOpen: windows.kudumbam, isMinimized: false },
          { id: 'achan', title: 'Achan Mediation Daemon', isOpen: windows.achan, isMinimized: false },
        ]}
        focusedWindowId={focusedWindow}
        onWindowClick={(id) => {
          if (id === 'terminal') setFocusedWindow('terminal');
          else if (id === 'taskmgr') setWindows(prev => ({ ...prev, taskmgr: !prev.taskmgr }));
          else if (id === 'tupperware') setWindows(prev => ({ ...prev, tupperware: !prev.tupperware }));
          else if (id === 'radar') setWindows(prev => ({ ...prev, radar: !prev.radar }));
          else if (id === 'help') setWindows(prev => ({ ...prev, help: !prev.help }));
          else if (id === 'display') setWindows(prev => ({ ...prev, display: !prev.display }));
          else if (id === 'saree') setWindows(prev => ({ ...prev, saree: !prev.saree }));
          else if (id === 'kudumbam') setWindows(prev => ({ ...prev, kudumbam: !prev.kudumbam }));
          else if (id === 'achan') setWindows(prev => ({ ...prev, achan: !prev.achan }));
        }}
        crtFilter={crtFilter}
        onToggleCrt={() => setCrtFilter(!crtFilter)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        stress={stress}
        state={state}
        clockTime={clockTime}
        onQuickInterrupt={triggerRandomDaemon}
        autoTriggerEnabled={autoTriggerEnabled}
        onToggleAutoTrigger={() => setAutoTriggerEnabled(!autoTriggerEnabled)}
        onRestartPC={() => setIsBooting(true)}
      />

      {/* 100% Stress Blue Screen of Death (BSOD) */}
      {stress >= 100 && (
        <BsodScreen
          stress={stress}
          onRecover={handleBsodRecover}
        />
      )}

      {/* PC Application Boot Sequence Overlay (Startup Animation & Sound) */}
      <AnimatePresence>
        {isBooting && (
          <PCStartup
            soundEnabled={soundEnabled}
            onComplete={() => setIsBooting(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
