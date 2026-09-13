import { DaemonInterrupt, DaemonType, AmmaOperatingState, TerminalEntry } from '../types';
import { determineAmmaState } from './localEngine';

export type ChaosEventType = 
  | 'INTERRUPT_MODAL'          // 35-40% chance: interactive urgent modal with dynamic scenarios
  | 'SPONTANEOUS_AMMA_BARK'     // 25-30% chance: sudden maternal bark/dialogue directly in terminal
  | 'ACOUSTIC_TOAST'           // 20% chance: domestic acoustic flare with retro desktop toast notification
  | 'ACHAN_SITOUT_COMMENT';     // 15% chance: paternal newspaper critique from the veranda

export interface AcousticToastData {
  id: string;
  icon: 'bell' | 'cooker' | 'gate' | 'power' | 'thunder' | 'whatsapp' | 'tea';
  title: string;
  subtitle: string;
  soundType: 'cooker' | 'gate' | 'thunder' | 'inverter' | 'tongue' | 'error' | 'chime';
  systemLog: string;
  stressDelta: number;
}

export interface AmmaSpontaneousBark {
  dialogue: string;
  englishTranslation: string;
  stressDelta: number;
  soundType: 'tongue' | 'error' | 'inverter';
  systemLogs: string[];
  suggestedCommands: string[];
}

export interface AchanSitoutEvent {
  achanQuote: string;
  achanEnglish: string;
  ammaResponse: string;
  ammaEnglish: string;
  stressDelta: number;
  systemLogs: string[];
  suggestedCommands: string[];
}

// -------------------------------------------------------------
// 1. DYNAMIC INTERVAL CALCULATOR (Unpredictable, Non-Scripted)
// -------------------------------------------------------------
export function calculateNextChaosInterval(currentStress: number): number {
  // Rather than a fixed egg-timer, use a dynamic distribution
  // influenced by Amma's stress + 15% chance of rapid compound chaos
  const isMicroBurst = Math.random() < 0.16;
  if (isMicroBurst) {
    // Sudden follow-up emergency (8s to 16s)
    return Math.floor(Math.random() * 8000) + 8000;
  }

  if (currentStress >= 75) {
    // PREEMPTIVE_PANIC: Amma is on edge, events strike rapidly
    return Math.floor(Math.random() * 18000) + 16000; // 16s - 34s
  } else if (currentStress >= 40) {
    // SUSPICIOUS_SCAN: Moderate erratic household tension
    return Math.floor(Math.random() * 24000) + 26000; // 26s - 50s
  } else {
    // CALM_CHAYA: Relaxed lull before the next storm
    return Math.floor(Math.random() * 32000) + 40000; // 40s - 72s
  }
}

// -------------------------------------------------------------
// 2. RANDOM EVENT TYPE PICKER
// -------------------------------------------------------------
export function pickNextChaosEventType(hasActiveModal: boolean): ChaosEventType {
  // If a modal is already open on screen, do not open another modal
  if (hasActiveModal) {
    const r = Math.random();
    if (r < 0.5) return 'ACOUSTIC_TOAST';
    return 'SPONTANEOUS_AMMA_BARK';
  }

  const roll = Math.random();
  if (roll < 0.38) {
    return 'INTERRUPT_MODAL';
  } else if (roll < 0.65) {
    return 'SPONTANEOUS_AMMA_BARK';
  } else if (roll < 0.84) {
    return 'ACOUSTIC_TOAST';
  } else {
    return 'ACHAN_SITOUT_COMMENT';
  }
}

// Helper: Pick random item from array
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper: Random number in range
function randRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// -------------------------------------------------------------
// 3. PROCEDURALLY GENERATED DAEMON INTERRUPTS
// (Infinite variety, never the same static text)
// -------------------------------------------------------------
export function generateDynamicDaemonInterrupt(typeOverride?: DaemonType): DaemonInterrupt {
  const daemonTypes: DaemonType[] = [
    'MAZHA.EXE',
    'KSEB_TRIP',
    'GUEST_RADAR',
    'TUPPERWARE_INTEGRITY',
    'CHAYA_PIPELINE',
    'COOKER_WHISTLE',
    'KUDUMBAM_FORWARD',
    'ACHAN_REMARK',
    'GATE_CREAK'
  ];

  const chosenType = typeOverride || pick(daemonTypes);

  switch (chosenType) {
    case 'MAZHA.EXE': {
      const scenarios = [
        {
          laundry: "Amma's wedding Kasavu pattu-saree drying on the terrace parapet",
          urgency: 'CRITICAL' as const,
          countdown: randRange(18, 26),
          stressBump: randRange(24, 32),
          quote: "Mazha kaaruthu! Eastern sky-il kooriruttu! Ente kalyana pattu-saree nananjal njan ninte phone kinaril idum!",
          action1: 'thuni --fetch --speed:sprint',
          action2: 'rain --ignore --risk-saree'
        },
        {
          laundry: "Achan's starch-ironed double mundu needed for tomorrow's function",
          urgency: 'HIGH' as const,
          countdown: randRange(20, 30),
          stressBump: randRange(20, 26),
          quote: "Terrace-il mazhathulli veenu thudangi! Achan-te double mundu nananjal pinne ivide oru yudham thanne aayirikkum! Odu!",
          action1: 'thuni --fetch',
          action2: 'mundu --dry --under-fan'
        },
        {
          laundry: "5kg of dried red chillies and pappadams spread on Mathrubhumi newspaper",
          urgency: 'CRITICAL' as const,
          countdown: randRange(15, 24),
          stressBump: randRange(28, 35),
          quote: "Ayyoo! Veyilathitta vatta-chilly-um pappadavum terrace-il aanu! Oru thulli vellam veenal fungus koodum! Odi chennu paathram edukkeda!",
          action1: 'chilli --rescue --paper-fold',
          action2: 'pappadam --abandon'
        },
        {
          laundry: "School and college uniforms needed early tomorrow morning",
          urgency: 'HIGH' as const,
          countdown: randRange(22, 28),
          stressBump: randRange(18, 25),
          quote: "Naalathe uniform nananju poyal nee enthu ittu pokum? Mazha peythu thudangiyaal iron cheyyan polum current undavilla! Eduthond vaa!",
          action1: 'thuni --fetch',
          action2: 'iron --plug-in'
        }
      ];
      const s = pick(scenarios);
      return {
        id: `int_mazha_${Date.now()}`,
        type: 'MAZHA.EXE',
        title: `CRITICAL MONSOON FAULT: MAZHA.EXE`,
        description: `Sudden Kerala rainstorm brewing! ${s.laundry}. Rapid drops hitting asbestos roof!`,
        urgency: s.urgency,
        countdownSeconds: s.countdown,
        initialStressBump: s.stressBump,
        failureStressBump: s.stressBump + 10,
        successStressDrop: randRange(18, 25),
        primaryAction: s.action1,
        secondaryAction: s.action2,
        dialogueTrigger: s.quote
      };
    }

    case 'GUEST_RADAR': {
      const visitors = [
        {
          name: "Sukumaran Ammavan on Bajaj Chetak scooter",
          threat: "Incoming to cross-examine IT salary, marriage proposals, and why you don't write PSC tests",
          countdown: randRange(18, 24),
          quote: "Sukumaran Ammavan scooter gate kadannu! Lungi maatti nalla pant idu! Chekkan ivide phone-il nokki irikkunnu ennu parayaruthu!",
          action1: 'sitout --greet --tea',
          action2: 'bedroom --lock --hide'
        },
        {
          name: "Bindu Chittedathi carrying homemade banana chips",
          threat: "Extremely sharp-eyed relative ready to inspect dusty bedsheets and kitchen cleanliness",
          countdown: randRange(16, 22),
          quote: "Bindu Chitta vannu! Table-le empty glasses maatteda! Aval kandaal Kudumbam WhatsApp-il photo idum!",
          action1: 'clean --room --fast',
          action2: 'chips --accept --compliment'
        },
        {
          name: "LIC Agent Mohan in safari suit",
          threat: "Attempting to pitch a 25-year Jeevan Anand endowment policy for which Achan will blame you",
          countdown: randRange(20, 28),
          quote: "LIC Mohan aanu sitout-il! Ninte achanodu parayan Mohan-odu chaya kudichu pokaan! Nee munpil chennu pettennu nilkkelle!",
          action1: 'tea --serve --say:achan-busy',
          action2: 'policy --reject'
        },
        {
          name: "Balan the Coconut Plucker (Thengu Kayattakkaran)",
          threat: "Standing at back door with sickle demanding hot cardamom tea and betel leaf",
          countdown: randRange(22, 30),
          quote: "Balan chettan thenna keraan vannu! Kattan chaya ready aano? KSEB current povunna munpe vellam thilappikku!",
          action1: 'tea --brew --kattan',
          action2: 'balan --wait'
        },
        {
          name: "Shaji's mother Girija returning empty steel dabba",
          threat: "Gossip level DEFCON 1! Will notice every single detail in the front drawing room",
          countdown: randRange(18, 25),
          quote: "Shaji-de amma Girija vannu! Shaji ninakku kondu thanna Tupperware ithuvare thirichu thannittilla! Avalodu chaya chodikkanda!",
          action1: 'sitout --greet --tea',
          action2: 'find --bottle --location:SHAJI_HOUSE'
        }
      ];
      const v = pick(visitors);
      return {
        id: `int_guest_${Date.now()}`,
        type: 'GUEST_RADAR',
        title: `PERIPHERAL RADAR: ${v.name.toUpperCase()}`,
        description: `${v.name} spotted approaching Tharavadu porch. Threat: ${v.threat}.`,
        urgency: 'HIGH',
        countdownSeconds: v.countdown,
        initialStressBump: randRange(22, 32),
        failureStressBump: randRange(28, 35),
        successStressDrop: randRange(20, 28),
        primaryAction: v.action1,
        secondaryAction: v.action2,
        dialogueTrigger: v.quote
      };
    }

    case 'TUPPERWARE_INTEGRITY': {
      const items = [
        {
          name: "2004 Dubai yellow airtight Milton water bottle",
          lore: "Imported from Deira City Centre 20 years ago by Achan. Irreplaceable family heirloom.",
          countdown: randRange(26, 36),
          quote: "Ente manja Milton bottle evide?! Ninte achan Dubai-il ninnu kashtappattu kondu vannathaanu! Athu Shaji-kk kodutho?!",
          action1: 'find --bottle --location:SHAJI_HOUSE',
          action2: 'tupperware --confess --lost'
        },
        {
          name: "Green 3-tier steel-lined insulated lunchbox",
          lore: "Lent to cousin during exam week and never brought back. Amma has kept mental tally for 9 months.",
          countdown: randRange(24, 34),
          quote: "Pachha color 3-tier lunchbox evide poyi? Ninte koottukaaru thinnum, pakshe paathram thirichu tharilla! Ippo thanne call cheyyu!",
          action1: 'phone --call:shaji --demand:box',
          action2: 'tiffin --search:cupboard'
        },
        {
          name: "Blue Curd Tub that went missing during school tuition in 2012",
          lore: "Amma suddenly remembered a missing curd container from 14 years ago and is retroactively auditing.",
          countdown: randRange(30, 40),
          quote: "2012-le physics tuition-u kondu poya neela curd dabba nee enikku thirichu thanno? Thannilla! Athinte lid maathram ivide undu!",
          action1: 'excuse --invent --target:AMMA',
          action2: 'apologize --hug --promise-tea'
        },
        {
          name: "Prized glass Horlicks bottle used to store homemade mango pickle",
          lore: "Tender mango pickle (kanni manga) airtight storage. Lid was allegedly twisted with oily fingers.",
          countdown: randRange(22, 30),
          quote: "Kanni manga ittu vecha Horlicks jar aara eera kaiyyode thottathu? Fungus keriyaal njan ninte kai vetti kinaril idum!",
          action1: 'pickle --clean-lid --tighten',
          action2: 'blame --achan'
        }
      ];
      const it = pick(items);
      return {
        id: `int_tup_${Date.now()}`,
        type: 'TUPPERWARE_INTEGRITY',
        title: `FILESYSTEM AUDIT: ${it.name.toUpperCase()}`,
        description: `Maternal inventory discrepancy: ${it.name}. ${it.lore}.`,
        urgency: 'CATASTROPHIC',
        countdownSeconds: it.countdown,
        initialStressBump: randRange(28, 38),
        failureStressBump: randRange(32, 42),
        successStressDrop: randRange(24, 32),
        primaryAction: it.action1,
        secondaryAction: it.action2,
        dialogueTrigger: it.quote
      };
    }

    case 'KSEB_TRIP': {
      const causes = [
        {
          cause: "Heavy gust blew coconut frond onto 11kV overhead line",
          countdown: randRange(20, 28),
          quote: "Current poyi! Inverter scream cheyyunnu! Ninte aa phone 24 manikkoor charge cheythu vechirikkunnath kondaanu feeder trip aayathu!",
          action1: 'kseb --fuse-check',
          action2: 'phone --unplug'
        },
        {
          cause: "Local sub-station transformer blasted near railway crossing",
          countdown: randRange(24, 32),
          quote: "Pothu transformer potti kando! Inverter battery low aakunna munpe mixie-yil thenga arachukko! Ammiyil araykendi varum!",
          action1: 'inverter --eco-mode',
          action2: 'candle --search:drawer'
        },
        {
          cause: "Next door neighbour switched on 3HP irrigation motor causing 140V drop",
          countdown: randRange(18, 25),
          quote: "Voltage kuranju fan nilkkunnu! Computer monitor blink cheyyunnu! Tube light starter sound kettille? Odi poyi switch idu!",
          action1: 'stabilizer --boost',
          action2: 'pc --save-work'
        }
      ];
      const c = pick(causes);
      return {
        id: `int_kseb_${Date.now()}`,
        type: 'KSEB_TRIP',
        title: `POWER GRID FAULT: KSEB TRIP`,
        description: `Kerala State Electricity Board blackout! ${c.cause}. Inverter relay high-frequency distress chirp active!`,
        urgency: 'MEDIUM',
        countdownSeconds: c.countdown,
        initialStressBump: randRange(18, 26),
        failureStressBump: randRange(22, 30),
        successStressDrop: randRange(15, 22),
        primaryAction: c.action1,
        secondaryAction: c.action2,
        dialogueTrigger: c.quote
      };
    }

    case 'COOKER_WHISTLE': {
      const whistles = randRange(2, 4);
      const dishes = ['Parippu dal for evening sambar', 'Mutton olathiyathu for dinner', 'Chor (boiled Kerala matta rice)', 'Kadala curry for puttu'];
      const dish = pick(dishes);
      return {
        id: `int_cooker_${Date.now()}`,
        type: 'COOKER_WHISTLE',
        title: `KITCHEN ACOUSTIC: PRESTIGE COOKER WHISTLE #${whistles}`,
        description: `Prestige 5L Cooker just blew whistle #${whistles} cooking ${dish}! Safety vent pressure release valve hissing vigorously.`,
        urgency: 'HIGH',
        countdownSeconds: randRange(16, 24),
        initialStressBump: randRange(18, 25),
        failureStressBump: randRange(25, 32),
        successStressDrop: randRange(18, 24),
        primaryAction: 'gas --sim --knob:low',
        secondaryAction: 'cooker --ignore' ,
        dialogueTrigger: `Cooker ${whistles} whistle adichu kando! Gas knob sim cheyyedo! Paranjaal kelkkilla! Kaari poyal nee thinnuvo ithu?`
      };
    }

    case 'CHAYA_PIPELINE': {
      const snacks = ['hot Parippuvada batch', 'crunchy Pazham Pori', 'steaming Kozhukkatta', 'spicy Uzhunnuvada'];
      const snack = pick(snacks);
      return {
        id: `int_chaya_${Date.now()}`,
        type: 'CHAYA_PIPELINE',
        title: `CRON PROTOCOL: 4:00 PM NAALU MANI CHAYA`,
        description: `Cardamom black tea poured into steel glass alongside ${snack}. Amma refuses to let it go cold!`,
        urgency: 'LOW',
        countdownSeconds: randRange(28, 42),
        initialStressBump: randRange(10, 16),
        failureStressBump: randRange(18, 24),
        successStressDrop: randRange(16, 22),
        primaryAction: 'chaya --accept --sugar:less',
        secondaryAction: 'tea --reject --say:later',
        dialogueTrigger: `Chaya aayeda! ${snack} choodode undakki vechirunnu! Iniyum aa computer screen-il thanne nokki irunnal aari poyath thinnendi varum!`
      };
    }

    case 'KUDUMBAM_FORWARD': {
      const forwards = [
        {
          desc: "45MB glittering animated video with lotus petals wishing 'Subhadinam' with devotional playback",
          quote: "Ammavan WhatsApp-il video ayachu! Oru pranamam ayakkan polum ninte viral-inu sheshi ille?! Amma-kk naanam kedutharuthu!",
          action1: 'whatsapp --reply:pranams',
          action2: 'whatsapp --mute'
        },
        {
          desc: "Audio note claiming charging phone overnight causes WiFi radiation in kitchen drinking water",
          quote: "Kudumbam group-il Dr. Jayashree voice note ayachu kando?! Phone charger raathri on aakki vachathinaanu ninte thala vedhana!",
          action1: 'phone --unplug',
          action2: 'whatsapp --forward:fake'
        },
        {
          desc: "Astrological warning that Rahu Kalam starts at 4:30 PM and nobody should touch plastic bottles",
          quote: "Rahu Kalam aayi! Achanodu parayan TV serial sound kurakkan! Nee poyi vilakku koluthu!",
          action1: 'vilakku --light',
          action2: 'study --psc'
        }
      ];
      const f = pick(forwards);
      return {
        id: `int_kudumbam_${Date.now()}`,
        type: 'KUDUMBAM_FORWARD',
        title: `WHATSAPP BROADCAST: KUDUMBAM GROUP ALERT`,
        description: `New viral family forward received: ${f.desc}. Amma requires immediate compliance.`,
        urgency: 'MEDIUM',
        countdownSeconds: randRange(22, 32),
        initialStressBump: randRange(14, 20),
        failureStressBump: randRange(20, 28),
        successStressDrop: randRange(14, 20),
        primaryAction: f.action1,
        secondaryAction: f.action2,
        dialogueTrigger: f.quote
      };
    }

    case 'ACHAN_REMARK': {
      const critiques = [
        {
          target: "Sambar lacks salt compared to his elder brother's (Valyachan) house",
          quote: "Achan paranjathu kando?! Sambar-il uppu kuravaannu! Annan-te veettil poyi thinnaan para! Njan innu muthal ivide onnum cooking cheyyilla!",
          action1: 'praise --sambar --best-in-kerala',
          action2: 'uppu --fetch --salt-cruet'
        },
        {
          target: "Electricity bill reached 1,850 Rs and someone is leaving ceiling fan on in empty rooms",
          quote: "Achan electricity bill kandu deshyappettu! Ninte room-ile fan 5-il ittu karangiyathaa kaaranam! Ippo thanne off cheyyeda!",
          action1: 'fan --off',
          action2: 'excuse --invent --target:ACHAN'
        },
        {
          target: "Achan folded Mathrubhumi newspaper with an aggressive slap asking why you aren't an SBI clerk yet",
          quote: "Achan paper thazhe vechu! Ninte cousin Santhosh bank test pass aayi, nee ivide mouse click cheyyunnu! Oru divasam njan kinaril chadum!",
          action1: 'study --psc --silent',
          action2: 'tea --serve:achan'
        }
      ];
      const crit = pick(critiques);
      return {
        id: `int_achan_${Date.now()}`,
        type: 'ACHAN_REMARK',
        title: `PATERNAL PROVOCATION: ACHAN SITOUT RAGEBAIT`,
        description: `Achan lowered his reading glasses and remarked that ${crit.target}. Thermonuclear maternal detonation imminent!`,
        urgency: 'CRITICAL',
        countdownSeconds: randRange(18, 26),
        initialStressBump: randRange(26, 34),
        failureStressBump: randRange(30, 38),
        successStressDrop: randRange(25, 32),
        primaryAction: crit.action1,
        secondaryAction: crit.action2,
        dialogueTrigger: crit.quote
      };
    }

    case 'GATE_CREAK':
    default: {
      const visitors = [
        { desc: "Heavy iron gate squeaked open — unexpected visitor on front red-oxide tiles", action: 'sitout --greet --tea' },
        { desc: "Fish vendor (Meenkkaran) honking bicycle horn outside boundary wall", action: 'meen --buy --ayala' },
        { desc: "Courier delivery boy holding parcel requiring 450 Rs Cash On Delivery", action: 'parcel --accept --cash' }
      ];
      const g = pick(visitors);
      return {
        id: `int_gate_${Date.now()}`,
        type: 'GATE_CREAK',
        title: `PERIMETER ACOUSTIC: FRONT IRON GATE CREAK`,
        description: `${g.desc}. Amma commands immediate visual verification.`,
        urgency: 'HIGH',
        countdownSeconds: randRange(18, 25),
        initialStressBump: randRange(20, 26),
        failureStressBump: randRange(26, 32),
        successStressDrop: randRange(18, 24),
        primaryAction: g.action,
        secondaryAction: 'phone --hide',
        dialogueTrigger: "Iron gate thuranna shabdham kettu! Aaraannu nokkeda! Ninte koottukaar aano atho valla relatives aano? Odi poyi nokku!"
      };
    }
  }
}

// -------------------------------------------------------------
// 4. SPONTANEOUS AMMA TERMINAL BARKS (No blocking modal!)
// -------------------------------------------------------------
export function generateSpontaneousAmmaBark(currentStress: number): AmmaSpontaneousBark {
  const barks: AmmaSpontaneousBark[] = [
    {
      dialogue: "Nee aa phone-il thanne nokki irunno! Kanneeriyumbol njan paranjilla ennu parayaruthu! Adukkayil oru sahayam cheyyan ivanu thonnilla!",
      englishTranslation: "Keep staring into that smartphone! When your eyesight burns out, don't say I didn't warn you! Never occurs to you to offer help in the kitchen!",
      stressDelta: randRange(6, 12),
      soundType: 'tongue',
      systemLogs: [
        '[MATERNAL_RADAR] Eye-strain warning emitted from hallway.',
        'PROXIMITY_SCAN: Amma pacing near bedroom door.'
      ],
      suggestedCommands: ['phone --hide', 'tea --brew', 'clean --room --fast']
    },
    {
      dialogue: "Desk-inte mukalil 3 empty tea glass vechirikkunnath kandilla ennu karuthiya? Athaara kazhukaan pone? Collector vannee kazhukuvo?!",
      englishTranslation: "Did you think I missed the 3 empty tea glasses sitting on your desk? Who is going to wash them? Is the District Collector coming to scrub them?!",
      stressDelta: randRange(8, 14),
      soundType: 'tongue',
      systemLogs: [
        '[SINK_AUDIT] Unwashed ceramic and glass objects detected on desk.',
        'HYGIENE_DEFCON: Level 2 warning.'
      ],
      suggestedCommands: ['wash --glass --sink', 'tea --brew', 'clean --room --fast']
    },
    {
      dialogue: "Aha, aa chair-il irunnu spinal cord valanju poyallo! Oru manushyane pole nere irikkeda! Ninte cousin Santhosh-te posture kando?",
      englishTranslation: "Your spine is curling into a pretzel in that chair! Sit up straight like a dignified human! Have you seen cousin Santhosh's posture at the bank?",
      stressDelta: randRange(4, 10),
      soundType: 'tongue',
      systemLogs: [
        '[POSTURE_MONITOR] Ergonomic slouching detected by Amma optical sensor.',
        'COMPARISON_MODULE: Santhosh (SBI) referenced.'
      ],
      suggestedCommands: ['posture --straighten', 'study --psc', 'phone --hide']
    },
    {
      dialogue: "Adukkayil kaduku pottunna manam varunnu! Gas knob aara sim aakkathe vechirikkunne? Oru thenga koodi aranjilla athinu munpe!",
      englishTranslation: "I smell mustard seeds spluttering violently! Who left the gas knob on high flame? We haven't even finished grinding the coconut yet!",
      stressDelta: randRange(10, 16),
      soundType: 'error',
      systemLogs: [
        '[OLFACTORY_ALERT] Kaduku (mustard seeds) burning threshold exceeded.',
        'GAS_STATUS: Simmer required in kitchen.'
      ],
      suggestedCommands: ['gas --sim --knob:low', 'mixie --grind --fast', 'tea --brew']
    },
    {
      dialogue: "Achan sit-out-il irunnu chalanju! Mathrubhumi newspaper thurannu vechu ninte thozhil-ine patti entho parayunnu! Poyi oru chooduvellam kodukk!",
      englishTranslation: "Achan is grumbling on the veranda! He opened the Mathrubhumi newspaper and is making pointed remarks about your employment! Go give him a glass of warm water!",
      stressDelta: randRange(8, 15),
      soundType: 'inverter',
      systemLogs: [
        '[PATERNAL_INTERCEPT] Mathrubhumi employment column being read aloud.',
        'ATMOSPHERE: Sarcastic paternal evaluation underway.'
      ],
      suggestedCommands: ['tea --serve:achan', 'study --psc', 'phone --hide']
    },
    {
      dialogue: "Veyil aari thudangi! Sit-out-le chedikalkku vellam ozhichilla enkil Rose chedi karinju pokum! Hose eduthu nanakkeda!",
      englishTranslation: "The harsh sun has died down! If you don't water the veranda potted plants, my prized rose bush will shrivel! Grab the hose and water them!",
      stressDelta: randRange(5, 11),
      soundType: 'tongue',
      systemLogs: [
        '[HORTICULTURE_DAEMON] Potted plant moisture check: CRITICAL DRY.',
        'DIRECTIVE: Water the sitout hibiscus and roses.'
      ],
      suggestedCommands: ['plants --water --hose', 'clean --room --fast', 'tea --brew']
    }
  ];

  return pick(barks);
}

// -------------------------------------------------------------
// 5. DESKTOP ACOUSTIC TOASTS (System Tray Audio Alerts)
// -------------------------------------------------------------
export function generateAcousticToast(): AcousticToastData {
  const toasts: AcousticToastData[] = [
    {
      id: `toast_cooker_${Date.now()}`,
      icon: 'cooker',
      title: 'Kitchen Sensor: Prestige Pressure Vent',
      subtitle: 'Pressure Cooker 1-whistle steam release heard in adukkala',
      soundType: 'cooker',
      systemLog: '[ACOUSTIC_PULSE] Prestige 5L Cooker pressure whistle acoustic detected.',
      stressDelta: randRange(6, 12)
    },
    {
      id: `toast_gate_${Date.now()}`,
      icon: 'gate',
      title: 'Perimeter Alert: Front Iron Gate',
      subtitle: 'Boundary squeak heard on driveway — check sitout veranda',
      soundType: 'gate',
      systemLog: '[PERIMETER_MONITOR] Iron gate creaked. Visitor approach suspected.',
      stressDelta: randRange(8, 14)
    },
    {
      id: `toast_thunder_${Date.now()}`,
      icon: 'thunder',
      title: 'Monsoon Radar: Distant Thunder',
      subtitle: 'Eastern clouds rumbling over Western Ghats foothills',
      soundType: 'thunder',
      systemLog: '[METEOROLOGY] Distant barometric rumble detected over Tharavadu roof.',
      stressDelta: randRange(10, 16)
    },
    {
      id: `toast_power_${Date.now()}`,
      icon: 'power',
      title: 'Grid Sensor: KSEB Voltage Flicker',
      subtitle: 'Line voltage dipped to 180V — inverter relay clicked once',
      soundType: 'inverter',
      systemLog: '[GRID_DIAGNOSTICS] 11kV feeder line voltage sag (180V). Inverter standby.',
      stressDelta: randRange(5, 10)
    },
    {
      id: `toast_whatsapp_${Date.now()}`,
      icon: 'whatsapp',
      title: 'Kudumbam Group: New Forward',
      subtitle: 'Sukumaran Ammavan shared 42MB devotional Suprabhatham video',
      soundType: 'chime',
      systemLog: '[BROADCAST_RECEIVER] Kudumbam WhatsApp media packet incoming (42MB).',
      stressDelta: randRange(4, 9)
    }
  ];

  return pick(toasts);
}

// -------------------------------------------------------------
// 6. PATERNAL SITOUT CRITIQUES (Achan Newspaper Events)
// -------------------------------------------------------------
export function generateAchanSitoutEvent(): AchanSitoutEvent {
  const events: AchanSitoutEvent[] = [
    {
      achanQuote: "Achan from Sit-out: 'Fan 5-il ittu karakkaan ivide ninte achan KSEB minister alla! Current bill kandu Amma-kku BP koodum!'",
      achanEnglish: "Achan yells from veranda: 'Your father isn't the electricity minister to run the ceiling fan on speed 5! The bill will spike your mother's BP!'",
      ammaResponse: "Ketto achan paranjathu?! Fan speed 2-il idu! Ninte achan paranjal mathram ivide oru manushyanu budhi varumo?!",
      ammaEnglish: "Did you hear what your father yelled?! Put the fan speed to 2! Does anyone in this house only gain sense when father shouts?!",
      stressDelta: randRange(10, 16),
      systemLogs: [
        '[PATERNAL_TRANSMISSION] Achan folded Mathrubhumi newspaper violently.',
        'POWER_AUDIT: Ceiling fan wattage questioned.'
      ],
      suggestedCommands: ['fan --speed:2', 'fan --off', 'tea --brew']
    },
    {
      achanQuote: "Achan from Sit-out: 'Mathrubhumi-yil innu KPSC Secretariat Assistant notification undu. Monu oru application അയച്ചു kodukk!'",
      achanEnglish: "Achan shouts from veranda: 'There is a Kerala PSC Secretariat Assistant notification in today's newspaper. Tell our boy to apply!'",
      ammaResponse: "Kandoda! Achan paranjathu kando? Ninte vayassulla pillere kando government joli vangi car-il pokunnu! Poyi pusthakam thurakku!",
      ammaEnglish: "Did you hear that! Other kids your age drive cars with secure government jobs! Go open that PSC syllabus right now!",
      stressDelta: randRange(12, 18),
      systemLogs: [
        '[CAREER_EVALUATION] Paternal PSC reminder registered.',
        'MORAL_GUILT: Secretariat Assistant vacancy announced.'
      ],
      suggestedCommands: ['study --psc', 'study --psc --silent', 'tea --brew']
    },
    {
      achanQuote: "Achan from Sit-out: 'Innu sambar-il uppu oru thulli kuravayirunnu. Pakshe paranjal ivide aalukalkku deshyam varum.'",
      achanEnglish: "Achan remarks to himself on veranda: 'The sambar lacked a pinch of salt today. But if I mention it, people throw kitchen tantrums.'",
      ammaResponse: "Ketto?! Uppu kuravaannu! Njan innu muthal ivide sambar vekkilla! Ninte achan valyettan-te veettil poyi thinnotte!",
      ammaEnglish: "Did you hear that?! He says the sambar has no salt! From today I refuse to cook sambar! Let your father go eat at his brother's house!",
      stressDelta: randRange(16, 24),
      systemLogs: [
        '[CULINARY_CRISIS] Paternal salt critique delivered.',
        'MATERNAL_EGO: Severely wounded. Martyr Mode threshold nearby.'
      ],
      suggestedCommands: ['praise --sambar --best-in-kerala', 'uppu --fetch --salt-cruet', 'tea --brew']
    }
  ];

  return pick(events);
}
