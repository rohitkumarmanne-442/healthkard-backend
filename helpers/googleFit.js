const { google } = require('googleapis');
const axios = require('axios');

class GoogleFitHelper {
    constructor() {
        this.oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );
    }

    setCredentials(token) {
        this.oauth2Client.setCredentials(token);
    }

    async getUserStepsData(startTimeMillis, endTimeMillis) {
        try {
            const fitness = google.fitness({
                version: 'v1',
                auth: this.oauth2Client
            });

            const response = await fitness.users.dataset.aggregate({
                userId: 'me',
                requestBody: {
                    aggregateBy: [{
                        dataTypeName: 'com.google.step_count.delta'
                    }],
                    bucketByTime: { durationMillis: 86400000 }, // Daily buckets
                    startTimeMillis,
                    endTimeMillis
                }
            });

            return this.processStepsData(response.data);
        } catch (error) {
            console.error('Error fetching steps data:', error);
            throw new Error('Failed to fetch steps data from Google Fit');
        }
    }

    processStepsData(data) {
        try {
            const dailySteps = data.bucket.map(bucket => {
                const steps = bucket.dataset[0].point[0]?.value[0]?.intVal || 0;
                return {
                    date: new Date(parseInt(bucket.startTimeMillis)),
                    steps
                };
            });

            return dailySteps;
        } catch (error) {
            console.error('Error processing steps data:', error);
            return [];
        }
    }

    async refreshToken(refreshToken) {
        try {
            this.oauth2Client.setCredentials({
                refresh_token: refreshToken
            });
            
            const { tokens } = await this.oauth2Client.refreshAccessToken();
            return tokens;
        } catch (error) {
            console.error('Error refreshing token:', error);
            throw new Error('Failed to refresh token');
        }
    }
}

module.exports = new GoogleFitHelper();