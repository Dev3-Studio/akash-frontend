'use client';
import { useSearchParams } from 'next/navigation';
import { Clock } from 'lucide-react';
import { PromptCreateCard } from '@/components/PromptCreateCard';
import { z } from 'zod';
import { Layout, PromptCreate, PromptStatus, Workflows } from '@/lib/zodSchemas';
import createPrompt from '@/actions/createPrompt';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useClientId } from '@/hooks/use-client-id';
import { toast } from '@/components/ui/use-toast';
import { useEffect, useState } from 'react';
import getAllPromptResults from '@/actions/getAllPromptResults';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function Playground() {
    const params = useSearchParams();
    const clientId = useClientId();
    const [isCreatingPrompt, setIsCreatingPrompt] = useState(false);
    
    const pendingPrompts = useQuery({
        queryKey: ['getAllPromptResults', { clientId }],
        queryFn: async () => {
            return await getAllPromptResults({
                clientId: clientId!,
                status: PromptStatus.Pending
            });
        },
        staleTime: 1000,
        refetchInterval: 3000,
        enabled: clientId !== null,
    });
    
    const defaultPromptTextParse = z.string().optional().safeParse(params.get('prompt') ?? undefined);
    const defaultLayoutOverrideParse = z.nativeEnum(Layout).optional().safeParse(params.get('layout') ?? undefined);
    const defaultWorkflowOverrideParse = z.nativeEnum(Workflows).optional().safeParse(params.get('workflow') ?? undefined);
    const defaultSeedOverrideParse = z.coerce.number().int().optional().safeParse(params.get('seed') ?? undefined);
    
    const defaultPromptText = defaultPromptTextParse.success ? defaultPromptTextParse.data : undefined;
    const defaultLayoutOverride = defaultLayoutOverrideParse.success ? defaultLayoutOverrideParse.data : undefined;
    const defaultWorkflowOverride = defaultWorkflowOverrideParse.success ? defaultWorkflowOverrideParse.data : undefined;
    const defaultSeedOverride = defaultSeedOverrideParse.success ? defaultSeedOverrideParse.data : undefined;
    
    const start = params.get('start') === 'true';
    
    const createPromptMutation = useMutation({
        mutationFn: (prompt: PromptCreate) => {
            return createPrompt(prompt);
        },
        onSuccess: (data) => {
            toast({
                title: 'Prompt created',
                description: (
                    <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                        <code lang={'json'} className="text-white">{JSON.stringify(data, null, 2)}</code>
                    </pre>
                ),
            });
            setIsCreatingPrompt(false);
        },
        onError: (error) => {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message,
            });
            setIsCreatingPrompt(false);
        },
    });
    
    const handleCreatePrompt = async (prompt: PromptCreate) => {
        setIsCreatingPrompt(true);
        await createPromptMutation.mutateAsync(prompt);
    };
    
    useEffect(() => {
        if (start && clientId) {
            void handleCreatePrompt({
                clientId: clientId,
                text: defaultPromptText ?? 'Generate an image',
                layoutOverride: defaultLayoutOverride,
                workflowOverride: defaultWorkflowOverride,
                seedOverride: defaultSeedOverride,
            });
        }
    }, []);
    
    return (
        <div className="grid grid-rows-[minmax(0,max-content)_minmax(0,1fr)]">
            <div className="flex justify-between items-center w-full py-4 px-8">
                <div className="text-4xl">Playground</div>
                <Clock/>
            </div>
            <div className="flex px-8 pt-4 pb-2">
                <div className="flex flex-col h-full gap-8 w-80 min-h-full">
                    <div className="flex flex-shrink">
                        <PromptCreateCard
                            defaultPromptText={defaultPromptText}
                            defaultLayoutOverride={defaultLayoutOverride}
                            defaultWorkflowOverride={defaultWorkflowOverride}
                            defaultSeedOverride={defaultSeedOverride}
                            disableSubmit={isCreatingPrompt}
                            onSubmit={handleCreatePrompt}
                        />
                    </div>
                    <div className="flex flex-grow">
                        <Card className="h-fit w-full">
                            <CardHeader>
                                <CardTitle>Queue</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px] overflow-y-auto space-y-4 px-3">
                                {pendingPrompts.isLoading && <div>Loading...</div>}
                                {pendingPrompts.data?.map((result) => (
                                    <div key={result.promptId}
                                         className="flex flex-col gap-1 border rounded-md py-2 px-4">
                                        <div className="mb-2">{result.text}</div>
                                        <Progress value={(result.progress ?? 0) * 100}/>
                                        <div
                                            className="text-sm">{result.statusMessage} ({Math.floor((result.progress ?? 0) * 100)}%)
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <div className='flex w-full'>
                    <div className='m-auto'>
                        Placeholder for results
                    </div>
                </div>
            </div>
        </div>
    );
}
