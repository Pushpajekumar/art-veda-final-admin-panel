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
  User as UserIcon,
  MapPin,
  Briefcase,
  Users,
} from "lucide-react";
import { formatDate } from "./data-table";
import { User } from "./columns"; // Import User type from columns for consistency

interface ViewUserDialogProps {
  user: User;
}

export function ViewUserDialog({ user }: ViewUserDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-blue-600 hover:text-blue-800"
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            User Details
          </DialogTitle>
          <DialogDescription>
            Complete information for this user account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User Avatar/Initial */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-4">
            {/* Name */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <UserIcon className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">Full Name</p>
                <p className="text-base font-semibold text-gray-900">
                  {user.name}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Email Address
                </p>
                <p className="text-base text-gray-900">{user.email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Phone Number
                </p>
                <p className="text-base text-gray-900">
                  {user.phone || "Not provided"}
                </p>
              </div>
            </div>

            {/* Gender */}
            {user.gender && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Users className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p className="text-base text-gray-900">{user.gender}</p>
                </div>
              </div>
            )}

            {/* Address */}
            {user.address && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-base text-gray-900">{user.address}</p>
                </div>
              </div>
            )}

            {/* Occupation */}
            {user.occupation && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Briefcase className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Occupation
                  </p>
                  <p className="text-base text-gray-900">{user.occupation}</p>
                </div>
              </div>
            )}

            {/* Premium Status */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Crown className="h-5 w-5 text-gray-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">
                  Account Type
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={user.isPremium ? "default" : "secondary"}
                    className={
                      user.isPremium ? "bg-yellow-500 hover:bg-yellow-600" : ""
                    }
                  >
                    {user.isPremium ? "Premium Member" : "Free User"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Created Date */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Member Since
                </p>
                <p className="text-base text-gray-900">
                  {formatDate(user.$createdAt)}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(user.$createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* User ID */}
          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500">User ID: {user.id}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
