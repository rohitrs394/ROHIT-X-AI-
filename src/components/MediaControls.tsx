import { Camera, Monitor } from "lucide-react";

interface MediaControlsProps {
  onOpenCamera: () => void;
  onOpenScreenShare: () => void;
}

export default function MediaControls({ onOpenCamera, onOpenScreenShare }: MediaControlsProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onOpenCamera}
        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors text-neutral-500 dark:text-neutral-400 hover:text-orange-500 dark:hover:text-orange-400"
        title="Open Camera"
      >
        <Camera size={20} />
      </button>
      <button
        onClick={onOpenScreenShare}
        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors text-neutral-500 dark:text-neutral-400 hover:text-orange-500 dark:hover:text-orange-400"
        title="Share Screen"
      >
        <Monitor size={20} />
      </button>
    </div>
  );
}
