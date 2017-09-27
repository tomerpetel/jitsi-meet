import {
    SET_CONFERENCE_TIMESTAMP,
    SET_CONFERENCE_URL,
    SET_MIC_MUTED,
    SET_RECENT_URLS
} from './actionTypes';
import { MAX_RECENT_URLS } from './constants';

/**
 * Stores a timestamp when the conference is joined, so that the watch counterpart can start counting from when
 * the meeting has really started.
 *
 * @param {number} conferenceTimestamp - A timestamp retrieved with {@code newDate.getTime()}.
 * @returns {{
 *      conferenceTimestamp: number,
 *      type: SET_CONFERENCE_TIMESTAMP
 * }}
 */
export function setConferenceTimestamp(conferenceTimestamp) {
    return {
        type: SET_CONFERENCE_TIMESTAMP,
        conferenceTimestamp
    };
}

/**
 * Updates the watch about the current conference URL. The 'NULL' string is
 * used when not in a conference.
 *
 * @param {string} conferenceURL - The new conference URL to be set.
 * @returns {{
 *     type,
 *     conferenceTimestamp: number,
 *     conferenceURL: string
 * }}
 */
export function setConferenceURL(conferenceURL) {
    return {
        type: SET_CONFERENCE_URL,
        conferenceURL,
        sessionID: new Date().getTime()
    };
}

/**
 * Updates the watch about the microphone muted state.
 *
 * @param {boolean} micMuted - Whether or not the microphone is muted.
 * @returns {{
 *     micMuted: boolean,
 *     type: SET_MIC_MUTED
 * }}
 */
export function setMicMuted(micMuted) {
    return {
        type: SET_MIC_MUTED,
        micMuted
    };
}

/**
 * Updates the watch about recent meetings state.
 *
 * @param {Objects} recentURLs - The state structure as defined by
 * the 'features/recent-list' reducer (an Array at the time of this writing).
 * @returns {{
 *     micMuted: boolean,
 *     type: SET_MIC_MUTED
 * }}
 */
export function setRecentUrls(recentURLs) {
    // Trim to MAX_RECENT_URLS and reverse the list
    const reversedList = recentURLs.slice(-MAX_RECENT_URLS);

    reversedList.reverse();

    return {
        type: SET_RECENT_URLS,
        recentURLs: reversedList
    };
}
