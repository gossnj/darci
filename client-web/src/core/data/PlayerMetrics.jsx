/* MIT License
 *
 * Copyright (c) 2023 Mike Chambers
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import React from "react";

const TRIALS_WEEKLY_FLAWLESS = "122451876";
const TRIALS_SEASON_FLAWLESS = "1114483243";
const TRIALS_LIFETIME_FLAWLESS = "1765255052";

const TRIALS_SEASON_WIN_STREAK = "957196641";
const TRIALS_WEEKLY_WIN_STREAK = "3787323274"; //this appears to be bugged

const TRIALS_WEEKLY_DEFEATS = "2091173752";
const TRIALS_SEASON_DEFEATS = "3481560625";
const TRIALS_LIFETIME_DEFEATS = "2082314848";

const TRIALS_WEEKLY_WINS = "3046315288";
const TRIALS_SEASON_WINS = "2367472811";
const TRIALS_LIFETIME_WINS = "1365664208";

const IRON_BANNER_SEASON_WINS = "429382583";
const IRON_BANNER_SEASON_GOLD_MEDALS = "1196938828";
const IRON_BANNER_SEASON_EFFICIENCY = "1509147660";
const IRON_BANNER_SEASON_KILLS = "2161492053";

const CRUCIBLE_SEASON_DEFEATS = "2935221077";
const CRUCIBLE_WEEKLY_DEFEATS = "1766068284";
const CRUCIBLE_LIFETIME_DEFEATS = "811894228";

const CRUCIBLE_SEASON_WIN_STREAK = "1249684581";
const CRUCIBLE_WEEK_WIN_STREAK = "4044111774";

const CRUCIBLE_SEASON_KDA = "871184140";

const CRUCIBLE_SEASON_WIN_RATE = "2941499201";

const TRIALS_WEEKLY_CARRIES = "1155098170";
const TRIALS_SEASON_CARRIES = "610393611";
const TRIALS_LIFETIME_CARRIES = "301249970";

class PlayerMetrics {
    trials;
    ironBanner;
    crucible;

    constructor(options = {}) {
        this.trials = options.trials;
        this.ironBanner = options.ironBanner;
        this.crucible = options.crucible;
    }

    static fromApi(data) {
        console.log('PlayerMetrics.fromApi called with data:', data);
        
        // Check if the expected structure exists
        if (!data.metrics || !data.metrics.data || !data.metrics.data.metrics) {
            throw new Error('Invalid metrics data structure: missing metrics.data.metrics');
        }
        
        const metrics = data.metrics.data.metrics;
        console.log('Available metrics:', Object.keys(metrics));
        
        // Log some sample metrics to help identify the correct IDs
        console.log('Sample metrics data:', Object.entries(metrics).slice(0, 10).map(([id, data]) => ({
            id,
            displayName: data.displayProperties?.name || 'Unknown',
            objectiveProgress: data.objectiveProgress?.progress || 0
        })));
        
        // Search for metrics by keywords to help identify correct IDs
        const searchMetrics = (keywords) => {
            return Object.entries(metrics).filter(([id, data]) => {
                const name = data.displayProperties?.name?.toLowerCase() || '';
                return keywords.some(keyword => name.includes(keyword.toLowerCase()));
            }).map(([id, data]) => ({
                id,
                name: data.displayProperties?.name,
                progress: data.objectiveProgress?.progress || 0
            }));
        };
        
        console.log('Trials metrics:', searchMetrics(['trials', 'flawless', 'carries']));
        console.log('Crucible metrics:', searchMetrics(['crucible', 'defeats', 'kills', 'kda']));
        console.log('Iron Banner metrics:', searchMetrics(['iron banner', 'banner']));
        
        const trials = {
            flawlessWeekly:
                metrics[TRIALS_WEEKLY_FLAWLESS]?.objectiveProgress?.progress || 0,
            flawlessSeason:
                metrics[TRIALS_SEASON_FLAWLESS]?.objectiveProgress?.progress || 0,
            flawlessLifetime:
                metrics[TRIALS_LIFETIME_FLAWLESS]?.objectiveProgress?.progress || 0,

            winStreakWeekly:
                metrics[TRIALS_WEEKLY_WIN_STREAK]?.objectiveProgress?.progress || 0,
            winStreakSeason:
                metrics[TRIALS_SEASON_WIN_STREAK]?.objectiveProgress?.progress || 0,

            defeatsWeekly:
                metrics[TRIALS_WEEKLY_DEFEATS]?.objectiveProgress?.progress || 0,
            defeatsSeason:
                metrics[TRIALS_SEASON_DEFEATS]?.objectiveProgress?.progress || 0,
            defeatsLifetime:
                metrics[TRIALS_LIFETIME_DEFEATS]?.objectiveProgress?.progress || 0,

            winsWeekly:
                metrics[TRIALS_WEEKLY_WINS]?.objectiveProgress?.progress || 0,
            winsSeason:
                metrics[TRIALS_SEASON_WINS]?.objectiveProgress?.progress || 0,
            winsLifetime:
                metrics[TRIALS_LIFETIME_WINS]?.objectiveProgress?.progress || 0,

            carriesWeekly:
                metrics[TRIALS_WEEKLY_CARRIES]?.objectiveProgress?.progress || 0,
            carriesSeason:
                metrics[TRIALS_SEASON_CARRIES]?.objectiveProgress?.progress || 0,
        };

        const ironBanner = {
            winsSeason:
                metrics[IRON_BANNER_SEASON_WINS]?.objectiveProgress?.progress || 0,
            goldMedalsSeason:
                metrics[IRON_BANNER_SEASON_GOLD_MEDALS]?.objectiveProgress?.progress || 0,
            efficiencySeason:
                (metrics[IRON_BANNER_SEASON_EFFICIENCY]?.objectiveProgress?.progress || 0) / 100,
            defeatsSeason:
                metrics[IRON_BANNER_SEASON_KILLS]?.objectiveProgress?.progress || 0,
        };

        const crucible = {
            defeatsWeekly:
                metrics[CRUCIBLE_WEEKLY_DEFEATS]?.objectiveProgress?.progress || 0,
            defeatsSeason:
                metrics[CRUCIBLE_SEASON_DEFEATS]?.objectiveProgress?.progress || 0,
            defeatsLifetime:
                metrics[CRUCIBLE_LIFETIME_DEFEATS]?.objectiveProgress?.progress || 0,

            winStreakWeekly:
                metrics[CRUCIBLE_WEEK_WIN_STREAK]?.objectiveProgress?.progress || 0,
            winStreakSeason:
                metrics[CRUCIBLE_SEASON_WIN_STREAK]?.objectiveProgress?.progress || 0,

            kdaSeason:
                (metrics[CRUCIBLE_SEASON_KDA]?.objectiveProgress?.progress || 0) / 100,

            winRateSeason:
                metrics[CRUCIBLE_SEASON_WIN_RATE]?.objectiveProgress?.progress || 0,
        };

        return new PlayerMetrics({ trials, ironBanner, crucible });
    }
}

export default PlayerMetrics;
