// @flow

/* eslint-disable no-unused-vars */

import React from 'react';

import { Icon, IconStartRecording } from '../../../base/icons';

/**
 * Returns web element to be rendered.
 *
 * @param {string} timerValue - String to display as time.
 * @param {Object} textStyle - Unused on web.
 *
 * @returns {ReactElement}
 */
export default function renderConferenceTimer(
        timerValue: string,
        textStyle: Object,
        t: Function
) {
    return (
        <div
            className = { 'conference-recorder conference-recorder-500' }>
            <div
                className = { 'recording-title recording-title-500' }>
                <Icon src = { IconStartRecording } />
                <div
                    className = { 'recording-text' }>
                    {t('dialog.startRecording')}
                </div>
            </div>
            <div
                className = 'subject-conference-timer recording-timer recording-timer-500'>
                {timerValue}
            </div>
        </div>
    );
}
