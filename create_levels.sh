for file in Level1Olfactory Level2Optic Level3EyeMovement Level4Trigeminal Level5FacialNerve Level6Tuning Level7GagReflex Level8Accessory Level9Hypoglossal; do
cat << INNER_EOF > src/components/levels/${file}.tsx
import React from 'react';

export function ${file}() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">${file}</h2>
      <p>Content for ${file} goes here.</p>
    </div>
  );
}
INNER_EOF
done
