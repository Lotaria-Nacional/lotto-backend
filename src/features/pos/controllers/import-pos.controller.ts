import { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { hasPermission } from '../../../middleware/auth/permissions';
import { importPosService } from '../services/import-pos-sevice';
import { posEmitter } from '../sse/pos-emitter';

export async function importPosController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'IMPORT',
      subject: 'POS',
    },
  });

  if (!req.file) return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Ficheiro é obrigatório' });

  const filePath = req.file.path;

  importPosService(filePath, user).catch(e => console.error(e));

  return res.status(HttpStatus.OK).json({ message: 'POS importados com sucesso' });
}

export async function getPosProgress(req: Request, res: Response) {
  // Configuração do stream SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  console.log('📡 Cliente conectado ao SSE de importação.');

  // Função auxiliar para enviar eventos
  const send = (event: string, data: any) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Progresso contínuo
  posEmitter.on('progress', data => send('progress', data));

  // Finalização (apenas uma vez)
  posEmitter.once('done', data => {
    send('done', { ...data, completed: true });
    res.end();
    console.log('✅ SSE concluído e fechado (done).');
  });

  // Erros (apenas uma vez)
  posEmitter.once('error', err => {
    send('error', { message: err.message });
    res.end();
    console.log('❌ SSE encerrado com erro.');
  });

  // Quando o cliente fecha a ligação
  req.on('close', () => {
    posEmitter.removeAllListeners();
    console.log('🔌 Cliente desconectado do SSE.');
  });
}
