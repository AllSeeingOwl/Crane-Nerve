import React from "react";

export function Level1Olfactory(_props: {
  stress: number;
  onStressChange: (delta: number) => void;
  onWin: () => void;
  onLose: (reason: string) => void;
}) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Level1Olfactory</h2>
      <p>Content for Level1Olfactory goes here.</p>
    </div>
  );
}
