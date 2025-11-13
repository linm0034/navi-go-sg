const stripBom = (value) => {
  if (typeof value !== 'string') {
    return value;
  }
  return value.replace(/^\uFEFF/, '');
};

const parseCsvLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
};

export const parseCsv = (csvString, { convertNumbers = true } = {}) => {
  if (!csvString || typeof csvString !== 'string') {
    return [];
  }

  const trimmed = stripBom(csvString).trim();
  if (!trimmed) {
    return [];
  }

  const lines = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return [];
  }

  const rawHeaders = parseCsvLine(lines[0]);
  const headers = rawHeaders.map((header, index) => {
    const sanitized = stripBom(header).trim();
    if (!sanitized) {
      return `column_${index}`;
    }
    return sanitized;
  });

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};

    headers.forEach((header, index) => {
      const key = header === 'column_0' ? 'Index' : header;
      const rawValue = values[index] ?? '';
      const cleanedValue = stripBom(rawValue).trim();

      if (convertNumbers && cleanedValue !== '') {
        const numeric = Number(cleanedValue);
        if (!Number.isNaN(numeric)) {
          row[key] = numeric;
          return;
        }
      }

      row[key] = cleanedValue;
    });

    return row;
  });
};

export const calculateNumericSummary = (rows, column) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  const values = rows
    .map((row) => {
      const value = row?.[column];
      if (typeof value === 'number') {
        return value;
      }
      const numeric = Number(value);
      return Number.isNaN(numeric) ? null : numeric;
    })
    .filter((value) => typeof value === 'number');

  if (values.length === 0) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);

  return {
    count: values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    average: total / values.length,
  };
};

export default parseCsv;
