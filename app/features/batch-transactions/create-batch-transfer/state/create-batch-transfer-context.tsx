import * as React from 'react';

import {
  parseBatchTransferCsv,
  type BatchTransferCsvTransaction,
} from '~/features/batch-transactions/utils/batch-transfer-csv';

export enum CreateBatchTransferStep {
  TRANSFER_DETAILS = 1,
  REVIEW = 2,
  SUMMARY = 3,
}

export type CreateBatchTransferErrors = Partial<{
  parse: string;
  date: string;
  accountNumber: string;
  name: string;
  amount: string;
}>;

export interface CreateBatchTransferState {
  step: CreateBatchTransferStep;
  batchName: string;
  approverUserId: string;
  file: File | null;
  transactions: BatchTransferCsvTransaction[];
  errors: CreateBatchTransferErrors;
}

function normalizeCsvParseError(error: string): CreateBatchTransferErrors {
  const missingPrefix = 'Missing column: ';
  if (error.startsWith(missingPrefix)) {
    const col = error.slice(missingPrefix.length).trim().toLowerCase();
    switch (col) {
      case 'transaction date':
        return { date: error };
      case 'account number':
        return { accountNumber: error };
      case 'account holder name':
        return { name: error };
      case 'amount':
        return { amount: error };
      default:
        return { parse: error };
    }
  }
  return { parse: error };
}

export type CreateBatchTransferAction =
  | {
      type: 'RESET';
    }
  | {
      type: 'SET_STEP';
      payload: { step: CreateBatchTransferStep };
    }
  | {
      type: 'SUBMIT_STEP_1';
      payload: Pick<
        CreateBatchTransferState,
        'batchName' | 'approverUserId' | 'file'
      > & {
        csvText: string;
      };
    };

const initialState: CreateBatchTransferState = {
  step: 1,
  batchName: '',
  approverUserId: '',
  file: null,
  transactions: [],
  errors: {},
};

function reducer(
  state: CreateBatchTransferState,
  action: CreateBatchTransferAction
): CreateBatchTransferState {
  switch (action.type) {
    case 'RESET': {
      return {
        ...initialState,
      };
    }
    case 'SET_STEP': {
      return { ...state, step: action.payload.step };
    }
    case 'SUBMIT_STEP_1': {
      const batchName = action.payload.batchName.trim();
      const approverUserId = action.payload.approverUserId;
      const file = action.payload.file;
      const parsed = parseBatchTransferCsv(action.payload.csvText);
      if (!parsed.ok) {
        return {
          ...state,
          batchName,
          approverUserId,
          file,
          transactions: [],
          step: 1,
          errors: normalizeCsvParseError(parsed.error),
        };
      }

      return {
        ...state,
        step: 2,
        batchName,
        approverUserId,
        file,
        transactions: parsed.transactions,
        errors: {},
      };
    }
    default: {
      return state;
    }
  }
}

const CreateBatchTransferStateContext =
  React.createContext<CreateBatchTransferState | null>(null);
const CreateBatchTransferDispatchContext =
  React.createContext<React.Dispatch<CreateBatchTransferAction> | null>(null);

export function CreateBatchTransferProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value?: CreateBatchTransferState;
}) {
  const [state, dispatch] = React.useReducer(reducer, value ?? initialState);
  return (
    <CreateBatchTransferStateContext value={state}>
      <CreateBatchTransferDispatchContext value={dispatch}>
        {children}
      </CreateBatchTransferDispatchContext>
    </CreateBatchTransferStateContext>
  );
}

export function useCreateBatchTransferState(): CreateBatchTransferState {
  const ctx = React.useContext(CreateBatchTransferStateContext);
  if (!ctx) {
    throw new Error(
      'useCreateBatchTransferState must be used within CreateBatchTransferProvider'
    );
  }
  return ctx;
}

export function useCreateBatchTransferDispatch(): React.Dispatch<CreateBatchTransferAction> {
  const ctx = React.useContext(CreateBatchTransferDispatchContext);
  if (!ctx) {
    throw new Error(
      'useCreateBatchTransferDispatch must be used within CreateBatchTransferProvider'
    );
  }
  return ctx;
}
