import { redirect } from 'next/navigation';

interface UserPageParams {
    params: Promise<{
        userId: string;
    }>;
}

export default async function Page(props: UserPageParams) {
    const { userId } = await props.params;
    redirect(`/home/user-management?userId=${encodeURIComponent(userId)}`);
}
