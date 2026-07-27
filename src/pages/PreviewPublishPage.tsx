import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTestStore } from "../store/testStore";
import { api } from "../api/endpoints";
import type { Question } from "../types";

const PreviewPublishPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTest, setCurrentTest, questions, setQuestions } =
    useTestStore();
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const testRes = await api.getTestById(id!);
        if (testRes.data.success) {
          const test = testRes.data.data;
          setCurrentTest(test);
          if (test.questions && test.questions.length > 0) {
            const qRes = await api.fetchBulkQuestions(test.questions);
            if (qRes.data.success) {
              setQuestions(qRes.data.data || []);
            }
          }
        }
      } catch (err) {
        console.log("Failed to load test data", "error");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id, setCurrentTest, setQuestions]);

  const handlePublish = async () => {
    if (!id) return;
    setPublishing(true);
    try {
      await api.publishTest(id);
      if (currentTest) {
        setCurrentTest({ ...currentTest, status: "live" });
      }
      setTimeout(() => navigate("/"), 1500);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to publish test";
      console.log(msg, "error");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  if (!currentTest) {
    return (
      <div className="text-center py-16">
        <p className="text-[#64748b]">Test not found</p>
        <button onClick={() => navigate("/")} className="btn-primary mt-4">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const isPublished = currentTest.status === "live";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/")}
          className="text-[#64748b] hover:text-[#0f172a] transition"
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <h1 className="text-2xl font-bold text-[#0f172a]">
          {isPublished ? "Test Published" : "Preview & Publish"}
        </h1>
        {isPublished && <span className="badge badge-live ml-2">Live</span>}
      </div>

      <div className="bg-white rounded-xl border border-[#e9edf2] p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-[#94a3b8]">Test Name</span>
            <p className="font-medium text-[#0f172a]">{currentTest.name}</p>
          </div>
          <div>
            <span className="text-[#94a3b8]">Subject</span>
            <p className="font-medium text-[#0f172a]">
              {currentTest.subject || "-"}
            </p>
          </div>
          <div>
            <span className="text-[#94a3b8]">Type</span>
            <p className="font-medium text-[#0f172a] capitalize">
              {currentTest.type || "Chapterwise"}
            </p>
          </div>
          <div>
            <span className="text-[#94a3b8]">Difficulty</span>
            <p className="font-medium text-[#0f172a] capitalize">
              {currentTest.difficulty || "Medium"}
            </p>
          </div>
          <div>
            <span className="text-[#94a3b8]">Questions</span>
            <p className="font-medium text-[#0f172a]">
              {questions.length} / {currentTest.total_questions || 0}
            </p>
          </div>
          <div>
            <span className="text-[#94a3b8]">Total Marks</span>
            <p className="font-medium text-[#0f172a]">
              {currentTest.total_marks || 0}
            </p>
          </div>
          <div>
            <span className="text-[#94a3b8]">Duration</span>
            <p className="font-medium text-[#0f172a]">
              {currentTest.total_time || 0} min
            </p>
          </div>
          <div>
            <span className="text-[#94a3b8]">Marking</span>
            <p className="font-medium text-[#0f172a] text-xs">
              +{currentTest.correct_marks || 5} / -
              {Math.abs(currentTest.wrong_marks || 1)} / 0
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-[#0f172a] mb-3">
          Questions ({questions.length})
        </h3>
        {questions.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl border border-[#e9edf2] text-[#94a3b8] text-sm">
            <i className="fas fa-question-circle text-3xl mb-2 block"></i>
            No questions added yet.
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-[#e9edf2] p-5"
              >
                <div className="flex items-start gap-3">
                  <span className="font-semibold text-[#4f46e5] text-sm min-w-[28px]">
                    Q{idx + 1}.
                  </span>
                  <div className="flex-1">
                    <p className="text-[#0f172a] font-medium">{q.question}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-3">
                      {["option1", "option2", "option3", "option4"].map(
                        (opt, i) => (
                          <div
                            key={opt}
                            className={`flex items-center gap-2 text-sm p-2 rounded-lg ${
                              q.correct_option === opt
                                ? "bg-[#dcfce7] border border-[#86efac]"
                                : "bg-[#f8fafc]"
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                q.correct_option === opt
                                  ? "bg-[#22c55e] text-white"
                                  : "bg-[#e2e8f0] text-[#64748b]"
                              }`}
                            >
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span>{q[opt as keyof Question] as string}</span>
                            {q.correct_option === opt && (
                              <span className="text-[#16a34a] text-xs font-medium ml-auto">
                                <i className="fas fa-check-circle"></i> Correct
                              </span>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                    {q.explanation && (
                      <div className="mt-3 text-sm bg-[#fefce8] border border-[#fde68a] rounded-lg p-3">
                        <span className="text-[#92400e] font-medium">
                          <i className="fas fa-lightbulb text-[#f59e0b] mr-1"></i>
                          Solution:
                        </span>
                        <span className="text-[#78350f] ml-1">
                          {q.explanation}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-[#94a3b8]">
                      {q.difficulty && <span>Difficulty: {q.difficulty}</span>}
                      {q.topic && <span>• Topic: {q.topic}</span>}
                      {q.sub_topic && <span>• Sub: {q.sub_topic}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/edit-test/${id}`)}
            className="btn-secondary flex items-center gap-2"
          >
            <i className="fas fa-pen"></i> Edit Test
          </button>
          <button
            onClick={() => navigate(`/test/${id}/questions`)}
            className="btn-secondary flex items-center gap-2"
          >
            <i className="fas fa-list"></i> Manage Questions
          </button>
        </div>
        {!isPublished ? (
          <button
            onClick={handlePublish}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={publishing || questions.length === 0}
          >
            {publishing ? (
              <span className="spinner w-4 h-4"></span>
            ) : (
              <i className="fas fa-rocket"></i>
            )}
            {publishing ? "Publishing..." : "Publish Test"}
          </button>
        ) : (
          <span className="text-[#22c55e] font-medium flex items-center gap-2">
            <i className="fas fa-check-circle"></i> Test is Live
          </span>
        )}
      </div>
    </div>
  );
};

export default PreviewPublishPage;
