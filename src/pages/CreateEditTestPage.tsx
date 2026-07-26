import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../api/endpoints";
import { useTestStore } from "../store/testStore";
import type { Subject, SubTopic, Topic } from "../types";

const numericField = (message: string) => z.coerce.number({ error: message });

const testSchema = z.object({
  name: z.string().min(1, "Test name is required"),
  subject: z.string().min(1, "Subject is required"),
  type: z.string().min(1, "Test type is required"),
  topics: z.array(z.string()).min(1, "At least one topic is required"),
  sub_topics: z.array(z.string()).optional(),
  difficulty: z.string().min(1, "Difficulty is required"),
  correct_marks: numericField("Correct marks is required").min(
    0,
    "Must be 0 or more",
  ),
  wrong_marks: numericField("Wrong marks is required"),
  unattempt_marks: numericField("Unattempted marks is required"),
  total_time: numericField("Duration is required").min(
    1,
    "Time must be at least 1 minute",
  ),
  total_marks: numericField("Total marks is required").min(
    1,
    "Total marks must be at least 1",
  ),
  total_questions: numericField("Question count is required").min(
    1,
    "At least 1 question",
  ),
});

type TestFormInput = z.input<typeof testSchema>;
type TestFormData = z.output<typeof testSchema>;

const labelClass = "mb-2 block text-sm font-semibold text-[#111827]";

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { id: string; name: string }[];
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Choose from Drop-down",
  disabled = false,
  error = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`h-12 w-full rounded-[6px] border bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#98a2b3] focus:border-[#1B5DEF] focus:ring-2 focus:ring-[#dbe7ff] disabled:bg-[#f9fafb] flex items-center justify-between ${
          error ? "border-red-500" : "border-[#d0d5dd]"
        }`}
        disabled={disabled}
      >
        <span className={selectedOption ? "text-[#111827]" : "text-[#98a2b3]"}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <svg
          className={`h-5 w-5 text-[#667085] transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && !disabled && (
        <ul className="absolute left-0 right-0 z-10 mt-1 max-h-60 overflow-auto rounded-[6px] border border-[#d0d5dd] bg-white py-1 shadow-lg">
          {options.length === 0 ? (
            <li className="px-4 py-2 text-sm text-[#667085]">No options</li>
          ) : (
            options.map((opt) => (
              <li
                key={opt.id}
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                }}
                className={`cursor-pointer px-4 py-2 text-sm hover:bg-[#f0f5ff] ${
                  opt.id === value
                    ? "bg-[#dbe7ff] text-[#1B5DEF]"
                    : "text-[#111827]"
                }`}
              >
                {opt.name}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

const CreateEditTestPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setCurrentTest, clearQuestions } = useTestStore();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const hasFetchedSubjects = useRef(false);
  console.log("CreateEditTestPage render", subjects, topics, subTopics);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TestFormInput, unknown, TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      name: "",
      subject: "",
      type: "chapterwise",
      topics: [],
      sub_topics: [],
      difficulty: "medium",
      correct_marks: 5,
      wrong_marks: -1,
      unattempt_marks: 0,
      total_time: 60,
      total_marks: 250,
      total_questions: 50,
    },
  });

  const watchSubject = watch("subject");
  const watchTopics = watch("topics");

  useEffect(() => {
    if (hasFetchedSubjects.current) return;
    hasFetchedSubjects.current = true;
    const abortController = new AbortController();
    const fetchSubjects = async () => {
      try {
        const res = await api.getSubjects();
        if (res.data?.status === "success" && Array.isArray(res.data.data)) {
          setSubjects(res.data.data);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.log("Failed to load subjects", err);
        }
      }
    };
    void fetchSubjects();
    return () => abortController.abort();
  }, []);

  useEffect(() => {
    if (!watchSubject) {
      setTopics([]);
      setValue("topics", []);
      return;
    }
    const abortController = new AbortController();
    const fetchTopics = async () => {
      try {
        const res = await api.getTopicsBySubject(watchSubject);
        if (res.data?.status === "success" && Array.isArray(res.data.data)) {
          setTopics(res.data.data);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.log("Failed to load topics", err);
        }
      }
    };
    void fetchTopics();
    return () => abortController.abort();
  }, [watchSubject, setValue]);

  useEffect(() => {
    if (!watchTopics || watchTopics.length === 0) {
      setSubTopics([]);
      setValue("sub_topics", []);
      return;
    }
    const abortController = new AbortController();
    const fetchSubTopics = async () => {
      try {
        const res = await api.getSubTopicsByTopics(watchTopics);
        if (res.data?.status === "success" && Array.isArray(res.data.data)) {
          setSubTopics(res.data.data);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.log("Failed to load sub-topics", err);
        }
      }
    };
    void fetchSubTopics();
    return () => abortController.abort();
  }, [watchTopics, setValue]);

  useEffect(() => {
    if (!id) {
      setIsEditMode(false);
      setCurrentTest(null);
      clearQuestions();
      return;
    }
    setIsEditMode(true);
    const abortController = new AbortController();
    const fetchTest = async () => {
      setLoading(true);
      try {
        const res = await api.getTestById(id);
        if (res.data.status && res.data.status === "success") {
          const test = res.data.data;
          setCurrentTest(test);
          setValue("name", test.name || "");
          setValue("subject", test.subject || "");
          setValue("type", test.type || "chapterwise");
          setValue("topics", test.topics || []);
          setValue("sub_topics", test.sub_topics || []);
          setValue("difficulty", test.difficulty || "medium");
          setValue("correct_marks", test.correct_marks || 5);
          setValue("wrong_marks", test.wrong_marks || -1);
          setValue("unattempt_marks", test.unattempt_marks || 0);
          setValue("total_time", test.total_time || 60);
          setValue("total_marks", test.total_marks || 250);
          setValue("total_questions", test.total_questions || 50);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.log("Failed to load test", err);
        }
      } finally {
        setLoading(false);
      }
    };
    void fetchTest();
    return () => abortController.abort();
  }, [id, setValue, setCurrentTest, clearQuestions]);

  const onSubmit = async (data: TestFormData) => {
    setLoading(true);
    try {
      const payload = {
        name: data.name,
        type: data.type,
        subject: data.subject,
        topics: data.topics,
        sub_topics: data.sub_topics || [],
        correct_marks: data.correct_marks,
        wrong_marks: data.wrong_marks,
        unattempt_marks: data.unattempt_marks,
        difficulty: data.difficulty,
        total_time: data.total_time,
        total_marks: data.total_marks,
        total_questions: data.total_questions,
        status: "draft",
      };
      let testId = id;
      if (isEditMode && id) {
        await api.updateTest(id, payload);
      } else {
        const res = await api.createTest(payload);
        if (res.data.status && res.data.status === "success") {
          testId = res.data.data.id;
          setCurrentTest(res.data.data);
        }
      }
      if (testId) navigate(`/test/${testId}/questions`);
    } catch (err: any) {
      console.log(err.response?.data?.message || "Failed to save test");
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="py-16 text-center text-sm text-[#667085]">
        Loading test...
      </div>
    );
  }

  return (
    <section className="space-y-6 text-left">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-[8px] bg-white p-4 sm:p-6 lg:p-8"
      >
        <div className="grid gap-x-8 gap-y-6 lg:grid-cols-2">
          <div>
            <label className={labelClass}>Subject</label>
            <Controller
              name="subject"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  value={field.value}
                  onChange={field.onChange}
                  options={subjects}
                  disabled={loading}
                  error={!!errors.subject}
                />
              )}
            />
            {errors.subject && (
              <p className="mt-1 text-xs text-red-500">
                {errors.subject.message}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Name of Test</label>
            <input
              {...register("name")}
              className="h-12 w-full rounded-[6px] border border-[#d0d5dd] bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#98a2b3] focus:border-[#1B5DEF] focus:ring-2 focus:ring-[#dbe7ff] disabled:bg-[#f9fafb]"
              placeholder="Enter name of Test"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Topic</label>
            <Controller
              name="topics"
              control={control}
              render={({ field }) => {
                const currentValue = field.value?.[0] || "";
                return (
                  <CustomSelect
                    value={currentValue}
                    onChange={(val) => field.onChange(val ? [val] : [])}
                    options={topics}
                    disabled={!watchSubject || loading}
                    error={!!errors.topics}
                  />
                );
              }}
            />
            {errors.topics && (
              <p className="mt-1 text-xs text-red-500">
                {errors.topics.message}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Sub Topic</label>
            <Controller
              name="sub_topics"
              control={control}
              render={({ field }) => {
                const currentValue = field.value?.[0] || "";
                return (
                  <CustomSelect
                    value={currentValue}
                    onChange={(val) => field.onChange(val ? [val] : [])}
                    options={subTopics}
                    disabled={
                      !watchTopics || watchTopics.length === 0 || loading
                    }
                  />
                );
              }}
            />
          </div>

          <div>
            <label className={labelClass}>Duration (Minutes)</label>
            <input
              {...register("total_time")}
              type="number"
              className="h-12 w-full rounded-[6px] border border-[#d0d5dd] bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#98a2b3] focus:border-[#1B5DEF] focus:ring-2 focus:ring-[#dbe7ff] disabled:bg-[#f9fafb]"
              placeholder="Enter the time"
            />
            {errors.total_time && (
              <p className="mt-1 text-xs text-red-500">
                {errors.total_time.message}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Test Difficulty Level</label>
            <div className="flex min-h-12 flex-wrap items-center gap-x-8 gap-y-3">
              {["easy", "medium", "difficult"].map((difficulty) => (
                <label
                  key={difficulty}
                  className="flex items-center gap-2 text-sm font-medium capitalize text-[#344054]"
                >
                  <input
                    {...register("difficulty")}
                    type="radio"
                    value={difficulty}
                    className="h-4 w-4 accent-[#1B5DEF]"
                  />
                  {difficulty}
                </label>
              ))}
            </div>
            {errors.difficulty && (
              <p className="mt-1 text-xs text-red-500">
                {errors.difficulty.message}
              </p>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-sm font-semibold text-[#111827]">
            Marking Scheme:
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="mb-2 block text-xs font-medium text-[#667085]">
                Wrong Answer
              </label>
              <input
                {...register("wrong_marks")}
                type="number"
                className="h-12 w-full rounded-[6px] border border-[#d0d5dd] bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#98a2b3] focus:border-[#1B5DEF] focus:ring-2 focus:ring-[#dbe7ff] disabled:bg-[#f9fafb]"
              />
              {errors.wrong_marks && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.wrong_marks.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-[#667085]">
                Unattempted
              </label>
              <input
                {...register("unattempt_marks")}
                type="number"
                className="h-12 w-full rounded-[6px] border border-[#d0d5dd] bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#98a2b3] focus:border-[#1B5DEF] focus:ring-2 focus:ring-[#dbe7ff] disabled:bg-[#f9fafb]"
              />
              {errors.unattempt_marks && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.unattempt_marks.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-[#667085]">
                Correct Answer
              </label>
              <input
                {...register("correct_marks")}
                type="number"
                className="h-12 w-full rounded-[6px] border border-[#d0d5dd] bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#98a2b3] focus:border-[#1B5DEF] focus:ring-2 focus:ring-[#dbe7ff] disabled:bg-[#f9fafb]"
              />
              {errors.correct_marks && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.correct_marks.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-[#667085]">
                No of Questions
              </label>
              <input
                {...register("total_questions")}
                type="number"
                className="h-12 w-full rounded-[6px] border border-[#d0d5dd] bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#98a2b3] focus:border-[#1B5DEF] focus:ring-2 focus:ring-[#dbe7ff] disabled:bg-[#f9fafb]"
                placeholder="Ex: 50"
              />
              {errors.total_questions && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.total_questions.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-[#98a2b3]">
                Total Marks
              </label>
              <input
                {...register("total_marks")}
                type="number"
                className="h-12 w-full rounded-[6px] border border-[#d0d5dd] bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#98a2b3] focus:border-[#1B5DEF] focus:ring-2 focus:ring-[#dbe7ff] disabled:bg-[#f9fafb]"
                placeholder="Ex: 250"
              />
              {errors.total_marks && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.total_marks.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="h-11 rounded-[6px] px-6 text-sm font-semibold text-[#1B5DEF] transition hover:bg-[#f0f5ff]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="h-11 rounded-[6px] bg-[#1B5DEF] px-8 text-sm font-semibold text-white transition hover:bg-[#164cc5] disabled:opacity-70"
          >
            {isSubmitting || loading ? "Loading..." : "Next"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreateEditTestPage;
