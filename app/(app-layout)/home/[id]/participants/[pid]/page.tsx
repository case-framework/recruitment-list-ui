import { Card } from "@/components/ui/card";
import { getParticipant, getParticipantNotes } from "@/lib/backend/participants";
import { getRecruitmentList } from "@/lib/backend/recruitmentLists";
import ParticipantInfos from "./_components/participant-infos";
import Notes from "./_components/notes";
import { ParticipantInfo, ParticipantNote, Permission } from "@/lib/backend/types";
import { auth } from "@/auth";
import { getCurrentUserPermissions } from "@/lib/backend/permissions";

interface PageProps {
    params: {
        id: string;
        pid: string;
    };
}

export default async function Page(props: PageProps) {
    const session = await auth();
    const [
        recruitmentList,
        participant,
        notesResp,
        permissionResp
    ] = await Promise.all([
        getRecruitmentList(props.params.id),
        getParticipant(props.params.id, props.params.pid),
        getParticipantNotes(props.params.id, props.params.pid),
        getCurrentUserPermissions(),
    ]);

    const notes = notesResp.notes || [];
    const noteInfos = notes.map((note: ParticipantNote) => ({
        item: note,
        allowedToDelete: session?.isAdmin || permissionResp?.permissions?.some((permission: Permission) => permission.resourceId === recruitmentList.id && permission.action === 'manage_recruitment_list')
    }));


    return (
        <div className="py-4 px-8 space-y-4">
            <h2 className="text-lg font-bold">
                Participant overview
            </h2>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Card className="overflow-hidden">
                        <ParticipantInfos
                            infoKeys={recruitmentList.participantData.participantInfos.map((info: ParticipantInfo) => info.label)}
                            participant={participant}
                            statusValues={recruitmentList.customization?.recruitmentStatusValues || []}
                            recruitmentListId={props.params.id}
                        />
                    </Card>
                </div>

                <div>
                    <Card>
                        <Notes
                            recruitmentListId={props.params.id}
                            pid={participant.id}
                            notes={noteInfos}
                        />
                    </Card>
                </div>

            </div>
        </div>
    );
}
