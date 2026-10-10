import { useNavigate } from 'react-router-dom';
import { PackageCheck } from 'lucide-react';

const RoomNotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-canvas-black text-text-primary px-4">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-surface-elevated border border-surface-border flex items-center justify-center mx-auto mb-6">
          <PackageCheck className="w-7 h-7 text-text-muted" />
        </div>
        <h1 className="text-2xl font-semibold mb-2">Project Not Found</h1>
        <p className="text-text-secondary text-sm mb-6 max-w-sm">
          This project doesn't exist, has expired, or has been removed.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2.5 rounded-button border border-surface-border text-sm text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
          >
            Go Home
          </button>
          <button
            onClick={() => navigate('/create')}
            className="px-4 py-2.5 rounded-button bg-brand-mint text-canvas-black font-mono text-xs uppercase tracking-wider hover:bg-text-primary transition-colors"
          >
            Start a Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomNotFound;
