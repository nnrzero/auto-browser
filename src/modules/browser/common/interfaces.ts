export interface ITypeOptions {
  wpm?: number;
  accuracy?: number;
  pressure?: 'light' | 'normal' | 'heavy';
}

export interface ICustomWindow extends Window {
  debugCanvas: HTMLCanvasElement | undefined;
  debugCanvasCtx: CanvasRenderingContext2D;
}
