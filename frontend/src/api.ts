/**
 * THE API UTILIZES FOR THE LLM-QUESGENERATOR-INTERNSHIP-2025 FRONTEND.
 *
 * THIS FILE ACTS AS A SINGLE POINT OF CONTACT FOR ALL BACKEND REQUESTS.
 * UPDATE BASE_URL AS REQUIRED FOR YOUR ENVIRONMENT.
 */

export const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

/**
 * Generate material (e.g., question paper/worksheets) based on provided parameters.
 * @param params Object containing grade, chapter, material_type, difficulty, and (optionally) max_marks.
 * @returns Promise resolving to the generated material as a string.
 */
export async function generateMaterial(params: {
  grade: string;
  chapter: string;
  material_type: string;
  difficulty: string;
  max_marks?: number;
  stream?: string;
}): Promise<string> {
  const response = await fetch(`${BASE_URL}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const ErrorMsg = await response.text();
    throw new Error(`Error generating material: ${ErrorMsg}`);
  }

  const data = await response.json();
  return data.output;
}

/**
 * Export the generated material in a specific format (pdf/docx).
 * @param params Object containing text and filetype ('pdf' or 'docx').
 * @returns Promise resolving to the backend's file path as a string.
 */
export async function exportMaterial(params: {
  text: string;
  filetype: "pdf" | "docx";
}): Promise<string> {
  const response = await fetch(`${BASE_URL}/export`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const ErrorMsg = await response.text();
    throw new Error(`Error exporting material: ${ErrorMsg}`);
  }

  const data = await response.json();
  return data.file_path;
}

/**
 * Fetch available grades.
 */
export async function fetchGrades(): Promise<string[]> {
  const response = await fetch(`${BASE_URL}/grades`);
  if (!response.ok) {
    throw new Error("Failed to fetch grades");
  }
  return response.json();
}

/**
 * Fetch available material types.
 */
export async function fetchMaterialTypes(): Promise<string[]> {
  const response = await fetch(`${BASE_URL}/material_types`);
  if (!response.ok) {
    throw new Error("Failed to fetch material types");
  }
  return response.json();
}

/**
 * Fetch available difficulty levels.
 */
export async function fetchDifficultyLevels(): Promise<string[]> {
  const response = await fetch(`${BASE_URL}/difficulty_levels`);
  if (!response.ok) {
    throw new Error("Failed to fetch difficulty levels");
  }
  return response.json();
}

/**
 * Health check for backend connectivity.
 */
export async function healthCheck(): Promise<"ok"> {
  const response = await fetch(`${BASE_URL}/health`);
  if (!response.ok) {
    throw new Error("Backend service is not healthy");
  }
  const data = await response.json();
  return data.status;
}