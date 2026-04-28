import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Check, X, AlertTriangle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import ContentCard from '../../components/ContentCard';
import EmptyState from '../../components/EmptyState';
import { api, errMsg } from '../../api/client';

export default function PrincipalApprovals() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [rejectModal, setRejectModal] = useState(null); // content object

  const fetchPending = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/approval/pending');
      setItems(data.data || []);
    } catch (err) {
      toast.error(errMsg(err, 'Failed to load pending content'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id) => {
    setActingId(id);
    try {
      await api.patch(`/approval/${id}`, { action: 'approve' });
      toast.success('Approved. It will rotate when its window is live.');
      setItems((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      toast.error(errMsg(err, 'Approval failed'));
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (id, reason) => {
    if (!reason || !reason.trim()) {
      toast.error('Reason is required when rejecting.');
      return;
    }
    setActingId(id);
    try {
      await api.patch(`/approval/${id}`, {
        action: 'reject',
        rejection_reason: reason.trim(),
      });
      toast.success('Rejected.');
      setItems((prev) => prev.filter((c) => c.id !== id));
      setRejectModal(null);
    } catch (err) {
      toast.error(errMsg(err, 'Rejection failed'));
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-parchment-100">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
        <header className="mb-10 lg:mb-14 fade-up">
          <span className="eyebrow">— Pending review</span>
          <h1 className="font-display text-5xl lg:text-6xl font-light tracking-tightest text-ink-900 mt-2">
            Decide.
          </h1>
          <p className="text-ink-500 mt-3 max-w-lg">
            Each piece below is sitting on the runway, waiting for a green light. Approve to release it into rotation, or reject with a reason teachers can act on.
          </p>
        </header>

        {loading ? (
          <div className="space-y-4">
            {[0, 1].map((i) => (
              <div key={i} className="paper h-56 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="The desk is clear."
            description="No content waiting on your review. Teachers will know to check back later."
          />
        ) : (
          <div className="space-y-5">
            <div className="eyebrow flex items-center gap-2">
              <AlertTriangle size={12} className="text-sienna-500" />
              {items.length} {items.length === 1 ? 'item' : 'items'} pending
            </div>
            {items.map((item) => (
              <ContentCard
                key={item.id}
                content={item}
                showTeacher
                actions={
                  <>
                    <button
                      onClick={() => handleApprove(item.id)}
                      disabled={actingId === item.id}
                      className="btn-primary !bg-forest-700 hover:!bg-forest-600"
                    >
                      <Check size={16} />
                      {actingId === item.id ? 'Approving…' : 'Approve'}
                    </button>
                    <button
                      onClick={() => setRejectModal(item)}
                      disabled={actingId === item.id}
                      className="btn-secondary"
                    >
                      <X size={16} /> Reject
                    </button>
                  </>
                }
              />
            ))}
          </div>
        )}
      </main>

      {/* Rejection modal */}
      {rejectModal && (
        <RejectModal
          content={rejectModal}
          onClose={() => setRejectModal(null)}
          onConfirm={(reason) => handleReject(rejectModal.id, reason)}
          loading={actingId === rejectModal.id}
        />
      )}
    </div>
  );
}

function RejectModal({ content, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState('');

  return (
    <div
      className="fixed inset-0 z-50 bg-ink-900/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="paper w-full max-w-lg p-6 sm:p-8 fade-up"
      >
        <span className="eyebrow text-sienna-600">— Rejecting</span>
        <h3 className="font-display text-3xl font-light tracking-tightest text-ink-900 mt-2 mb-1">
          {content.title}
        </h3>
        <p className="text-sm text-ink-500 mb-6">
          Tell <span className="text-ink-900">{content.teacher_name}</span> why this isn't airing. They'll see this as feedback.
        </p>

        <textarea
          autoFocus
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="e.g. Image quality is too low for projection. Please re-upload at higher resolution."
          className="input-block resize-none text-sm mb-6"
        />

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading || !reason.trim()}
            className="btn-primary !bg-sienna-700 hover:!bg-sienna-600"
          >
            {loading ? 'Sending…' : 'Confirm rejection'}
          </button>
        </div>
      </div>
    </div>
  );
}
