export const sortOrderTransformer = (val: string | undefined) => {
  if (val === "asc") return 1;

  if (val === "desc") return -1;

  return undefined;
};

export const filterTypeTransformer = (val: string | undefined) => {
  if (typeof val === "undefined") {
    return undefined;
  }

  return val.split(",").map((type) => type.trim());
};

export const booleanTypeTransformer = (val: string | undefined) => {
  if (typeof val === "undefined") {
    return undefined;
  }

  return val === "true";
};

export const safeIntWithDefaultTransformer = (
  defaultValue = 1,
): ((val: string | undefined) => number | undefined) => {
  return (val) => {
    if (typeof val === "undefined") {
      return defaultValue;
    }

    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  };
};

export const booleanishTypeTransformer = (val: string | undefined) => {
  if (typeof val === "undefined") {
    return undefined;
  }

  return val === "true" || val === "1";
};
