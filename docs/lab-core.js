(function (root) {
  'use strict';
  const samples = () => [
    { sku: 'DEMO-001', buffer: 12 },
    { sku: 'DEMO-002', buffer: 8 },
    { sku: 'DEMO-003', buffer: 5 }
  ];
  function validate(rows) {
    const seen = new Set();
    return rows.map(row => {
      const errors = [];
      if (typeof row.sku !== 'string' || !row.sku.trim()) errors.push('SKU is required');
      else if (seen.has(row.sku.trim().toUpperCase())) errors.push('Duplicate SKU');
      else seen.add(row.sku.trim().toUpperCase());
      if (!Number.isInteger(row.buffer) || row.buffer < 0) errors.push('Use a whole number of zero or more');
      return { ...row, errors, valid: errors.length === 0 };
    });
  }
  const api = { samples, validate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.WorkflowLab = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
