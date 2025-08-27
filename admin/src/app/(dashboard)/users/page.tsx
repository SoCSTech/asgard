"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IUser } from "@/interfaces/user";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import UserEditDialog from "./UserEditDialog";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    data: users,
    isLoading,
    refetch,
  } = useQuery<IUser[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/v2/user", {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch users");

      const json = await res.json();
      return json.users ?? []; // <- ensures return is never undefined
    },
  });

  const { data: selectedUser, isLoading: userLoading } = useQuery<IUser | null>(
    {
      queryKey: ["user", selectedUsername],
      queryFn: async () => {
        if (!selectedUsername) return null;
        const res = await fetch(`/v2/user/${selectedUsername}`, {
          credentials: "include",
        });
        return res.json();
      },
      enabled: !!selectedUsername,
    },
  );

  const handleToggleDelete = async (username: string, isDeleted: boolean) => {
    const endpoint = isDeleted
      ? `/v2/user/reactivate/${username}`
      : `/v2/user/${username}`;
    const method = isDeleted ? "POST" : "DELETE";

    await fetch(endpoint, {
      method,
      credentials: "include",
    });

    refetch();
  };

  if (isLoading) return <div className="p-4">Loading users...</div>;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Users</h1>
      <Table>
        <TableCaption>System Users</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Profile</TableHead>
            <TableHead>Full Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>TOTP</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((user) => (
            <TableRow
              key={user.id}
              className="hover:bg-muted/50"
              onClick={() => {
                setSelectedUsername(user.username);
                setDialogOpen(true);
              }}
            >
              <TableCell>
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user.profilePictureUrl || undefined}
                    alt={user.fullName}
                  />
                  <AvatarFallback>{user.initials}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="font-medium">{user.fullName}</TableCell>
              <TableCell>
                <Badge variant="outline" className="uppercase">
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {user.totpEnabled ? (
                  <Badge className="bg-purple-200 text-purple-800">
                    Enabled
                  </Badge>
                ) : (
                  <Badge className="bg-gray-200 text-gray-800">Disabled</Badge>
                )}
              </TableCell>
              <TableCell className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedUsername(user.username);
                    setDialogOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleDelete(user.username, user.isDeleted);
                  }}
                >
                  {user.isDeleted ? "Restore" : "Deactivate"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Dialog */}
      {selectedUsername && selectedUser && (
        <UserEditDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          user={selectedUser}
          hideDeactivate
          onSave={() => {
            setDialogOpen(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
