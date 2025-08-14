import { ChangeEvent, Dispatch, SetStateAction } from "react";

function setNestedValue<T>(obj: T, path: string, value: unknown): void {
    const keys = path.split('.');
    // eslint-disable-next-line
    let temp: any = obj;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i] as keyof typeof temp;
        if (!(key in temp) || typeof temp[key] !== 'object' || temp[key] === null) {
            temp[key] = {};
        }
        temp = temp[key];
    }

    temp[keys[keys.length - 1]] = value;
}

/**
 * Generic input‐change handler for nested form fields.
 */
export function handleInputChange<
    TForm extends object,
    TErr extends Record<string, string | undefined>
>(
    setFormData: Dispatch<SetStateAction<TForm>>,
    setErrors: Dispatch<SetStateAction<TErr>>,
    validateField: (fieldName: string, value: string | number | Date | null) => string
) {
    return (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // 1) Update form data at the nested path
        setFormData((prev) => {
            const updated = { ...prev };
            setNestedValue(updated, name, value || null);
            return updated;
        });

        // 2) Validate
        const errorMsg = validateField(name, value || null);

        // 3) Merge into errors
        setErrors((prev) => {
            if (errorMsg) {
                return { ...prev, [name]: errorMsg } as TErr;
            } else {
                const { [name]: _, ...rest } = prev;
                return rest as TErr;
            }
        });
    };
}

/**
 * Generic “new‐option” text‐change handler for a single field.
 */
export function handleNewChange<
    TForm extends object,
    TErr extends Record<string, string | undefined>
>(
    setFormData: Dispatch<SetStateAction<TForm>>,
    setErrors: Dispatch<SetStateAction<TErr>>,
    validateField: (fieldName: string, value: string | number | Date | null) => string,
    name: string
) {
    return (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;

        // 1) Update nested formData[name]
        setFormData((prev) => {
            const updated = { ...prev };
            setNestedValue(updated, name, value);
            return updated;
        });

        // 2) Validate
        const errorMsg = validateField(name, value);

        // 3) Merge into errors
        setErrors((prev) => ({
            ...prev,
            [name]: errorMsg || undefined,
        } as TErr));
    };
}

export function handleSelectChange<
    TOption,
    TForm extends object,
    TErr extends Record<string, string | undefined>
>(
    setFormData: Dispatch<SetStateAction<TForm>>,
    setErrors: Dispatch<SetStateAction<TErr>>,
    setSelectionState: Dispatch<SetStateAction<{
        isNew: Record<string, boolean>;
        previousSelections: Record<string, string | null>;
    }>>,
    field: keyof TForm,
    options: TOption[] | null,
    getValue: (opt: TOption) => string,
    validateField: (fieldName: string, value: string | null) => string,
    newOptionValue = 'new'
) {
    return (e: ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.target;
        const isNewOption = value === newOptionValue;

        // 1) Update selectionState
        setSelectionState((prev) => ({
            isNew: {
                ...prev.isNew,
                [String(field)]: isNewOption,
            },
            previousSelections: isNewOption
                ? { ...prev.previousSelections } // keep old selection around
                : {
                    ...prev.previousSelections,
                    [String(field)]: value,
                },
        }));

        // 2) Look up the chosen T (unless “new”)
        let newObj: any = null;
        if (!isNewOption && options) {
            newObj = options.find((opt) => getValue(opt) === value) || null;
        }

        // 3) Update formData[field] = either the found T or a placeholder { getValue: 'new', getLabel: '' }
        setFormData((prev) => ({
            ...prev,
            [field]: isNewOption ? ({} as any) /* you can choose a sensible “empty T” here */ : newObj,
        }));

        // 4) Validate and update errors under key `${field}.value`
        const error = validateField(`${String(field)}.value`, isNewOption ? '' : value || null);
        setErrors(prev => {
            if (error) {
                return { ...prev, [`${String(field)}.value`]: error } as TErr;
            } else {
                const { [`${String(field)}.value`]: _, ...rest } = prev;
                return rest as TErr;
            }
        });
    };
}

export function handleSelectClear<
    TOption,
    TForm extends object,
    TErr extends Record<string, string | undefined>
>(
    setFormData: Dispatch<SetStateAction<TForm>>,
    setErrors: Dispatch<SetStateAction<TErr>>,
    setSelectionState: Dispatch<
        SetStateAction<{
            isNew: Record<string, boolean>;
            previousSelections: Record<string, string | null>;
        }>
    >,
    selectionState: {
        isNew: Record<string, boolean>;
        previousSelections: Record<string, string | null>;
    },
    field: keyof TForm,
    options: TOption[] | null,
    getValue: (opt: TOption) => string,
    validateField: (fieldName: string, value: string | number | null) => string
) {
    return () => {
        // Flip isNew back to false
        setSelectionState((prev) => ({
            ...prev,
            isNew: { ...prev.isNew, [String(field)]: false },
        }));

        // Look up the previous selection value
        const prevVal = selectionState.previousSelections[String(field)];
        let newObj: any = null;
        if (prevVal && options) {
            newObj = options.find((opt) => getValue(opt) === prevVal) || null;
        }

        // Update the form data
        setFormData((prev) => ({
            ...prev,
            [field]: newObj,
        }));

        // Re-validate
        const errorMsg = validateField(`${String(field)}.value`, prevVal || null);
        setErrors((prev) => {
            if (errorMsg) {
                return { ...prev, [`${String(field)}.value`]: errorMsg } as TErr;
            } else {
                const { [`${String(field)}.value`]: _, ...rest } = prev;
                return rest as TErr;
            }
        });
    };
}