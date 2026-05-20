import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { useStore } from "@/lib/store";

export function ProtectedRoute() {
  const { auth } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.status === "signed-out") {
      navigate("/settings", { replace: true });
    }
  }, [auth.status, navigate]);

  if (auth.status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-5 w-5 rounded-full border-2 border-(--color-flame) border-t-transparent animate-spin" />
      </div>
    );
  }

  if (auth.status === "signed-out") {
    return null;
  }

  return <Outlet />;
}
