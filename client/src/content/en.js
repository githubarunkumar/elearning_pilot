// English content - master copy. Kept as structured data, separate from component
// logic/rendering, so translations (hi.js, mr.js) are drop-in replacements and future
// content edits don't require touching component code.
export default {
  code: 'en',
  label: 'English',
  speechLang: 'en-US',

  ui: {
    continueBtn: 'Continue',
    backBtn: 'Back',
    startBtn: 'Start',
    languageLabel: 'Language',
    progress: (mod, cur, total) => `Module ${mod} · Screen ${cur} of ${total}`,
    practiceDisclaimer: "Practice only — doesn't affect your final score.",
    readAloud: 'Read aloud',
  },

  intake: {
    heading: 'Welcome to the ACG Safety & Environmental Awareness training.',
    sub: 'Please enter your details to begin.',
    empId: 'Employee ID',
    name: 'Full Name',
    email: 'Email ID',
    language: 'Language',
    startBtn: 'Start',
    errRequired: 'This field is required.',
    errEmail: 'Please enter a valid email address.',
    resumeNotice: 'Welcome back — we found your existing progress and picked up where you left off.',
  },

  welcome: {
    title: 'Emergency Preparedness & Environmental Awareness',
    subtitle: 'The ACG Guidelines for a Safe and Sustainable Workplace',
    narration:
      "Welcome. This course covers two things every associate needs to know: how to protect our environment every day, and how to respond if an emergency happens. It's in two short modules, each with a quick practice check, followed by one final assessment. Let's get started.",
    body: 'This course has two modules and a final assessment. You can pause and resume anytime. Estimated time: 20–25 minutes.',
    button: 'Start Course',
  },

  objectives: {
    title: 'Learning Objectives',
    narration:
      "By the end of this course, you'll be able to identify environmental risks at the plant and sort waste correctly. You'll also know exactly what to do in an emergency — who's in charge, how to reach the assembly point, and how to give first aid. Let's begin with Module 1.",
    module1Title: 'Module 1 — Environmental Awareness, you will be able to:',
    module1: [
      'Explain what "environment" and "pollution" mean at ACG',
      "Identify the plant's air, water, soil, and noise risks",
      'Correctly sort hazardous and non-hazardous waste',
      'Apply everyday sustainability practices',
    ],
    module2Title: 'Module 2 — Emergency Preparedness, you will be able to:',
    module2: [
      'Recognize what qualifies as an emergency situation',
      "Identify who's responsible for what during a crisis",
      'Follow the 7-step emergency sequence',
      'Find the assembly point and know your evacuation role',
      'Apply the Preparedness Loop',
      'Use the internal communication network and emergency contacts',
      'Give correct first aid for common scenarios',
    ],
    button: 'Continue',
  },

  m1s1: {
    title: 'What is Environment & Pollution?',
    narration:
      "Let's start with the basics. Our environment is made up of living things — people, plants, animals — and non-living things, like water, air, and land. Pollution is anything that harms that balance. Everything you'll learn in this module is about protecting that balance, every single day.",
    envLabel: 'Environment:',
    envText: 'Living (biotic: humans, plants) and non-living (abiotic: water, air, land) elements.',
    polLabel: 'Pollution:',
    polText: 'Any substance that negatively impacts this ecosystem.',
    bioticLabel: 'Biotic',
    bioticText: 'Living things — people, plants, animals.',
    abioticLabel: 'Abiotic',
    abioticText: 'Non-living things — water, air, land, and more.',
    button: 'Continue',
  },

  m1s2: {
    title: 'Localized Environmental Threats',
    narration:
      'At our plant, environmental risk shows up in four places: air, water, soil, and noise. Tap each one to see exactly what causes it here.',
    categories: [
      { key: 'air', label: 'Air', detail: 'Thermic heater and DG stacks' },
      { key: 'water', label: 'Water', detail: 'Chemical spills, process waste' },
      {
        key: 'soil',
        label: 'Soil',
        detail: 'Food/horticultural waste, bio-medical waste, general PPE waste (hair caps, gloves, shoe covers)',
      },
      { key: 'noise', label: 'Noise', detail: 'Operational noise' },
    ],
    button: 'Continue',
  },

  m1s3: {
    title: 'Sort the Waste: Hazardous or Non-Hazardous?',
    narration:
      "Not all waste is equal. Some of it is hazardous and needs special handling. Let's sort it correctly — tap each item, then tap the correct bin.",
    hazardousLabel: 'Hazardous',
    nonHazardousLabel: 'Non-Hazardous',
    items: [
      { id: 'adhesive', label: 'Leftover adhesive (CFB/Lamination)', category: 'hazardous' },
      { id: 'etp', label: 'ETP sludge', category: 'hazardous' },
      { id: 'oil', label: 'Spent oil', category: 'hazardous' },
      { id: 'containers', label: 'Empty chemical containers', category: 'hazardous' },
      { id: 'inks', label: 'Leftover inks', category: 'hazardous' },
      { id: 'cotton', label: 'Oily cotton waste', category: 'hazardous' },
      { id: 'ewaste', label: 'E-waste', category: 'hazardous' },
      { id: 'pvc', label: 'PVC/PVDC coated materials/lumps/aluminum', category: 'nonhazardous' },
      { id: 'wood', label: 'Wooden garbage', category: 'nonhazardous' },
      { id: 'food', label: 'Food waste', category: 'nonhazardous' },
      { id: 'greens', label: 'Green vegetation', category: 'nonhazardous' },
    ],
    disposalNote: 'Authorized disposal path for all waste: Facility → Recycler → Reprocessor.',
    correctMsg: 'Correct.',
    incorrectMsg: (item, category) => `Not quite — ${item} is ${category}. Try again.`,
    button: 'Continue',
  },

  m1s4: {
    title: 'Everyday Sustainability Standards',
    narration:
      "Good environmental practice isn't complicated — it's a handful of habits, done consistently. Here's what to do, and what never to do.",
    doLabel: 'Do',
    doItems: [
      'Conserve critical energy (water, electricity, fuel)',
      'Use exact designated bins for all waste types',
      'Keep dry and wet waste strictly separated before disposal',
    ],
    dontLabel: "Don't",
    dontItems: [
      'No throwing plastic into the environment',
      'Avoid the use of plastic bags entirely',
      'Zero tolerance for actions contributing to river pollution',
      'No food waste',
    ],
    scenarioQ: "You see plastic packaging near a drain. What's the right action?",
    scenarioOptions: [
      { text: 'Pick it up and dispose of it in the designated bin', correct: true },
      { text: 'Leave it — not my responsibility', correct: false },
      { text: 'Push it further away from the drain', correct: false },
    ],
    scenarioFeedbackCorrect: "Right — we have zero tolerance for anything that could contribute to river pollution.",
    scenarioFeedbackIncorrect: 'Not quite — remember, zero tolerance applies to anything that could pollute the river. Always dispose of it properly.',
    button: 'Continue',
  },

  m1kc: {
    title: 'Module 1 Practice Check',
    intro: "Quick practice — this won't affect your final score, and you can try as many times as you like.",
    button: 'Continue to Module 2',
  },

  m2s1: {
    title: 'What Counts as an Emergency?',
    narration:
      'Not every incident is a full emergency — but you need to recognize the ones that are. An emergency situation means potential loss of life, ten or more injuries inside the plant, one or more injuries outside it, a toxic release, or damage serious enough to stop the process. Here are five examples.',
    definitionLabel: 'Emergency Situation',
    definition:
      'An incident involving potential loss of life, 10+ injuries inside, 1+ injuries outside, toxic release, or damage leading to process stoppage.',
    cards: [
      { key: 'fire', label: 'Fire/Explosion', desc: 'Uncontrolled fire or explosion within the facility.' },
      { key: 'electrocution', label: 'Electrocution', desc: 'Electrical shock incident involving equipment or wiring.' },
      { key: 'spillage', label: 'Accidental Spillage', desc: 'Uncontrolled release of a chemical or hazardous liquid.' },
      { key: 'pressure', label: 'Bursting of Pressure Vessel', desc: 'Rupture of a pressurized tank or vessel.' },
      { key: 'etp', label: 'ETP/STP Malfunctioning', desc: 'Failure of effluent/sewage treatment systems.' },
    ],
    button: 'Continue',
  },

  m2s2: {
    title: 'Crisis Chain of Command',
    narration:
      'When an emergency is declared, everyone has a defined role. The Plant Head is the Incidence Coordinator and executes the plan. Four Operational Coordinators support them — for Operations, Finance, Medical, and Safety. Below them, the Emergency Response Team — our trained first-aiders and firefighters — carries out the response on the ground. Tap each role to see exactly what they\'re responsible for.',
    roles: [
      { role: 'Incidence Coordinator', who: 'Plant Head', resp: 'Executes the emergency plan' },
      {
        role: 'Operational Coordinator — Operation/Site',
        who: 'Production Manager / Shift In-charge',
        resp: 'Assists the Incidence Coordinator in implementing the plan, for site/operations matters',
      },
      {
        role: 'Operational Coordinator — Financial',
        who: 'Finance Head',
        resp: 'Assists the Incidence Coordinator in implementing the plan, for financial matters',
      },
      {
        role: 'Operational Coordinator — Medical',
        who: 'HR & Admin Head',
        resp: 'Assists the Incidence Coordinator in implementing the plan, for medical/welfare matters',
      },
      {
        role: 'Operational Coordinator — Safety/Security',
        who: 'Safety Officer',
        resp: 'Assists the Incidence Coordinator in implementing the plan, for safety/security matters',
      },
      {
        role: 'Emergency Response Team (ERT)',
        who: 'Trained associates',
        resp: 'Trained first-aiders and firefighters who act on the ground',
      },
    ],
    essentialLabel: 'Essential Persons',
    essentialText: 'Directly involved in operation/rescue — they stay.',
    nonEssentialLabel: 'Non-Essential Persons',
    nonEssentialText: 'Must evacuate; may act as a reserve force.',
    button: 'Continue',
  },

  m2s3: {
    title: 'The Emergency Sequence',
    narration:
      "Every emergency follows the same seven steps, in order. First, report the incident. Then take a head count. Declare the emergency and sound the alarm. Walk fast — don't run — to the assembly point. Coordinate communication. Mobilize the Emergency Response Team for firefighting and rescue. And finally, the All Clear is declared — an uninterrupted siren, blown continuously for fifteen seconds. Let's put these in order.",
    steps: [
      'Report Incidence',
      'Head Count',
      'Declare Emergency & Alarm',
      'Walk Fast to Assembly Point',
      'Communication & Coordination',
      'Mobilize ERT (firefighting & rescue)',
      'All Clear Declared',
    ],
    callout: 'The All Clear signal is an uninterrupted siren, blown continuously for 15 seconds.',
    checkBtn: 'Check Order',
    resetBtn: 'Reset',
    correctOrderMsg: "That's correct — well done!",
    button: 'Continue',
  },

  m2s4: {
    title: 'The Assembly Point',
    narration:
      "Know your assembly point before you ever need it. Ours is the garden area in front of the canteen. If you're a non-essential person, that's where you gather — calmly, and away from the scene.",
    locationLabel: 'Location:',
    location: 'Garden area in front of the canteen.',
    protocolLabel: 'Protocol:',
    protocol: 'All non-essential persons gather here, safely away from the scene.',
    scenarioQ: 'The siren sounds. Are you an essential or non-essential person right now?',
    essentialBtn: 'Essential',
    nonEssentialBtn: 'Non-essential',
    essentialOutcome: 'Stay and support the operation/rescue as directed by your coordinator.',
    nonEssentialOutcome:
      'Walk fast to the Assembly Point — the garden area in front of the canteen — and wait for further instructions.',
    tryOtherPath: 'See the other path',
    button: 'Continue',
  },

  m2s5: {
    title: 'The Preparedness Loop',
    narration:
      "Being ready for an emergency isn't a one-time thing — it's a loop we run continuously. The Safety Head conducts checks. A dedicated observer records what they see. The EHS department logs it. And where something's not right, we fix it with preventive action. Then the loop starts again.",
    steps: [
      { label: 'Conduct', who: 'Safety Head' },
      { label: 'Observe', who: 'Dedicated observer records data' },
      { label: 'Record', who: 'Logged by EHS Department' },
      { label: 'Fix', who: 'Implement preventive actions for any negative observations' },
    ],
    button: 'Continue',
  },

  m2s6: {
    title: 'Internal Communication Network',
    narration:
      'During an emergency, information has to travel fast and reliably. Our PA system covers four zones, with speaking stations at the main gate and reception. If power or the communication system fails, we fall back on runners and messengers. Here\'s exactly who to contact.',
    body: '4-zone PA system (stations at main gate & reception) for specific or plant-wide announcements. Runners/messengers used if power fails.',
    categories: { security: 'Security Contacts', fire: 'Fire Services', medical: 'Medical Services' },
    note: '(Contact numbers are maintained by HR and may be updated from the admin panel — confirm current accuracy before relying on them in a real emergency.)',
    button: 'Continue',
  },

  m2s7: {
    title: 'First Aid Interventions',
    narration:
      "Basic first aid can make the difference in the first few minutes of an emergency. Let's walk through six common scenarios — pay close attention to what you should never do.",
    prompt: 'What would you do?',
    scenarios: [
      {
        situation: 'Unconscious Victim',
        options: ['Give them water to drink', 'Keep the airway clear and call for help', 'Shake them vigorously to wake them'],
        correctIndex: 1,
        warning: 'Do NOT give anything to drink.',
      },
      {
        situation: 'Eye Contaminant',
        options: ['Rub the eyes to remove it', 'Wash with flowing water', 'Wait for it to clear on its own'],
        correctIndex: 1,
        warning: 'Do NOT rub the eyes.',
      },
      {
        situation: 'Burn Injury',
        options: [
          'Hold under running tap water 10+ minutes, apply antiseptic, cover, seek a doctor',
          'Apply ice directly to the burn',
          'Apply butter or oil to the burn',
        ],
        correctIndex: 0,
        warning: null,
      },
      {
        situation: 'Choking/Poison',
        options: ['Induce vomiting immediately', 'Seek urgent medical help immediately', 'Give them something to eat'],
        correctIndex: 1,
        warning: 'Do NOT induce vomiting on your own.',
      },
      {
        situation: 'Snake Bite',
        options: [
          'Clean the wound, identify the snake, move to hospital for anti-venom, reassure the victim',
          'Cut the wound and suck out the venom',
          'Apply a very tight tourniquet above the bite and wait',
        ],
        correctIndex: 0,
        warning: "Move fast — don't wait.",
      },
      {
        situation: 'Fracture',
        options: ['Move the person immediately to a chair', 'Use splints and a stretcher before moving the victim', 'Try to straighten the limb'],
        correctIndex: 1,
        warning: "Don't move the person without support.",
      },
    ],
    button: 'Continue',
  },

  m2kc: {
    title: 'Module 2 Practice Check',
    intro: 'One more quick practice round before the final assessment.',
    button: 'Continue to Final Assessment',
  },

  faS1: {
    title: 'Final Assessment',
    narration:
      "This is the graded final assessment. All ten questions, shuffled — including the order of the answer choices. Your organization has set the passing score, number of attempts, and wait time between retakes; you'll see those details below. Take your time and good luck.",
    passLabel: 'Passing score:',
    attemptsLabel: 'Attempts allowed:',
    cooldownLabel: 'Retake wait time:',
    attemptsRemainingLabel: 'Attempts remaining:',
    button: 'Begin Assessment',
    notEligibleAlreadyPassed: 'You have already passed this assessment. Nice work!',
    notEligibleExhausted:
      'You have used all your allowed attempts. Please contact your training administrator to continue.',
    notEligibleCooldown: (retryAt) => `You can retake the assessment after ${retryAt}.`,
    goToCompletion: 'View Completion',
  },

  faS2: {
    title: 'Final Assessment',
    questionLabel: (i, total) => `Question ${i} of ${total}`,
    nextBtn: 'Next',
    backBtn: 'Back',
    submitBtn: 'Submit Assessment',
    reviewTitle: 'Review your answers',
    unansweredWarning: 'Please answer all questions before submitting.',
  },

  faS3: {
    passTitle: 'Congratulations!',
    passMsg: (score) => `You've passed the Final Assessment with a score of ${score}%. Your completion has been recorded.`,
    failTitle: 'Not quite there yet',
    failMsg: (score, passScore) => `You scored ${score}%, which is below the passing score of ${passScore}%.`,
    attemptsRemaining: (n) => `You have ${n} attempt(s) remaining.`,
    cooldownMsg: (time) => `You can retake the assessment on ${time}.`,
    exhaustedMsg: 'Please contact your training administrator to continue.',
    reviewLabel: 'Review answers',
    continueBtn: 'Continue',
    retryBtn: 'Try Again',
  },

  faS4: {
    title: 'Well done. You have completed the Environmental Awareness and Emergency Preparedness training.',
    narration:
      "Well done. You've completed the Environmental Awareness and Emergency Preparedness training. Thank you for helping keep our workplace safe and sustainable.",
    tagline: 'Know your environment. Know your risks. Know your assembly point.',
    downloadBtn: 'Download Completion Record',
  },
};
