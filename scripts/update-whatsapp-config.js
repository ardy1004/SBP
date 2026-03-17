/**
 * Script to update hardcoded WhatsApp numbers to use config
 * 
 * This script helps migrate hardcoded WhatsApp numbers to use
 * the centralized config system.
 * 
 * Usage: node scripts/update-whatsapp-config.js
 */

const fs = require('fs');
const path = require('path');

// Files that need to be updated (based on search results)
const filesToUpdate = [
  'client/src/components/admin/AgreementPDFGenerator.tsx',
  'client/src/pages/PublicSubmissionPage.tsx',
  'client/src/components/landingpage-v2/CTAV2.tsx',
  'client/src/components/landingpage-v2/HeroV2.tsx',
  'client/src/components/landingpage/CTA.tsx',
  'client/src/components/landingpage-v2/LandingPageV2.tsx',
  'client/src/components/landingpage-v2/PortfolioGalleryV2.tsx',
  'client/src/components/landingpage/Hero.tsx',
  'client/src/components/landingpage/LandingPage.tsx',
  'client/src/components/landingpage-v2/ValuePropsV2.tsx',
  // Note: ProductionPropertyForm.tsx requires manual review due to complexity
];

// Patterns to replace
const replacements = [
  {
    pattern: /window\.open\('https:\/\/wa\.me\/6281391278889([^']*)', '_blank'\)/g,
    replacement: "window.open(WHATSAPP_CONFIG.getLink('Halo, saya ingin konsultasi properti'), '_blank')"
  },
  {
    pattern: /href="https:\/\/wa\.me\/6281391278889([^"]*)"/g,
    replacement: 'href={WHATSAPP_CONFIG.getLink("Halo, saya ingin konsultasi properti")}'
  },
  {
    pattern: /\+62 813-9127-8889/g,
    replacement: '{WHATSAPP_CONFIG.NUMBER_DISPLAY}'
  },
  {
    pattern: /0813-9127-8889/g,
    replacement: '{WHATSAPP_CONFIG.NUMBER_AGREEMENT}'
  },
  {
    pattern: /"Monica Vera S"/g,
    replacement: '{COMPANY_CONFIG.AGENT.NAME}'
  },
];

// Import statement to add
const importStatement = "import { WHATSAPP_CONFIG, COMPANY_CONFIG } from '@/lib/config';\n";

function updateFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf-8');
  let hasChanges = false;
  
  // Check if already has import
  if (!content.includes("from '@/lib/config'") && !content.includes('from "@/lib/config"')) {
    // Add import after the last import statement
    const importIndex = content.lastIndexOf('import ');
    if (importIndex !== -1) {
      const endOfImport = content.indexOf('\n', importIndex);
      content = content.slice(0, endOfImport + 1) + importStatement + content.slice(endOfImport + 1);
      hasChanges = true;
    }
  }
  
  // Apply replacements
  replacements.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      hasChanges = true;
    }
  });
  
  if (hasChanges) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Updated: ${filePath}`);
  } else {
    console.log(`⏭️  No changes needed: ${filePath}`);
  }
}

console.log('🚀 Starting WhatsApp config migration...\n');

filesToUpdate.forEach(updateFile);

console.log('\n✨ Migration complete!');
console.log('\n⚠️  Note: The following files require manual review:');
console.log('   - client/src/components/admin/ProductionPropertyForm.tsx');
console.log('   - client/src/components/admin/AgreementPDFGenerator.tsx');
console.log('\n📝 Please review and update these files manually.');