const fs = require('fs');
const path = require('path');

const startPath = path.join(__dirname, 'node_modules');
const OLD_TEXT = "getDefaultProguardFile('proguard-android.txt')";
const NEW_TEXT = "getDefaultProguardFile('proguard-android-optimize.txt')";

function searchAndFix(dir) {
    if (!fs.existsSync(dir)) return;

    try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            // statSync follows symlinks (This is what we missed before!)
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                // Recursive search, focusing on pnpm and capacitor folders
                if (file.includes('@capacitor') || file.includes('.pnpm')) {
                    searchAndFix(filePath);
                }
            } else if (file === 'build.gradle') {
                const content = fs.readFileSync(filePath, 'utf8');
                if (content.includes(OLD_TEXT)) {
                    console.log(`🔧 Fixing: ${filePath}`);
                    const newContent = content.replace(OLD_TEXT, NEW_TEXT);
                    fs.writeFileSync(filePath, newContent, 'utf8');
                }
            }
        }
    } catch (e) {
        // Ignore system folders we can't read
    }
}

console.log('Scanning deep into node_modules...');
searchAndFix(startPath);
console.log('Done.');