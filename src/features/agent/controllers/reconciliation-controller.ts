import { upload } from '../routes';
import { Response, Request, Router } from 'express';
import catchErrors from '../../../utils/catch-errors';
import { makeReconciliationService } from '../services/make-reconciliation-service';
import prisma from '../../../lib/prisma';

export async function reconciliationController(req: Request, res: Response) {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Nenhum ficheiro fornecido' });
    }

    const response = await makeReconciliationService(files);
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}

export async function getReconciliationController(req: Request, res: Response) {
  const take = { take: 5 };
  try {
    const afrimoney = await prisma.afrimoney.findMany({
      ...take,
      select: {
        id: true,
        transferId: true,
        remarks: true,
        transferValue: true,
      },
    });

    const koralPlay = await prisma.koralPlay.findMany({
      ...take,
      select: {
        id: true,
        date: true,
        operationDate: true,
        operation: true,
        senderStaffReference: true,
        signedBy: true,
        createdAt: true,
      },
    });

    return res.status(200).json({ afrimoney, koralPlay });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
}

const reconciliationRouter = Router();

reconciliationRouter.post('/', upload.array('files'), catchErrors(reconciliationController));
reconciliationRouter.get('/', catchErrors(getReconciliationController));

export default reconciliationRouter;
