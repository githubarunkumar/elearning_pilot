import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLearner } from '../LearnerContext.jsx';
import Shell from '../components/Shell.jsx';
import ReadAloud from '../components/ReadAloud.jsx';
import { FlipCards, HotspotGroup, WasteSorter, ScenarioCheck } from '../components/Interactive.jsx';
import { PracticeQuiz } from '../components/Quiz.jsx';

const TOTAL = 5; // 4 content screens + practice check

function Nav({ children }) {
  return <div className="btn-row">{children}</div>;
}

export function M1S1() {
  const { content, markProgress } = useLearner();
  const navigate = useNavigate();
  const t = content.m1s1;
  useEffect(() => { markProgress('m1s1', 'module1'); }, [markProgress]);
  return (
    <Shell moduleLabel={1} current={1} total={TOTAL}>
      <h1 className="screen-title">{t.title}</h1>
      <ReadAloud text={t.narration} />
      <div className="panel">
        <p><strong>{t.envLabel}</strong> {t.envText}</p>
        <p><strong>{t.polLabel}</strong> {t.polText}</p>
      </div>
      <FlipCards cards={[{ label: t.bioticLabel, text: t.bioticText }, { label: t.abioticLabel, text: t.abioticText }]} />
      <Nav>
        <button className="btn" onClick={() => navigate('/module1/2')}>{t.button}</button>
      </Nav>
    </Shell>
  );
}

export function M1S2() {
  const { content, markProgress } = useLearner();
  const navigate = useNavigate();
  const t = content.m1s2;
  useEffect(() => { markProgress('m1s2', 'module1'); }, [markProgress]);
  return (
    <Shell moduleLabel={1} current={2} total={TOTAL}>
      <h1 className="screen-title">{t.title}</h1>
      <ReadAloud text={t.narration} />
      <HotspotGroup categories={t.categories} />
      <Nav>
        <button className="btn secondary" onClick={() => navigate('/module1/1')}>{content.ui.backBtn}</button>
        <button className="btn" onClick={() => navigate('/module1/3')}>{content.ui.continueBtn}</button>
      </Nav>
    </Shell>
  );
}

export function M1S3() {
  const { content, markProgress } = useLearner();
  const navigate = useNavigate();
  const t = content.m1s3;
  const [done, setDone] = useState(false);
  useEffect(() => { markProgress('m1s3', 'module1'); }, [markProgress]);
  return (
    <Shell moduleLabel={1} current={3} total={TOTAL}>
      <h1 className="screen-title">{t.title}</h1>
      <ReadAloud text={t.narration} />
      <WasteSorter
        items={t.items}
        labels={t}
        disposalNote={t.disposalNote}
        correctMsg={t.correctMsg}
        incorrectMsg={t.incorrectMsg}
        onAllSorted={() => setDone(true)}
      />
      <Nav>
        <button className="btn secondary" onClick={() => navigate('/module1/2')}>{content.ui.backBtn}</button>
        <button className="btn" disabled={!done} onClick={() => navigate('/module1/4')}>{t.button}</button>
      </Nav>
    </Shell>
  );
}

export function M1S4() {
  const { content, markProgress } = useLearner();
  const navigate = useNavigate();
  const t = content.m1s4;
  const [answered, setAnswered] = useState(false);
  useEffect(() => { markProgress('m1s4', 'module1'); }, [markProgress]);
  return (
    <Shell moduleLabel={1} current={4} total={TOTAL}>
      <h1 className="screen-title">{t.title}</h1>
      <ReadAloud text={t.narration} />
      <div className="do-dont-grid">
        <div className="do-col">
          <h4>{t.doLabel}</h4>
          <ul>{t.doItems.map((d, i) => <li key={i}>{d}</li>)}</ul>
        </div>
        <div className="dont-col">
          <h4>{t.dontLabel}</h4>
          <ul>{t.dontItems.map((d, i) => <li key={i}>{d}</li>)}</ul>
        </div>
      </div>
      <ScenarioCheck
        question={t.scenarioQ}
        options={t.scenarioOptions}
        onAnswered={() => setAnswered(true)}
        correctText={t.scenarioFeedbackCorrect}
        incorrectText={t.scenarioFeedbackIncorrect}
      />
      <Nav>
        <button className="btn secondary" onClick={() => navigate('/module1/3')}>{content.ui.backBtn}</button>
        <button className="btn" disabled={!answered} onClick={() => navigate('/module1/practice')}>{t.button}</button>
      </Nav>
    </Shell>
  );
}

export function M1Practice() {
  const { content, markProgress } = useLearner();
  const navigate = useNavigate();
  const t = content.m1kc;
  useEffect(() => { markProgress('m1kc', 'module1'); }, [markProgress]);
  return (
    <Shell moduleLabel={1} current={5} total={TOTAL}>
      <h1 className="screen-title">{t.title}</h1>
      <p>{t.intro}</p>
      <PracticeQuiz module="m1" buttonLabel={t.button} onDone={() => navigate('/module2/1')} />
    </Shell>
  );
}
