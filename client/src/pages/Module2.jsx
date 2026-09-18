import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLearner } from '../LearnerContext.jsx';
import Shell from '../components/Shell.jsx';
import ReadAloud from '../components/ReadAloud.jsx';
import {
  ScenarioGallery,
  OrgChart,
  SequenceBuilder,
  BranchingChoice,
  CycleDiagram,
  ContactDirectory,
  FirstAidPrompts,
} from '../components/Interactive.jsx';
import { PracticeQuiz } from '../components/Quiz.jsx';

const TOTAL = 8; // 7 content screens + practice check

function Nav({ children }) {
  return <div className="btn-row">{children}</div>;
}

export function M2S1() {
  const { content, markProgress } = useLearner();
  const navigate = useNavigate();
  const t = content.m2s1;
  useEffect(() => { markProgress('m2s1', 'module2'); }, [markProgress]);
  return (
    <Shell moduleLabel={2} current={1} total={TOTAL}>
      <h1 className="screen-title">{t.title}</h1>
      <ReadAloud text={t.narration} />
      <div className="callout"><strong>{t.definitionLabel}:</strong> {t.definition}</div>
      <ScenarioGallery cards={t.cards} />
      <Nav>
        <button className="btn" onClick={() => navigate('/module2/2')}>{t.button}</button>
      </Nav>
    </Shell>
  );
}

export function M2S2() {
  const { content, markProgress } = useLearner();
  const navigate = useNavigate();
  const t = content.m2s2;
  useEffect(() => { markProgress('m2s2', 'module2'); }, [markProgress]);
  return (
    <Shell moduleLabel={2} current={2} total={TOTAL}>
      <h1 className="screen-title">{t.title}</h1>
      <ReadAloud text={t.narration} />
      <OrgChart roles={t.roles} />
      <div className="panel">
        <p><strong>{t.essentialLabel}:</strong> {t.essentialText}</p>
        <p><strong>{t.nonEssentialLabel}:</strong> {t.nonEssentialText}</p>
      </div>
      <Nav>
        <button className="btn secondary" onClick={() => navigate('/module2/1')}>{content.ui.backBtn}</button>
        <button className="btn" onClick={() => navigate('/module2/3')}>{content.ui.continueBtn}</button>
      </Nav>
    </Shell>
  );
}

export function M2S3() {
  const { content, markProgress } = useLearner();
  const navigate = useNavigate();
  const t = content.m2s3;
  useEffect(() => { markProgress('m2s3', 'module2'); }, [markProgress]);
  return (
    <Shell moduleLabel={2} current={3} total={TOTAL}>
      <h1 className="screen-title">{t.title}</h1>
      <ReadAloud text={t.narration} />
      <SequenceBuilder steps={t.steps} checkLabel={t.checkBtn} resetLabel={t.resetBtn} correctMsg={t.correctOrderMsg} />
      <p className="callout">{t.callout}</p>
      <Nav>
        <button className="btn secondary" onClick={() => navigate('/module2/2')}>{content.ui.backBtn}</button>
        <button className="btn" onClick={() => navigate('/module2/4')}>{t.button}</button>
      </Nav>
    </Shell>
  );
}

export function M2S4() {
  const { content, markProgress } = useLearner();
  const navigate = useNavigate();
  const t = content.m2s4;
  useEffect(() => { markProgress('m2s4', 'module2'); }, [markProgress]);
  return (
    <Shell moduleLabel={2} current={4} total={TOTAL}>
      <h1 className="screen-title">{t.title}</h1>
      <ReadAloud text={t.narration} />
      <div className="panel">
        <p><strong>{t.locationLabel}</strong> {t.location}</p>
        <p><strong>{t.protocolLabel}</strong> {t.protocol}</p>
      </div>
      <BranchingChoice
        question={t.scenarioQ}
        essentialLabel={t.essentialBtn}
        nonEssentialLabel={t.nonEssentialBtn}
        essentialOutcome={t.essentialOutcome}
        nonEssentialOutcome={t.nonEssentialOutcome}
        tryOtherLabel={t.tryOtherPath}
      />
      <Nav>
        <button className="btn secondary" onClick={() => navigate('/module2/3')}>{content.ui.backBtn}</button>
        <button className="btn" onClick={() => navigate('/module2/5')}>{t.button}</button>
      </Nav>
    </Shell>
  );
}

export function M2S5() {
  const { content, markProgress } = useLearner();
  const navigate = useNavigate();
  const t = content.m2s5;
  useEffect(() => { markProgress('m2s5', 'module2'); }, [markProgress]);
  return (
    <Shell moduleLabel={2} current={5} total={TOTAL}>
      <h1 className="screen-title">{t.title}</h1>
      <ReadAloud text={t.narration} />
      <CycleDiagram steps={t.steps} />
      <Nav>
        <button className="btn secondary" onClick={() => navigate('/module2/4')}>{content.ui.backBtn}</button>
        <button className="btn" onClick={() => navigate('/module2/6')}>{t.button}</button>
      </Nav>
    </Shell>
  );
}

export function M2S6() {
  const { content, markProgress } = useLearner();
  const navigate = useNavigate();
  const t = content.m2s6;
  useEffect(() => { markProgress('m2s6', 'module2'); }, [markProgress]);
  return (
    <Shell moduleLabel={2} current={6} total={TOTAL}>
      <h1 className="screen-title">{t.title}</h1>
      <ReadAloud text={t.narration} />
      <p>{t.body}</p>
      <ContactDirectory categories={t.categories} note={t.note} />
      <Nav>
        <button className="btn secondary" onClick={() => navigate('/module2/5')}>{content.ui.backBtn}</button>
        <button className="btn" onClick={() => navigate('/module2/7')}>{t.button}</button>
      </Nav>
    </Shell>
  );
}

export function M2S7() {
  const { content, markProgress } = useLearner();
  const navigate = useNavigate();
  const t = content.m2s7;
  useEffect(() => { markProgress('m2s7', 'module2'); }, [markProgress]);
  return (
    <Shell moduleLabel={2} current={7} total={TOTAL}>
      <h1 className="screen-title">{t.title}</h1>
      <ReadAloud text={t.narration} />
      <FirstAidPrompts scenarios={t.scenarios} prompt={t.prompt} />
      <Nav>
        <button className="btn secondary" onClick={() => navigate('/module2/6')}>{content.ui.backBtn}</button>
        <button className="btn" onClick={() => navigate('/module2/practice')}>{t.button}</button>
      </Nav>
    </Shell>
  );
}

export function M2Practice() {
  const { content, markProgress } = useLearner();
  const navigate = useNavigate();
  const t = content.m2kc;
  useEffect(() => { markProgress('m2kc', 'module2'); }, [markProgress]);
  return (
    <Shell moduleLabel={2} current={8} total={TOTAL}>
      <h1 className="screen-title">{t.title}</h1>
      <p>{t.intro}</p>
      <PracticeQuiz module="m2" buttonLabel={t.button} onDone={() => navigate('/assessment')} />
    </Shell>
  );
}
