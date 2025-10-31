import z from 'zod';
import dayjs from 'dayjs';

function checkValidNumber(val?: string | null) {
  if (!val || isNaN(Number(val))) return null;
  return Number(val);
}
function transformDateOrThrowError(val?: string | null) {
  if (!val) return null;
  const formats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY'];
  const parsed = formats.map((fmt) => dayjs(val, fmt, true)).find((d) => d.isValid());
  if (!parsed) {
    throw new Error(`Formato de data inválido: ${val}`);
  }
  return parsed.toDate();
}

export const importAfrimoneySchema = z.object({
  transferId: z.string().optional(),
  serviceType: z.string().optional(),
  remarks: z.string().optional(),
  transactionType: z.string().optional(),
  accountId: z.string().optional(),
  secondPartyAccountId: z.string().optional(),
  transferValue: z.string().optional(),
  comission: z.string().optional(),
  serviceCharge: z.string().optional(),
  taxa: z.string().optional(),
  previousBalance: z.string().optional(),
  postBalance: z.string().optional(),
});
export type ImportAfrimoneyType = z.infer<typeof importAfrimoneySchema>;

export const importKoralPlaySchema = z.object({
  transferId: z.string().optional(),
  date: z.string().optional(),
  operationDate: z.string().optional().transform(transformDateOrThrowError),
  operation: z.string().optional(),
  amountAfter: z.string().optional(),
  senderAccountId: z.string().optional(),
  senderDetails: z.string().optional(),
  senderStaffReference: z.string().optional(),
  transactionType: z.string().optional(),
  receiverAccountId: z.string().optional(),
  receiverDetails: z.string().optional(),
  receiverStaffReference: z.string().optional(),
  paymentMode: z.string().optional(),
  signedBy: z.string().optional(),
  signedByStaffReference: z.string().optional(),
  entity: z.string().optional(),
  column1: z.string().optional(),
  column2: z.string().optional(),
});
export type ImportKoralPlayType = z.infer<typeof importKoralPlaySchema>;
