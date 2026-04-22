import { useState, useEffect, useCallback } from 'react';
import { listDocuments, deleteDocument, type DocumentRecord } from '../../lib/api';
import { FileText, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DocumentListProps {
  refreshKey?: number; 
}

export function DocumentList({ refreshKey }: DocumentListProps) {
  const [docs, setDocs] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDocs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listDocuments();
      setDocs(data);
    } catch (err){
      console.log(err)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs, refreshKey]);

  const handleDelete = async (docId: string) => {
    setDeletingId(docId);
    try {
      await deleteDocument(docId);
      setDocs((prev) => prev.filter((d) => d.documentId !== docId));
    } catch {
      // silent fail
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={16} className="animate-spin text-text-tertiary" />
      </div>
    );
  }

  if (docs.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-text-tertiary text-xs font-mono">No documents uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-[11px] text-text-tertiary font-mono uppercase tracking-wider mb-2">
        {docs.length} document{docs.length !== 1 ? 's' : ''}
      </p>
      <AnimatePresence>
        {docs.map((doc) => (
          <motion.div
            key={doc.documentId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 bg-surface-2 border border-border rounded-sm px-3 py-2.5 group"
          >
            <FileText size={14} className="text-text-tertiary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-primary font-mono truncate">{doc.fileName}</p>
              <p className="text-[10px] text-text-tertiary font-mono">{formatDate(doc.uploadDate)}</p>
            </div>
            <button
              onClick={() => handleDelete(doc.documentId)}
              disabled={deletingId === doc.documentId}
              className="opacity-0 group-hover:opacity-100 transition-opacity
                text-text-tertiary hover:text-red-400 disabled:animate-spin p-1"
              title="Delete document"
            >
              {deletingId === doc.documentId ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Trash2 size={12} />
              )}
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
