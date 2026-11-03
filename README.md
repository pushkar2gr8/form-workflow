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
      when: (_, results) =>
        (results.verify as { approved?: boolean } | undefined)?.approved === true,
      nodes: [step({ id: 'finish', component: FinishStep })],
    },
    {
      id: 'needs-info',
      when: (_, results) =>
        (results.verify as { approved?: boolean } | undefined)?.approved === false,
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

## Demo app

Run the interactive workspace setup demo from this repository:

```sh
npm install
npm run dev
```

To create a production build of the demo, run `npm run build:demo`. The app imports the library through its package exports and is not included in the published npm package.

## Exports

- `FormWorkflow` runs a workflow inside Formik.
- `CurrentStep` renders the active step, and `useFormWorkflow()` exposes navigation and execution state for custom layouts.
- `step()`, `orSplit()`, and `andSplit()` define workflow nodes. `resolvePath()` resolves the active route.
- TypeScript types for steps, branches, execution context, results, and workflow state are exported from the package root.

## Build and publish

```sh
npm ci
npm run build
npm pack --dry-run
npm publish
```

The package builds ESM, CommonJS, and declaration files into `dist/`. React, React DOM, and Formik are peer dependencies, so applications should install compatible versions themselves.
