import React from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader } from '../ui/card';
import { XIcon } from 'lucide-react';

interface NotificationEmailsEditorProps {
    notificationEmails?: Array<string>
    onChange: (notificationEmails: Array<string>) => void
}

const NotificationEmailsEditor: React.FC<NotificationEmailsEditorProps> = (props) => {
    const [email, setEmail] = React.useState('');

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

    return (
        <Card>
            <CardHeader>
                <h4 className='text-lg font-medium'>Notify about new participants</h4>
                <p className='text-muted-foreground text-sm'>Send an email to the following addresses when a new participant is included in the recruitment list.</p>
            </CardHeader>

            <CardContent className='space-y-8'>
                <ul className='space-y-2'>
                    {(!props.notificationEmails || props.notificationEmails.length === 0) && (
                        <li className='text-muted-foreground text-sm'>No email addresses added</li>
                    )}
                    {props.notificationEmails?.map((email, index) => (
                        <li key={index}
                            className='flex bg-muted items-center justify-between gap-2 text-sm p-2 border rounded-md border-border'
                        >
                            {email}
                            <Button variant='ghost' size='icon'
                                className='h-fit w-fit p-1'
                                type='button'
                                onClick={() => {
                                    if (!confirm(`Are you sure you want to remove ${email} from the list?`)) {
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
                            placeholder='Enter email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Button variant='outline'
                            type='button'
                            disabled={!isValidEmail(email)}
                            onClick={() => {
                                if (isValidEmail(email)) {
                                    props.onChange([...(props.notificationEmails || []), email])
                                    setEmail('')
                                }
                            }}
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
