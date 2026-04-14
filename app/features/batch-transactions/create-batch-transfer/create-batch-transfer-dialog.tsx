import { useMemo, useEffect, useCallback, useRef, useState } from 'react';

import { useAccount } from '~/state/account-context';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { canBeBatchApprover } from '~/lib/user-role';
import type { BatchApprover } from '~/types/transaction';
import type { BatchTransferCsvTransaction } from '~/features/batch-transactions/utils/batch-transfer-csv';
import { Stepper } from '~/components/ui/stepper';
import { TransactionActionResultDialog } from '~/features/batch-transactions/batch-transaction-list/batch-transaction-table/transaction-action-result-dialog';

import {
  CreateBatchTransferProvider,
  useCreateBatchTransferDispatch,
  useCreateBatchTransferState,
  type CreateBatchTransferStep,
} from './state/create-batch-transfer-context';
import {
  MemoizedTransferDetailsStep,
  type Step1TransferDetailsSubmitValue,
} from './step-1-transfer-details';
import { MemoizedReviewTransactions } from './step-2-review-records';
import { MemoizedSummary } from './step-3-summary';
import { usePopup } from '~/hooks/use-popup';

const STEPS = [
  { id: 1, label: 'Transfer Details' },
  { id: 2, label: 'Review Records' },
  { id: 3, label: 'Summary' },
] as const;

export interface BatchTransferSubmitPayload {
  batchName: string;
  approver: BatchApprover;
  transactions: BatchTransferCsvTransaction[];
}

export interface CreateBatchTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (payload: BatchTransferSubmitPayload) => void;
  isSubmitting?: boolean;
  serverError?: string | null;
}

export function CreateBatchTransferDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  serverError = null,
}: CreateBatchTransferDialogProps) {
  const { users } = useAccount();
  const approvers = useMemo(
    () => users.filter((user) => canBeBatchApprover(user)),
    [users]
  );

  return (
    <CreateBatchTransferProvider>
      <CreateBatchTransferDialogContent
        open={open}
        onOpenChange={onOpenChange}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        serverError={serverError}
        approvers={approvers}
      />
    </CreateBatchTransferProvider>
  );
}

export type CreateBatchTransferDialogContentProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (payload: BatchTransferSubmitPayload) => void;
  isSubmitting: boolean;
  serverError: string | null;
  approvers: Array<{ id: string; name: string }>;
};

function CreateBatchTransferDialogContent({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  serverError,
  approvers,
}: CreateBatchTransferDialogContentProps) {
  const state = useCreateBatchTransferState();
  const dispatch = useCreateBatchTransferDispatch();

  const wasSubmittingRef = useRef(false);
  const [submitRequested, setSubmitRequested] = useState(false);
  const resultDialog = usePopup();
  const [result, setResult] = useState<{
    variant: 'success' | 'error';
    title: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    dispatch({ type: 'RESET' });
  }, [open, dispatch]);

  useEffect(() => {
    if (open) return;
    wasSubmittingRef.current = false;
    setSubmitRequested(false);
    if (!resultDialog.isOpen) {
      setResult(null);
    }
  }, [open, resultDialog.isOpen]);

  useEffect(() => {
    const wasSubmitting = wasSubmittingRef.current;
    const isDone = wasSubmitting && !isSubmitting;
    wasSubmittingRef.current = isSubmitting;

    if (!submitRequested || !isDone) return;
    setSubmitRequested(false);

    if (serverError) {
      setResult({
        variant: 'error',
        title: 'Create batch failed',
        description: serverError,
      });
      resultDialog.openPopup();
      return;
    }

    setResult({
      variant: 'success',
      title: 'Batch created',
      description: `Created ${state.transactions.length} transaction${state.transactions.length === 1 ? '' : 's'} in "${state.batchName.trim()}".`,
    });
    resultDialog.openPopup();
    onOpenChange(false);
  }, [
    isSubmitting,
    serverError,
    submitRequested,
    state.transactions.length,
    state.batchName,
    onOpenChange,
  ]);

  const selectedApproverAccount = useMemo(() => {
    return approvers.find((u) => u.id === state.approverUserId) ?? null;
  }, [approvers, state.approverUserId]);

  const buildPayload = useCallback((): BatchTransferSubmitPayload | null => {
    const acc = approvers.find((a) => a.id === state.approverUserId);
    if (!acc) return null;
    const approver: BatchApprover = { userId: acc.id, name: acc.name };
    return {
      batchName: state.batchName.trim(),
      approver,
      transactions: state.transactions,
    };
  }, [approvers, state.approverUserId, state.batchName, state.transactions]);

  const handleSubmit = useCallback(() => {
    const payload = buildPayload();
    if (!payload) return;
    setResult(null);
    resultDialog.closePopup();
    setSubmitRequested(true);
    onSubmit?.(payload);
  }, [buildPayload, onSubmit]);

  const handleSubmitStep1 = useCallback(
    (formData: Step1TransferDetailsSubmitValue) =>
      dispatch({
        type: 'SUBMIT_STEP_1',
        payload: formData,
      }),
    [dispatch]
  );

  const goToStep = useCallback(
    (step: CreateBatchTransferStep) =>
      dispatch({ type: 'SET_STEP', payload: { step } }),
    [dispatch]
  );

  return (
    <>
      {result ? (
        <TransactionActionResultDialog
          open={resultDialog.isOpen}
          onOpenChange={(open) => {
            resultDialog.setOpen(open);
            if (!open) setResult(null);
          }}
          title={result.title}
          description={result.description}
          variant={result.variant}
        />
      ) : null}

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent wide>
          <DialogHeader>
            <DialogTitle>New Batch Transfer</DialogTitle>
            <DialogDescription>
              Upload a CSV, validate rows, and confirm the summary.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Stepper steps={STEPS} activeStepId={state.step} />
            {state.step === 1 && (
              <MemoizedTransferDetailsStep
                initialValue={{
                  batchName: state.batchName,
                  approverUserId: state.approverUserId,
                  file: state.file,
                }}
                approvers={approvers}
                isSubmitting={isSubmitting}
                errors={state.errors}
                handleClickNext={handleSubmitStep1}
              />
            )}
            {state.step === 2 && (
              <MemoizedReviewTransactions
                transactions={state.transactions}
                isSubmitting={isSubmitting}
                onBack={() => goToStep(1)}
                onNext={() => goToStep(3)}
              />
            )}
            {state.step === 3 && (
              <MemoizedSummary
                batchName={state.batchName.trim()}
                approverName={selectedApproverAccount?.name ?? null}
                transactions={state.transactions}
                serverError={serverError}
                isSubmitting={isSubmitting}
                onBack={() => goToStep(2)}
                onSubmit={handleSubmit}
              />
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
}
