import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface PconderzoekLogoCardProps {
    children?: React.ReactNode;
}

const PconderzoekLogoCard: React.FC<PconderzoekLogoCardProps> = (props) => {
    return (
        <Card className="w-full max-w-lg shadow-lg">
            <CardHeader className="">
                <div className="">

                    <Link href="/">
                        <h1 className="text-2xl font-semibold tracking-wider flex flex-col sm:flex-row gap-6 items-end">
                            <span className="text-primary grow">
                                Recruitment List App
                            </span>


                            <div className='min-w-[170px] w-[170px] py-4'>
                                <AspectRatio
                                    ratio={463 / 147}
                                >
                                    <Image
                                        src="/logo.svg"
                                        alt="Logo Recruitment List App"
                                        fill
                                        className='object-cover'
                                        priority
                                    />
                                </AspectRatio>
                            </div>
                        </h1>
                        <p className="text-muted-foreground mt-1">Study tools for data access and contact management. </p>
                    </Link>
                </div>

            </CardHeader>

            <CardContent className="text-center">
                {props.children}
            </CardContent>
        </Card>
    );
};

export default PconderzoekLogoCard;
