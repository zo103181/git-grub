'use client';

import ModalDialogAlert from '@/components/overlays/ModalDialogAlert';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextType {
    confirm: (options: Omit<ModalOptions, 'action'> & { actionText?: string }) => Promise<boolean>
    openModal: (options: ModalOptions) => void
    closeModal: () => void
}

interface ModalOptions {
    type: 'error' | 'success' | 'info' | 'warning';
    title: string;
    message: string;
    action: {
        text: string;
        onClick: () => void;
    };
    dismiss?: { text: string };
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModalDialogAlert = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModalDialogAlert must be used within a ModalProvider');
    }
    return context;
};

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [modalOptions, setModalOptions] = useState<ModalOptions | null>(null);

    const openModal = (options: ModalOptions) => {
        setModalOptions(options);
    };

    const closeModal = () => {
        setModalOptions(null);
    };

    const confirm = (options: Omit<ModalOptions, 'action'> & { actionText?: string }) =>
        new Promise<boolean>((resolve) => {
            setModalOptions({
                ...options,
                action: {
                    text: options.actionText ?? 'Confirm',
                    onClick: () => { closeModal(); resolve(true) },
                },
                dismiss: { text: options.dismiss?.text ?? 'Cancel' },
            })
        })

    return (
        <ModalContext.Provider value={{ openModal, closeModal, confirm }}>
            {children}
            {modalOptions && (
                <ModalDialogAlert
                    {...modalOptions}
                    open={!!modalOptions}
                    setOpen={() => closeModal()}
                />
            )}
        </ModalContext.Provider>
    );
};
