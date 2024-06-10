import express, { Express } from "express";
import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import router from "../../routes/upload";
import { extractDataFromPDF } from "../../services/pdf-service";
import { loadExistingData, compareData } from "../../utils/data-utils";

vi.mock('../services/pdf-service', () => ({
  extractDataFromPDF: vi.fn(),
}));

vi.mock('../utils/data-utils', () => ({
  loadExistingData: vi.fn(),
  compareData: vi.fn(),
}));

const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import multer from 'multer';
const upload = multer();
app.use('/upload', upload.single('file'), router);

describe('POST /upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 if file or company name is missing', async () => {
    const res = await request(app).post('/upload').send({});
    expect(res.status).toBe(400);
    expect(res.text).toBe('File and company name are required');
  });

  it('should return 500 if an error occurs during data extraction or comparison', async () => {
    vi.mock('../services/pdf-service', () => ({
      extractDataFromPDF: vi.fn().mockRejectedValue(new Error('Extraction error')),
    }));

    const res = await request(app)
      .post('/upload')
      .field('companyName', 'Dummy Company')
      .attach('file', Buffer.from('dummy content'), 'dummy.pdf');

    expect(res.status).toBe(500);
    expect(res.text).toBe('An error occurred');
  });

  it('should return 200 and the comparison summary on success', async () => {
    const mockExtractedData = { 'Company Name': 'Dummy Company' };
    const mockExistingData = [{ 'Company Name': 'Dummy Company', 'Revenue': 100 }];
    const mockSummary = { extractedData: mockExtractedData, companyData: mockExistingData[0], mismatches: {} };

    vi.mock('../services/pdf-service', () => ({
      extractDataFromPDF: vi.fn().mockResolvedValueOnce(mockExtractedData),
    }));


    vi.mock('../services/pdf-service', () => ({
      loadExistingData: vi.fn().mockResolvedValueOnce(mockExistingData),
      compareData: vi.fn().mockResolvedValueOnce(mockSummary),
    }));

    const res = await request(app)
      .post('/upload')
      .field('companyName', 'Dummy Company')
      .attach('file', Buffer.from('dummy content'), 'dummy.pdf');


    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockSummary);
  });
});
