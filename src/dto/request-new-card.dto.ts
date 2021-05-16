import { IsNotEmpty, IsString } from 'class-validator';

export class RequestJobCardDTO {
  @IsNotEmpty()
  @IsString()
  jobCardId: string;
}
