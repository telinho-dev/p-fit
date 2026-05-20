import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import { Shell } from "./App";
import { ProtectedRoute } from "./components/protected-route";

const HomePage = lazy(() => import("./features/home/home-page").then((m) => ({ default: m.HomePage })));
const StrengthPage = lazy(() => import("./features/strength/strength-page").then((m) => ({ default: m.StrengthPage })));
const CardioPage = lazy(() => import("./features/cardio/cardio-page").then((m) => ({ default: m.CardioPage })));
const WeeklyPage = lazy(() => import("./features/weekly/weekly-page").then((m) => ({ default: m.WeeklyPage })));
const NutritionPage = lazy(() => import("./features/nutrition/nutrition-page").then((m) => ({ default: m.NutritionPage })));
const FamilyPage = lazy(() => import("./features/family/family-page").then((m) => ({ default: m.FamilyPage })));
const SettingsPage = lazy(() => import("./features/settings/settings-page").then((m) => ({ default: m.SettingsPage })));
const ImportPage = lazy(() => import("./features/import/import-page").then((m) => ({ default: m.ImportPage })));

function RouteLoader() {
  return (
    <div className="flex items-center justify-center h-48">
      <div className="h-5 w-5 rounded-full border-2 border-(--color-flame) border-t-transparent animate-spin" />
    </div>
  );
}

const wrap = (el: React.ReactElement) => <Suspense fallback={<RouteLoader />}>{el}</Suspense>;

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Shell />,
    children: [
      // Always accessible — login lives here
      { path: "settings", element: wrap(<SettingsPage />) },

      // Protected — redirects to /settings when signed out
      {
        element: <ProtectedRoute />,
        children: [
          { index: true, element: wrap(<HomePage />) },
          { path: "strength", element: wrap(<StrengthPage />) },
          { path: "strength/:sessionKey", element: wrap(<StrengthPage />) },
          { path: "cardio", element: wrap(<CardioPage />) },
          { path: "weekly", element: wrap(<WeeklyPage />) },
          { path: "nutrition", element: wrap(<NutritionPage />) },
          { path: "family", element: wrap(<FamilyPage />) },
          { path: "import", element: wrap(<ImportPage />) },
        ],
      },
    ],
  },
]);
