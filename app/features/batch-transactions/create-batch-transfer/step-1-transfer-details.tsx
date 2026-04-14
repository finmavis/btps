import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FileCsvIcon, UploadSimpleIcon } from '@phosphor-icons/react';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { cn } from '~/lib/utils';

import styles from './create-batch-transfer-dialog.module.css';

export interface Step1TransferDetailsValue {
  batchName: string;
  approverUserId: string;
  file: File | null;
}

export type Step1TransferDetailsSubmitValue = Step1TransferDetailsValue & {
  csvText: string;
};

export type TransferDetailsStepProps = {
  initialValue: Step1TransferDetailsValue;
  approvers: { id: string; name: string }[];
  errors?: Partial<{
    batchName: string;
    file: string;
    approverUserId: string;
    parse: string;
    date: string;
    accountNumber: string;
    name: string;
    amount: string;
  }>;
  isSubmitting: boolean;
  handleClickNext: (formData: Step1TransferDetailsSubmitValue) => void;
};

const STEP1_ERROR_TEXT = {
  batchNameRequired: 'Batch transfer name is required.',
  fileRequired: 'CSV file is required.',
  fileMustBeCsv: 'File must be a .csv.',
  noApprovers: 'No users with the Approver role are available.',
  approverRequired: 'Approver is required.',
} as const;

function isProbablyCsv(file: File): boolean {
  const name = file.name.toLowerCase();
  const nameOk = name.endsWith('.csv');
  const type = file.type.toLowerCase();
  const typeOk =
    type === 'text/csv' ||
    type === 'application/csv' ||
    type === 'text/plain' ||
    type === '';
  return nameOk && typeOk;
}

function validateFormData(params: {
  batchName: string;
  file: File | null;
  approverUserId: string;
  canChooseApprover: boolean;
}): Partial<{
  batchName: string;
  file: string;
  approverUserId: string;
}> {
  const errors: Partial<{
    batchName: string;
    file: string;
    approverUserId: string;
  }> = {};

  if (!params.batchName.trim()) {
    errors.batchName = STEP1_ERROR_TEXT.batchNameRequired;
  }
  if (!params.file) {
    errors.file = STEP1_ERROR_TEXT.fileRequired;
  } else if (!isProbablyCsv(params.file)) {
    errors.file = STEP1_ERROR_TEXT.fileMustBeCsv;
  }
  if (!params.canChooseApprover) {
    errors.approverUserId = STEP1_ERROR_TEXT.noApprovers;
  } else if (!params.approverUserId) {
    errors.approverUserId = STEP1_ERROR_TEXT.approverRequired;
  }

  return errors;
}

export function TransferDetailsStep({
  initialValue,
  approvers,
  errors,
  isSubmitting,
  handleClickNext,
}: TransferDetailsStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [batchName, setBatchName] = useState(initialValue.batchName);
  const [file, setFile] = useState<File | null>(initialValue.file);
  const [approverUserId, setApproverUserId] = useState(
    initialValue.approverUserId
  );
  const [batchNameError, setBatchNameError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [approverError, setApproverError] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [readingFile, setReadingFile] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    setBatchName(initialValue.batchName);
    setFile(initialValue.file);
    setApproverUserId(initialValue.approverUserId);
    setBatchNameError(errors?.batchName ?? null);
    setFileError(errors?.file ?? null);
    setApproverError(errors?.approverUserId ?? null);
    setParseError(
      errors?.parse ??
        errors?.date ??
        errors?.accountNumber ??
        errors?.name ??
        errors?.amount ??
        null
    );
    setReadingFile(false);
  }, [
    initialValue.batchName,
    initialValue.file,
    initialValue.approverUserId,
    errors?.batchName,
    errors?.file,
    errors?.approverUserId,
    errors?.parse,
    errors?.date,
    errors?.accountNumber,
    errors?.name,
    errors?.amount,
  ]);

  const canChooseApprover = useMemo(() => approvers.length > 0, [approvers]);

  const assignFile = useCallback((file: File | null) => {
    setFile(file);
    setParseError(null);
    setFileError(null);
  }, []);

  const handleNext = useCallback(() => {
    const nextErrors = validateFormData({
      batchName,
      file,
      approverUserId,
      canChooseApprover,
    });
    setBatchNameError(nextErrors.batchName ?? null);
    setFileError(nextErrors.file ?? null);
    setApproverError(nextErrors.approverUserId ?? null);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    setReadingFile(true);
    const reader = new FileReader();
    reader.onload = () => {
      setReadingFile(false);
      const csvText = String(reader.result ?? '');
      handleClickNext({ batchName, approverUserId, file, csvText });
    };
    reader.onerror = () => {
      setReadingFile(false);
      setParseError('Could not read the file.');
    };
    reader.readAsText(file as Blob);
  }, [file, handleClickNext, batchName, approverUserId, canChooseApprover]);

  return (
    <div>
      <h3 className={styles.sectionTitle}>Transfer Details</h3>
      <div className={styles.field}>
        <Label className={styles.fieldLabel} htmlFor='batch-name'>
          Batch Transfer Name
        </Label>
        <Input
          id='batch-name'
          placeholder='e.g. March vendor payouts'
          value={batchName}
          onChange={(e) => {
            setBatchName(e.target.value);
            setBatchNameError(null);
          }}
          autoComplete='off'
          aria-invalid={!!batchNameError}
          aria-describedby={batchNameError ? 'batch-name-error' : undefined}
        />
        {batchNameError ? (
          <p id='batch-name-error' className={styles.errorText} role='alert'>
            {batchNameError}
          </p>
        ) : null}
      </div>

      <div className={styles.field}>
        <span className={styles.fieldLabel}>File upload</span>
        <input
          ref={fileInputRef}
          type='file'
          accept='.csv,text/csv'
          className={styles.srOnly}
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            assignFile(file);
            e.target.value = '';
          }}
        />
        <div
          className={cn(styles.dropZone, {
            [styles.dropZoneDragging]: dragOver,
          })}
          role='button'
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) assignFile(file);
          }}
        >
          <FileCsvIcon size={28} weight='duotone' aria-hidden />
          <p className={styles.dropHint}>
            Drag and drop a CSV here, or click to browse
          </p>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            <UploadSimpleIcon size={16} weight='bold' aria-hidden />
            Choose file
          </Button>
          {file ? (
            <p className={styles.fileName}>{file.name}</p>
          ) : (
            <p className={styles.dropHint}>No file selected</p>
          )}
        </div>
        <details className={styles.formatExample}>
          <summary>CSV format example</summary>
          <pre>
            Transaction Date,Account Number,Account Holder Name,Amount
            <br />
            2025-02-20,000-123456789-01,John Doe,100.00
            <br />
            2025-02-21,000-987654321-02,Jane Smith,250.50
          </pre>
        </details>
        {fileError || parseError ? (
          <p className={styles.errorText} role='alert' id='file-error'>
            {fileError || parseError}
          </p>
        ) : null}
      </div>
      <div className={styles.field}>
        <Label className={styles.fieldLabel} htmlFor='approver'>
          Approver
        </Label>
        <Select
          value={approverUserId}
          onValueChange={(value) => {
            setApproverUserId(value);
            setApproverError(null);
          }}
          disabled={!canChooseApprover}
        >
          <SelectTrigger id='approver'>
            <SelectValue placeholder='Select approver' />
          </SelectTrigger>
          <SelectContent>
            {approvers.map(({ id, name }) => (
              <SelectItem key={id} value={id}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!canChooseApprover ? (
          <p className={styles.dropHint} role='status'>
            No users with the Approver role.
          </p>
        ) : null}
        {approverError ? (
          <p className={styles.errorText} role='alert' id='approver-error'>
            {approverError}
          </p>
        ) : null}
      </div>
      <div className={styles.step1ActionsRow}>
        <Button
          type='button'
          disabled={readingFile || isSubmitting}
          onClick={handleNext}
        >
          {readingFile || isSubmitting ? 'Reading…' : 'Next'}
        </Button>
      </div>
    </div>
  );
}

export const MemoizedTransferDetailsStep = memo(TransferDetailsStep);
