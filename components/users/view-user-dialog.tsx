"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Mail,
  Phone,
  Calendar,
  Crown,
  User,
  MapPin,
  Briefcase,
  Users,
} from "lucide-react";
import { formatDate } from "./data-table"; // Assuming this function is correctly defined elsewhere

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isPremium: boolean;
  createdAt: string;
  address?: string;
  occupation?: string;
  gender?: string;
}

interface ViewUserDialogProps {
  user: User;
}

export function ViewUserDialog({ user }: ViewUserDialogProps) {
  const [open, setOpen] = useState(false);

  const infoItems = [
    {
      icon: Phone,
      label: "Phone Number",
      value: user.phone || "Not provided",
    },
    {
      icon: Users,
      label: "Gender",
      value: user.gender || "Not specified",
    },
    {
      icon: MapPin,
      label: "Address",
      value: user.address || "Not provided",
    },
    {
      icon: Briefcase,
      label: "Occupation",
      value: user.occupation || "Not specified",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-blue-600 hover:text-blue-700 border-blue-300 hover:border-blue-400"
        >
          <Eye className="h-4 w-4 mr-2" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2 text-gray-800">
            <User className="h-5 w-5 text-blue-600" />
            User Profile
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Detailed information for {user.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* User Avatar & Basic Info */}
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user.name}
              </h2>
              <p className="text-sm text-blue-600 flex items-center justify-center gap-1.5">
                <Mail className="h-4 w-4 text-gray-400" />
                {user.email}
              </p>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="space-y-4">
            {infoItems.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-slate-50 rounded-md"
              >
                <item.icon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {item.label}
                  </p>
                  <p className="text-sm text-gray-800">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Account Type & Joined Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-md">
              <Crown className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Type
                </p>
                <Badge
                  variant={user.isPremium ? "default" : "secondary"}
                  className={`mt-1 text-xs font-medium ${
                    user.isPremium
                      ? "bg-yellow-400 hover:bg-yellow-500 text-yellow-900"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {user.isPremium ? "Premium Member" : "Free User"}
                </Badge>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-md">
              <Calendar className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member Since
                </p>
                <p className="text-sm text-gray-800">
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* User ID */}
          <div className="pt-4 text-center">
            <p className="text-xs text-gray-400">User ID: {user.id}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
