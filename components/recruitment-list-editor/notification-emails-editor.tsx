import React from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader } from '../ui/card';
import { XIcon } from 'lucide-react';
import { useConfirm } from '../c-ui/confirm-provider';

interface NotificationEmailsEditorProps {
    notificationEmails?: Array<string>
    onChange: (notificationEmails: Array<string>) => void
}

const NotificationEmailsEditor: React.FC<NotificationEmailsEditorProps> = (props) => {
    const [email, setEmail] = React.useState('');
    const confirm = useConfirm();

    const isValidEmail = (email: string) => {
        email = String(email).toLowerCase()
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test(email)) {
            return false;
        };

        if (props.notificationEmails?.includes(email)) {
            return false;
        }

        return true;
    }

    const addEmail = () => {
        if (isValidEmail(email)) {
            props.onChange([...(props.notificationEmails || []), email])
            setEmail('')
        }
    }

    return (
        <Card className='bg-neutral-100'>
            <CardHeader>
                <h4 className='text-lg font-medium'>Notify about new participants</h4>
                <p className='text-muted-foreground text-sm'>Send an email to the following addresses when a new participant is included in the recruitment list.</p>
            </CardHeader>

            <CardContent className='space-y-4'>
                <ul className='space-y-1'>
                    {(!props.notificationEmails || props.notificationEmails.length === 0) && (
                        <li className='text-muted-foreground text-sm border border-dashed p-2 rounded-md border-border text-center'>No email addresses added</li>
                    )}
                    {props.notificationEmails?.map((email, index) => (
                        <li key={index}
                            className='flex bg-white items-center justify-between gap-2 text-sm ps-2 pe-0.5 py-0.5 border rounded-md border-border'
                        >
                            {email}
                            <Button variant='ghost' size='icon-sm'
                                className='h-fit w-fit p-1'
                                type='button'
                                onClick={async () => {
                                    const confirmed = await confirm({
                                        title: "Confirm Email Removal",
                                        description: `Are you sure you want to remove ${email} from the list?`,
                                    })
                                    if (!confirmed) {
                                        return;
                                    }
                                    const newNotificationEmails = props.notificationEmails?.filter(e => e !== email)
                                    props.onChange(newNotificationEmails || [])
                                }}

                            >
                                <XIcon className='h-4 w-4' />
                            </Button>
                        </li>
                    ))}
                </ul>


                <div className='flex flex-col gap-1.5'>
                    <Label htmlFor='email'>
                        Add a new email
                    </Label>
                    <div className='flex gap-2 items-center'>
                        <Input
                            id='email'
                            className='bg-white'
                            placeholder='Enter email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addEmail())}
                        />
                        <Button
                            variant='outline'
                            type='button'
                            size='sm'
                            disabled={!isValidEmail(email)}
                            onClick={addEmail}
                        >
                            Add
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>

    );
};

export default NotificationEmailsEditor;
