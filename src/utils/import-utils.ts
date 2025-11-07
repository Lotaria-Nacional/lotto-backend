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

export function parseImportedDate(dateStr: string | Date): Date | null {
  if (!dateStr) return null;

  const cleaned = dateStr.toString().trim().replace(/\./g, '/').replace(/-/g, '/');
  const formats = [
    'D/M/YYYY',
    'DD/MM/YYYY',
    'D/M/YY',
    'DD/MM/YY',
    'M/D/YYYY',
    'MM/DD/YYYY',
    'M/D/YY',
    'MM/DD/YY',
    'YYYY-MM-DD',
    'YYYY/MM/DD',
    'YYYY.M.D',
    'YYYY-M-D',
    'D-M-YYYY HH:mm',
    'DD-MM-YYYY HH:mm:ss',
    'YYYY-MM-DD HH:mm:ss',
    'DD/MM/YYYY HH:mm:ss',
    'DD-MM-YYYY',
    'D-M-YYYY',
    'DD.MM.YYYY',
    'D.M.YYYY',
  ];

  const parsedDate = dayjs(cleaned, formats, true);
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
