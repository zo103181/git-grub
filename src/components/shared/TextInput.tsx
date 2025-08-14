import { ChangeEvent, FC, HTMLInputAutoCompleteAttribute, KeyboardEvent } from 'react';

interface TextInputProps {
    id: string;
    name: string;
    type: 'text' | 'number' | 'date';
    value: string | number | null;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void; // Optional, for date input
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    autoComplete?: HTMLInputAutoCompleteAttribute;
}

export const TextInput: FC<TextInputProps> = ({
    id,
    name,
    type,
    value,
    onChange,
    error,
    onKeyDown,
    label,
    placeholder,
    disabled = false,
    autoComplete
}) => (
    <div>
        {label && (<label htmlFor={id} className="block text-sm font-medium text-gray-700">
            {label}
        </label>)}
        <input
            id={id}
            name={name}
            type={type}
            value={value || ''}
            onChange={onChange}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete={autoComplete}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${error ? 'border-red-500' : 'border-gray-300'}`}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

export default TextInput;
