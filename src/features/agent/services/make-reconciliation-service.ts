import {
  ImportAfrimoneyType,
  ImportKoralPlayType,
  importAfrimoneySchema,
  importKoralPlaySchema,
} from '../validation/import-reconciliation-schema';

import fs from 'fs';
import csvParser from 'csv-parser';
import { Transform } from 'stream';
import prisma from '../../../lib/prisma';
import { getFileType } from '../utils/get-file-type';
import { CHUNK_SIZE } from '../utils/process-batch-agents';

export type ExpressFile = Express.Multer.File;

export async function makeReconciliationService(files: ExpressFile[]) {
  let result: any[] = [];
  for (const file of files) {
    const fileType = await getFileType(file);

    if (fileType === 'afrimoney') {
      const res = await importAfrimoneyService(file.path);
      result.push(res);
    } else if (fileType === 'koral-play') {
      const res = await importKoralPlayService(file.path);
      result.push(res);
    } else {
      return;
    }
  }

  return result;
}

/** ===================================  AFRIMONEY  ===================================   */

async function importAfrimoneyService(file: string) {
  const errors: any[] = [];
  const batch: ImportAfrimoneyType[] = [];

  let imported = 0;
  let pendingWrites: Promise<any>[] = [];

  const stream = fs
    .createReadStream(file)
    .pipe(csvParser({ mapHeaders: ({ header }) => header.trim().toLowerCase() }))
    .pipe(
      transformAfrimoney(batch, errors, async () => {
        const promise = persistAfrimoneyData(batch);
        pendingWrites.push(promise);
        imported += await promise;
      })
    );

  stream.on('end', async () => {
    await Promise.all(pendingWrites);
  });

  stream.on('error', (err) => {
    console.error('Erro no stream CSV:', err);
  });

  return { imported, errors };
}

function transformAfrimoney(batch: ImportAfrimoneyType[], errors: any[], onBatchReady: () => Promise<void>) {
  return new Transform({
    objectMode: true,
    async transform(chunk, _, callback) {
      try {
        const input: ImportAfrimoneyType = {
          transferId: chunk['transfer_id'],
          serviceType: chunk['service_type'],
          remarks: chunk['remarks'],
          transactionType: chunk['transaction_type'],
          accountId: chunk['account_id'],
          secondPartyAccountId: chunk['second_party_account_id'],
          transferValue: chunk['transfer_value'],
          comission: chunk['comission'],
          serviceCharge: chunk['service_charge'],
          taxa: chunk['taxa'],
          previousBalance: chunk['previous_balance'],
          postBalance: chunk['post_balance'],
        };

        const parsed = importAfrimoneySchema.parse(input);
        batch.push(parsed);

        if (batch.length >= CHUNK_SIZE) {
          await onBatchReady();
        }
        callback();
      } catch (error) {
        console.error('Erro ao validar linha:', error);
        errors.push({ chunk, error });
        callback();
      }
    },

    async flush(callback) {
      if (batch.length > 0) {
        await onBatchReady();
      }
      callback();
    },
  });
}

async function persistAfrimoneyData(batch: ImportAfrimoneyType[]) {
  if (batch.length === 0) return 0;

  for (let i = 0; i < batch.length; i += CHUNK_SIZE) {
    const chunk = batch.slice(i, i + CHUNK_SIZE);
    try {
      await prisma.afrimoney.createMany({ data: chunk });
    } catch (error) {
      console.error(`Erro ao inserir chunk de ${chunk.length} registros:`, error);
    }
  }

  const count = batch.length;
  batch.length = 0;
  return count;
}

/** ===================================  KORAL PLAY  ===================================   */

async function importKoralPlayService(file: string) {
  const errors: any[] = [];
  const batch: ImportKoralPlayType[] = [];

  let imported = 0;
  let pendingWrites: Promise<any>[] = [];

  const stream = fs
    .createReadStream(file)
    .pipe(csvParser({ mapHeaders: ({ header }) => header.trim().toLowerCase() }))
    .pipe(
      transformKoralPlay(batch, errors, async () => {
        const promise = persistKoralPlayData(batch);
        pendingWrites.push(promise);
        imported += await promise;
      })
    );

  stream.on('end', async () => {
    await Promise.all(pendingWrites);
    console.log(`✅ Importação concluída: ${imported} registros inseridos.`);
  });

  stream.on('error', (err) => {
    errors.push(err);
    console.error('Erro no stream CSV:', err);
  });

  return { imported, errors };
}

function transformKoralPlay(batch: ImportKoralPlayType[], errors: any[], onBatchReady: () => Promise<void>) {
  return new Transform({
    objectMode: true,
    async transform(chunk, _, callback) {
      try {
        const input: ImportKoralPlayType = {
          transferId: chunk['transfer_id'],
          date: chunk['date'],
          operationDate: chunk['operation_date'],
          operation: chunk['operation'],
          amountAfter: chunk['amount after'],
          senderAccountId: chunk['sender_account_id'],
          senderDetails: chunk['sender_details'],
          senderStaffReference: chunk['sender_staffreference'],
          transactionType: chunk['transaction_type'],
          receiverAccountId: chunk['receiver_account_id'],
          receiverDetails: chunk['receiver_details'],
          receiverStaffReference: chunk['receiver_staffreference'],
          paymentMode: chunk['payment_mode'],
          signedBy: chunk['signed by'],
          signedByStaffReference: chunk['signedby_staff_reference'],
          entity: chunk['entidade'],
          column1: chunk['column1'],
          column2: chunk['column2'],
        };

        const parsed = importKoralPlaySchema.parse(input);
        batch.push(parsed);

        if (batch.length >= CHUNK_SIZE) {
          await onBatchReady();
        }
        callback();
      } catch (error) {
        console.error('Erro ao validar linha:', error);
        errors.push(error);
        callback();
      }
    },

    async flush(callback) {
      if (batch.length > 0) {
        await onBatchReady();
      }
      callback();
    },
  });
}

async function persistKoralPlayData(batch: ImportKoralPlayType[]) {
  if (batch.length === 0) return 0;

  for (let i = 0; i < batch.length; i += CHUNK_SIZE) {
    const chunk = batch.slice(i, i + CHUNK_SIZE);
    try {
      await prisma.koralPlay.createMany({ data: chunk });
    } catch (error) {
      console.error(`Erro ao inserir chunk de ${chunk.length} registros:`, error);
    }
  }

  const count = batch.length;
  batch.length = 0;
  return count;
}
