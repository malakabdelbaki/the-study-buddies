import { PartialType } from '@nestjs/mapped-types';
import { CreateThreadDto } from './create-thread.dto';
import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';
import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateThreadDto extends PartialType(CreateThreadDto) {
}
