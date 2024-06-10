import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractDataFromPDF } from '../../services/pdf-service';
import { PdfService } from '../../pdf-service';

vi.mock('../../pdf-service', () => {
    const mockPdfServiceInstance = {
        extract: vi.fn()
    };
    return {
        PdfService: vi.fn().mockImplementation(() => mockPdfServiceInstance)
    };
});

describe('extractDataFromPDF', () => {
    let mockExtract: any;

    beforeEach(() => {
        vi.clearAllMocks();
        const mockPdfServiceInstance = new PdfService('TEST_KEY');
        mockExtract = mockPdfServiceInstance.extract;
    });

    it('should call PdfService.extract with the correct file path', async () => {
        const mockData = { 'Company Name': 'Dummy Company' };
        mockExtract.mockResolvedValue(mockData);

        const fileName = 'dummy.pdf';
        const result = await extractDataFromPDF(fileName);

        expect(mockExtract).toHaveBeenCalledWith(`assets/${fileName}`);
        expect(result).toEqual(mockData);
    });

    it('should throw an error if PdfService.extract fails', async () => {
        const mockError = new Error('Extraction error');
        mockExtract.mockRejectedValue(mockError);

        const fileName = 'dummy.pdf';

        await expect(extractDataFromPDF(fileName)).rejects.toThrow('Extraction error');
    });
});
