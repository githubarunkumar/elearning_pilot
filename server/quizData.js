// Authoritative quiz bank - kept server-side so scoring can't be gamed by reading client code.
// IDs q1..q10 match the original "Test Paper" source document, in original order.
// correctIndex is 0-based into options[]. Explanations are shown as feedback (practice checks
// show immediately; final assessment shows after submission, per the storyboard/script).
// module: which module's practice check this question belongs to (m1 or m2) - per the
// Section 6 design ("keep original 10 questions", split 4/6 across module practice checks,
// all 10 reused shuffled for the graded Final Assessment).

const QUESTIONS = [
  {
    id: 'q1',
    module: 'm2',
    text: 'What is the primary objective of the ACG emergency preparedness plan?',
    options: [
      'To replace the need for specialized external fire and medical services.',
      'To respond to emergencies for the purpose of mitigating likely illness, injury, and environmental impacts.',
      'To provide a proactive framework for annual financial auditing of safety equipment.',
      'To document the history of environmental incidents at the facility for regulatory compliance.',
    ],
    correctIndex: 1,
    explanation:
      'The plan exists to respond quickly and reduce harm to people and the environment, not to replace services, audit equipment, or keep records.',
  },
  {
    id: 'q2',
    module: 'm2',
    text: 'In the ACG Crisis Chain of Command, who is typically designated as the Incidence Coordinator?',
    options: ['The Plant Head', 'The HR and Admin Head', 'The Safety Officer', 'The Finance Head'],
    correctIndex: 0,
    explanation: 'The Plant Head holds this role and executes the emergency plan.',
  },
  {
    id: 'q3',
    module: 'm2',
    text: 'What is the specific responsibility of an Operation Coordinator during a localized emergency?',
    options: [
      'Providing final financial clearance for all emergency equipment purchases.',
      'Assisting the Incidence Coordinator in implementing the emergency plan.',
      'Managing all external communications with local medical facilities.',
      'Conducting monthly inspections of all fire hydrant systems around the premises.',
    ],
    correctIndex: 1,
    explanation:
      'Operational Coordinators support the Incidence Coordinator (Plant Head) in carrying out the plan within their area (Operations, Financial, Medical, or Safety/Security).',
  },
  {
    id: 'q4',
    module: 'm2',
    text: 'Which set of skills defines the members of the Emergency Response Team (ERT)?',
    options: [
      'Budgeting and strategic administrative planning',
      'Security guards trained exclusively in perimeter control',
      'Skilled associates trained in firefighting and administering first aid',
      'All non-essential personnel who have evacuated the building',
    ],
    correctIndex: 2,
    explanation: 'The ERT is made up of trained first-aiders and firefighters.',
  },
  {
    id: 'q5',
    module: 'm2',
    text: "Regarding the plant's public address (PA) system, where are the two speaking stations located?",
    options: [
      'The boiler room and the effluent treatment plant',
      'The factory floor and the cafeteria',
      'The medical room and the safety office',
      'Main gate and reception',
    ],
    correctIndex: 3,
    explanation: "The PA system's speaking stations are at the main gate and reception.",
  },
  {
    id: 'q6',
    module: 'm1',
    text: 'Which of the following is classified as a nonbiotic (abiotic) element of the environment?',
    options: ['Sunlight', 'Forests', 'Fisheries', 'Birds'],
    correctIndex: 0,
    explanation:
      'Abiotic (non-living) elements include things like sunlight, water, air, and land. Forests, fisheries, and birds are all living, biotic elements.',
  },
  {
    id: 'q7',
    module: 'm1',
    text: "Which item is explicitly listed as 'Hazardous Waste' in the ACG waste management guidelines?",
    options: ['Wooden garbage', 'Green vegetation', 'Spent oil', 'Food waste'],
    correctIndex: 2,
    explanation:
      'Spent oil is hazardous waste, along with ETP sludge, empty chemical containers, leftover inks, oily cotton waste, and e-waste.',
  },
  {
    id: 'q8',
    module: 'm1',
    text: "Which material is categorized as 'Non-Hazardous Waste' according to the facility's classification table?",
    options: ['Oily cotton waste', 'E-waste', 'PVC/PVDC coated materials', 'Empty chemical containers'],
    correctIndex: 2,
    explanation:
      'PVC/PVDC coated materials, lumps, and aluminum are non-hazardous, along with wooden garbage, food waste, and green vegetation.',
  },
  {
    id: 'q9',
    module: 'm2',
    text:
      'In the event of a power failure or communication system breakdown during an emergency, how should information be transmitted?',
    options: [
      'By using public address systems only.',
      'By waiting at the assembly point for verbal updates from the main gate.',
      'Through the deployment of runners or messengers.',
      'By using personal devices to contact emergency services directly.',
    ],
    correctIndex: 2,
    explanation: 'Runners and messengers are deployed if power or communications fail.',
  },
  {
    id: 'q10',
    module: 'm1',
    text: "To which localized environmental threat are 'Thermic heater and DG stacks' specifically linked?",
    options: ['Air', 'Soil', 'Water', 'Noise'],
    correctIndex: 0,
    explanation: 'Thermic heaters and DG stacks are a source of air pollution.',
  },
];

function getPublicQuestions(ids) {
  // Strips correctIndex/explanation - used when sending a question SET to the client
  // before it answers (client shouldn't receive the answer key up front).
  return ids.map((id) => {
    const q = QUESTIONS.find((x) => x.id === id);
    return { id: q.id, text: q.text, options: q.options };
  });
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Returns a shuffled question set (question order + option order randomized),
// plus an answer key map the client needs to translate its shuffled-option index
// back to the original option index when submitting.
function buildShuffledSet(ids) {
  const questions = shuffle(ids).map((id) => {
    const q = QUESTIONS.find((x) => x.id === id);
    const order = shuffle(q.options.map((_, i) => i)); // shuffled original-indices
    const options = order.map((origIdx) => q.options[origIdx]);
    return { id: q.id, text: q.text, options, optionOrder: order };
  });
  return questions;
}

function scoreAnswers(answers) {
  // answers: [{ id, selectedOriginalIndex }]
  let score = 0;
  const detail = answers.map((a) => {
    const q = QUESTIONS.find((x) => x.id === a.id);
    const correct = q && q.correctIndex === a.selectedOriginalIndex;
    if (correct) score += 1;
    return {
      id: a.id,
      correct: !!correct,
      correctIndex: q ? q.correctIndex : null,
      explanation: q ? q.explanation : null,
    };
  });
  return { score, total: answers.length, detail };
}

module.exports = { QUESTIONS, getPublicQuestions, buildShuffledSet, scoreAnswers, shuffle };
