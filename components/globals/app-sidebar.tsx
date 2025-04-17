"use client";
import { useState } from "react";
import {
  Frame,
  BookTemplate,
  Users,
  Inbox,
  UsersRound,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { account } from "@/appwrite";
import { useRouter } from "next/navigation";

const items = [
  {
    title: "Templates",
    url: "/admin/templates",
    icon: BookTemplate,
  },
  {
    title: "Frames",
    url: "/admin/frames",
    icon: Frame,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Categories",
    url: "/admin/categories",
    icon: Inbox,
  },
  {
    title: "Subcategories",
    url: "/admin/sub-categories",
    icon: UsersRound,
  },
];

export function AppSidebar() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await account.deleteSession("current");
      toast.success("Logout successful");
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-start gap-2 bg-white p-2 rounded ">
          <Image alt="logo" src="/logo.png" width={50} height={50} />
          <Image alt="logo" src="/short-logo.png" width={100} height={100} />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button
          variant={"destructive"}
          onClick={handleLogout}
          isLoading={isLoading}
        >
          {" "}
          <LogOut /> Logout{" "}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
