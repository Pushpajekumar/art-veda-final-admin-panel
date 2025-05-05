"use client";
import { useEditorStore } from "@/store/editor-store";
import React, { use, useCallback } from "react";
import Canvas from "./canvas";
import { useRouter } from "next/navigation";
import Sidebar from "./sidebar";
import Properties from "./properties";

interface EditorProops {
  canvasData: string;
  designId: string | null;
  canvasWidth: number;
  canvasHeight: number;
  isFrame?: boolean;
}

const Editor = ({
  canvasData,
  designId,
  canvasWidth,
  canvasHeight,
  isFrame = false,
}: EditorProops) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [loadingAttempt, setLoadingAttempt] = React.useState(false);
  const router = useRouter();
  const {
    canvas,
    setDesignId,
    resetStore,
    setName,
    setShowProperties,
    showProperties,
    isEditing,
    setIsFrame,
  } = useEditorStore();

  React.useEffect(() => {
    //reset the store
    resetStore();

    //set the design id
    if (designId) {
      setDesignId(designId);
    }

    // Set if this is a frame
    setIsFrame(isFrame);

    return () => {
      //cleanup the store
      resetStore();
    };
  }, []);

  React.useEffect(() => {
    setLoadingAttempt(false);
    setError(null);
  }, [designId]);

  React.useEffect(() => {
    if (loading && !canvas && designId) {
      const timer = setTimeout(() => {
        if (loading) {
          console.log("Loading canvas data...");
          setLoading(false);
        }
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [loading, canvas, designId]);

  //load the design ->
  const loadDesign = useCallback(async () => {
    if (!canvas || !designId || loadingAttempt) return;
    try {
      setLoading(true);
      setLoadingAttempt(true);

      const design = canvasData;

      if (design) {
        //update name
        setName("Design Name");

        //set the design ID just incase after getting the data
        setDesignId(designId);

        try {
          if (design) {
            canvas.clear();
            // Set dimensions at half size
            const scaledWidth = canvasWidth * 0.5;
            const scaledHeight = canvasHeight * 0.5;

            if (canvasWidth && canvasHeight) {
              canvas.setDimensions({
                width: scaledWidth,
                height: scaledHeight,
              });

              console.log("Canvas dimensions set at half size");
            }

            const canvasData =
              typeof design === "string" ? JSON.parse(design) : design;

            const hasObjects =
              canvasData.objects && canvasData.objects.length > 0;

            if (canvasData.background) {
              canvas.backgroundColor = canvasData.background;
            } else {
              canvas.backgroundColor = "#ffffff";
            }

            if (!hasObjects) {
              canvas.renderAll();
              return true;
            }

            // Load the JSON and scale all objects to 0.5x
            canvas.loadFromJSON(design, () => {
              // Scale down all objects and restore lock states
              canvas.getObjects().forEach((obj) => {
                obj.scale(0.5);
                obj.setCoords();

                // Ensure lock properties are correctly applied after loading
                // Note: the properties should already be loaded from JSON but this ensures they're applied
                if (obj.lockMovementX) obj.lockMovementX = true;
                if (obj.lockMovementY) obj.lockMovementY = true;
                if (obj.lockRotation) obj.lockRotation = true;
                if (obj.lockScalingX) obj.lockScalingX = true;
                if (obj.lockScalingY) obj.lockScalingY = true;
                if (obj.hasOwnProperty("selectable"))
                  obj.selectable = obj.selectable;
              });
              canvas.requestRenderAll();
            });
          } else {
            console.log("no canvas data");
            canvas.clear();
            canvas.setWidth(canvasWidth * 0.5);
            canvas.setHeight(canvasHeight * 0.5);
            canvas.backgroundColor = "#ffffff";
            canvas.renderAll();
          }
        } catch (e) {
          console.error("Error loading canvas", e);
          setError("Error loading canvas");
        } finally {
          setLoading(false);
        }
      } else {
        console.log("no design data");
        canvas.clear();
        console.log(canvasWidth, canvasHeight, "canvasWidth canvasHeight");
        // Set dimensions at half size
        canvas.setDimensions({
          width: canvasWidth * 0.5,
          height: canvasHeight * 0.5,
        });
        console.log("canvas dimensions set at half size");
        canvas.backgroundColor = "#ffffff";
        console.log(canvas, "canvas");
        canvas.renderAll();
      }
    } catch (e) {
      console.error("Failed to load design", e);
      setError("failed to load design");
      setLoading(false);
    }
  }, [canvas, designId, loadingAttempt, setDesignId]);

  React.useEffect(() => {
    if (designId && canvas && !loadingAttempt) {
      loadDesign();
    } else if (!designId) {
      router;
    }
  }, [canvas, designId, loadDesign, loadingAttempt, router]);

  React.useEffect(() => {
    if (!canvas) return;

    const handleSelectionCreated = () => {
      const activeObject = canvas.getActiveObject();

      console.log(activeObject, "activeObject");

      if (activeObject) {
        setShowProperties(true);
      }
    };

    const handleSelectionCleared = () => {
      setShowProperties(false);
    };

    // Ensure newly added objects get a default label
    const handleObjectAdded = (e: any) => {
      const obj = e.target;
      if (obj && !obj.hasOwnProperty("label")) {
        obj.set("label", "");
      }
    };

    canvas.on("selection:created", handleSelectionCreated);
    canvas.on("selection:updated", handleSelectionCreated);
    canvas.on("selection:cleared", handleSelectionCleared);
    canvas.on("object:added", handleObjectAdded);

    return () => {
      canvas.off("selection:created", handleSelectionCreated);
      canvas.off("selection:updated", handleSelectionCreated);
      canvas.off("selection:cleared", handleSelectionCleared);
      canvas.off("object:added", handleObjectAdded);
    };
  }, [canvas]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {isEditing && <Sidebar />}

        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-hidden bg-[#f0f0f0] flex items-center justify-center">
            <Canvas />
          </div>
        </div>
      </div>
      {showProperties && isEditing && <Properties />}
    </div>
  );
};

export default Editor;
