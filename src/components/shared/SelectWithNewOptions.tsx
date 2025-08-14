// src/components/SelectWithNewOption.tsx
import { ChangeEvent } from 'react';

interface SelectWithNewOptionProps<T> {
    id: string;
    label?: string;
    name: string;
    value: string;
    isNew?: boolean;
    newValue?: string;
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    handleNewChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    handleClear?: () => void;
    error?: string;
    options: T[];
    getValue: (opt: T) => string;
    getLabel: (opt: T) => string;
}

export function SelectWithNewOption<T>({
    id,
    label,
    name,
    value,
    newValue,
    isNew = false,
    onChange,
    handleNewChange,
    handleClear,
    error,
    options,
    getValue,
    getLabel,
}: SelectWithNewOptionProps<T>) {
    // Reusable className snippets
    const baseSelectCls =
        'mt-1 block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm';
    const errorRingCls = error ? ' ring-red-500' : '';
    const selectCls = `${baseSelectCls}${errorRingCls}`;

    const baseInputCls =
        'block w-full rounded-none rounded-l-md border-gray-300 py-1.5 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm';
    const inputErrorCls = error ? ' border-red-500' : '';
    const inputCls = `${baseInputCls}${inputErrorCls}`;

    const clearButtonCls =
        'relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-normal text-gray-900 ring-1 ring-inset hover:bg-gray-50';
    const clearErrCls = error ? ' ring-red-500' : ' ring-gray-300';
    const clearCls = `${clearButtonCls}${clearErrCls}`;

    return (
        <div>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}

            {!isNew ? (
                // Normal <select> mode
                <select
                    id={id}
                    name={name}
                    value={value || ''}
                    onChange={(e) => {
                        onChange(e);
                        // If user explicitly picks “new”, clear the newValue text
                        if (e.target.value === 'new' && handleNewChange) {
                            handleNewChange({ target: { value: '' } } as ChangeEvent<HTMLInputElement>);
                        }
                    }}
                    className={selectCls}
                >
                    {/* Empty placeholder (hidden, disabled) */}
                    <option value="" disabled hidden />

                    {/* If handleNewChange is provided, show a “-- New --” sentinel */}
                    {handleNewChange && (
                        <option key="new" value="new">
                            -- New --
                        </option>
                    )}

                    {/* Render actual options from T[] */}
                    {options.map((opt, idx) => {
                        const uid = getValue(opt);
                        return (
                            <option key={uid + '-' + idx} value={uid}>
                                {getLabel(opt)}
                            </option>
                        );
                    })}
                </select>
            ) : (
                <div className="mt-2 flex rounded-md shadow-sm">
                    <div className="relative flex flex-grow items-stretch focus-within:z-10">
                        <input
                            id={id}
                            name={name + '.name'}
                            type="text"
                            value={newValue}
                            onChange={handleNewChange}
                            className={inputCls}
                        />
                    </div>
                    <button type="button" onClick={handleClear} className={clearCls}>
                        Clear
                    </button>
                </div>
            )}

            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}
