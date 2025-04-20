import { Injectable, Logger } from '@nestjs/common';
import { sleep } from 'src/common/utils/helper';
import { BrowserActionService } from './browser-action.service';
import { BrowserService } from './browser.service';

@Injectable()
export class TestAutomationService {
  private readonly logger = new Logger(TestAutomationService.name);

  constructor(
    private readonly browserActionService: BrowserActionService,
    private readonly browserService: BrowserService
  ) {}

  // @Timeout(1000)
  async test() {
    try {
      const profileId = 'email@gmail.com';

      await this.browserService.launchNewBrowser(profileId);

      const page1 = await this.browserService.createNewPage(profileId);

      await page1.page.goto('https://google.com/');

      await sleep(5000);

      const page2 = await this.browserService.createNewPage(profileId);

      await page2.page.goto('https://baidu.com');

      await sleep(5000);

      await page1.page.close();

      await sleep(5000);

      await page2.page.close();

      await sleep(5000);

      await this.browserService.closeBrowser(profileId);
    } catch (error) {
      console.log('error:::', error);
    }
  }
}
