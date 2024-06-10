import fs from 'fs';
import csv from 'csv-parser';
import { CompanyPDFData } from '../pdf-service';

interface CompanyData {
    'Company Name': string;
    [key: string]: string | number;
}

export const loadExistingData = (filePath: string): Promise<CompanyData[]> => {
    return new Promise((resolve, reject) => {
        const results: CompanyData[] = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
};

export const compareData = (extractedData: CompanyPDFData, existingData: CompanyData[], companyName: string) => {
    const companyData = existingData.find((data) => data['Company Name'] === companyName);

    if (!companyData) {
        throw new Error('Company data not found');
    }

    const summary = {
        extractedData,
        companyData,
        mismatches: {} as { [key: string]: { extracted: string | number, existing: string | number } }
    };

    for (const key in companyData) {
        if (companyData[key] !== extractedData[key]) {
            summary.mismatches[key] = {
                extracted: extractedData[key],
                existing: companyData[key],
            };
        }
    }

    return summary;
};
