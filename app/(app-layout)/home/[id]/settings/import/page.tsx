import ParticipantInviter from "./_components/participant-inviter";

interface PageParams {
    params: {
        id: string;
    }
}


export default function Page(props: PageParams) {

    return (
        <div>
            <ParticipantInviter
                recruitmentListId={props.params.id}
            />
        </div>
    );
}
