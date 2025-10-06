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
import {
    formatFloat,
    formatInt,
    formatPercent,
} from "../../../core/utils/string";
import "../../../css/PlayerWeaponTypeAnalysis.css";

const PlayerWeaponTypeAnalysisView = (props) => {
    const weaponTypes = props.weaponTypes || [];

    if (weaponTypes.length === 0) {
        return (
            <div className="weapon-type-analysis">
                <div className="no-data">No weapon data available</div>
            </div>
        );
    }

    const getAmmunitionTypeLabel = (type) => {
        switch (type) {
            case 1:
                return "Primary";
            case 2:
                return "Special";
            case 3:
                return "Heavy";
            default:
                return "Unknown";
        }
    };

    const getAmmunitionTypeClass = (type) => {
        switch (type) {
            case 1:
                return "ammo-primary";
            case 2:
                return "ammo-special";
            case 3:
                return "ammo-heavy";
            default:
                return "ammo-unknown";
        }
    };

    return (
        <div className="weapon-type-analysis">
            <div className="weapon-type-header">
                <h2>Weapon Type Analysis</h2>
                <p className="description">
                    Performance breakdown by weapon archetype
                </p>
            </div>

            <div className="weapon-type-grid">
                {weaponTypes.map((typeData) => (
                    <div key={typeData.type} className="weapon-type-card">
                        <div className="weapon-type-card-header">
                            <h3 className="weapon-type-name">
                                {typeData.typeName}
                            </h3>
                            <span
                                className={`ammunition-badge ${getAmmunitionTypeClass(
                                    typeData.ammunitionType
                                )}`}
                            >
                                {getAmmunitionTypeLabel(
                                    typeData.ammunitionType
                                )}
                            </span>
                        </div>

                        <div className="weapon-type-stats">
                            <div className="stat-row">
                                <span className="stat-label">Total Kills</span>
                                <span className="stat-value">
                                    {formatInt(typeData.totalKills)}
                                </span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">Games Used</span>
                                <span className="stat-value">
                                    {formatInt(typeData.totalGames)}
                                </span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">
                                    Kills / Game
                                </span>
                                <span className="stat-value">
                                    {formatFloat(typeData.avgKillsPerGame)}
                                </span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">Precision %</span>
                                <span className="stat-value">
                                    {formatPercent(typeData.precisionPercent)}
                                </span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">
                                    Unique Weapons
                                </span>
                                <span className="stat-value">
                                    {formatInt(typeData.uniqueWeapons)}
                                </span>
                            </div>
                        </div>

                        {typeData.topWeapons &&
                            typeData.topWeapons.length > 0 && (
                                <div className="top-weapons">
                                    <h4 className="top-weapons-title">
                                        Top Weapons
                                    </h4>
                                    <div className="top-weapons-list">
                                        {typeData.topWeapons.map((weapon) => (
                                            <div
                                                key={weapon.id}
                                                className="top-weapon-item"
                                            >
                                                <img
                                                    src={weapon.item.icon}
                                                    alt={weapon.item.name}
                                                    className="weapon-icon"
                                                />
                                                <div className="weapon-info">
                                                    <div className="weapon-name">
                                                        {weapon.item.name}
                                                    </div>
                                                    <div className="weapon-kills">
                                                        {formatInt(
                                                            weapon.kills
                                                        )}{" "}
                                                        kills
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlayerWeaponTypeAnalysisView;
