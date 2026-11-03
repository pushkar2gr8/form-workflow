import type { ComponentType } from 'react';
import type { FormikErrors, FormikProps, FormikValues } from 'formik';

export type WorkflowResults = Readonly<Record<string, unknown>>;

export interface StepExecutionContext<V> {
  values: V;
  results: WorkflowResults;
  signal: AbortSignal;
}

export type Condition<V> = (values: V, results: WorkflowResults) => boolean;

export interface StepProps<V extends FormikValues = FormikValues> {
  formik: FormikProps<V>;
  step: StepNode<V>;
  workflow: WorkflowState<V>;
}

export interface StepNode<V extends FormikValues = FormikValues> {
  type: 'step';
  id: string;
  title?: string;
  when?: Condition<V>;
  fields?: string[];
  validate?: (values: V) => FormikErrors<V> | Promise<FormikErrors<V>>;
  execute?: (context: StepExecutionContext<V>) => Promise<unknown>;
  validationSchema?: unknown;
  component: ComponentType<StepProps<V>>;
}

export interface Branch<V extends FormikValues = FormikValues> {
  id: string;
  label?: string;
  when?: Condition<V>;
  nodes: WorkflowNode<V>[];
}

export interface OrSplitNode<V extends FormikValues = FormikValues> {
  type: 'or-split';
  id: string;
  when?: Condition<V>;
  branches: Branch<V>[];
}

export interface AndSplitNode<V extends FormikValues = FormikValues> {
  type: 'and-split';
  id: string;
  when?: Condition<V>;
  branches: Branch<V>[];
}

export type WorkflowNode<V extends FormikValues = FormikValues> =
  | StepNode<V>
  | OrSplitNode<V>
  | AndSplitNode<V>;

export interface WorkflowState<V extends FormikValues = FormikValues> {
  path: StepNode<V>[];
  currentStep: StepNode<V>;
  currentIndex: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  results: WorkflowResults;
  isExecuting: boolean;
  error: Error | null;
  next: () => Promise<boolean>;
  back: () => void;
  goTo: (stepId: string) => void;
}
