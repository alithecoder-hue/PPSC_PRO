'use client';

import { API_BASE } from '@/lib/api';
import { authFetch } from '@/lib/authFetch';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Briefcase, 
  Calendar, 
  Award, 
  Lock, 
  ChevronRight, 
  Flame, 
  ShieldCheck, 
  RefreshCw, 
  Star,
  Users,
  CheckCircle2,
  Building2,
  Bookmark,
  GraduationCap
} from 'lucide-react';
import styles from './jobs.module.css';

export default function JobsPage() {
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackedIds, setTrackedIds] = useState<Set<number>>(new Set());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [trackingLoading, setTrackingLoading] = useState<number | null>(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDept, setActiveDept] = useState('All');
  const [activeDifficulty, setActiveDifficulty] = useState('All');
  const [activeUrgency, setActiveUrgency] = useState('All');

  useEffect(() => {
    fetch(API_BASE + '/api/public/jobs')
      .then(res => res.json())
      .then(data => { 
        setActiveJobs(data); 
        setLoading(false); 
      })
      .catch(err => { 
        console.error(err); 
        setError('Failed to load jobs'); 
        setLoading(false); 
      });

    // Check login + load tracked jobs
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token) {
      setIsLoggedIn(true);
      if (role === 'PREMIUM') setIsPremium(true);
      authFetch(`${API_BASE}/api/premium/tracked-jobs`)
        .then(r => r.json())
        .then((data: any[]) => {
          if (Array.isArray(data)) setTrackedIds(new Set(data.map(j => j.id)));
        })
        .catch(() => {});
    }
  }, []);

  const toggleTrack = async (jobId: number) => {
    if (trackingLoading) return;
    setTrackingLoading(jobId);
    try {
      if (trackedIds.has(jobId)) {
        await authFetch(`${API_BASE}/api/premium/tracked-jobs/${jobId}`, { method: 'DELETE' });
        setTrackedIds(prev => { const s = new Set(prev); s.delete(jobId); return s; });
      } else {
        await authFetch(`${API_BASE}/api/premium/tracked-jobs`, {
          method: 'POST',
          body: JSON.stringify({ jobId }),
        });
        setTrackedIds(prev => new Set(prev).add(jobId));
      }
    } catch (e) {
      console.error(e);
    } finally { 
      setTrackingLoading(null); 
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setActiveDept('All');
    setActiveDifficulty('All');
    setActiveUrgency('All');
  };

  // Map database jobs to match required properties
  const processedJobs = activeJobs.map((job: any) => {
    const today = new Date();
    const deadline = new Date(job.deadline);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      id: job.id,
      title: job.title,
      department: job.organization || 'PPSC',
      vacancies: job.vacancies || 1,
      deadline: deadline.toLocaleDateString(),
      requirements: job.description,
      isUrgent: diffDays <= 7 && deadline > today,
      difficulty: job.difficulty || 5,
      applyLink: job.applyLink
    };
  });

  // Filter Logic
  const filteredJobs = processedJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.requirements.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDept = activeDept === 'All' || job.department === activeDept;
    
    let matchesDiff = true;
    if (activeDifficulty === 'Easy') matchesDiff = job.difficulty <= 4;
    else if (activeDifficulty === 'Medium') matchesDiff = job.difficulty > 4 && job.difficulty <= 7;
    else if (activeDifficulty === 'Hard') matchesDiff = job.difficulty > 7;

    const matchesUrgency = activeUrgency === 'All' || 
                           (activeUrgency === 'Urgent' && job.isUrgent);

    return matchesSearch && matchesDept && matchesDiff && matchesUrgency;
  });

  const uniqueDepts = ['All', ...Array.from(new Set(processedJobs.map(j => j.department))).sort()];

  return (
    <div className={styles.pageWrapper}>
      {/* 1. Dark Header Section */}
      <header className={styles.darkHeader}>
        <div className={styles.darkHeaderInner}>
          <div className={styles.badgeCapsule}>
            <Briefcase size={13} className={styles.badgeIcon} />
            <span>PPSC JOBS BOARD</span>
          </div>

          <h1 className={styles.title}>
            Active PPSC <span className={styles.highlight}>Jobs</span>
          </h1>

          <p className={styles.subtitle}>
            Find your next career move and start targeted preparation immediately. These high-tier government jobs are currently accepting applications.
          </p>

          {/* Stats Row */}
          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <div className={styles.statIconRing}>
                <Users size={18} />
              </div>
              <div className={styles.statTextCol}>
                <span className={styles.statVal}>1,200+</span>
                <span className={styles.statLbl}>Active Vacancies</span>
              </div>
            </div>

            <div className={styles.statBox}>
              <div className={styles.statIconRing}>
                <Building2 size={18} />
              </div>
              <div className={styles.statTextCol}>
                <span className={styles.statVal}>15+</span>
                <span className={styles.statLbl}>Departments</span>
              </div>
            </div>

            <div className={styles.statBox}>
              <div className={styles.statIconRing}>
                <CheckCircle2 size={18} />
              </div>
              <div className={styles.statTextCol}>
                <span className={styles.statVal}>100%</span>
                <span className={styles.statLbl}>Verified Adverts</span>
              </div>
            </div>

            <div className={styles.statBox}>
              <div className={styles.statIconRing}>
                <Flame size={18} />
              </div>
              <div className={styles.statTextCol}>
                <span className={styles.statVal}>Daily</span>
                <span className={styles.statLbl}>Live Updates</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Floating Search & Filter Section */}
      <section className={styles.filterSectionWrapper}>
        <div className={styles.filterCard}>
          <div className={styles.searchBarRow}>
            <div className={styles.searchInputContainer}>
              <Search size={18} className={styles.searchIcon} />
              <input 
                type="text" 
                className={styles.searchInput} 
                placeholder="Search for a post or department (e.g., Inspector, S&GAD...)" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className={styles.searchBtn}>Search</button>
            <button className={styles.resetBtn} onClick={resetFilters}>
              <RefreshCw size={15} />
              <span>Reset Filters</span>
            </button>
          </div>

          <div className={styles.selectsRow}>
            <div className={styles.selectCol}>
              <label className={styles.selectLabel}>DEPARTMENT</label>
              <select 
                className={styles.filterSelect}
                value={activeDept}
                onChange={(e) => setActiveDept(e.target.value)}
              >
                {uniqueDepts.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
              </select>
            </div>

            <div className={styles.selectCol}>
              <label className={styles.selectLabel}>PREP DIFFICULTY</label>
              <select 
                className={styles.filterSelect}
                value={activeDifficulty}
                onChange={(e) => setActiveDifficulty(e.target.value)}
              >
                <option value="All">All Difficulty</option>
                <option value="Easy">Easy (≤ 4/10)</option>
                <option value="Medium">Medium (5-7/10)</option>
                <option value="Hard">Hard (≥ 8/10)</option>
              </select>
            </div>

            <div className={styles.selectCol}>
              <label className={styles.selectLabel}>URGENCY</label>
              <select 
                className={styles.filterSelect}
                value={activeUrgency}
                onChange={(e) => setActiveUrgency(e.target.value)}
              >
                <option value="All">All Timeline</option>
                <option value="Urgent">Closing Soon (≤ 7 Days)</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Light Theme Content Area */}
      <main className={styles.lightContent}>
        {/* Browse by Department */}
        <section className={styles.sectionArea}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Browse by Department</h2>
            <Link href="/classroom" className={styles.sectionLink}>
              <span>View All Departments</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className={styles.sliderContainer}>
            <div className={styles.sliderTrack}>
              {/* Dept Card 1: S&GAD */}
              <div className={`${styles.deptCard} ${styles.sgadCard}`}>
                <div className={styles.deptIconWrapper}>
                  <div className={`${styles.emblemSquare} ${styles.sgadBg}`}>
                    <Building2 size={24} className={styles.emblemIcon} />
                  </div>
                </div>
                <div className={styles.deptInfo}>
                  <h3 className={styles.deptName}>S&GAD</h3>
                  <p className={styles.vacanciesCount}>Services & General Admin</p>
                </div>
                <div className={styles.deptTags}>
                  <span className={styles.deptTag}>High-Tier</span>
                  <span className={styles.deptTag}>Assistant</span>
                </div>
                <Link href="/jobs?dept=S%26GAD" className={styles.exploreLink}>
                  Explore Jobs <ChevronRight size={14} />
                </Link>
              </div>

              {/* Dept Card 2: Police */}
              <div className={`${styles.deptCard} ${styles.policeCard}`}>
                <div className={styles.deptIconWrapper}>
                  <div className={`${styles.emblemSquare} ${styles.policeBg}`}>
                    <ShieldCheck size={24} className={styles.emblemIcon} />
                  </div>
                </div>
                <div className={styles.deptInfo}>
                  <h3 className={styles.deptName}>Punjab Police</h3>
                  <p className={styles.vacanciesCount}>Sub-Inspector & ASI</p>
                </div>
                <div className={styles.deptTags}>
                  <span className={styles.deptTag}>Uniformed</span>
                  <span className={styles.deptTag}>Physical Test</span>
                </div>
                <Link href="/jobs?dept=Punjab+Police" className={styles.exploreLink}>
                  Explore Jobs <ChevronRight size={14} />
                </Link>
              </div>

              {/* Dept Card 3: Board of Revenue */}
              <div className={`${styles.deptCard} ${styles.revenueCard}`}>
                <div className={styles.deptIconWrapper}>
                  <div className={`${styles.emblemSquare} ${styles.revenueBg}`}>
                    <Bookmark size={24} className={styles.emblemIcon} />
                  </div>
                </div>
                <div className={styles.deptInfo}>
                  <h3 className={styles.deptName}>Board of Revenue</h3>
                  <p className={styles.vacanciesCount}>Tehsildar & Patwari</p>
                </div>
                <div className={styles.deptTags}>
                  <span className={styles.deptTag}>Administrative</span>
                  <span className={styles.deptTag}>GK Focus</span>
                </div>
                <Link href="/jobs?dept=Board+of+Revenue" className={styles.exploreLink}>
                  Explore Jobs <ChevronRight size={14} />
                </Link>
              </div>

              {/* Dept Card 4: Education */}
              <div className={`${styles.deptCard} ${styles.eduCard}`}>
                <div className={styles.deptIconWrapper}>
                  <div className={`${styles.emblemSquare} ${styles.eduBg}`}>
                    <GraduationCap size={24} className={styles.emblemIcon} />
                  </div>
                </div>
                <div className={styles.deptInfo}>
                  <h3 className={styles.deptName}>Education Dept</h3>
                  <p className={styles.vacanciesCount}>Lecturers & Educators</p>
                </div>
                <div className={styles.deptTags}>
                  <span className={styles.deptTag}>Academic</span>
                  <span className={styles.deptTag}>Subject Specific</span>
                </div>
                <Link href="/jobs?dept=Education+Department" className={styles.exploreLink}>
                  Explore Jobs <ChevronRight size={14} />
                </Link>
              </div>
            </div>
            <button className={styles.sliderArrow} title="Next">
              <ChevronRight size={20} />
            </button>
          </div>
        </section>

        {/* Active Openings List */}
        <section className={`${styles.sectionArea} ${styles.jobsListSection}`}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Active Job Openings</h2>
            <span className={styles.resultsBadge}>{filteredJobs.length} Jobs found</span>
          </div>

          <div className={styles.jobsListStack}>
            {loading && <div className={styles.statusBox}>Loading active job postings...</div>}
            {error && <div className={styles.errorBox}>Error fetching jobs: {error}</div>}
            
            {!loading && filteredJobs.map((job: any) => (
              <div key={job.id} className={styles.listItemRow}>
                <div className={styles.listItemLeft}>
                  <div className={styles.listItemTypeBadge}>PPSC</div>
                  <div className={styles.listItemVacanciesBadge}>{job.vacancies} Posts</div>
                </div>

                <div className={styles.listItemMiddle}>
                  <div className={styles.listItemTitleRow}>
                    <h4 className={styles.listItemTitle}>{job.title}</h4>
                    {job.isUrgent && (
                      <span className={`${styles.listItemTag} ${styles.urgentTag}`}>
                        Closing Soon
                      </span>
                    )}
                  </div>
                  <p className={styles.listItemSub}>{job.department}</p>
                  
                  <div className={styles.eligibilityBlock}>
                    <strong>Eligibility:</strong> {job.requirements}
                  </div>

                  <div className={styles.listItemMeta}>
                    <span className={styles.metaLabelItem}>
                      <Calendar size={13} /> Deadline: <span className={job.isUrgent ? styles.urgentText : ''}>{job.deadline}</span>
                    </span>
                    <span className={styles.metaLabelItem}>
                      <Award size={13} /> Prep Diff: {job.difficulty}/10
                    </span>
                  </div>
                </div>

                <div className={styles.listItemRight}>
                  <div className={styles.actionRow}>
                    <Link 
                      href={`/classroom?mode=study&job=${job.id}`} 
                      className={styles.prepBtn}
                    >
                      Prepare Post
                    </Link>
                    <a 
                      href={job.applyLink || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={styles.infoBtn}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Official Ad
                    </a>
                    {isLoggedIn && (
                      <button
                        onClick={() => toggleTrack(job.id)}
                        disabled={trackingLoading === job.id}
                        className={`${styles.trackBtn} ${trackedIds.has(job.id) ? styles.tracked : ''}`}
                        title={trackedIds.has(job.id) ? 'Remove from tracked jobs' : 'Track this job'}
                      >
                        {trackingLoading === job.id ? '…' : (
                          <Star 
                            size={18} 
                            fill={trackedIds.has(job.id) ? '#F59E0B' : 'none'} 
                            strokeWidth={trackedIds.has(job.id) ? 0 : 2}
                          />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {!loading && filteredJobs.length === 0 && (
              <div className={styles.noResultsBox}>
                <p>No active jobs match your filters. Try resetting filters.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
