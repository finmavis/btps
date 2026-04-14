import type React from 'react';
import { useMemo } from 'react';
import { CheckIcon } from '@phosphor-icons/react';

import { cn } from '~/lib/utils';

import styles from './stepper.module.css';

export type StepperStep = {
  id: string | number;
  label: string;
};

export interface StepperProps<Step extends StepperStep> {
  steps: ReadonlyArray<Step>;
  activeStepId: Step['id'];
  className?: string;
  getStepIndicator?: (step: Step, index: number) => React.ReactNode;
}

export function Stepper<Step extends StepperStep>({
  steps,
  activeStepId,
  className,
  getStepIndicator,
}: StepperProps<Step>) {
  const activeIndex = useMemo(
    () =>
      Math.max(
        0,
        steps.findIndex((s) => s.id === activeStepId)
      ),
    [steps, activeStepId]
  );

  return (
    <div className={cn(styles.stepper, className)} aria-hidden>
      {steps.map((step, index) => {
        const isActive = index === activeIndex;
        const isDone = index < activeIndex;
        const indicator = getStepIndicator?.(step, index) ?? index + 1;

        return (
          <div key={step.id} className={styles.stepItem}>
            <span
              className={cn(
                styles.stepCircle,
                isActive && styles.stepCircleActive,
                isDone && styles.stepCircleDone
              )}
            >
              {isDone ? <CheckIcon size={14} weight='bold' /> : indicator}
            </span>
            <span
              className={cn(
                styles.stepLabel,
                isActive && styles.stepLabelActive
              )}
            >
              {step.label}
            </span>
            {index < steps.length - 1 ? (
              <span
                className={cn(styles.stepLine, isDone && styles.stepLineDone)}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
