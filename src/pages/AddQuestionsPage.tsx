import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTestStore } from '../store/testStore';
import { api } from '../api/endpoints';
import type { Question, Topic, SubTopic } from '../types';

const AddQuestionsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTest, questions, setQuestions, addQuestion, removeQuestion } = useTestStore();
  const [submitting, setSubmitting] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      question: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correct_option: 'option1' as const,
      explanation: '',
      difficulty: 'medium',
      topic: '',
      sub_topic: '',
      media_url: '',
    },
  });

  const watchTopic = watch('topic');

  useEffect(() => {
    if (!currentTest?.subject) return;
    const fetchTopics = async () => {
      try {
        const res = await api.getTopicsBySubject(currentTest.subject);
        if (res.data.success) setTopics(res.data.data || []);
      } catch (err) {
        console.log('Failed to load topics', 'error');
      }
    };
    fetchTopics();
  }, [currentTest?.subject]);

  useEffect(() => {
    if (!watchTopic) {
      setSubTopics([]);
      setValue('sub_topic', '');
      return;
    }
    const fetchSubTopics = async () => {
      try {
        const res = await api.getSubTopicsByTopic(watchTopic);
        if (res.data.success) setSubTopics(res.data.data || []);
      } catch (err) {
        console.log('Failed to load sub-topics', 'error');
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
      type: 'mcq',
      question: data.question,
      option1: data.option1,
      option2: data.option2,
      option3: data.option3,
      option4: data.option4,
      correct_option: data.correct_option,
      explanation: data.explanation || '',
      difficulty: data.difficulty || 'medium',
      topic: data.topic || '',
      sub_topic: data.sub_topic || '',
      media_url: data.media_url || '',
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
    setValue('question', q.question);
    setValue('option1', q.option1);
    setValue('option2', q.option2);
    setValue('option3', q.option3);
    setValue('option4', q.option4);
    setValue('correct_option', q.correct_option as 'option1');
    setValue('explanation', q.explanation || '');
    setValue('difficulty', q.difficulty || 'medium');
    setValue('topic', q.topic || '');
    setValue('sub_topic', q.sub_topic || '');
    setValue('media_url', q.media_url || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    reset();
  };

  const handleSaveAndContinue = async () => {
    if (questions.length === 0) {
      console.log('Please add at least one question', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const questionData = questions.map((q) => ({
        type: q.type,
        question: q.question,
        option1: q.option1,
        option2: q.option2,
        option3: q.option3,
        option4: q.option4,
        correct_option: q.correct_option,
        explanation: q.explanation || '',
        difficulty: q.difficulty || 'medium',
        test_id: id,
        topic: q.topic || '',
        sub_topic: q.sub_topic || '',
        media_url: q.media_url || '',
      }));

      await api.bulkCreateQuestions(questionData);
      navigate(`/test/${id}/preview`);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save questions';
      console.log(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate('/')} className="text-[#64748b] hover:text-[#0f172a] transition">
          <i className="fas fa-arrow-left"></i>
        </button>
        <h1 className="text-2xl font-bold text-[#0f172a]">Add Questions</h1>
      </div>

      {currentTest && (
        <div className="bg-white rounded-xl border border-[#e9edf2] p-4 mb-6 flex flex-wrap items-center gap-4 text-sm">
          <span className="font-medium text-[#0f172a]">{currentTest.name}</span>
          <span className="text-[#64748b]">|</span>
          <span className="text-[#64748b]">Subject: {currentTest.subject || '-'}</span>
          <span className="text-[#64748b] hidden sm:inline">|</span>
          <span className="text-[#64748b] hidden sm:inline">
            Questions: {questions.length}/{currentTest.total_questions || 0}
          </span>
          <span className="ml-auto text-xs bg-[#eef2ff] text-[#4f46e5] px-3 py-1 rounded-full">
            {Math.max((currentTest.total_questions || 0) - questions.length, 0)} remaining
          </span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#e9edf2] p-6 mb-6">
        <h3 className="font-semibold text-[#0f172a] mb-4">
          {editingIndex !== null ? 'Edit Question' : 'Add New Question'}
        </h3>
        <form onSubmit={handleSubmit(onSubmitQuestion)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1e293b] mb-1">Question Text *</label>
            <textarea
              {...register('question', { required: 'Question is required' })}
              className={`w-full p-3 border rounded-lg text-sm min-h-[80px] ${errors.question ? 'border-red-500' : 'border-[#e2e8f0]'}`}
              placeholder="Type your question here..."
            />
            {errors.question && <p className="text-red-500 text-xs mt-1">{errors.question.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1e293b] mb-1">Option A *</label>
              <input
                {...register('option1', { required: 'Option A is required' })}
                className={`w-full p-3 border rounded-lg text-sm ${errors.option1 ? 'border-red-500' : 'border-[#e2e8f0]'}`}
                placeholder="Type Option here"
              />
              {errors.option1 && <p className="text-red-500 text-xs mt-1">{errors.option1.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1e293b] mb-1">Option B *</label>
              <input
                {...register('option2', { required: 'Option B is required' })}
                className={`w-full p-3 border rounded-lg text-sm ${errors.option2 ? 'border-red-500' : 'border-[#e2e8f0]'}`}
                placeholder="Type Option here"
              />
              {errors.option2 && <p className="text-red-500 text-xs mt-1">{errors.option2.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1e293b] mb-1">Option C *</label>
              <input
                {...register('option3', { required: 'Option C is required' })}
                className={`w-full p-3 border rounded-lg text-sm ${errors.option3 ? 'border-red-500' : 'border-[#e2e8f0]'}`}
                placeholder="Type Option here"
              />
              {errors.option3 && <p className="text-red-500 text-xs mt-1">{errors.option3.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1e293b] mb-1">Option D *</label>
              <input
                {...register('option4', { required: 'Option D is required' })}
                className={`w-full p-3 border rounded-lg text-sm ${errors.option4 ? 'border-red-500' : 'border-[#e2e8f0]'}`}
                placeholder="Type Option here"
              />
              {errors.option4 && <p className="text-red-500 text-xs mt-1">{errors.option4.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1e293b] mb-1">Correct Option *</label>
              <select {...register('correct_option')} className="w-full p-3 border border-[#e2e8f0] rounded-lg text-sm">
                <option value="option1">A</option>
                <option value="option2">B</option>
                <option value="option3">C</option>
                <option value="option4">D</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1e293b] mb-1">Difficulty</label>
              <select {...register('difficulty')} className="w-full p-3 border border-[#e2e8f0] rounded-lg text-sm">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="difficult">Difficult</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1e293b] mb-1">Topic</label>
              <select {...register('topic')} className="w-full p-3 border border-[#e2e8f0] rounded-lg text-sm">
                <option value="">Select Topic</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1e293b] mb-1">Sub Topic</label>
              <select
                {...register('sub_topic')}
                className="w-full p-3 border border-[#e2e8f0] rounded-lg text-sm"
                disabled={!watchTopic}
              >
                <option value="">Select Sub Topic</option>
                {subTopics.map((st) => (
                  <option key={st.id} value={st.id}>{st.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1e293b] mb-1">Explanation (Optional)</label>
            <textarea
              {...register('explanation')}
              className="w-full p-3 border border-[#e2e8f0] rounded-lg text-sm min-h-[60px]"
              placeholder="Add solution/explanation here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1e293b] mb-1">Media URL (Optional)</label>
            <input
              {...register('media_url')}
              className="w-full p-3 border border-[#e2e8f0] rounded-lg text-sm"
              placeholder="https://example.com/image.png"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="btn-primary flex items-center gap-2">
              <i className="fas fa-plus"></i>
              {editingIndex !== null ? 'Update Question' : 'Add Question'}
            </button>
            {editingIndex !== null && (
              <button type="button" onClick={handleCancelEdit} className="btn-secondary">
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[#0f172a]">Added Questions ({questions.length})</h3>
        </div>
        {questions.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl border border-[#e9edf2] text-[#94a3b8] text-sm">
            <i className="fas fa-question-circle text-3xl mb-2 block"></i>
            No questions added yet.
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div key={idx} className="question-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium bg-[#eef2ff] text-[#4f46e5] px-2 py-0.5 rounded-full">
                        Q{idx + 1}
                      </span>
                      <span className="text-xs text-[#94a3b8]">{q.difficulty || 'medium'}</span>
                    </div>
                    <p className="text-[#0f172a] font-medium text-sm">{q.question}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {['option1', 'option2', 'option3', 'option4'].map((opt, i) => (
                        <span key={opt} className={`option-tag ${q.correct_option === opt ? 'correct' : ''}`}>
                          {String.fromCharCode(65 + i)}. {q[opt as keyof Question] as string}
                        </span>
                      ))}
                    </div>
                    {q.explanation && (
                      <p className="text-xs text-[#64748b] mt-1">
                        <i className="fas fa-lightbulb text-[#f59e0b] mr-1"></i>
                        {q.explanation}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleEditQuestion(idx)}
                      className="p-1.5 text-[#64748b] hover:text-[#4f46e5] rounded-lg hover:bg-[#eef2ff] transition"
                      title="Edit"
                    >
                      <i className="fas fa-pen text-sm"></i>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Remove this question?')) {
                          removeQuestion(idx);
                        }
                      }}
                      className="p-1.5 text-[#64748b] hover:text-[#ef4444] rounded-lg hover:bg-[#fee2e2] transition"
                      title="Remove"
                    >
                      <i className="fas fa-trash text-sm"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        <button onClick={() => navigate('/')} className="btn-secondary flex items-center gap-2">
          <i className="fas fa-times"></i> Exit Test Creation
        </button>
        <button
          onClick={handleSaveAndContinue}
          className="btn-primary flex items-center gap-2"
          disabled={submitting || questions.length === 0}
        >
          {submitting ? <span className="spinner w-4 h-4"></span> : null}
          {submitting ? 'Saving...' : 'Save & Continue'}
        </button>
      </div>
    </div>
  );
};

export default AddQuestionsPage;
