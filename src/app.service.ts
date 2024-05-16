import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    //add two numbers
    return 'Hello World!';
  }
}
