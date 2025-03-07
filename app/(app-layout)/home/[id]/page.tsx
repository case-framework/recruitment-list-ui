import { redirect } from "next/navigation";

interface PageProps {
    params: {
        id: string;
    };
}

export default function Page(props: PageProps) {
    redirect(`/home/${props.params.id}/participants`);
}
