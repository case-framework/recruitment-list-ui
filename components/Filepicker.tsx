import clsx from 'clsx';
import React, { useEffect } from 'react';
import { Accept, FileWithPath, useDropzone } from "react-dropzone";
//import { BsFileEarmarkArrowUp } from 'react-icons/bs';
import { FileUpIcon } from 'lucide-react';

interface FilepickerProps {
    id: string;
    label?: string;
    accept?: Accept;

    placeholders?: {
        upload: string;
        drag: string;
    }

    onChange: (files: readonly FileWithPath[]) => void;
}

const Filepicker: React.FC<FilepickerProps> = (props) => {
    const { onChange } = props;
    const {
        acceptedFiles,
        isDragActive,
        getRootProps, getInputProps } = useDropzone({
            accept: props.accept,
            // disabled: true
        });


    useEffect(() => {
        onChange(acceptedFiles);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [acceptedFiles]);

    const placeholders = {
        upload: props.placeholders?.upload || 'Click to pick a file',
        drag: props.placeholders?.drag || 'or Drag and drop'
    }

    return (
        <div className=''>
            {props.label && (
                <label htmlFor={props.id}
                    className="block text-sm font-medium text-foreground pb-1.5"
                >
                    {props.label}
                </label>
            )}

            <div
                className={clsx("border-2 border-dashed border-neutral-200  rounded-md p-4 hover:border-neutral-400 cursor-pointer outline-black",
                    {
                        "border-neutral-400 bg-neutral-100": isDragActive,
                    }
                )}
                {...getRootProps()}>
                <input
                    id={props.id}
                    className=""
                    {...getInputProps()} />
                <div className='flex justify-center items-center gap-2'>
                    {acceptedFiles.length > 0 ? <p>{
                        acceptedFiles[0].name
                    }</p> : <>
                        <span className='text-2xl text-neutral-400'>
                            <FileUpIcon />
                        </span>
                        <p>
                            <span className='text-cyan-800 me-1'>
                                {placeholders.upload}
                            </span>
                            <span>
                                {placeholders.drag}
                            </span>
                        </p>
                    </>}
                </div>
            </div>
        </div>
    );
};

export default Filepicker;
