import { createRoot } from "react-dom/client";
import { Agentation } from "agentation";

const mount = document.createElement("div");
mount.id = "agentation-root";
document.body.appendChild(mount);

createRoot(mount).render(
  <Agentation
    endpoint={import.meta.env.VITE_AGENTATION_ENDPOINT || undefined}
  />
);
