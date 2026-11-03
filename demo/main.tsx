import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useFormikContext, type FormikProps } from 'formik';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCheck,
  CircleHelp,
  Command,
  Compass,
  Layers3,
  LockKeyhole,
  Sparkles,
  UsersRound,
  Workflow as WorkflowIcon,
} from 'lucide-react';
import {
  CurrentStep,
  FormWorkflow,
  andSplit,
  orSplit,
  step,
  useFormWorkflow,
  type StepProps,
  type WorkflowNode,
} from 'form-workflow';
import './styles.css';

interface DemoValues {
  name: string;
  email: string;
  teamSize: 'just-me' | 'small-team' | 'growing-team';
  teamName: string;
  goal: string;
  timeline: string;
}

interface ProfileCheck {
  team: boolean;
  seats: number;
}

const initialValues: DemoValues = {
  name: '',
  email: '',
  teamSize: 'just-me',
  teamName: '',
  goal: '',
  timeline: 'This month',
};

function waitForCheck(signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(resolve, 650);
    signal.addEventListener('abort', () => {
      window.clearTimeout(timeout);
      reject(new DOMException('Check cancelled', 'AbortError'));
    }, { once: true });
  });
}

function ProfileStep({ formik }: StepProps<DemoValues>) {
  return (
    <div className="step-content">
      <div className="step-kicker"><span>01</span><span>Start with the basics</span></div>
      <h2>Make it yours.</h2>
      <p className="step-description">A little context helps us set up the right workflow for you.</p>
      <TextField formik={formik} name="name" label="Your name" placeholder="Alex Morgan" autoComplete="name" />
      <TextField formik={formik} name="email" label="Work email" placeholder="alex@company.com" type="email" autoComplete="email" />
      <fieldset className="choice-fieldset">
        <legend>Who are you setting this up for?</legend>
        <div className="choice-grid">
          <ChoiceButton selected={formik.values.teamSize === 'just-me'} onClick={() => void formik.setFieldValue('teamSize', 'just-me')} icon={<Compass size={18} />} title="Just me" detail="A personal workspace" />
          <ChoiceButton selected={formik.values.teamSize !== 'just-me'} onClick={() => void formik.setFieldValue('teamSize', 'small-team')} icon={<UsersRound size={18} />} title="A team" detail="A shared workspace" />
        </div>
      </fieldset>
    </div>
  );
}

function TeamStep({ formik }: StepProps<DemoValues>) {
  return (
    <div className="step-content">
      <div className="step-kicker"><span>02</span><span>For the whole crew</span></div>
      <h2>Bring your team in.</h2>
      <p className="step-description">We’ll shape a shared space around the people you work with.</p>
      <TextField formik={formik} name="teamName" label="Team or workspace name" placeholder="Northstar Studio" autoComplete="organization" />
      <div className="inline-note"><UsersRound size={17} /><span>Your invite flow will be ready as soon as your workspace is created.</span></div>
      <p className="fine-print"><LockKeyhole size={13} /> You can invite people after setup.</p>
    </div>
  );
}

function PersonalStep() {
  return (
    <div className="step-content">
      <div className="step-kicker"><span>02</span><span>A space of your own</span></div>
      <h2>Room to focus.</h2>
      <p className="step-description">Your personal workspace is ready to keep projects, forms, and next steps in one place.</p>
      <div className="personal-preview">
        <span className="preview-symbol"><Sparkles size={20} /></span>
        <div><strong>One calm place to begin</strong><p>We’ll keep your setup light. You can add collaborators whenever you’re ready.</p></div>
      </div>
      <p className="fine-print"><LockKeyhole size={13} /> Your workspace starts private.</p>
    </div>
  );
}

const goals = ['Launch something new', 'Streamline team operations', 'Make a better customer experience', 'Explore what is possible'];

function GoalsStep({ formik }: StepProps<DemoValues>) {
  return (
    <div className="step-content">
      <div className="step-kicker"><span>03</span><span>Point us in a direction</span></div>
      <h2>What’s on your horizon?</h2>
      <p className="step-description">Pick the closest fit. You can change course whenever you like.</p>
      <div className="goal-list">
        {goals.map((goal, index) => (
          <button className={`goal-option${formik.values.goal === goal ? ' selected' : ''}`} type="button" key={goal} onClick={() => void formik.setFieldValue('goal', goal)}>
            <span className="goal-number">0{index + 1}</span><span>{goal}</span><span className="goal-check">{formik.values.goal === goal && <Check size={15} />}</span>
          </button>
        ))}
      </div>
      {formik.touched.goal && formik.errors.goal && <p className="field-error">{formik.errors.goal}</p>}
      <div className="timeline-row">
        <label htmlFor="timeline">When are you hoping to get started?</label>
        <select id="timeline" name="timeline" value={formik.values.timeline} onChange={formik.handleChange}>
          <option>This week</option><option>This month</option><option>Just exploring</option>
        </select>
      </div>
    </div>
  );
}

const nodes: WorkflowNode<DemoValues>[] = [
  step<DemoValues>({
    id: 'profile',
    title: 'Your details',
    component: ProfileStep,
    validate: (values) => {
      const errors: Partial<Record<keyof DemoValues, string>> = {};
      if (!values.name.trim()) errors.name = 'Add your name to continue.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Enter a valid work email.';
      return errors;
    },
    execute: async ({ values, signal }) => {
      await waitForCheck(signal);
      const team = values.teamSize !== 'just-me';
      return { team, seats: values.teamSize === 'growing-team' ? 12 : team ? 4 : 1 } satisfies ProfileCheck;
    },
  }),
  orSplit<DemoValues>('workspace-route', [
    {
      id: 'team-workspace',
      when: (_, results) => (results.profile as ProfileCheck | undefined)?.team === true,
      nodes: [step<DemoValues>({
        id: 'team-setup',
        title: 'Your team',
        component: TeamStep,
        validate: (values) => values.teamName.trim() ? {} : { teamName: 'Give your workspace a name.' },
      })],
    },
    {
      id: 'personal-workspace',
      when: (_, results) => (results.profile as ProfileCheck | undefined)?.team === false,
      nodes: [step<DemoValues>({ id: 'personal-setup', title: 'Your space', component: PersonalStep })],
    },
  ]),
  andSplit<DemoValues>('finish-setup', [{
    id: 'shared-finish',
    nodes: [step<DemoValues>({
      id: 'goals',
      title: 'Your first focus',
      component: GoalsStep,
      validate: (values) => values.goal ? {} : { goal: 'Choose a focus to finish setup.' },
    })],
  }]),
];

function TextField({ formik, name, label, placeholder, type = 'text', autoComplete }: {
  formik: FormikProps<DemoValues>;
  name: 'name' | 'email' | 'teamName';
  label: string;
  placeholder: string;
  type?: string;
  autoComplete?: string;
}) {
  const error = formik.touched[name] && formik.errors[name];
  return (
    <div className="field-group">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} autoComplete={autoComplete} placeholder={placeholder} value={formik.values[name]} onChange={formik.handleChange} onBlur={formik.handleBlur} aria-invalid={Boolean(error)} />
      {typeof error === 'string' && <p className="field-error">{error}</p>}
    </div>
  );
}

function ChoiceButton({ selected, onClick, icon, title, detail }: { selected: boolean; onClick: () => void; icon: React.ReactNode; title: string; detail: string }) {
  return (
    <button className={`choice-button${selected ? ' selected' : ''}`} type="button" aria-pressed={selected} onClick={onClick}>
      <span className="choice-icon">{icon}</span><span className="choice-copy"><strong>{title}</strong><small>{detail}</small></span><span className="choice-radio" />
    </button>
  );
}

function WorkflowPanel() {
  const workflow = useFormWorkflow<DemoValues>();
  const formik = useFormikContext<DemoValues>();
  const { path, currentIndex, currentStep, isFirstStep, isLastStep, isExecuting, isSubmitting, back, goTo } = workflow;
  const conditionalStep = path.find((item) => item.id === 'team-setup' || item.id === 'personal-setup');
  const allStepTitles = [path[0]?.title, conditionalStep?.title, path[path.length - 1]?.title].filter(Boolean);
  const progress = Math.round(((currentIndex + 1) / path.length) * 100);

  return (
    <div className="workspace-grid">
      <aside className="workflow-rail">
        <div className="rail-heading"><span>YOUR SETUP</span><span className="live-dot" /> <span className="live-label">IN PROGRESS</span></div>
        <ol className="rail-steps">
          {allStepTitles.map((title, index) => {
            const routeIndex = path.findIndex((item) => item.title === title);
            const active = routeIndex === currentIndex;
            const complete = routeIndex >= 0 && routeIndex < currentIndex;
            return (
              <li key={`${title}-${index}`} className={`${active ? 'active' : ''}${complete ? ' complete' : ''}`}>
                <button type="button" disabled={!complete} onClick={() => routeIndex >= 0 && goTo(path[routeIndex].id)}>
                  <span className="rail-step-mark">{complete ? <Check size={15} /> : <span>0{index + 1}</span>}</span>
                  <span className="rail-step-copy"><strong>{title}</strong><small>{active ? 'In progress' : complete ? 'Complete' : 'Up next'}</small></span>
                  {active && <span className="rail-current-dot" />}
                </button>
              </li>
            );
          })}
        </ol>
        <div className="rail-bottom"><div className="rail-rule" /><div className="route-label"><span className="route-icon"><WorkflowIcon size={15} /></span><span><strong>Smart routing</strong><small>{conditionalStep?.id === 'team-setup' ? 'Team path selected' : conditionalStep?.id === 'personal-setup' ? 'Personal path selected' : 'Waiting for your details'}</small></span></div></div>
      </aside>

      <section className="form-pane">
        <div className="form-pane-top"><div className="step-counter">STEP <strong>{String(currentIndex + 1).padStart(2, '0')}</strong><span> / {String(path.length).padStart(2, '0')}</span></div><button type="button" className="help-button" title="Help" aria-label="Help"><CircleHelp size={17} /></button></div>
        <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
        <CurrentStep />
        <div className="form-actions">
          {!isFirstStep ? <button className="back-button" type="button" disabled={isExecuting} onClick={back}><ArrowLeft size={16} /> Back</button> : <span className="secure-label"><LockKeyhole size={13} /> Private by default</span>}
          <button className="continue-button" type="submit" disabled={isExecuting || isSubmitting || (currentStep.id === 'goals' && !formik.values.goal)}>
            <span>{isExecuting ? 'Checking your route…' : isLastStep ? 'Create workspace' : 'Continue'}</span>
            {isExecuting ? <span className="button-spinner" /> : isLastStep ? <CheckCheck size={16} /> : <ArrowRight size={16} />}
          </button>
        </div>
        <div className="form-footer"><span>STEP {String(currentIndex + 1).padStart(2, '0')} OF {String(path.length).padStart(2, '0')}</span><span>FORM WORKFLOW <span className="footer-separator">/</span> DEMO</span></div>
      </section>

      <aside className="context-rail">
        <div className="context-topline"><Layers3 size={15} /><span>LIVE PREVIEW</span></div>
        <h3>Your workspace,<br />taking shape.</h3>
        <p className="context-description">A quick look at the details you’ve shared so far.</p>
        <div className="preview-card">
          <div className="preview-card-head"><span className="workspace-avatar">{formik.values.name ? formik.values.name.charAt(0).toUpperCase() : <Command size={17} />}</span><span className="preview-status">DRAFT</span></div>
          <div className="preview-name">{formik.values.teamName || formik.values.name || 'Your workspace'}</div>
          <div className="preview-email">{formik.values.email || 'your@email.com'}</div>
          <div className="preview-divider" />
          <div className="preview-detail"><span>Workspace</span><strong>{formik.values.teamSize === 'just-me' ? 'Personal' : 'Team'}</strong></div>
          <div className="preview-detail"><span>Focus</span><strong>{formik.values.goal || 'Not selected'}</strong></div>
          <div className="preview-detail"><span>Getting started</span><strong>{formik.values.timeline}</strong></div>
        </div>
        <div className="route-note"><span className="route-note-icon"><Sparkles size={15} /></span><p><strong>One form, your way.</strong><br />The next step changes based on the workspace you choose.</p></div>
        <div className="context-bottom"><span className="tiny-avatar">F</span><span>Powered by <strong>form-workflow</strong></span></div>
      </aside>
    </div>
  );
}

function Completion({ values, onStartOver }: { values: DemoValues; onStartOver: () => void }) {
  return (
    <main className="completion-wrap">
      <div className="completion-mark"><CheckCheck size={27} /></div>
      <p className="completion-eyebrow">WORKSPACE CREATED</p>
      <h1>You’re in, {values.name.split(' ')[0]}.</h1>
      <p className="completion-copy">Your {values.teamSize === 'just-me' ? 'personal' : 'team'} workspace is set up and ready for what comes next.</p>
      <div className="completion-summary"><div><span>Workspace</span><strong>{values.teamName || values.name}</strong></div><div><span>First focus</span><strong>{values.goal}</strong></div><div><span>Timeline</span><strong>{values.timeline}</strong></div></div>
      <button type="button" className="continue-button" onClick={onStartOver}><span>Run the demo again</span><ArrowRight size={16} /></button>
    </main>
  );
}

function App() {
  const [submittedValues, setSubmittedValues] = useState<DemoValues | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const startOver = () => { setSubmittedValues(null); setResetKey((value) => value + 1); };

  return (
    <div className="app-shell">
      <header className="topbar"><a className="brand" href="#top" aria-label="Form Workflow demo home"><span className="brand-mark"><WorkflowIcon size={18} /></span><span>form<span className="brand-dash">/</span>workflow</span></a><div className="topbar-meta"><span className="topbar-dot" /> <span>INTERACTIVE DEMO</span><span className="topbar-divider" /><span>v1.0</span></div><a className="source-link" href="https://github.com/pushkar2gr8/form-workflow" target="_blank" rel="noreferrer">View source <ArrowRight size={14} /></a></header>
      {submittedValues ? <Completion values={submittedValues} onStartOver={startOver} /> : <>
        <div className="page-heading"><div><p className="eyebrow"><span className="eyebrow-line" /> A FORM THAT FINDS ITS WAY</p><h1>Better flows.<br /><span>Less friction.</span></h1></div><div className="heading-aside"><span className="heading-index">01 <span>/</span> 03</span><p>See how a single workflow can take different routes, without losing the thread.</p></div></div>
        <FormWorkflow key={resetKey} nodes={nodes} initialValues={initialValues} onSubmit={async (values) => { setSubmittedValues(values); }}>
          <WorkflowPanel />
        </FormWorkflow>
        <footer className="page-footer"><span>AN OPEN-SOURCE REACT WORKFLOW ENGINE</span><span>BUILT ON FORMIK <span className="footer-separator">/</span> MADE FOR THE UNEXPECTED</span></footer>
      </>}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
