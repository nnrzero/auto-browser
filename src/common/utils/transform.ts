export function transformJSON(value: string) {
  if (!value) {
    return null;
  }

  if (typeof value === 'object') {
    return value;
  }

  return JSON.parse(value);
}

export function transformArray(value: string) {
  try {
    if (!value) {
      return [];
    }
    return JSON.parse(value);
  } catch (error) {
    return [];
  }
}
