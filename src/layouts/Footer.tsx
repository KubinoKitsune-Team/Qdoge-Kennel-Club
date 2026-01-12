import { Button } from "@/components/ui/button";
import { Github, Heart } from "lucide-react";
import { useState } from "react";
import packageJson from "../../package.json";

const Footer: React.FC = () => {
  const version = packageJson.version;
  const [, setIsSupportModalOpen] = useState(false);

  return (
    <footer className="border-t border-border bg-background px-4 sm:px-6">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-6 md:h-16 md:flex-row md:py-0">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>{packageJson.title}</span>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <span>Qdoge - Kennel Club</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500 dark:text-gray-400">v{version}</span>
          <a
            href={packageJson.repository.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <Github size={18} />
          </a>
          <Button variant="secondary" size="sm" className="gap-1 text-xs" onClick={() => setIsSupportModalOpen(true)}>
            <Heart size={14} className="text-red-500" />
            <span>Support</span>
          </Button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
