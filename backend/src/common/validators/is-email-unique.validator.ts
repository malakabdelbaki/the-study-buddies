import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
  } from 'class-validator';
  import { Injectable } from '@nestjs/common';
  import { UserService } from 'src/users/users.service';
  
  @Injectable()
  @ValidatorConstraint({ async: true })
  export class IsEmailUniqueConstraint implements ValidatorConstraintInterface { //logic
    constructor(private readonly userService: UserService) {}
  
    async validate(email: string): Promise<boolean> {
      // Check if email exists in the database
      const user = await this.userService.findByEmail(email);
      return !user; // Return true if email does not exist
    }
  
    defaultMessage(): string {
      return 'Email $value is already taken!';
    }
  }
  
  export function IsEmailUnique(validationOptions?: ValidationOptions) { //decorator
    return function (object: Object, propertyName: string) {
      registerDecorator({
        target: object.constructor, //eg RegisterDTo
        propertyName: propertyName, //email
        options: validationOptions, //pass any custom options to decorator (like error message)
        constraints: [],
        validator: IsEmailUniqueConstraint, //class that contains logic
      });
    };
  }
  