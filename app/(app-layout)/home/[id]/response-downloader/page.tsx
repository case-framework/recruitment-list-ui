import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getAvailableResearchDataInfos, getDownloads } from "@/lib/backend/downloads";
import ResponseDownloader from "./_components/response-downloader";
import DownloadViewer from "./_components/download-viewer";
import { FolderOpenIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ParticipantInfoDownloader from "./_components/participant-info-downloader";

interface PageProps {
    params: {
        id: string;
    };
}

export default async function Page(props: PageProps) {

    const [
        responseInfosResp,
        downloadsResp
    ] = await Promise.all([
        getAvailableResearchDataInfos(props.params.id),
        getDownloads(props.params.id),
    ])

    const responseInfos = responseInfosResp?.infos || [];
    const downloads = downloadsResp?.downloads || [];

    return (
        <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <Card className="">
                        <CardHeader className="p-4">
                            <h3 className="font-bold">Data downloader</h3>
                            <p className="text-sm text-muted-foreground">
                                Prepare participant infos or research data for download.
                            </p>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">

                            <Tabs defaultValue="research-data">
                                <TabsList>
                                    <TabsTrigger value="research-data">Research data</TabsTrigger>
                                    <TabsTrigger value="participant-infos">Participant infos</TabsTrigger>
                                </TabsList>
                                <TabsContent value="participant-infos">
                                    <ParticipantInfoDownloader
                                        recruitmentListId={props.params.id}
                                    />
                                </TabsContent>
                                <TabsContent value="research-data">
                                    <ResponseDownloader
                                        recruitmentListId={props.params.id}
                                        responseInfos={responseInfos}
                                    />
                                </TabsContent>
                            </Tabs>

                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card className="bg-neutral-50">
                        <CardHeader className="p-4">
                            <h3
                                className="font-bold flex items-center gap-2"
                            >
                                <span>
                                    <FolderOpenIcon className="mr-2 h-4 w-4" />
                                </span>
                                Available downloads
                            </h3>
                        </CardHeader>
                        <CardContent className="p-4">
                            <DownloadViewer
                                recruitmentListId={props.params.id}
                                downloadInfos={downloads}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>

        </div>
    );
}
