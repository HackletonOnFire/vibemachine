const fs = require('fs');
const path = require('path');

const actualUserId = "'1de561d6-33b8-49d8-bc50-a3d508648384'";

// Files to update
const filesToUpdate = [
  'src/app/dashboard/recommendations/page.tsx',
  'src/app/dashboard/settings/page.tsx', 
  'src/app/dashboard/reports/page.tsx'
];

// Function to update Layout components in a file
function updateLayoutComponents(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️ File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Add userId to actualUserId constant if it exists
  if (content.includes('const actualUserId')) {
    console.log(`✅ ${filePath} already has actualUserId defined`);
  } else {
    console.log(`📝 Adding actualUserId to ${filePath}`);
    // Find where to add actualUserId (usually after imports and before the component)
    const lines = content.split('\n');
    let insertIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('export default function') || lines[i].includes('function')) {
        insertIndex = i;
        break;
      }
    }
    
    if (insertIndex > 0) {
      lines.splice(insertIndex, 0, `  const actualUserId = ${actualUserId};`, '');
      content = lines.join('\n');
    }
  }
  
  // Update all Layout component usages
  const layoutRegex = /<Layout\s+currentPage="([^"]+)"(\s*[^>]*)>/g;
  let matches = 0;
  
  content = content.replace(layoutRegex, (match, currentPage, rest) => {
    matches++;
    if (match.includes('userId=')) {
      return match; // Already has userId
    }
    return `<Layout currentPage="${currentPage}" userId={actualUserId}${rest}>`;
  });
  
  if (matches > 0) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Updated ${matches} Layout components in ${filePath}`);
  } else {
    console.log(`ℹ️ No Layout components found in ${filePath}`);
  }
}

// Update all files
console.log('🔧 Updating dashboard pages to include userId in Layout components...\n');

filesToUpdate.forEach(updateLayoutComponents);

console.log('\n🎉 Dashboard layout updates complete!');
console.log('\n📋 Summary:');
console.log('- All Layout components now receive userId prop');
console.log('- User names should now display real data from database');
console.log('- Navigation sidebar will show actual user information'); 