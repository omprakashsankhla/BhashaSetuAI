const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const targetUrl = 'http://localhost:5000';

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(targetUrl)) {
      if (!content.includes('API_BASE_URL')) {
        const relativePath = path.relative(path.dirname(filePath), path.join(__dirname, 'src', 'config', 'api'));
        const importPath = relativePath.replace(/\\/g, '/').startsWith('.') ? relativePath.replace(/\\/g, '/') : './' + relativePath.replace(/\\/g, '/');
        
        const lines = content.split('\n');
        let lastImportIndex = -1;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('import ')) {
            lastImportIndex = i;
          }
        }
        
        const importStmt = `import { API_BASE_URL } from '${importPath}';`;
        if (lastImportIndex !== -1) {
          lines.splice(lastImportIndex + 1, 0, importStmt);
        } else {
          lines.unshift(importStmt);
        }
        content = lines.join('\n');
      }

      content = content.replace(/'http:\/\/localhost:5000(.*?)'/g, "`\\${API_BASE_URL}$1`");
      content = content.replace(/"http:\/\/localhost:5000(.*?)"/g, "`\\${API_BASE_URL}$1`");
      content = content.replace(/http:\/\/localhost:5000/g, "${API_BASE_URL}");
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
