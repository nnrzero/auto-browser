import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import { IBrowserActionParams, IBrowserActionResult, IGetPagesResult, IPageInfo } from '../interfaces/browser.interface';
import StealthPlugin = require('puppeteer-extra-plugin-stealth');

const DEFAULT_BROWSER_OPTIONS = {
  headless: true,
  userDataDir: 'data/local',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--start-maximized'],
  defaultViewport: null
};

@Injectable()
export class BrowserService {
  private readonly logger = new Logger(BrowserService.name);
  private readonly PROFILES_DIR = 'data/local';

  constructor() {
    puppeteer.use(StealthPlugin());
  }

  private getProfilePath(profileId: string): string {
    return path.join(this.PROFILES_DIR, profileId);
  }

  private async findExistingDebuggerEndpoint(profilePath: string): Promise<string | null> {
    try {
      const devToolsPath = path.join(profilePath, 'DevToolsActivePort');

      if (fs.existsSync(devToolsPath)) {
        const content = fs.readFileSync(devToolsPath, 'utf8').split('\n');

        if (content.length > 1) {
          const port = content[0];
          const wsPath = content[1];
          return `ws://127.0.0.1:${port}${wsPath}`;
        }
      }

      return null;
    } catch (error) {
      this.logger.warn(`Error finding debugger endpoint: ${error.message}`);
      return null;
    }
  }

  async settingProfile(profileId: string): Promise<Browser> {
    const profilePath = this.getProfilePath(profileId);

    const debuggerEndpoint = await this.findExistingDebuggerEndpoint(profilePath);

    if (debuggerEndpoint) {
      try {
        const browser = await puppeteer.connect({
          browserWSEndpoint: debuggerEndpoint,
          defaultViewport: null
        });

        await browser?.close();
      } catch (error) {}
    }

    return await puppeteer.launch({
      ...DEFAULT_BROWSER_OPTIONS,
      headless: false,
      userDataDir: profilePath
    });
  }

  async launchNewBrowser(profileId: string): Promise<Browser> {
    const profilePath = this.getProfilePath(profileId);

    if (!fs.existsSync(profilePath)) {
      fs.mkdirSync(profilePath, { recursive: true });
    }

    return await puppeteer.launch({
      ...DEFAULT_BROWSER_OPTIONS,
      userDataDir: profilePath
    });
  }

  async getBrowser(profileId: string): Promise<Browser> {
    const profilePath = this.getProfilePath(profileId);
    const debuggerEndpoint = await this.findExistingDebuggerEndpoint(profilePath);

    if (debuggerEndpoint) {
      try {
        const browser = await puppeteer.connect({
          browserWSEndpoint: debuggerEndpoint,
          defaultViewport: null
        });

        if (browser.connected) {
          return browser;
        }

        await browser.close();
      } catch (error) {
        this.logger.warn(`Failed to connect to existing browser: ${error.message}`);
      }
    }

    return this.launchNewBrowser(profileId);
  }

  private async findPageInBrowser(browser: Browser, pageId: string): Promise<Page | null> {
    const pages = await browser.pages();
    const pageIds = await Promise.all(pages.map((p) => this.getPageId(p)));
    const pageIndex = pageIds.findIndex((id) => id === pageId);
    return pageIndex !== -1 ? pages[pageIndex] : null;
  }

  async getPageById(profileId: string, pageId: string): Promise<Page | null> {
    const browser = await this.getBrowser(profileId);

    try {
      const page = await this.findPageInBrowser(browser, pageId);

      if (!page || page.isClosed()) {
        return null;
      }

      return page;
    } catch (error) {
      this.logger.error(`Error getting page: ${error.message}`);
      return null;
    }
  }

  async createNewPage(profileId: string): Promise<{ page: Page; pageId: string }> {
    const browser = await this.getBrowser(profileId);
    const page = await browser.newPage();
    const pageId = await this.getPageId(page);

    // Cấu hình mặc định cho page mới
    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(30000);

    return { page, pageId };
  }

  async executeAction(params: IBrowserActionParams): Promise<IBrowserActionResult> {
    let page: Page | null = null;
    let browser: Browser | null = null;
    let pageId: string | null = null;

    try {
      browser = await this.getBrowser(params.profileId);

      if (params.pageId) {
        page = await this.findPageInBrowser(browser, params.pageId);

        if (!page) {
          return {
            success: false,
            pageId: params.pageId,
            error: 'Page not found'
          };
        }
      }

      page = await browser.newPage();

      pageId = await this.getPageId(page);

      const result = await params.action(page);

      return {
        success: true,
        pageId,
        data: result
      };
    } catch (error) {
      this.logger.error(`Error executing action: ${error.message}`);
      return {
        success: false,
        pageId,
        error: error.message
      };
    } finally {
      if (browser && browser.connected) {
        await browser.disconnect();
      }
    }
  }

  async getPages(profileId: string): Promise<IGetPagesResult> {
    const browser = await this.getBrowser(profileId);
    try {
      const pages = await browser.pages();
      const pagesInfo = await Promise.all(pages.map(async (page) => this.pageInfo(page)));

      return {
        success: true,
        pages: pagesInfo
      };
    } catch (error) {
      this.logger.error(`Error getting pages: ${error.message}`);
      return {
        success: false,
        pages: [],
        error: error.message
      };
    } finally {
      await browser.disconnect();
    }
  }

  async pageInfo(page: Page): Promise<IPageInfo> {
    return {
      pageId: await this.getPageId(page),
      url: page.url(),
      title: await page.title(),
      isClosed: page.isClosed()
    };
  }

  async closePage(profileId: string, pageId: string): Promise<{ success: boolean; error?: string }> {
    let browser: Browser | null = null;
    try {
      browser = await this.getBrowser(profileId);
      const page = await this.findPageInBrowser(browser, pageId);

      if (page && !page.isClosed()) {
        await page.close();
        return { success: true };
      }
      return { success: false, error: 'Page not found or already closed' };
    } catch (error) {
      this.logger.error(`Error closing page: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      if (browser && browser.connected) {
        await browser.disconnect();
      }
    }
  }

  async getPageId(page: Page): Promise<string> {
    return (await page.createCDPSession()).send('Target.getTargetInfo').then((res) => res.targetInfo.targetId);
  }

  async closeBrowser(profileId: string): Promise<void> {
    const browser = await this.getBrowser(profileId);
    await browser.close();
  }
}
