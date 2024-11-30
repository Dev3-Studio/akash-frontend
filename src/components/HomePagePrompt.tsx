'use client';
import { TypeAnimation } from 'react-type-animation';
import { atom } from 'jotai';
import PromptInput from '@/components/PromptInput';
import { useAtom } from 'jotai/index';
import { PromptCreate } from '@/lib/zodSchemas';
import { useRouter } from 'next/navigation';

interface TStatus {
    // idle: before user clicks generate
    // typing: type animation started
    // generating: type animation ended and image is being generated
    // done: image is done generating
    status: 'idle' | 'typing' | 'generating' | 'done';
    id: string | null;
    prompt: string;
}

export const statusAtom = atom<TStatus>({ status: 'idle', id: null, prompt: '' });
export default function HomePagePrompt() {
    const [status] = useAtom(statusAtom);
    const router = useRouter();
    
    // Go to /playground when button is clicked and all fields are populated
    function goToPlayground(params: PromptCreate) {
        router.push(`/playground?text=${params.text}&start=true`);
    }
    
    return (
        <div className={`flex flex-col items-center justify-center ${status.status === 'generating' ? '' : ''}`}>
            
            <div className={`${status.status !== 'idle' ? 'animate-fadeOut' : ''}`}>
                <TypeAnimation
                    className={`mb-2`}
                    sequence={[
                        'What are we creating today?',
                    ]}
                    wrapper="span"
                    speed={40}
                    style={{ fontSize: '1.75rem', fontWeight: 'bold', display: 'inline-block' }}
                    repeat={1}
                />
            </div>
            
            <PromptInput onSubmit={goToPlayground} suggestions={['A cat with wings', 'A robot in a forest', 'A city at night']}/>
        
        </div>
    );
}