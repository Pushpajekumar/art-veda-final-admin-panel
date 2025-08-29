"use client";
import { useEditorStore } from "@/store/editor-store";
import React, { use, useCallback, useEffect, useRef } from "react";
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

  // Use a ref to track if we've already loaded the design
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Reset the store
    resetStore();

    // Set the design id
    if (designId) {
      setDesignId(designId);
    }

    // Set if this is a frame
    setIsFrame(isFrame);

    return () => {
      // Cleanup the store
      resetStore();
    };
  }, [resetStore, setDesignId, setIsFrame, designId, isFrame]);

  useEffect(() => {
    setLoadingAttempt(false);
    setError(null);
  }, [designId]);

  useEffect(() => {
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

  // Load the design with improved image quality
  const loadDesign = useCallback(async () => {
    if (!canvas || !designId || loadingAttempt || hasLoadedRef.current) return;
    
    try {
      setLoading(true);
      setLoadingAttempt(true);
      hasLoadedRef.current = true;

      const design = canvasData;

      if (design) {
        // Update name
        setName("Design Name");

        // Set the design ID just in case after getting the data
        setDesignId(designId);

        try {
          if (design) {
            canvas.clear();
            
            // Set dimensions at full size for better quality
            // Scaling down for display but keeping high resolution data
            const displayScale = 1.5;
            const scaledWidth = (canvasWidth * displayScale);
            const scaledHeight = (canvasHeight * displayScale);

            if (canvasWidth && canvasHeight) {
              // Enable retina scaling for better image quality
              canvas.enableRetinaScaling = true;
              canvas.setDimensions({
                width: scaledWidth,
                height: scaledHeight,
              });

              console.log("Canvas dimensions set with retina scaling");
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

            // Load the JSON and scale all objects appropriately
            canvas.loadFromJSON(design, () => {
              // Scale down all objects for display but preserve original data
              canvas.getObjects().forEach((obj) => {
                // Apply scaling for display
                obj.scale(displayScale);
                obj.setCoords();

                // For image objects, improve rendering quality
                if (obj.type === 'image') {
                  // Preserve original dimensions for export
                  obj.set({
                    // Enable better image rendering
                    imageSmoothing: true,
                    // Set higher quality rendering
                    dirty: true
                  });
                }

                // Ensure lock properties are correctly applied after loading
                if (obj.lockMovementX) obj.lockMovementX = true;
                if (obj.lockMovementY) obj.lockMovementY = true;
                if (obj.lockRotation) obj.lockRotation = true;
                if (obj.lockScalingX) obj.lockScalingX = true;
                if (obj.lockScalingY) obj.lockScalingY = true;
                if (obj.hasOwnProperty("selectable"))
                  obj.selectable = obj.selectable;
              });
              
              // Improve rendering quality
              canvas.renderAll();
              // Set higher rendering quality
              canvas.setZoom(displayScale);
            });
          } else {
            console.log("no canvas data");
            canvas.clear();
            // Set dimensions with proper scaling
            canvas.enableRetinaScaling = true;
            canvas.setDimensions({
              width: canvasWidth * 1,
              height: canvasHeight * 1,
            });
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
        // Set dimensions with retina scaling
        canvas.enableRetinaScaling = true;
        canvas.setDimensions({
          width: canvasWidth * 1,
          height: canvasHeight * 1,
        });
        console.log("canvas dimensions set with retina scaling");
        canvas.backgroundColor = "#ffffff";
        console.log(canvas, "canvas");
        canvas.renderAll();
      }
    } catch (e) {
      console.error("Failed to load design", e);
      setError("failed to load design");
      setLoading(false);
    }
  }, [canvas, designId, loadingAttempt, setDesignId, setName, canvasData, canvasWidth, canvasHeight]);

  useEffect(() => {
    if (designId && canvas && !loadingAttempt && !hasLoadedRef.current) {
      loadDesign();
    } else if (!designId) {
      router;
    }
  }, [canvas, designId, loadDesign, loadingAttempt, router]);

  useEffect(() => {
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
      
      // For image objects, set higher quality rendering
      if (obj.type === 'image') {
        obj.set({
          imageSmoothing: true,
          dirty: true
        });
        canvas.requestRenderAll();
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
  }, [canvas, setShowProperties]);

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


// "use client";
// import { useEditorStore } from "@/store/editor-store";
// import React, { use, useCallback } from "react";
// import Canvas from "./canvas";
// import { useRouter } from "next/navigation";
// import Sidebar from "./sidebar";
// import Properties from "./properties";

// interface EditorProops {
//   canvasData: string;
//   designId: string | null;
//   canvasWidth: number;
//   canvasHeight: number;
//   isFrame?: boolean;
// }

// const Editor = ({
//   canvasData,
//   designId,
//   canvasWidth,
//   canvasHeight,
//   isFrame = false,
// }: EditorProops) => {
//   const [loading, setLoading] = React.useState(true);
//   const [error, setError] = React.useState<string | null>(null);
//   const [loadingAttempt, setLoadingAttempt] = React.useState(false);
//   const router = useRouter();
//   const {
//     canvas,
//     setDesignId,
//     resetStore,
//     setName,
//     setShowProperties,
//     showProperties,
//     isEditing,
//     setIsFrame,
//   } = useEditorStore();

//   React.useEffect(() => {
//     //reset the store
//     resetStore();

//     //set the design id
//     if (designId) {
//       setDesignId(designId);
//     }

//     // Set if this is a frame
//     setIsFrame(isFrame);

//     return () => {
//       //cleanup the store
//       resetStore();
//     };
//   }, []);

//   React.useEffect(() => {
//     setLoadingAttempt(false);
//     setError(null);
//   }, [designId]);

//   React.useEffect(() => {
//     if (loading && !canvas && designId) {
//       const timer = setTimeout(() => {
//         if (loading) {
//           console.log("Loading canvas data...");
//           setLoading(false);
//         }
//       }, 5000);

//       return () => clearTimeout(timer);
//     }
//   }, [loading, canvas, designId]);

//   //load the design ->
//   const loadDesign = useCallback(async () => {
//     if (!canvas || !designId || loadingAttempt) return;
//     try {
//       setLoading(true);
//       setLoadingAttempt(true);

//       const design = canvasData;

//       if (design) {
//         //update name
//         setName("Design Name");

//         //set the design ID just incase after getting the data
//         setDesignId(designId);

//         try {
//           if (design) {
//             canvas.clear();
//             // Set dimensions at half size
//             const scaledWidth = canvasWidth * 0.5;
//             const scaledHeight = canvasHeight * 0.5;

//             if (canvasWidth && canvasHeight) {
//               canvas.setDimensions({
//                 width: scaledWidth,
//                 height: scaledHeight,
//               });

//               console.log("Canvas dimensions set at half size");
//             }

//             const canvasData =
//               typeof design === "string" ? JSON.parse(design) : design;

//             const hasObjects =
//               canvasData.objects && canvasData.objects.length > 0;

//             if (canvasData.background) {
//               canvas.backgroundColor = canvasData.background;
//             } else {
//               canvas.backgroundColor = "#ffffff";
//             }

//             if (!hasObjects) {
//               canvas.renderAll();
//               return true;
//             }

//             // Load the JSON and scale all objects to 0.5x
//             canvas.loadFromJSON(design, () => {
//               // Scale down all objects and restore lock states
//               canvas.getObjects().forEach((obj) => {
//                 obj.scale(0.5);
//                 obj.setCoords();

//                 // Ensure lock properties are correctly applied after loading
//                 // Note: the properties should already be loaded from JSON but this ensures they're applied
//                 if (obj.lockMovementX) obj.lockMovementX = true;
//                 if (obj.lockMovementY) obj.lockMovementY = true;
//                 if (obj.lockRotation) obj.lockRotation = true;
//                 if (obj.lockScalingX) obj.lockScalingX = true;
//                 if (obj.lockScalingY) obj.lockScalingY = true;
//                 if (obj.hasOwnProperty("selectable"))
//                   obj.selectable = obj.selectable;
//               });
//               canvas.requestRenderAll();
//             });
//           } else {
//             console.log("no canvas data");
//             canvas.clear();
//             canvas.setWidth(canvasWidth * 0.5);
//             canvas.setHeight(canvasHeight * 0.5);
//             canvas.backgroundColor = "#ffffff";
//             canvas.renderAll();
//           }
//         } catch (e) {
//           console.error("Error loading canvas", e);
//           setError("Error loading canvas");
//         } finally {
//           setLoading(false);
//         }
//       } else {
//         console.log("no design data");
//         canvas.clear();
//         console.log(canvasWidth, canvasHeight, "canvasWidth canvasHeight");
//         // Set dimensions at half size
//         canvas.setDimensions({
//           width: canvasWidth * 0.5,
//           height: canvasHeight * 0.5,
//         });
//         console.log("canvas dimensions set at half size");
//         canvas.backgroundColor = "#ffffff";
//         console.log(canvas, "canvas");
//         canvas.renderAll();
//       }
//     } catch (e) {
//       console.error("Failed to load design", e);
//       setError("failed to load design");
//       setLoading(false);
//     }
//   }, [canvas, designId, loadingAttempt, setDesignId]);

//   React.useEffect(() => {
//     if (designId && canvas && !loadingAttempt) {
//       loadDesign();
//     } else if (!designId) {
//       router;
//     }
//   }, [canvas, designId, loadDesign, loadingAttempt, router]);

//   React.useEffect(() => {
//     if (!canvas) return;

//     const handleSelectionCreated = () => {
//       const activeObject = canvas.getActiveObject();

//       console.log(activeObject, "activeObject");

//       if (activeObject) {
//         setShowProperties(true);
//       }
//     };

//     const handleSelectionCleared = () => {
//       setShowProperties(false);
//     };

//     // Ensure newly added objects get a default label
//     const handleObjectAdded = (e: any) => {
//       const obj = e.target;
//       if (obj && !obj.hasOwnProperty("label")) {
//         obj.set("label", "");
//       }
//     };

//     canvas.on("selection:created", handleSelectionCreated);
//     canvas.on("selection:updated", handleSelectionCreated);
//     canvas.on("selection:cleared", handleSelectionCleared);
//     canvas.on("object:added", handleObjectAdded);

//     return () => {
//       canvas.off("selection:created", handleSelectionCreated);
//       canvas.off("selection:updated", handleSelectionCreated);
//       canvas.off("selection:cleared", handleSelectionCleared);
//       canvas.off("object:added", handleObjectAdded);
//     };
//   }, [canvas]);

//   return (
//     <div className="flex flex-col h-screen overflow-hidden">
//       <div className="flex flex-1 overflow-hidden">
//         {isEditing && <Sidebar />}

//         <div className="flex-1 flex flex-col overflow-hidden relative">
//           <div className="flex-1 overflow-hidden bg-[#f0f0f0] flex items-center justify-center">
//             <Canvas />
//           </div>
//         </div>
//       </div>
//       {showProperties && isEditing && <Properties />}
//     </div>
//   );
// };

// export default Editor;

// "use client";
// import { useEditorStore } from "@/store/editor-store";
// import React, { use, useCallback, useEffect, useRef } from "react";
// import Canvas from "./canvas";
// import { useRouter } from "next/navigation";
// import Sidebar from "./sidebar";
// import Properties from "./properties";

// interface EditorProops {
//   canvasData: string;
//   designId: string | null;
//   canvasWidth: number;
//   canvasHeight: number;
//   isFrame?: boolean;
// }

// const Editor = ({
//   canvasData,
//   designId,
//   canvasWidth,
//   canvasHeight,
//   isFrame = false,
// }: EditorProops) => {
//   const [loading, setLoading] = React.useState(true);
//   const [error, setError] = React.useState<string | null>(null);
//   const [loadingAttempt, setLoadingAttempt] = React.useState(false);
//   const router = useRouter();
//   const {
//     canvas,
//     setDesignId,
//     resetStore,
//     setName,
//     setShowProperties,
//     showProperties,
//     isEditing,
//     setIsFrame,
//   } = useEditorStore();

//   // Use a ref to track if we've already loaded the design
//   const hasLoadedRef = useRef(false);

//   useEffect(() => {
//     // Reset the store
//     resetStore();

//     // Set the design id
//     if (designId) {
//       setDesignId(designId);
//     }

//     // Set if this is a frame
//     setIsFrame(isFrame);

//     return () => {
//       // Cleanup the store
//       resetStore();
//     };
//   }, [resetStore, setDesignId, setIsFrame, designId, isFrame]);

//   useEffect(() => {
//     setLoadingAttempt(false);
//     setError(null);
//   }, [designId]);

//   useEffect(() => {
//     if (loading && !canvas && designId) {
//       const timer = setTimeout(() => {
//         if (loading) {
//           console.log("Loading canvas data...");
//           setLoading(false);
//         }
//       }, 5000);

//       return () => clearTimeout(timer);
//     }
//   }, [loading, canvas, designId]);

//   // Load the design with improved image quality
//   const loadDesign = useCallback(async () => {
//     if (!canvas || !designId || loadingAttempt || hasLoadedRef.current) return;

//     try {
//       setLoading(true);
//       setLoadingAttempt(true);
//       hasLoadedRef.current = true;

//       const design = canvasData;

//       if (design) {
//         // Update name
//         setName("Design Name");

//         // Set the design ID just in case after getting the data
//         setDesignId(designId);

//         try {
//           if (design) {
//             canvas.clear();

//             // Set dimensions at full size for better quality
//             // Scaling down for display but keeping high resolution data
//             const displayScale = 1.5;
//             const scaledWidth = canvasWidth * displayScale * 4;
//             const scaledHeight = canvasHeight * displayScale * 4;

//             if (canvasWidth && canvasHeight) {
//               // Enable retina scaling for better image quality
//               canvas.enableRetinaScaling = true;
//               canvas.setDimensions({
//                 width: scaledWidth,
//                 height: scaledHeight,
//               });

//               console.log("Canvas dimensions set with retina scaling");
//             }

//             const canvasData =
//               typeof design === "string" ? JSON.parse(design) : design;

//             const hasObjects =
//               canvasData.objects && canvasData.objects.length > 0;

//             if (canvasData.background) {
//               canvas.backgroundColor = canvasData.background;
//             } else {
//               canvas.backgroundColor = "#ffffff";
//             }

//             if (!hasObjects) {
//               canvas.renderAll();
//               return true;
//             }

//             // Load the JSON and scale all objects appropriately
//             canvas.loadFromJSON(design, () => {
//               // Scale down all objects for display but preserve original data
//               canvas.getObjects().forEach((obj) => {
//                 // Apply scaling for display
//                 obj.scale(displayScale);
//                 obj.setCoords();

//                 // For image objects, improve rendering quality
//                 if (obj.type === "image") {
//                   // Preserve original dimensions for export
//                   obj.set({
//                     // Enable better image rendering
//                     imageSmoothing: true,
//                     // Set higher quality rendering
//                     dirty: true,
//                   });
//                 }

//                 // Ensure lock properties are correctly applied after loading
//                 if (obj.lockMovementX) obj.lockMovementX = true;
//                 if (obj.lockMovementY) obj.lockMovementY = true;
//                 if (obj.lockRotation) obj.lockRotation = true;
//                 if (obj.lockScalingX) obj.lockScalingX = true;
//                 if (obj.lockScalingY) obj.lockScalingY = true;
//                 if (obj.hasOwnProperty("selectable"))
//                   obj.selectable = obj.selectable;
//               });

//               // Improve rendering quality
//               canvas.renderAll();
//               // Set higher rendering quality
//               canvas.setZoom(displayScale);
//             });
//           } else {
//             console.log("no canvas data");
//             canvas.clear();
//             // Set dimensions with proper scaling
//             canvas.enableRetinaScaling = true;
//             canvas.setDimensions({
//               width: canvasWidth * 1,
//               height: canvasHeight * 1,
//             });
//             canvas.backgroundColor = "#ffffff";
//             canvas.renderAll();
//           }
//         } catch (e) {
//           console.error("Error loading canvas", e);
//           setError("Error loading canvas");
//         } finally {
//           setLoading(false);
//         }
//       } else {
//         console.log("no design data");
//         canvas.clear();
//         console.log(canvasWidth, canvasHeight, "canvasWidth canvasHeight");
//         // Set dimensions with retina scaling
//         canvas.enableRetinaScaling = true;
//         canvas.setDimensions({
//           width: canvasWidth * 0.5,
//           height: canvasHeight * 0.5,
//         });
//         console.log("canvas dimensions set with retina scaling");
//         canvas.backgroundColor = "#ffffff";
//         console.log(canvas, "canvas");
//         canvas.renderAll();
//       }
//     } catch (e) {
//       console.error("Failed to load design", e);
//       setError("failed to load design");
//       setLoading(false);
//     }
//   }, [
//     canvas,
//     designId,
//     loadingAttempt,
//     setDesignId,
//     setName,
//     canvasData,
//     canvasWidth,
//     canvasHeight,
//   ]);

//   useEffect(() => {
//     if (designId && canvas && !loadingAttempt && !hasLoadedRef.current) {
//       loadDesign();
//     } else if (!designId) {
//       router;
//     }
//   }, [canvas, designId, loadDesign, loadingAttempt, router]);

//   useEffect(() => {
//     if (!canvas) return;

//     const handleSelectionCreated = () => {
//       const activeObject = canvas.getActiveObject();

//       console.log(activeObject, "activeObject");

//       if (activeObject) {
//         setShowProperties(true);
//       }
//     };

//     const handleSelectionCleared = () => {
//       setShowProperties(false);
//     };

//     // Ensure newly added objects get a default label
//     const handleObjectAdded = (e: any) => {
//       const obj = e.target;
//       if (obj && !obj.hasOwnProperty("label")) {
//         obj.set("label", "");
//       }

//       // For image objects, set higher quality rendering
//       if (obj.type === "image") {
//         obj.set({
//           imageSmoothing: true,
//           dirty: true,
//         });
//         canvas.requestRenderAll();
//       }
//     };

//     canvas.on("selection:created", handleSelectionCreated);
//     canvas.on("selection:updated", handleSelectionCreated);
//     canvas.on("selection:cleared", handleSelectionCleared);
//     canvas.on("object:added", handleObjectAdded);

//     return () => {
//       canvas.off("selection:created", handleSelectionCreated);
//       canvas.off("selection:updated", handleSelectionCreated);
//       canvas.off("selection:cleared", handleSelectionCleared);
//       canvas.off("object:added", handleObjectAdded);
//     };
//   }, [canvas, setShowProperties]);

//   return (
//     <div className="flex flex-col h-screen overflow-hidden">
//       <div className="flex flex-1 overflow-hidden">
//         {isEditing && <Sidebar />}

//         <div className="flex-1 flex flex-col overflow-hidden relative">
//           <div className="flex-1 overflow-hidden bg-[#f0f0f0] flex items-center justify-center">
//             <Canvas />
//           </div>
//         </div>
//       </div>
//       {showProperties && isEditing && <Properties />}
//     </div>
//   );
// };

// export default Editor;
