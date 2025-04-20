/*
 *****************************************
 *
 *
 */

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const getEnumKeys = (entity: any) => {
  const keys = Object.keys(entity).filter((key) => isNaN(Number(key)));
  return keys;
};

export const getEnumValues = (entity: any) => {
  const values = Object.keys(entity)
    .filter((key) => !isNaN(Number(key)))
    .map((key) => Number(key));
  return values;
};
