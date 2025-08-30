import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { FC, useRef } from 'react'

interface ModalDialogAlertProps {
    type: 'error' | 'success' | 'info' | 'warning'
    title: string
    message: string
    open: boolean
    setOpen: (show: boolean) => void
    action: {
        text: string
        onClick: () => void
        disabled?: boolean
    }
    dismiss?: { text: string; disabled?: boolean }
}

const variant = {
    success: { icon: CheckCircleIcon, iconBg: 'bg-green-100', iconColor: 'text-green-600', btn: 'bg-green-600 hover:bg-green-500' },
    error: { icon: ExclamationTriangleIcon, iconBg: 'bg-red-100', iconColor: 'text-red-600', btn: 'bg-red-600 hover:bg-red-500' },
    info: { icon: InformationCircleIcon, iconBg: 'bg-blue-100', iconColor: 'text-blue-600', btn: 'bg-blue-600 hover:bg-blue-500' },
    warning: { icon: ExclamationTriangleIcon, iconBg: 'bg-yellow-100', iconColor: 'text-yellow-600', btn: 'bg-yellow-600 hover:bg-yellow-500' },
}

const ModalDialogAlert: FC<ModalDialogAlertProps> = ({ type, title, message, open, setOpen, action, dismiss }) => {
    const v = variant[type]
    const cancelRef = useRef<HTMLButtonElement>(null)

    return (
        <Dialog open={open} onClose={setOpen} className="fixed inset-0 z-50 overflow-y-auto" initialFocus={cancelRef}>
            <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity" />
            <div className="flex items-center justify-center min-h-screen p-4">
                <DialogPanel transition className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-lg">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className={`mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${v.iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
                                <v.icon aria-hidden="true" className={`h-6 w-6 ${v.iconColor}`} />
                            </div>
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                                    {title}
                                </DialogTitle>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">{message}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                            type="button"
                            onClick={action.onClick}
                            disabled={action.disabled}
                            className={`cursor-pointer inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto disabled:opacity-60 ${v.btn}`}
                        >
                            {action.text}
                        </button>
                        {dismiss && (
                            <button
                                type="button"
                                ref={cancelRef}
                                onClick={() => setOpen(false)}
                                disabled={dismiss.disabled}
                                className="cursor-pointer mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:opacity-60"
                            >
                                {dismiss.text}
                            </button>
                        )}
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    )
}

export default ModalDialogAlert
