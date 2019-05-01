// @flow

import type { Dispatch } from 'redux';

import {
    addPendingDeviceRequest,
    areDeviceLabelsInitialized,
    getAudioOutputDeviceId,
    getAvailableDevices,
    getDeviceIdByLabel,
    groupDevicesByKind,
    setAudioInputDevice,
    setAudioOutputDeviceId,
    setVideoInputDevice
} from '../base/devices';
import JitsiMeetJS from '../base/lib-jitsi-meet';
import { toState } from '../base/redux';

/**
 * Returns the properties for the device selection dialog from Redux state.
 *
 * @param {(Function|Object)} stateful -The (whole) redux state, or redux's
 * {@code getState} function to be used to retrieve the state.
 * @returns {Object} - The properties for the device selection dialog.
 */
export function getDeviceSelectionDialogProps(stateful: Object | Function) {
    const state = toState(stateful);
    const settings = state['features/base/settings'];
    const { conference } = state['features/base/conference'];
    let disableAudioInputChange = !JitsiMeetJS.mediaDevices.isMultipleAudioInputSupported();

    // multiple audio input change will be a problem only when we are in a
    // conference, when we open device selection on welcome page
    // changing input devices will not be a problem
    if (!conference) {
        disableAudioInputChange = false;
    }

    // we fill the device selection dialog with the devices that are currently
    // used or if none are currently used with what we have in settings(user selected)
    return {
        availableDevices: state['features/base/devices'].availableDevices,
        disableAudioInputChange,
        disableDeviceChange:
            !JitsiMeetJS.mediaDevices.isDeviceChangeAvailable(),
        hideAudioInputPreview:
            !JitsiMeetJS.isCollectingLocalStats(),
        hideAudioOutputSelect: !JitsiMeetJS.mediaDevices
                            .isDeviceChangeAvailable('output'),
        selectedAudioInputId: settings.micDeviceId || settings.userSelectedMicDeviceId,
        selectedAudioOutputId: getAudioOutputDeviceId() || settings.userSelectedAudioOutputDeviceId,
        selectedVideoInputId: settings.cameraDeviceId || settings.userSelectedCameraDeviceId
    };
}

/**
 * Processes device requests from external applications.
 *
 * @param {Dispatch} dispatch - The redux {@code dispatch} function.
 * @param {Function} getState - The redux function that gets/retrieves the redux
 * state.
 * @param {Object} request - The request to be processed.
 * @param {Function} responseCallback - The callback that will send the
 * response.
 * @returns {boolean} - True if the request has been processed and false otherwise.
 */
export function processExternalDeviceRequest( // eslint-disable-line max-params
        dispatch: Dispatch<any>,
        getState: Function,
        request: Object,
        responseCallback: Function) {
    if (request.type !== 'devices') {
        return false;
    }
    const state = getState();
    const settings = state['features/base/settings'];
    const { conference } = state['features/base/conference'];
    let result = true;

    switch (request.name) {
    case 'isDeviceListAvailable':
        responseCallback(JitsiMeetJS.mediaDevices.isDeviceListAvailable());
        break;
    case 'isDeviceChangeAvailable':
        responseCallback(
            JitsiMeetJS.mediaDevices.isDeviceChangeAvailable(
                request.deviceType));
        break;
    case 'isMultipleAudioInputSupported':
        responseCallback(JitsiMeetJS.isMultipleAudioInputSupported());
        break;
    case 'getCurrentDevices':
        dispatch(getAvailableDevices()).then(devices => {
            if (areDeviceLabelsInitialized(state)) {
                const deviceDescriptions = {
                    audioInput: undefined,
                    audioOutput: undefined,
                    videoInput: undefined
                };
                const currentlyUsedDeviceIds = new Set([
                    getAudioOutputDeviceId(),
                    settings.micDeviceId,
                    settings.cameraDeviceId
                ]);

                devices.forEach(device => {
                    const { deviceId, kind } = device;

                    if (currentlyUsedDeviceIds.has(deviceId)) {
                        switch (kind) {
                        case 'audioinput':
                            deviceDescriptions.audioInput = device;
                            break;
                        case 'audiooutput':
                            deviceDescriptions.audioOutput = device;
                            break;
                        case 'videoinput':
                            deviceDescriptions.videoInput = device;
                            break;
                        }
                    }
                });

                responseCallback(deviceDescriptions);
            } else {
                // The labels are not available if the A/V permissions are
                // not yet granted.
                dispatch(addPendingDeviceRequest({
                    type: 'devices',
                    name: 'getCurrentDevices',
                    responseCallback
                }));
            }
        });

        break;
    case 'getAvailableDevices':
        dispatch(getAvailableDevices()).then(devices => {
            if (areDeviceLabelsInitialized(state)) {
                responseCallback(groupDevicesByKind(devices));
            } else {
                // The labels are not available if the A/V permissions are
                // not yet granted.
                dispatch(addPendingDeviceRequest({
                    type: 'devices',
                    name: 'getAvailableDevices',
                    responseCallback
                }));
            }
        });

        break;
    case 'setDevice': {
        const { device } = request;

        if (!conference) {
            dispatch(addPendingDeviceRequest({
                type: 'devices',
                name: 'setDevice',
                device,
                responseCallback
            }));

            return true;
        }

        const { label, id } = device;
        const deviceId = label
            ? getDeviceIdByLabel(state, device.label, device.kind)
            : id;

        if (deviceId) {
            switch (device.kind) {
            case 'audioinput': {
                dispatch(setAudioInputDevice(deviceId));
                break;
            }
            case 'audiooutput':
                setAudioOutputDeviceId(deviceId, dispatch);
                break;
            case 'videoinput':
                dispatch(setVideoInputDevice(deviceId));
                break;
            default:
                result = false;
            }
        } else {
            result = false;
        }

        responseCallback(result);
        break;
    }
    default:
        return false;
    }

    return true;
}

