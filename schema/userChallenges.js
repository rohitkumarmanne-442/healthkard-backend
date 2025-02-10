const mongoose = require('mongoose');

const userChallengeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    challengeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Challenge',
        required: true
    },
    googleToken: {
        access_token: String,
        refresh_token: String,
        expiry_date: Number,
        scope: String // Added to track token permissions
    },
    progress: {
        totalSteps: {
            type: Number,
            default: 0,
            min: 0
        },
        dailyGoal: {
            type: Number,
            default: 10000,
            min: 0
        },
        lastSync: Date
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'expired'],
        default: 'active'
    },
    registrationDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index for faster lookups and to prevent duplicate registrations
userChallengeSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

// Index for admin queries
userChallengeSchema.index({ status: 1, registrationDate: -1 });

// Method to check if token needs refresh
userChallengeSchema.methods.isTokenExpired = function() {
    return this.googleToken.expiry_date <= Date.now();
};

// Method to update token
userChallengeSchema.methods.updateToken = function(newToken) {
    this.googleToken = {
        ...this.googleToken,
        ...newToken,
        expiry_date: Date.now() + (newToken.expires_in || 3600) * 1000
    };
    return this.save();
};

module.exports = mongoose.model('UserChallenge', userChallengeSchema);