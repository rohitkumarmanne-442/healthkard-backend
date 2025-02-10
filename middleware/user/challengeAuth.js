// middleware/user/challengeAuth.js
const UserChallenge = require('../../schema/userChallenges');
const googleFitHelper = require('../../helpers/googleFit');

exports.checkAuth = async (req, res, next) => {
    try {
        // Get user from your existing auth middleware
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // If checking a specific challenge
        if (req.params.challengeId) {
            const userChallenge = await UserChallenge.findOne({
                userId: req.user._id,
                challengeId: req.params.challengeId
            });

            if (userChallenge && userChallenge.googleToken) {
                // Validate Google token
                if (!googleFitHelper.validateToken(userChallenge.googleToken)) {
                    return res.status(401).json({ 
                        error: 'Google Fit token expired',
                        requiresReauth: true
                    });
                }
            }
        }

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Authentication error' });
    }
};