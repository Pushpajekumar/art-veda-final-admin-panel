import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { database, ID } from "@/appwrite";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

export function CustomeButton() {
  const router = useRouter();

  const widthRef = useRef<HTMLInputElement>(null);
  const heightRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    try {
      setLoading(true);

      const widthInput = widthRef.current?.value;
      const heightInput = heightRef.current?.value;
      if (!widthInput || !heightInput) {
        toast.error("Please enter both width and height");
        return;
      }

      const parsedWidth = parseFloat(widthInput);
      const parsedHeight = parseFloat(heightInput);

      if (isNaN(parsedWidth) || isNaN(parsedHeight)) {
        toast.error("Width or height is not a valid number");
        return;
      }

      const template = await database.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_TEMPLATE_COLLECTION_ID!,
        ID.unique(),
        { width: parsedWidth, height: parsedHeight }
      );
      console.log(template);
      toast.success("Custom banner created successfully");
      router.push(
        `/admin/templates/${template.$id}?width=${parsedWidth}&height=${parsedHeight}`
      );
      if (widthRef.current) {
        widthRef.current.value = "";
      }
      if (heightRef.current) {
        heightRef.current.value = "";
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create custom button");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Create Custome Banner</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dimensions</h4>
            <p className="text-sm text-muted-foreground">
              Set the dimensions for the layer.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                defaultValue="100%"
                className="col-span-2 h-8"
                ref={widthRef}
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                defaultValue="25px"
                className="col-span-2 h-8"
                ref={heightRef}
              />
            </div>
          </div>
          <Button isLoading={loading} onClick={handleCreate}>
            Create
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
