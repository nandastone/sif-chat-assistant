import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

export default function Footer() {
  return (
    <footer>
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
          <p>
            Note: AI responses can be inaccurate. Please double check all
            responses against the original sources.
          </p>
        </div>
      </div>
    </footer>
  );
}
