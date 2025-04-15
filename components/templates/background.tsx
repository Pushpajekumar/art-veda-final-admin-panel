"use client";

import { useEditorStore } from "@/store/editor-store";
import { HexColorPicker } from "react-colorful";
import { useState } from "react";

const predefinedColors = [
  "#ffffff", // white
  "#f8f9fa", // light gray
  "#e9ecef", // lighter gray
  "#dee2e6", // light blue-gray
  "#ced4da", // blue-gray
  "#adb5bd", // gray
  "#6c757d", // dark gray
  "#495057", // darker gray
  "#343a40", // very dark gray
  "#212529", // almost black
  "#ff6b6b", // red
  "#f06595", // pink
  "#cc5de8", // purple
  "#5c7cfa", // blue
  "#339af0", // light blue
  "#51cf66", // green
  "#fcc419", // yellow
  "#ff922b", // orange
];

function BackgroundPanel() {
  const { canvas } = useEditorStore();
  const [color, setColor] = useState("#ffffff");

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    if (canvas) {
      canvas.backgroundColor = newColor;
      canvas.renderAll();
    }
  };
  const applyPredefinedColor = (colorHex: string) => {
    setColor(colorHex);
    if (canvas) {
      canvas.backgroundColor = colorHex;
      canvas.renderAll();
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Background Color</h3>
        <div className="mb-4">
          <HexColorPicker
            color={color}
            onChange={handleColorChange}
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-12 h-12 rounded border"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-mono uppercase">{color}</span>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Preset Colors</h3>
        <div className="grid grid-cols-6 gap-2">
          {predefinedColors.map((colorHex) => (
            <button
              key={colorHex}
              className="w-8 h-8 rounded-md border hover:scale-110 transition-transform"
              style={{ backgroundColor: colorHex }}
              onClick={() => applyPredefinedColor(colorHex)}
              title={colorHex}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default BackgroundPanel;
