import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import { Shell } from "./App";

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

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Shell />,
    children: [
      { index: true, element: <Suspense fallback={<RouteLoader />}><HomePage /></Suspense> },
      { path: "strength", element: <Suspense fallback={<RouteLoader />}><StrengthPage /></Suspense> },
      { path: "strength/:sessionKey", element: <Suspense fallback={<RouteLoader />}><StrengthPage /></Suspense> },
      { path: "cardio", element: <Suspense fallback={<RouteLoader />}><CardioPage /></Suspense> },
      { path: "weekly", element: <Suspense fallback={<RouteLoader />}><WeeklyPage /></Suspense> },
      { path: "nutrition", element: <Suspense fallback={<RouteLoader />}><NutritionPage /></Suspense> },
      { path: "family", element: <Suspense fallback={<RouteLoader />}><FamilyPage /></Suspense> },
      { path: "settings", element: <Suspense fallback={<RouteLoader />}><SettingsPage /></Suspense> },
      { path: "import", element: <Suspense fallback={<RouteLoader />}><ImportPage /></Suspense> },
    ],
  },
]);
