import React, { useState, useEffect } from 'react';
import { LuListVideo, LuPlay, LuPause } from 'react-icons/lu';
import { Task } from '../../../utilities/api';
import './index.css';

function formatTrackedTime(seconds) {
    seconds = Math.floor(seconds);

    const days = Math.floor(seconds / 86400);
    seconds %= 86400;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    const timeParts = [];

    if (days > 0) timeParts.push(days > 1 ? `${days}д.` : '1д.');
    if (hours > 0) timeParts.push(`${hours}ч.`);
    if (minutes > 0) timeParts.push(`${minutes}мин.`);
    if (seconds > 0 || timeParts.length === 0) timeParts.push(`${seconds}с.`);

    return timeParts.join(' ');
}

export const TrackerStorage = {
    isTracking: (taskId) => {
        return !!localStorage.getItem('tracking-start-' + taskId);
    },

    startTracking: (taskId) => {
        const startDate = new Date();
        localStorage.setItem('tracking-start-' + taskId, startDate);
    },

    getTrackLength: (taskId) => {
        if (!TrackerStorage.isTracking(taskId)) return [null, 0];

        const startDateStr = localStorage.getItem('tracking-start-' + taskId);
        const startDate = new Date(startDateStr);
        const now = new Date();

        return [startDate, (now - startDate) / 1000];
    },

    stopTracking: async (taskId) => {
        if (!TrackerStorage.isTracking(taskId)) return;

        const [trackDate, trackedSeconds] = TrackerStorage.getTrackLength(taskId);
        localStorage.removeItem('tracking-start-' + taskId);

        return await Task.trackTime(taskId, trackDate.toISOString(), trackedSeconds);
    },
};

const ICON_SIZE_STYLE = {
    width: '100%',
    height: '100%',
};

export function Tracker({ taskId, trackedTime, setTrackedTime }) {
    const [isTracking, setIsTracking] = useState(TrackerStorage.isTracking(taskId));
    const [liveTime, setLiveTime] = useState(trackedTime); // Отдельный стейт для динамического времени

    const updateTrack = () => {
        setIsTracking(TrackerStorage.isTracking(taskId));
    };

    useEffect(updateTrack, [trackedTime]);

    // Динамическое изменение таймера
    useEffect(() => {
        let interval;
        if (isTracking) {
            interval = setInterval(() => {
                const [, trackedSeconds] = TrackerStorage.getTrackLength(taskId);
                setLiveTime(trackedTime + trackedSeconds);
            }, 1000);
        } else {
            setLiveTime(trackedTime); // Сбрасываем liveTime на trackedTime, если трекинг остановлен
        }

        return () => clearInterval(interval); // Очищаем таймер при размонтировании или остановке трекинга
    }, [isTracking, trackedTime, taskId]);

    const startTracking = () => {
        TrackerStorage.startTracking(taskId);
        updateTrack();
    };

    const stopTracking = async () => {
        const [, trackedSeconds] = TrackerStorage.getTrackLength(taskId);
        await TrackerStorage.stopTracking(taskId);
        updateTrack();
        setTrackedTime(trackedTime + trackedSeconds);
    };

    const ActionButton = () => {
        if (isTracking) {
            return (
                <button onClick={stopTracking} className="tracker-info-button" style={{ borderRadius: '12px 0 0 12px' }}>
                    <LuPause style={ICON_SIZE_STYLE} />
                </button>
            );
        } else {
            return (
                <button onClick={startTracking} className="tracker-info-button" style={{ borderRadius: '12px 0 0 12px' }}>
                    <LuPlay style={ICON_SIZE_STYLE} />
                </button>
            );
        }
    };

    return (
        <div className="tracker-div">
            <button className="tracker-info-button" style={{ borderRadius: '0 12px 12px 0' }}>
                <LuListVideo style={ICON_SIZE_STYLE} />
            </button>
            <div className="tracker-info-total-time">{formatTrackedTime(liveTime)}</div>
            <ActionButton />
        </div>
    );
}
