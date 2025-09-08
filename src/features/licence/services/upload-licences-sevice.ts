import prisma from '../../../lib/prisma';
import { licenceBulkSchema } from '../schemas/licenceBulkSchema';

export async function uploadLicencesService(data: any[]) {
  const validLicences = [];
  const errors = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const parsed = licenceBulkSchema.safeParse(row);

    if (!parsed.success) {
      errors.push({ row: i + 1, issues: parsed.error.format() });
      continue;
    }

    validLicences.push({
      number: parsed.data.number,
      reference: parsed.data.reference,
      limit: parsed.data.limit,
      status: parsed.data.status,
      emitted_at: new Date(parsed.data.emitted_at),
      expires_at: new Date(parsed.data.expires_at),
      description: parsed.data.description || '',
      file: parsed.data.file || '',
      coordinates: parsed.data.coordinates || '',
      admin_id: parsed.data.admin_id || null,
    });
  }

  if (validLicences.length > 0) {
    await prisma.licence.createMany({
      data: validLicences,
      skipDuplicates: true, // ignora duplicados no campo 'number' se necessário
    });
  }

  return {
    inserted: validLicences.length,
    errors,
  };
}
