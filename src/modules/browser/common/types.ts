// Options for controlling mouse movement behavior.
export type TMovementOptions = {
  scrollBeforeMove?: boolean;
  variablePath?: boolean;
  hesitationBeforeClick?: boolean;
  maxPause?: number;
  minPause?: number;
  debug?: boolean;
  fadeDuration?: number;
  startX?: number;
  startY?: number;
  target?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  endX?: number;
  endY?: number;
  jitterMin?: number;
  jitterMax?: number;
  jitterCount?: number;
};

export type TDebugOptions = {
  fadeDuration?: number; // Duration (in ms) before the debug visuals fade away. If not provided, they won't fade.
};
