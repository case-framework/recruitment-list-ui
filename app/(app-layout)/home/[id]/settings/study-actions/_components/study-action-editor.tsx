import ExpressionPreview from "@/components/expression-preview/expression-preview";
import Filepicker from "@/components/Filepicker";
import LoadingButton from "@/components/loading-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StudyAction } from "@/lib/backend/types";
import { Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';


interface StudyActionEditorProps {
    open: boolean;
    isLoading: boolean;
    action?: StudyAction;
    onChange: (action: StudyAction) => void;
    onDelete?: () => void;
}

const generateDefaultEmptyAction = (): StudyAction => {
    return {
        id: uuidv4(),
        label: '',
        description: '',
        encodedAction: '',
    }
}

const StudyActionEditor: React.FC<StudyActionEditorProps> = ({ action, open, isLoading, onChange, onDelete }) => {
    const [currentAction, setCurrentAction] = useState<StudyAction>(
        action || generateDefaultEmptyAction()
    )
    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

    useEffect(() => {
        setCurrentAction(action || generateDefaultEmptyAction());
        setErrorMsg(undefined);
    }, [action, open]);

    return (
        <div className="min-w-96 space-y-4">
            <h1 className="text-lg font-bold flex items-center gap-2 justify-between">
                <span>
                    {action ? 'Edit' : 'New'} Study Action
                </span>

                {action && (
                    <Button variant="outline" size="icon" onClick={onDelete} className="ml-auto">
                        <Trash2Icon className="size-4" />
                    </Button>
                )}
            </h1>

            <Label className="flex flex-col gap-2">
                <p>Action label <span className="text-red-500">*</span></p>
                <Input
                    required
                    placeholder="e.g. 'Invite to study'"
                    value={currentAction.label}
                    onChange={(e) => setCurrentAction(prev => ({ ...prev, label: e.target.value }))}
                />
            </Label>

            <Label className="flex flex-col gap-2">
                <p>Action description <span className="text-red-500">*</span></p>
                <Textarea
                    placeholder="e.g. 'Short description of the action'"
                    value={currentAction.description}
                    onChange={(e) => setCurrentAction(prev => ({ ...prev, description: e.target.value }))}
                />
            </Label>

            <Filepicker
                label="Select a study action"
                id="study-action-editor-filepicker"
                accept={{
                    'application/json': ['.json']
                }}
                onChange={(files) => {
                    if (files.length > 0) {
                        setErrorMsg(undefined);
                        // read file as a json
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const text = e.target?.result;
                            if (typeof text === 'string') {
                                try {
                                    const data = JSON.parse(text);
                                    if (!Array.isArray(data)) {
                                        setErrorMsg('Invalid JSON file. Expected an array of expressions.');
                                        setCurrentAction(prev => ({
                                            ...prev,
                                            encodedAction: ''
                                        }));
                                        return;
                                    }
                                    setCurrentAction(prev => ({
                                        ...prev,
                                        encodedAction: text
                                    }));
                                } catch (e) {
                                    setErrorMsg('Invalid JSON file');
                                    return;
                                }
                            } else {
                                setErrorMsg('Invalid file');
                                setCurrentAction(prev => ({
                                    ...prev,
                                    encodedAction: ''
                                }));
                            }
                        }
                        reader.readAsText(files[0]);
                    }
                }}
            />
            {errorMsg && <p className="text-red-500">{errorMsg}</p>}

            {currentAction.encodedAction && (
                <div className="space-y-2">
                    <p className="text-sm font-medium">Preview of the selected study action</p>
                    <div className="max-h-[200px] overflow-y-auto">
                        <ExpressionPreview
                            expressions={JSON.parse(currentAction.encodedAction)}
                        />
                    </div>
                </div>
            )}

            <div className='flex justify-end'>
                <LoadingButton
                    isLoading={isLoading}
                    disabled={!currentAction.encodedAction || currentAction.label === '' || currentAction.description === ''}
                    onClick={() => {
                        if (currentAction.id === '') {
                            currentAction.id = uuidv4();
                        }
                        onChange(currentAction);
                    }}
                >
                    Save
                </LoadingButton>
            </div>

        </div>
    );
};

export default StudyActionEditor;