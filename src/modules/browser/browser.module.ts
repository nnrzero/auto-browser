import { Module } from '@nestjs/common';
import { BrowserController } from './controllers/browser.controller';
import { BrowserActionService } from './services/browser-action.service';
import { BrowserService } from './services/browser.service';
import { TestAutomationService } from './services/test-automation.service';

@Module({
  controllers: [BrowserController],
  providers: [BrowserService, BrowserActionService, TestAutomationService],
  exports: [BrowserService, BrowserActionService, TestAutomationService]
})
export class BrowserModule {}
