import { Canvas, FabricImage, IText, FabricObject } from "fabric";

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

// Function to test if a video URL is accessible
export const testVideoUrl = async (videoUrl: string): Promise<boolean> => {
  try {
    const response = await fetch(videoUrl, {
      method: "HEAD",
      mode: "cors",
    });
    return response.ok;
  } catch (error) {
    console.warn("Video URL test failed:", error);
    return false;
  }
};

// Simple function to create a video element for testing
export const createTestVideoElement = (
  videoUrl: string
): Promise<HTMLVideoElement> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      console.log("Test video loaded successfully:", {
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
      });
      resolve(video);
    };

    video.onerror = (error) => {
      console.error("Test video failed to load:", error);
      reject(error);
    };

    video.src = videoUrl;
    video.load();
  });
};

export const addVideoToCanvas = async (
  canvas: Canvas | null,
  videoUrl: string
): Promise<FabricObject | null> => {
  if (!canvas) {
    console.error("Canvas is null");
    return null;
  }

  console.log("Starting video addition process...");
  console.log("Video URL:", videoUrl);
  console.log("Canvas dimensions:", canvas.width, "x", canvas.height);

  try {
    // First, test the video URL with a simple video element
    console.log("Testing video URL...");
    try {
      await createTestVideoElement(videoUrl);
      console.log("✅ Video URL test passed");
    } catch (testError) {
      console.error("❌ Video URL test failed:", testError);
      throw new Error("Video URL is not accessible or format is not supported");
    }

    // Create video element
    const videoElement = document.createElement("video");
    console.log("Video element created");

    // Set video properties
    videoElement.crossOrigin = "anonymous";
    videoElement.loop = true;
    videoElement.muted = true;
    videoElement.controls = false;
    videoElement.preload = "metadata";
    videoElement.playsInline = true;

    // Set default dimensions to avoid zero-size issues
    videoElement.width = 1080;
    videoElement.height = 1980;

    console.log("Video element configured");

    // Set video source and wait for it to load
    return new Promise((resolve, reject) => {
      console.log("Setting up video load promise");

      const timeoutId = setTimeout(() => {
        console.error("Video load timeout after 15 seconds");
        reject(
          new Error(
            "Video load timeout - video may be too large or URL inaccessible"
          )
        );
      }, 15000);

      videoElement.onloadedmetadata = async () => {
        try {
          clearTimeout(timeoutId);
          console.log("✅ Video metadata loaded successfully!");
          console.log(
            "Video dimensions:",
            videoElement.videoWidth,
            "x",
            videoElement.videoHeight
          );
          console.log("Video duration:", videoElement.duration, "seconds");

          // Ensure we have valid dimensions
          const videoWidth = videoElement.videoWidth || 320;
          const videoHeight = videoElement.videoHeight || 240;

          console.log("Using dimensions:", videoWidth, "x", videoHeight);

          // Create fabric image object from video element
          console.log("Creating Fabric image object...");
          const videoObject = new FabricImage(videoElement, {
            id: `video-${Date.now()}`,
            left: 100,
            top: 100,
            width: videoWidth,
            height: videoHeight,
            cornerSize: 10,
            transparentCorners: false,
            objectCaching: false, // Important for video to update frames
          });

          console.log("✅ Fabric image object created");

          // Scale video to reasonable size if too large
          const maxDimension = 400;
          if (videoWidth > maxDimension || videoHeight > maxDimension) {
            const scaleX = maxDimension / videoWidth;
            const scaleY = maxDimension / videoHeight;
            const scale = Math.min(scaleX, scaleY);
            videoObject.scale(scale);
            console.log("Video scaled by factor:", scale);
          }

          // Add custom properties to identify this as a video
          videoObject.set({
            type: "video",
            videoElement: videoElement,
            isVideo: true,
            originalVideoUrl: videoUrl,
          });

          console.log("✅ Video properties set");

          // Set up animation loop to update canvas when video frame changes
          let animationFrameId: number;
          const updateCanvas = () => {
            if (
              videoObject &&
              canvas &&
              videoElement &&
              !videoElement.paused &&
              !videoElement.ended
            ) {
              canvas.renderAll();
              animationFrameId = requestAnimationFrame(updateCanvas);
            }
          };

          // Event listeners for video control
          videoElement.addEventListener("play", () => {
            console.log("🎬 Video started playing");
            updateCanvas();
          });

          videoElement.addEventListener("pause", () => {
            console.log("⏸️ Video paused");
            if (animationFrameId) {
              cancelAnimationFrame(animationFrameId);
            }
          });

          videoElement.addEventListener("ended", () => {
            console.log("🏁 Video ended");
            if (animationFrameId) {
              cancelAnimationFrame(animationFrameId);
            }
          });

          videoElement.addEventListener("error", (e) => {
            console.error("❌ Video playback error:", e);
          });

          // Clean up when object is removed
          videoObject.on("removed", () => {
            console.log("🗑️ Video object removed from canvas");
            if (animationFrameId) {
              cancelAnimationFrame(animationFrameId);
            }
            videoElement.pause();
            videoElement.removeAttribute("src");
            videoElement.load();
          });

          // Add to canvas first
          console.log("Adding video object to canvas...");
          canvas.add(videoObject);
          canvas.setActiveObject(videoObject);
          canvas.renderAll();
          console.log("✅ Video object added to canvas");

          // Try to start playing the video after it's on canvas
          try {
            console.log("Attempting to play video...");
            await videoElement.play();
            console.log("✅ Video play started successfully");
          } catch (playError) {
            console.warn(
              "⚠️ Auto-play failed (browser restriction):",
              playError
            );
            // This is normal for most browsers due to auto-play policies
          }

          resolve(videoObject);
        } catch (error) {
          clearTimeout(timeoutId);
          console.error(
            "❌ Error processing video after metadata load:",
            error
          );
          reject(error);
        }
      };

      videoElement.onerror = (error) => {
        clearTimeout(timeoutId);
        console.error("❌ Video load error:", error);
        console.error("Video element error details:", {
          error: videoElement.error,
          networkState: videoElement.networkState,
          readyState: videoElement.readyState,
        });
        reject(
          new Error(
            "Failed to load video - check if URL is accessible and video format is supported"
          )
        );
      };

      videoElement.onabort = () => {
        clearTimeout(timeoutId);
        console.error("❌ Video load aborted");
        reject(new Error("Video load was aborted"));
      };

      // Try multiple approaches to set video source
      try {
        console.log("Setting video source:", videoUrl);
        // Method 1: Direct src assignment
        videoElement.src = videoUrl;
        videoElement.load();
        console.log("✅ Video source set and load() called");
      } catch (srcError) {
        console.warn(
          "⚠️ Direct src assignment failed, trying source element approach"
        );

        // Method 2: Using source element
        const sourceElement = document.createElement("source");
        sourceElement.src = videoUrl;
        sourceElement.type = "video/mp4"; // Default type
        videoElement.appendChild(sourceElement);
        videoElement.load();
        console.log("✅ Source element approach used");
      }
    });
  } catch (error) {
    console.error("❌ Fatal error in addVideoToCanvas:", error);
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
    "isVideo", // Add video identification
    "originalVideoUrl", // Video URL for reconstruction
  ];

  // Override toObject method to include our custom properties
  // Override toObject method to include our custom properties
  FabricObject.prototype.toObject = (function (toObject) {
    return function (this: FabricObject, propertiesToInclude = []) {
      return toObject.call(this, propertiesToInclude.concat(additionalProps));
    };
  })(FabricObject.prototype.toObject);
}

// Add a helper function to initialize objects with default properties
export function initializeObjectDefaults(obj: any) {
  if (!obj.hasOwnProperty("label")) {
    obj.set("label", "");
  }
  return obj;
}

// Video utility functions
export const pauseAllVideos = (canvas: Canvas | null): void => {
  if (!canvas) return;

  canvas.getObjects().forEach((obj: any) => {
    if (obj.isVideo && obj.videoElement) {
      obj.videoElement.pause();
    }
  });
};

export const playAllVideos = (canvas: Canvas | null): void => {
  if (!canvas) return;

  canvas.getObjects().forEach((obj: any) => {
    if (obj.isVideo && obj.videoElement) {
      obj.videoElement.play().catch(console.error);
    }
  });
};

export const toggleVideoPlayback = (canvas: Canvas | null): void => {
  if (!canvas) return;

  const activeObject = canvas.getActiveObject() as any;
  if (activeObject && activeObject.isVideo && activeObject.videoElement) {
    if (activeObject.videoElement.paused) {
      activeObject.videoElement.play().catch(console.error);
    } else {
      activeObject.videoElement.pause();
    }
  }
};

export const setVideoVolume = (canvas: Canvas | null, volume: number): void => {
  if (!canvas) return;

  canvas.getObjects().forEach((obj: any) => {
    if (obj.isVideo && obj.videoElement) {
      obj.videoElement.volume = Math.max(0, Math.min(1, volume));
    }
  });
};

export const setVideoMuted = (canvas: Canvas | null, muted: boolean): void => {
  if (!canvas) return;

  canvas.getObjects().forEach((obj: any) => {
    if (obj.isVideo && obj.videoElement) {
      obj.videoElement.muted = muted;
    }
  });
};

// Function to prepare canvas for export by pausing videos
export const prepareCanvasForExport = (canvas: Canvas | null): void => {
  if (!canvas) return;

  canvas.getObjects().forEach((obj: any) => {
    if (obj.isVideo && obj.videoElement) {
      // Pause video during export to get a stable frame
      obj.videoElement.pause();
    }
  });

  // Force a render to ensure the current frame is captured
  canvas.renderAll();
};

// Function to resume videos after export
export const resumeVideosAfterExport = (canvas: Canvas | null): void => {
  if (!canvas) return;

  canvas.getObjects().forEach((obj: any) => {
    if (obj.isVideo && obj.videoElement && !obj.videoElement.ended) {
      // Resume video playback
      obj.videoElement.play().catch(console.error);
    }
  });
};

// Function to restore video objects when loading from JSON
export const restoreVideoObjects = async (
  canvas: Canvas | null
): Promise<void> => {
  if (!canvas) return;

  const objects = canvas.getObjects();
  for (const obj of objects) {
    const fabricObj = obj as any;
    if (
      fabricObj.isVideo &&
      fabricObj.originalVideoUrl &&
      !fabricObj.videoElement
    ) {
      try {
        // Recreate video element
        const videoElement = document.createElement("video");
        videoElement.src = fabricObj.originalVideoUrl;
        videoElement.crossOrigin = "anonymous";
        videoElement.loop = true;
        videoElement.muted = true;
        videoElement.controls = false;
        videoElement.preload = "metadata";
        videoElement.playsInline = true;

        // Wait for metadata to load
        await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error("Video load timeout"));
          }, 5000);

          videoElement.onloadedmetadata = () => {
            clearTimeout(timeoutId);
            resolve(null);
          };

          videoElement.onerror = () => {
            clearTimeout(timeoutId);
            reject(new Error("Failed to restore video"));
          };

          videoElement.load();
        });

        // Update the fabric object with the new video element
        fabricObj.set({
          videoElement: videoElement,
        });

        // Set up animation loop
        let animationFrameId: number;
        const updateCanvas = () => {
          if (
            fabricObj &&
            canvas &&
            videoElement &&
            !videoElement.paused &&
            !videoElement.ended
          ) {
            canvas.renderAll();
            animationFrameId = requestAnimationFrame(updateCanvas);
          }
        };

        videoElement.addEventListener("play", updateCanvas);
        videoElement.addEventListener("pause", () => {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
          }
        });

        // Set the video element as the image source
        if (fabricObj instanceof FabricImage) {
          fabricObj.setElement(videoElement);
        }
      } catch (error) {
        console.error("Failed to restore video object:", error);
        // Remove the broken video object
        canvas.remove(fabricObj);
      }
    }
  }

  canvas.renderAll();
};
