import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '🏠 Welcome to KameHouse API! A gamified household task cooperation platform.';
  }
}
