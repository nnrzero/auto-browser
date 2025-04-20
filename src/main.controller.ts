import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller()
export class MainController {
  @Get()
  getHello(): string {
    return 'OK';
  }
}
