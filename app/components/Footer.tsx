import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

export default function Footer() {
  return (
    <footer className="mt-8 py-4">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <p>
            Note: AI responses can be inaccurate. Please double check all
            responses against the original sources.
          </p>
        </div>
      </div>
    </footer>
  );
}
