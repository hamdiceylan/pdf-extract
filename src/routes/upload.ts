import { Router, Request, Response } from "express";
import { extractDataFromPDF } from "../services/pdf-service";
import { loadExistingData, compareData } from "../utils/data-utils";
import path from "path";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const file = req.file;
  const { companyName } = req.body;
  
  if (!file || !companyName) {
    return res.status(400).send("File and company name are required");
  }

  try {
    const fileName = file.originalname
    const extractedData = await extractDataFromPDF(fileName);
    const existingData = await loadExistingData(
      path.resolve("data/database.csv")
    );
    const summary = compareData(extractedData, existingData, companyName);

    res.json(summary);
  } catch (error) {
    res.status(500).send("An error occurred");
  }
});

export default router;