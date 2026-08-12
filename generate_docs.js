import fs from 'fs';
import path from 'path';

const outDir = 'godot_migration_docs';
const filesToExtract = [
  { src: 'Cranial_Nerve_Crisis_1778081661703.md', dest: '00_Game_Design_Document.md', type: 'doc' },
  { src: 'src/components/game/GameEngine.tsx', dest: '01_GameEngine_State.md', type: 'code' },
  { src: 'src/components/levels/Level1Olfactory.tsx', dest: '02_Level1_Olfactory.md', type: 'code' },
  { src: 'src/components/levels/Level2Optic.tsx', dest: '03_Level2_Optic.md', type: 'code' },
  { src: 'src/components/levels/Level3EyeMovement.tsx', dest: '04_Level3_EyeMovement.md', type: 'code' },
  { src: 'src/components/levels/Level4Trigeminal.tsx', dest: '05_Level4_Trigeminal.md', type: 'code' },
  { src: 'src/components/game/DoctorsOffice3D.tsx', dest: '06_DoctorsOffice3D_Layout.md', type: 'code' },
  { src: 'src/lib/mathLUT.ts', dest: '07_Math_Utils.md', type: 'code' }
];

filesToExtract.forEach(({src, dest, type}) => {
  if (fs.existsSync(src)) {
    const content = fs.readFileSync(src, 'utf-8');
    let mdContent = '';

    if (type === 'doc') {
      mdContent = content;
    } else {
      mdContent = `# Reference: ${path.basename(src)}\n\n`;
      mdContent += `This file contains the original React/TypeScript logic that needs to be ported to Godot GDScript.\n\n`;
      mdContent += '## Original Code\n\n```typescript\n';
      mdContent += content;
      mdContent += '\n```\n';
    }

    fs.writeFileSync(path.join(outDir, dest), mdContent);
    console.log(`Extracted: ${dest}`);
  } else {
    console.warn(`File not found: ${src}`);
  }
});
