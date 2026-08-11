import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { NotFoundFace } from "@/components/NotFoundFace";

export const metadata: Metadata = {
  title: "Page Not Found | Sos Stays",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-cream px-6 py-24 text-center">
      <NotFoundFace />
      <h1 className="mt-6 font-serif text-3xl text-forest-green sm:text-4xl">Page Not Found</h1>
      <p className="mt-4 max-w-md text-lg text-forest-green/80">
        We&rsquo;re spinning in circles searching for this page. Let&rsquo;s send you back home.
      </p>
      <Button link="/" className="mt-8">
        Take me home
      </Button>
    </div>
  );
}
