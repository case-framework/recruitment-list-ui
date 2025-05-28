import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

export default function SortableItem(props: {
    id: string;
    children: React.ReactNode;
    className?: string;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: props.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <li ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                'cursor-pointer relative',
                { 'opacity-75': isDragging },
                props.className
            )}
        >
            {props.children}
        </li>
    );
}
