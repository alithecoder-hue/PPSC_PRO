import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const registerUser = async (data: any) => {
  const { email, password, name } = data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('Email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // SECURITY: never trust a client-supplied role — every signup is a plain USER.
  // Admins are created via the seed script or direct DB access only.
  const createdUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: 'USER',
    },
  });

  // Give 7 day trial automatically
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7);
  
  await prisma.subscription.create({
    data: {
      userId: createdUser.id,
      plan: '7 Days Trial',
      startDate: new Date(),
      endDate: endDate,
      isActive: true,
    }
  });

  return createdUser;
};

export const loginUser = async (data: any) => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET as string,
    { expiresIn: '24h' }
  );

  return { token, role: user.role, name: user.name, xp: user.xp, streak: user.streak };
};

export const getUserProfile = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      role: true,
      xp: true,
      streak: true,
      preferredSubjectIds: true,
      subscriptions: {
        where: { isActive: true }
      },
      results: {
        include: {
          exam: { select: { title: true } }
        },
        orderBy: { completedAt: 'desc' },
        take: 10
      }
    }
  });
  
  if (!user) throw new Error('User not found');
  return user;
};

export const updatePreferredSubjects = async (userId: number, subjectIds: number[]) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { preferredSubjectIds: subjectIds },
    select: { preferredSubjectIds: true }
  });
  return user;
};

export const updateDailyGoalTarget = async (userId: number, target: number) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { dailyGoalTarget: target },
    select: { dailyGoalTarget: true }
  });
  return user;
};
