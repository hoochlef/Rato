"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import { BusinessWithReviewCount } from "@/services/businesses";
import { Label } from "@/components/ui/label";
import { Edit, MoreHorizontal, PlusCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";

export default function BusinessPage() {
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  //   Business states
  const [businessesData, setBusinessesData] = useState<
    BusinessWithReviewCount[]
  >([]);
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  //   Delete business states
  const [businessToDelete, setBusinessToDelete] =
    useState<BusinessWithReviewCount | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] =
    useState<boolean>(false);
  //   Data for business
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [categoryId, setCategoryId] = useState<number>(1);
  const [location, setLocation] = useState<string>("");
  const [number, setNumber] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [logo, setLogo] = useState<string>("");
  const [supervisorId, setSupervisorId] = useState<number>(0);
  // Edit business states
  const [editingBusiness, setEditingBusiness] =
    useState<BusinessWithReviewCount | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);

  //   Fetching businesses
  const fetchBusinesses = async () => {
    setFetchLoading(true);
    setError(null);
    try {
      const response = await fetch("http://127.0.0.1:8000/businesses");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }
      // Get the data in the new format (BusinessWithReviewCount[])
      const responseData = await response.json();

      // Set the data directly - we'll handle the nested structure in the UI
      setBusinessesData(responseData);
    } catch (e: any) {
      console.error("Failed to fetch Businesses:", e);
      setError(e.message);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
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

  // Business Creation
  const handleCreateBusiness = async () => {
    setFormError(null);

    // Validate inputs
    if (name.trim().length < 3) {
      setFormError("Name must be at least 3 characters long.");
      return;
    }

    if (description.trim().length < 20) {
      setFormError("Description must be at least 20 characters long.");
      return;
    }

    if (!location.trim()) {
      setFormError("Location is required.");
      return;
    }

    if (!website.trim()) {
      setFormError("Website is required.");
      return;
    }

    if (!logo.trim()) {
      setFormError("Logo is required.");
      return;
    }
    try {
      new URL(logo);
    } catch (e) {
      setFormError("Logo must be a valid URL.");
      return;
    }

    if (!categoryId) {
      setFormError("Category is required.");
      return;
    }

    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }
      const response = await fetch("http://127.0.0.1:8000/businesses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          name,
          description,
          location,
          number,
          website,
          logo,
          category_id: categoryId,
          ...(supervisorId > 0 ? { supervisor_id: supervisorId } : {}),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create business");
      }

      await fetchBusinesses();
      setIsDialogOpen(false);
      setName("");
      setDescription("");
      setLocation("");
      setNumber("");
      setWebsite("");
      setLogo("");
      setSupervisorId(0);
      setCategoryId(1);
    } catch (e: any) {
      console.error("Failed to create business:", e);
      setFormError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit Business
  const openEditDialog = (business: BusinessWithReviewCount) => {
    setEditingBusiness(business);
    setName(business.business.name);
    setDescription(business.business.description);
    setCategoryId(business.business.category_id);
    setLocation(business.business.location);
    setLogo(business.business.logo);
    setNumber(business.business.number || "");
    setWebsite(business.business.website || "");
    setSupervisorId(business.business.supervisor_id || 0);
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditingBusiness(null);
    setIsEditDialogOpen(false);
  };

  const handleEditBusiness = async () => {
    if (!editingBusiness) {
      console.error("No business selected for editing.");
      return;
    }

    setFormError(null);

    // Validate logo URL
    try {
      new URL(logo);
    } catch (e) {
      setFormError("Logo must be a valid URL.");
      return;
    }

    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const response = await fetch(
        `http://127.0.0.1:8000/businesses/${editingBusiness.business.business_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            description,
            location,
            number,
            website,
            logo,
            category_id: categoryId,
            ...(supervisorId > 0 ? { supervisor_id: supervisorId } : {}),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update business");
      }

      await fetchBusinesses();
      closeEditDialog();
    } catch (e: any) {
      console.error("Failed to update business:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete Business
  const openDeleteConfirmDialog = (business: BusinessWithReviewCount) => {
    setBusinessToDelete(business);
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirmDialog = () => {
    setBusinessToDelete(null);
    setIsDeleteConfirmOpen(false);
  };

  const handleDeleteBusiness = async () => {
    if (!businessToDelete) {
      return;
    }

    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("You must be logged in to delete a business");
      }

      const response = await fetch(
        `http://127.0.0.1:8000/businesses/${businessToDelete.business.business_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      // Remove the deleted business from the state
      setBusinessesData((prevData) =>
        prevData.filter(
          (b) =>
            b.business.business_id !== businessToDelete.business.business_id
        )
      );

      closeDeleteConfirmDialog();
    } catch (e: any) {
      console.error("Failed to delete business:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Only show full page loading on initial fetch
  if (fetchLoading && businessesData.length === 0) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center min-h-[50vh]">
        <div className="text-2xl flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          <span>Loading Businesses...</span>
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
        <Button onClick={() => fetchBusinesses()} className="cursor-pointer">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      {fetchLoading && businessesData.length > 0 && (
        <div
          className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-6"
          role="alert"
        >
          <span className="block sm:inline">Refreshing businesses data...</span>
          <div className="inline-block ml-2 h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Business Management</h1>
        <Button
          className="cursor-pointer"
          onClick={() => {
            setName("");
            setDescription("");
            setCategoryId(1);
            setLocation("");
            setNumber("");
            setWebsite("");
            setLogo("");
            setSupervisorId(0);
            setIsDialogOpen(true);
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add Business
        </Button>
      </div>

      <Table>
        <TableCaption>{`A list of all businesses (${businessesData.length})`}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Number</TableHead>
            <TableHead>Website</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {businessesData.map((businessItem: BusinessWithReviewCount) => (
            <TableRow key={businessItem.business.business_id}>
              <TableCell>{businessItem.business.business_id}</TableCell>
              <TableCell className="font-medium">
                {businessItem.business.name}
              </TableCell>
              <TableCell className="max-w-[200px]">
                <div
                  className="truncate"
                  title={businessItem.business.description || "N/A"}
                >
                  {businessItem.business.description || "N/A"}
                </div>
              </TableCell>
              <TableCell>{businessItem.business.category?.name}</TableCell>
              <TableCell>{businessItem.business.location}</TableCell>
              <TableCell>{businessItem.business.number || "N/A"}</TableCell>
              <TableCell className="max-w-[200px]">
                <div
                  className="truncate"
                  title={businessItem.business.website || "N/A"}
                >
                  <Link
                    href={businessItem.business.website || "#"}
                    target="_blank"
                  >
                    {businessItem.business.website || "N/A"}
                  </Link>
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => openDeleteConfirmDialog(businessItem)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Business
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => openEditDialog(businessItem)}
                    >
                      <Edit className="mr-2 h-4 w-4 " /> Edit Business
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* business creation dialog */}
      {isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create new business</DialogTitle>
              <DialogDescription>
                Fill the form below to create a new business
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
                <Textarea
                  id="add-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-location" className="text-right">
                  Location
                </Label>
                <Input
                  id="add-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-number" className="text-right">
                  Phone Number
                </Label>
                <Input
                  id="add-number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-website" className="text-right">
                  Website
                </Label>
                <Input
                  id="add-website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-logo" className="text-right">
                  Logo
                </Label>
                <Input
                  id="add-logo"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-category" className="text-right">
                  Category Id
                </Label>
                <Input
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  className="col-span-3"
                  type="number"
                  id="add-category"
                  min="1"
                  max="100"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-supervisor" className="text-right">
                  Supervisor Id
                </Label>
                <Input
                  value={supervisorId}
                  onChange={(e) => setSupervisorId(Number(e.target.value))}
                  className="col-span-3"
                  type="number"
                  id="add-supervisor"
                  min="1"
                  max="100"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateBusiness}
                className="cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Update business dialog */}
      {isEditDialogOpen && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit business</DialogTitle>
              <DialogDescription>
                Fill the form below to edit the business
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
                <Textarea
                  id="add-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-location" className="text-right">
                  Location
                </Label>
                <Input
                  id="add-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-number" className="text-right">
                  Number
                </Label>
                <Input
                  id="add-number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-website" className="text-right">
                  Website
                </Label>
                <Input
                  id="add-website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-logo" className="text-right">
                  Logo
                </Label>
                <Input
                  id="add-logo"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-category" className="text-right">
                  Category Id
                </Label>
                <Input
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  className="col-span-3"
                  type="number"
                  id="add-category"
                  min="1"
                  max="100"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-supervisor" className="text-right">
                  Supervisor Id
                </Label>
                <Input
                  value={supervisorId}
                  onChange={(e) => setSupervisorId(Number(e.target.value))}
                  className="col-span-3"
                  type="number"
                  id="add-supervisor"
                  min="1"
                  max="100"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditBusiness}
                className="cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                    Editing...
                  </>
                ) : (
                  "Edit"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {businessToDelete && (
        <Dialog
          open={isDeleteConfirmOpen}
          onOpenChange={setIsDeleteConfirmOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the business "
                {businessToDelete.business.name}"? This action cannot be undone.
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
                onClick={handleDeleteBusiness}
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
