import { ChatType } from 'src/enums/chat-type.enum';
import { ChatVisibility } from 'src/enums/chat-visibility.enum';
import { Role } from 'src/enums/role.enum';

export interface Chat {
  _id: string;
  chat_name: string;
  participants: string[];
  type: ChatType;
  visibility: ChatVisibility;
  course_id: string;
}
