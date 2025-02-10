// schema/challenges.js
const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    type: {
        type: String,
        enum: ['steps', 'distance', 'activity'],
        default: 'steps'
    },
    goal: {
        type: Number,
        required: true
    },
    duration: {
        type: Number, // in days
        required: true
    },
    startDate: Date,
    endDate: Date,
    status: {
        type: String,
        enum: ['upcoming', 'active', 'completed'],
        default: 'upcoming'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Challenge', challengeSchema);