import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";
import path from "path";
import { loadExistingData, compareData } from "../../utils/data-utils";
import { CompanyPDFData } from "../../pdf-service";
import { EventEmitter } from "events";

vi.mock("fs");

describe("loadExistingData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should load existing data from a CSV file", async () => {
    const mockCSVData = [
      { "Company Name": "Dummy Company", Revenue: 100 },
      { "Company Name": "Another Company", Revenue: 200 },
    ];

    const mockStream = new EventEmitter();
    mockStream.pipe = vi.fn().mockReturnValue(mockStream);

    vi.spyOn(fs, "createReadStream").mockReturnValue(mockStream as any);

    process.nextTick(() => {
      mockCSVData.forEach((row) => mockStream.emit("data", row));
      mockStream.emit("end");
    });

    const filePath = path.resolve("data/database.csv");
    const data = await loadExistingData(filePath);

    expect(data).toEqual(mockCSVData);
  });

  it("should handle errors during CSV file read", async () => {
    const mockError = new Error("File read error");

    const mockStream = new EventEmitter();
    mockStream.pipe = vi.fn().mockReturnValue(mockStream);

    vi.spyOn(fs, "createReadStream").mockReturnValue(mockStream as any);

    process.nextTick(() => {
      mockStream.emit("error", mockError);
    });

    const filePath = path.resolve("data/database.csv");

    await expect(loadExistingData(filePath)).rejects.toThrow("File read error");
  });
});

describe("compareData", () => {
  it("should return a summary with mismatches if data does not match", () => {
    const extractedData: CompanyPDFData = {
      "Company Name": "Dummy Company",
      Revenue: 150,
    };

    const existingData = [{ "Company Name": "Dummy Company", Revenue: 100 }];

    const summary = compareData(extractedData, existingData, "Dummy Company");

    expect(summary).toEqual({
      extractedData,
      companyData: existingData[0],
      mismatches: {
        Revenue: { extracted: 150, existing: 100 },
      },
    });
  });

  it("should throw an error if the company is not found", () => {
    const extractedData: CompanyPDFData = {
      "Company Name": "Nonexistent Company",
      Revenue: 150,
    };

    const existingData = [{ "Company Name": "Dummy Company", Revenue: 100 }];

    expect(() =>
      compareData(extractedData, existingData, "Nonexistent Company")
    ).toThrow("Company data not found");
  });

  it("should return an empty mismatches object if data matches", () => {
    const extractedData: CompanyPDFData = {
      "Company Name": "Dummy Company",
      Revenue: 100,
    };

    const existingData = [{ "Company Name": "Dummy Company", Revenue: 100 }];

    const summary = compareData(extractedData, existingData, "Dummy Company");

    expect(summary).toEqual({
      extractedData,
      companyData: existingData[0],
      mismatches: {},
    });
  });
});
