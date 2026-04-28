import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, X, FileImage } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { api, errMsg } from '../../api/client';

const SUBJECT_PRESETS = ['maths', 'science', 'english', 'history', 'computer-science'];

export default function TeacherUpload() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      toast.error('File too large. Max 10 MB.');
      return;
    }
    setFile(f);
    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  };

  const clearFile = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please attach a file.');
    if (!title.trim()) return toast.error('Title is required.');
    if (!subject.trim()) return toast.error('Subject is required.');

    // start/end must be provided together or neither
    if ((startTime && !endTime) || (!startTime && endTime)) {
      return toast.error('Provide both start and end time, or neither.');
    }
    if (startTime && endTime && new Date(endTime) <= new Date(startTime)) {
      return toast.error('End time must be after start time.');
    }

    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', title.trim());
    fd.append('subject', subject.trim().toLowerCase());
    if (description.trim()) fd.append('description', description.trim());
    if (startTime) fd.append('start_time', new Date(startTime).toISOString());
    if (endTime) fd.append('end_time', new Date(endTime).toISOString());
    fd.append('rotation_duration', String(duration));

    setSubmitting(true);
    try {
      await api.post('/content/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Uploaded. Awaiting principal review.');
      navigate('/teacher');
    } catch (err) {
      toast.error(errMsg(err, 'Upload failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-parchment-100">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
        <button
          onClick={() => navigate('/teacher')}
          className="btn-ghost -ml-3 mb-6 text-ink-500"
        >
          <ArrowLeft size={14} /> Back to studio
        </button>

        <header className="mb-12 fade-up">
          <span className="eyebrow">— Compose</span>
          <h1 className="font-display text-5xl lg:text-6xl font-light tracking-tightest text-ink-900 mt-2">
            New broadcast
          </h1>
          <p className="text-ink-500 mt-3 max-w-xl">
            Drop a file, set its window, and send it for the principal's nod. It will rotate on the live feed once approved.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_1fr] gap-10">
          {/* LEFT — file dropzone & preview */}
          <section>
            <span className="eyebrow block mb-3">01 — File</span>

            {!file ? (
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                className="block border-2 border-dashed border-ink-900/25 hover:border-sienna-500 transition-colors cursor-pointer paper p-12 text-center"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                  className="hidden"
                />
                <FileImage className="mx-auto text-ink-400 mb-4" size={40} strokeWidth={1.25} />
                <p className="font-display text-2xl text-ink-900 tracking-tightest mb-2">
                  Drop, or click to browse
                </p>
                <p className="text-xs text-ink-500">JPG / PNG / WebP / PDF · max 10 MB</p>
              </label>
            ) : (
              <div className="paper p-4 fade-up">
                <div className="flex items-start gap-4">
                  {preview ? (
                    <img
                      src={preview}
                      alt="preview"
                      className="w-32 h-32 object-cover border border-ink-900/15 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-parchment-200 flex items-center justify-center border border-ink-900/15">
                      <FileImage className="text-ink-400" size={32} strokeWidth={1.25} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-ink-900 truncate">{file.name}</p>
                      <button
                        type="button"
                        onClick={clearFile}
                        className="p-1 hover:text-sienna-600 text-ink-400"
                        aria-label="Remove file"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-ink-500 mt-1 font-mono">
                      {(file.size / 1024).toFixed(1)} KB · {file.type || 'unknown'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tip block */}
            <div className="mt-6 px-4 py-3 bg-parchment-200/60 border-l-2 border-ink-900/40 text-xs text-ink-600 leading-relaxed">
              <span className="eyebrow block mb-1">Note</span>
              Without a start &amp; end time, your content uploads but never airs. Set a window to schedule it.
            </div>
          </section>

          {/* RIGHT — metadata */}
          <section className="space-y-6">
            <div>
              <span className="eyebrow block mb-3">02 — Details</span>
              <div className="space-y-5">
                <div>
                  <label className="text-xs text-ink-500 block mb-1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Chapter 5 · Algebra"
                    className="input-field"
                    maxLength={150}
                  />
                </div>

                <div>
                  <label className="text-xs text-ink-500 block mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="maths"
                    className="input-field lowercase"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {SUBJECT_PRESETS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSubject(s)}
                        className={`px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] border transition-colors ${
                          subject === s
                            ? 'bg-ink-900 text-parchment-50 border-ink-900'
                            : 'border-ink-900/25 text-ink-500 hover:border-ink-900'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-ink-500 block mb-1">Description (optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A short note for the principal…"
                    rows={3}
                    className="input-block resize-none text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="rule pt-6">
              <span className="eyebrow block mb-3">03 — Air-time</span>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs text-ink-500 block mb-1">Start</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="input-block text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-ink-500 block mb-1">End</label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="input-block text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-ink-500 block mb-1">
                    Rotation duration · <span className="font-mono text-ink-900">{duration} min</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={30}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full accent-sienna-600"
                  />
                  <div className="flex justify-between text-[10px] text-ink-400 font-mono mt-1">
                    <span>1m</span><span>15m</span><span>30m</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rule pt-6 flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/teacher')}
                className="btn-secondary flex-1 sm:flex-none"
              >
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn-primary flex-1">
                <Upload size={16} />
                {submitting ? 'Sending…' : 'Send for approval'}
              </button>
            </div>
          </section>
        </form>
      </main>
    </div>
  );
}
