import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTestStore } from "../store/testStore";
import { api } from "../api/endpoints";
import type { Question, Subject, SubTopic, Topic } from "../types";
import CustomSelect from "../components/common/CustomSelect.tsx";
import clockIcon from "../assets/clock.svg";
import quizIcon from "../assets/quiz.svg";
import leaderboardIcon from "../assets/leaderboard.svg";
import deleteIcon from "../assets/delete.svg";
import downloadIcon from "../assets/download.svg";

const difficultyOptions = [
  { id: "easy", name: "Easy" },
  { id: "medium", name: "Medium" },
  { id: "difficult", name: "Difficult" },
];

const correctOptionOptions = [
  { id: "option1", name: "A" },
  { id: "option2", name: "B" },
  { id: "option3", name: "C" },
  { id: "option4", name: "D" },
];

const optionFields = [
  { name: "option1", label: "A" },
  { name: "option2", label: "B" },
  { name: "option3", label: "C" },
  { name: "option4", label: "D" },
] as const;

const toolButtons = [
  "I",
  "B",
  "U",
  "S",
  "link",
  "list",
  "align",
  "image",
  "fx",
];

const AddQuestionsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentTest,
    questions,
    setQuestions,
    addQuestion,
    removeQuestion,
    setCurrentTest,
  } = useTestStore();
  const [submitting, setSubmitting] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      question: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      correct_option: "option1" as const,
      explanation: "",
      difficulty: "medium",
      topic: "",
      sub_topic: "",
      media_url: "",
      subject: "",
    },
  });

  const watchTopic = useWatch({ control, name: "topic" });

  useEffect(() => {
    const fetchCurrentTest = async () => {
      if (!id) return;
      try {
        const res = await api.getTestById(id);
        if (res.data.status === "success") {
          setCurrentTest(res.data.data);
        }
      } catch (err) {
        console.log("Failed to load test", "error");
      }
    };
    void fetchCurrentTest();
  }, [id, setCurrentTest]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.getSubjects();
        if (res.data?.status === "success" && Array.isArray(res.data.data)) {
          setSubjects(res.data.data);
        }
      } catch (err) {
        console.log("Failed to load subjects", "error");
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (!currentTest?.subject || subjects.length === 0) return;
    const subjectId =
      subjects.find((s) => s.id === currentTest.subject)?.id ||
      subjects.find((s) => s.name === currentTest.subject)?.id ||
      "";
    setValue("subject", subjectId);
  }, [currentTest?.subject, subjects, setValue]);

  useEffect(() => {
    if (!currentTest?.subject) return;
    const subjectId =
      subjects.find((s) => s.id === currentTest.subject)?.id ||
      subjects.find((s) => s.name === currentTest.subject)?.id ||
      "";
    if (!subjectId) return;
    const fetchTopics = async () => {
      try {
        const res = await api.getTopicsBySubject(subjectId);
        if (res.data?.status === "success" && Array.isArray(res.data.data)) {
          setTopics(res.data.data);
        }
      } catch (err) {
        console.log("Failed to load topics", "error");
      }
    };
    fetchTopics();
  }, [currentTest?.subject, subjects]);

  useEffect(() => {
    if (!watchTopic) {
      setSubTopics([]);
      setValue("sub_topic", "", { shouldValidate: false });
      return;
    }
    const fetchSubTopics = async () => {
      try {
        const res = await api.getSubTopicsByTopic(watchTopic);
        if (res.data?.status === "success" && Array.isArray(res.data.data)) {
          setSubTopics(res.data.data);
        }
      } catch (err) {
        console.log("Failed to load sub-topics", "error");
      }
    };
    fetchSubTopics();
  }, [watchTopic, setValue]);

  useEffect(() => {
    if (id && questions.length === 0) {
      const fetchQuestions = async () => {
        try {
          const res = await api.getTestById(id);
          if (res.data.success) {
            const test = res.data.data;
            if (test.questions && test.questions.length > 0) {
              const qRes = await api.fetchBulkQuestions(test.questions);
              if (qRes.data.success) {
                setQuestions(qRes.data.data || []);
              }
            }
          }
        } catch (err) {
          // silent
        }
      };
      fetchQuestions();
    }
  }, [id, questions.length, setQuestions]);

  const onSubmitQuestion = (data: any) => {
    const newQuestion: Question = {
      type: "mcq",
      question: data.question,
      option1: data.option1,
      option2: data.option2,
      option3: data.option3,
      option4: data.option4,
      correct_option: data.correct_option,
      explanation: data.explanation || "",
      difficulty: data.difficulty || "medium",
      topic: data.topic || "",
      sub_topic: data.sub_topic || "",
      media_url: data.media_url || "",
    };

    if (editingIndex !== null) {
      const updated = [...questions];
      updated[editingIndex] = newQuestion;
      setQuestions(updated);
      setEditingIndex(null);
    } else {
      addQuestion(newQuestion);
    }
    reset();
  };

  const handleEditQuestion = (index: number) => {
    const q = questions[index];
    setEditingIndex(index);
    setValue("question", q.question);
    setValue("option1", q.option1);
    setValue("option2", q.option2);
    setValue("option3", q.option3);
    setValue("option4", q.option4);
    setValue("correct_option", q.correct_option as "option1");
    setValue("explanation", q.explanation || "");
    setValue("difficulty", q.difficulty || "medium");
    setValue("topic", q.topic || "");
    setValue("sub_topic", q.sub_topic || "");
    setValue("media_url", q.media_url || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    reset();
  };

  const handleSaveAndContinue = async () => {
    if (questions.length === 0) {
      console.log("Please add at least one question", "error");
      return;
    }

    setSubmitting(true);
    try {
      const questionData = questions.map((q) => ({
        type: q.type,
        subject: currentTest?.subject || "",
        question: q.question,
        option1: q.option1,
        option2: q.option2,
        option3: q.option3,
        option4: q.option4,
        correct_option: q.correct_option,
        explanation: q.explanation || "",
        difficulty: q.difficulty || "medium",
        test_id: id,
        topic: topics.find((t) => t.id === q.topic)?.name || q.topic || "",
        sub_topic: subTopics.find((st) => st.id === q.sub_topic)?.name || "",
        media_url: q.media_url || "",
      }));

      await api.bulkCreateQuestions(questionData);
      navigate(`/test/${id}/preview`);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to save questions";
      console.log(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const subjectName =
    subjects.find((s) => s.id === currentTest?.subject)?.name ||
    subjects.find((s) => s.name === currentTest?.subject)?.name ||
    currentTest?.subject ||
    "-";

  const topicSummary =
    topics
      .filter((topic) => currentTest?.topics?.includes(topic.id))
      .map((topic) => topic.name)
      .join(", ") ||
    currentTest?.topics?.join(", ") ||
    "-";

  const subTopicSummary =
    subTopics
      .filter((subTopic) => currentTest?.sub_topics?.includes(subTopic.id))
      .map((subTopic) => subTopic.name)
      .join(", ") ||
    currentTest?.sub_topics?.join(", ") ||
    "-";

  const totalQuestions = currentTest?.total_questions || 50;
  const currentQuestionNumber =
    editingIndex !== null
      ? editingIndex + 1
      : Math.min(questions.length + 1, totalQuestions);
  const questionRailCount = Math.max(totalQuestions || 6, 6);

  return (
    <div className="flex min-h-[calc(100vh-132px)] bg-white">
      <input type="hidden" {...register("subject")} />

      <aside className="hidden w-[180px] shrink-0 border-r border-[#edf0f4] px-3 py-24 xl:block">
        <div className="mb-6 flex items-center justify-between text-sm font-semibold text-[#7a8193]">
          <span>Question creation</span>
          <span className="text-[#7488ff]">«</span>
        </div>
        <div className="mb-7 text-sm text-[#7a8193]">
          Total Questions .{" "}
          <span className="font-bold text-[#64748b]">{totalQuestions}</span>
        </div>
        <div className="space-y-3">
          {Array.from({ length: Math.min(questionRailCount, 8) }).map(
            (_, index) => {
              const isAdded = index < questions.length;
              const isCurrent = index + 1 === currentQuestionNumber;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => isAdded && handleEditQuestion(index)}
                  className={`flex h-9 w-full items-center justify-between rounded-[7px] border px-3 text-xs font-semibold transition ${
                    isAdded || isCurrent
                      ? "border-[#7bdcb5] bg-white text-[#22b07d]"
                      : "border-[#edf0f4] bg-white text-[#d2d7df]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        isAdded ? "bg-[#23b37c]" : "bg-[#d7dce4]"
                      }`}
                    />
                    Question {index + 1}
                  </span>
                  <span>»</span>
                </button>
              );
            },
          )}
        </div>
      </aside>

      <section className="min-w-0 flex-1 px-4 pb-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit(onSubmitQuestion)} className="space-y-8">
          <div className="rounded-[8px] border border-[#e4e8ef] bg-white p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-full bg-[#090642] px-4 py-1 text-xs font-semibold text-white">
                Chapter Wise
              </span>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md text-[#7383ff] transition hover:bg-[#f1f4ff]"
                aria-label="Edit chapter details"
              >
                <i className="fas fa-pen text-sm"></i>
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">♟</span>
                <h2 className="text-base font-bold text-[#111827]">
                  {currentTest?.name || "Chapter 1"}
                </h2>
              </div>
              <span className="rounded-[6px] bg-[#25b9ad] uppercase px-5 py-1.5 text-xs font-semibold text-white">
                {currentTest?.difficulty || "Easy"}
              </span>
            </div>
            <div className="mt-5 grid gap-3 text-sm md:grid-cols-[1fr_auto]">
              <div className="space-y-3">
                <p className="grid grid-cols-[92px_1fr] text-[#7c8598]">
                  <span>Subject</span>
                  <span className="font-semibold text-[#707589]">
                    : {subjectName}
                  </span>
                </p>
                <p className="grid grid-cols-[92px_1fr] text-[#7c8598]">
                  <span>Topic</span>
                  <span className="font-semibold text-[#707589]">
                    :{" "}
                    <span className="border p-1 rounded-md border-yellow-500 text-yellow-400">
                      {topicSummary}
                    </span>
                  </span>
                </p>
                <p className="grid grid-cols-[92px_1fr] text-[#7c8598]">
                  <span>Sub Topic</span>
                  <span className="font-semibold  w-fit ">
                    :{" "}
                    <span className="border p-1 rounded-md border-yellow-500 text-yellow-400">
                      {subTopicSummary}
                    </span>
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 self-end rounded-[6px] border border-[#eef1f5] px-3 py-2 text-sm font-semibold text-[#667085]">
                <span className="flex items-center gap-1">
                  <img
                    src={clockIcon}
                    alt="Book Creation"
                    className="h-4 w-4"
                  />
                  {currentTest?.total_time || 60} Min
                </span>
                <span className="h-5 w-px bg-[#e4e8ef]" />
                <span className="flex items-center gap-1">
                  <img src={quizIcon} alt="Book Creation" className="h-4 w-4" />
                  {totalQuestions} Q's
                </span>
                <span className="h-5 w-px bg-[#e4e8ef]" />
                <span className="flex items-center gap-1">
                  <img
                    src={leaderboardIcon}
                    alt="Book Creation"
                    className="h-4 w-4"
                  />
                  {currentTest?.total_marks || 250} Marks
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-base font-bold text-[#100a4d]">
              Question {currentQuestionNumber}
              <span className="text-[#8aa0ff]">/{totalQuestions}</span>
            </h3>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="h-10 rounded-[6px] bg-[#fafafa] px-4 text-sm font-semibold text-[#98a2b3]"
              >
                + MCQ
              </button>
              <button
                type="button"
                className="h-10 rounded-[6px] bg-[#fafafa] px-4 text-sm font-semibold text-[#98a2b3] flex items-center gap-2"
              >
                <img
                  src={downloadIcon}
                  alt="Book Creation"
                  className="h-5 w-5"
                />{" "}
                CSV
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCancelEdit}
            className="text-sm font-semibold text-[#ff7479] flex items-center gap-2 bg-red-50 p-1.5 rounded-md transition"
          >
            <img src={deleteIcon} alt="Book Creation" className="h-4 w-4" />{" "}
            Delete All Edits
          </button>

          <div>
            <div
              className={`overflow-hidden rounded-[6px] border bg-white ${
                errors.question ? "border-red-400" : "border-[#c9dcff]"
              }`}
            >
              <div className="flex h-11 items-center gap-1 border-b border-[#edf0f4] px-4 text-[#818999]">
                {toolButtons.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className="flex h-7 min-w-7 items-center justify-center rounded text-xs font-semibold hover:bg-[#f4f6f9]"
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="relative">
                <textarea
                  {...register("question", {
                    required: "Question is required",
                  })}
                  className="min-h-[166px] w-full resize-y border-0 px-5 py-4 text-sm text-[#111827] outline-none placeholder:text-[#a7afbd]"
                  placeholder="Type here"
                />
                <button
                  type="button"
                  onClick={() => setValue("question", "")}
                  className="absolute right-4 top-4 text-[#c9ced8]"
                  aria-label="Clear question"
                >
                  <i className="far fa-trash-alt"></i>
                </button>
              </div>
            </div>
            {errors.question && (
              <p className="mt-1 text-xs text-red-500">
                {errors.question.message}
              </p>
            )}
          </div>

          <div>
            <h3 className="mb-4 text-base font-bold text-[#111827]">
              Type the options below
            </h3>
            <div className="space-y-5">
              {optionFields.map((field) => (
                <div key={field.name}>
                  <div className="flex items-center gap-4">
                    <span className="h-5 w-5 shrink-0 rounded-full border-2 border-[#7587ff]" />
                    <div
                      className={`flex h-12 flex-1 items-center rounded-[6px] border bg-white ${
                        errors[field.name]
                          ? "border-red-400"
                          : "border-[#e1e6ee]"
                      }`}
                    >
                      <input
                        {...register(field.name, {
                          required: `Option ${field.label} is required`,
                        })}
                        className="h-full min-w-0 flex-1 rounded-[6px] px-5 text-sm text-[#111827] outline-none placeholder:text-[#a7afbd]"
                        placeholder="Type Option here"
                      />
                      <button
                        type="button"
                        onClick={() => setValue(field.name, "")}
                        className="flex h-full w-12 items-center justify-center text-[#c9ced8]"
                        aria-label={`Clear option ${field.label}`}
                      >
                        <i className="far fa-trash-alt"></i>
                      </button>
                    </div>
                  </div>
                  {errors[field.name] && (
                    <p className="ml-9 mt-1 text-xs text-red-500">
                      {errors[field.name]?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-base font-bold text-[#111827]">
              Add Solution
            </h3>
            <div className="relative rounded-[6px] border border-[#e1e6ee] bg-white">
              <textarea
                {...register("explanation")}
                className="min-h-[146px] w-full resize-y rounded-[6px] px-5 py-4 text-sm text-[#111827] outline-none placeholder:text-[#a7afbd]"
                placeholder="Type here"
              />
              <button
                type="button"
                onClick={() => setValue("explanation", "")}
                className="absolute right-4 top-4 text-[#c9ced8]"
                aria-label="Clear solution"
              >
                <i className="far fa-trash-alt"></i>
              </button>
            </div>
          </div>
          <div className="space-y-5">
            <h3 className="text-base font-bold text-[#4b5568]">
              Question settings
            </h3>
            <div className="grid gap-5">
              <div>
                <label className="mb-3 block text-sm font-semibold text-[#4b5568]">
                  Level of Difficulty
                </label>
                <Controller
                  name="difficulty"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={difficultyOptions}
                      placeholder="Select from Drop-down"
                    />
                  )}
                />
              </div>
              <div>
                <label className="mb-3 block text-sm font-semibold text-[#4b5568]">
                  Correct Option
                </label>
                <Controller
                  name="correct_option"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={correctOptionOptions}
                      placeholder="Select from Drop-down"
                    />
                  )}
                />
              </div>
              <div>
                <label className="mb-3 block text-sm font-semibold text-[#4b5568]">
                  Topic
                </label>
                <Controller
                  name="topic"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={topics}
                      placeholder="Select from Drop-down"
                    />
                  )}
                />
              </div>
              <div>
                <label className="mb-3 block text-sm font-semibold text-[#4b5568]">
                  Sub-topic
                </label>
                <Controller
                  name="sub_topic"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={subTopics}
                      placeholder="Select from Drop-down"
                      disabled={!watchTopic}
                    />
                  )}
                />
              </div>
              <div>
                <label className="mb-3 block text-sm font-semibold text-[#4b5568]">
                  Media URL
                </label>
                <input
                  {...register("media_url")}
                  className="h-11 w-full rounded-[6px] border border-[#d0d5dd] bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#98a2b3] focus:border-[#1B5DEF] focus:ring-2 focus:ring-[#dbe7ff]"
                  placeholder="https://example.com/image.png"
                />
              </div>
            </div>
          </div>

          {questions.length > 0 && (
            <div className="rounded-[8px] border border-[#edf0f4] bg-[#fbfcfd] p-4">
              <h3 className="mb-3 text-sm font-bold text-[#4b5568]">
                Added Questions ({questions.length})
              </h3>
              <div className="grid gap-3 lg:grid-cols-2">
                {questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="rounded-[6px] border border-[#e5e7eb] bg-white p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="mb-1 text-xs font-bold text-[#7488ff]">
                          Q{idx + 1}
                        </p>
                        <p className="truncate text-sm font-semibold text-[#111827]">
                          {q.question}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditQuestion(idx)}
                          className="p-1.5 text-[#667085] hover:text-[#1B5DEF]"
                          title="Edit"
                        >
                          <i className="fas fa-pen text-xs"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("Remove this question?"))
                              removeQuestion(idx);
                          }}
                          className="p-1.5 text-[#667085] hover:text-[#ef4444]"
                          title="Remove"
                        >
                          <i className="fas fa-trash text-xs"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="h-12 rounded-[6px] bg-[#ff7075] px-5 text-sm font-bold text-white transition hover:bg-[#ef5e64]"
          >
            Exit Test Creation
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="h-12 min-w-[176px] rounded-[6px] bg-[#f9fafb] px-5 text-sm font-semibold text-[#1B5DEF] transition hover:bg-[#f1f4ff]"
              aria-label={
                editingIndex !== null ? "Update question" : "Add question"
              }
            >
              + Add Question
            </button>
            <button
              type="button"
              onClick={handleSaveAndContinue}
              className="btn-primary flex h-12 min-w-[176px] items-center justify-center gap-2 bg-[#7284ff] hover:bg-[#6175f2]"
              disabled={submitting || questions.length === 0}
            >
              {submitting ? <span className="spinner h-4 w-4"></span> : null}
              {submitting ? "Saving..." : "Next"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AddQuestionsPage;
