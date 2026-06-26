import React from "react";

export function Level8Accessory(_props: {
  stress: number;
  onStressChange: (delta: number) => void;
  onWin: () => void;
  onLose: (reason: string) => void;
}) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Level8Accessory</h2>
      <p>Content for Level8Accessory goes here.</p>
    </div>
  );
}
