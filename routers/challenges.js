const express = require('express');
const router = express.Router();
const Challenge = require('../schema/challenges');
const UserChallenge = require('../schema/userChallenges');
const googleFitHelper = require('../helpers/googleFit');
const { checkAuth } = require('../middleware/user/challengeAuth');

// Register for a challenge
router.post('/register', checkAuth, async (req, res) => {
    try {
        console.log('Registration attempt with data:', {
            body: req.body,
            user: req.user?._id
        });

        const { challengeId, googleToken } = req.body;
        const userId = req.user._id;

        if (!challengeId || !googleToken) {
            console.log('Missing required fields:', { challengeId, hasToken: !!googleToken });
            return res.status(400).json({ 
                success: false,
                error: 'Missing required fields' 
            });
        }

        // Check if challenge exists
        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            console.log('Challenge not found:', challengeId);
            return res.status(404).json({ 
                success: false,
                error: 'Challenge not found' 
            });
        }

        // Check if already registered
        const existingRegistration = await UserChallenge.findOne({
            userId,
            challengeId
        });

        if (existingRegistration) {
            console.log('Already registered:', existingRegistration);
            return res.status(400).json({ 
                success: false,
                error: 'Already registered for this challenge' 
            });
        }

        // Store user challenge registration
        const userChallenge = new UserChallenge({
            userId,
            challengeId,
            googleToken: {
                access_token: googleToken,
                expiry_date: Date.now() + 3600000 // Token expires in 1 hour
            },
            progress: {
                totalSteps: 0,
                dailyGoal: challenge.goal,
                lastSync: new Date()
            },
            status: 'active',
            registrationDate: new Date()
        });

        const savedRegistration = await userChallenge.save();
        console.log('Successfully saved registration:', {
            userId: savedRegistration.userId,
            challengeId: savedRegistration.challengeId
        });

        // Verify the token works by fetching initial steps data
        try {
            await googleFitHelper.getStepsData(
                googleToken,
                savedRegistration.registrationDate,
                new Date()
            );
            console.log('Successfully verified Google Fit token');
        } catch (tokenError) {
            console.error('Token verification failed:', tokenError);
            // Don't fail registration if token verification fails
            // We'll handle token refresh later
        }

        res.json({ 
            success: true, 
            message: 'Successfully registered for challenge',
            data: {
                challengeId: savedRegistration.challengeId,
                registrationDate: savedRegistration.registrationDate,
                status: savedRegistration.status
            }
        });
    } catch (error) {
        console.error('Challenge registration error:', {
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({ 
            success: false,
            error: 'Failed to register for challenge' 
        });
    }
});

// Get challenge progress
router.get('/progress/:challengeId', checkAuth, async (req, res) => {
    try {
        const { challengeId } = req.params;
        const userId = req.user._id;

        const userChallenge = await UserChallenge.findOne({
            userId,
            challengeId
        }).populate('challengeId');

        if (!userChallenge) {
            return res.status(404).json({ error: 'Challenge registration not found' });
        }

        const stepsData = await googleFitHelper.getStepsData(
            userChallenge.googleToken.access_token,
            userChallenge.registrationDate,
            new Date()
        );

        // Update progress
        userChallenge.progress = {
            totalSteps: stepsData,
            dailyGoal: userChallenge.progress.dailyGoal,
            lastSync: new Date()
        };
        
        if (stepsData >= userChallenge.challengeId.goal) {
            userChallenge.status = 'completed';
        }

        await userChallenge.save();

        res.json({
            totalSteps: stepsData,
            goal: userChallenge.challengeId.goal,
            status: userChallenge.status,
            lastSync: userChallenge.progress.lastSync
        });
    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({ error: 'Failed to fetch challenge progress' });
    }
});

// Get all challenge registrations for admin
router.get('/admin/challenges', async (req, res) => {
    try {
        console.log('Fetching all challenge registrations...');
        
        const registrations = await UserChallenge.find()
            .populate('userId', 'name email')
            .populate('challengeId')
            .sort({ registrationDate: -1 });

        console.log('Found registrations:', registrations.length);

        const formattedData = await Promise.all(registrations.map(async (reg) => {
            try {
                const stepsData = await googleFitHelper.getStepsData(
                    reg.googleToken.access_token,
                    reg.registrationDate,
                    new Date()
                );

                return {
                    userName: reg.userId?.name || 'Unknown User',
                    email: reg.userId?.email || 'No Email',
                    challengeName: reg.challengeId?.title || '10K Steps Challenge',
                    progress: Math.round((stepsData / reg.progress.dailyGoal) * 100),
                    status: reg.status || 'active',
                    startDate: reg.registrationDate || new Date(),
                    totalSteps: stepsData
                };
            } catch (error) {
                console.error('Error processing registration:', error);
                return {
                    userName: reg.userId?.name || 'Unknown User',
                    email: reg.userId?.email || 'No Email',
                    challengeName: reg.challengeId?.title || '10K Steps Challenge',
                    progress: 0,
                    status: 'error',
                    startDate: reg.registrationDate || new Date(),
                    totalSteps: 0
                };
            }
        }));

        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).json({ error: 'Failed to fetch registrations' });
    }
});

// Debug route to check database state
router.get('/admin/debug-registration', async (req, res) => {
    try {
        console.log('Running registration debug check...');

        // Check Challenge collection
        const challenges = await Challenge.find();
        console.log('Challenges in database:', challenges.length);

        // Check UserChallenge collection
        const userChallenges = await UserChallenge.find();
        console.log('Registrations in database:', userChallenges.length);

        // Get detailed registration info
        const details = await UserChallenge.find()
            .populate('userId')
            .populate('challengeId');

        res.json({
            challengesCount: challenges.length,
            userChallengesCount: userChallenges.length,
            challenges,
            userChallenges,
            details
        });
    } catch (error) {
        console.error('Debug check error:', error);
        res.status(500).json({ error: 'Debug check failed' });
    }
});

module.exports = router;