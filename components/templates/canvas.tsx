"use client";

import {
  customizeBoundingBox,
  initializeFabric,
  registerLockProperties,
} from "@/utils/fabric-utils";
import { useEditorStore } from "@/store/editor-store";
import { useEffect, useRef } from "react";
import * as fabric from "fabric";
import { isPropertyLocked } from "@/utils/lock-utils";
import { addLockIndicator } from "@/utils/fabric-utils";

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const initAttemptedRef = useRef(false);

  const { setCanvas, markAsModified } = useEditorStore();

  useEffect(() => {
    const cleanUpCanvas = () => {
      if (fabricCanvasRef.current) {
        try {
          fabricCanvasRef.current.off("object:added");
          fabricCanvasRef.current.off("object:modified");
          fabricCanvasRef.current.off("object:removed");
          fabricCanvasRef.current.off("path:created");
        } catch (e) {
          console.error("Error removing event listeners", e);
        }

        try {
          fabricCanvasRef.current.dispose();
        } catch (e) {
          console.error("Error disposing canvas", e);
        }

        fabricCanvasRef.current = null;
        setCanvas(null);
      }
    };

    cleanUpCanvas();

    // reset init flag
    initAttemptedRef.current = false;

    // init our canvas
    const initCanvas = async () => {
      if (
        typeof window === "undefined" ||
        !canvasRef.current ||
        initAttemptedRef.current
      ) {
        return;
      }

      initAttemptedRef.current = true;

      try {
        // Register custom properties for serialization before initializing canvas
        registerLockProperties();

        const fabricCanvas = await initializeFabric(
          canvasRef.current,
          canvasContainerRef.current!
        );

        if (!fabricCanvas) {
          console.error("Failed to initialize Fabric.js canvas");
          return;
        }

        fabricCanvasRef.current = fabricCanvas;
        // set the canvas in store
        setCanvas(fabricCanvas);

        console.log("Canvas init is done and set in store");

        // apply custom style for the controls
        customizeBoundingBox(fabricCanvas);

        // Add lock indicators to objects
        addLockIndicator(fabricCanvas);

        // Handle locked objects
        setupLockedObjectHandling(fabricCanvas);

        // set up event listeners
        const handleCanvasChange = () => {
          markAsModified();
        };

        fabricCanvas.on("object:added", handleCanvasChange);
        fabricCanvas.on("object:modified", handleCanvasChange);
        fabricCanvas.on("object:removed", handleCanvasChange);
        fabricCanvas.on("path:created", handleCanvasChange);
      } catch (e) {
        console.error("Failed to init canvas", e);
      }
    };

    const timer = setTimeout(() => {
      initCanvas();
    }, 50);

    return () => {
      clearTimeout(timer);
      cleanUpCanvas();
    };
  }, [setCanvas, markAsModified]);

  // Setup handling for locked objects
  const setupLockedObjectHandling = (canvas: fabric.Canvas) => {
    // Override the default behavior for text editing
    canvas.on("text:editing:entered", (e) => {
      const textObj = e.target;
      if (isPropertyLocked(textObj, "content")) {
        canvas.discardActiveObject();
        canvas.requestRenderAll();
      }
    });

    // Handle style changes for locked objects
    canvas.on("object:modified", (e) => {
      const obj = e.target as fabric.Object & {
        _stateBeforeModification?: { fontSize?: number; fontFamily?: string };
        type?: string;
        fontSize?: number;
        fontFamily?: string;
      };
      const originalState = obj._stateBeforeModification;

      if (!originalState) return;

      // Check if fontSize is locked and restore it
      if (obj.type === "text" || obj.type === "textbox") {
        if (
          isPropertyLocked(obj, "fontSize") &&
          obj.fontSize !== originalState.fontSize
        ) {
          obj.set("fontSize", originalState.fontSize);
        }

        // Handle other locked text properties
        if (
          isPropertyLocked(obj, "fontFamily") &&
          obj.fontFamily !== originalState.fontFamily
        ) {
          obj.set("fontFamily", originalState.fontFamily);
        }
      }

      canvas.requestRenderAll();
    });

    // Store the original state before modification starts
    canvas.on("object:scaling", (e) => {
      const obj = e.target as fabric.Object & {
        _stateBeforeModification?: { fontSize?: number; fontFamily?: string };
        fontSize?: number;
        fontFamily?: string;
      };
      if (!obj._stateBeforeModification) {
        obj._stateBeforeModification = {
          fontSize: obj.fontSize,
          fontFamily: obj.fontFamily,
          // Add other properties as needed
        };
      }
    });

    // Prevent deletion of locked objects
    const originalRemove = canvas.remove.bind(canvas);
    const canvasWithCustomProps = canvas as fabric.Canvas & {
      _customRemove: (obj: fabric.Object) => boolean | fabric.Object[];
    };
    canvasWithCustomProps._customRemove = function (obj: fabric.Object) {
      if (obj && isPropertyLocked(obj, "deletion")) {
        return false;
      }
      return originalRemove(obj);
    };
    canvas.remove = canvasWithCustomProps._customRemove as any;
  };

  return (
    <div
      className="relative w-full min-h-full overflow-auto"
      ref={canvasContainerRef}
    >
      <canvas ref={canvasRef} />
    </div>
  );
};

export default Canvas;
