import AppRoutes from "./routes/AppRoutes";
import NotificationOverlay from "./pages/NotificationOverlay";

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const overlay = params.get("overlay") === "true";

  return overlay ? <NotificationOverlay /> : <AppRoutes />;
}
