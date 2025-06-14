"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { fontFamilies } from "@/config";
import { deletedSelectedObject } from "@/utils/fabric-utils";
import { useEditorStore } from "@/store/editor-store";
import {
  AlignCenter,
  AlignHorizontalSpaceAround,
  AlignLeft,
  AlignRight,
  AlignVerticalSpaceAround,
  Bold,
  Copy,
  FlipHorizontal,
  FlipVertical,
  Italic,
  MoveDown,
  MoveUp,
  Trash,
  Underline,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function Properties() {
  const { canvas, markAsModified } = useEditorStore();

  const [selectedObject, setSelectedObject] = useState<any | null>(null);
  const [objectType, setObjectType] = useState("");
  const [objectLabel, setObjectLabel] = useState<string>("");
  const [frameTextObjects, setFrameTextObjects] = useState<any[]>([]);

  const [opacity, setOpacity] = useState(100);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontWeight, setFontWeight] = useState("normal");
  const [fontStyle, setFontStyle] = useState("normal");
  const [underline, setUnderline] = useState(false);
  const [textColor, setTextColor] = useState("#000000");
  const [textBackgroundColor, setTextBackgroundColor] = useState("");
  const [letterSpacing, setLetterSpacing] = useState(0);

  const [fillColor, setFillColor] = useState("#ffffff");
  const [borderColor, setBorderColor] = useState("#000000");
  const [borderWidth, setBorderWidth] = useState(0);
  const [borderStyle, setBorderStyle] = useState("solid");

  const [filter, setFilter] = useState("none");
  const [blur, setBlur] = useState(0);

  useEffect(() => {
    if (!canvas) return;

    const handleSelectionCreated = () => {
      const activeObject = canvas.getActiveObject() as any;

      if (activeObject) {
        setSelectedObject(activeObject);
        setObjectLabel(activeObject.label || "");

        setOpacity(Math.round(activeObject.opacity * 100) || 100);
        setWidth(Math.round(activeObject.width * activeObject.scaleX));
        setHeight(Math.round(activeObject.height * activeObject.scaleY));
        setBorderColor(
          typeof activeObject.stroke === "string"
            ? activeObject.stroke
            : "#000000"
        );
        setBorderWidth(activeObject.strokeWidth || 0);

        if (activeObject.type === "i-text") {
          setObjectType("text");

          setText(activeObject.text || "");
          setFontSize(activeObject.fontSize || 24);
          setFontFamily(activeObject.fontFamily || "Arial");
          setFontWeight(activeObject.fontWeight || "normal");
          setFontStyle(activeObject.fontStyle || "normal");
          setUnderline(activeObject.underline || false);
          setTextColor(
            typeof activeObject.fill === "string"
              ? activeObject.fill
              : "#000000"
          );
          setTextBackgroundColor(activeObject.backgroundColor || "");
          setLetterSpacing(activeObject.charSpacing || 0);
        } else if (activeObject.type === "image") {
          setObjectType("image");

          if (activeObject.filters && activeObject.filters.length > 0) {
            const filterObj = activeObject.filters[0];
            if (filterObj.type === "Grayscale") setFilter("grayscale");
            else if (filterObj.type === "Sepia") setFilter("sepia");
            else if (filterObj.type === "Invert") setFilter("invert");
            else if (filterObj.type === "Blur") {
              setFilter("blur");
              setBlur(filterObj.blur * 100 || 0);
            } else setFilter("none");
          }

          if (activeObject.strokeDashArray) {
            if (
              activeObject.strokeDashArray[0] === 5 &&
              activeObject.strokeDashArray[1] === 5
            ) {
              setBorderStyle("dashed");
            } else if (
              activeObject.strokeDashArray[0] === 2 &&
              activeObject.strokeDashArray[1] === 2
            ) {
              setBorderStyle("dotted");
            } else {
              setBorderStyle("solid");
            }
          }
        } else if (activeObject.type === "path") {
          setObjectType("path");

          if (activeObject.strokeDashArray) {
            if (
              activeObject.strokeDashArray[0] === 5 &&
              activeObject.strokeDashArray[1] === 5
            ) {
              setBorderStyle("dashed");
            } else if (
              activeObject.strokeDashArray[0] === 2 &&
              activeObject.strokeDashArray[1] === 2
            ) {
              setBorderStyle("dotted");
            } else {
              setBorderStyle("solid");
            }
          }
        } else if (activeObject.type === "group" && activeObject.isFrame) {
          setObjectType("frame");

          const textObjects = activeObject
            .getObjects()
            .filter(
              (obj: any) =>
                obj.type === "text" ||
                obj.type === "i-text" ||
                obj.type === "textbox"
            );

          setFrameTextObjects(textObjects);
        } else {
          setObjectType("shape");

          if (activeObject.fill && typeof activeObject.fill === "string") {
            setFillColor(activeObject.fill);
          }

          if (activeObject.strokeDashArray) {
            if (
              activeObject.strokeDashArray[0] === 5 &&
              activeObject.strokeDashArray[1] === 5
            ) {
              setBorderStyle("dashed");
            } else if (
              activeObject.strokeDashArray[0] === 2 &&
              activeObject.strokeDashArray[1] === 2
            ) {
              setBorderStyle("dotted");
            } else {
              setBorderStyle("solid");
            }
          }
        }
      }
    };

    const handleSelectionCleared = () => {
      setSelectedObject(null);
      setObjectLabel("");
      setFrameTextObjects([]);
    };

    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      handleSelectionCreated();
    }

    canvas.on("selection:created", handleSelectionCreated);
    canvas.on("selection:updated", handleSelectionCreated);
    canvas.on("object:modified", handleSelectionCreated);
    canvas.on("selection:cleared", handleSelectionCleared);

    return () => {
      canvas.off("selection:created", handleSelectionCreated);
      canvas.off("selection:updated", handleSelectionCreated);
      canvas.off("object:modified", handleSelectionCreated);
      canvas.off("selection:cleared", handleSelectionCleared);
    };
  }, [canvas]);

  const updateObjectProperty = (property: string, value: any) => {
    if (!canvas || !selectedObject) return;

    selectedObject.set(property, value);
    canvas.renderAll();
    markAsModified();
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setObjectLabel(newValue);

    if (selectedObject) {
      updateObjectProperty("label", newValue);
    }
  };

  const handleFrameTextLabelChange = (index: number, newLabel: string) => {
    if (!canvas || !frameTextObjects[index]) return;

    frameTextObjects[index].set("label", newLabel);
    canvas.renderAll();
  };

  const handleFrameTextChange = (index: number, newText: string) => {
    if (!canvas || !frameTextObjects[index]) return;

    frameTextObjects[index].set("text", newText);
    canvas.renderAll();
  };

  const handleOpacityChange = (value: number[]) => {
    const newValue = Number(value[0]);
    setOpacity(newValue);
    updateObjectProperty("opacity", newValue / 100);
  };

  const handleDelete = () => {
    if (!canvas || !selectedObject) return;
    deletedSelectedObject(canvas);
    markAsModified();
  };

  const handleBringToFront = () => {
    if (!canvas || !selectedObject) return;
    canvas.bringObjectToFront(selectedObject);
    canvas.renderAll();
    markAsModified();
  };

  const handleSendToBack = () => {
    if (!canvas || !selectedObject) return;
    canvas.sendObjectToBack(selectedObject);
    canvas.renderAll();
    markAsModified();
  };

  const handleFlipHorizontal = () => {
    if (!canvas || !selectedObject) return;
    const flipX = !selectedObject.flipX;
    updateObjectProperty("flipX", flipX);
  };

  const handleFlipVertical = () => {
    if (!canvas || !selectedObject) return;
    const flipY = !selectedObject.flipY;
    updateObjectProperty("flipY", flipY);
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = event.target.value;
    setText(newText);
    updateObjectProperty("text", newText);
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = Number(e.target.value);
    setFontSize(newSize);
    updateObjectProperty("fontSize", newSize);
  };

  const handleFontFamilyChange = (value: string) => {
    setFontFamily(value);
    updateObjectProperty("fontFamily", value);
  };

  const handleToggleBold = () => {
    const newWeight = fontWeight === "bold" ? "normal" : "bold";
    setFontWeight(newWeight);
    updateObjectProperty("fontWeight", newWeight);
  };

  const handleToggleItalic = () => {
    const newStyle = fontStyle === "italic" ? "normal" : "italic";
    setFontStyle(newStyle);
    updateObjectProperty("fontStyle", newStyle);
  };

  const handleToggleUnderline = () => {
    const newUnderline = !underline;
    setUnderline(newUnderline);
    updateObjectProperty("underline", newUnderline);
  };

  const handleToggleTextColorChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newTextColor = e.target.value;
    setTextColor(newTextColor);
    updateObjectProperty("fill", newTextColor);
  };

  const handleToggleTextBackgroundColorChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newTextBgColor = e.target.value;
    setTextBackgroundColor(newTextBgColor);
    updateObjectProperty("backgroundColor", newTextBgColor);
  };

  const handleLetterSpacingChange = (value: number[]) => {
    const newSpacing = value[0];
    setLetterSpacing(newSpacing);
    updateObjectProperty("charSpacing", newSpacing);
  };

  const handleFillColorChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newFillColor = event.target.value;
    setFillColor(newFillColor);
    updateObjectProperty("fill", newFillColor);
  };

  const handleBorderColorChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newBorderColor = event.target.value;
    setBorderColor(newBorderColor);
    updateObjectProperty("stroke", newBorderColor);
  };

  const handleBorderWidthChange = (value: number[]) => {
    const newBorderWidth = value[0];
    setBorderWidth(newBorderWidth);
    updateObjectProperty("strokeWidth", newBorderWidth);
  };

  const handleBorderStyleChange = (value: string) => {
    setBorderStyle(value);

    let strokeDashArray = null;

    if (value === "dashed") {
      strokeDashArray = [5, 5];
    } else if (value === "dotted") {
      strokeDashArray = [2, 2];
    }

    updateObjectProperty("strokeDashArray", strokeDashArray);
  };

  const handleImageFilterChange = async (value: string) => {
    setFilter(value);

    if (!canvas || !selectedObject || selectedObject.type !== "image") return;
    try {
      canvas.discardActiveObject();

      const { filters } = await import("fabric");

      selectedObject.filters = [];

      switch (value) {
        case "grayscale":
          selectedObject.filters.push(new filters.Grayscale());

          break;
        case "sepia":
          selectedObject.filters.push(new filters.Sepia());

          break;
        case "invert":
          selectedObject.filters.push(new filters.Invert());

          break;
        case "blur":
          selectedObject.filters.push(new filters.Blur({ blur: blur / 100 }));

          break;
        case "none":
        default:
          break;
      }

      selectedObject.applyFilters();

      canvas.setActiveObject(selectedObject);
      canvas.renderAll();
      markAsModified();
    } catch (e) {
      console.error("Failed to apply filters");
    }
  };

  const handleBlurChange = async (value: number[]) => {
    const newBlurValue = value[0];
    setBlur(newBlurValue);

    if (
      !canvas ||
      !selectedObject ||
      selectedObject.type !== "image" ||
      filter !== "blur"
    )
      return;

    try {
      const { filters } = await import("fabric");

      selectedObject.filters = [new filters.Blur({ blur: newBlurValue / 100 })];
      selectedObject.applyFilters();
      canvas.renderAll();
      markAsModified();
    } catch (error) {
      console.error("Error while applying blur !", error);
    }
  };

  const handleAlignLeft = () => {
    if (!canvas || !selectedObject) return;

    selectedObject.set({
      left: 0,
    });
    selectedObject.setCoords();
    canvas.renderAll();
  };

  const handleAlignCenter = () => {
    if (!canvas || !selectedObject) return;

    const canvasCenter = canvas.getWidth() / 2;
    const objectWidth =
      (selectedObject.width || 0) * (selectedObject.scaleX || 1);

    selectedObject.set({
      left: canvasCenter - objectWidth / 2,
    });
    selectedObject.setCoords();
    canvas.renderAll();
  };

  const handleAlignRight = () => {
    if (!canvas || !selectedObject) return;

    const canvasWidth = canvas.getWidth();
    const objectWidth =
      (selectedObject.width || 0) * (selectedObject.scaleX || 1);

    selectedObject.set({
      left: canvasWidth - objectWidth,
    });
    selectedObject.setCoords();
    canvas.renderAll();
  };

  const handleAlignTop = () => {
    if (!canvas || !selectedObject) return;

    selectedObject.set({
      top: 0,
    });
    selectedObject.setCoords();
    canvas.renderAll();
  };

  const handleAlignMiddle = () => {
    if (!canvas || !selectedObject) return;

    const canvasCenter = canvas.getHeight() / 2;
    const objectHeight =
      (selectedObject.height || 0) * (selectedObject.scaleY || 1);

    selectedObject.set({
      top: canvasCenter - objectHeight / 2,
    });
    selectedObject.setCoords();
    canvas.renderAll();
  };

  const handleAlignBottom = () => {
    if (!canvas || !selectedObject) return;

    const canvasHeight = canvas.getHeight();
    const objectHeight =
      (selectedObject.height || 0) * (selectedObject.scaleY || 1);

    selectedObject.set({
      top: canvasHeight - objectHeight,
    });
    selectedObject.setCoords();
    canvas.renderAll();
  };

  const handlePropertyChange = (property: string, value: any) => {
    if (!canvas || !selectedObject) return;

    selectedObject.set(property, value);
    selectedObject.setCoords();
    canvas.renderAll();
    markAsModified();
  };

  if (!selectedObject) return null;

  return (
    <div className="fixed right-0 top-[56px] bottom-[0px] w-[280px] bg-white border-l border-gray-200 z-10">
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <span className="font-medium">Properties</span>
        </div>
      </div>
      <div className="h-[calc(100%-96px)] overflow-auto p-4 space-y-6">
        <h3 className="text-sm font-medium">Size & Position</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className={"text-xs"}>Width</Label>
            <div className="h-9 px-3 py-2 border rounded-md flex items-center">
              {width}
            </div>
          </div>
          <div className="space-y-1">
            <Label className={"text-xs"}>height</Label>
            <div className="h-9 px-3 py-2 border rounded-md flex items-center">
              {height}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="opacity" className={"text-xs"}>
              Opacity
            </Label>
            <span>{opacity}%</span>
          </div>
          <Slider
            id="opacity"
            min={0}
            max={100}
            step={1}
            value={[opacity]}
            onValueChange={(value) => handleOpacityChange(value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleFlipHorizontal}
            variant={"outline"}
            size="sm"
            className={"h-8 text-xs"}
          >
            <FlipHorizontal className="h-4 w-4 mr-1" />
            Flip H
          </Button>
          <Button
            variant={"outline"}
            onClick={handleFlipVertical}
            size="sm"
            className={"h-8 text-xs"}
          >
            <FlipVertical className="h-4 w-4 mr-1" />
            Flip V
          </Button>
        </div>
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-sm font-medium">Layer Position</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleBringToFront}
              variant={"outline"}
              size="sm"
              className={"h-8 text-xs"}
            >
              <MoveUp className="h-4 w-4" />
              <span>Bring to front</span>
            </Button>
            <Button
              onClick={handleSendToBack}
              variant={"outline"}
              size="sm"
              className={"h-8 text-xs"}
            >
              <MoveDown className="h-4 w-4" />
              <span>Send to back</span>
            </Button>
          </div>
        </div>
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-sm font-medium">Duplicate and Delete</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleDelete}
              variant={"destructive"}
              size="sm"
              className={"h-8 text-xs"}
            >
              <Trash className="h-4 w-4" />
              <span>Delete</span>
            </Button>
          </div>
        </div>
        {selectedObject && (
          <div className="space-y-4">
            <div className="mb-4">
              <Label
                htmlFor="elementLabel"
                className="block text-sm font-medium mb-1"
              >
                Element Label
              </Label>
              <Input
                id="elementLabel"
                value={objectLabel}
                onChange={handleLabelChange}
                placeholder="Enter element label"
                className="w-full"
              />
            </div>
          </div>
        )}
        {objectType === "text" && (
          <div className="space-y-4 border-t">
            <h3 className="text-sm font-medium">Text Properties</h3>
            <div className="space-y-2">
              <Label className={"text-xs"} htmlFor="text-content">
                Text Content
              </Label>
              <Textarea
                id="text-content"
                value={text}
                onChange={handleTextChange}
                className={"h-20 resize-none"}
              />
            </div>
            <div className="space-y-2">
              <Label className={"text-xs"} htmlFor="font-size">
                Font Size
              </Label>
              <Input
                id="font-size"
                value={fontSize}
                onChange={(e) => handleFontSizeChange(e)}
                className={"w-16 h-7 text-xs"}
                type={"number"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="font-family" className="text-sm">
                Font family
              </Label>
              <Select value={fontFamily} onValueChange={handleFontFamilyChange}>
                <SelectTrigger id="font-family" className={"h-10"}>
                  <SelectValue placeholder="Select Font" />
                </SelectTrigger>
                <SelectContent>
                  {fontFamilies.map((fontItem) => (
                    <SelectItem
                      key={fontItem}
                      value={fontItem}
                      style={{ fontFamily: fontItem }}
                    >
                      {fontItem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Style</Label>
              <div className="flex gap-2">
                <Button
                  variant={fontWeight === "bold" ? "default" : "outline"}
                  size="icon"
                  onClick={handleToggleBold}
                  className={"w-8 h-8"}
                >
                  <Bold className="w-4 h-4" />
                </Button>
                <Button
                  variant={fontStyle === "italic" ? "default" : "outline"}
                  size="icon"
                  onClick={handleToggleItalic}
                  className={"w-8 h-8"}
                >
                  <Italic className="w-4 h-4" />
                </Button>
                <Button
                  variant={underline ? "default" : "outline"}
                  size="icon"
                  onClick={handleToggleUnderline}
                  className={"w-8 h-8"}
                >
                  <Underline className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex justify-between">
              <div className="space-y-2">
                <Label htmlFor="text-color" className="text-sm">
                  Text Color
                </Label>
                <div className="relative w-8 h-8 overflow-hidden rounded-md border">
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: textColor }}
                  />
                  <Input
                    id="text-color"
                    type="color"
                    value={textColor}
                    onChange={handleToggleTextColorChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="text-bg-color" className="text-sm">
                  Text BG Color
                </Label>
                <div className="relative w-8 h-8 overflow-hidden rounded-md border">
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: textBackgroundColor }}
                  />
                  <Input
                    id="text-bg-color"
                    type="color"
                    value={textBackgroundColor}
                    onChange={handleToggleTextBackgroundColorChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className={"text-xs"} htmlFor="letter-spacing">
                  Letter Spacing
                </Label>
                <span className="text-xs">{letterSpacing}</span>
              </div>
              <Slider
                id="letter-spacing"
                min={-200}
                max={800}
                step={10}
                value={[letterSpacing]}
                onValueChange={(value) => handleLetterSpacingChange(value)}
              />
            </div>
          </div>
        )}
        {objectType === "image" && (
          <div className="space-y-4 p-4 border-t">
            <h3 className="text-sm font-medium">Image Properties</h3>
            <div className="space-y-2">
              <Label htmlFor="border-color" className="text-xs">
                Border Color
              </Label>
              <div className="relative w-8 h-8 overflow-hidden rounded-md border">
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: borderColor }}
                />
                <Input
                  id="fill-color"
                  type="color"
                  value={borderColor}
                  onChange={handleBorderColorChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="border-width" className={"text-xs"}>
                Border Width
              </Label>
              <span className={"text-xs mb-2"}>{borderWidth}%</span>
              <Slider
                id="border-width"
                min={0}
                max={20}
                step={1}
                value={[borderWidth]}
                onValueChange={(value) => handleBorderWidthChange(value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="border-style" className={"text-xs"}>
                Border Style
              </Label>
              <Select
                value={borderStyle}
                onValueChange={handleBorderStyleChange}
              >
                <SelectTrigger id="border-style" className={"h-10"}>
                  <SelectValue placeholder="Select Border Style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="dashed">Dashed</SelectItem>
                  <SelectItem value="dotted">Dotted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter" className={"text-xs"}>
                Filter
              </Label>
              <Select value={filter} onValueChange={handleImageFilterChange}>
                <SelectTrigger id="filter" className={"h-10"}>
                  <SelectValue placeholder="Select Image Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="grayscale">Grayscale</SelectItem>
                  <SelectItem value="sepia">Sepia</SelectItem>
                  <SelectItem value="invert">Invert</SelectItem>
                  <SelectItem value="blur">Blur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {filter === "blur" && (
              <div className="space-y-2">
                <div className="flex justify-between mb-4">
                  <Label htmlFor="blur" className="text-xs">
                    Blur Amount
                  </Label>
                  <span className="font-medium text-xs">{blur}%</span>
                </div>
                <Slider
                  id="blur"
                  min={0}
                  max={100}
                  step={1}
                  value={[blur]}
                  onValueChange={(value) => handleBlurChange(value)}
                />
              </div>
            )}
          </div>
        )}
        {objectType === "frame" && frameTextObjects.length > 0 && (
          <div className="mt-4 space-y-4">
            <div className="border-t pt-3">
              <h4 className="text-md font-medium mb-2">
                Text Elements in Frame
              </h4>
              {frameTextObjects.map((textObj, index) => (
                <div key={index} className="mb-3 p-2 border rounded bg-gray-50">
                  <Label className="mb-1 block">Text {index + 1}</Label>
                  <Input
                    value={textObj.text}
                    onChange={(e) =>
                      handleFrameTextChange(index, e.target.value)
                    }
                    className="w-full mb-2"
                  />
                  <Label className="mb-1 block text-sm">Element Label</Label>
                  <Input
                    value={textObj.label || ""}
                    onChange={(e) =>
                      handleFrameTextLabelChange(index, e.target.value)
                    }
                    className="w-full mb-2"
                    placeholder="Enter label for this element"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Alignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Horizontal Alignment */}
            <div>
              <Label className="text-xs text-gray-600 mb-2 block">
                Horizontal
              </Label>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAlignLeft}
                  className="flex-1 h-8"
                  title="Align Left"
                >
                  <AlignLeft className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAlignCenter}
                  className="flex-1 h-8"
                  title="Align Center"
                >
                  <AlignCenter className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAlignRight}
                  className="flex-1 h-8"
                  title="Align Right"
                >
                  <AlignRight className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Vertical Alignment */}
            <div>
              <Label className="text-xs text-gray-600 mb-2 block">
                Vertical
              </Label>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAlignTop}
                  className="flex-1 h-8"
                  title="Align Top"
                >
                  <AlignVerticalSpaceAround className="h-3 w-3 rotate-180" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAlignMiddle}
                  className="flex-1 h-8"
                  title="Align Middle"
                >
                  <AlignHorizontalSpaceAround className="h-3 w-3 rotate-90" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAlignBottom}
                  className="flex-1 h-8"
                  title="Align Bottom"
                >
                  <AlignVerticalSpaceAround className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Position Controls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Position</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">X Position</Label>
                <Input
                  type="number"
                  value={selectedObject.left}
                  onChange={(e) =>
                    handlePropertyChange("left", Number(e.target.value))
                  }
                  className="h-7 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Y Position</Label>
                <Input
                  type="number"
                  value={selectedObject.top}
                  onChange={(e) =>
                    handlePropertyChange("top", Number(e.target.value))
                  }
                  className="h-7 text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Properties;
