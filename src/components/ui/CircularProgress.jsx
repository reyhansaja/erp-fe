import React from 'react';
import { cn } from '../../lib/utils';

const CircularProgress = ({
    progress = 0,
    size = 40,
    strokeWidth = 4,
    className
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;
    const isDone = progress === 100;

    return (
        <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
            <svg
                width={size}
                height={size}
                className="transform -rotate-90"
            >
                {/* Background Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-white/10"
                />
                {/* Progress Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={cn(
                        "transition-all duration-700 ease-out",
                        isDone ? "text-success" : "text-primary"
                    )}
                />
            </svg>
            <span className={cn(
                "absolute text-[10px] font-bold tracking-tighter",
                isDone ? "text-success" : "text-white"
            )}>
                {Math.round(progress)}%
            </span>
        </div>
    );
};

export default CircularProgress;
