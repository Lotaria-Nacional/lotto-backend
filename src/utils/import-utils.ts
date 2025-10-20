import dayjs from 'dayjs';
import { ZodError } from 'zod';
import prisma from '../lib/prisma';
import { audit } from './audit-log';
import uploadCsvToImageKit from './upload-csv-to-image-kit';
import { AuthPayload, Module } from '@lotaria-nacional/lotto';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

interface AuditImportProps {
  file: any;
  user: AuthPayload;
  imported: number;
  entity: Module;
  desc: string;
}

export const auditImport = async ({ file, user, imported, entity, desc }: AuditImportProps) => {
  const url = await uploadCsvToImageKit(file);
  await prisma.$transaction(async tx => {
    await audit(tx, 'IMPORT', {
      user,
      before: null,
      after: null,
      entity,
      description: `Importou ${imported} ${desc}`,
      metadata: {
        file: url,
      },
    });
  });
};

// OLD VERSION: 1.0.0
// export function parseImportedDate(dateStr: string) {
//  const parsedDate = dayjs(dateStr, ['D/M/YYYY', 'DD/MM/YYYY', 'M/DD/YYYY', 'MM/DD/YYYY'], true); if (!parsedDate.isValid()) { return null; } return parsedDate.toDate();
// }

export function parseImportedDate(dateStr: string) {
  if (!dateStr) return null;
  const parsedDate = dayjs(dateStr, ['D/M/YYYY', 'DD/MM/YYYY', 'M/DD/YYYY', 'MM/DD/YYYY'], true);
  return parsedDate.isValid() ? parsedDate.toDate() : null;
}

interface HandleImportErrorProps {
  err: any;
  errors: any[];
  row: any;
}

export function handleImportError({ err, errors, row }: HandleImportErrorProps) {
  console.log(err);
  if (err instanceof ZodError) {
    errors.push({
      row,
      error: err.issues.map(issue => ({
        campo: issue.path.join(','),
        menssagem: issue.message,
      })),
    });
  } else {
    errors.push({ row, error: (err as any).message || err });
  }
}
