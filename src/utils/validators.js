export const isPositiveInt = (v) => Number.isInteger(Number(v)) && Number(v) > 0;

export const isValidDate = (v) => {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(v);
};

export const isValidTime = (v) => typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);

// Id de MongoDB (ObjectId): 24 caracteres hexadecimales
export const isValidObjectId = (v) => typeof v === "string" && /^[0-9a-fA-F]{24}$/.test(v);

export const isValidEmail = (v) => typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
