/**
 * See {@link setConferenceURL} action for more details.
 * {
 *     type: SET_CONFERENCE_URL,
 *     conferenceURL: String
 * }
 */
export const SET_CONFERENCE_URL = Symbol('WATCH_OS_SET_CONFERENCE_URL');

/**
 * See {@link setConferenceTimestamp} for more details.
 * {
 *      type: SET_CONFERENCE_TIMESTAMP,
 *      conferenceTimestamp: number
 * }
 */
export const SET_CONFERENCE_TIMESTAMP = Symbol('WATCH_OS_SET_CONFERENCE_TIMESTAMP');

/**
 * See {@link setMicMuted} action for more details.
 * {
 *     type: SET_MIC_MUTED,
 *     micMuted: boolean
 * }
 */
export const SET_MIC_MUTED = Symbol('WATCH_OS_SET_MIC_MUTED');

/**
 * See {@link setRecentUrls} action for more details.
 * {
 *     type: ADD_RECENT_URL,
 *     recentURLs: Array
 * }
 */
export const SET_RECENT_URLS = Symbol('WATCH_OS_SET_RECENT_URLS');

