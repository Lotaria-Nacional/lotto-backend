import {
  getUserController,
  createUserController,
  updateUserController,
  deleteUserController,
  fetchManyUsersController,
  deleteManyUsersController,
} from './controllers';
import { Router } from 'express';
import catchErrors from '../../utils/catch-errors';
import { updatePasswordController } from './controllers/update-password-controller';

const userRouter = Router();

userRouter.post('/', catchErrors(createUserController));
userRouter.put('/reset-password', catchErrors(updatePasswordController));
userRouter.put('/:id', catchErrors(updateUserController));

userRouter.delete('/bulk', catchErrors(deleteManyUsersController));
userRouter.delete('/:id', catchErrors(deleteUserController));

userRouter.get('/:id', catchErrors(getUserController));
userRouter.get('/', catchErrors(fetchManyUsersController));

export default userRouter;
