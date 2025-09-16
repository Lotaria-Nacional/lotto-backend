import { CreatePosDTO, createPosSchema } from '@lotaria-nacional/lotto';
import path from 'path';
import { parseCsvFile, parseExcelFile } from '../utils/parser';
import prisma from '../../../lib/prisma';

export async function importPosFromFileService(file: Express.Multer.File): Promise<CreatePosDTO[]> {
  const ext = path.extname(file.originalname).toLowerCase();
  let rows: any[] = [];

  // Parse do arquivo
  if (ext === '.csv') {
    rows = await parseCsvFile(file.path);
  } else if (ext === '.xlsx' || ext === '.xls') {
    rows = await parseExcelFile(file.path);
  } else {
    throw new Error('Formato de arquivo não suportado');
  }

  const importedPOS: CreatePosDTO[] = [];

  for (const row of rows) {
    try {
      // Validação e transformação dos dados
      const dto: CreatePosDTO = createPosSchema.parse({
        city_name: row.city_name,
        admin_name: row.admin_name,
        province_name: row.province_name,
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        licence_reference: row.licence_reference || undefined, // <--- torna opcional
        agent_id_reference: row.agent_id_reference ? Number(row.agent_id_reference) : undefined,
        area_name: row.area_name || undefined,
        zone_number: row.zone_number ? Number(row.zone_number) : undefined,
        type_name: row.type_name || undefined,
        subtype_name: row.subtype_name || undefined,
      });

      // Garantir que a licença existe
      if (dto.licence_reference) {
        await prisma.licence.upsert({
          where: { reference: dto.licence_reference },
          update: {},
          create: {
            reference: dto.licence_reference,
            number: dto.licence_reference,
            description: 'Licença criada via import',
            emitted_at: new Date(),
            expires_at: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
          },
        });
      }

      // Salvar POS
      await prisma.pos.create({ data: dto });
      importedPOS.push(dto);
    } catch (err) {
      console.error('Erro na linha:', row, err);
    }
  }

  return importedPOS;
}
