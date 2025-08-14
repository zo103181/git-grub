import React, { useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, TransitionChild } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, BellIcon } from '@heroicons/react/24/outline';
import SideNav from '../components/SideNav';

export const SideNavigationLayout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-full bg-white lg:pl-72">
            {/* Mobile sidebar */}
            <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
                <DialogBackdrop className="fixed inset-0 bg-gray-900/80 transition-opacity" />
                <div className="fixed inset-0 flex">
                    <DialogPanel className="relative mr-16 flex w-full max-w-xs flex-1 transform bg-gray-900 px-6 pb-2 pt-6 transition ease-in-out">
                        <TransitionChild>
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(false)}
                                className="absolute top-0 right-0 m-4 p-2 text-gray-300 hover:text-white"
                            >
                                <span className="sr-only">Close sidebar</span>
                                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                        </TransitionChild>
                        <SideNav />
                    </DialogPanel>
                </div>
            </Dialog>

            {/* Static sidebar for desktop */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                <SideNav />
            </div>

            {/* Main content */}
            <div className="sticky top-0 z-40 flex items-center gap-x-4 border-b border-gray-200 bg-white px-4 py-4 shadow-sm sm:px-6 lg:px-8 lg:pl-0">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="text-gray-700 lg:hidden p-2 rounded-md"
                >
                    <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                </button>
                <span className="flex-1" />
                <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6 cursor-pointer" aria-hidden="true" />
                </button>
                {/* Profile dropdown can go here */}
            </div>

            <main>{children}</main>
        </div>
    );
};