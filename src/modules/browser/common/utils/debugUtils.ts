import { Page } from 'puppeteer';
import { ICustomWindow } from '../interfaces';
import { TDebugOptions, TMovementOptions } from '../types';

declare const window: ICustomWindow;

// Helper functions cho phạm vi global
const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateBezierPoints = (startX: number, startY: number, endX: number, endY: number, numPoints = 3): Array<[number, number]> => {
  const points: Array<[number, number]> = [];
  const deltaX = endX - startX;
  const deltaY = endY - startY;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const randomOffsetX = getRandomInt(-20, 20);
    const randomOffsetY = getRandomInt(-20, 20);

    const x = startX + deltaX * t + (i !== 0 && i !== numPoints ? randomOffsetX : 0);
    const y = startY + deltaY * t + (i !== 0 && i !== numPoints ? randomOffsetY : 0);

    points.push([x, y]);
  }

  return points;
};

const createRandomDelay = async (min: number, max: number): Promise<void> => {
  const delay = getRandomInt(min, max);
  return new Promise((resolve) => setTimeout(resolve, delay));
};

export const simulateHumanBehavior = async (page: Page): Promise<void> => {
  // Thêm các script để bypass detection
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 4 });

    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function (parameter) {
      if (parameter === 37445) {
        return 'Intel Inc.';
      }

      if (parameter === 37446) {
        return 'Intel Iris OpenGL Engine';
      }

      return getParameter.apply(this, [parameter]);
    };
  });

  // Sau đó thực hiện các hành vi giả lập
  await page.evaluate(() => {
    // Helper functions trong context của browser
    function getRandomIntInBrowser(min: number, max: number): number {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function createAndDispatchMouseEvent(type: string, x: number, y: number): MouseEvent {
      const event = new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        view: window,
        detail: 1,
        screenX: x + getRandomIntInBrowser(0, 10),
        screenY: y + getRandomIntInBrowser(0, 10),
        clientX: x,
        clientY: y,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false,
        button: 0,
        relatedTarget: null
      });
      document.dispatchEvent(event);
      return event;
    }

    // Theo dõi thời gian giữa các lần di chuyển chuột
    let lastMoveTime = Date.now();
    const moveThreshold = 2000; // 2 seconds

    document.addEventListener('mousemove', () => {
      const currentTime = Date.now();
      if (currentTime - lastMoveTime > moveThreshold) {
        // Nếu không có chuyển động trong 2 giây, tạo một số chuyển động ngẫu nhiên
        const randomX = getRandomIntInBrowser(0, window.innerWidth);
        const randomY = getRandomIntInBrowser(0, window.innerHeight);
        createAndDispatchMouseEvent('mousemove', randomX, randomY);
      }
      lastMoveTime = currentTime;
    });

    // Thêm các event listeners giả với xử lý tối thiểu
    const noop = () => {
      /* no operation */
    };

    window.addEventListener('focus', noop);
    window.addEventListener('blur', noop);
    document.addEventListener('visibilitychange', noop);
  });
};

export const debugShowPosition = async (page: Page, x: number, y: number, options?: TDebugOptions): Promise<void> => {
  // Thực hiện human behavior trước
  await simulateHumanBehavior(page);

  // Tạo đường đi ngẫu nhiên đến điểm đích
  const points = generateBezierPoints(getRandomInt(0, 100), getRandomInt(0, 100), x, y);

  // Di chuyển qua từng điểm với tốc độ và delay ngẫu nhiên
  for (let i = 0; i < points.length - 1; i++) {
    const [startX, startY] = points[i];
    const [endX, endY] = points[i + 1];

    await page.evaluate(
      (startX, startY, endX, endY) => {
        // Helper function trong context của browser
        function createAndDispatchMouseEvent(type: string, x: number, y: number): MouseEvent {
          const event = new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: x,
            clientY: y
          });
          document.dispatchEvent(event);
          return event;
        }

        createAndDispatchMouseEvent('mousemove', endX, endY);
      },
      startX,
      startY,
      endX,
      endY
    );

    await createRandomDelay(50, 200);

    await debugDrawSegment(page, startX, startY, endX, endY, {
      fadeDuration: options?.fadeDuration || 1000
    });
  }

  return page.evaluate(
    (x, y, options) => {
      function createDebugElement(styles: Record<string, string>): HTMLElement {
        const element = document.createElement('div');
        Object.assign(element.style, styles);
        document.body.appendChild(element);
        return element;
      }

      const dot = createDebugElement({
        position: 'absolute',
        width: '2px',
        height: '2px',
        borderRadius: '50%',
        backgroundColor: 'red',
        transform: 'translate(-50%, -50%)',
        left: `${x}px`,
        top: `${y}px`,
        zIndex: '999999'
      });

      if (options?.fadeDuration) {
        setTimeout(() => dot.remove(), options.fadeDuration);
      }
    },
    x,
    y,
    options
  );
};

export const debugDrawSegment = async (
  page: Page,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  options: TMovementOptions
): Promise<void> => {
  await page.evaluate(
    (startX, startY, endX, endY, options) => {
      const ctx = window.debugCanvasCtx;
      if (!ctx) return;

      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      if (options.fadeDuration) {
        setTimeout(() => {
          const padding = 2;
          const x = Math.min(startX, endX) - padding;
          const y = Math.min(startY, endY) - padding;
          const width = Math.abs(endX - startX) + 2 * padding;
          const height = Math.abs(endY - startY) + 2 * padding;

          ctx.clearRect(x, y, width, height);
        }, options.fadeDuration);
      }
    },
    startX,
    startY,
    endX,
    endY,
    options
  );
};
