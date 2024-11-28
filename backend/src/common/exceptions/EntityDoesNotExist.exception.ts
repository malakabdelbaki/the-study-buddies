import { NotFoundException } from "@nestjs/common";

export class EntityDoesNotExistException extends NotFoundException {
  constructor(entity: string, id: string) {
    super(`${entity} with id ${id} does not exist.`);
  }
}