'use client';

import { API_BASE } from '@/lib/api';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Check, X, Filter, BookOpen, Layers, Target, FileText, Sun, Moon, ArrowLeft, Info, List, Menu, Bookmark, Settings, Zap, Flame, Send } from 'lucide-react';
import { authFetch } from '@/lib/authFetch';
import styles from '../learning-board.module.css';

const CustomDropdown = ({ label, options, selected, onSelect, icon: Icon }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((o: any) => o.value === selected);

  return (
    <div className={styles.dropdownWrapper} ref={dropdownRef}>
      <div className={`${styles.dropdownTrigger} ${isOpen ? styles.active : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0, overflow: 'hidden' }}>
          {Icon && <Icon size={16} className={styles.dropdownIcon} style={{ flexShrink: 0 }} />}
          <span>{selectedOption ? selectedOption.label : label}</span>
        </div>
        <ChevronDown size={16} className={styles.dropdownIcon} style={{ flexShrink: 0 }} />
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div className={styles.dropdownMenu} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className={`${styles.dropdownItem} ${!selected ? styles.selected : ''}`} onClick={() => { onSelect(''); setIsOpen(false); }}>
              All {label}s {!selected && <Check size={16} />}
            </div>
            {options.map((opt: any) => (
              <div key={opt.value} className={`${styles.dropdownItem} ${selected === opt.value ? styles.selected : ''}`} onClick={() => { onSelect(opt.value); setIsOpen(false); }}>
                {opt.label} {selected === opt.value && <Check size={16} />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


function ClassroomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'study';

  const [isLightMode, setIsLightMode] = useState(false);
  const [activeTab, setActiveTab] = useState('study');
  const [searchQuery, setSearchQuery] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [readerFontSize, setReaderFontSize] = useState(18);

  useEffect(() => {
    setUserRole(localStorage.getItem('role'));
    const savedSize = localStorage.getItem('classroom_reader_font_size');
    if (savedSize) setReaderFontSize(Number(savedSize));
  }, []);

  const handleFontSizeChange = (size: number) => {
    const newSize = Math.min(28, Math.max(14, size));
    setReaderFontSize(newSize);
    localStorage.setItem('classroom_reader_font_size', String(newSize));
  };
  
  const [categories, setCategories] = useState<any[]>([]);
  const [preferredSubjectIds, setPreferredSubjectIds] = useState<number[]>([]);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState(searchParams.get('subject') || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const [topics, setTopics] = useState<any[]>([]);
  const [expandedTopicId, setExpandedTopicId] = useState<number | null>(null);
  const [activeSubtopic, setActiveSubtopic] = useState<any>(null);
  
  const [subtopicContent, setSubtopicContent] = useState<any>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Exam Engine State
  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: string]: string}>({});
  const [timeRemaining, setTimeRemaining] = useState(15 * 60);
  const [mcqTimeLeft, setMcqTimeLeft] = useState(15);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isTimeless, setIsTimeless] = useState(false);
  const [testModeTitle, setTestModeTitle] = useState('');
  const [isFetchingTest, setIsFetchingTest] = useState(false);
  
  const [savedMcqs, setSavedMcqs] = useState<Set<number>>(new Set());

  // Custom Test Modal State
  const [isCustomTestModalOpen, setIsCustomTestModalOpen] = useState(false);
  const [customTestMode, setCustomTestMode] = useState('random'); // random, single, multi
  const [customTestSubjects, setCustomTestSubjects] = useState<number[]>([]);
  const [customTestLimit, setCustomTestLimit] = useState(20);
  const [customTestDifficulty, setCustomTestDifficulty] = useState('any');

  const startCustomTest = async (selections: any[], timeless: boolean, title: string, durationInSeconds?: number) => {
    setIsFetchingTest(true);
    setTestModeTitle(title);
    setIsTimeless(timeless);
    setIsSubmitted(false);
    setSelectedAnswers({});
    setCurrentMcqIndex(0);
    setScore(0);
    setActiveTab('test');
    setSubtopicContent(null);
    setActiveSubtopic({ name: title, parentTopic: "Custom Exam", level: "variable" });

    try {
      const res = await fetch(API_BASE + '/api/mcqs/custom-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selections })
      });

      if (res.ok) {
        const data = await res.json();
        const formattedMcqs = data.mcqs.map((m: any) => ({
          ...m,
          options: m.options ? (typeof m.options === 'string' ? JSON.parse(m.options) : m.options) : []
        }));
        setTopicMcqs(formattedMcqs);
        setTimeRemaining(timeless ? 0 : (durationInSeconds ? durationInSeconds : formattedMcqs.length * 60));
      } else {
        alert('Failed to generate test. Please try again.');
        setTopicMcqs([]);
      }
    } catch (err) {
      console.error(err);
      setTopicMcqs([]);
    } finally {
      setIsFetchingTest(false);
    }
  };

  const handleCustomTestSubmit = () => {
    if (!userRole || (userRole !== 'PREMIUM' && userRole !== 'ADMIN')) {
      alert('The Custom Test Generator is a Premium feature. You will be redirected to the subscription page.');
      router.push('/subscription');
      return;
    }

    let config: any[] = [];
    if (customTestMode === 'random') {
      config = [{ categoryId: null, limit: customTestLimit, difficulty: customTestDifficulty }];
    } else if (customTestMode === 'single') {
      if (customTestSubjects.length === 0) {
        alert('Please select a subject.');
        return;
      }
      config = [{ categoryId: customTestSubjects[0], limit: customTestLimit, difficulty: customTestDifficulty }];
    } else if (customTestMode === 'multi') {
      if (customTestSubjects.length === 0) {
        alert('Please select at least one subject.');
        return;
      }
      const limitPerSubject = Math.max(1, Math.floor(customTestLimit / customTestSubjects.length));
      config = customTestSubjects.map(id => ({ categoryId: id, limit: limitPerSubject, difficulty: customTestDifficulty }));
    }

    setIsCustomTestModalOpen(false);
    startCustomTest(config, false, 'Custom Practice Exam');
  };

  const handleQuickMode = (limit: number, difficulty: string, timeless: boolean, duration?: number) => {
    let selections: any[] = [];
    if (preferredSubjectIds.length > 0) {
      const limitPerSubject = Math.max(1, Math.floor(limit / preferredSubjectIds.length));
      selections = preferredSubjectIds.map(id => ({ categoryId: id, limit: limitPerSubject, difficulty }));
    } else {
      selections = [{ categoryId: null, limit, difficulty }];
    }
    const modeName = timeless ? 'Timeless Practice' : (difficulty === 'hard' ? 'Challenge Mode' : 'Quick 30');
    startCustomTest(selections, timeless, modeName, duration);
  };

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await authFetch(API_BASE + '/api/premium/saved-mcqs');
        if (res.ok) {
          const data = await res.json();
          setSavedMcqs(new Set(data.map((m: any) => m.id)));
        }
      } catch (e) { /* ignore */ }
    };
    fetchSaved();
  }, []);

  const handleSaveMcq = async (mcqId: number) => {
    try {
      if (savedMcqs.has(mcqId)) {
        await authFetch(`${API_BASE}/api/premium/saved-mcqs/${mcqId}`, { method: 'DELETE' });
        setSavedMcqs(prev => { const next = new Set(prev); next.delete(mcqId); return next; });
      } else {
        await authFetch(`${API_BASE}/api/premium/saved-mcqs`, {
          method: 'POST',
          body: JSON.stringify({ mcqId }),
        });
        setSavedMcqs(prev => new Set(prev).add(mcqId));
      }
    } catch (e) { console.error('Failed to save MCQ', e); }
  };
  
  // Post/Job State
  const [selectedPost, setSelectedPost] = useState('');
  const postOptions = [
    { value: 'lecturer-cs', label: 'Lecturer CS' },
    { value: 'sub-inspector', label: 'Sub-Inspector' },
    { value: 'tehsildar', label: 'Tehsildar' },
  ];
  
  // Year Filter State
  const [selectedYear, setSelectedYear] = useState('');
  const yearOptions = [
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' },
    { value: '2021', label: '2021' },
    { value: '2020', label: '2020' },
  ];
  
  // Complexity State
  const [selectedComplexity, setSelectedComplexity] = useState('');
  const complexityOptions = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'expert', label: 'Expert' },
  ];
  
  // Tab Mode Options for Mobile
  const tabOptions = [
    { value: 'study', label: 'Study Mode' },
    { value: 'practice', label: 'Practice Mode' },
    { value: 'test', label: 'Test Mode' },
  ];
  
  const [topicMcqs, setTopicMcqs] = useState<any[]>([]);

  const totalMcqs = topicMcqs.length;
  const currentMcq = topicMcqs[currentMcqIndex];
  const attemptedCount = Object.keys(selectedAnswers).length;
  const progressDashoffset = 402 - (402 * attemptedCount) / totalMcqs;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        let prefs: number[] = [];
        const token = localStorage.getItem('token');
        if (token) {
          const profileRes = await fetch(API_BASE + '/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (profileRes.ok) {
            const profile = await profileRes.json();
            prefs = profile.preferredSubjectIds || [];
            setPreferredSubjectIds(prefs);
          }
        }

        const res = await fetch(API_BASE + '/api/mcqs/categories');
        if (res.ok) {
          const data = await res.json();
          let mapped = data.map((d: any) => ({ ...d, slug: d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }));
          
          if (prefs.length > 0) {
            mapped = mapped.filter((cat: any) => prefs.includes(cat.id));
          }

          setCategories(mapped);
          if (selectedCategorySlug) {
            const cat = mapped.find((c: any) => c.slug === selectedCategorySlug);
            if (cat) setSelectedCategoryId(cat.id);
          }
        }
      } catch (err) { console.error(err); }
    };
    fetchCategories();
  }, [selectedCategorySlug]);

  useEffect(() => {
    if (!selectedCategoryId) return setTopics([]);
    const fetchTopics = async () => {
      try {
        const res = await fetch(API_BASE + `/api/mcqs/topics/category/${selectedCategoryId}`);
        if (res.ok) setTopics(await res.json());
      } catch (e) { console.error(e); }
    };
    fetchTopics();
  }, [selectedCategoryId]);

  useEffect(() => {
    if (!activeSubtopic) return;
    const fetchContentAndMcqs = async () => {
      setContentLoading(true);
      try {
        const [contentRes, mcqsRes] = await Promise.all([
          fetch(API_BASE + `/api/mcqs/subtopic-content/${activeSubtopic.id}`),
          fetch(API_BASE + `/api/mcqs?topicId=${activeSubtopic.id}&limit=10`)
        ]);
        
        if (contentRes.ok) setSubtopicContent(await contentRes.json());
        else setSubtopicContent(null);

        if (mcqsRes.ok) {
          const fetchedMcqs = await mcqsRes.json();
          const mapped = fetchedMcqs.map((m: any) => ({
            id: m.id,
            text: m.question,
            options: [
              { id: 'A', text: m.optionA },
              { id: 'B', text: m.optionB },
              { id: 'C', text: m.optionC },
              { id: 'D', text: m.optionD },
            ],
            correct: m.correctOption,
            explanation: m.explanation || ''
          }));
          setTopicMcqs(mapped);
          setCurrentMcqIndex(0);
          setSelectedAnswers({});
        } else {
          setTopicMcqs([]);
        }
      } catch (e) { console.error(e); }
      setContentLoading(false);
    };
    fetchContentAndMcqs();
  }, [activeSubtopic]);

  // RESTORED TIMERS
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTab === 'test' && activeSubtopic && !isTimeless && !isSubmitted) {
      if (timeRemaining > 0) {
        interval = setInterval(() => setTimeRemaining(prev => prev - 1), 1000);
      } else {
        handleExamSubmit();
      }
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, activeSubtopic, timeRemaining, isTimeless, isSubmitted]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mode === 'speed-drill' && activeTab === 'practice' && activeSubtopic && mcqTimeLeft > 0) {
      interval = setInterval(() => setMcqTimeLeft(prev => prev - 1), 1000);
    } else if (mode === 'speed-drill' && mcqTimeLeft === 0) {
      handleNextMcq();
    }
    return () => clearInterval(interval);
  }, [mode, activeTab, activeSubtopic, mcqTimeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const categoryOptions = categories.map((c: any) => ({ value: c.slug, label: c.name }));

  const filteredTopics = topics.filter((t: any) => {
    return t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           (t.topics && t.topics.some((sub: any) => sub.name.toLowerCase().includes(searchQuery.toLowerCase())));
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategorySlug('');
    setSelectedCategoryId(null);
    setSelectedPost('');
    setSelectedYear('');
    setSelectedComplexity('');
    setTopics([]);
  };

  const handleDailyTestClick = () => {
    if (userRole === 'PREMIUM' || userRole === 'ADMIN') {
      let config: any[] = [];
      if (preferredSubjectIds.length > 0) {
        const limitPerSubject = Math.max(1, Math.floor(100 / preferredSubjectIds.length));
        config = preferredSubjectIds.map(id => ({ categoryId: id, limit: limitPerSubject, difficulty: 'any' }));
      } else {
        config = [{ categoryId: null, limit: 100, difficulty: 'any' }];
      }
      startCustomTest(config, false, 'Daily Premium Exam', 5400);
    } else {
      alert('The Daily Test is a Premium feature. You will be redirected to the subscription page.');
      router.push('/subscription');
    }
  };

  // EXAM HANDLERS
  const handleOptionSelect = (mcqId: string, optionId: string) => {
    if (activeTab === 'practice' && selectedAnswers[mcqId]) return;
    setSelectedAnswers(prev => ({ ...prev, [mcqId]: optionId }));
  };

  const handleNextMcq = () => {
    if (currentMcqIndex < totalMcqs - 1) {
      setCurrentMcqIndex(prev => prev + 1);
      setMcqTimeLeft(15);
    }
  };

  const handlePrevMcq = () => {
    if (currentMcqIndex > 0) setCurrentMcqIndex(prev => prev - 1);
  };

  const handleExamSubmit = async () => {
    setIsSubmitted(true);
    let correctCount = 0;
    
    topicMcqs.forEach((mcq: any) => {
      if (selectedAnswers[mcq.id] === mcq.correct) {
        correctCount++;
      }
    });
    
    setScore(correctCount);

    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(API_BASE + '/api/mcqs/exam/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            examId: null,
            score: correctCount,
            total: topicMcqs.length
          })
        });
      }
    } catch (err) {
      console.error('Failed to submit score', err);
    }
  };

  const toggleTopic = (topicId: number) => {
    setExpandedTopicId(expandedTopicId === topicId ? null : topicId);
  };

  const getLevelBadgeClass = (lvl: string) => {
    switch(lvl) {
      case 'beginner': return styles.levelbeginner || 'bg-green-500 text-green-100';
      case 'moderate': return styles.levelmoderate || 'bg-yellow-500 text-yellow-100';
      case 'expert': return styles.levelexpert || 'bg-red-500 text-red-100';
      default: return 'bg-gray-500 text-gray-100';
    }
  };

  return (
    <div className={`${styles.boardContainer} ${styles.classroomRoot} ${isLightMode ? styles.lightMode : ''}`}>
      
      <motion.div className={styles.filterBarWrapper} style={{ marginBottom: '20px', top: '0px', maxWidth: '100%', width: '100%', margin: '0 0 20px 0' }} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className={styles.filterGroupLeft}>
          <button onClick={() => router.back()} className={styles.backBtn} style={{ background: isLightMode ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.05)', color: 'inherit', padding: '0 12px', height: '44px' }}>
            <ArrowLeft size={18} />
          </button>
          
          <div className={`${styles.boardTabs} ${styles.desktopTabsOnly}`} style={{ display: 'flex', background: '#E9EDF3', borderRadius: '14px', padding: '4px' }}>
            <button className={`${styles.boardTab} ${activeTab === 'study' ? styles.active : ''}`} onClick={() => setActiveTab('study')} style={{ color: activeTab === 'study' ? '#FFF' : '#475569', border: 'none', background: activeTab === 'study' ? 'linear-gradient(135deg, #F59E0B, #FF5500)' : 'transparent', padding: '8px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Study</button>
            <button className={`${styles.boardTab} ${activeTab === 'practice' ? styles.active : ''}`} onClick={() => setActiveTab('practice')} style={{ color: activeTab === 'practice' ? '#FFF' : '#475569', border: 'none', background: activeTab === 'practice' ? 'linear-gradient(135deg, #F59E0B, #FF5500)' : 'transparent', padding: '8px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Practice</button>
            <button className={`${styles.boardTab} ${activeTab === 'test' ? styles.active : ''}`} onClick={() => setActiveTab('test')} style={{ color: activeTab === 'test' ? '#FFF' : '#475569', border: 'none', background: activeTab === 'test' ? 'linear-gradient(135deg, #F59E0B, #FF5500)' : 'transparent', padding: '8px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Test</button>
          </div>

          <div className={styles.mobileTabsOnly}>
            <CustomDropdown label="Mode" options={tabOptions} selected={activeTab} 
              onSelect={(val: string) => val && setActiveTab(val)} icon={Layers}
            />
          </div>
        </div>

        <div className={`${styles.filterGroupCenter} ${isMobileMenuOpen ? styles.mobileMenuOpen : styles.mobileMenuClosed}`} style={{ gap: '16px' }}>
          <CustomDropdown label="Jobs" options={postOptions} selected={selectedPost} 
            onSelect={(val: string) => setSelectedPost(val)} icon={Target}
          />
          <CustomDropdown label="Year" options={yearOptions} selected={selectedYear} 
            onSelect={(val: string) => setSelectedYear(val)} icon={FileText}
          />
          <CustomDropdown label="Subject" options={categoryOptions} selected={selectedCategorySlug} 
            onSelect={(val: string) => {
              setSelectedCategorySlug(val);
              const cat = categories.find(c => c.slug === val);
              setSelectedCategoryId(cat ? cat.id : null);
              setActiveSubtopic(null);
              setSubtopicContent(null);
            }} icon={BookOpen}
          />
          <CustomDropdown label="Level" options={complexityOptions} selected={selectedComplexity} 
            onSelect={(val: string) => setSelectedComplexity(val)} icon={Filter}
          />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', color: '#9CA3AF' }} />
            <input 
              type="text" 
              placeholder="Search topics..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: '#FFFFFF', border: '1px solid #E6EAF0', borderRadius: '12px', padding: '10px 10px 10px 36px', color: '#0F1E33', height: '44px', outline: 'none', width: '100%', minWidth: 0 }}
            />
          </div>
        </div>

        <div className={styles.filterGroupRight}>
          <AnimatePresence>
            {(searchQuery || selectedCategorySlug || selectedPost || selectedYear || selectedComplexity) ? (
              <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className={styles.filterClearBtn} onClick={clearFilters}>
                <X size={16} /> Clear
              </motion.button>
            ) : null}
          </AnimatePresence>
          <button className={styles.themeToggleBtn} onClick={() => setIsLightMode(!isLightMode)}>
            {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button className={styles.hamburgerBtn} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu size={18} />
          </button>
        </div>
      </motion.div>

      <motion.div className={styles.twoPaneLayout} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ flex: 1, minHeight: 0, maxWidth: '100%', width: '100%', margin: 0 }}>
        
        {/* LEFT PANE */}
        {(activeTab === 'study' || !activeSubtopic) ? (
          <div className={styles.sidebarPane} style={{ flex: 1, width: 'auto', height: '100%', overflowY: 'auto', boxSizing: 'border-box' }}>
            <div className={`${styles.sidebarHeader} ${styles.sidebarHeaderSticky}`}>
              {!selectedCategoryId ? 'Available Subjects' : 'Available Topics'}
            </div>
            {!selectedCategoryId ? (
              categories.length > 0 ? (
                categories.map((cat: any) => (
                  <div key={cat.id} className={styles.topicWrapper}>
                    <div className={styles.sidebarTopic} onClick={() => {
                      setSelectedCategorySlug(cat.slug);
                      setSelectedCategoryId(cat.id);
                    }}>
                      <div className={styles.topicTitle}><BookOpen size={18} /> {cat.name}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6B7280' }}>
                  <Filter size={32} style={{ opacity: 0.3, margin: '0 auto 16px auto' }} />
                  <p>Loading subjects...</p>
                </div>
              )
            ) : filteredTopics.length > 0 ? (
              filteredTopics.map((topic: any) => {
                const isExpanded = expandedTopicId === topic.id;
                return (
                  <div key={topic.id} className={styles.topicWrapper}>
                    <div className={`${styles.sidebarTopic} ${isExpanded ? styles.active : ''}`} onClick={() => toggleTopic(topic.id)}>
                      <div className={styles.topicTitle}><BookOpen size={18} /> {topic.name}</div>
                      <ChevronDown size={18} className={styles.topicChevron} />
                    </div>
                    <AnimatePresence>
                      {isExpanded && topic.topics && (
                        <motion.div className={styles.subtopicList} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                          {topic.topics.map((sub: any) => (
                            <div key={sub.id} className={`${styles.subtopicItem} ${activeSubtopic?.id === sub.id ? styles.active : ''}`} onClick={() => setActiveSubtopic({ ...sub, parentTopic: topic.name })}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                <span>{sub.name}</span>
                                {sub.level && <span className={`${styles.levelBadge} ${getLevelBadgeClass(sub.level)}`}>{sub.level.toUpperCase()}</span>}
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6B7280' }}><p>No topics found.</p></div>
            )}
          </div>
        ) : (
          /* RESTORED EXAM ENGINE SIDEBAR */
          <div className={styles.sidebarPane} style={{ flex: 1, width: 'auto', height: '100%', overflowY: 'auto', boxSizing: 'border-box' }}>
            <div className={`${styles.sidebarHeader} ${styles.sidebarHeaderSticky}`}>Session Status</div>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {activeTab === 'test' && (
                <div className={styles.timerBox}>
                  <div className={styles.timerLabel}>Session Time Remaining</div>
                  <div className={styles.timerTime}>{isTimeless ? '∞' : formatTime(timeRemaining)}</div>
                </div>
              )}
              {mode === 'speed-drill' && activeTab === 'practice' && (
                <div className={styles.timerBox} style={{ background: 'linear-gradient(135deg, #FF9900, #FF3366)' }}>
                  <div className={styles.timerLabel} style={{ color: '#FFF' }}>MCQ Time Limit</div>
                  <div className={styles.timerTime} style={{ color: '#FFF' }}>{mcqTimeLeft}s</div>
                </div>
              )}
              <div className={styles.progressContainer}>
                <svg className={styles.progressSvg} viewBox="0 0 160 160">
                  <circle className={styles.progressCircleBg} cx="80" cy="80" r="64"></circle>
                  <circle className={styles.progressCirclePath} cx="80" cy="80" r="64" strokeDasharray="402" strokeDashoffset={progressDashoffset}></circle>
                </svg>
                <div className={styles.progressText}>
                  <span className={styles.progressValue}>{attemptedCount}</span>
                  <span className={styles.progressLabel}>/ {totalMcqs} MCQs</span>
                </div>
              </div>
              {activeTab === 'practice' && currentMcq && selectedAnswers[currentMcq.id] && (
                <motion.div className={styles.explanationBox} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <div className={styles.explanationHeader}><Check size={18} /> Explanation</div>
                  <div className={styles.explanationBody}>{currentMcq.explanation || 'The selected option is correct based on general principles.'}</div>
                </motion.div>
              )}
              <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
                <button onClick={() => { setActiveSubtopic(null); setSelectedAnswers({}); }} style={{ width: '100%', padding: '12px', background: '#F3F4F6', color: '#374151', border: '1px solid #E6EAF0', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Quit Session
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT PANE */}
        <div className={styles.mainPane} style={{ flex: 3, width: 'auto', height: '100%', overflow: 'hidden', boxSizing: 'border-box', position: 'relative', display: 'flex', flexDirection: 'column', padding: 0 }}>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '50px' }}>
          {activeSubtopic ? (
            activeTab === 'study' ? (
              <motion.div key={activeSubtopic.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div className={styles.contentHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h2 className={styles.contentTitle}>{activeSubtopic.name}</h2>
                    <div className={styles.contentMeta}>
                      <div className={styles.metaPill}><Layers size={14} color="#B45309" /> {activeSubtopic.parentTopic}</div>
                      <div className={styles.metaPill}><Target size={14} color="#16A34A" /> {activeSubtopic.level.toUpperCase()}</div>
                    </div>
                  </div>

                  {/* Interactive Reader Controls (Font Size Adjuster) */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: isLightMode ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.04)',
                    padding: '4px 12px', borderRadius: '24px',
                    border: `1px solid ${isLightMode ? 'rgba(217,119,6,0.3)' : 'rgba(217,119,6,0.3)'}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <span style={{ fontSize: '0.75rem', color: isLightMode ? '#6B7280' : '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginRight: '2px' }}>Font</span>
                    <button
                      onClick={() => handleFontSizeChange(readerFontSize - 2)}
                      disabled={readerFontSize <= 14}
                      title="Decrease font size (-)"
                      style={{
                        width: '24px', height: '24px', borderRadius: '50%',
                        background: isLightMode ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.08)',
                        border: 'none', color: isLightMode ? '#1F2937' : '#1F2937',
                        cursor: readerFontSize <= 14 ? 'not-allowed' : 'pointer',
                        fontWeight: 800, fontSize: '1rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: readerFontSize <= 14 ? 0.3 : 1, transition: 'all 0.15s ease'
                      }}
                    >
                      -
                    </button>
                    <span style={{ fontSize: '0.85rem', color: isLightMode ? '#D97706' : '#D97706', fontWeight: 800, minWidth: '36px', textAlign: 'center' }}>
                      {readerFontSize}px
                    </span>
                    <button
                      onClick={() => handleFontSizeChange(readerFontSize + 2)}
                      disabled={readerFontSize >= 28}
                      title="Increase font size (+)"
                      style={{
                        width: '24px', height: '24px', borderRadius: '50%',
                        background: isLightMode ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.08)',
                        border: 'none', color: isLightMode ? '#1F2937' : '#1F2937',
                        cursor: readerFontSize >= 28 ? 'not-allowed' : 'pointer',
                        fontWeight: 800, fontSize: '1rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: readerFontSize >= 28 ? 0.3 : 1, transition: 'all 0.15s ease'
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className={styles.contentBody} style={{ padding: '20px', overflowY: 'auto' }}>
                  {contentLoading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>Loading study material...</div>
                  ) : subtopicContent ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', lineHeight: 1.6 }}>
                      {subtopicContent.bodyText && (() => {
                        const hasUrdu = subtopicContent.isUrdu || /[\u0600-\u06FF]/.test(subtopicContent.bodyText);
                        return (
                          <div
                            dir={hasUrdu ? 'rtl' : 'ltr'}
                            style={{
                              fontSize: `${readerFontSize}px`,
                              lineHeight: hasUrdu ? 2.4 : 1.9,
                              color: isLightMode ? '#1F2937' : '#1F2937'
                            }}
                            className={`${styles.richTextContent}${hasUrdu ? ' urdu-text' : ''}`}
                            dangerouslySetInnerHTML={{ __html: subtopicContent.bodyText }}
                          />
                        );
                      })()}
                      {subtopicContent.keyPoints && subtopicContent.keyPoints.length > 0 && (() => {
                        const hasUrdu = subtopicContent.isUrdu || (subtopicContent.keyPoints[0] && /[\u0600-\u06FF]/.test(subtopicContent.keyPoints[0]));
                        return (
                          <div style={{ background: 'rgba(16, 185, 129, 0.05)', borderLeft: hasUrdu ? undefined : '4px solid #10b981', borderRight: hasUrdu ? '4px solid #10b981' : undefined, padding: '20px', borderRadius: '4px', direction: hasUrdu ? 'rtl' : 'ltr' }}>
                            <h3 style={{ margin: '0 0 15px 0', color: '#15803D', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: hasUrdu ? 'flex-end' : 'flex-start' }}><Info size={20} /> {hasUrdu ? 'اہم نکات' : 'Key Takeaways'}</h3>
                            <ul style={{ margin: 0, paddingLeft: hasUrdu ? 0 : '20px', paddingRight: hasUrdu ? '20px' : 0, fontFamily: hasUrdu ? "'Noto Naskh Arabic', serif" : 'inherit', lineHeight: hasUrdu ? 2.2 : 1.6, textAlign: hasUrdu ? 'right' : 'left' }}>
                              {subtopicContent.keyPoints.map((pt: string, i: number) => <li key={i}>{pt}</li>)}
                            </ul>
                          </div>
                        );
                      })()}
                      {subtopicContent.tables && subtopicContent.tables.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                          {subtopicContent.tables.map((tbl: any, idx: number) => (
                            <div key={idx} style={{ overflowX: 'auto', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E6EAF0' }}>
                              <h4 style={{ margin: 0, padding: '15px', borderBottom: '1px solid #E6EAF0' }}>{tbl.title}</h4>
                              <table className={styles.dataTable} style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead><tr>{tbl.headers.map((h: string, i: number) => <th key={i} style={{ padding: '12px 15px', textAlign: 'left', color: '#B45309' }}>{h}</th>)}</tr></thead>
                                <tbody>{tbl.rows.map((row: any[], i: number) => <tr key={i}>{row.map((cell: string, j: number) => <td key={j} style={{ padding: '12px 15px', borderBottom: '1px solid #EEF2F7' }}>{cell}</td>)}</tr>)}</tbody>
                              </table>
                            </div>
                          ))}
                        </div>
                      )}
                      {subtopicContent.references && subtopicContent.references.length > 0 && (
                        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #E6EAF0' }}>
                          <h4 style={{ margin: '0 0 10px 0', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px' }}><List size={16} /> References</h4>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>{subtopicContent.references.map((ref: any, i: number) => <div key={i} style={{ background: '#F3F4F6', padding: '5px 10px', borderRadius: '4px', fontSize: '0.85rem' }}><strong style={{ color: '#B45309' }}>{ref.label}:</strong> {ref.value}</div>)}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8' }}>
                      <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 20px auto' }} />
                      <p style={{ fontSize: '1.2rem', color: '#0C1B2E' }}>No content written yet.</p>
                      <p>The admin has not added study notes for this subtopic.</p>
                    </div>
                  )}
                </div>
                <div className={styles.contentActions}>
                  <button onClick={() => setActiveTab('practice')} className={styles.actionBtnPrimary}><Target size={18} /> Start Practice Drill</button>
                </div>
              </motion.div>
            ) : (
              /* RESTORED EXAM ENGINE VIEWER */
              isSubmitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <div style={{ background: '#FFFFFF', border: '1px solid #E6EAF0', padding: '40px', borderRadius: '24px', textAlign: 'center', maxWidth: '500px', width: '100%', boxShadow: '0 18px 48px rgba(15, 30, 51, 0.12)' }}>
                    <h2 style={{ color: '#0C1B2E', fontSize: '2rem', marginBottom: '10px' }}>Exam Submitted!</h2>
                    <p style={{ color: '#64748B', marginBottom: '30px' }}>Here is your performance summary for {testModeTitle || activeSubtopic?.name}</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '30px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#16A34A' }}>{score}</div>
                        <div style={{ fontSize: '0.9rem', color: '#64748B' }}>Correct</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#B45309' }}>{Math.round((score / totalMcqs) * 100)}%</div>
                        <div style={{ fontSize: '0.9rem', color: '#64748B' }}>Accuracy</div>
                      </div>
                    </div>
                    
                    <button onClick={() => { setIsSubmitted(false); setActiveTab('study'); }} style={{ background: 'linear-gradient(135deg, #F59E0B, #FF5500)', border: 'none', color: '#FFF', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
                      Back to Study
                    </button>
                  </div>
                </motion.div>
              ) : currentMcq ? (
                <motion.div key={currentMcq.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div className={styles.contentHeader} style={{ marginBottom: '24px', paddingBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className={styles.metaPill} style={{ display: 'inline-flex', marginBottom: '16px' }}>Question {currentMcqIndex + 1} of {totalMcqs}</div>
                      <h2
                        className={styles.mcqQuestion}
                        dir={/[\u0600-\u06FF]/.test(currentMcq.text) ? 'rtl' : 'ltr'}
                        style={/[\u0600-\u06FF]/.test(currentMcq.text) ? {
                          fontFamily: "'Noto Naskh Arabic', 'Noto Nastaliq Urdu', serif",
                          textAlign: 'right', lineHeight: 2.2
                        } : {}}
                      >{currentMcq.text}</h2>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {activeTab === 'test' && (
                        <button 
                          onClick={handleExamSubmit}
                          style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid #FECACA', color: '#DC2626', padding: '10px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          <Send size={18} /> <span className={styles.hideOnMobile}>Submit Early</span>
                        </button>
                      )}
                      <button 
                        onClick={() => handleSaveMcq(currentMcq.id)}
                        title={savedMcqs.has(currentMcq.id) ? "Remove from Vault" : "Save to Vault"}
                        style={{ background: savedMcqs.has(currentMcq.id) ? '#8B5CF6' : '#F8FAFC', border: '1px solid #E6EAF0', color: savedMcqs.has(currentMcq.id) ? '#fff' : '#64748B', padding: '10px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, transition: 'all 0.2s' }}
                      >
                        <Bookmark size={18} fill={savedMcqs.has(currentMcq.id) ? '#fff' : 'none'} />
                      </button>
                    </div>
                  </div>
                  <div className={styles.mcqOptionsList}>
                    {currentMcq.options.map((option: any) => {
                        const isSelected = selectedAnswers[currentMcq.id] === option.id;
                        const isAnswered = !!selectedAnswers[currentMcq.id];
                        const isUrdu = /[\u0600-\u06FF]/.test(option.text || '');
                        let optionClass = styles.mcqOption;
                        if (isSelected) optionClass += ` ${styles.selected}`;
                        if (activeTab === 'practice' && isAnswered) {
                          if (option.id === currentMcq.correct) optionClass += ` ${styles.correct}`;
                          else if (isSelected) optionClass += ` ${styles.incorrect}`;
                          optionClass += ` ${styles.disabled}`;
                        }
                        return (
                          <div
                            key={option.id}
                            className={optionClass}
                            onClick={() => handleOptionSelect(currentMcq.id, option.id)}
                            dir={isUrdu ? 'rtl' : 'ltr'}
                            style={isUrdu ? { fontFamily: "'Noto Naskh Arabic', serif", lineHeight: 2 } : {}}
                          >
                            <div className={styles.optionLabel}>{option.id}</div>
                            <div className={styles.optionText}>{option.text}</div>
                          </div>
                        );
                      })}
                  </div>
                  <div className={styles.mcqControls}>
                    <button className={`${styles.mcqBtn} ${currentMcqIndex === 0 ? styles.disabled : ''}`} onClick={handlePrevMcq}>Previous</button>
                    {activeTab === 'test' && currentMcqIndex === totalMcqs - 1 ? (
                      <button className={`${styles.mcqBtn} ${styles.primary}`} onClick={handleExamSubmit}>Submit Exam</button>
                    ) : (
                      <button className={`${styles.mcqBtn} ${styles.primary} ${currentMcqIndex === totalMcqs - 1 ? styles.disabled : ''}`} onClick={handleNextMcq}>Next Question</button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className={styles.emptyState}><p>No MCQs available for this topic yet.</p></div>
              )
            )
          ) : (
            <div className={styles.emptyState} style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={64} style={{ opacity: 0.2, margin: '0 auto 24px auto' }} />
                <h3 style={{ fontSize: '1.8rem', color: '#0C1B2E', marginBottom: '8px' }}>Select a Topic</h3>
                <p style={{ fontSize: '1.1rem' }}>Please select a subtopic from the Study tab to load content.</p>
              </div>
            </div>
          )}
          </div> {/* End inner scroll container */}

          {/* Main Pane Footer Bar for Premium Users */}
          {(userRole === 'PREMIUM' || userRole === 'ADMIN') && (
            <div className={styles.footerBar} style={{ 
              width: '100%',
              display: 'flex', 
              gap: '16px', 
              justifyContent: 'center',
              padding: '16px 24px',
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(20px)',
              borderTop: '1px solid #E6EAF0',
              zIndex: 10,
              flexWrap: 'nowrap',
              borderBottomLeftRadius: '24px',
              borderBottomRightRadius: '24px',
              overflowX: 'auto'
            }}>
              
              <button 
                onClick={handleDailyTestClick} 
                className={styles.footerBtn}
                style={{ 
                  background: 'linear-gradient(135deg, #F59E0B, #FF5500)', 
                  border: 'none', color: '#FFF', padding: '12px 24px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '0.95rem', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)', flexShrink: 0
                }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(245, 158, 11, 0.6)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.4)'; }}
              >
                <Sun size={20} /> <span className={styles.hideOnMobile}>Daily Exam</span>
              </button>

              <button 
                onClick={() => handleQuickMode(30, 'any', false, 1200)} 
                className={styles.footerBtn}
                style={{ 
                  background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#B45309', padding: '12px 24px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '0.95rem', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', flexShrink: 0
                }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.2)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <Zap size={20} /> <span className={styles.hideOnMobile}>Quick 30</span>
              </button>

              <button 
                onClick={() => handleQuickMode(50, 'any', true)} 
                className={styles.footerBtn}
                style={{ 
                  background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#15803D', padding: '12px 24px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '0.95rem', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', flexShrink: 0
                }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.2)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <Target size={20} /> <span className={styles.hideOnMobile}>Timeless</span>
              </button>

              <button 
                onClick={() => handleQuickMode(50, 'hard', false, 1200)} 
                className={styles.footerBtn}
                style={{ 
                  background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#DC2626', padding: '12px 24px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '0.95rem', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', flexShrink: 0
                }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.2)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <Flame size={20} /> <span className={styles.hideOnMobile}>Challenge</span>
              </button>

              <button 
                onClick={() => setIsCustomTestModalOpen(true)}
                className={styles.footerBtn}
                style={{ 
                  background: '#F8FAFC', border: '1px solid #E6EAF0', color: '#374151', padding: '12px 24px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '0.95rem', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', flexShrink: 0
                }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 255, 255, 0.1)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <Settings size={20} /> <span className={styles.hideOnMobile}>Custom</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Custom Test Configuration Modal */}
      <AnimatePresence>
        {isCustomTestModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCustomTestModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(12, 27, 46, 0.5)', backdropFilter: 'blur(5px)' }} />
            <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} style={{ position: 'relative', background: '#FFFFFF', borderRadius: '16px', padding: '30px', width: '100%', maxWidth: '500px', border: '1px solid #E6EAF0', boxShadow: '0 18px 48px rgba(15, 30, 51, 0.12)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', color: '#0C1B2E', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><Settings size={24} color="#F59E0B" /> Custom Exam Generator</h2>
                <button onClick={() => setIsCustomTestModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}><X size={20} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', color: '#64748B', marginBottom: '8px', fontSize: '0.9rem' }}>Mode</label>
                  <select value={customTestMode} onChange={e => setCustomTestMode(e.target.value)} style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E6EAF0', color: '#0F1E33', padding: '12px', borderRadius: '8px', outline: 'none' }}>
                    <option value="random">Random (All Subjects)</option>
                    <option value="single">Single Subject</option>
                    <option value="multi">Multi Subject</option>
                  </select>
                </div>

                {customTestMode !== 'random' && (
                  <div>
                    <label style={{ display: 'block', color: '#64748B', marginBottom: '8px', fontSize: '0.9rem' }}>Select Subject(s)</label>
                    <select 
                      multiple={customTestMode === 'multi'} 
                      value={customTestMode === 'multi' ? customTestSubjects.map(String) : (customTestSubjects[0] ? String(customTestSubjects[0]) : '')} 
                      onChange={e => {
                        if (customTestMode === 'multi') {
                          const values = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                          setCustomTestSubjects(values);
                        } else {
                          setCustomTestSubjects([parseInt(e.target.value)]);
                        }
                      }} 
                      style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E6EAF0', color: '#0F1E33', padding: '12px', borderRadius: '8px', outline: 'none', height: customTestMode === 'multi' ? '120px' : 'auto' }}
                    >
                      {customTestMode === 'single' && <option value="" disabled>Select a subject</option>}
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {customTestMode === 'multi' && <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '4px' }}>Hold Ctrl/Cmd to select multiple.</div>}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', color: '#64748B', marginBottom: '8px', fontSize: '0.9rem' }}>Total MCQs</label>
                    <input type="number" min="5" max="200" value={customTestLimit} onChange={e => setCustomTestLimit(parseInt(e.target.value) || 20)} style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E6EAF0', color: '#0F1E33', padding: '12px', borderRadius: '8px', outline: 'none' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', color: '#64748B', marginBottom: '8px', fontSize: '0.9rem' }}>Difficulty</label>
                    <select value={customTestDifficulty} onChange={e => setCustomTestDifficulty(e.target.value)} style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E6EAF0', color: '#0F1E33', padding: '12px', borderRadius: '8px', outline: 'none' }}>
                      <option value="any">Mixed (Any)</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <button 
                  onClick={handleCustomTestSubmit} 
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', border: 'none', color: '#FFF', padding: '14px', borderRadius: '10px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', marginTop: '10px' }}
                >
                  Generate Exam
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LearningBoardPage() {
  return (
    <Suspense fallback={<div style={{ color: '#64748B', padding: '40px', textAlign: 'center' }}>Loading Classroom...</div>}>
      <ClassroomContent />
    </Suspense>
  );
}
