import { Card, CardContent } from '@/components/ui/card';
import { importParticipant } from '@/lib/backend/participants';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import React from 'react';

interface InviteCardProps {
    id: string;
    recruitmentListId: string;
}

const InviteCard: React.FC<InviteCardProps> = (props) => {
    const { id } = props;
    const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    React.useEffect(() => {
        const runImportParticipant = async () => {
            const resp = await importParticipant(props.recruitmentListId, id);
            if (resp.error !== undefined) {
                setStatus('error');
                setErrorMessage(resp.error);
                return;
            }
            setStatus('success');
        }

        runImportParticipant();
    }, [id, props.recruitmentListId]);

    return (
        <Card>
            <CardContent className="flex items-center justify-between p-2 flex-wrap text-xs">
                <span className="font-medium font-mono">{id}</span>
                <div className="flex items-center">
                    {status === 'loading' && (
                        <>
                            <Loader2 className="animate-spin text-blue-500 mr-2" />
                            <span className="text-blue-500">Importing...</span>
                        </>
                    )}
                    {status === 'success' && (
                        <>
                            <CheckCircle className="text-primary mr-2" />
                            <span className="text-primary">Imported</span>
                        </>
                    )}
                    {status === 'error' && (
                        <>
                            <span>  <XCircle className="text-destructive mr-2" /></span>
                            <span className="text-destructive text-sm">{errorMessage}</span>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default InviteCard;
