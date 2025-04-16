import { Canvas, Object as FabricObject } from "fabric";

// Define which properties can be locked individually
export interface LockProperties {
  position?: boolean; // Movement
  scaling?: boolean; // Resizing
  rotation?: boolean; // Rotation
  content?: boolean; // Text content for text objects
  style?: boolean; // Style properties like color
  fontFamily?: boolean; // Font family for text
  fontSize?: boolean; // Font size for text
  deletion?: boolean; // Whether object can be deleted
}

// Apply locks to an object based on the specified properties
export function lockObject(
  obj: FabricObject,
  fullLock: boolean = false,
  properties?: LockProperties
) {
  // Full lock prevents all modifications
  if (fullLock) {
    obj.set({
      lockMovementX: true,
      lockMovementY: true,
      lockRotation: true,
      lockScalingX: true,
      lockScalingY: true,
      lockSkewingX: true,
      lockSkewingY: true,
      hasControls: false,
      selectable: false,
      editable: false,
    });

    // Store the lock state on the object for later reference
    obj.set("locked", true);
    obj.set("lockProperties", {
      position: true,
      scaling: true,
      rotation: true,
      content: true,
      style: true,
      fontFamily: true,
      fontSize: true,
      deletion: true,
    });
    return;
  }

  // Set default lock state - everything is editable
  const lockProps: LockProperties = {
    position: false,
    scaling: false,
    rotation: false,
    content: false,
    style: false,
    fontFamily: false,
    fontSize: false,
    deletion: false,
    ...properties,
  };

  // Store the lock properties on the object
  obj.set("lockProperties", lockProps);
  obj.set(
    "locked",
    Object.values(lockProps).some((value) => value)
  );

  // Apply individual locks
  obj.set({
    lockMovementX: lockProps.position,
    lockMovementY: lockProps.position,
    lockRotation: lockProps.rotation,
    lockScalingX: lockProps.scaling,
    lockScalingY: lockProps.scaling,
    hasControls: !(lockProps.scaling && lockProps.rotation),
  });

  // Handle text-specific locks
  if (obj.type === "text" || obj.type === "textbox") {
    obj.set({
      editable: !lockProps.content,
      // Store additional text-specific locks
      _lockFontSize: lockProps.fontSize,
      _lockFontFamily: lockProps.fontFamily,
      _lockTextStyle: lockProps.style,
    });
  }
}

// Unlock an object completely
export function unlockObject(obj: FabricObject) {
  obj.set({
    lockMovementX: false,
    lockMovementY: false,
    lockRotation: false,
    lockScalingX: false,
    lockScalingY: false,
    lockSkewingX: false,
    lockSkewingY: false,
    hasControls: true,
    selectable: true,
    editable: true,
    locked: false,
    lockProperties: null,
  });
}

// Check if a specific property of an object is locked
export function isPropertyLocked(
  obj: FabricObject,
  property: keyof LockProperties
): boolean {
  const lockProps = obj.get("lockProperties") as LockProperties | undefined;

  if (!lockProps) return false;

  return lockProps[property] === true;
}

// Apply lock states during object loading
export function applyLockStatesToLoadedObject(obj: FabricObject) {
  const locked = obj.get("locked");
  const lockProperties = obj.get("lockProperties") as
    | LockProperties
    | undefined;

  if (locked && !lockProperties) {
    // If object is marked as locked but doesn't have specific properties,
    // apply full lock
    lockObject(obj, true);
  } else if (lockProperties) {
    // Apply specific lock properties
    lockObject(obj, false, lockProperties);
  }
}
