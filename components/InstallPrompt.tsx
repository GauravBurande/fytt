import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    );

    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  if (isStandalone) {
    return null; // Don't show install button if already installed
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-72">
      <Alert className="shadow-lg">
        <AlertDescription className="flex flex-col gap-2">
          <span>Install this app for a better experience</span>
          <div className="flex justify-between items-center">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsVisible(false)}
            >
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (isIOS) {
                  alert(
                    "On iOS, tap the share icon ⎋ and select 'Add to Home Screen' ➕"
                  );
                } else {
                  // Placeholder for install logic
                  alert("Install functionality to be implemented");
                }
              }}
            >
              Install
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
