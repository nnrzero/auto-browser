import { Page } from 'puppeteer';
import { ITypeOptions } from '../interfaces';

export async function wait(minMs = 0, maxMs = 0): Promise<void> {
  const delay = Math.random() * (maxMs - minMs) + minMs;
  await new Promise((r) => setTimeout(r, delay));
}

// Typing Methods
export function getTypingConfig(options: ITypeOptions): {
  wpm: number;
  accuracy: number;
  pressureDelay: number;
} {
  const pressureDelays = { light: 0.8, normal: 1, heavy: 1.2 };
  return {
    wpm: options.wpm || 250,
    accuracy: options.accuracy || 0.95,
    pressureDelay: pressureDelays[options.pressure || 'normal']
  };
}

export async function performTyping(
  page: Page,
  text: string,
  config: { wpm: number; accuracy: number; pressureDelay: number }
): Promise<void> {
  const words = text.split(/\s+/);
  const totalChars = text.length;
  const totalWords = words.length;
  const totalTimeToType = (totalWords / config.wpm) * 60 * 1000;
  const avgDelayPerChar = totalTimeToType / totalChars;

  for (const word of words) {
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      let delay = (avgDelayPerChar + Math.random() * 50) * config.pressureDelay;

      if (/[ăâêôơưáàảãạấầẩẫậắằẳẵặếềểễệốồổỗộớờởỡợúùủũụýỳỷỹỵíìỉĩịéèẻẽẹóòỏõọđ]/.test(char)) {
        delay *= 0.8;
      }
      if (/[.,!?]/.test(char)) {
        delay += 100 + Math.random() * 200;
      }

      if (Math.random() > config.accuracy) {
        const wrongChar = String.fromCharCode(char.charCodeAt(0) + (Math.random() > 0.5 ? 1 : -1));
        await page.keyboard.type(wrongChar);
        await wait(200, 300);
        await page.keyboard.press('Backspace');
        await wait(100, 200);
      }

      await page.keyboard.type(char);
      await wait(delay);
    }

    await page.keyboard.type(' ');
    await wait(50 + Math.random() * 100);
  }
}
