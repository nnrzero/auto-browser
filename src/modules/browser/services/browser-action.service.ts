import { Injectable, Logger } from '@nestjs/common';
import { Page } from 'puppeteer';
import { debugShowPosition } from '../common/utils/debugUtils';
import { getTypingConfig, performTyping } from '../common/utils/keyboardUtils';
import {
  ClickActionParams,
  EBrowserActionType,
  EvaluateActionParams,
  GetTextParams,
  GotoActionParams,
  HoverActionParams,
  PressActionParams,
  TypeActionParams,
  WaitForSelectorParams
} from '../interfaces/browser.interface';
import { BrowserService } from './browser.service';

@Injectable()
export class BrowserActionService {
  private readonly logger = new Logger(BrowserActionService.name);

  constructor(private readonly browserService: BrowserService) {}

  async executeAction(profileId: string, pageId: string | undefined, actionType: EBrowserActionType, params: any) {
    return this.browserService.executeAction({
      profileId,
      pageId,
      action: async (page: Page) => {
        await debugShowPosition(page, 100, 100);

        switch (actionType) {
          case EBrowserActionType.GOTO:
            return this.goto(page, params as GotoActionParams);
          case EBrowserActionType.TYPE:
            return this.type(page, params as TypeActionParams);
          case EBrowserActionType.CLICK:
            return this.click(page, params as ClickActionParams);
          case EBrowserActionType.HOVER:
            return this.hover(page, params as HoverActionParams);
          case EBrowserActionType.PRESS:
            return this.press(page, params as PressActionParams);
          case EBrowserActionType.WAIT_FOR_SELECTOR:
            return this.waitForSelector(page, params as WaitForSelectorParams);
          case EBrowserActionType.GET_TEXT:
            return this.getText(page, params as GetTextParams);
          case EBrowserActionType.EVALUATE:
            return this.evaluate(page, params as EvaluateActionParams);
          case EBrowserActionType.CLOSE_TAB:
            return this.closeTab(page);
          default:
            throw new Error(`Unsupported action type: ${actionType}`);
        }
      }
    });
  }

  private async goto(page: Page, params: GotoActionParams) {
    await page.goto(params.url, { waitUntil: 'domcontentloaded', timeout: params.timeout || 30000 });
    return { url: page.url() };
  }

  private async type(page: Page, params: TypeActionParams) {
    const typingConfig = getTypingConfig({});
    await performTyping(page, params.text, typingConfig);

    return { typed: true };
  }

  private async click(page: Page, params: ClickActionParams) {
    await page.waitForSelector(params.selector, { timeout: 30000 });
    await page.click(params.selector);
    return { clicked: true };
  }

  private async hover(page: Page, params: HoverActionParams) {
    await page.waitForSelector(params.selector);
    await page.hover(params.selector);
    return { hovered: true };
  }

  private async press(page: Page, params: PressActionParams) {
    await page.keyboard.press(params.key);
    return { pressed: true };
  }

  private async waitForSelector(page: Page, params: WaitForSelectorParams) {
    await page.waitForSelector(params.selector, { timeout: params.timeout });
    return { waited: true };
  }

  private async getText(page: Page, params: GetTextParams) {
    await page.waitForSelector(params.selector);
    const element = await page.$(params.selector);
    const text = await page.evaluate((el) => el.textContent, element);
    return { text };
  }

  /**
   * 
   * @param page
   * @param params
   * @returns
   * Usage
   * params: {
   *   script: `
   *     const articles = document.querySelectorAll(arg0);
   *     const el = articles[articles.length - 1];
   *     const img = el.querySelector(arg1);
   *     return img.getAttribute(arg2);
   *   `,
   *   args: ['.composer-parent article', 'img', 'src']
  }
   */
  private async evaluate(page: Page, params: EvaluateActionParams) {
    const result = await page.evaluate(
      (scriptText, scriptArgs) => {
        const func = new Function(...(scriptArgs?.map((_, i) => `arg${i}`) || []), scriptText);
        return func(...(scriptArgs || []));
      },
      params.script,
      params.args
    );
    return { result };
  }

  /**
   * Đóng tab hiện tại
   * @param page Trang cần đóng
   * @param _params Không cần tham số đặc biệt
   * @returns Thông tin về việc đóng tab
   */
  private async closeTab(page: Page) {
    try {
      this.logger.debug('Closing current tab');
      await page.close();
      return { closed: true, message: 'Tab đã được đóng thành công' };
    } catch (error) {
      this.logger.error(`Error closing tab: ${error.message}`);
      throw new Error(`Không thể đóng tab: ${error.message}`);
    }
  }
}
