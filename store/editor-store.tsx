"use client";

import { centerCanvas } from "@/utils/fabric-utils";
import { saveCanvasState } from "@/utils/design-service";
import { debounce } from "lodash";
import { create } from "zustand";
import { Canvas } from "fabric";

interface EditorState {
  canvas: Canvas | null;
  setCanvas: (canvas: Canvas | null) => void;
  designId: string | null;
  setDesignId: (id: string | null) => void;
  isEditing: boolean;
  setIsEditing: (flag: boolean) => void;
  name: string;
  setName: (value: string) => void;
  showProperties: boolean;
  setShowProperties: (flag: boolean) => void;
  saveStatus: string;
  setSaveStatus: (status: string) => void;
  lastModified: number;
  isModified: boolean;
  markAsModified: () => void;
  saveToServer: () => Promise<any>;
  debouncedSaveToServer: () => void;
  userSubscription: any;
  setUserSubscription: (data: any) => void;
  userDesigns: any[];
  setUserDesigns: (data: any[]) => void;
  userDesignsLoading: boolean;
  setUserDesignsLoading: (flag: boolean) => void;
  showPremiumModal: boolean;
  setShowPremiumModal: (flag: boolean) => void;
  showDesignsModal: boolean;
  setShowDesignsModal: (flag: boolean) => void;
  resetStore: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  canvas: null,
  setCanvas: (canvas: Canvas | null) => {
    set({ canvas });
    if (canvas) {
      centerCanvas(canvas);
    }
  },

  designId: null,
  setDesignId: (id: string | null) => set({ designId: id }),

  isEditing: true,
  setIsEditing: (flag: boolean) => set({ isEditing: flag }),

  name: "Untitled Design",
  setName: (value: string) => set({ name: value }),

  showProperties: false,
  setShowProperties: (flag: boolean) => set({ showProperties: flag }),

  saveStatus: "saved",
  setSaveStatus: (status: string) => set({ saveStatus: status }),
  lastModified: Date.now(),
  isModified: false,

  markAsModified: () => {
    const designId = get().designId;

    if (designId) {
      set({
        lastModified: Date.now(),
        saveStatus: "Saving...",
        isModified: true,
      });

      get().debouncedSaveToServer();
    } else {
      console.error("No design ID Available");
    }
  },

  saveToServer: async () => {
    const designId = get().designId;
    const canvas = get().canvas;

    if (!canvas || !designId) {
      console.log("No design ID Available or canvas instance is not available");
      return null;
    }

    try {
      const savedDesign = await saveCanvasState(canvas, designId, get().name);

      set({
        saveStatus: "Saved",
        isModified: false,
      });

      return savedDesign;
    } catch (e) {
      set({ saveStatus: "Error" });
      return null;
    }
  },

  debouncedSaveToServer: debounce(() => {
    get().saveToServer();
  }, 500),

  userSubscription: null,
  setUserSubscription: (data) => set({ userSubscription: data }),

  userDesigns: [],
  setUserDesigns: (data) => set({ userDesigns: data }),

  userDesignsLoading: false,
  setUserDesignsLoading: (flag) => set({ userDesignsLoading: flag }),

  showPremiumModal: false,
  setShowPremiumModal: (flag) => set({ showPremiumModal: flag }),

  showDesignsModal: false,
  setShowDesignsModal: (flag) => set({ showDesignsModal: flag }),

  resetStore: () => {
    set({
      canvas: null,
      designId: null,
      isEditing: true,
      name: "Untitled Design",
      showProperties: false,
      saveStatus: "Saved",
      isModified: false,
      lastModified: Date.now(),
    });
  },
}));
