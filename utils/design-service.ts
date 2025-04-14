import { database } from "@/appwrite";
import fabric from "fabric";

interface DesignData {
  name: string;
  canvasData: string;
  width: number;
  height: number;
}

async function saveDesign(designData: DesignData, designId: string | null) {
 try {
  await database.updateDocument(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_DESIGNS_COLLECTION_ID!,
    designId!,
    {
      template: designData.canvasData,
      previewImage: "",
    }
  )
 } catch (error) {
   console.error("Error saving design:", error);
   throw error;
  
 }
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
