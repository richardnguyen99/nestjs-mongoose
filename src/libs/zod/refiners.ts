export const nonEmptyStringRefiner = (s: string) => s.trim().length > 0;

export const booleanishTypeTransformer = (val: string) => {
  return val === "true" || val === "false" || val === "1" || val === "0";
};

export const baseTenIntRefiner = (val: string) => {
  const parsed = parseInt(val, 10);
  return !isNaN(parsed) && parsed >= 0;
};
