/**
 * Multi-Dimensional Document Quality Scoring System
 * Calculates Completeness, Validity, Confidence and applies Critical Caps.
 */

const ALL_FIELDS = [
  { key: 'landownerDetails.primaryOwnerName', critical: true, cap: 30 },
  { key: 'landownerDetails.fatherOrHusbandName', critical: false },
  { key: 'surveyNumber', critical: true, cap: 50 },
  { key: 'khasraNumber', critical: false },
  { key: 'khataNumber', critical: false },
  { key: 'plotArea', critical: false },
  { key: 'district', critical: false },
  { key: 'tehsil', critical: false },
  { key: 'village', critical: false },
  { key: 'landClassification', critical: false },
  { key: 'ownershipDetails', critical: false },
  { key: 'mutationRecords', critical: false },
  { key: 'registrationInformation', critical: false }
];

const NUMERIC_FORMAT_FIELDS = ['surveyNumber', 'khasraNumber', 'khataNumber', 'plotArea'];

function getNestedValue(obj, path) {
  if (!obj) return undefined;
  return path.split('.').reduce((acc, part) => (acc && acc[part] != null ? acc[part] : undefined), obj);
}

function calculateDocumentScore(extractedData, isHumanEdit = false, aiBaseConfidence = 0) {
  if (!extractedData) {
    return {
      scoringDetails: {
        completeness: 0,
        confidence: isHumanEdit ? 100 : aiBaseConfidence,
        validity: 0,
        finalScore: 0,
        missingCriticalFields: ALL_FIELDS.filter(f => f.critical).map(f => f.key)
      },
      status: 'Needs Review'
    };
  }

  let filledFieldsCount = 0;
  let validFieldsCount = 0;
  const missingCriticalFields = [];
  let cap = 100;

  // 1. Completeness & Caps
  ALL_FIELDS.forEach(field => {
    const value = getNestedValue(extractedData, field.key);
    const isFilled = typeof value === 'string' && value.trim() !== '';

    if (isFilled) {
      filledFieldsCount++;
    } else if (field.critical) {
      missingCriticalFields.push(field.key);
      if (field.cap < cap) {
        cap = field.cap;
      }
    }
  });

  const completeness = (filledFieldsCount / ALL_FIELDS.length) * 100;

  // 2. Validity
  ALL_FIELDS.forEach(field => {
    const value = getNestedValue(extractedData, field.key);
    const isFilled = typeof value === 'string' && value.trim() !== '';

    if (isFilled) {
      if (NUMERIC_FORMAT_FIELDS.includes(field.key)) {
        // Must contain only numbers, dots, hyphens, slashes, spaces
        const isValid = /^[0-9\/\-\.\s]*$/.test(value);
        if (isValid) validFieldsCount++;
      } else {
        // Alphabetic fields - allow letters, spaces, and basic punctuation
        const isValid = /^[a-zA-Z\s\.,'-]*$/.test(value);
        if (isValid) validFieldsCount++;
      }
    }
  });

  const validity = filledFieldsCount > 0 ? (validFieldsCount / filledFieldsCount) * 100 : 0;

  // 3. Confidence
  const confidence = isHumanEdit ? 100 : aiBaseConfidence;

  // Base Score
  let baseScore = (0.45 * completeness) + (0.30 * confidence) + (0.25 * validity);
  
  // Apply Caps
  let finalScore = Math.min(baseScore, cap);
  
  // Round to nearest whole number
  finalScore = Math.round(finalScore);

  // Status
  const status = finalScore >= 80 ? 'Validated' : 'Needs Review';

  return {
    scoringDetails: {
      completeness: Math.round(completeness),
      validity: Math.round(validity),
      confidence: Math.round(confidence),
      finalScore,
      missingCriticalFields
    },
    status
  };
}

module.exports = { calculateDocumentScore };
