import { Outlet } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout/DashboardLayout";

export default function DashboardShell() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}