/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useState } from 'react';
import {
  DialogButton,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogOnCloseEventT,
} from '@rmwc/dialog';
import { Theme } from '@rmwc/theme';
import { firestore } from 'firebase';
import { TextField } from '@rmwc/textfield';
import { AddDocumentStep, AddDocumentDialogValue } from './AddDocumentDialog';
import DatabaseApi from '../api';

interface AddCollectionStepProps {
  documentRef?: firestore.DocumentReference;
  onChange: (value: string) => void;
}

export const AddCollectionStep = ({
  documentRef,
  onChange,
}: AddCollectionStepProps) => {
  const [id, setId] = useState('');
  const updateId = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setId(evt.target.value);
    onChange(evt.target.value);
  };

  return (
    <>
      <TextField
        id="add-col-path"
        fullwidth
        label="Parent path"
        value={documentRef ? documentRef.path : '/'}
        disabled
      />
      <TextField
        id="add-col-id"
        fullwidth
        label="Collection ID"
        required
        value={id}
        onChange={updateId}
      />
    </>
  );
};

export interface AddCollectionDialogValue {
  collectionId: string;
  document: AddDocumentDialogValue;
}

interface Props extends DialogProps {
  documentRef?: firestore.DocumentReference;
  api: DatabaseApi;
  onValue: (v: AddCollectionDialogValue | null) => void;
}

enum Step {
  COLLECTION,
  DOCUMENT,
}

export const AddCollectionDialog: React.FC<Props> = ({
  documentRef,
  api,
  onValue,
  onClose,
  ...dialogProps
}) => {
  const [step, setStep] = useState(Step.COLLECTION);
  const [collectionId, setCollectionId] = useState('');
  const [document, setDocument] = useState<AddDocumentDialogValue>({
    id: '',
    data: undefined,
  });

  const next = () =>
    step === Step.COLLECTION && collectionId && setStep(step + 1);

  const getValue = () => ({
    collectionId,
    document,
  });

  const emitValueAndClose = (evt: DialogOnCloseEventT) => {
    onValue(evt.detail.action === 'accept' ? getValue() : null);
    onClose && onClose(evt);
  };

  return (
    <Dialog {...dialogProps} onClose={emitValueAndClose}>
      <DialogTitle>Start a collection</DialogTitle>

      <DialogContent>
        {step === Step.COLLECTION ? (
          <AddCollectionStep
            documentRef={documentRef}
            onChange={setCollectionId}
          />
        ) : (
          <AddDocumentStep
            collectionRef={
              documentRef
                ? documentRef.collection(collectionId)
                : api.database.collection(collectionId)
            }
            onChange={setDocument}
          />
        )}
      </DialogContent>

      <DialogActions>
        <Theme use={['textSecondaryOnBackground']} wrap>
          <DialogButton action="close">Cancel</DialogButton>
        </Theme>
        {step === Step.DOCUMENT ? (
          <DialogButton unelevated action="accept" isDefaultAction>
            Save
          </DialogButton>
        ) : (
          <DialogButton unelevated onClick={next}>
            Next
          </DialogButton>
        )}
      </DialogActions>
    </Dialog>
  );
};