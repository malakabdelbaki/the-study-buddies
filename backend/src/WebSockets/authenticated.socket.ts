import { Socket as DefaultSocket } from 'socket.io';
import { Types } from 'mongoose';
import { Role } from '../enums/role.enum';

export interface AuthenticatedSocket extends DefaultSocket {
  user?: Types.ObjectId;
  role?: Role; 
}
