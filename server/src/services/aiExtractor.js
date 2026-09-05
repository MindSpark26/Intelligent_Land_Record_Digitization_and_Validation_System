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
        ownerName: { type: SchemaType.STRING },
        fatherName: { type: SchemaType.STRING },
        surveyNumber: { type: SchemaType.STRING },
        area: { type: SchemaType.STRING },
        village: { type: SchemaType.STRING },
        transactionType: { type: SchemaType.STRING },
        confidenceScore: { type: SchemaType.NUMBER, description: "Confidence score from 1-100" }
      },
      required: ["ownerName", "fatherName", "surveyNumber", "area", "village", "transactionType", "confidenceScore"]
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
 * Fallback mock data in case of API limits or errors.
 */
const getMockData = () => ({
  documentQuality: {
    score: 85,
    legibility: "Clear",
    issuesDetected: []
  },
  extractedData: {
    ownerName: "Mock Owner",
    fatherName: "Mock Father",
    surveyNumber: "123/4A",
    area: "1.5 Hectares",
    village: "Mock Village",
    transactionType: "Sale",
    confidenceScore: 80
  }
});

/**
 * Processes a document image/pdf using Gemini 1.5 Flash.
 * @param {Buffer} fileBuffer
 * @param {string} mimeType
 */
async function processLandDocument(fileBuffer, mimeType) {
  // --- Pre-flight checks ---
  if (!process.env.GEMINI_API_KEY) {
    console.error("ERROR: GEMINI_API_KEY is missing from process.env");
    return getMockData();
  }
  if (!fileBuffer || fileBuffer.length === 0) {
    console.error("ERROR: fileBuffer is empty or undefined");
    return getMockData();
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
Please extract the required fields accurately. If a field is not found or unreadable, do your best to infer or return "Not Available".
Assess the document quality and provide a confidence score for the extracted data.`;

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    
    console.log("[AI] Gemini returned live data successfully");
    return JSON.parse(responseText);
  } catch (error) {
    console.error("CRITICAL GEMINI ERROR:", error);
    if (
      error.status === 429 || 
      error.status === 503 || 
      (error.message && (
        error.message.includes("429") || 
        error.message.includes("503") || 
        error.message.includes("Quota") || 
        error.message.includes("Unavailable")
      ))
    ) {
      console.warn("API Limit Reached - Using Fallback Data");
      return getMockData();
    }
    console.warn(`[AI Extraction Error] ${error.message} - Using Fallback Data`);
    return getMockData();
  }
}

module.exports = {
  processLandDocument,
  fileToGenerativePart
};
