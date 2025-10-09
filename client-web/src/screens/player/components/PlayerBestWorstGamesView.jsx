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
import { useNavigate } from "react-router-dom";
import { formatFloat, formatInt } from "../../../core/utils/string";
import { calculateKillsDeathsRatio, calculateEfficiency } from "shared";
import "../../../css/PlayerBestWorstGames.css";

const PlayerBestWorstGamesView = (props) => {
    const highlights = props.highlights;
    const navigate = useNavigate();

    if (!highlights) {
        return <div className="highlights-no-data">No highlight data available</div>;
    }

    const { bestKills, bestKD, bestEfficiency, worstKD, mostDeaths } = highlights;

    const getActivityName = (activity) => {
        return activity.activity.map?.name || "Unknown Map";
    };

    const getActivityMode = (activity) => {
        return activity.activity.mode?.label || "Unknown Mode";
    };

    const formatDate = (period) => {
        const date = new Date(period);
        return date.toLocaleDateString();
    };

    const onActivityClick = (activityId) => {
        navigate(`/activity/${activityId}`);
    };

    const renderActivityCard = (activity, metricLabel, metricValue) => {
        const stats = activity.stats;
        const kd = calculateKillsDeathsRatio(stats.kills, stats.deaths);
        const efficiency = calculateEfficiency(stats.kills, stats.assists, stats.deaths);
        const isVictory = stats.standing === 0;

        return (
            <div
                key={activity.activity.activityId}
                className="highlight-card"
                onClick={() => onActivityClick(activity.activity.activityId)}
            >
                <div className={`highlight-card-header ${isVictory ? 'victory' : 'defeat'}`}>
                    <div className="highlight-map">{getActivityName(activity)}</div>
                    <div className="highlight-result">{isVictory ? "Victory" : "Defeat"}</div>
                </div>
                <div className="highlight-mode">{getActivityMode(activity)}</div>
                <div className="highlight-metric">
                    <span className="metric-label">{metricLabel}:</span>
                    <span className="metric-value">{metricValue}</span>
                </div>
                <div className="highlight-stats">
                    <div className="stat-item">
                        <span className="stat-label">K/D/A</span>
                        <span className="stat-value">
                            {formatInt(stats.kills)}/{formatInt(stats.deaths)}/{formatInt(stats.assists)}
                        </span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">K/D</span>
                        <span className="stat-value">{formatFloat(kd)}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Efficiency</span>
                        <span className="stat-value">{formatFloat(efficiency)}</span>
                    </div>
                </div>
                <div className="highlight-date">{formatDate(activity.activity.period)}</div>
            </div>
        );
    };

    return (
        <div className="player-best-worst-games">
            <div className="highlights-section best-games">
                <h3 className="section-title">Best Performances</h3>

                <div className="highlights-category">
                    <h4 className="category-title">Most Kills</h4>
                    <div className="highlights-grid">
                        {bestKills.map(activity =>
                            renderActivityCard(
                                activity,
                                "Kills",
                                formatInt(activity.stats.kills)
                            )
                        )}
                    </div>
                </div>

                <div className="highlights-category">
                    <h4 className="category-title">Best K/D Ratio</h4>
                    <div className="highlights-grid">
                        {bestKD.map(activity =>
                            renderActivityCard(
                                activity,
                                "K/D",
                                formatFloat(activity.calculatedKD)
                            )
                        )}
                    </div>
                </div>

                <div className="highlights-category">
                    <h4 className="category-title">Best Efficiency</h4>
                    <div className="highlights-grid">
                        {bestEfficiency.map(activity =>
                            renderActivityCard(
                                activity,
                                "Opponents Defeated",
                                formatInt(activity.stats.opponentsDefeated)
                            )
                        )}
                    </div>
                </div>
            </div>

            <div className="highlights-section worst-games">
                <h3 className="section-title">Challenging Games</h3>

                <div className="highlights-category">
                    <h4 className="category-title">Toughest Matches (K/D)</h4>
                    <div className="highlights-grid">
                        {worstKD.map(activity =>
                            renderActivityCard(
                                activity,
                                "K/D",
                                formatFloat(activity.calculatedKD)
                            )
                        )}
                    </div>
                </div>

                <div className="highlights-category">
                    <h4 className="category-title">Most Deaths</h4>
                    <div className="highlights-grid">
                        {mostDeaths.map(activity =>
                            renderActivityCard(
                                activity,
                                "Deaths",
                                formatInt(activity.stats.deaths)
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerBestWorstGamesView;
