import fabric from "fabric";

interface DesignData {
  name: string;
  canvasData: string;
  width: number;
  height: number;
}

async function saveDesign(designData: DesignData, designId: string | null) {
  // Implementation needed here
  // This is a placeholder function - replace with actual implementation
  console.log("Saving design:", designData, designId);
  return true;
}

export async function saveCanvasState(
  canvas: fabric.Canvas,
  designId: string | null = null,
  title = "Untitled Design"
) {
  if (!canvas) return false;

  try {
    const canvasData = canvas.toObject(["id", "filters"]);

    const designData = {
      name: title,
      canvasData: JSON.stringify(canvasData),
      width: canvas.width,
      height: canvas.height,
    };

    return saveDesign(designData, designId);
  } catch (error) {
    console.error("Error saving canvas state:", error);
    throw error;
  }
}
