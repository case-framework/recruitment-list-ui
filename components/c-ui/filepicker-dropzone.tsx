"use client"

import { FileUpIcon } from "lucide-react"
import {
  useDropzone,
  type Accept,
  type FileRejection,
  type FileWithPath,
} from "react-dropzone"

import { cn } from "@/lib/utils"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { useCallback, useEffect, useEffectEvent, useMemo } from "react"

export interface FilepickerDropzoneLabels {
  upload: string
  drag: string
  active: string
  reject: string
  rejectInvalidType: string
  rejectTooLarge: string
  rejectTooSmall: string
  rejectTooMany: string
  selectedCount: string
}

export interface FilepickerDropzoneProps
  extends Omit<React.ComponentProps<typeof Field>, "children" | "onChange"> {
  id: string
  name?: string
  label?: React.ReactNode
  description?: React.ReactNode
  error?: React.ReactNode
  accept?: Accept
  multiple?: boolean
  disabled?: boolean
  required?: boolean
  maxFiles?: number
  maxSize?: number
  minSize?: number
  icon?: React.ReactNode
  labelClassName?: string
  contentClassName?: string
  descriptionClassName?: string
  errorClassName?: string
  dropzoneClassName?: string
  labels?: Partial<FilepickerDropzoneLabels>
  onChange?: (files: readonly FileWithPath[]) => void
  onDropRejected?: (fileRejections: FileRejection[]) => void
}

const defaultLabels: FilepickerDropzoneLabels = {
  upload: "Click to pick file",
  drag: "or drag and drop",
  active: "Drop files here",
  reject: "Some files are not allowed",
  rejectInvalidType: "One or more files have an invalid type.",
  rejectTooLarge: "One or more files exceed the maximum size.",
  rejectTooSmall: "One or more files are below the minimum size.",
  rejectTooMany: "Too many files selected.",
  selectedCount: "{{count}} files selected",
}

function interpolateCount(template: string, count: number) {
  return template.replace(/\{\{\s*count\s*\}\}|\{count\}/g, String(count))
}

function FilepickerDropzone({
  id,
  name,
  label,
  description,
  error,
  accept,
  multiple = false,
  disabled = false,
  required = false,
  maxFiles,
  maxSize,
  minSize,
  icon,
  className,
  labelClassName,
  contentClassName,
  descriptionClassName,
  errorClassName,
  dropzoneClassName,
  labels,
  onChange,
  onDropRejected,
  ...props
}: FilepickerDropzoneProps) {
  const mergedLabels = { ...defaultLabels, ...labels }
  const descriptionId = description ? `${id}-description` : undefined

  const onAcceptedFilesChange = useEffectEvent(
    (files: readonly FileWithPath[]) => {
      onChange?.(files)
    }
  )

  const onRejectedFiles = useCallback(
    (rejections: FileRejection[]) => {
      onDropRejected?.(rejections)
    },
    [onDropRejected]
  )

  const {
    acceptedFiles,
    fileRejections,
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    isFocused,
  } = useDropzone({
    accept,
    multiple,
    disabled,
    maxFiles,
    maxSize,
    minSize,
    onDropRejected: onRejectedFiles,
  })

  const rejectionMessages = useMemo(() => {
    if (fileRejections.length === 0) {
      return []
    }

    const codes = new Set(
      fileRejections.flatMap((rejection) =>
        rejection.errors.map((dropzoneError) => dropzoneError.code)
      )
    )

    const messages: string[] = []

    if (codes.has("file-invalid-type")) {
      messages.push(mergedLabels.rejectInvalidType)
    }

    if (codes.has("file-too-large")) {
      messages.push(mergedLabels.rejectTooLarge)
    }

    if (codes.has("file-too-small")) {
      messages.push(mergedLabels.rejectTooSmall)
    }

    if (codes.has("too-many-files")) {
      messages.push(mergedLabels.rejectTooMany)
    }

    if (messages.length === 0) {
      messages.push(mergedLabels.reject)
    }

    return messages
  }, [
    fileRejections,
    mergedLabels.reject,
    mergedLabels.rejectInvalidType,
    mergedLabels.rejectTooLarge,
    mergedLabels.rejectTooSmall,
    mergedLabels.rejectTooMany,
  ])

  const hasError = Boolean(error) || rejectionMessages.length > 0
  const errorId = hasError ? `${id}-error` : undefined
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined

  useEffect(() => {
    onAcceptedFilesChange(acceptedFiles)
  }, [acceptedFiles])

  const selectedCountLabel = interpolateCount(
    mergedLabels.selectedCount,
    acceptedFiles.length
  )

  return (
    <Field
      data-component="filepicker-dropzone"
      data-disabled={disabled ? true : undefined}
      data-invalid={hasError ? true : undefined}
      className={cn(className)}
      {...props}
    >
      {label && (
        <FieldLabel htmlFor={id} className={labelClassName}>
          {label}
        </FieldLabel>
      )}

      <FieldContent className={contentClassName}>
        {description && (
          <FieldDescription id={descriptionId} className={descriptionClassName}>
            {description}
          </FieldDescription>
        )}

        <div
          {...getRootProps({
            className: cn(
              "dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 relative rounded-lg border border-dashed bg-transparent p-4 transition-colors outline-none focus-visible:ring-3 aria-invalid:ring-3",
              disabled
                ? "bg-input/50 dark:bg-input/80 pointer-events-none cursor-not-allowed opacity-50"
                : "cursor-pointer hover:bg-muted/30",
              isDragActive && "border-primary bg-primary/5",
              isDragReject && "border-destructive/60 bg-destructive/5",
              isFocused && "border-ring ring-ring/50 ring-3",
              dropzoneClassName
            ),
            "aria-invalid": hasError ? true : undefined,
          })}
        >
          <input
            {...getInputProps({
              id,
              name,
              required,
              "aria-describedby": describedBy,
              "aria-invalid": hasError ? true : undefined,
            })}
          />
          <div className="flex min-h-14 flex-col items-center justify-center gap-2 text-center">
            <span
              className={cn(
                "text-muted-foreground",
                isDragActive && "text-primary",
                isDragReject && "text-destructive"
              )}
              aria-hidden="true"
            >
              {icon ?? <FileUpIcon className="size-6" />}
            </span>
            <p className="text-sm">
              {isDragReject && (
                <span className="text-destructive font-medium">
                  {mergedLabels.reject}
                </span>
              )}
              {!isDragReject && isDragActive && (
                <span className="text-primary font-medium">{mergedLabels.active}</span>
              )}
              {!isDragReject && !isDragActive && acceptedFiles.length > 0 && (
                <span className="font-medium">{selectedCountLabel}</span>
              )}
              {!isDragReject && !isDragActive && acceptedFiles.length === 0 && (
                <>
                  <span className="text-foreground font-medium">
                    {mergedLabels.upload}
                  </span>{" "}
                  <span className="text-muted-foreground">{mergedLabels.drag}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {error ? (
          <FieldError id={errorId} className={errorClassName}>
            {error}
          </FieldError>
        ) : rejectionMessages.length > 0 ? (
          <FieldError
            id={errorId}
            className={errorClassName}
            errors={rejectionMessages.map((message) => ({ message }))}
          />
        ) : null}
      </FieldContent>
    </Field>
  )
}

export { FilepickerDropzone }
