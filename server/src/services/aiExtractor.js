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
        },
        aiBaseConfidence: {
          type: SchemaType.NUMBER,
          description: "A single 0-100 estimate assessing only the visual legibility/clarity of the text."
        }
      },
      required: ["score", "legibility", "issuesDetected", "aiBaseConfidence"]
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
        plotArea: {
          type: SchemaType.OBJECT,
          properties: {
            value: { type: SchemaType.STRING },
            unit: { type: SchemaType.STRING }
          },
          required: ["value", "unit"]
        },
        district: { type: SchemaType.STRING },
        tehsil: { type: SchemaType.STRING },
        village: { type: SchemaType.STRING },
        landClassification: { type: SchemaType.STRING },
        ownershipDetails: { type: SchemaType.STRING },
        mutationRecords: { type: SchemaType.STRING },
        registrationInformation: { type: SchemaType.STRING }
      },
      required: ["landownerDetails", "surveyNumber", "khasraNumber", "khataNumber", "plotArea", "district", "tehsil", "village", "landClassification", "ownershipDetails", "mutationRecords", "registrationInformation"]
    },
    flaggedFields: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "List of exactly matched JSON keys (e.g., 'khasraNumber', 'primaryOwnerName') that are low confidence."
    }
  },
  required: ["documentQuality", "extractedData", "flaggedFields"]
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
    const prompt = `You are an expert AI system trained on all regional Indian land revenue records (7/12, Khatauni, Patta, etc.) across all languages. You accept land record documents in any condition (even if blurry, torn, or handwritten).
Please extract the required fields accurately.
Assess the document quality, and provide an aiBaseConfidence (0-100) assessing only the visual legibility/clarity of the text.

STRICT EXTRACTION RULES:
- RULE 1 (Universal Numeral Rule): Regardless of the document's language, you MUST convert all native script numerals (e.g., Gujarati, Hindi, Marathi, Tamil digits) into standard English Arabic digits (0-9) before outputting JSON.
- RULE 2 (Semantic Field Mapping): Map regional terms to our standard JSON schema based on semantic meaning, not literal translation. For example, if a document contains a regional sub-division indicator (like 'Paiki', 'Hissa', 'Bata', or 'A/B'), map it intelligently to the closest matching field like 'khasraNumber' or append it to 'surveyNumber'. If a specific field concept (like Khata or Khasra) does not exist in the state's local system, explicitly return the string 'N/A' for that field. If a field exists but is unreadable, return an empty string "".
- RULE 3 (Strike-throughs): If a value is crossed out, scribbled over, or visually cancelled, IGNORE IT entirely. Only extract the final, un-crossed corrected value.
- RULE 4 (Identifiers vs Junk): Fields like 'khataNumber', 'khasraNumber', and 'mutationRecords' are identifiers. If a field clearly contains irrelevant alphabetic dictionary words or jokes, discard it and return an empty string "".
- RULE 5 (All-or-Nothing Legibility): If any part of a number or word is obscured, scribbled, or illegible, you must discard the ENTIRE value and return an empty string "". Do not guess or return partial fragments.
- RULE 6 (Plot Area Separation): For plotArea, separate the number from the unit. Extract only the digits/decimals into \`plotArea.value\`. Extract the measurement unit into \`plotArea.unit\`. If no unit is written, leave \`unit\` as an empty string.
- RULE 7 (Eliminate Language Bias): Do NOT lower the confidence score based on the language of the document. A clear, legible Gujarati document must receive the exact same high confidence score as a clear English document. Base your confidence strictly on the visual clarity of the text, not the script.
- RULE 8 (Track Low-Confidence Fields): If you are unsure about the accuracy of any specific extracted value due to blurriness, handwriting, or translation ambiguity, push the exact JSON key name (e.g., 'khasraNumber', 'primaryOwnerName') into the \`flaggedFields\` array.`;

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
