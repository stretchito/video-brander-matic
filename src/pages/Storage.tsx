import StorageManager from '@/components/StorageManager';

const Storage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-secondary p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
        <h1 className="text-2xl md:text-4xl font-bold text-white mb-8">Storage Manager</h1>
        <StorageManager />
      </div>
    </div>
  );
};

export default Storage;