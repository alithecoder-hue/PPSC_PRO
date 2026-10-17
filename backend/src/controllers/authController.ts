import { Request, Response } from 'express';
import * as authService from '../services/authService';

export const register = async (req: Request, res: Response) => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const data = await authService.loginUser(req.body);
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Login failed' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - set by authenticateJWT
    const userId = req.user?.userId;
    if (!userId) throw new Error('Unauthorized');
    
    const profile = await authService.getUserProfile(userId);
    res.json(profile);
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Failed to get profile' });
  }
};

export const updateSubjects = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.userId;
    if (!userId) throw new Error('Unauthorized');
    
    const { subjectIds } = req.body;
    if (!Array.isArray(subjectIds)) {
      return res.status(400).json({ error: 'subjectIds must be an array' });
    }

    const updated = await authService.updatePreferredSubjects(userId, subjectIds);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update subjects' });
  }
};

export const updateDailyGoal = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.userId;
    if (!userId) throw new Error('Unauthorized');
    
    const { target } = req.body;
    if (typeof target !== 'number') {
      return res.status(400).json({ error: 'target must be a number' });
    }

    const updated = await authService.updateDailyGoalTarget(userId, target);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update daily goal' });
  }
};
