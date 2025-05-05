import {
  Canvas,
  FabricImage,
  IText,
  FabricObject,
  Object as FabricObjectClass,
} from "fabric";

interface TextOptions {
  left?: number;
  top?: number;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  padding?: number;
  textAlign?: string;
  id?: string;
  [key: string]: any;
}

export const initializeFabric = async (
  canvasEl: HTMLCanvasElement,
  containerEl: HTMLElement
) => {
  try {
    const { Canvas } = await import("fabric");

    const canvas = new Canvas(canvasEl, {
      preserveObjectStacking: true,
      isDrawingMode: false,
      renderOnAddRemove: true,
    });

    console.log("Canvas is initialized");

    return canvas;
  } catch (e) {
    console.error("Failed to load fabric", e);
    return null;
  }
};

export const centerCanvas = (canvas: Canvas | null): void => {
  if (!canvas || !canvas.wrapperEl) return;

  const canvasWrapper = canvas.wrapperEl;

  canvasWrapper.style.width = `${canvas.width}px`;
  canvasWrapper.style.height = `${canvas.height}px`;

  canvasWrapper.style.position = "absolute";
  canvasWrapper.style.top = "50%";
  canvasWrapper.style.left = "50%";
  canvasWrapper.style.transform = "translate(-50%, -50%)";
};

export const addTextToCanvas = async (
  canvas: Canvas | null,
  text: string,
  options: TextOptions = {},
  withBackground: boolean = false
): Promise<IText | null> => {
  if (!canvas) return null;

  try {
    const defaultProps: TextOptions = {
      left: 100,
      top: 100,
      fontSize: 24,
      fontFamily: "Arial",
      fill: "#000000",
      padding: withBackground ? 10 : 0,
      textAlign: "left",
      id: `text-${Date.now()}`,
    };

    const textObj = new IText(text, {
      ...defaultProps,
      ...options,
    });

    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    canvas.renderAll();

    return textObj;
  } catch (e) {
    return null;
  }
};

export const addImageToCanvas = async (
  canvas: Canvas | null,
  imageUrl: string
): Promise<FabricImage | null> => {
  if (!canvas) return null;

  try {
    let imgObj = new Image();
    imgObj.crossOrigin = "Anonymous";
    imgObj.src = imageUrl;

    return new Promise((resolve, reject) => {
      imgObj.onload = () => {
        let image = new FabricImage(imgObj, {
          crossOrigin: "anonymous",
        });
        image.set({
          id: `image-${Date.now()}`,
          top: 100,
          left: 100,
          padding: 10,
          cornerSize: 10,
        });

        const maxDimension = 400;

        if (
          image.width &&
          image.height &&
          (image.width > maxDimension || image.height > maxDimension)
        ) {
          if (image.width > image.height) {
            const scale = maxDimension / image.width;
            image.scale(scale);
          } else {
            const scale = maxDimension / image.height;
            image.scale(scale);
          }
        }

        canvas.add(image);
        canvas.setActiveObject(image);
        canvas.renderAll();
        resolve(image);
      };

      imgObj.onerror = () => {
        reject(new Error(`Failed to load image: ${imageUrl}`));
      };
    });
  } catch (error) {
    console.error("Error adding image");
    return null;
  }
};

export const deletedSelectedObject = async (
  canvas: Canvas | null
): Promise<boolean> => {
  if (!canvas) return false;

  const activeObject = canvas.getActiveObject();

  if (!activeObject) return false;

  try {
    canvas.remove(activeObject);
    canvas.discardActiveObject();
    canvas.renderAll();

    return true;
  } catch (e) {
    console.error("Error while deleting", e);
    return false;
  }
};

export const customizeBoundingBox = (canvas: Canvas | null): void => {
  if (!canvas) return;

  try {
    canvas.on("object:added", ({ target }) => {
      if (target) {
        target.set({
          borderColor: "#00ffe7",
          cornerColor: "#000000",
          cornerStrokeColor: "#00ffe7",
          cornerSize: 10,
          transparentCorners: false,
        });
      }
    });

    canvas.getObjects().forEach((obj: FabricObject) => {
      obj.set({
        borderColor: "#00ffe7",
        cornerColor: "#000000",
        cornerStrokeColor: "#00ffe7",
        cornerSize: 10,
        transparentCorners: false,
      });
    });

    canvas.renderAll();
  } catch (e) {
    console.error("Failed to customize bounding box", e);
  }
};

/**
 * Registers custom properties with Fabric.js for serialization
 */
export function registerCustomProperties() {
  // Add properties to be included in serialization by default
  const additionalProps = [
    "lockMovementX",
    "lockMovementY",
    "lockRotation",
    "lockScalingX",
    "lockScalingY",
    "selectable",
    "hasControls",
    "locked",
    "label", // Add the label property
  ];

  // Override toObject method to include our custom properties
  FabricObjectClass.prototype.toObject = (function (toObject) {
    return function (this: FabricObject, propertiesToInclude = []) {
      return toObject.call(this, propertiesToInclude.concat(additionalProps));
    };
  })(FabricObjectClass.prototype.toObject);
}

// Add a helper function to initialize objects with default properties
export function initializeObjectDefaults(obj: any) {
  if (!obj.hasOwnProperty("label")) {
    obj.set("label", "");
  }
  return obj;
}
