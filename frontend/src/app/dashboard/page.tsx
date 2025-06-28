"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-8 mt-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Portal</h1>
        <p className="text-muted-foreground mt-2">
          Select which dashboard you want to access based on your role.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
            <CardDescription>
              Access the admin interface to manage users and system settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              The admin dashboard provides tools for user management, system
              configuration, and global settings for the entire platform.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/dashboard/admin">Enter Admin Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supervisor Dashboard</CardTitle>
            <CardDescription>
              Access the business supervisor interface to manage reviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              The supervisor dashboard allows business managers to respond to
              reviews, track performance metrics, and manage business-specific
              settings.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/dashboard/supervisor">
                Enter Supervisor Dashboard
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
