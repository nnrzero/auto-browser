import { KeyInput, Page } from 'puppeteer';

export interface IPageInfo {
  pageId: string;
  url: string;
  title: string;
  isClosed: boolean;
}

export interface IBrowserActionParams {
  profileId: string;
  pageId?: string;
  action: (page: Page) => Promise<any>;
}

export interface IBrowserActionResult {
  success: boolean;
  pageId: string;
  data?: any;
  error?: string;
}

export interface IGetPagesResult {
  success: boolean;
  pages: Array<{
    pageId: string;
    url: string;
    title: string;
    isClosed: boolean;
  }>;
  error?: string;
}

// Định nghĩa các action type với mô tả chi tiết
export enum EBrowserActionType {
  /**
   * Điều hướng đến một URL cụ thể
   */
  GOTO = 'goto',

  /**
   * Nhập text vào một element được chỉ định bởi selector
   */
  TYPE = 'type',

  /**
   * Click vào một element được chỉ định bởi selector
   */
  CLICK = 'click',

  /**
   * Di chuột qua một element được chỉ định bởi selector
   */
  HOVER = 'hover',

  /**
   * Nhấn một phím trên bàn phím (Enter, Tab, etc.)
   */
  PRESS = 'press',

  /**
   * Đợi cho đến khi một element xuất hiện trên trang
   */
  WAIT_FOR_SELECTOR = 'waitForSelector',

  /**
   * Lấy nội dung text của một element được chỉ định bởi selector
   */
  GET_TEXT = 'getText',

  /**
   * Thực thi một đoạn JavaScript tùy chỉnh trên trang
   */
  EVALUATE = 'evaluate',

  /**
   * Đóng tab hiện tại
   */
  CLOSE_TAB = 'closeTab'
}

// Interface cho các tham số của từng action
export interface GotoActionParams {
  url: string;
  timeout?: number;
}

export interface TypeActionParams {
  selector: string;
  text: string;
}

export interface ClickActionParams {
  selector: string;
}

export interface HoverActionParams {
  selector: string;
}

export interface PressActionParams {
  key: KeyInput;
}

export interface WaitForSelectorParams {
  selector: string;
  timeout?: number;
}

export interface GetTextParams {
  selector: string;
}

export interface EvaluateActionParams {
  script: string;
  args?: any[];
}

export type BrowserAction =
  | {
      type: EBrowserActionType.GOTO;
      params: GotoActionParams;
      description: 'Chuyển hướng đến một URL cụ thể';
    }
  | {
      type: EBrowserActionType.TYPE;
      params: TypeActionParams;
      description: 'Nhập text vào một element được chỉ định bởi selector';
    }
  | {
      type: EBrowserActionType.CLICK;
      params: ClickActionParams;
      description: 'Click vào một element được chỉ định bởi selector';
    }
  | {
      type: EBrowserActionType.HOVER;
      params: HoverActionParams;
      description: 'Di chuột qua một element được chỉ định bởi selector';
    }
  | {
      type: EBrowserActionType.PRESS;
      params: PressActionParams;
      description: 'Nhấn một phím trên bàn phím (Enter, Tab, etc.)';
    }
  | {
      type: EBrowserActionType.WAIT_FOR_SELECTOR;
      params: WaitForSelectorParams;
      description: 'Đợi cho đến khi một element xuất hiện trên trang';
    }
  | {
      type: EBrowserActionType.GET_TEXT;
      params: GetTextParams;
      description: 'Lấy nội dung text của một element được chỉ định bởi selector';
    }
  | {
      type: EBrowserActionType.EVALUATE;
      params: EvaluateActionParams;
      description: 'Thực thi một đoạn JavaScript tùy chỉnh trên trang';
    }
  | {
      type: EBrowserActionType.CLOSE_TAB;
      params: object;
      description: 'Đóng tab hiện tại';
    };

// Helper để lấy mô tả cho mỗi action type
export const ACTION_DESCRIPTIONS: Record<EBrowserActionType, string> = {
  [EBrowserActionType.GOTO]: 'Điều hướng đến một URL cụ thể',
  [EBrowserActionType.TYPE]: 'Nhập text vào một element được chỉ định bởi selector',
  [EBrowserActionType.CLICK]: 'Click vào một element được chỉ định bởi selector',
  [EBrowserActionType.HOVER]: 'Di chuột qua một element được chỉ định bởi selector',
  [EBrowserActionType.PRESS]: 'Nhấn một phím trên bàn phím (Enter, Tab, etc.)',
  [EBrowserActionType.WAIT_FOR_SELECTOR]: 'Đợi cho đến khi một element xuất hiện trên trang',
  [EBrowserActionType.GET_TEXT]: 'Lấy nội dung text của một element được chỉ định bởi selector',
  [EBrowserActionType.EVALUATE]: 'Thực thi một đoạn JavaScript tùy chỉnh trên trang',
  [EBrowserActionType.CLOSE_TAB]: 'Đóng tab hiện tại'
};

// Helper type để lấy params type dựa vào action type
export type ActionParamsType<T extends EBrowserActionType> = Extract<BrowserAction, { type: T }>['params'];

// Helper type để lấy description dựa vào action type
export type ActionDescription<T extends EBrowserActionType> = Extract<BrowserAction, { type: T }>['description'];
