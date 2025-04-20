export const getSwaggerDescriptionForEnum = (entity: any) => {
  const keys = Object.keys(entity).filter((key) => isNaN(Number(key)));

  const arr = [];
  keys.forEach((key) => {
    arr.push(`${key} = ${entity[key]}`);
  });
  return arr.join(' | ');
};
