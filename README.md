# form-workflow

A Formik-based React workflow engine for nested, conditional multi-step forms. Supports response-driven routes, per-step validation, async execution, and AND/OR splits.

## Install

```sh
npm install form-workflow formik react react-dom
```

React, React DOM, and Formik are peer dependencies and should be provided by your application.

## Quick start

```tsx
import { FormWorkflow, step, orSplit, CurrentStep } from 'form-workflow';

const nodes = [
  step({
    id: 'verify',
    title: 'Verify details',
    component: VerifyStep,
    execute: async ({ values, results, signal }) => {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        signal,
      });
      if (!response.ok) throw new Error('Verification failed');
      return response.json();
    },
  }),
  orSplit('verification-result', [
    {
      id: 'approved',
      when: (_, results) => results.verify?.approved === true,
      nodes: [step({ id: 'finish', component: FinishStep })],
    },
    {
      id: 'needs-info',
      when: (_, results) => results.verify?.approved === false,
      nodes: [step({ id: 'more-info', component: MoreInfoStep })],
    },
  ]),
];

<FormWorkflow
  nodes={nodes}
  initialValues={{ name: '' }}
  onSubmit={async (values) => save(values)}
>
  <CurrentStep />
</FormWorkflow>;
```

`execute` runs after the active step validates and before navigation. Its returned value is stored in `results` under that step's `id`; nested conditions receive `(values, results)`. Requests receive an `AbortSignal`. Execution failures keep the user on the current step and are available as `error` from `useFormWorkflow()`.

See the exported TypeScript types for custom layouts and typed workflow definitions.
