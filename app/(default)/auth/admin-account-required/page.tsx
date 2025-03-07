'use client';

import { logout } from "@/actions/auth/logout";
import LoadingButton from "@/components/loading-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import React from "react";


export default function Page() {
    const [isPending, startTransition] = React.useTransition();


    return (
        <div className="h-full  flex items-center justify-center">
            <Card>
                <CardHeader>
                    <CardTitle>
                        Admin Account Required
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p>
                        You tried to access a page that requires an admin account.
                        If you have an admin account, please log in and try again.
                    </p>
                    <div className="mt-6 flex gap-6">
                        <Button
                            variant={'outline'}
                            asChild
                        >
                            <Link
                                href={'/'}
                            >
                                Go back to home
                            </Link>
                        </Button>

                        <LoadingButton
                            isLoading={isPending}
                            variant={'default'}
                            onClick={() => {
                                startTransition(async () => {
                                    await logout('/auth/login?auto-login=false');
                                })
                            }}>
                            Logout
                        </LoadingButton>
                    </div>

                </CardContent>

            </Card>
        </div>
    );
}
