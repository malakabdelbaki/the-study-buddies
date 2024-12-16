import { Socket } from 'socket.io';
import { Types } from 'mongoose';
import { Role } from '../enums/role.enum';

export interface AuthenticatedSocket extends Socket {
  user: {
    userid: Types.ObjectId;
    role: Role;
    email: string;
    name: string;
  };
}

