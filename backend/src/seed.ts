import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SubtopicDef {
  name: string;
  level: 'beginner' | 'moderate' | 'expert';
}
interface TopicDef {
  name: string;
  subtopics: SubtopicDef[];
}
interface SubjectDef {
  name: string;
  description: string;
  topics: TopicDef[];
}

const SUBJECTS: SubjectDef[] = [
  {
    name: 'General',
    description: 'Mixed questions covering all subjects for overall PPSC exam readiness.',
    topics: [
      { name: 'Mixed Pakistan Knowledge', subtopics: [
        { name: 'Important Dates of Pakistan', level: 'beginner' },
        { name: 'National Symbols of Pakistan', level: 'beginner' },
        { name: 'Records and Firsts of Pakistan', level: 'beginner' },
        { name: 'Famous Quotes of Quaid-e-Azam', level: 'beginner' },
        { name: 'Pakistan at a Glance (Quick Facts)', level: 'beginner' },
      ]},
      { name: 'Mixed General Knowledge', subtopics: [
        { name: 'Capitals and Currencies of the World', level: 'beginner' },
        { name: 'Famous Inventions and Inventors', level: 'beginner' },
        { name: 'World Records (Largest, Smallest, Highest)', level: 'beginner' },
        { name: 'Famous Books and Authors', level: 'moderate' },
        { name: 'Important Days and Dates (World)', level: 'beginner' },
      ]},
      { name: 'Mixed Science Facts', subtopics: [
        { name: 'Important Scientific Terms', level: 'beginner' },
        { name: 'Famous Scientists and Discoveries', level: 'beginner' },
        { name: 'Everyday Science Quick Facts', level: 'beginner' },
        { name: 'Medical Terms and Common Diseases', level: 'moderate' },
        { name: 'Technology Milestones', level: 'moderate' },
      ]},
      { name: 'Mixed Mathematics', subtopics: [
        { name: 'Quick Calculation Tricks', level: 'beginner' },
        { name: 'Number Tricks and Patterns', level: 'beginner' },
        { name: 'Shortcut Methods for MCQs', level: 'moderate' },
        { name: 'Common Formulas Sheet', level: 'moderate' },
      ]},
      { name: 'Mixed Current Affairs', subtopics: [
        { name: 'Important Events of Last 2 Years', level: 'beginner' },
        { name: 'Key International Agreements', level: 'moderate' },
        { name: "Pakistan's Major Milestones", level: 'beginner' },
        { name: 'World Leaders and Their Countries', level: 'beginner' },
      ]},
    ],
  },
  {
    name: 'Pakistan Studies',
    description: 'History, geography, culture, and political development of Pakistan.',
    topics: [
      { name: 'Geography of Pakistan', subtopics: [
        { name: 'Location and Boundaries of Pakistan', level: 'beginner' },
        { name: 'Physical Features (Mountains, Plains, Plateaus, Deserts)', level: 'beginner' },
        { name: 'Major Rivers and Water System (Indus Basin)', level: 'beginner' },
        { name: 'Climate Zones of Pakistan', level: 'moderate' },
        { name: 'Natural Resources of Pakistan', level: 'moderate' },
        { name: 'Provinces and Administrative Divisions', level: 'beginner' },
      ]},
      { name: 'History of Pakistan Movement', subtopics: [
        { name: 'Sir Syed Ahmad Khan and Aligarh Movement', level: 'beginner' },
        { name: 'All India Muslim League (1906)', level: 'beginner' },
        { name: 'Lucknow Pact 1916', level: 'moderate' },
        { name: 'Khilafat Movement', level: 'moderate' },
        { name: 'Simon Commission and Nehru Report', level: 'moderate' },
        { name: 'Allahabad Address 1930 (Allama Iqbal)', level: 'moderate' },
        { name: 'Round Table Conferences', level: 'moderate' },
        { name: 'Pakistan Resolution 1940 (Lahore Resolution)', level: 'beginner' },
        { name: 'Cabinet Mission Plan 1946', level: 'expert' },
        { name: 'Independence and Partition 1947', level: 'beginner' },
      ]},
      { name: 'Founding Fathers', subtopics: [
        { name: 'Quaid-e-Azam Muhammad Ali Jinnah — Life and Role', level: 'beginner' },
        { name: 'Allama Muhammad Iqbal — Vision and Philosophy', level: 'moderate' },
        { name: 'Liaquat Ali Khan — First Prime Minister', level: 'beginner' },
        { name: 'Fatima Jinnah — Mother of the Nation', level: 'beginner' },
        { name: 'Sir Agha Khan III — Role in Muslim League', level: 'moderate' },
      ]},
      { name: 'Constitutional History of Pakistan', subtopics: [
        { name: 'Objectives Resolution 1949', level: 'beginner' },
        { name: 'Constitution of 1956', level: 'moderate' },
        { name: 'Constitution of 1962', level: 'moderate' },
        { name: 'Constitution of 1973 and Key Features', level: 'beginner' },
        { name: 'Martial Laws in Pakistan (1958, 1969, 1977, 1999)', level: 'moderate' },
        { name: 'Major Constitutional Amendments', level: 'expert' },
      ]},
      { name: 'Economy of Pakistan', subtopics: [
        { name: 'Agriculture Sector of Pakistan', level: 'beginner' },
        { name: 'Industrial Sector of Pakistan', level: 'moderate' },
        { name: 'CPEC and Foreign Investment', level: 'moderate' },
        { name: 'Major Exports and Imports of Pakistan', level: 'moderate' },
        { name: 'Economic Challenges and Reforms', level: 'expert' },
      ]},
      { name: 'Culture and Society of Pakistan', subtopics: [
        { name: 'Languages of Pakistan', level: 'beginner' },
        { name: 'Festivals and Traditions of Pakistan', level: 'beginner' },
        { name: 'Famous Personalities of Pakistan', level: 'beginner' },
        { name: 'Education System of Pakistan', level: 'moderate' },
        { name: 'Media in Pakistan', level: 'moderate' },
      ]},
      { name: 'Foreign Policy of Pakistan', subtopics: [
        { name: 'Pakistan-India Relations', level: 'moderate' },
        { name: 'Pakistan-China Relations (CPEC)', level: 'moderate' },
        { name: 'Pakistan-USA Relations', level: 'moderate' },
        { name: 'Pakistan and OIC', level: 'beginner' },
        { name: 'Pakistan and United Nations', level: 'moderate' },
      ]},
    ],
  },
  {
    name: 'Islamic Studies',
    description: 'Teachings of Islam, Quran, Hadith, and Islamic history and values.',
    topics: [
      { name: 'Quran & Tafseer', subtopics: [
        { name: 'Introduction to the Quran', level: 'beginner' },
        { name: 'Makki and Madni Surahs', level: 'beginner' },
        { name: 'Surah Names and Numbers', level: 'beginner' },
        { name: 'Tafseer Basics', level: 'moderate' },
        { name: 'Tajweed Rules', level: 'moderate' },
        { name: 'Famous Mufassireen', level: 'expert' },
      ]},
      { name: 'Hadith & Sunnah', subtopics: [
        { name: 'Introduction to Hadith', level: 'beginner' },
        { name: 'Types of Hadith (Sahih, Hasan, Daif)', level: 'beginner' },
        { name: 'Kutub al-Sittah (Six Major Books)', level: 'moderate' },
        { name: 'Famous Muhaddiseen', level: 'moderate' },
        { name: 'Hadith vs Sunnah Difference', level: 'beginner' },
        { name: 'Isnad and Matn', level: 'expert' },
      ]},
      { name: 'Islamic History', subtopics: [
        { name: 'Life of Prophet Muhammad (PBUH)', level: 'beginner' },
        { name: 'Khulafa e Rashideen', level: 'beginner' },
        { name: 'Umayyad Caliphate', level: 'moderate' },
        { name: 'Abbasid Caliphate', level: 'moderate' },
        { name: 'Muslim Scholars and Scientists', level: 'moderate' },
        { name: 'Islam in the Subcontinent', level: 'moderate' },
        { name: 'Ottoman Empire', level: 'expert' },
      ]},
      { name: 'Fiqh & Islamic Law', subtopics: [
        { name: 'Five Pillars of Islam', level: 'beginner' },
        { name: 'Salah (Prayer) Rules', level: 'beginner' },
        { name: 'Sawm (Fasting) Rules', level: 'beginner' },
        { name: 'Zakat Rules', level: 'moderate' },
        { name: 'Hajj Rules', level: 'moderate' },
        { name: 'Halal and Haram', level: 'beginner' },
        { name: 'Four Schools of Fiqh (Hanafi, Maliki, Shafi, Hanbali)', level: 'expert' },
      ]},
      { name: 'Aqeedah (Islamic Beliefs)', subtopics: [
        { name: 'Tawheed (Oneness of Allah)', level: 'beginner' },
        { name: 'Belief in Angels', level: 'beginner' },
        { name: 'Belief in Prophets', level: 'beginner' },
        { name: 'Belief in Divine Books', level: 'beginner' },
        { name: 'Belief in Day of Judgment', level: 'moderate' },
        { name: 'Belief in Qadar (Destiny)', level: 'moderate' },
      ]},
      { name: 'Prophets & Messengers', subtopics: [
        { name: 'Prophet Adam (AS)', level: 'beginner' },
        { name: 'Prophet Ibrahim (AS)', level: 'beginner' },
        { name: 'Prophet Musa (AS)', level: 'beginner' },
        { name: 'Prophet Isa (AS)', level: 'beginner' },
        { name: 'Prophet Muhammad (PBUH) — Detailed', level: 'moderate' },
        { name: 'Seal of Prophethood', level: 'expert' },
      ]},
      { name: 'Islamic Ethics & Morality', subtopics: [
        { name: 'Honesty and Truthfulness in Islam', level: 'beginner' },
        { name: 'Respect for Parents', level: 'beginner' },
        { name: 'Rights of Neighbors', level: 'beginner' },
        { name: 'Brotherhood in Islam', level: 'beginner' },
        { name: 'Islamic Business Ethics', level: 'moderate' },
        { name: 'Gender Relations in Islam', level: 'moderate' },
      ]},
      { name: 'Islamiat for Non-Muslims (Ethics)', subtopics: [
        { name: 'Comparative Religion Basics', level: 'beginner' },
        { name: 'Universal Moral Values', level: 'beginner' },
        { name: 'Human Rights in Islam', level: 'moderate' },
        { name: 'Justice and Equality in Islam', level: 'moderate' },
      ]},
    ],
  },
  {
    name: 'Current Affairs',
    description: 'Awareness of world events, facts, and recent national/international news.',
    topics: [
      { name: 'Pakistan Current Affairs', subtopics: [
        { name: 'Government Policies and Major Decisions', level: 'beginner' },
        { name: 'Economic Updates (Budget, Inflation, IMF)', level: 'moderate' },
        { name: 'CPEC Latest Developments', level: 'moderate' },
        { name: 'Elections and Political Changes', level: 'moderate' },
        { name: 'Military and Defense Updates', level: 'moderate' },
        { name: 'Supreme Court Major Judgments', level: 'expert' },
      ]},
      { name: 'International Affairs', subtopics: [
        { name: 'USA, China, Russia Relations', level: 'moderate' },
        { name: 'Middle East Conflicts', level: 'moderate' },
        { name: 'Kashmir Issue — Latest Updates', level: 'moderate' },
        { name: 'Afghanistan Situation', level: 'moderate' },
        { name: 'Ukraine-Russia War', level: 'moderate' },
        { name: 'Israel-Palestine Conflict', level: 'moderate' },
      ]},
      { name: 'International Organizations (Current)', subtopics: [
        { name: 'UN Security Council Decisions', level: 'moderate' },
        { name: 'SCO Summits and Outcomes', level: 'moderate' },
        { name: 'OIC Meetings and Resolutions', level: 'moderate' },
        { name: 'SAARC Updates', level: 'beginner' },
        { name: 'Commonwealth Updates', level: 'beginner' },
      ]},
      { name: 'Economy & Trade (Current)', subtopics: [
        { name: 'World Economic Forum Reports', level: 'expert' },
        { name: 'Oil Prices and Global Impact', level: 'moderate' },
        { name: 'Global Inflation Trends', level: 'moderate' },
        { name: 'Trade Wars and Sanctions', level: 'expert' },
        { name: 'Digital Economy and Crypto', level: 'expert' },
      ]},
      { name: 'Science & Technology (Current)', subtopics: [
        { name: 'AI and Machine Learning Developments', level: 'moderate' },
        { name: 'Space Missions (NASA, ISRO, SpaceX)', level: 'moderate' },
        { name: "Pakistan's IT Sector Growth", level: 'moderate' },
        { name: 'Cyber Attacks and Security Issues', level: 'expert' },
        { name: 'Climate Change Agreements (COP)', level: 'moderate' },
      ]},
      { name: 'Sports (Current)', subtopics: [
        { name: 'Cricket — Pakistan Team Performance', level: 'beginner' },
        { name: 'Olympics — Latest Events', level: 'beginner' },
        { name: 'FIFA World Cup Updates', level: 'beginner' },
        { name: 'PSL Updates', level: 'beginner' },
        { name: 'International Awards to Pakistanis', level: 'beginner' },
      ]},
    ],
  },
  {
    name: 'English',
    description: 'Grammar, vocabulary, comprehension, and essay writing skills.',
    topics: [
      { name: 'English Grammar', subtopics: [
        { name: 'Parts of Speech (Noun, Verb, Adjective, Adverb, Pronoun)', level: 'beginner' },
        { name: 'All 12 Tenses with Examples', level: 'beginner' },
        { name: 'Active and Passive Voice', level: 'moderate' },
        { name: 'Direct and Indirect Speech', level: 'moderate' },
        { name: 'Articles (a, an, the)', level: 'beginner' },
        { name: 'Prepositions', level: 'beginner' },
        { name: 'Conjunctions and Conditionals', level: 'moderate' },
        { name: 'Subject-Verb Agreement', level: 'moderate' },
      ]},
      { name: 'Vocabulary', subtopics: [
        { name: 'Synonyms and Antonyms', level: 'beginner' },
        { name: 'One Word Substitution', level: 'moderate' },
        { name: 'Idioms and Phrases', level: 'moderate' },
        { name: 'Homophones and Confusing Words', level: 'moderate' },
        { name: 'Word Formation (Prefix, Suffix)', level: 'moderate' },
        { name: 'Commonly Misspelled Words', level: 'beginner' },
      ]},
      { name: 'Reading Comprehension', subtopics: [
        { name: 'Reading Comprehension Passages', level: 'moderate' },
        { name: 'Inference and Main Idea', level: 'moderate' },
        { name: 'Tone and Purpose of Passage', level: 'expert' },
      ]},
      { name: 'Sentence Structure', subtopics: [
        { name: 'Sentence Correction', level: 'moderate' },
        { name: 'Fill in the Blanks', level: 'beginner' },
        { name: 'Error Detection', level: 'moderate' },
        { name: 'Sentence Completion', level: 'moderate' },
        { name: 'Ordering of Sentences (Para Jumbles)', level: 'expert' },
      ]},
      { name: 'Writing Skills', subtopics: [
        { name: 'Essay Writing (Common PPSC Topics)', level: 'moderate' },
        { name: 'Letter and Application Writing', level: 'moderate' },
        { name: 'Precis Writing', level: 'expert' },
        { name: 'Paragraph Writing', level: 'moderate' },
      ]},
    ],
  },
  {
    name: 'Urdu',
    description: 'Urdu grammar, reading comprehension, and writing proficiency.',
    topics: [
      { name: 'Urdu Grammar', subtopics: [
        { name: 'Ism, Fail, Sifat, Zameer — Parts of Speech', level: 'beginner' },
        { name: 'Wahid Jama — Singular and Plural', level: 'beginner' },
        { name: 'Muzakkar Muannas — Gender in Urdu', level: 'beginner' },
        { name: 'Muhawray aur Zarb ul Amsal — Idioms and Proverbs', level: 'moderate' },
        { name: 'Aarab aur Rumooz Auqaf — Punctuation', level: 'moderate' },
      ]},
      { name: 'Urdu Literature', subtopics: [
        { name: 'Classical Urdu Poetry (Mir, Ghalib, Iqbal, Faiz)', level: 'moderate' },
        { name: 'Famous Urdu Novels and Novelists', level: 'moderate' },
        { name: 'Famous Urdu Dramas', level: 'moderate' },
        { name: 'Short Story Writers (Manto, Bedi, Ismat)', level: 'moderate' },
        { name: 'Urdu Prose Writers', level: 'moderate' },
      ]},
      { name: 'Urdu Comprehension', subtopics: [
        { name: 'Urdu Passage Reading and Understanding', level: 'moderate' },
        { name: 'Summary Writing in Urdu', level: 'moderate' },
        { name: 'Meaning of Difficult Urdu Words', level: 'moderate' },
      ]},
      { name: 'Urdu Composition', subtopics: [
        { name: 'Urdu Essay Writing — Mazmoon Nawisi', level: 'moderate' },
        { name: 'Urdu Letter Writing — Khat Nawisi', level: 'moderate' },
        { name: 'Urdu Application Writing — Darkhwast', level: 'moderate' },
      ]},
      { name: 'Famous Urdu Poets of Pakistan', subtopics: [
        { name: 'Allama Iqbal — Life and Poetry', level: 'beginner' },
        { name: 'Faiz Ahmed Faiz — Life and Poetry', level: 'moderate' },
        { name: 'Ahmad Faraz — Life and Poetry', level: 'moderate' },
        { name: 'Parveen Shakir — Life and Poetry', level: 'moderate' },
        { name: 'Josh Malihabadi — Life and Poetry', level: 'expert' },
      ]},
    ],
  },
  {
    name: 'Everyday Science',
    description: 'Basic concepts of physics, chemistry, biology, and their daily life applications.',
    topics: [
      { name: 'Physics in Daily Life', subtopics: [
        { name: "Laws of Motion (Newton's Laws)", level: 'beginner' },
        { name: 'Gravity and Weight', level: 'beginner' },
        { name: 'Light and Optics (Mirrors, Lenses)', level: 'beginner' },
        { name: 'Sound and Waves', level: 'beginner' },
        { name: 'Electricity and Magnetism', level: 'moderate' },
        { name: 'Heat and Temperature', level: 'beginner' },
        { name: 'Simple Machines', level: 'beginner' },
      ]},
      { name: 'Chemistry in Daily Life', subtopics: [
        { name: 'Atoms, Elements and Compounds', level: 'beginner' },
        { name: 'Acids, Bases and Salts', level: 'beginner' },
        { name: 'Oxidation and Reduction', level: 'moderate' },
        { name: 'Chemical Reactions in Daily Life', level: 'beginner' },
        { name: 'Plastics, Soaps and Detergents', level: 'beginner' },
        { name: 'Air and Water Pollution', level: 'beginner' },
      ]},
      { name: 'Biology in Daily Life', subtopics: [
        { name: 'Human Body Systems (Digestive, Respiratory, Circulatory)', level: 'beginner' },
        { name: 'Diseases and their Causes', level: 'beginner' },
        { name: 'Vitamins and their Deficiencies', level: 'beginner' },
        { name: 'Nutrition and Food', level: 'beginner' },
        { name: 'Plants and Photosynthesis', level: 'beginner' },
        { name: 'Genetics Basics', level: 'moderate' },
      ]},
      { name: 'Environmental Science', subtopics: [
        { name: 'Ecosystem and Food Chain', level: 'beginner' },
        { name: 'Global Warming and Climate Change', level: 'beginner' },
        { name: 'Ozone Layer Depletion', level: 'moderate' },
        { name: 'Renewable and Non-Renewable Energy', level: 'beginner' },
        { name: 'Water Conservation', level: 'beginner' },
      ]},
      { name: 'Health & Medicine', subtopics: [
        { name: 'Common Diseases (Malaria, Dengue, Typhoid, COVID)', level: 'beginner' },
        { name: 'Vaccines and Immunization', level: 'beginner' },
        { name: 'First Aid Basics', level: 'beginner' },
        { name: 'Blood Groups', level: 'beginner' },
        { name: 'Human Nutrition', level: 'beginner' },
      ]},
      { name: 'Space & Universe', subtopics: [
        { name: 'Solar System (Planets, Moon, Sun)', level: 'beginner' },
        { name: 'Stars and Galaxies', level: 'moderate' },
        { name: 'Day and Night and Seasons', level: 'beginner' },
        { name: 'Eclipses (Solar and Lunar)', level: 'beginner' },
        { name: 'Space Exploration Milestones', level: 'moderate' },
      ]},
    ],
  },
  {
    name: 'Basic Mathematics',
    description: 'Arithmetic, algebra, percentages, ratios, and numerical problem-solving.',
    topics: [
      { name: 'Arithmetic', subtopics: [
        { name: 'Number System (Natural, Integer, Rational, Real)', level: 'beginner' },
        { name: 'HCF and LCM', level: 'beginner' },
        { name: 'Fractions and Decimals', level: 'beginner' },
        { name: 'Percentages', level: 'beginner' },
        { name: 'Ratio and Proportion', level: 'beginner' },
        { name: 'Average (Mean)', level: 'beginner' },
        { name: 'Profit, Loss and Discount', level: 'moderate' },
        { name: 'Simple and Compound Interest', level: 'moderate' },
      ]},
      { name: 'Algebra', subtopics: [
        { name: 'Basic Algebraic Expressions', level: 'beginner' },
        { name: 'Linear Equations (One Variable, Two Variables)', level: 'moderate' },
        { name: 'Quadratic Equations', level: 'moderate' },
        { name: 'Factorization', level: 'moderate' },
        { name: 'Simultaneous Equations', level: 'moderate' },
        { name: 'Indices and Surds', level: 'expert' },
      ]},
      { name: 'Geometry', subtopics: [
        { name: 'Lines, Angles and Triangles', level: 'beginner' },
        { name: 'Properties of Circle', level: 'moderate' },
        { name: 'Area and Perimeter (Rectangle, Square, Triangle, Circle)', level: 'beginner' },
        { name: 'Volume and Surface Area (Cube, Cylinder, Cone)', level: 'moderate' },
        { name: 'Pythagoras Theorem', level: 'moderate' },
      ]},
      { name: 'Data Handling', subtopics: [
        { name: 'Mean, Median, Mode', level: 'beginner' },
        { name: 'Bar Graph, Pie Chart, Line Graph', level: 'beginner' },
        { name: 'Probability Basics', level: 'moderate' },
        { name: 'Simple Statistics', level: 'moderate' },
      ]},
      { name: 'Applied Mathematics (Word Problems)', subtopics: [
        { name: 'Time and Work', level: 'moderate' },
        { name: 'Speed, Distance and Time', level: 'moderate' },
        { name: 'Pipes and Cisterns', level: 'moderate' },
        { name: 'Age Problems', level: 'moderate' },
        { name: 'Number Sequences and Patterns', level: 'moderate' },
      ]},
    ],
  },
  {
    name: 'Geography',
    description: 'Physical and political geography of Pakistan and the world.',
    topics: [
      { name: 'Physical Geography', subtopics: [
        { name: "Earth's Structure (Core, Mantle, Crust)", level: 'beginner' },
        { name: 'Landforms (Mountains, Valleys, Plains, Plateaus)', level: 'beginner' },
        { name: 'Volcanoes and Earthquakes', level: 'moderate' },
        { name: 'Types of Rocks', level: 'moderate' },
        { name: 'Atmosphere Layers', level: 'moderate' },
        { name: 'Weather vs Climate', level: 'beginner' },
      ]},
      { name: 'Human Geography', subtopics: [
        { name: 'World Population Distribution', level: 'moderate' },
        { name: 'Urbanization and Migration', level: 'moderate' },
        { name: 'Agriculture Types Worldwide', level: 'moderate' },
        { name: 'Industries and Trade', level: 'moderate' },
        { name: 'Transport and Communication', level: 'beginner' },
      ]},
      { name: 'Geography of Pakistan', subtopics: [
        { name: 'Location and Boundaries of Pakistan', level: 'beginner' },
        { name: 'Mountain Ranges (Himalayas, Karakoram, Hindu Kush)', level: 'beginner' },
        { name: 'Rivers and Dams of Pakistan', level: 'beginner' },
        { name: 'Deserts of Pakistan (Thar, Cholistan, Thal)', level: 'beginner' },
        { name: 'Coastal Areas (Arabian Sea)', level: 'beginner' },
        { name: 'Climate of Pakistan', level: 'moderate' },
      ]},
      { name: 'World Geography', subtopics: [
        { name: 'Continents and their Features', level: 'beginner' },
        { name: 'Important Oceans and Seas', level: 'beginner' },
        { name: 'Important Straits and Canals', level: 'moderate' },
        { name: 'Time Zones and International Date Line', level: 'moderate' },
        { name: 'Major Mountain Ranges of the World', level: 'moderate' },
        { name: 'Important Rivers of the World', level: 'beginner' },
      ]},
      { name: 'Maps and Directions', subtopics: [
        { name: 'Types of Maps', level: 'beginner' },
        { name: 'Latitude and Longitude', level: 'beginner' },
        { name: 'Scale and Compass', level: 'beginner' },
        { name: 'Map Reading Basics', level: 'beginner' },
      ]},
      { name: 'Environmental Geography', subtopics: [
        { name: 'Natural Disasters (Floods, Earthquakes, Droughts)', level: 'beginner' },
        { name: 'Deforestation and its Effects', level: 'beginner' },
        { name: 'Soil Erosion', level: 'moderate' },
        { name: 'Water Resources', level: 'moderate' },
        { name: 'Climate Zones of the World', level: 'moderate' },
      ]},
    ],
  },
  {
    name: 'Computer Studies',
    description: 'Fundamentals of IT, MS Office, internet, and basic programming concepts.',
    topics: [
      { name: 'Introduction to Computers', subtopics: [
        { name: 'Definition and History of Computers', level: 'beginner' },
        { name: 'Generations of Computers (1st to 5th)', level: 'beginner' },
        { name: 'Types of Computers (Analog, Digital, Hybrid)', level: 'beginner' },
        { name: 'Characteristics and Limitations of Computers', level: 'beginner' },
      ]},
      { name: 'Computer Hardware', subtopics: [
        { name: 'Input Devices (Keyboard, Mouse, Scanner)', level: 'beginner' },
        { name: 'Output Devices (Monitor, Printer, Speaker)', level: 'beginner' },
        { name: 'Storage Devices (HDD, SSD, USB, CD/DVD)', level: 'beginner' },
        { name: 'CPU Components (ALU, CU, Registers)', level: 'beginner' },
      ]},
      { name: 'Computer Software', subtopics: [
        { name: 'System Software vs Application Software', level: 'beginner' },
        { name: 'Types of Operating Systems', level: 'beginner' },
        { name: 'Utility Programs and Their Uses', level: 'beginner' },
        { name: 'Open Source vs Proprietary Software', level: 'beginner' },
      ]},
      { name: 'MS Office Basics', subtopics: [
        { name: 'MS Word (Formatting, Tables, Mail Merge)', level: 'beginner' },
        { name: 'MS Excel (Basic Formulas, Charts, Sorting)', level: 'beginner' },
        { name: 'MS PowerPoint (Slides, Transitions, Templates)', level: 'beginner' },
        { name: 'MS Access (Basic Database Concepts)', level: 'beginner' },
      ]},
      { name: 'Internet & Email Basics', subtopics: [
        { name: 'What is the Internet and WWW', level: 'beginner' },
        { name: 'Web Browsers and Search Engines', level: 'beginner' },
        { name: 'Email Etiquette and Usage', level: 'beginner' },
        { name: 'Social Media and Online Safety', level: 'beginner' },
      ]},
      { name: 'Number Systems', subtopics: [
        { name: 'Binary, Decimal, Octal, Hexadecimal', level: 'beginner' },
        { name: 'Conversion Between Number Systems', level: 'beginner' },
        { name: 'BCD (Binary Coded Decimal)', level: 'beginner' },
        { name: 'Basic Binary Arithmetic', level: 'beginner' },
      ]},
      { name: 'Basic Networking', subtopics: [
        { name: 'Definition of Network', level: 'beginner' },
        { name: 'Types of Networks (LAN, MAN, WAN)', level: 'beginner' },
        { name: 'Network Devices (Router, Switch, Modem, Hub)', level: 'beginner' },
        { name: 'Internet vs Intranet vs Extranet', level: 'beginner' },
      ]},
      { name: 'Operating Systems', subtopics: [
        { name: 'Functions and Types of OS', level: 'moderate' },
        { name: 'Process Management and Scheduling', level: 'moderate' },
        { name: 'Memory Management (Paging, Segmentation)', level: 'moderate' },
        { name: 'File Systems (FAT, NTFS, ext4)', level: 'moderate' },
        { name: 'Deadlocks and Their Handling', level: 'moderate' },
      ]},
      { name: 'Programming Fundamentals', subtopics: [
        { name: 'Variables, Data Types, Operators', level: 'moderate' },
        { name: 'Control Structures (if/else, loops, switch)', level: 'moderate' },
        { name: 'Functions and Recursion', level: 'moderate' },
        { name: 'Arrays and Strings', level: 'moderate' },
        { name: 'Introduction to C, C++, Python', level: 'moderate' },
      ]},
      { name: 'Data Structures', subtopics: [
        { name: 'Arrays and Linked Lists', level: 'moderate' },
        { name: 'Stacks and Queues', level: 'moderate' },
        { name: 'Trees (Binary Tree, BST)', level: 'moderate' },
        { name: 'Sorting Algorithms (Bubble, Selection, Merge)', level: 'moderate' },
        { name: 'Searching Algorithms (Linear, Binary)', level: 'moderate' },
      ]},
      { name: 'Database Management (DBMS)', subtopics: [
        { name: 'DBMS Concepts and Architecture', level: 'moderate' },
        { name: 'Relational Model and ER Diagrams', level: 'moderate' },
        { name: 'SQL Basics (SELECT, INSERT, UPDATE, DELETE)', level: 'moderate' },
        { name: 'Keys (Primary, Foreign, Candidate)', level: 'moderate' },
        { name: 'Normalization (1NF, 2NF, 3NF)', level: 'moderate' },
      ]},
      { name: 'Computer Networks', subtopics: [
        { name: 'OSI Model (7 Layers) and TCP/IP Model', level: 'moderate' },
        { name: 'IP Addressing (IPv4, IPv6, Subnetting)', level: 'moderate' },
        { name: 'Protocols (HTTP, FTP, SMTP, DNS, DHCP)', level: 'moderate' },
        { name: 'Network Topologies (Bus, Star, Ring, Mesh)', level: 'moderate' },
        { name: 'Switching Techniques (Circuit, Packet, Message)', level: 'moderate' },
      ]},
      { name: 'Digital Logic & Boolean Algebra', subtopics: [
        { name: 'Logic Gates (AND, OR, NOT, NAND, NOR, XOR)', level: 'moderate' },
        { name: 'Boolean Expressions and Simplification', level: 'moderate' },
        { name: 'Karnaugh Maps (K-Maps)', level: 'moderate' },
        { name: 'Combinational Circuits (Adders, Multiplexers)', level: 'moderate' },
        { name: 'Sequential Circuits (Flip-Flops, Registers)', level: 'moderate' },
      ]},
      { name: 'Software Engineering', subtopics: [
        { name: 'SDLC Phases', level: 'moderate' },
        { name: 'Development Models (Waterfall, Agile, Spiral)', level: 'moderate' },
        { name: 'Testing Types (Unit, Integration, System, UAT)', level: 'moderate' },
        { name: 'Software Documentation and Maintenance', level: 'moderate' },
        { name: 'Requirements Analysis and SRS', level: 'moderate' },
      ]},
      { name: 'Object-Oriented Programming', subtopics: [
        { name: 'Classes, Objects, Constructors, Destructors', level: 'expert' },
        { name: 'Inheritance (Single, Multiple, Multilevel)', level: 'expert' },
        { name: 'Polymorphism (Overloading, Overriding)', level: 'expert' },
        { name: 'Encapsulation and Abstraction', level: 'expert' },
        { name: 'Design Patterns (Singleton, Factory, Observer)', level: 'expert' },
      ]},
      { name: 'Advanced Database Systems', subtopics: [
        { name: 'Transaction Management (ACID Properties)', level: 'expert' },
        { name: 'Concurrency Control (Locking, Timestamping)', level: 'expert' },
        { name: 'Query Optimization and Indexing', level: 'expert' },
        { name: 'Stored Procedures, Triggers, Views', level: 'expert' },
        { name: 'NoSQL Databases (MongoDB, Redis Concepts)', level: 'expert' },
      ]},
      { name: 'Algorithms & Complexity', subtopics: [
        { name: 'Algorithm Design (Greedy, Divide & Conquer, DP)', level: 'expert' },
        { name: 'Big-O Notation and Complexity Analysis', level: 'expert' },
        { name: 'Graph Algorithms (BFS, DFS, Dijkstra, Kruskal)', level: 'expert' },
        { name: 'Hashing and Hash Tables', level: 'expert' },
        { name: 'NP-Hard and NP-Complete Problems', level: 'expert' },
      ]},
      { name: 'Computer Architecture', subtopics: [
        { name: 'Von Neumann Architecture', level: 'expert' },
        { name: 'Instruction Set Architecture (ISA)', level: 'expert' },
        { name: 'Pipelining and Parallel Processing', level: 'expert' },
        { name: 'Cache Memory Levels (L1, L2, L3)', level: 'expert' },
        { name: 'RISC vs CISC Processors', level: 'expert' },
      ]},
      { name: 'Cybersecurity', subtopics: [
        { name: 'Types of Cyber Threats (Malware, Phishing, DDoS)', level: 'expert' },
        { name: 'Cryptography (Symmetric, Asymmetric, Hashing)', level: 'expert' },
        { name: 'Firewalls, IDS/IPS, VPN', level: 'expert' },
        { name: 'Authentication and Access Control', level: 'expert' },
        { name: 'Cybersecurity Laws and Ethics in Pakistan', level: 'expert' },
      ]},
      { name: 'Artificial Intelligence & Emerging Tech', subtopics: [
        { name: 'AI, Machine Learning, Deep Learning Basics', level: 'expert' },
        { name: 'Expert Systems and Knowledge Representation', level: 'expert' },
        { name: 'Natural Language Processing (NLP) Concepts', level: 'expert' },
        { name: 'Cloud Computing (IaaS, PaaS, SaaS)', level: 'expert' },
        { name: 'Blockchain, IoT, Big Data Fundamentals', level: 'expert' },
      ]},
      { name: 'Web Technologies', subtopics: [
        { name: 'HTML5, CSS3, JavaScript Basics', level: 'expert' },
        { name: 'Client-Server Architecture', level: 'expert' },
        { name: 'RESTful APIs and Web Services', level: 'expert' },
        { name: 'Frameworks Overview (React, Node.js, Django)', level: 'expert' },
        { name: 'Web Security (SQL Injection, XSS, CSRF)', level: 'expert' },
      ]},
      { name: 'Compiler Design', subtopics: [
        { name: 'Phases of a Compiler (Lexical, Syntax, Semantic)', level: 'expert' },
        { name: 'Parsing Techniques (Top-Down, Bottom-Up)', level: 'expert' },
        { name: 'Symbol Tables and Error Handling', level: 'expert' },
        { name: 'Intermediate Code Generation', level: 'expert' },
        { name: 'Code Optimization Techniques', level: 'expert' },
      ]},
    ],
  },
  {
    name: 'Logical Reasoning',
    description: 'Analytical thinking, pattern recognition, and mental ability problem-solving.',
    topics: [
      { name: 'Verbal Reasoning', subtopics: [
        { name: 'Analogies (Word Relationships)', level: 'beginner' },
        { name: 'Classification (Odd One Out)', level: 'beginner' },
        { name: 'Series Completion (Letters/Words)', level: 'beginner' },
        { name: 'Coding and Decoding', level: 'moderate' },
        { name: 'Blood Relations', level: 'moderate' },
        { name: 'Direction and Distance', level: 'moderate' },
      ]},
      { name: 'Non-Verbal Reasoning', subtopics: [
        { name: 'Number Series', level: 'beginner' },
        { name: 'Figure Patterns and Sequences', level: 'moderate' },
        { name: 'Mirror and Water Images', level: 'moderate' },
        { name: 'Paper Folding and Cutting', level: 'moderate' },
        { name: 'Embedded Figures', level: 'moderate' },
      ]},
      { name: 'Analytical Reasoning', subtopics: [
        { name: 'Seating Arrangements', level: 'moderate' },
        { name: 'Ranking and Ordering', level: 'moderate' },
        { name: 'Syllogisms (All/Some/No)', level: 'moderate' },
        { name: 'Statement and Conclusions', level: 'moderate' },
        { name: 'Statement and Assumptions', level: 'expert' },
        { name: 'Cause and Effect', level: 'expert' },
      ]},
      { name: 'Mathematical Reasoning', subtopics: [
        { name: 'Number Puzzles', level: 'moderate' },
        { name: 'Age Problems (Logical)', level: 'moderate' },
        { name: 'Clock and Calendar Problems', level: 'moderate' },
        { name: 'Missing Numbers in Matrices', level: 'moderate' },
        { name: 'Dice and Cubes', level: 'expert' },
      ]},
      { name: 'Critical Thinking', subtopics: [
        { name: 'Logical Deduction', level: 'moderate' },
        { name: 'Strengthening and Weakening Arguments', level: 'expert' },
        { name: 'Course of Action Questions', level: 'expert' },
        { name: 'Inference Questions', level: 'expert' },
      ]},
    ],
  },
  {
    name: 'Pakistan Affairs',
    description: "In-depth study of Pakistan's constitution, governance, and foreign policy.",
    topics: [
      { name: 'Constitution of Pakistan 1973', subtopics: [
        { name: 'Fundamental Rights (Articles 8-28)', level: 'beginner' },
        { name: 'Directive Principles of State Policy', level: 'moderate' },
        { name: 'Federal and Provincial Structure', level: 'moderate' },
        { name: 'Parliament (Senate and National Assembly)', level: 'moderate' },
        { name: 'Judiciary (Supreme Court, High Courts)', level: 'moderate' },
        { name: 'Important Constitutional Amendments (8th, 17th, 18th, 26th)', level: 'expert' },
      ]},
      { name: 'Government and Politics of Pakistan', subtopics: [
        { name: 'Political Parties of Pakistan', level: 'beginner' },
        { name: 'Electoral System of Pakistan', level: 'moderate' },
        { name: 'Role of Army in Pakistan Politics', level: 'moderate' },
        { name: 'President vs Prime Minister Powers', level: 'moderate' },
        { name: 'NFC Award (National Finance Commission)', level: 'expert' },
      ]},
      { name: 'Economy and Development of Pakistan', subtopics: [
        { name: 'CPEC Projects and Corridors', level: 'moderate' },
        { name: 'Taxation System in Pakistan (FBR)', level: 'moderate' },
        { name: 'Agriculture Policy of Pakistan', level: 'moderate' },
        { name: 'Industrial Policy of Pakistan', level: 'moderate' },
        { name: 'Poverty and Unemployment Issues', level: 'moderate' },
      ]},
      { name: 'Foreign Policy of Pakistan', subtopics: [
        { name: 'Pak-India Relations and Kashmir Issue', level: 'moderate' },
        { name: 'Pak-China Strategic Partnership', level: 'moderate' },
        { name: 'Pak-USA Relations (Post 9/11)', level: 'moderate' },
        { name: 'Pakistan and Afghanistan', level: 'moderate' },
        { name: "Pakistan's Nuclear Program", level: 'expert' },
      ]},
      { name: 'Law and Order in Pakistan', subtopics: [
        { name: 'Judicial System of Pakistan', level: 'moderate' },
        { name: 'NAB (National Accountability Bureau)', level: 'moderate' },
        { name: 'Anti-Terrorism Laws of Pakistan', level: 'expert' },
        { name: 'Police System in Punjab', level: 'moderate' },
        { name: 'Human Rights in Pakistan', level: 'moderate' },
      ]},
      { name: 'Social Issues of Pakistan', subtopics: [
        { name: 'Education Crisis in Pakistan', level: 'moderate' },
        { name: 'Health System Issues', level: 'moderate' },
        { name: 'Women Rights in Pakistan', level: 'moderate' },
        { name: 'Child Labor and Poverty', level: 'moderate' },
        { name: 'Population Growth Problem', level: 'moderate' },
      ]},
    ],
  },
  {
    name: 'Economics',
    description: "Basic micro/macroeconomics, Pakistan's economy, and fiscal/monetary concepts.",
    topics: [
      { name: 'Basic Economics Concepts', subtopics: [
        { name: 'Definition and Scope of Economics', level: 'beginner' },
        { name: 'Micro vs Macro Economics', level: 'beginner' },
        { name: 'Demand and Supply Laws', level: 'beginner' },
        { name: 'Market Equilibrium', level: 'moderate' },
        { name: 'Elasticity of Demand and Supply', level: 'moderate' },
        { name: 'Consumer and Producer Surplus', level: 'moderate' },
      ]},
      { name: 'National Income', subtopics: [
        { name: 'GDP, GNP, NNP Concepts', level: 'beginner' },
        { name: 'Methods of Measuring National Income', level: 'moderate' },
        { name: 'Per Capita Income', level: 'beginner' },
        { name: 'Economic Growth vs Economic Development', level: 'moderate' },
        { name: 'Human Development Index (HDI)', level: 'moderate' },
      ]},
      { name: 'Money and Banking', subtopics: [
        { name: 'Functions of Money', level: 'beginner' },
        { name: 'Types of Banks', level: 'beginner' },
        { name: 'State Bank of Pakistan (SBP) Role', level: 'moderate' },
        { name: 'Monetary Policy', level: 'moderate' },
        { name: 'Inflation and Deflation', level: 'moderate' },
        { name: 'Credit and Interest Rates', level: 'moderate' },
      ]},
      { name: "Pakistan's Economy", subtopics: [
        { name: 'Agriculture Sector (Crops, Water, Land Reforms)', level: 'moderate' },
        { name: 'Industrial Sector (Large Scale, Small Scale)', level: 'moderate' },
        { name: 'Services Sector of Pakistan', level: 'moderate' },
        { name: 'Foreign Trade (Exports, Imports, Trade Deficit)', level: 'moderate' },
        { name: 'Foreign Debt and IMF Loans', level: 'expert' },
        { name: 'Budget and Fiscal Policy', level: 'expert' },
      ]},
      { name: 'International Economics', subtopics: [
        { name: 'World Trade Organization (WTO)', level: 'moderate' },
        { name: 'IMF and World Bank Role', level: 'moderate' },
        { name: 'Balance of Payments', level: 'expert' },
        { name: 'Foreign Direct Investment (FDI)', level: 'moderate' },
        { name: 'Economic Integration (SAARC, ECO)', level: 'moderate' },
      ]},
      { name: 'Development Economics', subtopics: [
        { name: 'Poverty and Inequality', level: 'moderate' },
        { name: 'Types of Unemployment', level: 'moderate' },
        { name: 'Five Year Plans of Pakistan', level: 'moderate' },
        { name: 'Privatization in Pakistan', level: 'expert' },
        { name: 'CPEC Economic Impact', level: 'moderate' },
      ]},
    ],
  },
  {
    name: 'History',
    description: 'World and subcontinent history from ancient civilizations to modern era.',
    topics: [
      { name: 'Ancient Civilizations', subtopics: [
        { name: 'Indus Valley Civilization (Mohenjo-daro, Harappa)', level: 'beginner' },
        { name: 'Mesopotamia and Egypt', level: 'beginner' },
        { name: 'Greek and Roman Civilizations', level: 'moderate' },
        { name: 'Persian Empire', level: 'moderate' },
      ]},
      { name: 'Medieval History', subtopics: [
        { name: 'Rise of Islam (7th Century)', level: 'beginner' },
        { name: 'Arab Conquests', level: 'moderate' },
        { name: 'Mongol Empire', level: 'moderate' },
        { name: 'Ottoman Empire', level: 'moderate' },
        { name: 'Mughal Empire in Subcontinent', level: 'moderate' },
      ]},
      { name: 'History of the Subcontinent', subtopics: [
        { name: 'Hindu Shahi and Ghaznavid Period', level: 'moderate' },
        { name: 'Delhi Sultanate', level: 'moderate' },
        { name: 'Mughal Empire (Babur to Aurangzeb)', level: 'moderate' },
        { name: 'British East India Company', level: 'moderate' },
        { name: 'Mutiny of 1857', level: 'moderate' },
        { name: 'Indian National Movement (1857-1947)', level: 'moderate' },
      ]},
      { name: 'Modern World History', subtopics: [
        { name: 'Renaissance and Industrial Revolution', level: 'moderate' },
        { name: 'American Revolution (1776)', level: 'moderate' },
        { name: 'French Revolution (1789)', level: 'moderate' },
        { name: 'Russian Revolution (1917)', level: 'moderate' },
        { name: 'World War I — Causes, Events, Results', level: 'moderate' },
        { name: 'World War II — Causes, Events, Results', level: 'moderate' },
        { name: 'Cold War and its End', level: 'moderate' },
        { name: 'Decolonization of Asia and Africa', level: 'expert' },
      ]},
      { name: 'History of Pakistan (Post 1947)', subtopics: [
        { name: 'Two Nation Theory', level: 'beginner' },
        { name: 'Pakistan Movement (1906-1947)', level: 'beginner' },
        { name: 'Post-Independence History of Pakistan', level: 'moderate' },
        { name: 'Wars with India (1948, 1965, 1971)', level: 'moderate' },
        { name: 'Separation of East Pakistan (1971)', level: 'moderate' },
        { name: 'Nuclear Tests 1998', level: 'moderate' },
        { name: 'Modern Pakistan (2000-present)', level: 'moderate' },
      ]},
    ],
  },
  {
    name: 'Civics & Constitution',
    description: "Pakistan's constitutional framework, fundamental rights, and civic responsibilities.",
    topics: [
      { name: 'Introduction to Civics', subtopics: [
        { name: 'Definition and Importance of Civics', level: 'beginner' },
        { name: 'Rights and Responsibilities of Citizens', level: 'beginner' },
        { name: 'Concept of State and Government', level: 'beginner' },
        { name: 'Democracy and its Types', level: 'moderate' },
        { name: 'Citizenship', level: 'beginner' },
      ]},
      { name: 'Constitution of Pakistan 1973', subtopics: [
        { name: 'Features of 1973 Constitution', level: 'moderate' },
        { name: 'Islamic Provisions of the Constitution', level: 'moderate' },
        { name: 'Fundamental Rights (Articles 8-28)', level: 'moderate' },
        { name: 'Fundamental Duties', level: 'moderate' },
        { name: 'Emergency Provisions', level: 'expert' },
      ]},
      { name: 'Government Structure of Pakistan', subtopics: [
        { name: 'Federal Government (Executive, Legislature, Judiciary)', level: 'moderate' },
        { name: 'Provincial Government Structure', level: 'moderate' },
        { name: 'Local Government System', level: 'moderate' },
        { name: 'Relationship between Federal and Provincial Governments', level: 'expert' },
      ]},
      { name: 'Parliament of Pakistan', subtopics: [
        { name: 'National Assembly — Composition and Powers', level: 'moderate' },
        { name: 'Senate — Composition and Powers', level: 'moderate' },
        { name: 'Law Making Process in Pakistan', level: 'moderate' },
        { name: 'Budget Process in Parliament', level: 'expert' },
      ]},
      { name: 'Judiciary of Pakistan', subtopics: [
        { name: 'Supreme Court of Pakistan', level: 'moderate' },
        { name: 'High Courts (Punjab, Sindh, KPK, Balochistan)', level: 'moderate' },
        { name: 'Federal Shariat Court', level: 'moderate' },
        { name: 'Judicial Review', level: 'expert' },
        { name: 'Independence of Judiciary', level: 'expert' },
      ]},
      { name: 'Constitutional Amendments', subtopics: [
        { name: '8th Amendment (1985)', level: 'moderate' },
        { name: '17th Amendment (2003)', level: 'moderate' },
        { name: '18th Amendment (2010) — Devolution of Power', level: 'moderate' },
        { name: '21st Amendment — Military Courts', level: 'expert' },
        { name: '26th Amendment — Recent Changes', level: 'expert' },
      ]},
      { name: 'Human Rights', subtopics: [
        { name: 'Universal Declaration of Human Rights', level: 'beginner' },
        { name: 'Women Rights in Pakistan', level: 'moderate' },
        { name: 'Minority Rights in Pakistan', level: 'moderate' },
        { name: 'Child Rights in Pakistan', level: 'moderate' },
        { name: 'Press Freedom in Pakistan', level: 'moderate' },
      ]},
    ],
  },
  {
    name: 'General Knowledge',
    description: 'Awareness of facts, world organizations, science, sports, and global events.',
    topics: [
      { name: 'World Geography (GK)', subtopics: [
        { name: 'Continents and Oceans', level: 'beginner' },
        { name: 'Important Countries and Capitals', level: 'beginner' },
        { name: 'Longest/Highest/Largest in the World', level: 'beginner' },
        { name: 'Important Seas, Straits and Canals', level: 'moderate' },
        { name: 'Mountain Ranges of the World', level: 'moderate' },
      ]},
      { name: 'World Organizations', subtopics: [
        { name: 'United Nations (UN) and its Agencies', level: 'beginner' },
        { name: 'NATO, SAARC, SCO, OIC', level: 'moderate' },
        { name: 'World Bank, IMF, WTO', level: 'moderate' },
        { name: 'G7, G20, BRICS', level: 'moderate' },
        { name: 'Commonwealth of Nations', level: 'beginner' },
      ]},
      { name: 'Science & Technology (GK)', subtopics: [
        { name: 'Famous Scientists and Inventions', level: 'beginner' },
        { name: 'Important Discoveries in History', level: 'beginner' },
        { name: 'Space Exploration Milestones', level: 'moderate' },
        { name: 'Nobel Prize Winners (Major)', level: 'moderate' },
        { name: 'Technology Milestones', level: 'moderate' },
      ]},
      { name: 'World History (GK)', subtopics: [
        { name: 'World War I and II Summary', level: 'beginner' },
        { name: 'Cold War Summary', level: 'moderate' },
        { name: 'French Revolution', level: 'moderate' },
        { name: 'American Revolution', level: 'moderate' },
        { name: 'United Nations Formation', level: 'beginner' },
      ]},
      { name: 'Sports & Games', subtopics: [
        { name: 'Olympic Games History', level: 'beginner' },
        { name: 'Cricket World Cup', level: 'beginner' },
        { name: 'FIFA World Cup', level: 'beginner' },
        { name: 'Famous Sports Personalities', level: 'beginner' },
        { name: 'Pakistan in International Sports', level: 'beginner' },
      ]},
      { name: 'Books & Authors', subtopics: [
        { name: 'Famous Books and their Authors', level: 'moderate' },
        { name: 'Nobel Prize in Literature', level: 'moderate' },
        { name: 'Pakistani Writers and Poets', level: 'moderate' },
        { name: 'Famous Urdu Literature', level: 'moderate' },
      ]},
      { name: 'Awards & Honors', subtopics: [
        { name: 'Nobel Prize Categories and History', level: 'moderate' },
        { name: "Pakistan's Civilian and Military Awards", level: 'moderate' },
        { name: 'Oscar Award History', level: 'beginner' },
        { name: 'Commonwealth Awards', level: 'moderate' },
      ]},
    ],
  },
];

async function main() {
  console.log('Seeding Meritmaster PPSC database...\n');

  await prisma.user.createMany({
    data: [
      { name: 'Ali Tahir', email: 'ali@meritmaster.pk', password: 'hash', role: 'ADMIN' },
      { name: 'Usman Khan', email: 'usman@example.com', password: 'hash', role: 'USER' },
      { name: 'Ayesha Ahmed', email: 'ayesha@example.com', password: 'hash', role: 'USER' },
    ],
    skipDuplicates: true,
  });
  console.log('Users seeded');

  let totalTopics = 0;
  let totalSubtopics = 0;

  for (const subject of SUBJECTS) {
    const category = await prisma.category.upsert({
      where: { name: subject.name },
      update: { description: subject.description },
      create: { name: subject.name, description: subject.description },
    });

    console.log(`\n${subject.name}`);

    for (const topic of subject.topics) {
      let subCategory = await prisma.subCategory.findFirst({
        where: { name: topic.name, categoryId: category.id },
      });
      if (!subCategory) {
        subCategory = await prisma.subCategory.create({
          data: { name: topic.name, categoryId: category.id },
        });
      }
      totalTopics++;

      for (const sub of topic.subtopics) {
        const existing = await prisma.topic.findFirst({
          where: { name: sub.name, subCategoryId: subCategory.id },
        });
        if (!existing) {
          await prisma.topic.create({
            data: { name: sub.name, level: sub.level, subCategoryId: subCategory.id },
          });
          totalSubtopics++;
        }
      }
      console.log(`  + ${topic.name} (${topic.subtopics.length} subtopics)`);
    }
  }

  console.log('\n================================');
  console.log('Seed Complete!');
  console.log(`  Subjects  : ${SUBJECTS.length}`);
  console.log(`  Topics    : ${totalTopics}`);
  console.log(`  Subtopics : ${totalSubtopics}`);
  console.log('================================\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
