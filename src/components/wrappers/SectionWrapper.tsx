import React from 'react';

interface SectionWrapperProps {
    id: string;
    children: React.ReactNode;
    className?: string;
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({
    id,
    children,
    className = ''
}) => {
    return (
        <section id={id} className={`scroll-mt-24 ${className}`}>
            {children}
        </section>
    );
};
