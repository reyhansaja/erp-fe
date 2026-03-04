import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export const AdminSelect = ({ allAdmins, selectedAdminIds, onChange, disabled, onToggle }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleOpen = (state) => {
        setIsOpen(state);
        if (onToggle) onToggle(state);
    };

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen((prev) => {
                    if (prev && onToggle) onToggle(false);
                    return false;
                });
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onToggle]);

    const toggleAdmin = (adminId) => {
        if (disabled) return;
        const newSelection = selectedAdminIds.includes(adminId)
            ? selectedAdminIds.filter(id => id !== adminId)
            : [...selectedAdminIds, adminId];

        onChange(newSelection);
    };

    const getDisplayText = () => {
        if (selectedAdminIds.length === 0) return 'Assign Admin';
        if (selectedAdminIds.length === 1) {
            const admin = allAdmins.find(a => a.id === selectedAdminIds[0]);
            return admin ? admin.username : 'Unknown';
        }
        return `${selectedAdminIds.length} Assigned`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    if (!disabled) toggleOpen(!isOpen);
                }}
                disabled={disabled}
                className={`flex items-center justify-between w-32 px-3 py-1.5 text-xs text-left text-white bg-black/40 border border-white/10 rounded-lg hover:border-primary/50 focus:outline-none transition-colors ${disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <span className="truncate mr-2 font-medium">{getDisplayText()}</span>
                {!disabled && <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
            </button>

            {isOpen && !disabled && (
                <div
                    className="absolute z-[9999] w-48 mt-2 right-0 bg-gray-900 border border-white/10 rounded-lg shadow-2xl shadow-primary/20 overflow-hidden"
                    onClick={(e) => e.stopPropagation()} // prevent row click
                >
                    <div className="p-2 border-b border-white/10">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assign Admins</span>
                    </div>
                    <div className="max-h-48 overflow-y-auto w-full p-1 scrollbar-thin scrollbar-thumb-white/10">
                        {allAdmins.map((admin) => {
                            const isSelected = selectedAdminIds.includes(admin.id);
                            return (
                                <div
                                    key={admin.id}
                                    onClick={() => toggleAdmin(admin.id)}
                                    className="flex items-center justify-between px-3 py-2 cursor-pointer rounded hover:bg-white/5 transition-colors group"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-gray-500 group-hover:border-gray-400'}`}>
                                            {isSelected && <Check size={12} className="text-white" />}
                                        </div>
                                        <span className={`text-sm ${isSelected ? 'text-white font-medium' : 'text-gray-300'}`}>
                                            {admin.username}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-gray-500 uppercase">{admin.role.name}</span>
                                </div>
                            );
                        })}
                        {allAdmins.length === 0 && (
                            <div className="p-3 text-center text-xs text-gray-500">
                                No admins available
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
