"use client";

import {
  ArrowLeft,
  ChevronLeft,
  Type,
  Upload,
  Image,
  Frame,
  Video,
} from "lucide-react";
import { useState, useCallback } from "react";

import { useEditorStore } from "@/store/editor-store";
import TextPanel from "./text";
import UploadPanel from "./upload";
import BackgroundPanel from "./background";
import Frames from "./frames";
import VideoPanel from "./video-panel";

function Sidebar() {
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState<string | null>(null);

  const sidebarItems = [
    {
      id: "text",
      icon: Type,
      label: "Text",
      panel: TextPanel,
    },
    {
      id: "uploads",
      icon: Upload,
      label: "Uploads",
      panel: UploadPanel,
    },
    {
      id: "background",
      icon: Image,
      label: "Background",
      panel: BackgroundPanel,
    },
    {
      id: "frames",
      icon: Frame,
      label: "Frames",
      panel: Frames,
    },
    {
      id: "video",
      icon: Video,
      label: "Video",
      panel: VideoPanel,
    },
  ];

  const handleItemClick = useCallback(
    (id: string) => {
      if (id === activeSidebar && !isPanelCollapsed) return;

      setActiveSidebar(id);
      setIsPanelCollapsed(false);
    },
    [activeSidebar, isPanelCollapsed]
  );

  const closeSecondaryPanel = useCallback(() => {
    setActiveSidebar(null);
    setIsPanelCollapsed(false);
  }, []);

  const togglePanelCollapse = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsPanelCollapsed(!isPanelCollapsed);
    },
    [isPanelCollapsed]
  );

  const activeItem = sidebarItems.find((item) => item.id === activeSidebar);

  return (
    <div className="flex h-full">
      <aside className="sidebar">
        {sidebarItems.map((item) => (
          <div
            onClick={() => handleItemClick(item.id)}
            key={item.id}
            className={`sidebar-item ${
              activeSidebar === item.id ? "active" : ""
            }`}
          >
            <item.icon className="sidebar-item-icon h-5 w-5" />
            <span className="sidebar-item-label">{item.label}</span>
          </div>
        ))}
      </aside>
      {activeSidebar && (
        <div
          className={`secondary-panel ${isPanelCollapsed ? "collapsed" : ""}`}
          style={{
            width: isPanelCollapsed ? "0" : "320px",
            opacity: isPanelCollapsed ? 0 : 1,
            overflow: isPanelCollapsed ? "hidden" : "visible",
            transition: "width 0.3s ease, opacity 0.3s ease",
          }}
        >
          <div className="panel-header">
            <button className="back-button" onClick={closeSecondaryPanel}>
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="panel-title">{activeItem?.label}</span>
          </div>
          <div className="panel-content">
            {activeItem && <activeItem.panel />}
          </div>
          <button className="collapse-button" onClick={togglePanelCollapse}>
            <ChevronLeft
              className={`h-5 w-5 transition-transform ${
                isPanelCollapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
