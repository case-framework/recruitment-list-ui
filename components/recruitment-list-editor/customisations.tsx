import { ListCustomization, listCustomizationSchema } from '@/lib/backend/types';
import { useEffect, useEffectEvent, useRef } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import EnumEditor from './enum-editor';

const areStringArraysEqual = (left: string[] | undefined, right: string[] | undefined) => {
    if (left === right) {
        return true;
    }

    if (!left || !right || left.length !== right.length) {
        return false;
    }

    return left.every((value, index) => value === right[index]);
};

interface CustomisationsProps {
    /** Current values (controlled mode). When provided, form syncs from this. */
    values?: ListCustomization;
    /** Initial values (uncontrolled mode). Used when values is not provided. */
    defaultValues?: ListCustomization;
    /** Called whenever the user edits. Required for embedding in config editor. */
    onChange?: (values: ListCustomization) => void;
    onSubmit?: (values: ListCustomization) => void;
    isLoading?: boolean;
}

const Customisations = (props: CustomisationsProps) => {
    const { onChange } = props;
    const isControlled = props.values !== undefined;
    const initialValues = isControlled ? props.values! : (props.defaultValues ?? { recruitmentStatusValues: [] });

    const form = useForm<ListCustomization>({
        resolver: zodResolver(listCustomizationSchema),
        mode: 'onChange',
        defaultValues: initialValues,
    });

    useEffect(() => {
        if (isControlled && props.values) {
            form.reset(props.values);
        }
    }, [form, isControlled, props.values]);

    const recruitmentStatusValues = useWatch({
        control: form.control,
        name: 'recruitmentStatusValues',
    });

    const lastEmittedValuesRef = useRef<string[] | undefined>(undefined);
    const emitChange = useEffectEvent((nextValues: string[]) => {
        onChange?.({
            recruitmentStatusValues: nextValues,
        });
    });

    useEffect(() => {
        if (!onChange) {
            return;
        }

        const nextValues = recruitmentStatusValues ?? [];
        if (areStringArraysEqual(lastEmittedValuesRef.current, nextValues)) {
            return;
        }

        lastEmittedValuesRef.current = [...nextValues];
        emitChange(nextValues);
    }, [onChange, recruitmentStatusValues]);

    const onSubmit = props.onSubmit ?? (() => undefined);

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FieldGroup>
                <Controller
                    control={form.control}
                    name="recruitmentStatusValues"
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>Recruitment status values</FieldLabel>
                            <FieldDescription>
                                These are the possible values for the recruitment status that can be assigned to participants.
                            </FieldDescription>
                            <EnumEditor
                                values={field.value ?? []}
                                onChange={field.onChange}
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
            </FieldGroup>
        </form>
    );
};

export default Customisations;
