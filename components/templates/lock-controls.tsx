"use client";

import React, { useEffect, useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import { LockProperties, lockObject, unlockObject } from "@/utils/lock-utils";
import { Switch } from "@/components/ui/switch";
import {
  Lock,
  Unlock,
  Shield,
  Move,
  RotateCw,
  Maximize,
  Type,
  Palette,
  Text,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const LockControls = () => {
  const { canvas } = useEditorStore();
  const [activeObject, setActiveObject] = useState<any | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockProperties, setLockProperties] = useState<LockProperties>({
    position: false,
    scaling: false,
    rotation: false,
    content: false,
    style: false,
    fontFamily: false,
    fontSize: false,
    deletion: false,
  });

  // Load lock status when active object changes
  useEffect(() => {
    if (!canvas) return;

    const updateActiveObject = () => {
      const obj = canvas.getActiveObject();
      setActiveObject(obj || null);

      if (obj) {
        const locked = obj.get("locked") || false;
        setIsLocked(locked);

        const lockProps = (obj.get("lockProperties") as LockProperties) || {
          position: false,
          scaling: false,
          rotation: false,
          content: false,
          style: false,
          fontFamily: false,
          fontSize: false,
          deletion: false,
        };
        setLockProperties(lockProps);
      }
    };

    updateActiveObject();

    canvas.on("selection:created", updateActiveObject);
    canvas.on("selection:updated", updateActiveObject);
    canvas.on("selection:cleared", () => setActiveObject(null));

    return () => {
      canvas.off("selection:created", updateActiveObject);
      canvas.off("selection:updated", updateActiveObject);
      canvas.off("selection:cleared");
    };
  }, [canvas]);

  // Toggle full lock
  const toggleFullLock = () => {
    if (!canvas || !activeObject) return;

    if (isLocked) {
      unlockObject(activeObject);
      setIsLocked(false);
      setLockProperties({
        position: false,
        scaling: false,
        rotation: false,
        content: false,
        style: false,
        fontFamily: false,
        fontSize: false,
        deletion: false,
      });
    } else {
      lockObject(activeObject, true);
      setIsLocked(true);
      setLockProperties({
        position: true,
        scaling: true,
        rotation: true,
        content: true,
        style: true,
        fontFamily: true,
        fontSize: true,
        deletion: true,
      });
    }

    canvas.requestRenderAll();
  };

  // Toggle individual property lock
  const togglePropertyLock = (property: keyof LockProperties) => {
    if (!canvas || !activeObject) return;

    const newLockProps = { ...lockProperties };
    newLockProps[property] = !newLockProps[property];
    setLockProperties(newLockProps);

    lockObject(activeObject, false, newLockProps);

    // We don't set isLocked to true here, to keep property controls visible
    const anyLocked = Object.values(newLockProps).some((val) => val);
    setIsLocked(false); // Always keep isLocked false to keep controls visible

    canvas.requestRenderAll();
  };

  if (!activeObject) return null;

  // Determine which controls to show based on object type
  const isTextObject =
    activeObject.type === "text" || activeObject.type === "textbox";

  // Count how many properties are locked
  const lockedPropertiesCount =
    Object.values(lockProperties).filter(Boolean).length;
  const totalProperties = isTextObject ? 8 : 4;

  return (
    <div className="p-4 bg-white rounded-md shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Object Protection
          </h3>
        </div>

        <Button
          variant={isLocked ? "destructive" : "outline"}
          size="sm"
          className="flex items-center gap-2"
          onClick={toggleFullLock}
        >
          {isLocked ? (
            <>
              <Unlock className="h-4 w-4" /> Unlock All
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" /> Lock All
            </>
          )}
        </Button>
      </div>

      {lockedPropertiesCount > 0 && !isLocked && (
        <div className="mb-3 bg-blue-50 p-2 rounded-md flex items-center justify-between">
          <span className="text-sm text-blue-700">
            {lockedPropertiesCount} of {totalProperties} properties locked
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              setLockProperties({
                position: false,
                scaling: false,
                rotation: false,
                content: false,
                style: false,
                fontFamily: false,
                fontSize: false,
                deletion: false,
              });
              lockObject(activeObject, false, {
                position: false,
                scaling: false,
                rotation: false,
                content: false,
                style: false,
                fontFamily: false,
                fontSize: false,
                deletion: false,
              });
              canvas?.requestRenderAll();
            }}
          >
            Reset All
          </Button>
        </div>
      )}

      <div className="space-y-2">
        <div className="grid grid-cols-1 gap-2">
          <LockPropertyItem
            icon={<Move className="h-4 w-4 text-gray-600" />}
            label="Position"
            checked={lockProperties.position}
            onChange={() => togglePropertyLock("position")}
            disabled={isLocked}
          />

          <LockPropertyItem
            icon={<Maximize className="h-4 w-4 text-gray-600" />}
            label="Scaling/Resizing"
            checked={lockProperties.scaling}
            onChange={() => togglePropertyLock("scaling")}
            disabled={isLocked}
          />

          <LockPropertyItem
            icon={<RotateCw className="h-4 w-4 text-gray-600" />}
            label="Rotation"
            checked={lockProperties.rotation}
            onChange={() => togglePropertyLock("rotation")}
            disabled={isLocked}
          />

          <LockPropertyItem
            icon={<Ban className="h-4 w-4 text-gray-600" />}
            label="Prevent Deletion"
            checked={lockProperties.deletion}
            onChange={() => togglePropertyLock("deletion")}
            disabled={isLocked}
          />

          {isTextObject && (
            <>
              <Separator className="my-2" />
              <h4 className="text-sm font-medium text-gray-600 py-1">
                Text Properties
              </h4>

              <LockPropertyItem
                icon={<Type className="h-4 w-4 text-gray-600" />}
                label="Text Content"
                checked={lockProperties.content}
                onChange={() => togglePropertyLock("content")}
                disabled={isLocked}
              />

              <LockPropertyItem
                icon={<Text className="h-4 w-4 text-gray-600" />}
                label="Font Size"
                checked={lockProperties.fontSize}
                onChange={() => togglePropertyLock("fontSize")}
                disabled={isLocked}
              />

              <LockPropertyItem
                icon={<Text className="h-4 w-4 text-gray-600" />}
                label="Font Family"
                checked={lockProperties.fontFamily}
                onChange={() => togglePropertyLock("fontFamily")}
                disabled={isLocked}
              />

              <LockPropertyItem
                icon={<Palette className="h-4 w-4 text-gray-600" />}
                label="Style (Color, etc.)"
                checked={lockProperties.style}
                onChange={() => togglePropertyLock("style")}
                disabled={isLocked}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper component for each lock property item
const LockPropertyItem = ({
  icon,
  label,
  checked,
  onChange,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  checked: boolean | undefined;
  onChange: () => void;
  disabled: boolean;
}) => (
  <div
    className={`flex items-center justify-between p-2 rounded-md ${
      checked ? "bg-blue-50" : "hover:bg-gray-50"
    }`}
  >
    <div className="flex items-center gap-2">
      {icon}
      <span className={`text-sm ${checked ? "font-medium" : ""}`}>{label}</span>
    </div>
    <Switch
      checked={checked || false}
      onCheckedChange={onChange}
      disabled={disabled}
      className={checked ? "data-[state=checked]:bg-blue-600" : ""}
    />
  </div>
);

export default LockControls;
