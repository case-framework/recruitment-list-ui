import ParticipantInviter from "./_components/participant-inviter";

interface PageParams {
    params: Promise<{
        id: string;
    }>
}


export default async function Page(props: PageParams) {
    const { id } = await props.params;

    return (
        <div>
            <ParticipantInviter
                recruitmentListId={id}
            />
        </div>
    );
}
