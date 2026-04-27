// OCR service for document field extraction using backend local OCR via FastAPI.
// The frontend sends the uploaded file to the backend, which runs pytesseract + PIL.

const BACKEND_OCR_ENDPOINT = "/api/ocr/extract";

export async function processDocumentOCR(imageFile, documentType) {
  if (!imageFile || !documentType) return {};

  const formData = new FormData();
  formData.append("file", imageFile);
  formData.append("document_type", documentType);

  const response = await fetch(BACKEND_OCR_ENDPOINT, {
    method: "POST",
    body: formData,
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || "OCR backend request failed.");
  }

  if (payload.status !== "success") {
    throw new Error(payload?.message || "OCR extraction failed.");
  }

  return payload.fields || {};
}

export const OCR_CONFIG = {
  method: "backend",
  backend_endpoint: BACKEND_OCR_ENDPOINT,
};
