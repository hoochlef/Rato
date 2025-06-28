"use client";

import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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

import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Category } from "@/types/category";

export default function CategoriesPage() {
  // Input fields states
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [icon, setIcon] = useState<string>("");
  // Categories data state
  const [categoriesData, setCategoriesData] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  // Delete confirmation dialog state
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] =
    useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setFetchLoading(true);
    setError(null);
    try {
      const response = await fetch("http://127.0.0.1:8000/categories");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }
      const data: Category[] = await response.json();
      setCategoriesData(data);
    } catch (e: any) {
      console.error("Failed to fetch categories:", e);
      setError(e.message);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const handleCreateCategory = async () => {
    setFormError(null);
    if (name.trim().length < 4) {
      setFormError("Category name must be at least 4 characters long.");
      return;
    }
    if (icon.trim().length < 1) {
      setFormError("Icon is required and must contain at least one character.");
      return;
    }
    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const response = await fetch("http://127.0.0.1:8000/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description: description || null,
          icon,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create category");
      }

      await fetchCategories();
      setIsDialogOpen(false);
    } catch (e: any) {
      console.error("Failed to create category:", e);
      setFormError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description || "");
    setIcon(category.icon);
    setIsDialogOpen(true);
  };

  const handleSaveChanges = async () => {
    setFormError(null);
    if (name.trim().length < 4) {
      setFormError("Category name must be at least 4 characters long.");
      return;
    }
    if (icon.trim().length < 1) {
      setFormError("Icon is required and must contain at least one character.");
      return;
    }
    if (!editingCategory) {
      console.error("No category selected for editing.");
      return;
    }

    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const response = await fetch(
        `http://127.0.0.1:8000/categories/${editingCategory.category_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            description: description || null,
            icon,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update category");
      }

      await fetchCategories();
      setIsDialogOpen(false);
      setEditingCategory(null); // Clear editing state
      // Optionally clear form fields if not done by dialog close/reopen
      setName("");
      setDescription("");
      setIcon("");
    } catch (e: any) {
      console.error("Failed to update category:", e);
      setFormError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete category
  const openDeleteConfirmDialog = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirmDialog = () => {
    setCategoryToDelete(null);
    setIsDeleteConfirmOpen(false);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) {
      console.error("No category selected for deletion.");
      return;
    }

    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const response = await fetch(
        `http://127.0.0.1:8000/categories/${categoryToDelete.category_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete category");
      }

      await fetchCategories();
      closeDeleteConfirmDialog();
    } catch (e: any) {
      console.error("Failed to delete category:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Only show full page loading on initial fetch
  if (fetchLoading && categoriesData.length === 0) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center min-h-[50vh]">
        <div className="text-2xl flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          <span>Loading Categories...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto">
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
        <Button onClick={() => fetchCategories()} className="cursor-pointer">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      {fetchLoading && categoriesData.length > 0 && (
        <div
          className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-6"
          role="alert"
        >
          <span className="block sm:inline">Refreshing categories data...</span>
          <div className="inline-block ml-2 h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Category Management</h1>

        <Dialog
          open={isDialogOpen && !editingCategory} // Open if isDialogOpen is true AND we are NOT editing
          onOpenChange={(open) => {
            if (!open) {
              setIsDialogOpen(false);
              setEditingCategory(null); // Ensure editingCategory is cleared when dialog closes
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              className="cursor-pointer"
              onClick={() => {
                setEditingCategory(null);
                setName("");
                setDescription("");
                setIcon("");
                setIsDialogOpen(true);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create new category</DialogTitle>
              <DialogDescription>
                Create your new categories here .
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
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="add-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-description" className="text-right">
                  Description
                </Label>
                <Input
                  id="add-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-icon" className="text-right">
                  Icon
                </Label>
                <Input
                  id="add-icon"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                className="cursor-pointer"
                type="button"
                onClick={handleCreateCategory}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  "Create Category"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableCaption>{`A list of all categories (${categoriesData.length})`}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Icon</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categoriesData.map((category: Category) => (
            <TableRow key={category.category_id}>
              <TableCell>{category.category_id}</TableCell>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell>{category.description || "N/A"}</TableCell>
              <TableCell>{category.icon}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Dialog
                    open={
                      isDialogOpen &&
                      editingCategory?.category_id === category.category_id
                    }
                    onOpenChange={(open) => {
                      if (!open) {
                        setIsDialogOpen(false);
                        setEditingCategory(null); // Clear editing state when dialog is closed
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        className="cursor-pointer"
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateCategory(category)}
                      >
                        <Edit className="mr-1 h-4 w-4 " /> Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>
                          Make changes to the category details here.
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
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Name
                          </Label>
                          <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="description" className="text-right">
                            Description
                          </Label>
                          <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="icon" className="text-right">
                            Icon
                          </Label>
                          <Input
                            id="icon"
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          className="cursor-pointer"
                          type="button"
                          onClick={handleSaveChanges}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <div className="mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                              Updating...
                            </>
                          ) : (
                            "Save changes"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                    onClick={() => openDeleteConfirmDialog(category)}
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
      {categoryToDelete && (
        <Dialog
          open={isDeleteConfirmOpen}
          onOpenChange={setIsDeleteConfirmOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the category "
                {categoryToDelete.name}"? This action cannot be undone.
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
                onClick={handleDeleteCategory}
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
    </div>
  );
}
