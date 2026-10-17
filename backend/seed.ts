import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with full platform data...');

  // 1. Create Subjects (Categories)
  const cs = await prisma.category.upsert({
    where: { name: 'Computer Science' },
    update: {},
    create: {
      name: 'Computer Science',
      description: 'Core concepts of computing',
    },
  });

  const gk = await prisma.category.upsert({
    where: { name: 'General Knowledge' },
    update: {},
    create: {
      name: 'General Knowledge',
      description: 'World facts and trivia',
    },
  });

  const fia = await prisma.category.upsert({
    where: { name: 'FIA Inspector Syllabus' },
    update: {},
    create: {
      name: 'FIA Inspector Syllabus',
      description: 'FIA specific testing',
    },
  });

  // 2. Create Topics (SubCategories)
  const programming = await prisma.subCategory.create({
    data: { name: 'Programming', categoryId: cs.id }
  });

  const databases = await prisma.subCategory.create({
    data: { name: 'Databases', categoryId: cs.id }
  });

  const geography = await prisma.subCategory.create({
    data: { name: 'Geography', categoryId: gk.id }
  });

  // 3. Create MCQs
  console.log('Generating MCQs...');
  for (let i = 0; i < 20; i++) {
    await prisma.mCQ.create({
      data: {
        question: `Sample CS Question ${i + 1}: What is the output of this algorithm?`,
        optionA: 'O(1)',
        optionB: 'O(n)',
        optionC: 'O(n^2)',
        optionD: 'O(log n)',
        correctOption: ['A', 'B', 'C', 'D'][i % 4],
        explanation: 'This is a generated explanation for a CS question.',
        categoryId: cs.id,
        subCategoryId: i % 2 === 0 ? programming.id : databases.id
      }
    });
  }

  // 4. Create Users (for Leaderboard)
  console.log('Creating Users for Leaderboard...');
  const usersData = [
    { email: 'zainab@example.com', name: 'Zainab F.', password: 'password', xp: 15400, testsTaken: 42, hoursStudied: 120, role: 'USER' },
    { email: 'ali@example.com', name: 'Ali T.', password: 'password', xp: 18200, testsTaken: 56, hoursStudied: 155, role: 'USER' },
    { email: 'usman@example.com', name: 'Usman M.', password: 'password', xp: 14100, testsTaken: 38, hoursStudied: 95, role: 'USER' },
    { email: 'ayesha@example.com', name: 'Ayesha K.', password: 'password', xp: 12500, testsTaken: 30, hoursStudied: 80, role: 'USER' },
    { email: 'bilal@example.com', name: 'Bilal A.', password: 'password', xp: 11000, testsTaken: 45, hoursStudied: 110, role: 'USER' },
    { email: 'sarah@example.com', name: 'Sarah N.', password: 'password', xp: 9500, testsTaken: 25, hoursStudied: 70, role: 'USER' }
  ];

  for (const u of usersData) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        password: u.password,
        xp: u.xp,
        testsTaken: u.testsTaken,
        hoursStudied: u.hoursStudied,
        role: 'USER'
      }
    });
  }

  // 5. Create Jobs (Mock Tests)
  console.log('Creating Jobs...');
  const jobsData = [
    { title: 'FIA Inspector', organization: 'Federal Investigation Agency', location: 'Islamabad', salary: 'BPS-16', description: 'Full mock test for FIA Inspector.', deadline: new Date('2026-12-31'), applyLink: '#', vacancies: 15, difficulty: 8, totalMcqs: 100, durationMins: 90 },
    { title: 'Tehsildar', organization: 'Board of Revenue', location: 'Punjab', salary: 'BPS-16', description: 'Comprehensive Tehsildar exam prep.', deadline: new Date('2026-11-15'), applyLink: '#', vacancies: 8, difficulty: 9, totalMcqs: 100, durationMins: 120 },
    { title: 'Lecturer Computer Science', organization: 'Higher Education Department', location: 'Punjab', salary: 'BPS-17', description: 'Lecturer CS mock exam.', deadline: new Date('2026-10-05'), applyLink: '#', vacancies: 120, difficulty: 7, totalMcqs: 100, durationMins: 90 }
  ];

  for (const j of jobsData) {
    await prisma.job.create({ data: j });
  }

  // 6. Create Announcements
  console.log('Creating Announcements...');
  await prisma.announcement.createMany({
    data: [
      { title: 'PPSC Tehsildar 2026 results announced!', body: 'Check your results now.', type: 'Success' },
      { title: 'FPSC Custom Inspector schedule released.', body: 'Exams start next month.', type: 'Info' },
      { title: 'New Mock Tests Added for FIA', body: 'Practice the latest syllabus.', type: 'Info' }
    ]
  });

  // 7. Create Testimonials
  console.log('Creating Testimonials...');
  await prisma.testimonial.createMany({
    data: [
      { name: 'Ahmad Raza', role: 'Tehsildar (2025)', quote: 'Meritmaster was crucial for my Tehsildar preparation. The mock exams were incredibly realistic.', rating: 5 },
      { name: 'Sana Fatima', role: 'Lecturer Biology', quote: 'I cracked my PPSC exam on the first attempt thanks to the topic-wise MCQs.', rating: 5 },
      { name: 'Omer Hayat', role: 'FIA Inspector', quote: 'The dynamic exam engine built my stamina for the actual 100-minute test.', rating: 5 }
    ]
  });

  // 8. Create FAQs
  console.log('Creating FAQs...');
  await prisma.fAQ.createMany({
    data: [
      { question: 'Is this platform free?', answer: 'We offer both free daily tests and a premium subscription with unlimited access.', order: 1 },
      { question: 'Are the MCQs updated according to the latest syllabus?', answer: 'Yes, our content team regularly updates questions based on FPSC and PPSC guidelines.', order: 2 },
      { question: 'Can I track my progress?', answer: 'Absolutely. The dashboard provides detailed analytics and your global leaderboard ranking.', order: 3 }
    ]
  });

  console.log('Platform data seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
