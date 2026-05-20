import { createBrowserRouter } from "react-router";
import { Shell } from "./App";
import { HomePage } from "./features/home/home-page";
import { StrengthPage } from "./features/strength/strength-page";
import { CardioPage } from "./features/cardio/cardio-page";
import { WeeklyPage } from "./features/weekly/weekly-page";
import { NutritionPage } from "./features/nutrition/nutrition-page";
import { SettingsPage } from "./features/settings/settings-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Shell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "strength", element: <StrengthPage /> },
      { path: "strength/:sessionKey", element: <StrengthPage /> },
      { path: "cardio", element: <CardioPage /> },
      { path: "weekly", element: <WeeklyPage /> },
      { path: "nutrition", element: <NutritionPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
