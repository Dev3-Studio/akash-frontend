'use client';
import { Clock } from 'lucide-react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import getAllPromptResults from '@/actions/getAllPromptResults';
import { useClientId } from '@/hooks/use-client-id';
import R2Image from "@/components/R2Image";
import useMasonry from "@/components/hooks/useMasonry";
import Loading from "@/app/loading";

export default function Explore() {
    const promptResults = useQuery({
        queryKey: ['getAllPromptResults'],
        queryFn: () => getAllPromptResults(),
        refetchInterval: 3000,
        enabled: true,
    });

    const masonryContainer = useMasonry();

    return (
        <div className="grid grid-rows-[minmax(0,max-content)_minmax(0,1fr)]">
            <div className="flex justify-between items-center w-full py-4 px-8">
                <div className="text-4xl">Explore</div>
                <Clock/>
            </div>
            <div className="fadedScrollTop"></div>
            <div className='w-full overflow-auto px-10 py-5 grid items-start gap-4 sm:grid-cols-3 md:gap-6' ref={masonryContainer}>
                {!promptResults.data && <Loading />}

                {promptResults.data && promptResults.data.map((result) => (
                    <R2Image key={result.promptId} file={result} />
                ))}
            </div>
            <div className="fadedScrollBottom"></div>
        </div>
    );
}