import { describe, it, expect } from 'vitest';
import { parseCSV, validateImportData } from './dataImport';

describe('dataImport', () => {
  describe('parseCSV', () => {
    it('should parse CSV string into array of objects', () => {
      const csvContent = 'id,name,capacity\n1,Inverter 1,1000\n2,Inverter 2,2000';
      const result = parseCSV(csvContent);

      expect(result).toEqual([
        { id: '1', name: 'Inverter 1', capacity: '1000' },
        { id: '2', name: 'Inverter 2', capacity: '2000' }
      ]);
    });

    it('should handle CSV with quoted values', () => {
      const csvContent = 'id,name,description\n1,"Inverter 1","This is a test"\n2,"Inverter 2","Another test"';
      const result = parseCSV(csvContent);

      expect(result).toEqual([
        { id: '1', name: 'Inverter 1', description: 'This is a test' },
        { id: '2', name: 'Inverter 2', description: 'Another test' }
      ]);
    });

    it('should handle CSV with empty lines', () => {
      const csvContent = 'id,name\n1,Inverter 1\n\n2,Inverter 2';
      const result = parseCSV(csvContent);

      expect(result).toEqual([
        { id: '1', name: 'Inverter 1' },
        { id: '2', name: 'Inverter 2' }
      ]);
    });

    it('should escape HTML special characters to prevent XSS', () => {
      const csvContent = 'id,name\n1,<script>alert("XSS")</script>';
      const result = parseCSV(csvContent);

      expect(result[0].name).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    });
  });

  describe('validateImportData', () => {
    it('should validate inverters data', () => {
      const validData = [
        { id: '1', name: 'Inverter 1', x: 10, y: 20, capacity: 1000 },
        { id: '2', name: 'Inverter 2', x: 30, y: 40, capacity: 2000 }
      ];
      const invalidData = [
        { id: '1', name: 'Inverter 1', x: 10, y: 20 }, // Missing capacity
        { id: '2', name: 'Inverter 2', x: 30, capacity: 2000 } // Missing y
      ];

      expect(validateImportData(validData, 'inverters')).toBe(true);
      expect(validateImportData(invalidData, 'inverters')).toBe(false);
    });

    it('should validate transformers data', () => {
      const validData = [
        { id: '1', name: 'Transformer 1', x: 10, y: 20, capacity: 1000 },
        { id: '2', name: 'Transformer 2', x: 30, y: 40, capacity: 2000 }
      ];
      const invalidData = [
        { id: '1', name: 'Transformer 1', x: 10, y: 20 }, // Missing capacity
        { id: '2', name: 'Transformer 2', x: 30, capacity: 2000 } // Missing y
      ];

      expect(validateImportData(validData, 'transformers')).toBe(true);
      expect(validateImportData(invalidData, 'transformers')).toBe(false);
    });

    it('should validate cable routes data', () => {
      const validData = [
        { id: '1', from: 'Inverter 1', to: 'Transformer 1', length: 100 },
        { id: '2', from: 'Inverter 2', to: 'Transformer 1', length: 200 }
      ];
      const invalidData = [
        { id: '1', from: 'Inverter 1', to: 'Transformer 1' }, // Missing length
        { id: '2', from: 'Inverter 2', length: 200 } // Missing to
      ];

      expect(validateImportData(validData, 'cableRoutes')).toBe(true);
      expect(validateImportData(invalidData, 'cableRoutes')).toBe(false);
    });

    it('should return false for non-array data', () => {
      const nonArrayData = { id: '1', name: 'Inverter 1' };
      expect(validateImportData(nonArrayData as any, 'inverters')).toBe(false);
    });

    it('should return false for unknown data type', () => {
      const validData = [{ id: '1', name: 'Test' }];
      expect(validateImportData(validData, 'unknown')).toBe(false);
    });
  });
});