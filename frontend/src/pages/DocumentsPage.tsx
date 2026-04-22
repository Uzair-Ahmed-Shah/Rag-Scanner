import { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { DropZone } from '../components/documents/DropZone';
import { DocumentList } from '../components/documents/DocumentList';

export function DocumentsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="px-5 py-3 border-b border-border">
          <h1 className="text-sm font-semibold text-text-primary">Documents</h1>
          <p className="text-[11px] text-text-tertiary font-mono mt-0.5">
            upload · manage · delete
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 max-w-2xl">
          {/* Upload */}
          <DropZone onUploadComplete={() => setRefreshKey((k) => k + 1)} />

          {/* Divider */}
          <div className="my-5 border-t border-border-subtle" />

          {/* Document list */}
          <DocumentList refreshKey={refreshKey} />

          {/* Info */}
          <div className="mt-6 pt-4 border-t border-border-subtle">
            <p className="text-[11px] text-text-tertiary leading-relaxed">
              Files are vectorized and scoped to your account.
              Uploading a file with the same name replaces the previous version.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
