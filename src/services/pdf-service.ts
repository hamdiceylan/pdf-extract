import { PdfService, CompanyPDFData } from '../pdf-service';

const pdfService = new PdfService('TEST_KEY');

export const extractDataFromPDF = async (fileName: string): Promise<CompanyPDFData> => {
    const filePath = `assets/${fileName}`;

    return pdfService.extract(filePath);
};
