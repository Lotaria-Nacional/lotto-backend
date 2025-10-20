import multer from 'multer';
import { Router } from 'express';
import * as controllers from './controllers';
import catchErrors from '../../utils/catch-errors';

const agentRouter = Router();

export const upload = multer({ dest: 'uploads/' });
export const uploadStorage = multer({ storage: multer.memoryStorage() });

agentRouter.post('/', catchErrors(controllers.createAgentController));
agentRouter.post('/activities', upload.array('files'), controllers.importActivitiesController);
agentRouter.post('/import', upload.single('file'), catchErrors(controllers.importAgentsController));
// agentRouter.get('/import/progress', controllers.getAgentProgress);

agentRouter.put('/activities/block', catchErrors(controllers.blockAgentsActivityController));
agentRouter.put('/activities/unblock', catchErrors(controllers.unblockAgentsActivityController));

agentRouter.put('/reset-many', catchErrors(controllers.resetManyAgentsController));
agentRouter.put('/approve-many', catchErrors(controllers.approveManyAgentsController));
agentRouter.put('/desativate-many', catchErrors(controllers.desativateManyAgentsController));
agentRouter.put('/disapprove-many', catchErrors(controllers.disapproveManyAgentsController));
agentRouter.put('/discontinue-many', catchErrors(controllers.discontinueManyAgentsController));
agentRouter.put('/reactivate-many', catchErrors(controllers.reactivateManyAgentsController));

agentRouter.put('/reset/:id', catchErrors(controllers.resetAgentController));
agentRouter.put('/approve/:id', catchErrors(controllers.approveAgentController));
agentRouter.put('/reactivate/:id', catchErrors(controllers.reactivateAgentController));
agentRouter.put('/desativate/:id', catchErrors(controllers.desativateAgentController));
agentRouter.put('/disapprove/:id', catchErrors(controllers.disapproveAgentController));
agentRouter.put('/discontinue/:id', catchErrors(controllers.discontinueAgentController));
agentRouter.put('/re-schedule-training/:id', catchErrors(controllers.reScheduleTrainingController));
agentRouter.put('/associate/:id', catchErrors(controllers.activateAgentController));
agentRouter.put('/:id', catchErrors(controllers.updateAgentController));

agentRouter.delete('/:id', catchErrors(controllers.deleteAgentController));

agentRouter.get('/activities', catchErrors(controllers.fetchActivitiesController));
agentRouter.get('/info', catchErrors(controllers.getAgentsInfoController));
agentRouter.get('/export', catchErrors(controllers.exportAgentController));
agentRouter.get('/history', catchErrors(controllers.fetchAgentsHistoryController));
agentRouter.get('/', catchErrors(controllers.fetchAgentsController));
agentRouter.get('/:id', catchErrors(controllers.getAgentController));

export default agentRouter;
