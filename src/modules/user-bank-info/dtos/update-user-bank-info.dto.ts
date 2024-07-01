// import { PartialType } from '@nestjs/mapped-types';
import { PartialType } from '@nestjs/swagger';
import { CreateUserBankInfoDto } from './create-user-bank-info.dto';

export class UpdateUserBankInfoDto extends PartialType(CreateUserBankInfoDto) {}
