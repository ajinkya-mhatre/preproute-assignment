import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/endpoints';
import { useTestStore } from '../store/testStore';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { tests, setTests } = useTestStore();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getTests();
      if (res.data.success) setTests(res.data.data || []);
    } catch (err) {
      console.log('Failed to load tests', err);
    } finally {
      setLoading(false);
    }
  }, [setTests]);

  useEffect(() => {
    void fetchTests();
  }, [fetchTests]);

  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      const matchesSearch =
        !searchTerm.trim() ||
        test.name.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
        test.subject?.toLowerCase().includes(searchTerm.trim().toLowerCase());
      const matchesStatus = statusFilter === 'all' || test.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tests, searchTerm, statusFilter]);

  const statusClass = (status: string) => {
    if (status === 'live') return 'bg-[#dcfce7] text-[#166534]';
    if (status === 'archived') return 'bg-[#f1f5f9] text-[#64748b]';
    return 'bg-[#eef4ff] text-[#1B5DEF]';
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-left">
          <h1 className="text-2xl font-semibold text-[#111827]">Test Dashboard</h1>
          <p className="mt-1 text-sm text-[#667085]">Create, review, and publish assessment tests.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/create-test')}
          className="h-11 rounded-[6px] bg-[#1B5DEF] px-5 text-sm font-semibold text-white transition hover:bg-[#164cc5]"
        >
          Create Test
        </button>
      </div>

      <div className="grid gap-3 rounded-[8px] border border-[#e5e7eb] bg-white p-4 sm:grid-cols-[1fr_180px]">
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by test name or subject"
          className="h-11 rounded-[6px] border border-[#d0d5dd] px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#98a2b3] focus:border-[#1B5DEF] focus:ring-2 focus:ring-[#dbe7ff]"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="h-11 rounded-[6px] border border-[#d0d5dd] bg-white px-4 text-sm text-[#667085] outline-none transition focus:border-[#1B5DEF] focus:ring-2 focus:ring-[#dbe7ff]"
        >
          <option value="all">All status</option>
          <option value="draft">Draft</option>
          <option value="live">Live</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-[8px] border border-[#e5e7eb] bg-white">
        <div className="hidden grid-cols-[1.5fr_1fr_120px_120px_120px] gap-4 border-b border-[#e5e7eb] bg-[#f9fafb] px-5 py-3 text-left text-xs font-semibold uppercase text-[#667085] md:grid">
          <span>Test</span>
          <span>Subject</span>
          <span>Questions</span>
          <span>Status</span>
          <span>Action</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-[#667085]">Loading tests...</div>
        ) : filteredTests.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
            <p className="text-base font-semibold text-[#111827]">No tests found</p>
            <p className="mt-1 max-w-md text-sm text-[#667085]">
              Start with a chapterwise test and add questions in the next step.
            </p>
            <button
              type="button"
              onClick={() => navigate('/create-test')}
              className="mt-5 h-10 rounded-[6px] bg-[#1B5DEF] px-5 text-sm font-semibold text-white transition hover:bg-[#164cc5]"
            >
              Create Test
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#e5e7eb]">
            {filteredTests.map((test) => (
              <div
                key={test.id}
                className="grid gap-3 px-5 py-4 text-left md:grid-cols-[1.5fr_1fr_120px_120px_120px] md:items-center md:gap-4"
              >
                <div>
                  <p className="font-semibold text-[#111827]">{test.name}</p>
                  <p className="text-xs text-[#667085]">{test.type || 'chapterwise'}</p>
                </div>
                <p className="text-sm text-[#667085]">{test.subject || '-'}</p>
                <p className="text-sm text-[#667085]">{test.total_questions || 0}</p>
                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClass(test.status)}`}
                >
                  {test.status || 'draft'}
                </span>
                <button
                  type="button"
                  onClick={() => navigate(`/edit-test/${test.id}`)}
                  className="w-fit rounded-[6px] border border-[#d0d5dd] px-3 py-2 text-sm font-semibold text-[#344054] transition hover:bg-[#f9fafb]"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default DashboardPage;
