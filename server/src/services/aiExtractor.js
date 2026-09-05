const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

// Define the JSON Schema for the extraction
const landRecordSchema = {
  type: SchemaType.OBJECT,
  properties: {
    documentQuality: {
      type: SchemaType.OBJECT,
      properties: {
        score: { type: SchemaType.NUMBER, description: "Score from 1-100" },
        legibility: { type: SchemaType.STRING, description: "E.g., Clear, Blurred, Partially Illegible" },
        issuesDetected: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "List of issues like 'torn edges', 'watermarks'"
        }
      },
      required: ["score", "legibility", "issuesDetected"]
    },
    extractedData: {
      type: SchemaType.OBJECT,
      properties: {
        landownerDetails: {
          type: SchemaType.OBJECT,
          properties: {
            primaryOwnerName: { type: SchemaType.STRING },
            fatherOrHusbandName: { type: SchemaType.STRING }
          },
          required: ["primaryOwnerName", "fatherOrHusbandName"]
        },
        surveyNumber: { type: SchemaType.STRING },
        khasraNumber: { type: SchemaType.STRING },
        khataNumber: { type: SchemaType.STRING },
        plotArea: { type: SchemaType.STRING },
        district: { type: SchemaType.STRING },
        tehsil: { type: SchemaType.STRING },
        village: { type: SchemaType.STRING },
        landClassification: { type: SchemaType.STRING },
        ownershipDetails: { type: SchemaType.STRING },
        mutationRecords: { type: SchemaType.STRING },
        registrationInformation: { type: SchemaType.STRING },
        confidenceScore: { type: SchemaType.NUMBER, description: "Confidence score from 1-100" }
      },
      required: ["landownerDetails", "surveyNumber", "khasraNumber", "khataNumber", "plotArea", "district", "tehsil", "village", "landClassification", "ownershipDetails", "mutationRecords", "registrationInformation", "confidenceScore"]
    }
  },
  required: ["documentQuality", "extractedData"]
};

/**
 * Converts a file buffer to the Generative Part format required by Gemini.
 * @param {Buffer} buffer - The file buffer
 * @param {string} mimeType - The mime type of the file
 * @returns {Object} The generative part object
 */
function fileToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType
    },
  };
}



/**
 * Processes a document image/pdf using Gemini 1.5 Flash.
 * @param {Buffer} fileBuffer
 * @param {string} mimeType
 */
async function processLandDocument(fileBuffer, mimeType) {
  // --- Pre-flight checks ---
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("AI Processing Failed: GEMINI_API_KEY is missing from process.env");
  }
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error("AI Processing Failed: fileBuffer is empty or undefined");
  }
  console.log(`[AI] Processing document: ${(fileBuffer.length / 1024).toFixed(1)}KB, mimeType=${mimeType}`);

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: landRecordSchema,
      },
    });

    const imagePart = fileToGenerativePart(fileBuffer, mimeType);
    const prompt = `You are an expert Indian Land Record digitizer. You accept land record documents in any condition (even if blurry, torn, or handwritten) and in multiple Indian languages or English.
Please extract the required fields accurately. If a field is not found or unreadable, do your best to infer or return an empty string.
Assess the document quality.

STRICT EXTRACTION RULES:
- RULE 1 (Strike-throughs): If a value is crossed out, scribbled over, or visually cancelled, IGNORE IT entirely. Only extract the final, un-crossed corrected value.
- RULE 2 (Strict Numeric Typing): Fields like 'khataNumber', 'khasraNumber', and 'mutationRecords' are identifiers. If a field clearly contains irrelevant alphabetic dictionary words or jokes (e.g., 'Nuclear Physics'), discard it and return an empty string "".
- RULE 3 (All-or-Nothing Legibility): If any part of a number or word is obscured, scribbled, or illegible (e.g., you can only read the last two digits of a four-digit number), you must discard the ENTIRE value and return an empty string "". Do not guess or return partial fragments.

Calculate the confidenceScore (0-100) by summing points for found data. If a field is missing or rejected due to the rules above, return an empty string "" and award 0 points for it.
- landownerDetails.primaryOwnerName (+10 points)
- landownerDetails.fatherOrHusbandName (+5 points)
- surveyNumber (+15 points)
- plotArea (+15 points)
- khasraNumber (+10 points)
- khataNumber (+10 points)
- district (+5 points)
- tehsil (+5 points)
- village (+5 points)
- landClassification (+5 points)
- ownershipDetails (+5 points)
- mutationRecords (+5 points)
- registrationInformation (+5 points)
Total possible score is 100. No fields found = 0.`;

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    
    console.log("[AI] Gemini returned live data successfully");
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("AI Processing Failed: " + error.message);
  }
}

module.exports = {
  processLandDocument,
  fileToGenerativePart
};
