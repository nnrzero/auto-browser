import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import * as Joi from 'joi';
import { AllExceptionFilter } from './common/filter/exception.filter';
import { MainController } from './main.controller';
import { BrowserModule } from './modules/browser/browser.module';

/*
 *****************************************
 *
 *
 */

const commonSchema = Joi.object({
  TZ: Joi.string().valid('UTC').required(),
  SWAGGER_USERNAME: Joi.string().required(),
  SWAGGER_PASSWORD: Joi.string().required(),
  API_KEY: Joi.string().required()
});

const combinedSchema = commonSchema;

/*
 *****************************************
 *
 *
 */

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
      validationSchema: combinedSchema
    }),
    ScheduleModule.forRoot(),
    BrowserModule
  ],
  controllers: [MainController],
  exports: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter
    }
  ]
})
export class MainModule {}
