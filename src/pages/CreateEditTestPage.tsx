import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { api } from '../api/endpoints';
import { useTestStore } from '../store/testStore';
import type { Subject, SubTopic, Topic } from '../types';

const numericField = (message: string) => z.coerce.number({ error: message });

const testSchema = z.object({
  name: z.string().min(1, 'Test name is required'),
  subject: z.string().min(1, 'Subject is required'),
  type: z.string().min(1, 'Test type is required'),
  topics: z.array(z.string()).min(1, 'At least one topic is required'),
  sub_topics: z.array(z.string()).optional(),
  difficulty: z.string().min(1, 'Difficulty is required'),
  correct_marks: numericField('Correct marks is required').min(0, 'Must be 0 or more'),
  wrong_marks: numericField('Wrong marks is required'),
  unattempt_marks: numericField('Unattempted marks is required'),
  total_time: numericField('Duration is required').min(1, 'Time must be at least 1 minute'),
  total_marks: numericField('Total marks is required').min(1, 'Total marks must be at least 1'),
  total_questions: numericField('Question count is required').min(1, 'At least 1 question'),
});

type TestFormInput = z.input<typeof testSchema>;
type TestFormData = z.output<typeof testSchema>;

const fieldClass =
  'h-12 w-full rounded-[6px] border border-[#d0d5dd] bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#98a2b3] focus:border-[#1B5DEF] focus:ring-2 focus:ring-[#dbe7ff] disabled:bg-[#f9fafb]';

const labelClass = 'mb-2 block text-sm font-semibold text-[#111827]';

const CreateEditTestPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setCurrentTest, clearQuestions } = useTestStore();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
 console.log("subjects", subjects);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TestFormInput, unknown, TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      name: '',
      subject: '',
      type: 'chapterwise',
      topics: [],
      sub_topics: [],
      difficulty: 'medium',
      correct_marks: 5,
      wrong_marks: -1,
      unattempt_marks: 0,
      total_time: 60,
      total_marks: 250,
      total_questions: 50,
    },
  });

  const watchSubject = watch('subject');
  const watchTopics = watch('topics');

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.getSubjects();
        console.log('Subjects fetched:', res.data.data);
        if (res.data.success) setSubjects(res.data.data || []);
      } catch (err) {
        console.log('Failed to load subjects', err);
      }
    };
    void fetchSubjects();
  }, []);

  useEffect(() => {
    if (!watchSubject) {
      setTopics([]);
      setValue('topics', []);
      return;
    }

    const fetchTopics = async () => {
      try {
        const res = await api.getTopicsBySubject(watchSubject);
        if (res.data.success) setTopics(res.data.data || []);
      } catch (err) {
        console.log('Failed to load topics', err);
      }
    };
    void fetchTopics();
  }, [watchSubject, setValue]);

  useEffect(() => {
    if (!watchTopics || watchTopics.length === 0) {
      setSubTopics([]);
      setValue('sub_topics', []);
      return;
    }

    const fetchSubTopics = async () => {
      try {
        const res = await api.getSubTopicsByTopics(watchTopics);
        if (res.data.success) setSubTopics(res.data.data || []);
      } catch (err) {
        console.log('Failed to load sub-topics', err);
      }
    };
    void fetchSubTopics();
  }, [watchTopics, setValue]);

  useEffect(() => {
    if (!id) {
      setIsEditMode(false);
      setCurrentTest(null);
      clearQuestions();
      return;
    }

    setIsEditMode(true);
    const fetchTest = async () => {
      setLoading(true);
      try {
        const res = await api.getTestById(id);
        if (res.data.success) {
          const test = res.data.data;
          setCurrentTest(test);
          setValue('name', test.name || '');
          setValue('subject', test.subject || '');
          setValue('type', test.type || 'chapterwise');
          setValue('topics', test.topics || []);
          setValue('sub_topics', test.sub_topics || []);
          setValue('difficulty', test.difficulty || 'medium');
          setValue('correct_marks', test.correct_marks || 5);
          setValue('wrong_marks', test.wrong_marks || -1);
          setValue('unattempt_marks', test.unattempt_marks || 0);
          setValue('total_time', test.total_time || 60);
          setValue('total_marks', test.total_marks || 250);
          setValue('total_questions', test.total_questions || 50);
        }
      } catch (err) {
        console.log('Failed to load test', err);
      } finally {
        setLoading(false);
      }
    };
    void fetchTest();
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
        status: null,
      };

      let testId = id;
      if (isEditMode && id) {
        await api.updateTest(id, payload);
      } else {
        const res = await api.createTest(payload);
        if (res.data.success) {
          testId = res.data.data.id;
          setCurrentTest(res.data.data);
        }
      }

      if (testId) navigate(`/test/${testId}/questions`);
    } catch (err: any) {
      console.log(err.response?.data?.message || 'Failed to save test');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return <div className="py-16 text-center text-sm text-[#667085]">Loading test...</div>;
  }

  return (
    <section className="space-y-6 text-left">
      <form onSubmit={handleSubmit(onSubmit)} className="rounded-[8px] bg-white p-4 sm:p-6 lg:p-8">
        <div className="grid gap-x-8 gap-y-6 lg:grid-cols-2">
          <div>
            <label className={labelClass}>Subject</label>
            <select {...register('subject')} className={fieldClass} disabled={loading}>
              <option value="">Choose from Drop-down</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Name of Test</label>
            <input {...register('name')} className={fieldClass} placeholder="Enter name of Test" />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Topic</label>
            <select
              {...register('topics')}
              className={fieldClass}
              disabled={!watchSubject}
              onChange={(event) => {
                const value = event.target.value;
                setValue('topics', value ? [value] : []);
              }}
            >
              <option value="">Choose from Drop-down</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
            {errors.topics && <p className="mt-1 text-xs text-red-500">{errors.topics.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Sub Topic</label>
            <select
              {...register('sub_topics')}
              className={fieldClass}
              disabled={!watchTopics || watchTopics.length === 0}
              onChange={(event) => {
                const value = event.target.value;
                setValue('sub_topics', value ? [value] : []);
              }}
            >
              <option value="">Choose from Drop-down</option>
              {subTopics.map((subTopic) => (
                <option key={subTopic.id} value={subTopic.id}>
                  {subTopic.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Duration (Minutes)</label>
            <input {...register('total_time')} type="number" className={fieldClass} placeholder="Enter the time" />
            {errors.total_time && <p className="mt-1 text-xs text-red-500">{errors.total_time.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Test Difficulty Level</label>
            <div className="flex min-h-12 flex-wrap items-center gap-x-8 gap-y-3">
              {['easy', 'medium', 'difficult'].map((difficulty) => (
                <label key={difficulty} className="flex items-center gap-2 text-sm font-medium capitalize text-[#344054]">
                  <input
                    {...register('difficulty')}
                    type="radio"
                    value={difficulty}
                    className="h-4 w-4 accent-[#1B5DEF]"
                  />
                  {difficulty}
                </label>
              ))}
            </div>
            {errors.difficulty && <p className="mt-1 text-xs text-red-500">{errors.difficulty.message}</p>}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-sm font-semibold text-[#111827]">Marking Scheme:</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="mb-2 block text-xs font-medium text-[#667085]">Wrong Answer</label>
              <input {...register('wrong_marks')} type="number" className={fieldClass} />
              {errors.wrong_marks && <p className="mt-1 text-xs text-red-500">{errors.wrong_marks.message}</p>}
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-[#667085]">Unattempted</label>
              <input {...register('unattempt_marks')} type="number" className={fieldClass} />
              {errors.unattempt_marks && (
                <p className="mt-1 text-xs text-red-500">{errors.unattempt_marks.message}</p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-[#667085]">Correct Answer</label>
              <input {...register('correct_marks')} type="number" className={fieldClass} />
              {errors.correct_marks && <p className="mt-1 text-xs text-red-500">{errors.correct_marks.message}</p>}
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-[#667085]">No of Questions</label>
              <input
                {...register('total_questions')}
                type="number"
                className={fieldClass}
                placeholder="Ex: 50"
              />
              {errors.total_questions && (
                <p className="mt-1 text-xs text-red-500">{errors.total_questions.message}</p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-[#98a2b3]">Total Marks</label>
              <input {...register('total_marks')} type="number" className={fieldClass} placeholder="Ex: 250" />
              {errors.total_marks && <p className="mt-1 text-xs text-red-500">{errors.total_marks.message}</p>}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="h-11 rounded-[6px] px-6 text-sm font-semibold text-[#1B5DEF] transition hover:bg-[#f0f5ff]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="h-11 rounded-[6px] bg-[#1B5DEF] px-8 text-sm font-semibold text-white transition hover:bg-[#164cc5] disabled:opacity-70"
          >
            {isSubmitting || loading ? 'Loading...' : 'Next'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreateEditTestPage;
