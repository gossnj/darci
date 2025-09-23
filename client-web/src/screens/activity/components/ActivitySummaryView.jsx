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

import { DateTime, Interval } from "luxon";
import DurationView from "../../../components/DurationView";
import { capitalize } from "../../../core/utils/string";
import ActivityInfoView from "../../../components/ActivityInfoView";

const scoreStyle = {
    padding: "var(--padding-content)",
    height: "33%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
};

const spacerContainerStyle = {
    height: "50%",
};

const gameInfoContainterStyle = {
    height: "25%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",

    backgroundColor: "var(--color-text-container-background)",
    fontWeight: "var(--regular)",
    padding: "var(--padding-content)",
};

const gameInfoStyle = {
    width: "70%",
};

const matchTimeStyle = {
    width: "30%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    whiteSpace: "nowrap",
};

const teamScoresStyle = {
    display: "flex",
    flexDirection: "row",
    gap: "10px",
};

const scoreDivider = {
    borderColor: "#ffffff",
    borderStyle: "solid",
    borderWidth: "0px 1px 0px 0px",
};

const summaryStyleBase = {
    width: "100%",
    maxWidth: "800px",
    height: "500px",
    minHeight: "300px",

    backgroundSize: "cover",

    borderRadius: 4,
    display: "flex",
    flexDirection: "column",
    //alignItems: "space-around",
};

const ActivitySummaryView = (props) => {
    const details = props.details;
    const teams = props.teams;

    const summaryStyle = {
        ...summaryStyleBase,
        backgroundImage: `url(${details.map.image})`,
    };

    let alphaTeam = teams[0];
    let betaTeam = teams[1];

    //todo: change based on time
    let period = DateTime.fromJSDate(details.period);
    let now = DateTime.now();
    let diff = Interval.fromDateTimes(period, now).length("days");
    let periodHuman;
    if (diff < 2) {
        periodHuman = `${capitalize(
            period.toRelativeCalendar()
        )} at ${period.toFormat("t")}`;
    } else if (diff < 7) {
        periodHuman = period.toFormat("EEEE, LLLL d 'at' t");
    } else if (period.get("year") !== now.get("year")) {
        periodHuman = period.toFormat("LLLL d, kkkk 'at' t");
    } else {
        periodHuman = period.toFormat("LLLL d 'at' t");
    }

    return (
        <div style={summaryStyle}>
            <div style={scoreStyle}>
                <div className="activity_completion_reason">
                    {details.completionReason.label}
                </div>

                {(() => {
                    //if only alpha team, then it means we are in a private match
                    //rumble. So team score doesnt make sense.
                    if (!betaTeam) {
                        return "";
                    }

                    return (
                        <div style={teamScoresStyle}>
                            <div className="alpha_team activity_score_box">
                                {alphaTeam.score}
                            </div>
                            <div style={scoreDivider}></div>
                            <div className="bravo_team activity_score_box">
                                {betaTeam.score}
                            </div>
                        </div>
                    );
                })()}
                <DurationView
                    duration={details.activityDurationSeconds * 1000}
                />
            </div>
            <div style={spacerContainerStyle}></div>
            <div style={gameInfoContainterStyle}>
                <div style={gameInfoStyle}>
                    <ActivityInfoView
                        modeInfo={details.modeInfo}
                        mapName={details.map.name}
                    />
                </div>
                <div style={matchTimeStyle}>
                    <div>{periodHuman}</div>
                </div>
            </div>
        </div>
    );
};

export default ActivitySummaryView;
