import { Link } from "react-router-dom";
import { secondaryButton } from "@/lib/ui";

const NotFound = () => (
  <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
    <h1 className="text-2xl font-bold">Page not found</h1>
    <p className="mt-2 text-sm text-muted">That address doesn't lead anywhere. It may have moved or never existed.</p>
    <Link to="/" className={`${secondaryButton} mt-6`}>
      Back to the shop
    </Link>
  </div>
);

export default NotFound;
