// Check available Gemini models
// Run with: node check-gemini-models.js

const GEMINI_API_KEY = 'AIzaSyAnYY29VTC6qWN_Ikn7EzwK92DquUCvbnw';

async function checkAvailableModels() {
  console.log("🔍 Checking available Gemini models...");

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
    );

    if (!response.ok) {
      console.error("❌ Failed to fetch models:", response.status);
      return;
    }

    const data = await response.json();
    console.log("✅ Available Gemini Models:");
    console.log("=".repeat(50));

    data.models.forEach(model => {
      console.log(`📋 ${model.name}`);
      console.log(`   Display Name: ${model.displayName}`);
      console.log(`   Description: ${model.description}`);
      console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ')}`);
      console.log("");
    });

  } catch (error) {
    console.error("❌ Error checking models:", error);
  }
}

checkAvailableModels();