"use client";

import { ArrowLeft, ChevronLeft, Type, Upload, Image } from "lucide-react";
import { useState } from "react";

import { useEditorStore } from "@/store/editor-store";
import TextPanel from "./text";
import UploadPanel from "./upload";
import BackgroundPanel from "./background";

function Sidebar() {
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState<string | null>(null);

  const sidebarItems = [
    {
      id: "text",
      icon: Type,
      label: "Text",
      panel: () => <TextPanel />,
    },
    {
      id: "uploads",
      icon: Upload,
      label: "Uploads",
      panel: () => <UploadPanel />,
    },
    {
      id: "background",
      icon: Image,
      label: "Background",
      panel: () => <BackgroundPanel />,
    },
  ];

  const handleItemClick = (id: string) => {
    if (id === activeSidebar && !isPanelCollapsed) return;

    setActiveSidebar(id);
    setIsPanelCollapsed(false);
  };

  const closeSecondaryPanel = () => {
    setActiveSidebar(null);
  };

  const togglePanelCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPanelCollapsed(!isPanelCollapsed);
  };

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
          }}
        >
          <div className="panel-header">
            <button className="back-button" onClick={closeSecondaryPanel}>
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="panel-title">{activeItem?.label}</span>
          </div>
          <div className="panel-content">{activeItem?.panel()}</div>
          <button className="collapse-button" onClick={togglePanelCollapse}>
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
