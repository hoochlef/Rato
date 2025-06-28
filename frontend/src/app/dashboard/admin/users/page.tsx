"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import { User } from "@/types/user";
import { PlusCircle, Edit, Trash2, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

export default function UsersPage() {
  // User creation fields
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<string>("user");
  const [password, setPassword] = useState<string>("");
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  // Users data state
  const [usersData, setUsersData] = useState<User[]>([]);
  // Search functionality
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  // Delete confirmation dialog state
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] =
    useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  //   user role editing
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);

  // Getting auth token to use in protected routes
  const getAuthToken = async (): Promise<string | null> => {
    try {
      const response = await fetch("/api/auth/token");
      if (!response.ok) return null;
      const data = await response.json();
      return data.token || null;
    } catch (error) {
      console.error("Error fetching auth token:", error);
      return null;
    }
  };

  // fetch all users
  const fetchUsers = async () => {
    setFetchLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }
      const response = await fetch("http://127.0.0.1:8000/users", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }
      const data: User[] = await response.json();
      setUsersData(data);
    } catch (e: any) {
      console.error("Failed to fetch users:", e);
      setError(e.message);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(usersData);
    } else {
      const filtered = usersData.filter((user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, usersData]);

  // Validate email with regex
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // User Creation
  const handleCreateUser = async () => {
    // Reset form error
    setFormError(null);

    // Validate inputs
    if (username.trim().length < 4) {
      setFormError("Username must be at least 4 characters long.");
      return;
    }

    if (!email.trim()) {
      setFormError("Email is required.");
      return;
    }

    if (!isValidEmail(email.trim())) {
      setFormError("Please enter a valid email address.");
      return;
    }

    if (password.trim().length < 8) {
      setFormError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          role,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create user");
      }

      await fetchUsers();
      setIsDialogOpen(false);
      // Reset form fields
      setUsername("");
      setEmail("");
      setRole("user");
      setPassword("");
    } catch (e: any) {
      console.error("Failed to create user:", e);
      setFormError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete user
  const openDeleteConfirmDialog = (user: User) => {
    setUserToDelete(user);
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirmDialog = () => {
    setUserToDelete(null);
    setIsDeleteConfirmOpen(false);
  };

  const handleDeleteUser = async () => {
    
    if (!userToDelete) {
      console.error("No user selected for deletion.");
      return;
    }

    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const response = await fetch(
        `http://127.0.0.1:8000/users/${userToDelete.user_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete user");
      }

      await fetchUsers();
      closeDeleteConfirmDialog();
    } catch (e: any) {
      console.error("Failed to delete user:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  //   editing user role
  const openEditDialog = (user: User) => {
    setUserToEdit(user);
    setRole(user.role); // Initialize role dropdown with user's current role
    setFormError(null);
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setUserToEdit(null);
    setIsEditDialogOpen(false);
  };

  const handleEditUserRole = async () => {
    if (!userToEdit) {
      console.error("No user selected for editing.");
      return;
    }

    setLoading(true);
    setFormError(null);
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const response = await fetch(
        `http://127.0.0.1:8000/users/${userToEdit.user_id}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            role: role,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to edit user role");
      }

      await fetchUsers();
      closeEditDialog();
    } catch (e: any) {
      console.error("Failed to edit user role:", e);
      setFormError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Only show full page loading on initial fetch
  if (fetchLoading && usersData.length === 0) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center min-h-[50vh]">
        <div className="text-2xl flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          <span>Loading users...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="sr-only">Dismiss</span>
            <span className="text-xl">&times;</span>
          </button>
        </div>
        <Button onClick={() => fetchUsers()} className="cursor-pointer">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      {fetchLoading && usersData.length > 0 && (
        <div
          className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-6"
          role="alert"
        >
          <span className="block sm:inline">Refreshing user data...</span>
          <div className="inline-block ml-2 h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users Management</h1>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsDialogOpen(false);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              className="cursor-pointer"
              onClick={() => {
                setUsername("");
                setEmail("");
                setRole("user");
                setPassword("");
                setIsDialogOpen(true);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create new user</DialogTitle>
              <DialogDescription>Create your new user here.</DialogDescription>
            </DialogHeader>
            {formError && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <span className="block sm:inline">{formError}</span>
              </div>
            )}
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-username" className="text-right">
                  Username
                </Label>
                <Input
                  id="add-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="add-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-role" className="text-right">
                  Role
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-30">
                      <ChevronDown className="h-4 w-4" />
                      {role}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => setRole("user")}>
                        User
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setRole("admin")}>
                        Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setRole("supervisor")}>
                        Supervisor
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-password" className="text-right">
                  Password
                </Label>
                <Input
                  id="add-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                className="cursor-pointer"
                type="button"
                onClick={handleCreateUser}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <Input
            placeholder="Search by username"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>
      </div>
      <Table>
        <TableCaption>
          {searchQuery
            ? `Found ${filteredUsers.length} user${
                filteredUsers.length !== 1 ? "s" : ""
              } matching "${searchQuery}"`
            : `A list of all users (${usersData.length})`}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user: User) => (
            <TableRow key={user.user_id}>
              <TableCell>{user.user_id}</TableCell>
              <TableCell className="font-medium">{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    className="cursor-pointer"
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(user)}
                  >
                    <Edit className="mr-1 h-4 w-4 " /> Edit User Role
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                    onClick={() => openDeleteConfirmDialog(user)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" /> Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      {userToDelete && (
        <Dialog
          open={isDeleteConfirmOpen}
          onOpenChange={setIsDeleteConfirmOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the user "
                {userToDelete.username}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={closeDeleteConfirmDialog}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteUser}
                className="cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit role dialog */}
      {userToEdit && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit user role</DialogTitle>
              <DialogDescription>
                Change role for user "{userToEdit.username}"
              </DialogDescription>
            </DialogHeader>
            {formError && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <span className="block sm:inline">{formError}</span>
              </div>
            )}
            <div className="flex items-center gap-5 py-4">
              <Label htmlFor="edit-role" className="text-right">
                Role
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <ChevronDown className="h-4 w-4 mr-2" />
                    {role}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setRole("user")}>
                      User
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRole("admin")}>
                      Admin
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRole("supervisor")}>
                      Supervisor
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={closeEditDialog}
                className="cursor-pointer"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditUserRole}
                className="cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                    Updating...
                  </>
                ) : (
                  "Confirm"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
